"""
通用Schema定义
"""
from typing import Optional, Any
from pydantic import BaseModel


class ResponseModel(BaseModel):
    """统一响应格式"""
    code: int
    message: str
    data: Optional[Any] = None


class PaginationParams(BaseModel):
    """分页参数"""
    cursor: Optional[int] = None
    limit: int = 20
