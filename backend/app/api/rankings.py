"""
排行榜接口
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.db.database import get_db
from app.db.models import User, Work, WorkTip, UserStats
from app.schemas.common import ResponseModel
from typing import Optional

router = APIRouter(prefix="/api/v1/rankings", tags=["排行榜"])


@router.get("/creators/tips", response_model=ResponseModel)
async def get_tip_ranking(
    limit: int = Query(10, ge=1, le=100, description="排行榜数量"),
    db: Session = Depends(get_db)
):
    """
    创作者打赏排行榜
    
    **需要登录**：否
    
    **功能**：
    - 统计创作者累计收到的打赏积分
    - 按打赏总额降序排列
    - 返回Top N
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "success",
        "data": {
            "items": [
                {
                    "rank": 1,
                    "user_id": 123,
                    "nickname": "创作大神",
                    "avatar_url": "https://...",
                    "total_tipped_credits": 5000,
                    "total_works": 50,
                    "total_followers": 1000
                },
                {
                    "rank": 2,
                    "user_id": 456,
                    "nickname": "视频高手",
                    "avatar_url": "https://...",
                    "total_tipped_credits": 3000,
                    "total_works": 30,
                    "total_followers": 500
                }
            ]
        }
    }
    ```
    
    **排名规则**：
    - 按累计打赏积分降序
    - 只统计已发布的作品
    - 实时计算
    """
    # 统计每个创作者的打赏总额
    tip_stats = db.query(
        WorkTip.creator_user_id,
        func.sum(WorkTip.amount_credits).label('total_tipped_credits'),
        func.count(WorkTip.tip_id).label('tip_count')
    ).group_by(
        WorkTip.creator_user_id
    ).order_by(
        desc('total_tipped_credits')
    ).limit(limit).all()
    
    # 获取用户信息和统计
    items = []
    rank = 1
    for stat in tip_stats:
        user = db.query(User).filter(User.user_id == stat.creator_user_id).first()
        user_stats = db.query(UserStats).filter(UserStats.user_id == stat.creator_user_id).first()
        
        if user:
            items.append({
                "rank": rank,
                "user_id": user.user_id,
                "nickname": user.nickname or f"用户{user.user_id}",
                "avatar_url": user.avatar_url,
                "total_tipped_credits": int(stat.total_tipped_credits),
                "tip_count": stat.tip_count,
                "total_works": user_stats.total_works_published if user_stats else 0,
                "total_followers": user_stats.total_followers if user_stats else 0
            })
            rank += 1
    
    return ResponseModel(
        code=200,
        message="success",
        data={"items": items}
    )


@router.get("/works/popular", response_model=ResponseModel)
async def get_popular_works_ranking(
    limit: int = Query(10, ge=1, le=100, description="排行榜数量"),
    db: Session = Depends(get_db)
):
    """
    热门作品排行榜
    
    **需要登录**：否
    
    **功能**：
    - 按点赞数降序排列
    - 返回Top N
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "success",
        "data": {
            "items": [
                {
                    "rank": 1,
                    "work_id": 1,
                    "title": "可爱的小猫",
                    "like_count": 1000,
                    "view_count": 5000,
                    "creator": {
                        "user_id": 123,
                        "nickname": "创作大神"
                    }
                }
            ]
        }
    }
    ```
    """
    works = db.query(Work).filter(
        Work.status == "published"
    ).order_by(
        desc(Work.like_count)
    ).limit(limit).all()
    
    items = []
    rank = 1
    for work in works:
        creator = db.query(User).filter(User.user_id == work.user_id).first()
        
        items.append({
            "rank": rank,
            "work_id": work.work_id,
            "title": work.title or "未命名作品",
            "cover_url": work.cover_url,
            "like_count": work.like_count,
            "view_count": work.view_count,
            "tip_count": work.tip_count,
            "creator": {
                "user_id": creator.user_id if creator else work.user_id,
                "nickname": creator.nickname if creator else f"用户{work.user_id}",
                "avatar_url": creator.avatar_url if creator else None
            }
        })
        rank += 1
    
    return ResponseModel(
        code=200,
        message="success",
        data={"items": items}
    )
