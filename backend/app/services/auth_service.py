"""
认证服务层
"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.db.models import User, VerificationCode, CreditWallet, CoinWallet, CommissionWallet, UserStats
from app.core.security import create_access_token
from app.core.config import settings
import random


class AuthService:
    def __init__(self, db: Session):
        self.db = db
    
    def send_sms_code(self, phone: str, purpose: str = "login") -> dict:
        """
        发送短信验证码
        
        Args:
            phone: 手机号
            purpose: 用途（login/register）
        
        Returns:
            发送结果
        """
        # 生成6位数字验证码
        code = str(random.randint(100000, 999999))
        
        # 设置过期时间（5分钟）
        expires_at = datetime.utcnow() + timedelta(minutes=5)
        
        # 保存验证码到数据库
        verification = VerificationCode(
            phone=phone,
            code=code,
            purpose=purpose,
            expires_at=expires_at
        )
        self.db.add(verification)
        self.db.commit()
        
        # TODO: 对接真实短信供应商（阿里云/腾讯云）
        if settings.SMS_PROVIDER == "mock":
            print(f"📱 Mock SMS: 手机号 {phone} 收到验证码: {code}")
            return {
                "success": True,
                "message": f"验证码已发送（Mock: {code}）"
            }
        
        # 真实环境这里调用短信API
        return {
            "success": True,
            "message": "验证码已发送"
        }
    
    def verify_sms_code(self, phone: str, code: str) -> bool:
        """
        验证短信验证码
        
        Args:
            phone: 手机号
            code: 验证码
        
        Returns:
            验证结果
        """
        # 查询未使用且未过期的验证码
        verification = self.db.query(VerificationCode).filter(
            VerificationCode.phone == phone,
            VerificationCode.code == code,
            VerificationCode.is_used == False,
            VerificationCode.expires_at > datetime.utcnow()
        ).first()
        
        if not verification:
            return False
        
        # 标记为已使用
        verification.is_used = True
        self.db.commit()
        
        return True
    
    def login_by_phone(self, phone: str, code: str) -> dict:
        """
        手机验证码登录
        
        Args:
            phone: 手机号
            code: 验证码
        
        Returns:
            登录结果（包含token和用户信息）
        """
        # 1. 验证验证码
        if not self.verify_sms_code(phone, code):
            raise ValueError("验证码错误或已过期")
        
        # 2. 查询或创建用户
        user = self.db.query(User).filter(User.phone == phone).first()
        is_new_user = False
        
        if not user:
            # 新用户注册
            user = User(
                phone=phone,
                nickname=f"用户{phone[-4:]}",  # 默认昵称
                status="normal"
            )
            self.db.add(user)
            self.db.flush()  # 获取user_id
            
            # 初始化三钱包
            self._init_wallets(user.user_id)
            
            # 初始化用户统计
            self._init_user_stats(user.user_id)
            
            is_new_user = True
            self.db.commit()
        
        # 3. 生成JWT token
        token = create_access_token(data={"user_id": user.user_id})
        
        return {
            "token": token,
            "user_id": user.user_id,
            "is_new_user": is_new_user
        }
    
    def _init_wallets(self, user_id: int):
        """
        初始化用户的三钱包
        
        Args:
            user_id: 用户ID
        """
        # 生成积分钱包
        credit_wallet = CreditWallet(user_id=user_id, balance_credits=0)
        self.db.add(credit_wallet)
        
        # 创作者金币钱包
        coin_wallet = CoinWallet(
            user_id=user_id,
            balance_coins=0,
            pending_coins=0
        )
        self.db.add(coin_wallet)
        
        # 推广员佣金钱包
        commission_wallet = CommissionWallet(
            user_id=user_id,
            balance_cny=0,
            pending_cny=0
        )
        self.db.add(commission_wallet)
    
    def _init_user_stats(self, user_id: int):
        """
        初始化用户统计
        
        Args:
            user_id: 用户ID
        """
        stats = UserStats(user_id=user_id)
        self.db.add(stats)
    
    def login_mock(self, user_id: int) -> dict:
        """
        模拟登录（开发测试用）
        
        Args:
            user_id: 用户ID
        
        Returns:
            登录结果（包含token和用户信息）
        """
        # 查询或创建用户
        user = self.db.query(User).filter(User.user_id == user_id).first()
        
        if not user:
            # 用户不存在，自动创建
            user = User(
                user_id=user_id,
                phone=f"1380013{user_id:04d}",  # 生成模拟手机号
                nickname=f"测试用户{user_id}",
                status="normal"
            )
            self.db.add(user)
            self.db.flush()
            
            # 初始化三钱包
            self._init_wallets(user.user_id)
            
            # 初始化用户统计
            self._init_user_stats(user.user_id)
            
            self.db.commit()
            print(f"✅ 创建新用户: user_id={user_id}")
        else:
            print(f"✅ 用户已存在: user_id={user_id}")
        
        # 生成JWT token
        token = create_access_token(data={"sub": str(user.user_id)})
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user_id": user.user_id
        }
    
    def get_current_user(self, token: str) -> User:
        """
        根据token获取当前用户
        
        Args:
            token: JWT token
        
        Returns:
            User对象
        """
        from app.core.security import verify_token
        
        payload = verify_token(token)
        if not payload:
            raise ValueError("无效的token")
        
        user_id = payload.get("sub")
        if not user_id:
            raise ValueError("无效的token")
        
        user = self.db.query(User).filter(User.user_id == int(user_id)).first()
        if not user:
            raise ValueError("用户不存在")
        
        return user