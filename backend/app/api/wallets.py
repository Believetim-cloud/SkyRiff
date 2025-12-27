"""
钱包接口
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.schemas.wallets import (
    WalletsResponse, CreditLedgerItem, 
    CoinLedgerItem, CommissionLedgerItem
)
from app.schemas.common import ResponseModel
from app.services.wallet_service import WalletService
from app.api.dependencies import get_current_user
from typing import Optional

router = APIRouter(prefix="/api/v1/wallets", tags=["钱包"])


@router.get("/me", response_model=ResponseModel)
async def get_my_wallets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取当前用户三钱包余额
    
    **需要登录**：是
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "success",
        "data": {
            "credits": 120,
            "coins_available": "10.50",
            "coins_pending": "5.00",
            "commission_available": "50.00",
            "commission_pending": "20.00"
        }
    }
    ```
    """
    service = WalletService(db)
    wallets = service.get_wallets_balance(current_user.user_id)
    return ResponseModel(code=200, message="success", data=wallets)


@router.get("/ledgers/credits", response_model=ResponseModel)
async def get_credit_ledgers(
    cursor: Optional[int] = Query(None, description="游标（ledger_id）"),
    limit: int = Query(20, ge=1, le=100, description="每页数量"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取积分流水
    
    **需要登录**：是
    
    **分页方式**：游标分页（cursor-based pagination）
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "success",
        "data": {
            "items": [
                {
                    "ledger_id": 100,
                    "type": "recharge",
                    "amount": 120,
                    "balance_after": 120,
                    "ref_type": "payment",
                    "ref_id": 50,
                    "description": "充值6元",
                    "created_at": "2025-12-25T10:00:00"
                }
            ],
            "has_more": true,
            "next_cursor": 99
        }
    }
    ```
    """
    service = WalletService(db)
    ledgers = service.get_credit_ledgers(current_user.user_id, limit, cursor)
    
    # 转换为Pydantic模型
    items = [CreditLedgerItem.model_validate(ledger) for ledger in ledgers]
    
    # 判断是否还有更多
    has_more = len(items) == limit
    next_cursor = items[-1].ledger_id if has_more and items else None
    
    return ResponseModel(
        code=200,
        message="success",
        data={
            "items": items,
            "has_more": has_more,
            "next_cursor": next_cursor
        }
    )


@router.get("/ledgers/coins", response_model=ResponseModel)
async def get_coin_ledgers(
    cursor: Optional[int] = Query(None, description="游标（ledger_id）"),
    limit: int = Query(20, ge=1, le=100, description="每页数量"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取金币流水
    
    **需要登录**：是
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "success",
        "data": {
            "items": [
                {
                    "ledger_id": 50,
                    "type": "creator_tip_income",
                    "amount_coins": "4.50",
                    "balance_after": "10.50",
                    "source_user_id": 123,
                    "status": "pending",
                    "unlock_at": "2026-01-01T10:00:00",
                    "description": "打赏收入",
                    "created_at": "2025-12-25T10:00:00"
                }
            ],
            "has_more": false,
            "next_cursor": null
        }
    }
    ```
    """
    service = WalletService(db)
    ledgers = service.get_coin_ledgers(current_user.user_id, limit, cursor)
    
    items = [CoinLedgerItem.model_validate(ledger) for ledger in ledgers]
    has_more = len(items) == limit
    next_cursor = items[-1].ledger_id if has_more and items else None
    
    return ResponseModel(
        code=200,
        message="success",
        data={
            "items": items,
            "has_more": has_more,
            "next_cursor": next_cursor
        }
    )
