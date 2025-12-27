"""
提现服务层
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
import json
from app.db.models import Withdrawal, CoinWallet, CoinLedger


class WithdrawalService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_withdrawal(
        self,
        user_id: int,
        amount_cny: Decimal,
        method: str,
        account_info: dict
    ) -> Withdrawal:
        """
        创建提现申请
        
        Args:
            user_id: 用户ID
            amount_cny: 提现金额（元）
            method: 提现方式
            account_info: 账户信息
        
        Returns:
            Withdrawal对象
        """
        # 1. 检查提现金额
        if amount_cny < 100:
            raise ValueError("提现金额不能少于100元")
        
        # 2. 检查金币余额
        wallet = self.db.query(CoinWallet).filter(
            CoinWallet.user_id == user_id
        ).first()
        
        if not wallet:
            raise ValueError("金币钱包不存在")
        
        if wallet.balance_coins < amount_cny:
            raise ValueError(f"金币余额不足：当前余额{wallet.balance_coins}元")
        
        # 3. 扣除金币
        wallet.balance_coins -= amount_cny
        
        # 4. 记录流水
        ledger = CoinLedger(
            user_id=user_id,
            type="withdraw",
            amount_coins=-amount_cny,
            balance_after=wallet.balance_coins,
            status="settled",
            description=f"提现{amount_cny}元"
        )
        self.db.add(ledger)
        
        # 5. 创建提现单
        withdrawal = Withdrawal(
            user_id=user_id,
            amount_cny=amount_cny,
            amount_coins=amount_cny,  # 1:1
            method=method,
            account_info=json.dumps(account_info, ensure_ascii=False),
            status="applied"
        )
        
        self.db.add(withdrawal)
        self.db.commit()
        self.db.refresh(withdrawal)
        
        return withdrawal
    
    def get_withdrawal(
        self,
        withdrawal_id: int,
        user_id: Optional[int] = None
    ) -> Withdrawal:
        """
        获取提现单详情
        
        Args:
            withdrawal_id: 提现单ID
            user_id: 用户ID（可选，用于权限校验）
        
        Returns:
            Withdrawal对象
        """
        withdrawal = self.db.query(Withdrawal).filter(
            Withdrawal.withdrawal_id == withdrawal_id
        ).first()
        
        if not withdrawal:
            raise ValueError("提现单不存在")
        
        # 权限校验
        if user_id and withdrawal.user_id != user_id:
            raise ValueError("无权查看此提现单")
        
        return withdrawal
    
    def get_withdrawal_history(
        self,
        user_id: int,
        limit: int = 20,
        cursor: Optional[int] = None
    ) -> List[Withdrawal]:
        """
        获取提现历史
        
        Args:
            user_id: 用户ID
            limit: 每页数量
            cursor: 游标
        
        Returns:
            Withdrawal列表
        """
        query = self.db.query(Withdrawal).filter(
            Withdrawal.user_id == user_id
        )
        
        if cursor:
            query = query.filter(Withdrawal.withdrawal_id < cursor)
        
        withdrawals = query.order_by(
            Withdrawal.withdrawal_id.desc()
        ).limit(limit).all()
        
        return withdrawals
    
    def process_withdrawal(
        self,
        withdrawal_id: int,
        status: str,
        reject_reason: Optional[str] = None,
        admin_note: Optional[str] = None
    ) -> Withdrawal:
        """
        处理提现申请（管理员操作）
        
        Args:
            withdrawal_id: 提现单ID
            status: 新状态（approved/paid/rejected）
            reject_reason: 拒绝原因
            admin_note: 管理员备注
        
        Returns:
            Withdrawal对象
        """
        withdrawal = self.get_withdrawal(withdrawal_id)
        
        if withdrawal.status != "applied":
            raise ValueError(f"提现单状态异常：{withdrawal.status}")
        
        if status == "rejected":
            # 拒绝：退回金币
            wallet = self.db.query(CoinWallet).filter(
                CoinWallet.user_id == withdrawal.user_id
            ).first()
            
            if wallet:
                wallet.balance_coins += withdrawal.amount_coins
                
                # 记录流水
                ledger = CoinLedger(
                    user_id=withdrawal.user_id,
                    type="withdraw_refund",
                    amount_coins=withdrawal.amount_coins,
                    balance_after=wallet.balance_coins,
                    status="settled",
                    description=f"提现拒绝退回{withdrawal.amount_coins}元"
                )
                self.db.add(ledger)
            
            withdrawal.reject_reason = reject_reason
        
        withdrawal.status = status
        withdrawal.admin_note = admin_note
        withdrawal.processed_at = datetime.now()
        
        self.db.commit()
        self.db.refresh(withdrawal)
        
        return withdrawal
