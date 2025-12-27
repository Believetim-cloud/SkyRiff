"""
故事版服务层
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.models import Storyboard, Shot, Task, User
from app.services.wallet_service import WalletService
from app.services.task_service import TaskService


class StoryboardService:
    def __init__(self, db: Session):
        self.db = db
        self.wallet_service = WalletService(db)
        self.task_service = TaskService(db)
    
    def create_storyboard(
        self,
        user_id: int,
        topic_prompt: Optional[str] = None,
        project_id: Optional[int] = None,
        global_role_id: Optional[int] = None,
        shots_data: List[dict] = []
    ) -> Storyboard:
        """
        创建故事版
        
        Args:
            user_id: 用户ID
            topic_prompt: 主题提示词
            project_id: 项目ID
            global_role_id: 全局角色ID
            shots_data: 镜头列表
        
        Returns:
            Storyboard对象
        """
        # 1. 创建故事版
        storyboard = Storyboard(
            user_id=user_id,
            topic_prompt=topic_prompt,
            project_id=project_id,
            global_role_id=global_role_id,
            shot_order=[]
        )
        
        self.db.add(storyboard)
        self.db.flush()
        
        # 2. 创建镜头
        shot_ids = []
        for shot_data in shots_data:
            shot = Shot(
                storyboard_id=storyboard.storyboard_id,
                prompt=shot_data['prompt'],
                duration_sec=shot_data['duration_sec'],
                shot_size=shot_data.get('shot_size'),
                camera_move=shot_data.get('camera_move'),
                role_id=shot_data.get('role_id'),
                has_role_override=shot_data.get('has_role_override', False),
                reference_image_asset_id=shot_data.get('reference_image_asset_id')
            )
            self.db.add(shot)
            self.db.flush()
            shot_ids.append(shot.shot_id)
        
        # 3. 更新镜头排序
        storyboard.shot_order = shot_ids
        
        self.db.commit()
        self.db.refresh(storyboard)
        
        return storyboard
    
    def get_storyboard(self, storyboard_id: int, user_id: Optional[int] = None) -> Storyboard:
        """
        获取故事版详情
        
        Args:
            storyboard_id: 故事版ID
            user_id: 用户ID（可选，用于权限校验）
        
        Returns:
            Storyboard对象
        """
        storyboard = self.db.query(Storyboard).filter(
            Storyboard.storyboard_id == storyboard_id
        ).first()
        
        if not storyboard:
            raise ValueError("故事版不存在")
        
        # 权限校验
        if user_id and storyboard.user_id != user_id:
            raise ValueError("无权访问此故事版")
        
        return storyboard
    
    def list_storyboards(
        self,
        user_id: int,
        project_id: Optional[int] = None,
        limit: int = 20,
        cursor: Optional[int] = None
    ) -> List[Storyboard]:
        """
        获取故事版列表
        
        Args:
            user_id: 用户ID
            project_id: 项目ID（筛选）
            limit: 每页数量
            cursor: 游标
        
        Returns:
            Storyboard列表
        """
        query = self.db.query(Storyboard).filter(
            Storyboard.user_id == user_id
        )
        
        if project_id:
            query = query.filter(Storyboard.project_id == project_id)
        
        if cursor:
            query = query.filter(Storyboard.storyboard_id < cursor)
        
        storyboards = query.order_by(
            Storyboard.storyboard_id.desc()
        ).limit(limit).all()
        
        return storyboards
    
    def update_storyboard(
        self,
        storyboard_id: int,
        user_id: int,
        topic_prompt: Optional[str] = None,
        global_role_id: Optional[int] = None
    ) -> Storyboard:
        """
        更新故事版
        
        Args:
            storyboard_id: 故事版ID
            user_id: 用户ID
            topic_prompt: 主题提示词
            global_role_id: 全局角色ID
        
        Returns:
            Storyboard对象
        """
        storyboard = self.get_storyboard(storyboard_id, user_id)
        
        if topic_prompt is not None:
            storyboard.topic_prompt = topic_prompt
        
        if global_role_id is not None:
            storyboard.global_role_id = global_role_id
        
        self.db.commit()
        self.db.refresh(storyboard)
        
        return storyboard
    
    def update_shot_order(
        self,
        storyboard_id: int,
        user_id: int,
        shot_order: List[int]
    ) -> Storyboard:
        """
        更新镜头排序
        
        Args:
            storyboard_id: 故事版ID
            user_id: 用户ID
            shot_order: 镜头ID顺序数组
        
        Returns:
            Storyboard对象
        """
        storyboard = self.get_storyboard(storyboard_id, user_id)
        
        # 校验所有shot_id都属于这个storyboard
        existing_shots = self.db.query(Shot.shot_id).filter(
            Shot.storyboard_id == storyboard_id
        ).all()
        existing_shot_ids = {shot[0] for shot in existing_shots}
        
        for shot_id in shot_order:
            if shot_id not in existing_shot_ids:
                raise ValueError(f"镜头{shot_id}不属于此故事版")
        
        # 更新排序
        storyboard.shot_order = shot_order
        
        self.db.commit()
        self.db.refresh(storyboard)
        
        return storyboard
    
    def delete_storyboard(self, storyboard_id: int, user_id: int) -> bool:
        """
        删除故事版
        
        Args:
            storyboard_id: 故事版ID
            user_id: 用户ID
        
        Returns:
            是否成功
        """
        storyboard = self.get_storyboard(storyboard_id, user_id)
        
        # 删除所有镜头（级联删除）
        self.db.query(Shot).filter(
            Shot.storyboard_id == storyboard_id
        ).delete()
        
        # 删除故事版
        self.db.delete(storyboard)
        self.db.commit()
        
        return True
    
    def add_shot(
        self,
        storyboard_id: int,
        user_id: int,
        shot_data: dict
    ) -> Shot:
        """
        添加镜头
        
        Args:
            storyboard_id: 故事版ID
            user_id: 用户ID
            shot_data: 镜头数据
        
        Returns:
            Shot对象
        """
        storyboard = self.get_storyboard(storyboard_id, user_id)
        
        # 创建镜头
        shot = Shot(
            storyboard_id=storyboard_id,
            prompt=shot_data['prompt'],
            duration_sec=shot_data['duration_sec'],
            shot_size=shot_data.get('shot_size'),
            camera_move=shot_data.get('camera_move'),
            role_id=shot_data.get('role_id'),
            has_role_override=shot_data.get('has_role_override', False),
            reference_image_asset_id=shot_data.get('reference_image_asset_id')
        )
        
        self.db.add(shot)
        self.db.flush()
        
        # 添加到排序数组末尾
        storyboard.shot_order = storyboard.shot_order + [shot.shot_id]
        
        self.db.commit()
        self.db.refresh(shot)
        
        return shot
    
    def update_shot(
        self,
        shot_id: int,
        user_id: int,
        shot_data: dict
    ) -> Shot:
        """
        更新镜头
        
        Args:
            shot_id: 镜���ID
            user_id: 用户ID
            shot_data: 镜头数据
        
        Returns:
            Shot对象
        """
        shot = self.db.query(Shot).filter(Shot.shot_id == shot_id).first()
        
        if not shot:
            raise ValueError("镜头不存在")
        
        # 校验权限
        storyboard = self.get_storyboard(shot.storyboard_id, user_id)
        
        # 更新字段
        if 'prompt' in shot_data:
            shot.prompt = shot_data['prompt']
        if 'duration_sec' in shot_data:
            shot.duration_sec = shot_data['duration_sec']
        if 'shot_size' in shot_data:
            shot.shot_size = shot_data['shot_size']
        if 'camera_move' in shot_data:
            shot.camera_move = shot_data['camera_move']
        if 'role_id' in shot_data:
            shot.role_id = shot_data['role_id']
        if 'has_role_override' in shot_data:
            shot.has_role_override = shot_data['has_role_override']
        if 'reference_image_asset_id' in shot_data:
            shot.reference_image_asset_id = shot_data['reference_image_asset_id']
        
        self.db.commit()
        self.db.refresh(shot)
        
        return shot
    
    def delete_shot(self, shot_id: int, user_id: int) -> bool:
        """
        删除镜头
        
        Args:
            shot_id: 镜头ID
            user_id: 用户ID
        
        Returns:
            是否成功
        """
        shot = self.db.query(Shot).filter(Shot.shot_id == shot_id).first()
        
        if not shot:
            raise ValueError("镜头不存在")
        
        # 校验权限
        storyboard = self.get_storyboard(shot.storyboard_id, user_id)
        
        # 从排序数组中移除
        if shot_id in storyboard.shot_order:
            storyboard.shot_order = [sid for sid in storyboard.shot_order if sid != shot_id]
        
        # 删除镜头
        self.db.delete(shot)
        self.db.commit()
        
        return True
    
    def get_shots(self, storyboard_id: int) -> List[Shot]:
        """
        获取镜头列表（按排序）
        
        Args:
            storyboard_id: 故事版ID
        
        Returns:
            Shot列表
        """
        storyboard = self.db.query(Storyboard).filter(
            Storyboard.storyboard_id == storyboard_id
        ).first()
        
        if not storyboard:
            raise ValueError("故事版不存在")
        
        # 获取所有镜头
        shots = self.db.query(Shot).filter(
            Shot.storyboard_id == storyboard_id
        ).all()
        
        # 按shot_order排序
        shot_dict = {shot.shot_id: shot for shot in shots}
        ordered_shots = []
        for shot_id in storyboard.shot_order:
            if shot_id in shot_dict:
                ordered_shots.append(shot_dict[shot_id])
        
        # 添加未在排序中的镜头（理论上不应该存在）
        for shot in shots:
            if shot.shot_id not in storyboard.shot_order:
                ordered_shots.append(shot)
        
        return ordered_shots
    
    def batch_generate(
        self,
        storyboard_id: int,
        user_id: int,
        ratio: str = "9:16",
        model: str = "sora2"
    ) -> dict:
        """
        批量生成（提交所有镜头）
        
        业务流程：
        1. 获取所有镜头
        2. 计算总费用
        3. 扣除积分
        4. 并行创建所有任务
        5. 返回任务ID列表
        
        Args:
            storyboard_id: 故事版ID
            user_id: 用户ID
            ratio: 视频比例
            model: 生成模型
        
        Returns:
            包含task_ids的字典
        """
        # 1. 获取故事版和镜头
        storyboard = self.get_storyboard(storyboard_id, user_id)
        shots = self.get_shots(storyboard_id)
        
        if not shots:
            raise ValueError("故事版没有镜头，无法生成")
        
        # 2. 计算总费用
        total_cost = sum(shot.duration_sec for shot in shots)
        
        # 3. 检查积分余额
        from app.db.models import CreditWallet
        wallet = self.db.query(CreditWallet).filter(
            CreditWallet.user_id == user_id
        ).first()
        
        if not wallet or wallet.balance_credits < total_cost:
            raise ValueError(f"积分不足：需要{total_cost}积分，当前余额{wallet.balance_credits if wallet else 0}积分")
        
        # 4. 并行创建所有任务
        task_ids = []
        for shot in shots:
            task = self.task_service.create_task(
                user_id=user_id,
                prompt=shot.prompt,
                duration_sec=shot.duration_sec,
                ratio=ratio,
                model=model,
                source_type="storyboard_shot",
                source_id=shot.shot_id,
                project_id=storyboard.project_id,
                reference_image_asset_id=shot.reference_image_asset_id
            )
            task_ids.append(task.task_id)
        
        return {
            "task_ids": task_ids,
            "total_cost_credits": total_cost,
            "shot_count": len(shots)
        }
