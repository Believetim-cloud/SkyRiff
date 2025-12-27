"""
月卡订阅相关Schema
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date


class BuySubscriptionRequest(BaseModel):
    """购买月卡请求"""
    product_id: int = Field(..., description="月卡商品ID")
    pay_channel: str = Field(default="mock", description="支付渠道")


class SubscriptionResponse(BaseModel):
    """订阅响应"""
    subscription_id: int
    user_id: int
    product_id: int
    start_at: datetime
    end_at: datetime
    status: str  # active/expired/cancelled
    created_at: datetime
    
    # 扩展字段
    days_remaining: Optional[int] = None
    today_claimed: Optional[bool] = None
    
    class Config:
        from_attributes = True


class DailyRewardClaimResponse(BaseModel):
    """每日领取响应"""
    claim_id: int
    user_id: int
    subscription_id: int
    claim_date: date
    credits_amount: int
    created_at: datetime
    
    class Config:
        from_attributes = True
