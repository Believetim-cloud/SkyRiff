"""
API依赖注入
"""
from fastapi import Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.database import get_db
from app.db.models import User
from typing import Optional

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)

async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    query_token: Optional[str] = Query(None, alias="token"),
    db: Session = Depends(get_db)
) -> User:
    """
    获取当前登录用户 (强制验证)
    """
    # 优先使用 Header 中的 token，如果没有则尝试 Query 中的 token
    final_token = token or query_token
    
    # print(f"DEBUG: Auth check. Header: {'Yes' if token else 'No'}, Query: {'Yes' if query_token else 'No'}")
    
    if not final_token:
        print("❌ Auth failed: No token provided")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        return await _get_user_from_token(final_token, db)
    except Exception as e:
        print(f"❌ Auth failed: {e}")
        raise

async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme),
    query_token: Optional[str] = Query(None, alias="token"),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    获取当前登录用户 (可选验证)
    如果未登录或Token无效，返回 None (而不是抛出401)
    这允许用户在 Token 过期时仍然访问公共接口（如 feed），而不会被强制登出
    """
    final_token = token or query_token
    
    if not final_token:
        return None
        
    try:
        return await _get_user_from_token(final_token, db)
    except HTTPException:
        # 如果 Token 验证失败（过期、无效等），静默失败，视为未登录
        return None

async def _get_user_from_token(token: str, db: Session) -> User:
    """
    内部辅助函数：解析 Token 并获取用户
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.user_id == int(user_id)).first()
    if user is None:
        raise credentials_exception
        
    return user
