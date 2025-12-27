"""
提现相关Schema
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal


class CreateWithdrawalRequest(BaseModel):
    """创建提现申请请求"""
    amount_cny: Decimal = Field(..., description="提现金额（元）", ge=100)
    method: str = Field(..., description="提现方式：bank_card/alipay/wechat")
    account_info: dict = Field(..., description="账户信息")
    
    class Config:
        json_schema_extra = {
            "example": {
                "amount_cny": 100.00,
                "method": "alipay",
                "account_info": {
                    "account": "example@alipay.com",
                    "name": "张三"
                }
            }
        }


class WithdrawalResponse(BaseModel):
    """提现单响应"""
    withdrawal_id: int
    user_id: int
    amount_cny: Decimal
    amount_coins: Decimal
    method: str
    status: str  # applied/approved/paid/rejected/cancelled
    reject_reason: Optional[str] = None
    created_at: datetime
    processed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
