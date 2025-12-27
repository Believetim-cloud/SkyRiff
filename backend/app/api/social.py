"""
社交接口（关注系统）
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.schemas.social import FollowResponse, UserBriefResponse
from app.schemas.common import ResponseModel
from app.services.social_service import SocialService
from app.api.dependencies import get_current_user
from typing import Optional

router = APIRouter(prefix="/api/v1/social", tags=["社交"])


@router.post("/follow/{user_id}", response_model=ResponseModel)
async def follow_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    关注用户
    
    **需要登录**：是
    
    **限制**：
    - 不能关注自己
    - 不能重复关注
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "关注成功",
        "data": null
    }
    ```
    """
    service = SocialService(db)
    
    try:
        service.follow_user(current_user.user_id, user_id)
        return ResponseModel(code=200, message="关注成功", data=None)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/follow/{user_id}", response_model=ResponseModel)
async def unfollow_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    取消关注
    
    **需要登录**：是
    """
    service = SocialService(db)
    
    try:
        service.unfollow_user(current_user.user_id, user_id)
        return ResponseModel(code=200, message="取消关注成功", data=None)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/followers/{user_id}", response_model=ResponseModel)
async def list_followers(
    user_id: int,
    cursor: Optional[int] = Query(None, description="游标（follow_id）"),
    limit: int = Query(20, ge=1, le=100, description="每页数量"),
    db: Session = Depends(get_db)
):
    """
    获取粉丝列表
    
    **需要登录**：否
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "success",
        "data": {
            "items": [...],
            "has_more": true,
            "next_cursor": 999
        }
    }
    ```
    """
    service = SocialService(db)
    
    follows = service.list_followers(user_id, limit, cursor)
    
    items = [FollowResponse.model_validate(follow) for follow in follows]
    has_more = len(items) == limit
    next_cursor = items[-1].follow_id if has_more and items else None
    
    return ResponseModel(
        code=200,
        message="success",
        data={
            "items": items,
            "has_more": has_more,
            "next_cursor": next_cursor
        }
    )


@router.get("/following/{user_id}", response_model=ResponseModel)
async def list_following(
    user_id: int,
    cursor: Optional[int] = Query(None, description="游标（follow_id）"),
    limit: int = Query(20, ge=1, le=100, description="每页数量"),
    db: Session = Depends(get_db)
):
    """
    获取关注列表
    
    **需要登录**：否
    """
    service = SocialService(db)
    
    follows = service.list_following(user_id, limit, cursor)
    
    items = [FollowResponse.model_validate(follow) for follow in follows]
    has_more = len(items) == limit
    next_cursor = items[-1].follow_id if has_more and items else None
    
    return ResponseModel(
        code=200,
        message="success",
        data={
            "items": items,
            "has_more": has_more,
            "next_cursor": next_cursor
        }
    )
