"""
作品相关Schema
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal


class PublishWorkRequest(BaseModel):
    """发布作品请求"""
    video_id: int = Field(..., description="视频资产ID")
    title: Optional[str] = Field(None, max_length=200, description="标题")
    description: Optional[str] = Field(None, max_length=2000, description="描述")
    is_prompt_public: bool = Field(default=False, description="是否公开提示词")
    prompt_unlock_cost: int = Field(default=5, ge=0, le=100, description="提示词解锁费用")
    allow_remix: bool = Field(default=True, description="是否允许二创")


class WorkResponse(BaseModel):
    """作品响应"""
    work_id: int
    user_id: int
    video_id: int
    title: Optional[str] = None
    description: Optional[str] = None
    cover_image_url: Optional[str] = None
    prompt: str
    is_prompt_public: bool
    prompt_unlock_cost: int
    allow_remix: bool
    remix_share_rate: Decimal
    parent_work_id: Optional[int] = None
    is_remix: bool
    
    # 统计
    view_count: int = 0
    like_count: int = 0
    comment_count: int = 0
    collect_count: int = 0
    tip_count: int = 0
    remix_count: int = 0
    
    # 收益
    total_tip_income: Decimal = Decimal(0)
    total_prompt_income: Decimal = Decimal(0)
    total_remix_income: Decimal = Decimal(0)
    
    status: str
    created_at: datetime
    published_at: Optional[datetime] = None
    
    # 扩展字段（前端需要）
    creator_nickname: Optional[str] = None
    creator_avatar: Optional[str] = None
    video_url: Optional[str] = None
    is_liked: bool = False
    is_collected: bool = False
    is_following_creator: bool = False
    has_unlocked_prompt: bool = False
    
    class Config:
        from_attributes = True


class WorkDetailResponse(BaseModel):
    """作品详情响应（含创作者信息）"""
    work: WorkResponse
    creator: dict  # 创作者信息


class CommentResponse(BaseModel):
    """评论响应"""
    comment_id: int
    work_id: int
    user_id: int
    content: str
    parent_comment_id: Optional[int] = None
    like_count: int = 0
    created_at: datetime
    
    # 扩展字段
    user_nickname: Optional[str] = None
    user_avatar: Optional[str] = None
    
    class Config:
        from_attributes = True


class CreateCommentRequest(BaseModel):
    """创建评论请求"""
    content: str = Field(..., min_length=1, max_length=500)
    parent_comment_id: Optional[int] = None


class TipWorkRequest(BaseModel):
    """打赏作品请求"""
    amount_credits: int = Field(..., description="打赏积分", ge=10, le=100)


class RemixWorkRequest(BaseModel):
    """二创请求"""
    prompt: str = Field(..., description="二创提示词", min_length=1, max_length=5000)
    duration_sec: int = Field(..., description="视频时长", ge=10, le=25)
    ratio: str = Field(default="9:16", description="视频比例")
