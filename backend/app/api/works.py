"""
作品接口
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.schemas.works import (
    PublishWorkRequest, WorkResponse, CommentResponse,
    CreateCommentRequest, TipWorkRequest
)
from app.schemas.common import ResponseModel
from app.services.work_service import WorkService
from app.api.dependencies import get_current_user, get_current_user_optional
from typing import Optional
from typing import Optional
from typing import Optional

router = APIRouter(prefix="/api/v1/works", tags=["作品"])


@router.post("/publish", response_model=ResponseModel)
async def publish_work(
    req: PublishWorkRequest,
    request: Request,
    token: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    发布作品
    
    **需要登录**：是
    
    **功能**：
    - 将视频资产发布到社区
    - 自动关联生成任务的提示词
    - 设置提示词解锁费用
    - 设置是否允许二创
    
    **请求示例**：
    ```json
    {
        "video_id": 5001,
        "title": "我的第一个作品",
        "description": "用AI生成的视频",
        "is_prompt_public": false,
        "prompt_unlock_cost": 5,
        "allow_remix": true
    }
    ```
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "发布成功",
        "data": {
            "work_id": 1001,
            "user_id": 1,
            "video_id": 5001,
            "status": "published"
        }
    }
    ```
    """
    # 手动鉴权：兼容 Header 或 Query Token
    from app.core.security import get_current_user_from_token
    auth_header = request.headers.get("Authorization")
    current_user = None
    if auth_header and auth_header.startswith("Bearer "):
        try:
            current_user = await get_current_user_from_token(auth_header.split(" ")[1], db)
        except:
            pass
    if not current_user and token:
        try:
            current_user = await get_current_user_from_token(token, db)
        except:
            pass
    if not current_user:
        raise HTTPException(status_code=401, detail="未认证")
    
    service = WorkService(db)
    
    try:
        print(f"📝 Publish request: user_id={current_user.user_id}, video_id={req.video_id}, title={req.title}")
        work = service.publish_work(
            user_id=current_user.user_id,
            video_id=req.video_id,
            title=req.title,
            description=req.description,
            is_prompt_public=req.is_prompt_public,
            prompt_unlock_cost=req.prompt_unlock_cost,
            allow_remix=req.allow_remix
        )
        
        work_data = WorkResponse.model_validate(work)
        
        return ResponseModel(code=200, message="发布成功", data=work_data)
        
    except ValueError as e:
        print(f"❌ Publish failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/feed", response_model=ResponseModel)
async def get_feed(
    feed_type: str = Query("discover", description="类型：discover/hot/following"),
    cursor: Optional[int] = Query(None, description="游标（work_id）"),
    limit: int = Query(20, ge=1, le=50, description="每页数量"),
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取Feed流
    
    **需要登录**：following类型需要
    
    **Feed类型**：
    - `discover` - 发现（最新发布）
    - `hot` - 热门（按点赞数排序）
    - `following` - 关注（关注的人的作品）
    
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
    service = WorkService(db)
    
    try:
        user_id = current_user.user_id if current_user else None
        works = service.list_feed(
            feed_type=feed_type,
            user_id=user_id,
            limit=limit,
            cursor=cursor
        )
        
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
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{work_id}", response_model=ResponseModel)
async def get_work_detail(
    work_id: int,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    获取作品详情（自动增加浏览量）
    
    **需要登录**：否
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "success",
        "data": {
            "work_id": 1001,
            "title": "我的作品",
            "view_count": 100,
            "like_count": 50,
            ...
        }
    }
    ```
    """
    service = WorkService(db)
    
    try:
        viewer_user_id = current_user.user_id if current_user else None
        work = service.get_work(work_id, viewer_user_id)
        
        work_data = WorkResponse.model_validate(work)
        
        return ResponseModel(code=200, message="success", data=work_data)
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{work_id}/like", response_model=ResponseModel)
async def like_work(
    work_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    点赞作品
    
    **需要登录**：是
    
    **幂等性**：重复点赞会返回400错误
    """
    service = WorkService(db)
    
    try:
        service.like_work(work_id, current_user.user_id)
        return ResponseModel(code=200, message="点赞成功", data=None)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{work_id}/like", response_model=ResponseModel)
async def unlike_work(
    work_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    取消点赞
    
    **需要登录**：是
    """
    service = WorkService(db)
    
    try:
        service.unlike_work(work_id, current_user.user_id)
        return ResponseModel(code=200, message="取消点赞成功", data=None)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{work_id}/collect", response_model=ResponseModel)
async def collect_work(
    work_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    收藏作品
    
    **需要登录**：是
    """
    service = WorkService(db)
    
    try:
        service.collect_work(work_id, current_user.user_id)
        return ResponseModel(code=200, message="收藏成功", data=None)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{work_id}/collect", response_model=ResponseModel)
async def uncollect_work(
    work_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    取消收藏
    
    **需要登录**：是
    """
    service = WorkService(db)
    
    try:
        service.uncollect_work(work_id, current_user.user_id)
        return ResponseModel(code=200, message="取消收藏成功", data=None)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{work_id}/comments", response_model=ResponseModel)
async def create_comment(
    work_id: int,
    req: CreateCommentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    发表评论
    
    **需要登录**：是
    
    **请求示例**：
    ```json
    {
        "content": "这个作品太棒了！",
        "parent_comment_id": null
    }
    ```
    """
    service = WorkService(db)
    
    comment = service.create_comment(
        work_id=work_id,
        user_id=current_user.user_id,
        content=req.content,
        parent_comment_id=req.parent_comment_id
    )
    
    comment_data = CommentResponse.model_validate(comment)
    
    return ResponseModel(code=200, message="评论成功", data=comment_data)


@router.get("/{work_id}/comments", response_model=ResponseModel)
async def list_comments(
    work_id: int,
    cursor: Optional[int] = Query(None, description="游标（comment_id）"),
    limit: int = Query(20, ge=1, le=100, description="每页数量"),
    db: Session = Depends(get_db)
):
    """
    获取评论列表
    
    **需要登录**：否
    """
    service = WorkService(db)
    
    comments = service.list_comments(work_id, limit, cursor)
    
    items = [CommentResponse.model_validate(comment) for comment in comments]
    has_more = len(items) == limit
    next_cursor = items[-1].comment_id if has_more and items else None
    
    return ResponseModel(
        code=200,
        message="success",
        data={
            "items": items,
            "has_more": has_more,
            "next_cursor": next_cursor
        }
    )


@router.post("/{work_id}/tip", response_model=ResponseModel)
async def tip_work(
    work_id: int,
    req: TipWorkRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    打赏作品
    
    **需要登录**：是
    
    **打赏档位**：10/20/50/100积分
    
    **业务流程**：
    1. 扣除打赏者积分
    2. 平台抽成10%
    3. 创作者收到金币（冻结7天）
    
    **请求示例**：
    ```json
    {
        "amount_credits": 10
    }
    ```
    
    **费用计算**：
    - 10积分 = 0.5元 → 创作者得0.45元（金币）
    - 20积分 = 1.0元 → 创作者得0.90元
    - 50积分 = 2.5元 → 创作者得2.25元
    - 100积分 = 5.0元 → 创作者得4.50元
    """
    service = WorkService(db)
    
    try:
        tip = service.tip_work(
            work_id=work_id,
            tipper_user_id=current_user.user_id,
            amount_credits=req.amount_credits
        )
        
        return ResponseModel(
            code=200,
            message="打赏成功",
            data={
                "tip_id": tip.tip_id,
                "amount_credits": tip.amount_credits,
                "creator_income_coins": str(tip.amount_coins)
            }
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{work_id}/unlock_prompt", response_model=ResponseModel)
async def unlock_prompt(
    work_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    解锁提示词
    
    **需要登录**：是
    
    **费用**：作品设置的解锁费用（默认5积分）
    
    **业务流程**：
    1. 扣除解锁者积分
    2. 平台抽成10%
    3. 创作者收到金币（冻结7天）
    4. 返回提示词
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "解锁成功",
        "data": {
            "prompt": "一只猫在草地上奔跑",
            "already_unlocked": false
        }
    }
    ```
    
    **特殊情况**：
    - 如果已解锁过，直接返回提示词
    - 如果提示词是公开的，免费返回
    - 如果是自己的作品，免费返回
    """
    service = WorkService(db)
    
    try:
        result = service.unlock_prompt(work_id, current_user.user_id)
        
        message = "解锁成功" if not result["already_unlocked"] else "已解锁过"
        
        return ResponseModel(code=200, message=message, data=result)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
