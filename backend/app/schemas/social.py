"""
社交相关Schema
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class FollowResponse(BaseModel):
    """关注响应"""
    follow_id: int
    follower_user_id: int
    following_user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserBriefResponse(BaseModel):
    """用户简要信息"""
    user_id: int
    nickname: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    total_works_published: int = 0
    total_followers: int = 0
    total_following: int = 0
    is_following: bool = False  # 当前用户是否关注了TA
