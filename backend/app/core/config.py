"""
核心配置模块
使用pydantic-settings管理环境变量
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """应用配置"""
    
    # 应用配置
    APP_NAME: str = "SkyRiff"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    
    # 数据库
    DATABASE_URL: str = "sqlite:///./skyriff.db"
    
    # JWT
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"
    
    # 短信配置
    SMS_PROVIDER: str = "mock"  # mock/aliyun/tencent
    SMS_API_KEY: Optional[str] = None
    
    # 供应商API配置
    DYUAPI_BASE_URL: str = "https://api.dyuapi.com"
    DYUAPI_API_KEY: Optional[str] = None
    DISABLE_VENDOR_FALLBACK: bool = True
    
    # 文件存储
    STORAGE_TYPE: str = "local"  # local/oss
    UPLOAD_DIR: str = "./uploads"
    
    # 日志配置
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# 全局配置实例
settings = Settings()
