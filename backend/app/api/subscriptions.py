"""
月卡订阅接口
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.schemas.subscriptions import (
    BuySubscriptionRequest, SubscriptionResponse, DailyRewardClaimResponse
)
from app.schemas.common import ResponseModel
from app.services.subscription_service import SubscriptionService
from app.api.dependencies import get_current_user
from datetime import datetime

router = APIRouter(prefix="/api/v1/subscriptions", tags=["月卡"])


@router.post("/buy", response_model=ResponseModel)
async def buy_subscription(
    req: BuySubscriptionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    购买月卡
    
    **需要登录**：是
    
    **功能**：
    - 创建支付单
    - 模拟支付（pay_channel=mock时）
    - 创建订阅记录
    
    **请求示例**：
    ```json
    {
        "product_id": 5,
        "pay_channel": "mock"
    }
    ```
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "购买成功",
        "data": {
            "payment": {...},
            "subscription": {
                "subscription_id": 1,
                "start_at": "2025-12-25T10:00:00",
                "end_at": "2026-01-24T10:00:00",
                "status": "active",
                "days_remaining": 30
            }
        }
    }
    ```
    
    **业务流程**：
    1. 验证商品是月卡类型
    2. 创建支付单
    3. 模拟支付成功
    4. 创建订阅记录（30天有效期）
    5. 返回订阅信息
    """
    service = SubscriptionService(db)
    
    try:
        result = service.buy_subscription(
            user_id=current_user.user_id,
            product_id=req.product_id,
            pay_channel=req.pay_channel
        )
        
        return ResponseModel(
            code=200,
            message="购买成功",
            data=result
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/me", response_model=ResponseModel)
async def get_my_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    查询我的月卡状态
    
    **需要登录**：是
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "success",
        "data": {
            "subscription_id": 1,
            "start_at": "2025-12-25T10:00:00",
            "end_at": "2026-01-24T10:00:00",
            "status": "active",
            "days_remaining": 30,
            "today_claimed": false
        }
    }
    ```
    
    **字段说明**：
    - days_remaining：剩余天数
    - today_claimed：今天是否已领取
    """
    service = SubscriptionService(db)
    
    subscription = service.get_my_subscription(current_user.user_id)
    
    if not subscription:
        return ResponseModel(
            code=200,
            message="您还没有购买月卡",
            data=None
        )
    
    # 计算剩余天数
    now = datetime.now()
    days_remaining = (subscription.end_at - now).days
    
    # 检查今天是否已领取
    today_claimed = service.check_today_claimed(current_user.user_id)
    
    subscription_data = SubscriptionResponse.model_validate(subscription)
    subscription_data.days_remaining = days_remaining
    subscription_data.today_claimed = today_claimed
    
    return ResponseModel(
        code=200,
        message="success",
        data=subscription_data
    )


@router.post("/claim_daily", response_model=ResponseModel)
async def claim_daily_reward(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    每日领取积分
    
    **需要登录**：是
    
    **功能**：
    - 检查月卡状态（必须active）
    - 检查今天是否已领取
    - 发放30积分
    - 记录领取记录
    
    **请求示例**：
    ```
    POST /api/v1/subscriptions/claim_daily
    ```
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "领取成功，获得30积分",
        "data": {
            "claim_id": 1,
            "claim_date": "2025-12-25",
            "credits_amount": 30
        }
    }
    ```
    
    **业务规则**：
    1. 必须有active的月卡
    2. 每天只能领取一次
    3. 默认领取30积分（可根据商品配置调整）
    
    **错误示例**：
    ```json
    {
        "detail": "您还没有购买月卡"
    }
    ```
    ```json
    {
        "detail": "今日已领取过了"
    }
    ```
    """
    service = SubscriptionService(db)
    
    try:
        claim = service.claim_daily_reward(current_user.user_id)
        
        claim_data = DailyRewardClaimResponse.model_validate(claim)
        
        return ResponseModel(
            code=200,
            message=f"领取成功，获得{claim.credits_amount}积分",
            data=claim_data
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
