"""
故事版接口
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.schemas.storyboards import (
    CreateStoryboardRequest, UpdateStoryboardRequest, UpdateShotOrderRequest,
    StoryboardResponse, ShotResponse, ShotRequest, BatchGenerateRequest
)
from app.schemas.common import ResponseModel
from app.services.storyboard_service import StoryboardService
from app.api.dependencies import get_current_user
from typing import Optional

router = APIRouter(prefix="/api/v1/storyboards", tags=["故事版"])


@router.post("/create", response_model=ResponseModel)
async def create_storyboard(
    req: CreateStoryboardRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    创建故事版
    
    **需要登录**：是
    
    **功能**：
    - 创建8个镜头的故事版
    - 每个镜头可单独设置参数
    - 自动保存镜头排序
    
    **请求示例**：
    ```json
    {
        "topic_prompt": "一个猫咪的一天",
        "project_id": 1,
        "global_role_id": null,
        "shots": [
            {
                "prompt": "早晨，猫咪从床上醒来，伸懒腰",
                "duration_sec": 10,
                "shot_size": "中景",
                "camera_move": "静止"
            },
            {
                "prompt": "猫咪跳下床，走向厨房",
                "duration_sec": 10,
                "shot_size": "全景",
                "camera_move": "跟拍"
            }
        ]
    }
    ```
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "创建成功",
        "data": {
            "storyboard_id": 1,
            "user_id": 1,
            "topic_prompt": "一个猫咪的一天",
            "shot_order": [1, 2],
            "shots": [...]
        }
    }
    ```
    """
    service = StoryboardService(db)
    
    try:
        # 转换shots为dict列表
        shots_data = [shot.model_dump() for shot in req.shots]
        
        storyboard = service.create_storyboard(
            user_id=current_user.user_id,
            topic_prompt=req.topic_prompt,
            project_id=req.project_id,
            global_role_id=req.global_role_id,
            shots_data=shots_data
        )
        
        # 获取镜头列表
        shots = service.get_shots(storyboard.storyboard_id)
        
        storyboard_data = StoryboardResponse.model_validate(storyboard)
        storyboard_data.shots = [ShotResponse.model_validate(shot) for shot in shots]
        
        return ResponseModel(code=200, message="创建成功", data=storyboard_data)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{storyboard_id}", response_model=ResponseModel)
async def get_storyboard(
    storyboard_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取故事版详情
    
    **需要登录**：是
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "success",
        "data": {
            "storyboard_id": 1,
            "topic_prompt": "一个猫咪的一天",
            "shot_order": [1, 2, 3],
            "shots": [...]
        }
    }
    ```
    """
    service = StoryboardService(db)
    
    try:
        storyboard = service.get_storyboard(storyboard_id, current_user.user_id)
        shots = service.get_shots(storyboard_id)
        
        storyboard_data = StoryboardResponse.model_validate(storyboard)
        storyboard_data.shots = [ShotResponse.model_validate(shot) for shot in shots]
        
        return ResponseModel(code=200, message="success", data=storyboard_data)
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/", response_model=ResponseModel)
async def list_storyboards(
    project_id: Optional[int] = Query(None, description="项目ID（筛选）"),
    cursor: Optional[int] = Query(None, description="游标（storyboard_id）"),
    limit: int = Query(20, ge=1, le=50, description="每页数量"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取故事版列表
    
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
    service = StoryboardService(db)
    
    storyboards = service.list_storyboards(
        user_id=current_user.user_id,
        project_id=project_id,
        limit=limit,
        cursor=cursor
    )
    
    items = []
    for storyboard in storyboards:
        shots = service.get_shots(storyboard.storyboard_id)
        storyboard_data = StoryboardResponse.model_validate(storyboard)
        storyboard_data.shots = [ShotResponse.model_validate(shot) for shot in shots]
        items.append(storyboard_data)
    
    has_more = len(items) == limit
    next_cursor = items[-1].storyboard_id if has_more and items else None
    
    return ResponseModel(
        code=200,
        message="success",
        data={
            "items": items,
            "has_more": has_more,
            "next_cursor": next_cursor
        }
    )


@router.patch("/{storyboard_id}", response_model=ResponseModel)
async def update_storyboard(
    storyboard_id: int,
    req: UpdateStoryboardRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    更新故事版
    
    **需要登录**：是
    
    **请求示例**：
    ```json
    {
        "topic_prompt": "修改后的主题",
        "global_role_id": 123
    }
    ```
    """
    service = StoryboardService(db)
    
    try:
        storyboard = service.update_storyboard(
            storyboard_id=storyboard_id,
            user_id=current_user.user_id,
            topic_prompt=req.topic_prompt,
            global_role_id=req.global_role_id
        )
        
        storyboard_data = StoryboardResponse.model_validate(storyboard)
        
        return ResponseModel(code=200, message="更新成功", data=storyboard_data)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{storyboard_id}/shot_order", response_model=ResponseModel)
async def update_shot_order(
    storyboard_id: int,
    req: UpdateShotOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    更新镜头排序（拖拽排序）
    
    **需要登录**：是
    
    **请求示例**：
    ```json
    {
        "shot_order": [3, 1, 2, 4, 5]
    }
    ```
    
    **功能**：
    - 拖拽改变镜头顺序
    - 自动保存新顺序
    """
    service = StoryboardService(db)
    
    try:
        storyboard = service.update_shot_order(
            storyboard_id=storyboard_id,
            user_id=current_user.user_id,
            shot_order=req.shot_order
        )
        
        storyboard_data = StoryboardResponse.model_validate(storyboard)
        
        return ResponseModel(code=200, message="排序已更新", data=storyboard_data)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{storyboard_id}", response_model=ResponseModel)
async def delete_storyboard(
    storyboard_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    删除故事版
    
    **需要登录**：是
    """
    service = StoryboardService(db)
    
    try:
        service.delete_storyboard(storyboard_id, current_user.user_id)
        return ResponseModel(code=200, message="删除成功", data=None)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{storyboard_id}/shots", response_model=ResponseModel)
async def add_shot(
    storyboard_id: int,
    req: ShotRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    添加镜头
    
    **需要登录**：是
    
    **请求示例**：
    ```json
    {
        "prompt": "新镜头：猫咪在阳台晒太阳",
        "duration_sec": 10,
        "shot_size": "近景",
        "camera_move": "静止"
    }
    ```
    """
    service = StoryboardService(db)
    
    try:
        shot = service.add_shot(
            storyboard_id=storyboard_id,
            user_id=current_user.user_id,
            shot_data=req.model_dump()
        )
        
        shot_data = ShotResponse.model_validate(shot)
        
        return ResponseModel(code=200, message="镜头已添加", data=shot_data)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/shots/{shot_id}", response_model=ResponseModel)
async def update_shot(
    shot_id: int,
    req: ShotRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    更新镜头
    
    **需要登录**：是
    
    **请求示例**：
    ```json
    {
        "prompt": "修改后的镜头描述",
        "duration_sec": 15
    }
    ```
    """
    service = StoryboardService(db)
    
    try:
        shot = service.update_shot(
            shot_id=shot_id,
            user_id=current_user.user_id,
            shot_data=req.model_dump(exclude_unset=True)
        )
        
        shot_data = ShotResponse.model_validate(shot)
        
        return ResponseModel(code=200, message="镜头已更新", data=shot_data)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/shots/{shot_id}", response_model=ResponseModel)
async def delete_shot(
    shot_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    删除镜头
    
    **需要登录**：是
    """
    service = StoryboardService(db)
    
    try:
        service.delete_shot(shot_id, current_user.user_id)
        return ResponseModel(code=200, message="镜头已删除", data=None)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{storyboard_id}/batch_generate", response_model=ResponseModel)
async def batch_generate(
    storyboard_id: int,
    req: BatchGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    批量生成（提交所有镜头）
    
    **需要登录**：是
    
    **功能**：
    - 一次性提交所有镜头
    - 并行创建多个任务
    - 扣除总积分
    
    **业务流程**：
    1. 计算总费用（所有镜头的duration_sec之和）
    2. 扣除积分
    3. 并行创建所有任务
    4. 返回任务ID列表
    
    **请求示例**：
    ```json
    {
        "storyboard_id": 1,
        "ratio": "9:16",
        "model": "sora2"
    }
    ```
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "批量生成已提交",
        "data": {
            "task_ids": [101, 102, 103, 104, 105, 106, 107, 108],
            "total_cost_credits": 80,
            "shot_count": 8
        }
    }
    ```
    
    **费用计算**：
    - 假设8个镜头，每个10秒 → 总费用80积分
    - 假设8个镜头，每个15秒 → 总费用120积分
    """
    service = StoryboardService(db)
    
    try:
        result = service.batch_generate(
            storyboard_id=storyboard_id,
            user_id=current_user.user_id,
            ratio=req.ratio,
            model=req.model
        )
        
        return ResponseModel(
            code=200,
            message="批量生成已提交",
            data=result
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
