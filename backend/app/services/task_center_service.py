"""
任务中心服务层
"""
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.db.models import (
    TaskDefinition, DailyTaskAssignment, User
)
from app.services.wallet_service import WalletService
import random


class TaskCenterService:
    def __init__(self, db: Session):
        self.db = db
        self.wallet_service = WalletService(db)
    
    def assign_daily_tasks(self, user_id: int, assign_date: date = None) -> List[DailyTaskAssignment]:
        """
        为用户分配每日任务
        
        Args:
            user_id: 用户ID
            assign_date: 分配日期（默认今天）
        
        Returns:
            DailyTaskAssignment列表
        """
        if assign_date is None:
            assign_date = date.today()
        
        # 检查今天是否已分配
        existing = self.db.query(DailyTaskAssignment).filter(
            DailyTaskAssignment.user_id == user_id,
            DailyTaskAssignment.assign_date == assign_date
        ).first()
        
        if existing:
            # 已分配，返回现有任务
            return self.get_today_tasks(user_id, assign_date)
        
        # 获取所有活跃任务定义
        active_tasks = self.db.query(TaskDefinition).filter(
            TaskDefinition.is_active == True
        ).all()
        
        # 按类别分组
        tasks_by_category = {}
        for task in active_tasks:
            if task.category not in tasks_by_category:
                tasks_by_category[task.category] = []
            tasks_by_category[task.category].append(task)
        
        # 分配3个任务
        selected_tasks = []
        
        # 1. 活跃类（login_daily固定）
        active_tasks = tasks_by_category.get("active", [])
        login_task = next((t for t in active_tasks if t.task_key == "login_daily"), None)
        if login_task:
            selected_tasks.append(login_task)
        
        # 2. 创作类（随机1个）
        create_tasks = tasks_by_category.get("create", [])
        if create_tasks:
            selected_tasks.append(random.choice(create_tasks))
        
        # 3. 社交类（随机1个）
        social_tasks = tasks_by_category.get("social", [])
        if social_tasks:
            selected_tasks.append(random.choice(social_tasks))
        
        # 创建分配记录
        assignments = []
        for task in selected_tasks:
            assignment = DailyTaskAssignment(
                user_id=user_id,
                task_key=task.task_key,
                assign_date=assign_date,
                status="pending"
            )
            self.db.add(assignment)
            assignments.append(assignment)
        
        self.db.commit()
        
        return assignments
    
    def get_today_tasks(self, user_id: int, assign_date: date = None) -> List[dict]:
        """
        获取今日任务列表
        
        Args:
            user_id: 用户ID
            assign_date: 日期（默认今天）
        
        Returns:
            任务列表（带任务定义信息）
        """
        if assign_date is None:
            assign_date = date.today()
        
        # 获取任务分配
        assignments = self.db.query(DailyTaskAssignment).filter(
            DailyTaskAssignment.user_id == user_id,
            DailyTaskAssignment.assign_date == assign_date
        ).all()
        
        # 如果没有任务，自动分配
        if not assignments:
            assignments = self.assign_daily_tasks(user_id, assign_date)
        
        # 关联任务定义
        result = []
        for assignment in assignments:
            task_def = self.db.query(TaskDefinition).filter(
                TaskDefinition.task_key == assignment.task_key
            ).first()
            
            if task_def:
                result.append({
                    "assignment": assignment,
                    "definition": task_def
                })
        
        return result
    
    def complete_task(self, user_id: int, task_key: str) -> DailyTaskAssignment:
        """
        完成任务（标记为已完成）
        
        Args:
            user_id: 用户ID
            task_key: 任务key
        
        Returns:
            DailyTaskAssignment对象
        """
        today = date.today()
        
        assignment = self.db.query(DailyTaskAssignment).filter(
            DailyTaskAssignment.user_id == user_id,
            DailyTaskAssignment.task_key == task_key,
            DailyTaskAssignment.assign_date == today
        ).first()
        
        if not assignment:
            raise ValueError("任务不存在")
        
        if assignment.status != "pending":
            # 已完成或已领取
            return assignment
        
        from datetime import datetime
        assignment.status = "completed"
        assignment.completed_at = datetime.now()
        
        self.db.commit()
        self.db.refresh(assignment)
        
        return assignment
    
    def claim_task_reward(self, user_id: int, task_key: str) -> DailyTaskAssignment:
        """
        领取任务奖励
        
        Args:
            user_id: 用户ID
            task_key: 任务key
        
        Returns:
            DailyTaskAssignment对象
        """
        today = date.today()
        
        # 获取任务分配
        assignment = self.db.query(DailyTaskAssignment).filter(
            DailyTaskAssignment.user_id == user_id,
            DailyTaskAssignment.task_key == task_key,
            DailyTaskAssignment.assign_date == today
        ).first()
        
        if not assignment:
            raise ValueError("任务不存在")
        
        if assignment.status != "completed":
            raise ValueError("任务尚未完成")
        
        if assignment.status == "claimed":
            raise ValueError("奖励已领取")
        
        # 获取任务定义
        task_def = self.db.query(TaskDefinition).filter(
            TaskDefinition.task_key == task_key
        ).first()
        
        if not task_def:
            raise ValueError("任务定义不存在")
        
        # 发放积分
        self.wallet_service.add_credits(
            user_id=user_id,
            amount=task_def.reward_credits,
            type="task_reward",  # 添加必需的 type 参数
            ref_type="task",
            ref_id=assignment.assignment_id,
            description=f"完成任务：{task_def.title}"
        )
        
        # 更新任务状态
        from datetime import datetime
        assignment.status = "claimed"
        assignment.claimed_at = datetime.now()
        
        self.db.commit()
        self.db.refresh(assignment)
        
        return assignment