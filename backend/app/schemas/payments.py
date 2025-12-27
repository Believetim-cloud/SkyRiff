"""
支付相关Schema
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal


class ProductResponse(BaseModel):
    """商品响应"""
    product_id: int
    product_type: str  # recharge/subscription
    name: str
    price_yuan: Decimal
    credits: Optional[int] = None
    bonus_credits: int = 0
    duration_days: Optional[int] = None
    daily_credits: Optional[int] = None
    is_active: bool
    
    class Config:
        from_attributes = True


class CreatePaymentRequest(BaseModel):
    """创建支付单请求"""
    product_id: int = Field(..., description="商品ID")
    pay_channel: str = Field(default="mock", description="支付渠道：wechat/alipay/mock")


class PaymentResponse(BaseModel):
    """支付单响应"""
    payment_id: int
    user_id: int
    product_id: int
    amount_cny: Decimal
    pay_channel: str
    status: str  # pending/success/failed/cancelled
    pay_params: Optional[str] = None
    created_at: datetime
    paid_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class MockPaymentCallbackRequest(BaseModel):
    """模拟支付回调请求"""
    payment_id: int = Field(..., description="支付单ID")
    success: bool = Field(default=True, description="是否支付成功")
