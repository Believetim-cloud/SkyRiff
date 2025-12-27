"""
故事版相关Schema
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ShotRequest(BaseModel):
    """镜头创建/编辑请求"""
    prompt: str = Field(..., description="镜头描述提示词", min_length=1, max_length=5000)
    duration_sec: int = Field(..., description="视频时长（秒）", ge=10, le=25)
    shot_size: Optional[str] = Field(None, description="景别：远景/全景/中景/近景/特写")
    camera_move: Optional[str] = Field(None, description="运镜：静止/跟拍/推近/拉远/环绕")
    role_id: Optional[int] = Field(None, description="镜头专属角色ID")
    has_role_override: bool = Field(default=False, description="是否覆盖全局角色")
    reference_image_asset_id: Optional[int] = Field(None, description="参考图资产ID")


class ShotResponse(BaseModel):
    """镜头响应"""
    shot_id: int
    storyboard_id: int
    prompt: str
    duration_sec: int
    shot_size: Optional[str] = None
    camera_move: Optional[str] = None
    role_id: Optional[int] = None
    has_role_override: bool = False
    reference_image_asset_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CreateStoryboardRequest(BaseModel):
    """创建故事版请求"""
    topic_prompt: Optional[str] = Field(None, description="主题提示词", max_length=2000)
    project_id: Optional[int] = Field(None, description="归属项目ID")
    global_role_id: Optional[int] = Field(None, description="全局角色ID")
    shots: List[ShotRequest] = Field(..., description="镜头列表", min_length=1, max_length=20)


class UpdateStoryboardRequest(BaseModel):
    """更新故事版请求"""
    topic_prompt: Optional[str] = Field(None, description="主题提示词")
    global_role_id: Optional[int] = Field(None, description="全局角色ID")


class UpdateShotOrderRequest(BaseModel):
    """更新镜头排序请求"""
    shot_order: List[int] = Field(..., description="镜头ID顺序数组")


class StoryboardResponse(BaseModel):
    """故事版响应"""
    storyboard_id: int
    user_id: int
    project_id: Optional[int] = None
    topic_prompt: Optional[str] = None
    global_role_id: Optional[int] = None
    shot_order: List[int] = []
    created_at: datetime
    updated_at: datetime
    
    # 扩展字段
    shots: List[ShotResponse] = []
    
    class Config:
        from_attributes = True


class BatchGenerateRequest(BaseModel):
    """批量生成请求"""
    storyboard_id: int = Field(..., description="故事版ID")
    ratio: str = Field(default="9:16", description="视频比例")
    model: str = Field(default="sora2", description="生成模型")
