"""
用户接口
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User, UserStats as UserStatsModel
from app.schemas.users import UserProfile, UserStats, UpdateProfileRequest
from app.schemas.works import WorkResponse
from app.schemas.common import ResponseModel
from app.api.dependencies import get_current_user
from app.services.work_service import WorkService
from typing import Optional

router = APIRouter(prefix="/api/v1/users", tags=["用户"])


@router.get("/me", response_model=ResponseModel)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取当前用户资料
    
    **需要登录**：是
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "success",
        "data": {
            "user_id": 12345,
            "nickname": "用户8000",
            "avatar_url": null,
            "bio": null,
            "created_at": "2025-12-25T10:00:00"
        }
    }
    ```
    """
    profile = UserProfile.model_validate(current_user)
    return ResponseModel(code=200, message="success", data=profile)


@router.get("/me/stats", response_model=ResponseModel)
async def get_my_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取当前用户统计
    
    **需要登录**：是
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "success",
        "data": {
            "total_videos_generated": 10,
            "total_works_published": 5,
            "total_likes_received": 100,
            "total_followers": 20,
            "total_following": 15
        }
    }
    ```
    """
    stats = db.query(UserStatsModel).filter(
        UserStatsModel.user_id == current_user.user_id
    ).first()
    
    if not stats:
        # 如果不存在统计数据，返回默认值
        stats = UserStatsModel(user_id=current_user.user_id)
    
    stats_data = UserStats.model_validate(stats)
    return ResponseModel(code=200, message="success", data=stats_data)


@router.patch("/me", response_model=ResponseModel)
async def update_my_profile(
    req: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    更新当前用户资料
    
    **需要登录**：是
    
    **请求示例**：
    ```json
    {
        "nickname": "新昵称",
        "bio": "这是我的个人简介",
        "avatar_url": "https://example.com/avatar.jpg"
    }
    ```
    """
    # 更新字段
    if req.nickname is not None:
        current_user.nickname = req.nickname
    if req.bio is not None:
        current_user.bio = req.bio
    if req.avatar_url is not None:
        current_user.avatar_url = req.avatar_url
    
    db.commit()
    db.refresh(current_user)
    
    profile = UserProfile.model_validate(current_user)
    return ResponseModel(code=200, message="更新成功", data=profile)


@router.get("/{user_id}", response_model=ResponseModel)
async def get_user_profile(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    获取指定用户资料
    
    **需要登录**：否
    """
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
        
    profile = UserProfile.model_validate(user)
    return ResponseModel(code=200, message="success", data=profile)


@router.get("/{user_id}/stats", response_model=ResponseModel)
async def get_user_stats(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    获取指定用户统计
    
    **需要登录**：否
    """
    stats = db.query(UserStatsModel).filter(
        UserStatsModel.user_id == user_id
    ).first()
    
    if not stats:
        stats = UserStatsModel(user_id=user_id)
    
    stats_data = UserStats.model_validate(stats)
    return ResponseModel(code=200, message="success", data=stats_data)


@router.get("/{user_id}/works", response_model=ResponseModel)
async def get_user_works(
    user_id: int,
    cursor: Optional[int] = Query(None, description="游标（work_id）"),
    limit: int = Query(20, ge=1, le=50, description="每页数量"),
    db: Session = Depends(get_db)
):
    """
    获取指定用户的作品列表
    
    **需要登录**：否
    """
    service = WorkService(db)
    
    works = service.get_user_works(user_id, limit, cursor)
    
    items = [WorkResponse.model_validate(work) for work in works]
    has_more = len(items) == limit
    next_cursor = items[-1].work_id if has_more and items else None
    
    return ResponseModel(
        code=200,
        message="success",
        data={
            "items": items,
            "has_more": has_more,
            "next_cursor": next_cursor
        }
    )
