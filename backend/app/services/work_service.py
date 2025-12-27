"""
作品服务层
"""
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional
from app.db.models import (
    Work, WorkLike, WorkComment, WorkCollection, WorkTip, PromptUnlock,
    VideoAsset, User, UserStats, Task
)
from app.services.wallet_service import WalletService
from app.core.constants import TIP_AMOUNTS, PLATFORM_FEE_RATES, CREDIT_TO_YUAN, FREEZE_DAYS


class WorkService:
    def __init__(self, db: Session):
        self.db = db
        self.wallet_service = WalletService(db)
    
    def publish_work(
        self,
        user_id: int,
        video_id: int,
        title: Optional[str] = None,
        description: Optional[str] = None,
        is_prompt_public: bool = False,
        prompt_unlock_cost: int = 5,
        allow_remix: bool = True
    ) -> Work:
        """
        发布作品
        
        Args:
            user_id: 用户ID
            video_id: 视频资产ID
            title: 标题
            description: 描述
            is_prompt_public: 是否公开提示词
            prompt_unlock_cost: 提示词解锁费用
            allow_remix: 是否允许二创
        
        Returns:
            Work对象
        """
        # 1. 校验视频归属
        video = self.db.query(VideoAsset).filter(
            VideoAsset.video_id == video_id,
            VideoAsset.user_id == user_id
        ).first()
        
        if not video:
            raise ValueError("视频不存在或无权发布")
        
        # 2. 获取提示词（从关联的Task）
        task = self.db.query(Task).filter(
            Task.task_id == video.task_id
        ).first()
        
        if not task:
            raise ValueError("无法获取生成提示词")
        
        # 3. 创建作品
        work = Work(
            user_id=user_id,
            video_id=video_id,
            title=title,
            description=description,
            prompt=task.prompt_final or task.prompt,
            is_prompt_public=is_prompt_public,
            prompt_unlock_cost=prompt_unlock_cost,
            allow_remix=allow_remix,
            status="published",
            published_at=datetime.utcnow()
        )
        
        self.db.add(work)
        self.db.flush()
        
        # 4. 更新用户统计
        stats = self.db.query(UserStats).filter(
            UserStats.user_id == user_id
        ).first()
        if stats:
            stats.total_works_published += 1
        
        self.db.commit()
        self.db.refresh(work)
        
        return work
    
    def get_work(self, work_id: int, viewer_user_id: Optional[int] = None) -> Work:
        """
        获取作品详情（增加浏览量）
        
        Args:
            work_id: 作品ID
            viewer_user_id: 查看者ID
        
        Returns:
            Work对象
        """
        work = self.db.query(Work).filter(
            Work.work_id == work_id,
            Work.status == "published"
        ).first()
        
        if not work:
            raise ValueError("作品不存在")
        
        # 增加浏览量
        work.view_count += 1
        self.db.commit()
        
        return work
    
    def list_feed(
        self,
        feed_type: str = "discover",
        user_id: Optional[int] = None,
        limit: int = 20,
        cursor: Optional[int] = None
    ) -> list:
        """
        获取Feed流
        
        Args:
            feed_type: 类型（discover/hot/following）
            user_id: 用户ID（following时必需）
            limit: 每页数量
            cursor: 游标
        
        Returns:
            作品列表
        """
        query = self.db.query(Work).filter(Work.status == "published")
        
        if feed_type == "following":
            # 关注的人的作品
            if not user_id:
                raise ValueError("following feed需要user_id")
            
            from app.db.models import Follow
            following_ids = self.db.query(Follow.following_user_id).filter(
                Follow.follower_user_id == user_id
            ).all()
            following_ids = [fid[0] for fid in following_ids]
            
            query = query.filter(Work.user_id.in_(following_ids))
            query = query.order_by(Work.published_at.desc())
        
        elif feed_type == "hot":
            # 热门：按点赞数排序
            query = query.order_by(Work.like_count.desc(), Work.published_at.desc())
        
        else:  # discover
            # 发现：最新发布
            query = query.order_by(Work.published_at.desc())
        
        if cursor:
            query = query.filter(Work.work_id < cursor)
        
        works = query.limit(limit).all()
        return works

    def get_user_works(
        self,
        user_id: int,
        limit: int = 20,
        cursor: Optional[int] = None
    ) -> list:
        """
        获取指定用户的作品列表
        
        Args:
            user_id: 用户ID
            limit: 每页数量
            cursor: 游标
        
        Returns:
            作品列表
        """
        query = self.db.query(Work).filter(
            Work.user_id == user_id,
            Work.status == "published"
        )
        
        if cursor:
            query = query.filter(Work.work_id < cursor)
        
        query = query.order_by(Work.published_at.desc())
        works = query.limit(limit).all()
        return works
    
    def like_work(self, work_id: int, user_id: int) -> bool:
        """
        点赞作品
        
        Args:
            work_id: 作品ID
            user_id: 用户ID
        
        Returns:
            是否成功
        """
        # 检查是否已点赞
        existing = self.db.query(WorkLike).filter(
            WorkLike.work_id == work_id,
            WorkLike.user_id == user_id
        ).first()
        
        if existing:
            raise ValueError("已经点赞过了")
        
        # 创建点赞记录
        like = WorkLike(work_id=work_id, user_id=user_id)
        self.db.add(like)
        
        # 更新作品点赞数
        work = self.db.query(Work).filter(Work.work_id == work_id).first()
        if work:
            work.like_count += 1
            
            # 更新创作者统计
            stats = self.db.query(UserStats).filter(
                UserStats.user_id == work.user_id
            ).first()
            if stats:
                stats.total_likes_received += 1
        
        self.db.commit()
        return True
    
    def unlike_work(self, work_id: int, user_id: int) -> bool:
        """
        取消点赞
        
        Args:
            work_id: 作品ID
            user_id: 用户ID
        
        Returns:
            是否成功
        """
        like = self.db.query(WorkLike).filter(
            WorkLike.work_id == work_id,
            WorkLike.user_id == user_id
        ).first()
        
        if not like:
            raise ValueError("未点赞过")
        
        # 删除点赞记录
        self.db.delete(like)
        
        # 更新作品点赞数
        work = self.db.query(Work).filter(Work.work_id == work_id).first()
        if work:
            work.like_count = max(0, work.like_count - 1)
            
            # 更新创作者统计
            stats = self.db.query(UserStats).filter(
                UserStats.user_id == work.user_id
            ).first()
            if stats:
                stats.total_likes_received = max(0, stats.total_likes_received - 1)
        
        self.db.commit()
        return True
    
    def collect_work(self, work_id: int, user_id: int) -> bool:
        """
        收藏作品
        
        Args:
            work_id: 作品ID
            user_id: 用户ID
        
        Returns:
            是否成功
        """
        # 检查是否已收藏
        existing = self.db.query(WorkCollection).filter(
            WorkCollection.work_id == work_id,
            WorkCollection.user_id == user_id
        ).first()
        
        if existing:
            raise ValueError("已经收藏过了")
        
        # 创建收藏记录
        collection = WorkCollection(work_id=work_id, user_id=user_id)
        self.db.add(collection)
        
        # 更新作品收藏数
        work = self.db.query(Work).filter(Work.work_id == work_id).first()
        if work:
            work.collect_count += 1
        
        self.db.commit()
        return True
    
    def uncollect_work(self, work_id: int, user_id: int) -> bool:
        """
        取消收藏
        
        Args:
            work_id: 作品ID
            user_id: 用户ID
        
        Returns:
            是否成功
        """
        collection = self.db.query(WorkCollection).filter(
            WorkCollection.work_id == work_id,
            WorkCollection.user_id == user_id
        ).first()
        
        if not collection:
            raise ValueError("未收藏过")
        
        # 删除收藏记录
        self.db.delete(collection)
        
        # 更新作品收藏数
        work = self.db.query(Work).filter(Work.work_id == work_id).first()
        if work:
            work.collect_count = max(0, work.collect_count - 1)
        
        self.db.commit()
        return True
    
    def create_comment(
        self,
        work_id: int,
        user_id: int,
        content: str,
        parent_comment_id: Optional[int] = None
    ) -> WorkComment:
        """
        发表评论
        
        Args:
            work_id: 作品ID
            user_id: 用户ID
            content: 评论内容
            parent_comment_id: 父评论ID（回复）
        
        Returns:
            WorkComment对象
        """
        # 创建评论
        comment = WorkComment(
            work_id=work_id,
            user_id=user_id,
            content=content,
            parent_comment_id=parent_comment_id
        )
        
        self.db.add(comment)
        self.db.flush()
        
        # 更新作品评论数
        work = self.db.query(Work).filter(Work.work_id == work_id).first()
        if work:
            work.comment_count += 1
        
        self.db.commit()
        self.db.refresh(comment)
        
        return comment
    
    def list_comments(
        self,
        work_id: int,
        limit: int = 20,
        cursor: Optional[int] = None
    ) -> list:
        """
        获取评论列表
        
        Args:
            work_id: 作品ID
            limit: 每页数量
            cursor: 游标
        
        Returns:
            评论列表
        """
        query = self.db.query(WorkComment).filter(
            WorkComment.work_id == work_id,
            WorkComment.parent_comment_id == None  # 只返回一级评论
        )
        
        if cursor:
            query = query.filter(WorkComment.comment_id < cursor)
        
        comments = query.order_by(WorkComment.comment_id.desc()).limit(limit).all()
        return comments
    
    def tip_work(
        self,
        work_id: int,
        tipper_user_id: int,
        amount_credits: int
    ) -> WorkTip:
        """
        打赏作品
        
        业务流程：
        1. 校验打赏金额（10/20/50/100）
        2. 扣除打赏者积分
        3. 计算平台抽成（10%）
        4. 给创作者发放金币（冻结7天）
        5. 记录打赏流水
        
        Args:
            work_id: 作品ID
            tipper_user_id: 打赏者ID
            amount_credits: 打赏积分
        
        Returns:
            WorkTip对象
        """
        # 1. 校验打赏金额
        if amount_credits not in TIP_AMOUNTS:
            raise ValueError(f"打赏金额必须是{TIP_AMOUNTS}之一")
        
        # 2. 获取作品和创作者
        work = self.db.query(Work).filter(Work.work_id == work_id).first()
        if not work:
            raise ValueError("作品不存在")
        
        creator_user_id = work.user_id
        
        # 不能打赏自己
        if tipper_user_id == creator_user_id:
            raise ValueError("不能打赏自己的作品")
        
        # 3. 扣除打赏者积分
        try:
            self.wallet_service.deduct_credits(
                user_id=tipper_user_id,
                amount=amount_credits,
                type="tip_spend",
                ref_type="work",
                ref_id=work_id,
                description=f"打赏作品#{work_id}"
            )
        except ValueError as e:
            raise ValueError(f"积分不足：{e}")
        
        # 4. 计算金额
        amount_yuan = amount_credits * CREDIT_TO_YUAN  # 积分转人民币
        platform_fee_rate = PLATFORM_FEE_RATES["creator_tip"]
        platform_fee = Decimal(str(amount_yuan)) * Decimal(str(platform_fee_rate))
        creator_income = Decimal(str(amount_yuan)) - platform_fee
        
        # 5. 给创作者发放金币（冻结7天）
        from app.db.models import CoinWallet, CoinLedger
        
        coin_wallet = self.db.query(CoinWallet).filter(
            CoinWallet.user_id == creator_user_id
        ).first()
        
        if coin_wallet:
            coin_wallet.pending_coins += creator_income
            
            # 记录流水
            unlock_at = datetime.utcnow() + timedelta(days=FREEZE_DAYS)
            ledger = CoinLedger(
                user_id=creator_user_id,
                type="creator_tip_income",
                amount_coins=creator_income,
                balance_after=coin_wallet.balance_coins + coin_wallet.pending_coins,
                source_user_id=tipper_user_id,
                ref_type="work",
                ref_id=work_id,
                status="pending",
                unlock_at=unlock_at,
                description=f"打赏收入（{amount_credits}积分）"
            )
            self.db.add(ledger)
        
        # 6. 创建打赏记录
        tip = WorkTip(
            work_id=work_id,
            creator_user_id=creator_user_id,
            tipper_user_id=tipper_user_id,
            amount_credits=amount_credits,
            amount_coins=creator_income,
            platform_fee=platform_fee
        )
        
        self.db.add(tip)
        self.db.flush()
        
        # 7. 更新作品统计
        work.tip_count += 1
        work.total_tip_income += creator_income
        
        self.db.commit()
        self.db.refresh(tip)
        
        return tip
    
    def unlock_prompt(self, work_id: int, unlocking_user_id: int) -> dict:
        """
        解锁提示词
        
        业务流程：
        1. 检查是否已解锁
        2. 扣除解锁者积分
        3. 计算平台抽成（10%）
        4. 给创作者发放金币（冻结7天）
        5. 返回提示词
        
        Args:
            work_id: 作品ID
            unlocking_user_id: 解锁者ID
        
        Returns:
            包含prompt的字典
        """
        # 1. 检查是否已解锁
        existing = self.db.query(PromptUnlock).filter(
            PromptUnlock.work_id == work_id,
            PromptUnlock.unlocking_user_id == unlocking_user_id
        ).first()
        
        if existing:
            # 已解锁，直接返回
            work = self.db.query(Work).filter(Work.work_id == work_id).first()
            return {"prompt": work.prompt, "already_unlocked": True}
        
        # 2. 获取作品
        work = self.db.query(Work).filter(Work.work_id == work_id).first()
        if not work:
            raise ValueError("作品不存在")
        
        # 如果提示词是公开的，不需要解锁
        if work.is_prompt_public:
            return {"prompt": work.prompt, "already_unlocked": True}
        
        # 不能解锁自己的
        if unlocking_user_id == work.user_id:
            return {"prompt": work.prompt, "already_unlocked": True}
        
        cost_credits = work.prompt_unlock_cost
        creator_user_id = work.user_id
        
        # 3. 扣除积分
        try:
            self.wallet_service.deduct_credits(
                user_id=unlocking_user_id,
                amount=cost_credits,
                type="prompt_unlock_spend",
                ref_type="work",
                ref_id=work_id,
                description=f"解锁提示词#{work_id}"
            )
        except ValueError as e:
            raise ValueError(f"积分不足：{e}")
        
        # 4. 计算金额
        amount_yuan = cost_credits * CREDIT_TO_YUAN
        platform_fee_rate = PLATFORM_FEE_RATES["creator_prompt"]
        platform_fee = Decimal(str(amount_yuan)) * Decimal(str(platform_fee_rate))
        creator_income = Decimal(str(amount_yuan)) - platform_fee
        
        # 5. 给创作者发放金币（冻结7天）
        from app.db.models import CoinWallet, CoinLedger
        
        coin_wallet = self.db.query(CoinWallet).filter(
            CoinWallet.user_id == creator_user_id
        ).first()
        
        if coin_wallet:
            coin_wallet.pending_coins += creator_income
            
            unlock_at = datetime.utcnow() + timedelta(days=FREEZE_DAYS)
            ledger = CoinLedger(
                user_id=creator_user_id,
                type="creator_prompt_income",
                amount_coins=creator_income,
                balance_after=coin_wallet.balance_coins + coin_wallet.pending_coins,
                source_user_id=unlocking_user_id,
                ref_type="work",
                ref_id=work_id,
                status="pending",
                unlock_at=unlock_at,
                description=f"提示词解锁收入（{cost_credits}积分）"
            )
            self.db.add(ledger)
        
        # 6. 创建解锁记录
        unlock = PromptUnlock(
            work_id=work_id,
            creator_user_id=creator_user_id,
            unlocking_user_id=unlocking_user_id,
            cost_credits=cost_credits,
            income_coins=creator_income,
            platform_fee=platform_fee
        )
        
        self.db.add(unlock)
        self.db.flush()
        
        # 7. 更新作品统计
        work.prompt_unlock_count += 1
        work.total_prompt_income += creator_income
        
        self.db.commit()
        
        return {"prompt": work.prompt, "already_unlocked": False}
