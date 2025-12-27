"""
任务中心相关Schema
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date


class TaskDefinitionResponse(BaseModel):
    """任务定义响应"""
    task_def_id: int
    task_key: str
    title: str
    description: Optional[str] = None
    reward_credits: int
    category: str  # active/create/social
    
    class Config:
        from_attributes = True


class DailyTaskResponse(BaseModel):
    """每日任务响应"""
    assignment_id: int
    user_id: int
    task_key: str
    assign_date: date
    status: str  # pending/completed/claimed
    
    # 扩展字段（从task_definition关联）
    title: Optional[str] = None
    description: Optional[str] = None
    reward_credits: Optional[int] = None
    category: Optional[str] = None
    
    completed_at: Optional[datetime] = None
    claimed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
