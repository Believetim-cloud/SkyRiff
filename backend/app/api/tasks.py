"""
任务接口
"""
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, Request
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User, VideoAsset
from app.schemas.tasks import CreateTaskRequest, TaskResponse, TaskStatusResponse
from app.schemas.common import ResponseModel
from app.services.task_service import TaskService
from app.api.dependencies import get_current_user
from typing import Optional

router = APIRouter(prefix="/api/v1/tasks", tags=["任务"])


@router.post("/create", response_model=ResponseModel)
async def create_task(
    req: CreateTaskRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    创建视频生成任务（文生+图生）
    
    **需要登录**：是
    
    **业务流程**：
    1. 计算费用（10秒=10积分，15秒=15积分，25秒=25积分）
    2. 预扣积分
    3. 调用供应商API
    4. 创建任务记录
    5. 返回任务ID
    
    **请求示例（文生视频）**：
    ```json
    {
        "prompt": "一只猫在草地上奔跑",
        "duration_sec": 10,
        "ratio": "9:16"
    }
    ```
    
    **请求示例（图生视频）**：
    ```json
    {
        "prompt": "让这张图动起来",
        "duration_sec": 10,
        "ratio": "9:16",
        "reference_image_asset_id": 123
    }
    ```
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "任务创建成功",
        "data": {
            "task_id": 1001,
            "status": "QUEUED",
            "cost_credits": 10
        }
    }
    ```
    """
    service = TaskService(db)
    
    try:
        task = await service.create_task(
            user_id=current_user.user_id,
            prompt=req.prompt,
            duration_sec=req.duration_sec,
            ratio=req.ratio,
            reference_image_asset_id=req.reference_image_asset_id,
            project_id=req.project_id,
            model=req.model
        )
        
        task_data = TaskResponse.model_validate(task)
        
        return ResponseModel(
            code=200,
            message="任务创建成功",
            data=task_data
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建任务失败: {str(e)}")


@router.get("/{task_id}", response_model=ResponseModel)
async def get_task_status(
    task_id: int,
    background_tasks: BackgroundTasks,
    request: Request,
    token: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    查询任务状态（自动同步供应商状态）
    
    **需要登录**：是
    
    **功能**：
    - 自动查询供应商API获取最新状态
    - 任务成功后自动创建视频资产
    - 任务失败后自动退回积分
    
    **任务状态**：
    - `QUEUED` - 排队中
    - `IN_PROGRESS` - 生成中
    - `SUCCESS` - 成功（返回video_id）
    - `FAILURE` - 失败（返回错误信息）
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "success",
        "data": {
            "task_id": 1001,
            "status": "SUCCESS",
            "progress": 100,
            "video_id": 5001
        }
    }
    ```
    """
    # 手动鉴权：兼容 Header 或 Query Token
    from app.core.security import get_current_user_from_token
    auth_header = request.headers.get("Authorization")
    current_user = None
    if auth_header and auth_header.startswith("Bearer "):
        try:
            current_user = await get_current_user_from_token(auth_header.split(" ")[1], db)
        except:
            pass
    if not current_user and token:
        try:
            current_user = await get_current_user_from_token(token, db)
        except:
            pass
    if not current_user:
        raise HTTPException(status_code=401, detail="未认证")
    
    service = TaskService(db)
    
    try:
        task = await service.get_task_status(task_id, current_user.user_id, background_tasks)
        
        # 获取视频URL
        video_url = None
        if task.video_id:
            video_asset = db.query(VideoAsset).filter(VideoAsset.video_id == task.video_id).first()
            if video_asset:
                video_url = video_asset.watermarked_play_url
        elif hasattr(task, "video_url") and task.video_url:
             # 如果 task 对象上已经挂载了 video_url (由 TaskService 填充)
             video_url = task.video_url
        
        task_status = TaskStatusResponse(
            task_id=task.task_id,
            status=task.status,
            progress=task.progress,
            video_id=task.video_id,
            video_url=video_url,
            error_message=task.error_message
        )
        
        return ResponseModel(code=200, message="success", data=task_status)
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"查询失败: {str(e)}")


@router.get("", response_model=ResponseModel)
async def list_tasks(
    status: Optional[str] = Query(None, description="过滤状态"),
    cursor: Optional[int] = Query(None, description="游标（task_id）"),
    limit: int = Query(20, ge=1, le=100, description="每页数量"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取任务列表
    
    **需要登录**：是
    
    **分页方式**：游标分页
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "success",
        "data": {
            "items": [...],
            "has_more": true,
            "next_cursor": 999
        }
    }
    ```
    """
    service = TaskService(db)
    
    tasks = service.list_tasks(
        user_id=current_user.user_id,
        status=status,
        limit=limit,
        cursor=cursor
    )
    
    # 批量获取视频URL
    task_items = []
    for task in tasks:
        item = TaskResponse.model_validate(task)
        if task.video_id:
            video_asset = db.query(VideoAsset).filter(VideoAsset.video_id == task.video_id).first()
            if video_asset:
                item.video_url = video_asset.watermarked_play_url
        task_items.append(item)
    
    has_more = len(task_items) == limit
    next_cursor = task_items[-1].task_id if has_more and task_items else None
    
    return ResponseModel(
        code=200,
        message="success",
        data={
            "items": task_items,
            "has_more": has_more,
            "next_cursor": next_cursor
        }
    )
