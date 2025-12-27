"""
月卡订阅服务层
"""
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta, date
from app.db.models import (
    Subscription, DailyRewardClaim, Product, Payment
)
from app.services.wallet_service import WalletService
from app.services.payment_service import PaymentService


class SubscriptionService:
    def __init__(self, db: Session):
        self.db = db
        self.wallet_service = WalletService(db)
        self.payment_service = PaymentService(db)
    
    def buy_subscription(
        self,
        user_id: int,
        product_id: int,
        pay_channel: str = "mock"
    ) -> dict:
        """
        购买月卡
        
        Args:
            user_id: 用户ID
            product_id: 月卡商品ID
            pay_channel: 支付渠道
        
        Returns:
            包含payment和subscription的字典
        """
        # 1. 验证商品是否为月卡
        product = self.payment_service.get_product(product_id)
        
        if product.product_type != "subscription":
            raise ValueError("该商品不是月卡")
        
        # 2. 创建支付单
        payment = self.payment_service.create_payment(
            user_id=user_id,
            product_id=product_id,
            pay_channel=pay_channel
        )
        
        # 3. 模拟支付（真实环境需等待支付回调）
        if pay_channel == "mock":
            payment = self.payment_service.process_payment_callback(
                payment_id=payment.payment_id,
                success=True
            )
            
            # 4. 创建订阅
            subscription = self._create_subscription(
                user_id=user_id,
                product_id=product_id,
                payment_id=payment.payment_id,
                duration_days=product.duration_days
            )
            
            return {
                "payment": payment,
                "subscription": subscription
            }
        
        return {
            "payment": payment,
            "subscription": None
        }
    
    def _create_subscription(
        self,
        user_id: int,
        product_id: int,
        payment_id: int,
        duration_days: int
    ) -> Subscription:
        """
        创建订阅记录
        
        Args:
            user_id: 用户ID
            product_id: 商品ID
            payment_id: 支付单ID
            duration_days: 订阅天数
        
        Returns:
            Subscription对象
        """
        now = datetime.now()
        
        # 检查是否有现有订阅
        existing = self.db.query(Subscription).filter(
            Subscription.user_id == user_id,
            Subscription.status == "active",
            Subscription.end_at > now
        ).first()
        
        if existing:
            # 续期：在现有订阅基础上延长
            existing.end_at = existing.end_at + timedelta(days=duration_days)
            self.db.commit()
            self.db.refresh(existing)
            return existing
        else:
            # 新订阅
            subscription = Subscription(
                user_id=user_id,
                product_id=product_id,
                payment_id=payment_id,
                start_at=now,
                end_at=now + timedelta(days=duration_days),
                status="active"
            )
            
            self.db.add(subscription)
            self.db.commit()
            self.db.refresh(subscription)
            
            return subscription
    
    def get_my_subscription(self, user_id: int) -> Optional[Subscription]:
        """
        获取我的月卡状态
        
        Args:
            user_id: 用户ID
        
        Returns:
            Subscription对象或None
        """
        now = datetime.now()
        
        subscription = self.db.query(Subscription).filter(
            Subscription.user_id == user_id,
            Subscription.status == "active",
            Subscription.end_at > now
        ).order_by(Subscription.end_at.desc()).first()
        
        return subscription
    
    def claim_daily_reward(self, user_id: int) -> DailyRewardClaim:
        """
        每日领取积分
        
        Args:
            user_id: 用户ID
        
        Returns:
            DailyRewardClaim对象
        """
        # 1. 检查是否有active订阅
        subscription = self.get_my_subscription(user_id)
        
        if not subscription:
            raise ValueError("您还没有购买月卡")
        
        # 2. 检查今天是否已领取
        today = date.today()
        existing_claim = self.db.query(DailyRewardClaim).filter(
            DailyRewardClaim.user_id == user_id,
            DailyRewardClaim.claim_date == today
        ).first()
        
        if existing_claim:
            raise ValueError("今日已领取过了")
        
        # 3. 获取月卡商品信息
        product = self.payment_service.get_product(subscription.product_id)
        credits_amount = product.daily_credits or 30
        
        # 4. 发放积分
        self.wallet_service.add_credits(
            user_id=user_id,
            amount=credits_amount,
            type="subscription_daily",  # 添加必需的 type 参数
            ref_type="subscription_daily",
            ref_id=subscription.subscription_id,
            description=f"月卡每日领取{credits_amount}积分"
        )
        
        # 5. 记录领取
        claim = DailyRewardClaim(
            user_id=user_id,
            subscription_id=subscription.subscription_id,
            claim_date=today,
            credits_amount=credits_amount
        )
        
        self.db.add(claim)
        self.db.commit()
        self.db.refresh(claim)
        
        return claim
    
    def check_today_claimed(self, user_id: int) -> bool:
        """
        检查今天是否已领取
        
        Args:
            user_id: 用户ID
        
        Returns:
            bool
        """
        today = date.today()
        
        claim = self.db.query(DailyRewardClaim).filter(
            DailyRewardClaim.user_id == user_id,
            DailyRewardClaim.claim_date == today
        ).first()
        
        return claim is not None