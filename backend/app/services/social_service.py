"""
社交服务层（关注系统）
"""
from sqlalchemy.orm import Session
from app.db.models import Follow, UserStats


class SocialService:
    def __init__(self, db: Session):
        self.db = db
    
    def follow_user(self, follower_user_id: int, following_user_id: int) -> bool:
        """
        关注用户
        
        Args:
            follower_user_id: 关注者ID
            following_user_id: 被关注者ID
        
        Returns:
            是否成功
        """
        # 不能关注自己
        if follower_user_id == following_user_id:
            raise ValueError("不能关注自己")
        
        # 检查是否已关注
        existing = self.db.query(Follow).filter(
            Follow.follower_user_id == follower_user_id,
            Follow.following_user_id == following_user_id
        ).first()
        
        if existing:
            raise ValueError("已经关注过了")
        
        # 创建关注记录
        follow = Follow(
            follower_user_id=follower_user_id,
            following_user_id=following_user_id
        )
        
        self.db.add(follow)
        
        # 更新统计
        # follower的关注数+1
        follower_stats = self.db.query(UserStats).filter(
            UserStats.user_id == follower_user_id
        ).first()
        if follower_stats:
            follower_stats.total_following += 1
        
        # following的粉丝数+1
        following_stats = self.db.query(UserStats).filter(
            UserStats.user_id == following_user_id
        ).first()
        if following_stats:
            following_stats.total_followers += 1
        
        self.db.commit()
        
        return True
    
    def unfollow_user(self, follower_user_id: int, following_user_id: int) -> bool:
        """
        取消关注
        
        Args:
            follower_user_id: 关注者ID
            following_user_id: 被关注者ID
        
        Returns:
            是否成功
        """
        follow = self.db.query(Follow).filter(
            Follow.follower_user_id == follower_user_id,
            Follow.following_user_id == following_user_id
        ).first()
        
        if not follow:
            raise ValueError("未关注过")
        
        # 删除关注记录
        self.db.delete(follow)
        
        # 更新统计
        follower_stats = self.db.query(UserStats).filter(
            UserStats.user_id == follower_user_id
        ).first()
        if follower_stats:
            follower_stats.total_following = max(0, follower_stats.total_following - 1)
        
        following_stats = self.db.query(UserStats).filter(
            UserStats.user_id == following_user_id
        ).first()
        if following_stats:
            following_stats.total_followers = max(0, following_stats.total_followers - 1)
        
        self.db.commit()
        
        return True
    
    def is_following(self, follower_user_id: int, following_user_id: int) -> bool:
        """
        检查是否关注
        
        Args:
            follower_user_id: 关注者ID
            following_user_id: 被关注者ID
        
        Returns:
            是否关注
        """
        follow = self.db.query(Follow).filter(
            Follow.follower_user_id == follower_user_id,
            Follow.following_user_id == following_user_id
        ).first()
        
        return follow is not None
    
    def list_followers(
        self,
        user_id: int,
        limit: int = 20,
        cursor: int = None
    ) -> list:
        """
        获取粉丝列表
        
        Args:
            user_id: 用户ID
            limit: 每页数量
            cursor: 游标
        
        Returns:
            Follow列表
        """
        query = self.db.query(Follow).filter(
            Follow.following_user_id == user_id
        )
        
        if cursor:
            query = query.filter(Follow.follow_id < cursor)
        
        follows = query.order_by(Follow.follow_id.desc()).limit(limit).all()
        return follows
    
    def list_following(
        self,
        user_id: int,
        limit: int = 20,
        cursor: int = None
    ) -> list:
        """
        获取关注列表
        
        Args:
            user_id: 用户ID
            limit: 每页数量
            cursor: 游标
        
        Returns:
            Follow列表
        """
        query = self.db.query(Follow).filter(
            Follow.follower_user_id == user_id
        )
        
        if cursor:
            query = query.filter(Follow.follow_id < cursor)
        
        follows = query.order_by(Follow.follow_id.desc()).limit(limit).all()
        return follows
