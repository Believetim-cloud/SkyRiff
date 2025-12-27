"""
资产相关Schema
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class VideoAssetResponse(BaseModel):
    """视频资产响应"""
    video_id: int
    user_id: int
    task_id: Optional[int] = None
    duration_sec: int
    ratio: str
    width: Optional[int] = None
    height: Optional[int] = None
    file_size_bytes: Optional[int] = None
    watermarked_play_url: Optional[str] = None
    project_id: Optional[int] = None
    download_count: int = 0
    created_at: datetime
    
    class Config:
        from_attributes = True


class MediaUploadResponse(BaseModel):
    """媒体上传响应"""
    asset_id: int
    asset_type: str
    file_url: str
    file_size_bytes: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None
    created_at: datetime


class DownloadUrlResponse(BaseModel):
    """下载链接响应"""
    download_url: str
    expires_in: int = Field(default=3600, description="过期时间（秒）")


class ProjectResponse(BaseModel):
    """项目响应"""
    project_id: int
    user_id: int
    name: str
    description: Optional[str] = None
    video_count: int = 0
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CreateProjectRequest(BaseModel):
    """创建项目请求"""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)


class UpdateProjectRequest(BaseModel):
    """更新项目请求"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
