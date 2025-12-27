"""
支付服务层
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from app.db.models import (
    Payment, Product, CreditWallet, CreditLedger,
    User
)
from app.services.wallet_service import WalletService


class PaymentService:
    def __init__(self, db: Session):
        self.db = db
        self.wallet_service = WalletService(db)
    
    def get_products(self, product_type: Optional[str] = None) -> List[Product]:
        """
        获取商品列表
        
        Args:
            product_type: 商品类型（recharge/subscription），不传则返回全部
        
        Returns:
            Product列表
        """
        query = self.db.query(Product).filter(Product.is_active == True)
        
        if product_type:
            query = query.filter(Product.product_type == product_type)
        
        products = query.order_by(Product.price_yuan.asc()).all()
        return products
    
    def get_product(self, product_id: int) -> Product:
        """
        获取单个商品
        
        Args:
            product_id: 商品ID
        
        Returns:
            Product对象
        """
        product = self.db.query(Product).filter(
            Product.product_id == product_id,
            Product.is_active == True
        ).first()
        
        if not product:
            raise ValueError("商品不存在或已下架")
        
        return product
    
    def create_payment(
        self,
        user_id: int,
        product_id: int,
        pay_channel: str = "mock"
    ) -> Payment:
        """
        创建支付单
        
        Args:
            user_id: 用户ID
            product_id: 商品ID
            pay_channel: 支付渠道
        
        Returns:
            Payment对象
        """
        # 1. 获取商品信息
        product = self.get_product(product_id)
        
        # 2. 创建支付单
        payment = Payment(
            user_id=user_id,
            product_id=product_id,
            amount_cny=product.price_yuan,
            pay_channel=pay_channel,
            status="pending"
        )
        
        self.db.add(payment)
        self.db.flush()
        
        # 3. 生成支付参数（模拟）
        if pay_channel == "mock":
            payment.pay_params = f'{{"mock_payment_id": "{payment.payment_id}"}}'
        
        self.db.commit()
        self.db.refresh(payment)
        
        return payment
    
    def process_payment_callback(
        self,
        payment_id: int,
        success: bool = True
    ) -> Payment:
        """
        处理支付回调（模拟）
        
        Args:
            payment_id: 支付单ID
            success: 是否支付成功
        
        Returns:
            Payment对象
        """
        # 1. 获取支付单
        payment = self.db.query(Payment).filter(
            Payment.payment_id == payment_id
        ).first()
        
        if not payment:
            raise ValueError("支付单不存在")
        
        if payment.status != "pending":
            raise ValueError(f"支付单状态异常：{payment.status}")
        
        # 2. 获取商品信息
        product = self.get_product(payment.product_id)
        
        if success:
            # 3. 支付成功：发放积分
            if product.product_type == "recharge":
                total_credits = product.credits + product.bonus_credits
                
                # 发放积分
                self.wallet_service.add_credits(
                    user_id=payment.user_id,
                    amount=total_credits,
                    type="recharge",  # 添加必需的 type 参数
                    ref_type="payment",
                    ref_id=payment.payment_id,
                    description=f"充值{product.name}，获得{total_credits}积分"
                )
            
            # 4. 更新支付单状态
            payment.status = "success"
            payment.paid_at = datetime.now()
        else:
            # 支付失败
            payment.status = "failed"
        
        self.db.commit()
        self.db.refresh(payment)
        
        return payment
    
    def get_payment(self, payment_id: int, user_id: Optional[int] = None) -> Payment:
        """
        获取支付单详情
        
        Args:
            payment_id: 支付单ID
            user_id: 用户ID（可选，用于权限校验）
        
        Returns:
            Payment对象
        """
        payment = self.db.query(Payment).filter(
            Payment.payment_id == payment_id
        ).first()
        
        if not payment:
            raise ValueError("支付单不存在")
        
        # 权限校验
        if user_id and payment.user_id != user_id:
            raise ValueError("无权查看此支付单")
        
        return payment
    
    def get_payment_history(
        self,
        user_id: int,
        limit: int = 20,
        cursor: Optional[int] = None
    ) -> List[Payment]:
        """
        获取支付历史
        
        Args:
            user_id: 用户ID
            limit: 每页数量
            cursor: 游标
        
        Returns:
            Payment列表
        """
        query = self.db.query(Payment).filter(
            Payment.user_id == user_id
        )
        
        if cursor:
            query = query.filter(Payment.payment_id < cursor)
        
        payments = query.order_by(
            Payment.payment_id.desc()
        ).limit(limit).all()
        
        return payments