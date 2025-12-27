"""
提现接口
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.schemas.withdrawals import CreateWithdrawalRequest, WithdrawalResponse
from app.schemas.common import ResponseModel
from app.services.withdrawal_service import WithdrawalService
from app.api.dependencies import get_current_user
from typing import Optional

router = APIRouter(prefix="/api/v1/withdrawals", tags=["提现"])


@router.post("/create", response_model=ResponseModel)
async def create_withdrawal(
    req: CreateWithdrawalRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    创建提现申请
    
    **需要登录**：是
    
    **功能**：
    - 检查金币余额
    - 扣除金币
    - 创建提现单
    
    **请求示例**：
    ```json
    {
        "amount_cny": 100.00,
        "method": "alipay",
        "account_info": {
            "account": "example@alipay.com",
            "name": "张三"
        }
    }
    ```
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "提现申请已提交",
        "data": {
            "withdrawal_id": 1,
            "amount_cny": 100.00,
            "status": "applied",
            "created_at": "2025-12-25T10:00:00"
        }
    }
    ```
    
    **业务规则**：
    1. 最低提现金额：100元
    2. 金币与人民币1:1兑换
    3. 提现后金币立即扣除
    4. 等待管理员审核
    
    **错误示例**：
    ```json
    {
        "detail": "金币余额不足：当前余额50元"
    }
    ```
    ```json
    {
        "detail": "提现金额不能少于100元"
    }
    ```
    """
    service = WithdrawalService(db)
    
    try:
        withdrawal = service.create_withdrawal(
            user_id=current_user.user_id,
            amount_cny=req.amount_cny,
            method=req.method,
            account_info=req.account_info
        )
        
        withdrawal_data = WithdrawalResponse.model_validate(withdrawal)
        
        return ResponseModel(
            code=200,
            message="提现申请已提交",
            data=withdrawal_data
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/me", response_model=ResponseModel)
async def get_my_withdrawals(
    cursor: Optional[int] = Query(None, description="游标（withdrawal_id）"),
    limit: int = Query(20, ge=1, le=50, description="每页数量"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取我的提现记录
    
    **需要登录**：是
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "success",
        "data": {
            "items": [
                {
                    "withdrawal_id": 1,
                    "amount_cny": 100.00,
                    "method": "alipay",
                    "status": "applied",
                    "created_at": "2025-12-25T10:00:00"
                }
            ],
            "has_more": false,
            "next_cursor": null
        }
    }
    ```
    
    **提现状态**：
    - applied：已申请，待审核
    - approved：已批准，待打款
    - paid：已打款
    - rejected：已拒绝（金币已退回）
    - cancelled：已取消
    """
    service = WithdrawalService(db)
    
    withdrawals = service.get_withdrawal_history(
        user_id=current_user.user_id,
        limit=limit,
        cursor=cursor
    )
    
    items = [WithdrawalResponse.model_validate(w) for w in withdrawals]
    
    has_more = len(items) == limit
    next_cursor = items[-1].withdrawal_id if has_more and items else None
    
    return ResponseModel(
        code=200,
        message="success",
        data={
            "items": items,
            "has_more": has_more,
            "next_cursor": next_cursor
        }
    )


@router.get("/{withdrawal_id}", response_model=ResponseModel)
async def get_withdrawal(
    withdrawal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    查询提现单详情
    
    **需要登录**：是
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "success",
        "data": {
            "withdrawal_id": 1,
            "amount_cny": 100.00,
            "method": "alipay",
            "status": "applied",
            "created_at": "2025-12-25T10:00:00"
        }
    }
    ```
    """
    service = WithdrawalService(db)
    
    try:
        withdrawal = service.get_withdrawal(withdrawal_id, current_user.user_id)
        withdrawal_data = WithdrawalResponse.model_validate(withdrawal)
        
        return ResponseModel(code=200, message="success", data=withdrawal_data)
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
