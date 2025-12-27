"""
任务服务层
"""
from sqlalchemy.orm import Session
from datetime import datetime
from app.db.models import Task, VideoAsset, UserStats, MediaAsset
from app.vendors.dyuapi_sora2 import DyuSora2Adapter
from app.services.wallet_service import WalletService
from app.core.constants import VIDEO_GENERATION_COSTS
from typing import Optional
import httpx
import random
import os
import base64
from app.core.config import settings


from app.db.database import SessionLocal

class TaskService:
    def __init__(self, db: Session):
        self.db = db
        self.adapter = DyuSora2Adapter()
        self.wallet_service = WalletService(db)
    
    async def create_task(
        self,
        user_id: int,
        prompt: str,
        duration_sec: int,
        ratio: str = "9:16",
        reference_image_asset_id: Optional[int] = None,
        project_id: Optional[int] = None,
        model: Optional[str] = None
    ) -> Task:
        """
        创建视频生成任务
        
        业务流程：
        1. 计算费用
        2. 预扣积分
        3. 调用供应商API
        4. 创建任务记录
        5. 更新用户统计
        
        Args:
            user_id: 用户ID
            prompt: 提示词
            duration_sec: 时长
            ratio: 比例
            reference_image_asset_id: 参考图ID（可选）
            project_id: 项目ID（可选）
            model: 模型名称（可选）
        
        Returns:
            Task对象
        """
        # 1. 计算费用（按时长）
        cost = VIDEO_GENERATION_COSTS.get(duration_sec, 10)
        
        # 2. 预扣积分
        try:
            self.wallet_service.deduct_credits(
                user_id=user_id,
                amount=cost,
                type="gen_hold",
                description=f"生成{duration_sec}秒视频（预扣）"
            )
        except ValueError as e:
            raise ValueError(f"积分不足：{e}")
        
        # 3. 调用供应商API
        try:
            if reference_image_asset_id:
                media = self.db.query(MediaAsset).filter(
                    MediaAsset.asset_id == reference_image_asset_id,
                    MediaAsset.user_id == user_id
                ).first()
                if not media:
                    raise ValueError("参考图不存在或无权访问")
                
                image_input = media.file_url
                # 如果是本地上传的图片（相对路径），转换为Base64
                if image_input.startswith("/uploads/"):
                    try:
                        filename = os.path.basename(image_input)
                        local_path = os.path.join(settings.UPLOAD_DIR, filename)
                        if os.path.exists(local_path):
                            with open(local_path, "rb") as img_f:
                                b64_data = base64.b64encode(img_f.read()).decode("utf-8")
                                # 根据后缀推断MIME类型
                                ext = os.path.splitext(filename)[1].lower().replace(".", "")
                                if ext == "jpg": ext = "jpeg"
                                image_input = f"data:image/{ext};base64,{b64_data}"
                    except Exception as e:
                        print(f"图片转Base64失败: {e}")
                        # 失败降级，继续使用原始URL尝试
                
                response = await self.adapter.create_image2video(
                    image_url=image_input,
                    prompt=prompt,
                    duration_sec=duration_sec,
                    ratio=ratio,
                    model=model
                )
            else:
                response = await self.adapter.create_text2video(
                    prompt=prompt,
                    duration_sec=duration_sec,
                    ratio=ratio,
                    model=model
                )
            vendor_task_id = response.get("id")
        except httpx.HTTPStatusError as e:
            # 尝试解析供应商返回的错误信息
            error_msg = str(e)
            try:
                error_body = e.response.json()
                if "error" in error_body:
                    if isinstance(error_body["error"], dict):
                        error_msg = error_body["error"].get("message", str(e))
                    else:
                        error_msg = str(error_body["error"])
            except Exception:
                pass

            # 无论什么错误，只要是真实模式，直接报错退款
            self.wallet_service.add_credits(
                user_id=user_id,
                amount=cost,
                type="gen_refund",
                description=f"生成失败退款：{error_msg}"
            )
            # 在这里打印完整的错误信息，方便调试
            print(f"Vendor API Error: {error_msg}")
            raise ValueError(f"供应商API调用失败：{error_msg}")
        except Exception as e:
            self.wallet_service.add_credits(
                user_id=user_id,
                amount=cost,
                type="gen_refund",
                description=f"生成失败退款：{str(e)}"
            )
            # 在这里打印完整的错误信息，方便调试
            import traceback
            traceback.print_exc()
            raise ValueError(f"供应商API调用失败：{e}")
        
        # 4. 创建任务记录
        task = Task(
            user_id=user_id,
            source_type="direct",
            prompt=prompt,
            prompt_final=prompt,
            duration_sec=duration_sec,
            ratio=ratio,
            model=model or self.adapter.get_model_name(duration_sec),
            reference_image_asset_id=reference_image_asset_id,
            vendor="dyuapi_sora2",
            vendor_task_id=vendor_task_id,
            status="QUEUED",
            progress=0,
            cost_credits=cost,
            project_id=project_id,
            started_at=datetime.utcnow()
        )
        
        self.db.add(task)
        self.db.flush()  # 获取task_id
        
        # 5. 更新用户统计（生成中的视频也算）
        stats = self.db.query(UserStats).filter(
            UserStats.user_id == user_id
        ).first()
        if stats:
            stats.total_videos_generated += 1
        
        self.db.commit()
        self.db.refresh(task)
        
        return task

    async def get_task_status(self, task_id: int, user_id: int, background_tasks = None) -> Task:
        """
        查询任务状态（并同步供应商状态）
        
        Args:
            task_id: 任务ID
            user_id: 用户ID
            background_tasks: FastAPI后台任务对象
        
        Returns:
            Task对象
        """
        # 查询任务
        task = self.db.query(Task).filter(
            Task.task_id == task_id,
            Task.user_id == user_id
        ).first()
        
        if not task:
            raise ValueError("任务不存在")
        
        # 如果任务已完成，直接返回
        if task.status in ["SUCCESS", "FAILURE"]:
            if task.status == "SUCCESS" and task.video_id:
                video = self.db.query(VideoAsset).filter(VideoAsset.video_id == task.video_id).first()
                if video:
                    setattr(task, "video_url", video.watermarked_play_url)
            return task
        
        # 同步供应商状态
        try:
            # 检查超时（10分钟）
            if task.status == "IN_PROGRESS" and (datetime.utcnow() - task.started_at).total_seconds() > 600:
                task.status = "FAILURE"
                task.error_message = "生成超时（超过10分钟）"
                task.completed_at = datetime.utcnow()
                
                # 退回积分
                self.wallet_service.add_credits(
                    user_id=task.user_id,
                    amount=task.cost_credits,
                    type="gen_refund",
                    ref_type="task",
                    ref_id=task.task_id,
                    description="任务超时退款"
                )
                self.db.commit()
                return task

            response = await self.adapter.get_task_status(task.vendor_task_id)
            parsed = self.adapter.parse_task_response(response)
            
            # 打印解析后的状态以便调试
            print(f"🔄 Task {task_id} Sync: Status={parsed['status']}, Progress={parsed['progress']}")
            
            # 更新状态
            task.status = parsed["status"]
            task.progress = parsed["progress"]
            task.error_message = parsed["error_message"]
            
            # 如果成功，创建视频资产
            if task.status == "SUCCESS" and parsed["video_id"]:
                # 1. 创建视频资产记录
                video = await self._create_video_asset(
                    task=task,
                    vendor_video_id=parsed["video_id"]
                )
                task.video_id = video.video_id
                task.completed_at = datetime.utcnow()
                setattr(task, "video_url", video.watermarked_play_url)
                
                # 2. 立即提交事务以释放锁
                self.db.commit()
                self.db.refresh(task)
                
                # 3. 在事务提交后进行下载 (使用后台任务避免阻塞)
                if video.watermarked_play_url:
                    if background_tasks:
                        print(f"🚀 添加后台下载任务: {video.video_id}")
                        background_tasks.add_task(
                            self._download_and_cache_video_static, 
                            video.video_id, 
                            video.watermarked_play_url
                        )
                    else:
                        print("⚠️ 未提供background_tasks，跳过自动缓存")
            
            # 如果失败，退回积分
            elif task.status == "FAILURE":
                self.wallet_service.add_credits(
                    user_id=task.user_id,
                    amount=task.cost_credits,
                    type="gen_refund",
                    ref_type="task",
                    ref_id=task.task_id,
                    description=f"任务失败退款：{task.error_message}"
                )
                task.completed_at = datetime.utcnow()
                self.db.commit()
            else:
                self.db.commit()
            
        except Exception as e:
            print(f"同步任务状态失败: {e}")
            # 尝试回滚以释放锁
            self.db.rollback()
        
        return task
    
    @staticmethod
    async def _download_and_cache_video_static(video_id: int, url: str) -> None:
        """
        后台异步下载视频并缓存到本地 (静态方法，独立管理DB Session)
        """
        try:
            if not url:
                return

            # 构建本地保存路径
            filename = f"video_{video_id}.mp4"
            # 假设 backend 目录结构固定
            static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "static", "videos")
            if not os.path.exists(static_dir):
                os.makedirs(static_dir)
            
            local_path = os.path.join(static_dir, filename)
            
            # 下载文件 (耗时操作)
            print(f"📥 [后台] 开始缓存视频到本地: {url}")
            async with httpx.AsyncClient(timeout=300.0, verify=False) as client:
                async with client.stream("GET", url) as response:
                    if response.status_code != 200:
                        print(f"❌ [后台] 下载失败: Status {response.status_code}")
                        return
                        
                    with open(local_path, "wb") as f:
                        async for chunk in response.aiter_bytes():
                            f.write(chunk)
            
            print(f"✅ [后台] 视频缓存完成: {local_path}")
            
            # 更新数据库 (使用新的 Session)
            db = SessionLocal()
            try:
                local_url = f"/static/videos/{filename}"
                video_asset = db.query(VideoAsset).filter(VideoAsset.video_id == video_id).first()
                if video_asset:
                    video_asset.watermarked_play_url = local_url
                    db.commit()
                    print(f"💾 [后台] 数据库已更新: {local_url}")
            finally:
                db.close()
            
        except Exception as e:
            print(f"⚠️ [后台] 视频缓存异常: {e}")


    async def _create_video_asset(self, task: Task, vendor_video_id: str) -> VideoAsset:
        """
        创建视频资产
        
        Args:
            task: 任务对象
            vendor_video_id: 供应商视频ID
        
        Returns:
            VideoAsset对象
        """
        # 获取视频详情
        try:
            response = await self.adapter.get_video_detail(vendor_video_id)
            parsed = self.adapter.parse_video_response(response)
            
            # 创建视频资产
            video = VideoAsset(
                user_id=task.user_id,
                task_id=task.task_id,
                duration_sec=task.duration_sec,
                ratio=task.ratio,
                width=parsed.get("width"),
                height=parsed.get("height"),
                file_size_bytes=parsed.get("file_size_bytes"),
                watermarked_play_url=parsed.get("watermarked_play_url"),
                vendor="dyuapi_sora2",
                vendor_video_id=vendor_video_id,
                project_id=task.project_id
            )
            
            self.db.add(video)
            self.db.flush()
            
            # 注意：不再这里调用 _download_and_cache_video
            # 改为由调用者在提交事务后调用
            
            return video
            
        except Exception as e:
            raise ValueError(f"创建视频资产失败：{e}")
    
    
    # 彻底删除 _create_mock_video_asset 方法，防止任何意外调用
    # def _create_mock_video_asset(self, task: Task) -> VideoAsset:
    #     ...
    
    def list_tasks(
        self,
        user_id: int,
        status: Optional[str] = None,
        limit: int = 20,
        cursor: Optional[int] = None
    ) -> list:
        """
        获取任务列表
        
        Args:
            user_id: 用户ID
            status: 过滤状态
            limit: 每页数量
            cursor: 游标
        
        Returns:
            任务列表
        """
        query = self.db.query(Task).filter(Task.user_id == user_id)
        
        if status:
            query = query.filter(Task.status == status)
        
        if cursor:
            query = query.filter(Task.task_id < cursor)
        
        tasks = query.order_by(Task.task_id.desc()).limit(limit).all()
        return tasks
