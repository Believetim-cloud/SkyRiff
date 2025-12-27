"""
任务相关Schema
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CreateTaskRequest(BaseModel):
    """创建任务请求"""
    prompt: str = Field(..., description="提示词", min_length=1, max_length=5000)
    duration_sec: int = Field(..., description="视频时长（秒）", ge=10, le=25)
    ratio: str = Field(default="9:16", description="视频比例")
    reference_image_asset_id: Optional[int] = Field(None, description="参考图ID（图生视频）")
    project_id: Optional[int] = Field(None, description="项目ID")
    model: Optional[str] = Field(None, description="模型名称")


class TaskResponse(BaseModel):
    """任务响应"""
    task_id: int
    user_id: int
    prompt: str
    duration_sec: int
    ratio: str
    status: str
    progress: int
    cost_credits: int
    video_id: Optional[int] = None
    video_url: Optional[str] = None  # 新增
    reference_image_asset_id: Optional[int] = None
    project_id: Optional[int] = None
    error_message: Optional[str] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class TaskStatusResponse(BaseModel):
    """任务状态响应（简化版）"""
    task_id: int
    status: str
    progress: int
    video_id: Optional[int] = None
    video_url: Optional[str] = None  # 新增
    error_message: Optional[str] = None
