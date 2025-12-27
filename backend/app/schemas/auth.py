"""
认证相关Schema
"""
from pydantic import BaseModel, Field
from typing import Optional


class PhoneLoginRequest(BaseModel):
    """手机登录请求"""
    phone: str = Field(..., description="手机号")
    code: str = Field(..., description="验证码", min_length=6, max_length=6)


class MockLoginRequest(BaseModel):
    """模拟登录请求（测试用）"""
    user_id: int = Field(..., description="用户ID", ge=1)


class SendSmsCodeRequest(BaseModel):
    """发送短信验证码请求"""
    phone: str = Field(..., description="手机号")
    purpose: str = Field(default="login", description="用途：login/register")


class LoginResponse(BaseModel):
    """登录响应"""
    token: str = Field(..., description="JWT访问令牌")
    user_id: int = Field(..., description="用户ID")
    is_new_user: bool = Field(..., description="是否新用户")


class MockLoginResponse(BaseModel):
    """模拟登录响应"""
    access_token: str = Field(..., description="访问令牌")
    token_type: str = Field(default="bearer", description="令牌类型")
    user_id: int = Field(..., description="用户ID")


class TokenPayload(BaseModel):
    """JWT载荷"""
    user_id: int
    exp: Optional[int] = None