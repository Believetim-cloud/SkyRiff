"""
数据库连接与会话管理
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# 创建数据库引擎
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False, "timeout": 30} # 增加超时时间

engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,  # DEBUG模式下打印SQL
    pool_pre_ping=True,  # 连接池健康检查
    # pool_size=10, # SQLite不使用pool_size，移除避免警告
    # max_overflow=20,
    connect_args=connect_args,
)

# 启用 WAL 模式 (Write-Ahead Logging) 以提高并发性能
if settings.DATABASE_URL.startswith("sqlite"):
    from sqlalchemy import event
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.close()

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建基类
Base = declarative_base()


def get_db():
    """
    数据库会话依赖注入
    用于FastAPI的Depends
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    初始化数据库（创建所有表）
    """
    from app.db import models  # 导入所有模型
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")
