"""
钱包相关Schema
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal


class WalletsResponse(BaseModel):
    """钱包余额响应"""
    credits: int = Field(..., description="生成积分余额")
    coins_available: Decimal = Field(..., description="可提现金币")
    coins_pending: Decimal = Field(..., description="冻结中金币")
    commission_available: Decimal = Field(..., description="可提现佣金（人民币）")
    commission_pending: Decimal = Field(..., description="冻结中佣金（人民币）")


class CreditLedgerItem(BaseModel):
    """积分流水项"""
    ledger_id: int
    type: str
    amount: int
    balance_after: int
    ref_type: Optional[str] = None
    ref_id: Optional[int] = None
    description: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class CoinLedgerItem(BaseModel):
    """金币流水项"""
    ledger_id: int
    type: str
    amount_coins: Decimal
    balance_after: Decimal
    source_user_id: Optional[int] = None
    status: str
    unlock_at: Optional[datetime] = None
    description: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class CommissionLedgerItem(BaseModel):
    """佣金流水项"""
    ledger_id: int
    type: str
    amount_cny: Decimal
    balance_after: Decimal
    source_user_id: Optional[int] = None
    status: str
    unlock_at: Optional[datetime] = None
    description: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
