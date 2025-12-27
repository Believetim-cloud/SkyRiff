"""
认证接口
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.auth import (
    SendSmsCodeRequest, PhoneLoginRequest, LoginResponse,
    MockLoginRequest, MockLoginResponse
)
from app.schemas.common import ResponseModel
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/v1/auth", tags=["认证"])


@router.post("/send_sms", response_model=ResponseModel)
async def send_sms_code(
    req: SendSmsCodeRequest,
    db: Session = Depends(get_db)
):
    """
    发送短信验证码
    
    **功能**：
    - 向指定手机号发送6位数字验证码
    - 验证码5分钟内有效
    - 开发环境会在控制台打印验证码
    
    **请求示例**：
    ```json
    {
        "phone": "13800138000",
        "purpose": "login"
    }
    ```
    """
    service = AuthService(db)
    try:
        result = service.send_sms_code(req.phone, req.purpose)
        return ResponseModel(
            code=200,
            message=result["message"],
            data=None
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login/phone", response_model=ResponseModel)
async def login_by_phone(
    req: PhoneLoginRequest,
    db: Session = Depends(get_db)
):
    """
    手机验证码登录
    
    **功能**：
    - 验证码登录
    - 新用户自动注册并初始化三钱包
    - 返回JWT token
    
    **请求示例**：
    ```json
    {
        "phone": "13800138000",
        "code": "123456"
    }
    ```
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "登录成功",
        "data": {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "user_id": 12345,
            "is_new_user": false
        }
    }
    ```
    """
    service = AuthService(db)
    try:
        result = service.login_by_phone(req.phone, req.code)
        return ResponseModel(
            code=200,
            message="登录成功",
            data=result
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="登录失败")


@router.post("/login_mock", response_model=ResponseModel)
async def login_mock(
    req: MockLoginRequest,
    db: Session = Depends(get_db)
):
    """
    模拟登录（开发测试用）
    
    **功能**：
    - 用于开发测试，直接用user_id登录
    - 如果用户不存在，自动创建
    - 自动初始化三钱包（积分、金币、佣金）
    - 返回JWT token
    
    **请求示例**：
    ```json
    {
        "user_id": 1
    }
    ```
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "登录成功",
        "data": {
            "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "token_type": "bearer",
            "user_id": 1
        }
    }
    ```
    
    **说明**：
    - 仅供开发测试使用
    - 生产环境应该禁用此接口
    """
    service = AuthService(db)
    try:
        result = service.login_mock(req.user_id)
        return ResponseModel(
            code=200,
            message="登录成功",
            data=result
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"登录失败: {str(e)}")