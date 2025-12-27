"""
支付接口
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.schemas.payments import (
    ProductResponse, CreatePaymentRequest, PaymentResponse,
    MockPaymentCallbackRequest
)
from app.schemas.common import ResponseModel
from app.services.payment_service import PaymentService
from app.api.dependencies import get_current_user
from typing import Optional

router = APIRouter(prefix="/api/v1", tags=["支付"])


@router.get("/products", response_model=ResponseModel)
async def get_products(
    product_type: Optional[str] = Query(None, description="商品类型：recharge/subscription"),
    db: Session = Depends(get_db)
):
    """
    获取商品列表
    
    **需要登录**：否
    
    **参数**：
    - product_type：商品类型（可选）
      - recharge：充值档位
      - subscription：月卡
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "success",
        "data": {
            "items": [
                {
                    "product_id": 1,
                    "product_type": "recharge",
                    "name": "100积分",
                    "price_yuan": 6.00,
                    "credits": 100,
                    "bonus_credits": 0
                },
                {
                    "product_id": 5,
                    "product_type": "subscription",
                    "name": "月卡会员",
                    "price_yuan": 29.00,
                    "duration_days": 30,
                    "daily_credits": 30
                }
            ]
        }
    }
    ```
    """
    service = PaymentService(db)
    
    products = service.get_products(product_type)
    
    items = [ProductResponse.model_validate(p) for p in products]
    
    return ResponseModel(
        code=200,
        message="success",
        data={"items": items}
    )


@router.post("/payments/create", response_model=ResponseModel)
async def create_payment(
    req: CreatePaymentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    创建支付单
    
    **需要登录**：是
    
    **功能**：
    - 创建支付单
    - 返回支付参数（模拟支付时自动返回payment_id）
    
    **请求示例**：
    ```json
    {
        "product_id": 1,
        "pay_channel": "mock"
    }
    ```
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "支付单创建成功",
        "data": {
            "payment_id": 1,
            "amount_cny": 6.00,
            "pay_channel": "mock",
            "status": "pending",
            "pay_params": "{\"mock_payment_id\": \"1\"}"
        }
    }
    ```
    
    **下一步**：
    - 真实环境：前端使用pay_params拉起微信/支付宝支付
    - 模拟环境：调用 POST /payments/callback 模拟支付成功
    """
    service = PaymentService(db)
    
    try:
        payment = service.create_payment(
            user_id=current_user.user_id,
            product_id=req.product_id,
            pay_channel=req.pay_channel
        )
        
        payment_data = PaymentResponse.model_validate(payment)
        
        return ResponseModel(
            code=200,
            message="支付单创建成功",
            data=payment_data
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/payments/callback", response_model=ResponseModel)
async def payment_callback(
    req: MockPaymentCallbackRequest,
    db: Session = Depends(get_db)
):
    """
    支付回调（模拟）
    
    **需要登录**：否（真实环境由支付网关调用）
    
    **功能**：
    - 模拟支付成功
    - 发放积分
    - 更新支付单状态
    
    **请求示例**：
    ```json
    {
        "payment_id": 1,
        "success": true
    }
    ```
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "支付成功，积分已发放",
        "data": {
            "payment_id": 1,
            "status": "success",
            "paid_at": "2025-12-25T10:00:00"
        }
    }
    ```
    
    **业务流程**：
    1. 验证支付单状态（必须是pending）
    2. 获取商品信息
    3. 发放积分（充值类商品）
    4. 更新支付单状态为success
    """
    service = PaymentService(db)
    
    try:
        payment = service.process_payment_callback(
            payment_id=req.payment_id,
            success=req.success
        )
        
        payment_data = PaymentResponse.model_validate(payment)
        
        message = "支付成功，积分已发放" if req.success else "支付失败"
        
        return ResponseModel(
            code=200,
            message=message,
            data=payment_data
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/payments/{payment_id}", response_model=ResponseModel)
async def get_payment(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    查询支付单详情
    
    **需要登录**：是
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "success",
        "data": {
            "payment_id": 1,
            "status": "success",
            "amount_cny": 6.00,
            "paid_at": "2025-12-25T10:00:00"
        }
    }
    ```
    """
    service = PaymentService(db)
    
    try:
        payment = service.get_payment(payment_id, current_user.user_id)
        payment_data = PaymentResponse.model_validate(payment)
        
        return ResponseModel(code=200, message="success", data=payment_data)
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/payments/history", response_model=ResponseModel)
async def get_payment_history(
    cursor: Optional[int] = Query(None, description="游标（payment_id）"),
    limit: int = Query(20, ge=1, le=50, description="每页数量"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取支付历史
    
    **需要登录**：是
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "success",
        "data": {
            "items": [...],
            "has_more": true,
            "next_cursor": 99
        }
    }
    ```
    """
    service = PaymentService(db)
    
    payments = service.get_payment_history(
        user_id=current_user.user_id,
        limit=limit,
        cursor=cursor
    )
    
    items = [PaymentResponse.model_validate(p) for p in payments]
    
    has_more = len(items) == limit
    next_cursor = items[-1].payment_id if has_more and items else None
    
    return ResponseModel(
        code=200,
        message="success",
        data={
            "items": items,
            "has_more": has_more,
            "next_cursor": next_cursor
        }
    )