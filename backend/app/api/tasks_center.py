"""
任务中心接口
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.schemas.tasks_center import DailyTaskResponse, TaskDefinitionResponse
from app.schemas.common import ResponseModel
from app.services.task_center_service import TaskCenterService
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/api/v1/tasks_center", tags=["任务中心"])


@router.get("/today", response_model=ResponseModel)
async def get_today_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取今日任务列表
    
    **需要登录**：是
    
    **功能**：
    - 返回今天的3个任务
    - 如果今天还没分配，自动分配
    - 任务包含：1个活跃类 + 1个创作类 + 1个社交类
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "success",
        "data": {
            "items": [
                {
                    "assignment_id": 1,
                    "task_key": "login_daily",
                    "status": "completed",
                    "title": "每日登录",
                    "description": "每天登录即可领取2积分",
                    "reward_credits": 2,
                    "category": "active"
                },
                {
                    "assignment_id": 2,
                    "task_key": "gen_success",
                    "status": "pending",
                    "title": "生成视频",
                    "description": "成功生成1个视频",
                    "reward_credits": 2,
                    "category": "create"
                },
                {
                    "assignment_id": 3,
                    "task_key": "like_work",
                    "status": "pending",
                    "title": "点赞作品",
                    "description": "给其他用户的作品点赞",
                    "reward_credits": 2,
                    "category": "social"
                }
            ]
        }
    }
    ```
    
    **任务状态**：
    - pending：待完成
    - completed：已完成，待领取
    - claimed：已领取
    """
    service = TaskCenterService(db)
    
    tasks = service.get_today_tasks(current_user.user_id)
    
    items = []
    for task_data in tasks:
        assignment = task_data["assignment"]
        definition = task_data["definition"]
        
        item = DailyTaskResponse.model_validate(assignment)
        item.title = definition.title
        item.description = definition.description
        item.reward_credits = definition.reward_credits
        item.category = definition.category
        
        items.append(item)
    
    return ResponseModel(
        code=200,
        message="success",
        data={"items": items}
    )


@router.post("/{task_key}/claim", response_model=ResponseModel)
async def claim_task_reward(
    task_key: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    领取任务奖励
    
    **需要登录**：是
    
    **功能**：
    - 检查任务是否已完成
    - 发放2积分
    - 更新任务状态为claimed
    
    **请求示例**：
    ```
    POST /api/v1/tasks_center/login_daily/claim
    ```
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "领取成功，获得2积分",
        "data": {
            "assignment_id": 1,
            "task_key": "login_daily",
            "status": "claimed",
            "claimed_at": "2025-12-25T10:00:00"
        }
    }
    ```
    
    **错误示例**：
    ```json
    {
        "detail": "任务尚未完成"
    }
    ```
    ```json
    {
        "detail": "奖励已领取"
    }
    ```
    
    **业务规则**：
    1. 任务必须是completed状态
    2. 每个任务只能领取一次
    3. 领取后发放2积分
    """
    service = TaskCenterService(db)
    
    try:
        assignment = service.claim_task_reward(
            user_id=current_user.user_id,
            task_key=task_key
        )
        
        # 获取任务定义
        from app.db.models import TaskDefinition
        task_def = db.query(TaskDefinition).filter(
            TaskDefinition.task_key == task_key
        ).first()
        
        reward_credits = task_def.reward_credits if task_def else 2
        
        assignment_data = DailyTaskResponse.model_validate(assignment)
        
        return ResponseModel(
            code=200,
            message=f"领取成功，获得{reward_credits}积分",
            data=assignment_data
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{task_key}/complete", response_model=ResponseModel)
async def complete_task(
    task_key: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    完成任务（手动标记，用于测试）
    
    **需要登录**：是
    
    **功能**：
    - 将任务状态从pending改为completed
    - 实际业务中应该由事件触发（如登录、生成成功等）
    
    **请求示例**：
    ```
    POST /api/v1/tasks_center/login_daily/complete
    ```
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "任务已完成",
        "data": {
            "assignment_id": 1,
            "task_key": "login_daily",
            "status": "completed"
        }
    }
    ```
    """
    service = TaskCenterService(db)
    
    try:
        assignment = service.complete_task(
            user_id=current_user.user_id,
            task_key=task_key
        )
        
        assignment_data = DailyTaskResponse.model_validate(assignment)
        
        return ResponseModel(
            code=200,
            message="任务已完成",
            data=assignment_data
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
