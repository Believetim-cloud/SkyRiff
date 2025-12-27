"""
DyuAPI Sora2 供应商适配器
完全按照供应商API对接文档实现
"""
import httpx
from typing import Optional, Dict, Any
from app.core.config import settings


class DyuSora2Adapter:
    """DyuAPI Sora2 适配器"""
    
    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        self.api_key = api_key or settings.DYUAPI_API_KEY
        self.base_url = base_url or settings.DYUAPI_BASE_URL
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    # ==================== 模型名称映射 ====================
    
    MODEL_MAPPING = {
        # 10s
        "landscape_10s": "sora2-landscape",
        "portrait_10s": "sora2-portrait",
        "sora2_10s": "sora2", # 兼容旧逻辑
        
        # 15s
        "landscape_15s": "sora2-landscape-15s",
        "portrait_15s": "sora2-portrait-15s",
        
        # 25s Pro
        "landscape_25s": "sora2-pro-landscape-25s",
        "portrait_25s": "sora2-pro-portrait-25s",
        
        # 15s HD (Pro)
        "landscape_hd_15s": "sora2-pro-landscape-hd-15s",
        "portrait_hd_15s": "sora2-pro-portrait-hd-15s",
    }
    
    @classmethod
    def get_model_name(cls, duration_sec: int, ratio: str = "16:9") -> str:
        """根据时长和比例获取模型名称"""
        is_portrait = ratio == "9:16" or ratio == "3:4" or ratio == "1:1" # 暂时将1:1也归类为竖屏或默认
        orientation = "portrait" if is_portrait else "landscape"
        
        # 简单的时长映射逻辑
        if duration_sec <= 10:
            return cls.MODEL_MAPPING.get(f"{orientation}_10s", "sora2")
        elif duration_sec <= 15:
            return cls.MODEL_MAPPING.get(f"{orientation}_15s", "sora2-landscape-15s")
        else:
            return cls.MODEL_MAPPING.get(f"{orientation}_25s", "sora2-pro-landscape-25s")
    
    # ==================== 状态映射 ====================
    
    STATUS_MAPPING = {
        "pending": "QUEUED",
        "processing": "IN_PROGRESS",
        "in_progress": "IN_PROGRESS",
        "completed": "SUCCESS",
        "succeeded": "SUCCESS", # 兼容
        "finished": "SUCCESS", # 兼容
        "success": "SUCCESS",
        "failed": "FAILURE",
        "fail": "FAILURE",
        "failure": "FAILURE",
        "cancelled": "FAILURE",
    }
    
    @classmethod
    def map_status(cls, vendor_status: str) -> str:
        """映射供应商状态到我们的状态"""
        if not vendor_status:
            return "QUEUED"
            
        status_key = str(vendor_status).lower()
        
        if status_key in cls.STATUS_MAPPING:
            return cls.STATUS_MAPPING[status_key]
                
        # 默认返回QUEUED，但打印日志
        print(f"⚠️ Unknown vendor status: {vendor_status}")
        return "QUEUED"
    
    # ==================== API 1: 文生视频 ====================
    
    async def create_text2video(
        self,
        prompt: str,
        duration_sec: int = 10,
        ratio: str = "9:16",
        model: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        创建文生视频任务
        
        Args:
            prompt: 提示词
            duration_sec: 视频时长（秒）
            ratio: 视频比例（9:16/16:9/1:1）
            model: 指定模型名称（可选）
        
        Returns:
            包含task_id的响应
        """
        if not model:
            model = self.get_model_name(duration_sec, ratio)
        
        payload = {
            "model": model,
            "prompt": prompt,
            "duration": duration_sec,
            "aspect_ratio": ratio
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/v1/video/generations",
                headers=self.headers,
                json=payload,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    
    # ==================== API 2: 图生视频 ====================
    
    async def create_image2video(
        self,
        image_url: str,
        prompt: str,
        duration_sec: int = 10,
        ratio: str = "9:16",
        model: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        创建图生视频任务
        
        Args:
            image_url: 参考图片URL
            prompt: 提示词
            duration_sec: 视频时长（秒）
            ratio: 视频比例
            model: 指定模型名称（可选）
        
        Returns:
            包含task_id的响应
        """
        if not model:
            model = self.get_model_name(duration_sec, ratio)
        
        payload = {
            "model": model,
            "prompt": prompt,
            "image_url": image_url,
            "duration": duration_sec,
            "aspect_ratio": ratio
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/v1/video/generations",
                headers=self.headers,
                json=payload,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    
    # ==================== API 3: 查询任务状态 ====================
    
    async def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """
        查询任务状态
        
        Args:
            task_id: 供应商任务ID
        
        Returns:
            任务详情
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/v1/video/generations/{task_id}",
                headers=self.headers,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    
    # ==================== API 4: 获取视频详情 ====================
    
    async def get_video_detail(self, video_id: str) -> Dict[str, Any]:
        """
        获取视频详情
        
        Args:
            video_id: 供应商视频ID
        
        Returns:
            视频详情（包含播放/下载链接）
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/v1/videos/{video_id}",
                headers=self.headers,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    
    # ==================== API 5: 获取下载链接 ====================
    
    async def get_download_url(
        self,
        video_id: str,
        watermark: bool = True
    ) -> str:
        """
        获取视频下载链接
        
        Args:
            video_id: 供应商视频ID
            watermark: 是否带水印
        
        Returns:
            下载URL（临时签名链接）
        """
        params = {"watermark": str(watermark).lower()}
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/v1/videos/{video_id}/download",
                headers=self.headers,
                params=params,
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            return data.get("download_url")
    
    # ==================== API 6: 列出任务 ====================
    
    async def list_tasks(
        self,
        status: Optional[str] = None,
        limit: int = 20,
        after: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        列出任务列表
        
        Args:
            status: 过滤状态
            limit: 每页数量
            after: 游标
        
        Returns:
            任务列表
        """
        params = {"limit": limit}
        if status:
            params["status"] = status
        if after:
            params["after"] = after
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/v1/video/generations",
                headers=self.headers,
                params=params,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    
    # ==================== API 7: 列出视频 ====================
    
    async def list_videos(
        self,
        limit: int = 20,
        after: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        列出视频列表
        
        Args:
            limit: 每页数量
            after: 游标
        
        Returns:
            视频列表
        """
        params = {"limit": limit}
        if after:
            params["after"] = after
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/v1/videos",
                headers=self.headers,
                params=params,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    
    # ==================== API 8: 取消任务 ====================
    
    async def cancel_task(self, task_id: str) -> Dict[str, Any]:
        """
        取消任务
        
        Args:
            task_id: 供应商任务ID
        
        Returns:
            取消结果
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/v1/video/generations/{task_id}/cancel",
                headers=self.headers,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    
    # ==================== 辅助方法 ====================
    
    def parse_task_response(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """
        解析任务响应
        """
        # 打印原始响应以便调试
        import json
        try:
            print(f"📦 Vendor Response: {json.dumps(response, ensure_ascii=False)}")
        except:
            print(f"📦 Vendor Response: {response}")

        # 兼容两种返回结构：直接返回或包裹在 data 中
        data = response.get("data", response)
        
        # 获取状态
        status_raw = data.get("status")
        status = self.map_status(status_raw)
        
        # 获取进度（部分接口可能返回 progress 字段）
        progress = data.get("progress", 0)
        
        # 尝试将进度转换为整数（处理 "10%" 这种字符串）
        if isinstance(progress, str):
            try:
                progress = int(progress.replace("%", "").strip())
            except (ValueError, TypeError):
                progress = 0
                
        if status == "SUCCESS":
            progress = 100
        elif status == "IN_PROGRESS" and progress == 0:
            progress = 30  # 给个假进度，避免一直0%
            
        # 获取视频ID
        # 优先从 output.video_id 取
        # 其次从 data.id 取 (嵌套结构)
        # 最后从 task_id 取
        video_id = data.get("output", {}).get("video_id")
        if not video_id:
            nested_data = data.get("data", {})
            if isinstance(nested_data, dict):
                video_id = nested_data.get("id")
        if not video_id:
            video_id = data.get("task_id") or data.get("id")

        return {
            "vendor_task_id": data.get("task_id") or data.get("id"),
            "status": status,
            "progress": progress,
            "video_id": video_id,
            "error_message": data.get("fail_reason") if status == "FAILURE" else None # 只有失败时才取fail_reason
        }
    
    def parse_video_response(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """
        解析视频响应
        
        Args:
            response: API响应
        
        Returns:
            标准化的视频信息
        """
        # 兼容 output 结构（如果有）
        output = response.get("output", {})
        
        # 获取基础信息
        video_url = response.get("video_url") or output.get("preview_url") or output.get("url")
        duration = response.get("duration") or output.get("duration")
        
        # 解析尺寸 "720x720"
        width = output.get("width")
        height = output.get("height")
        size_str = response.get("size")
        if not width and size_str and "x" in str(size_str):
            try:
                parts = size_str.split("x")
                width = int(parts[0])
                height = int(parts[1])
            except:
                pass

        return {
            "vendor_video_id": response.get("id"),
            "duration_sec": duration,
            "ratio": response.get("aspect_ratio") or output.get("aspect_ratio"),
            "width": width,
            "height": height,
            "file_size_bytes": response.get("file_size") or output.get("file_size"),
            "watermarked_play_url": video_url,
            "no_watermark_download_url": None,  # 需要单独调用download接口
        }
