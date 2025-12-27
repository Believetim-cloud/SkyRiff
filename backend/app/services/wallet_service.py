"""
钱包服务层
"""
from sqlalchemy.orm import Session
from decimal import Decimal
from app.db.models import (
    CreditWallet, CreditLedger,
    CoinWallet, CoinLedger,
    CommissionWallet, CommissionLedger
)


class WalletService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_wallets_balance(self, user_id: int) -> dict:
        """
        获取用户三钱包余额
        
        Args:
            user_id: 用户ID
        
        Returns:
            三钱包余额
        """
        # 生成积分钱包
        credit_wallet = self.db.query(CreditWallet).filter(
            CreditWallet.user_id == user_id
        ).first()
        
        # 创作者金币钱包
        coin_wallet = self.db.query(CoinWallet).filter(
            CoinWallet.user_id == user_id
        ).first()
        
        # 推广员佣金钱包
        commission_wallet = self.db.query(CommissionWallet).filter(
            CommissionWallet.user_id == user_id
        ).first()
        
        return {
            "credits": credit_wallet.balance_credits if credit_wallet else 0,
            "coins_available": coin_wallet.balance_coins if coin_wallet else Decimal(0),
            "coins_pending": coin_wallet.pending_coins if coin_wallet else Decimal(0),
            "commission_available": commission_wallet.balance_cny if commission_wallet else Decimal(0),
            "commission_pending": commission_wallet.pending_cny if commission_wallet else Decimal(0),
        }
    
    def get_credit_ledgers(
        self, 
        user_id: int, 
        limit: int = 20, 
        cursor: int = None
    ) -> list:
        """
        获取积分流水
        
        Args:
            user_id: 用户ID
            limit: 每页数量
            cursor: 游标（ledger_id）
        
        Returns:
            积分流水列表
        """
        query = self.db.query(CreditLedger).filter(
            CreditLedger.user_id == user_id
        )
        
        if cursor:
            query = query.filter(CreditLedger.ledger_id < cursor)
        
        ledgers = query.order_by(CreditLedger.ledger_id.desc()).limit(limit).all()
        return ledgers
    
    def get_coin_ledgers(
        self, 
        user_id: int, 
        limit: int = 20, 
        cursor: int = None
    ) -> list:
        """
        获取金币流水
        
        Args:
            user_id: 用户ID
            limit: 每页数量
            cursor: 游标（ledger_id）
        
        Returns:
            金币流水列表
        """
        query = self.db.query(CoinLedger).filter(
            CoinLedger.user_id == user_id
        )
        
        if cursor:
            query = query.filter(CoinLedger.ledger_id < cursor)
        
        ledgers = query.order_by(CoinLedger.ledger_id.desc()).limit(limit).all()
        return ledgers
    
    def add_credits(
        self,
        user_id: int,
        amount: int,
        type: str,
        ref_type: str = None,
        ref_id: int = None,
        description: str = None
    ) -> CreditLedger:
        """
        增加积分（通用方法）
        
        Args:
            user_id: 用户ID
            amount: 积分数量
            type: 流水类型
            ref_type: 关联类型
            ref_id: 关联ID
            description: 描述
        
        Returns:
            流水记录
        """
        # 获取钱包
        wallet = self.db.query(CreditWallet).filter(
            CreditWallet.user_id == user_id
        ).first()
        
        if not wallet:
            raise ValueError("钱包不存在")
        
        # 更新余额
        wallet.balance_credits += amount
        new_balance = wallet.balance_credits
        
        # 创建流水
        ledger = CreditLedger(
            user_id=user_id,
            type=type,
            amount=amount,
            balance_after=new_balance,
            ref_type=ref_type,
            ref_id=ref_id,
            description=description
        )
        
        self.db.add(ledger)
        self.db.commit()
        self.db.refresh(ledger)
        
        return ledger
    
    def deduct_credits(
        self,
        user_id: int,
        amount: int,
        type: str,
        ref_type: str = None,
        ref_id: int = None,
        description: str = None
    ) -> CreditLedger:
        """
        扣除积分（通用方法）
        
        Args:
            user_id: 用户ID
            amount: 积分数量
            type: 流水类型
            ref_type: 关联类型
            ref_id: 关联ID
            description: 描述
        
        Returns:
            流水记录
        """
        # 获取钱包
        wallet = self.db.query(CreditWallet).filter(
            CreditWallet.user_id == user_id
        ).first()
        
        if not wallet:
            raise ValueError("钱包不存在")
        
        # 检查余额
        if wallet.balance_credits < amount:
            raise ValueError("积分余额不足")
        
        # 更新余额
        wallet.balance_credits -= amount
        new_balance = wallet.balance_credits
        
        # 创建流水（负数）
        ledger = CreditLedger(
            user_id=user_id,
            type=type,
            amount=-amount,
            balance_after=new_balance,
            ref_type=ref_type,
            ref_id=ref_id,
            description=description
        )
        
        self.db.add(ledger)
        self.db.commit()
        self.db.refresh(ledger)
        
        return ledger
