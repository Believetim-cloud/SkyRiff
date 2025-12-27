"""
资产服务层
"""
from sqlalchemy.orm import Session
from typing import Optional
from app.db.models import VideoAsset, Project, MediaAsset
from app.vendors.dyuapi_sora2 import DyuSora2Adapter
from app.services.wallet_service import WalletService
from app.core.constants import DOWNLOAD_NO_WATERMARK_COST


class AssetService:
    def __init__(self, db: Session):
        self.db = db
        self.adapter = DyuSora2Adapter()
        self.wallet_service = WalletService(db)
    
    def list_videos(
        self,
        user_id: int,
        project_id: Optional[int] = None,
        limit: int = 20,
        cursor: Optional[int] = None
    ) -> list:
        """
        获取视频资产列表
        
        Args:
            user_id: 用户ID
            project_id: 项目ID过滤
            limit: 每页数量
            cursor: 游标
        
        Returns:
            视频列表
        """
        query = self.db.query(VideoAsset).filter(
            VideoAsset.user_id == user_id
        )
        
        if project_id:
            query = query.filter(VideoAsset.project_id == project_id)
        
        if cursor:
            query = query.filter(VideoAsset.video_id < cursor)
        
        videos = query.order_by(VideoAsset.video_id.desc()).limit(limit).all()
        return videos
    
    def get_video(self, video_id: int, user_id: int) -> VideoAsset:
        """
        获取单个视频
        
        Args:
            video_id: 视频ID
            user_id: 用户ID
        
        Returns:
            VideoAsset对象
        """
        video = self.db.query(VideoAsset).filter(
            VideoAsset.video_id == video_id,
            VideoAsset.user_id == user_id
        ).first()
        
        if not video:
            raise ValueError("视频不存在或无权访问")
        
        return video
    
    async def download_no_watermark(
        self,
        video_id: int,
        user_id: int
    ) -> str:
        """
        下载无水印视频
        
        业务流程：
        1. 校验权限（只能下载自己的）
        2. 扣除6积分
        3. 获取临时下载链接
        4. 更新下载次数
        
        Args:
            video_id: 视频ID
            user_id: 用户ID
        
        Returns:
            下载URL（临时签名链接）
        """
        # 1. 校验权限
        video = self.get_video(video_id, user_id)
        
        # 2. 扣除6积分
        try:
            self.wallet_service.deduct_credits(
                user_id=user_id,
                amount=DOWNLOAD_NO_WATERMARK_COST,
                type="download_spend",
                ref_type="video",
                ref_id=video_id,
                description=f"下载无水印视频 #{video_id}"
            )
        except ValueError as e:
            raise ValueError(f"积分不足：{e}")
        
        # 3. 获取下载链接
        try:
            download_url = await self.adapter.get_download_url(
                video_id=video.vendor_video_id,
                watermark=False
            )
        except Exception as e:
            # 获取失败，退回积分
            self.wallet_service.add_credits(
                user_id=user_id,
                amount=DOWNLOAD_NO_WATERMARK_COST,
                type="gen_refund",
                description=f"下载失败退款：{str(e)}"
            )
            raise ValueError(f"获取下载链接失败：{e}")
        
        # 4. 更新下载次数
        video.download_count += 1
        self.db.commit()
        
        return download_url
    
    # ==================== 项目管理 ====================
    
    def create_project(
        self,
        user_id: int,
        name: str,
        description: Optional[str] = None
    ) -> Project:
        """
        创建项目
        
        Args:
            user_id: 用户ID
            name: 项目名称
            description: 项目描述
        
        Returns:
            Project对象
        """
        project = Project(
            user_id=user_id,
            name=name,
            description=description,
            video_count=0
        )
        
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        
        return project
    
    def list_projects(self, user_id: int) -> list:
        """
        获取项目列表
        
        Args:
            user_id: 用户ID
        
        Returns:
            项目列表
        """
        projects = self.db.query(Project).filter(
            Project.user_id == user_id
        ).order_by(Project.created_at.desc()).all()
        
        return projects
    
    def update_project(
        self,
        project_id: int,
        user_id: int,
        name: Optional[str] = None,
        description: Optional[str] = None
    ) -> Project:
        """
        更新项目
        
        Args:
            project_id: 项目ID
            user_id: 用户ID
            name: 新名称
            description: 新描述
        
        Returns:
            Project对象
        """
        project = self.db.query(Project).filter(
            Project.project_id == project_id,
            Project.user_id == user_id
        ).first()
        
        if not project:
            raise ValueError("项目不存在")
        
        if name:
            project.name = name
        if description is not None:
            project.description = description
        
        self.db.commit()
        self.db.refresh(project)
        
        return project
    
    def delete_project(self, project_id: int, user_id: int):
        """
        删除项目
        
        Args:
            project_id: 项目ID
            user_id: 用户ID
        """
        project = self.db.query(Project).filter(
            Project.project_id == project_id,
            Project.user_id == user_id
        ).first()
        
        if not project:
            raise ValueError("项目不存在")
        
        # 解除关联的视频（不删除视频）
        self.db.query(VideoAsset).filter(
            VideoAsset.project_id == project_id
        ).update({"project_id": None})
        
        # 删除项目
        self.db.delete(project)
        self.db.commit()
    
    # ==================== 媒体上传 ====================
    
    def create_media_asset(
        self,
        user_id: int,
        asset_type: str,
        file_url: str,
        file_size_bytes: Optional[int] = None,
        mime_type: Optional[str] = None,
        width: Optional[int] = None,
        height: Optional[int] = None
    ) -> MediaAsset:
        """
        创建媒体资产（上传后调用）
        
        Args:
            user_id: 用户ID
            asset_type: 资产类型
            file_url: 文件URL
            file_size_bytes: 文件大小
            mime_type: MIME类型
            width: 宽度（图片）
            height: 高度（图片）
        
        Returns:
            MediaAsset对象
        """
        media = MediaAsset(
            user_id=user_id,
            asset_type=asset_type,
            file_url=file_url,
            file_size_bytes=file_size_bytes,
            mime_type=mime_type,
            width=width,
            height=height
        )
        
        self.db.add(media)
        self.db.commit()
        self.db.refresh(media)
        
        return media
