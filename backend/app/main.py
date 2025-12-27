"""
FastAPI主应用入口
"""
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
import os
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import init_db

# 导入路由
from app.api import auth, users, wallets, tasks, assets, works, social, storyboards, payments, subscriptions, tasks_center, rankings, withdrawals

# 创建FastAPI应用
app = FastAPI(
    title=settings.APP_NAME,
    description="SkyRiff AI视频社交平台后端API",
    version="1.0.0",
    debug=settings.DEBUG
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境改为具体域名
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "Content-Range", "Accept-Ranges", "Content-Length"]  # 暴露关键头，解决视频流拖拽问题
)

# 注册路由
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(wallets.router)
app.include_router(tasks.router)
app.include_router(assets.router)
app.include_router(works.router)
app.include_router(social.router)
app.include_router(storyboards.router)
app.include_router(payments.router)
app.include_router(subscriptions.router)
app.include_router(tasks_center.router)
app.include_router(rankings.router)
app.include_router(withdrawals.router)

# 挂载静态文件目录 (用于本地缓存视频)
static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
async def root():
    """根路径"""
    return {
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "status": "running",
        "environment": settings.ENVIRONMENT
    }


@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy"}

@app.get("/test-tool", response_class=HTMLResponse)
async def test_tool():
    """前端测试工具静态页"""
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    file_path = os.path.join(root_dir, "test-tool.html")
    if not os.path.exists(file_path):
        return HTMLResponse("<h1>test-tool.html 不存在</h1>", status_code=404)
    return FileResponse(file_path, media_type="text/html")


@app.on_event("startup")
async def startup_event():
    """应用启动事件"""
    print(f"🚀 {settings.APP_NAME} starting...")
    print(f"📝 Environment: {settings.ENVIRONMENT}")
    print(f"🔧 Debug mode: {settings.DEBUG}")
    
    # 初始化数据库（开发环境）
    if settings.DEBUG:
        print("🗄️  Initializing database...")
        init_db()


@app.on_event("shutdown")
async def shutdown_event():
    """应用关闭事件"""
    print(f"👋 {settings.APP_NAME} shutting down...")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
