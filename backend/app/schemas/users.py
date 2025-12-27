"""
用户相关Schema
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class UserProfile(BaseModel):
    """用户资料"""
    user_id: int
    nickname: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserStats(BaseModel):
    """用户统计"""
    total_videos_generated: int = 0
    total_works_published: int = 0
    total_likes_received: int = 0
    total_followers: int = 0
    total_following: int = 0
    
    class Config:
        from_attributes = True


class UpdateProfileRequest(BaseModel):
    """更新资料请求"""
    nickname: Optional[str] = Field(None, max_length=50)
    bio: Optional[str] = Field(None, max_length=500)
    avatar_url: Optional[str] = None
