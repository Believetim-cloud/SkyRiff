"""
数据库模型（SQLAlchemy ORM）
完全按照技术架构文档中的表结构定义
"""
from sqlalchemy import (
    Column, BigInteger, String, Integer, DateTime, Boolean, 
    Text, DECIMAL, func, CheckConstraint, Index, Numeric, Date
)
from sqlalchemy.sql import text
from app.db.database import Base


# ==================== 用户体系 ====================

class User(Base):
    """用户表"""
    __tablename__ = "users"
    
    user_id = Column(BigInteger, primary_key=True, autoincrement=True)
    phone = Column(String(20), unique=True, nullable=True)
    email = Column(String(100), unique=True, nullable=True)
    wechat_openid = Column(String(100), unique=True, nullable=True)
    nickname = Column(String(50), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    status = Column(String(20), default="normal")  # normal/banned
    referrer_user_id = Column(BigInteger, nullable=True)  # 推广员ID
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # 索引
    __table_args__ = (
        Index('idx_users_phone', 'phone'),
        Index('idx_users_referrer', 'referrer_user_id'),
    )


class UserStats(Base):
    """用户统计表"""
    __tablename__ = "user_stats"
    
    user_id = Column(BigInteger, primary_key=True)
    total_videos_generated = Column(Integer, default=0)
    total_works_published = Column(Integer, default=0)
    total_likes_received = Column(Integer, default=0)
    total_followers = Column(Integer, default=0)
    total_following = Column(Integer, default=0)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


# ==================== 钱包体系（三钱包） ====================

class CreditWallet(Base):
    """生成积分钱包"""
    __tablename__ = "credit_wallets"
    
    user_id = Column(BigInteger, primary_key=True)
    balance_credits = Column(Integer, default=0)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        CheckConstraint('balance_credits >= 0', name='check_credit_balance_positive'),
    )


class CreditLedger(Base):
    """生成积分流水"""
    __tablename__ = "credit_ledgers"
    
    ledger_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, nullable=False)
    type = Column(String(50), nullable=False)  # recharge/gen_hold/gen_spend/gen_refund/download_spend等
    amount = Column(Integer, nullable=False)  # 正数为入账，负数为扣除
    balance_after = Column(Integer, nullable=False)
    ref_type = Column(String(50), nullable=True)  # task/video/payment等
    ref_id = Column(Integer, nullable=True)  # 改为Integer以匹配其他表主键
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    
    __table_args__ = (
        Index('idx_credit_ledgers_user', 'user_id', 'created_at'),
        Index('idx_credit_ledgers_type', 'type'),
    )


class CoinWallet(Base):
    """创作者金币钱包"""
    __tablename__ = "coin_wallets"
    
    user_id = Column(BigInteger, primary_key=True)
    balance_coins = Column(DECIMAL(10, 2), default=0)
    pending_coins = Column(DECIMAL(10, 2), default=0)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        CheckConstraint('balance_coins >= 0', name='check_coin_balance_positive'),
        CheckConstraint('pending_coins >= 0', name='check_pending_coins_positive'),
    )


class CoinLedger(Base):
    """创作者金币流水"""
    __tablename__ = "coin_ledgers"
    
    ledger_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, nullable=False)
    type = Column(String(50), nullable=False)  # creator_tip_income/creator_prompt_income等
    amount_coins = Column(DECIMAL(10, 2), nullable=False)
    balance_after = Column(DECIMAL(10, 2), nullable=False)
    source_user_id = Column(BigInteger, nullable=True)  # 付费者
    ref_type = Column(String(50), nullable=True)
    ref_id = Column(Integer, nullable=True)  # 改为Integer以匹配其他表主键
    status = Column(String(20), default="pending")  # pending/settled
    unlock_at = Column(DateTime, nullable=True)  # 解冻时间（7天后）
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    
    __table_args__ = (
        Index('idx_coin_ledgers_user', 'user_id', 'created_at'),
        Index('idx_coin_ledgers_unlock', 'status', 'unlock_at'),
    )


class CommissionWallet(Base):
    """推广员佣金钱包（人民币）"""
    __tablename__ = "commission_wallets"
    
    user_id = Column(BigInteger, primary_key=True)
    balance_cny = Column(DECIMAL(10, 2), default=0)
    pending_cny = Column(DECIMAL(10, 2), default=0)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        CheckConstraint('balance_cny >= 0', name='check_commission_balance_positive'),
        CheckConstraint('pending_cny >= 0', name='check_pending_commission_positive'),
    )


class CommissionLedger(Base):
    """推广员佣金流水"""
    __tablename__ = "commission_ledgers"
    
    ledger_id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, nullable=False)  # 收佣金的推广员
    type = Column(String(50), nullable=False)  # direct_5pct/upline_0_1pct_monthly等
    amount_cny = Column(DECIMAL(10, 2), nullable=False)
    balance_after = Column(DECIMAL(10, 2), nullable=False)
    source_user_id = Column(BigInteger, nullable=True)  # 带来收益的用户
    source_payment_id = Column(Integer, nullable=True)  # 改为Integer匹配Payment主键
    period = Column(String(10), nullable=True)  # 月结期号（YYYY-MM）
    status = Column(String(20), default="pending")  # pending/settled/paid
    unlock_at = Column(DateTime, nullable=True)  # 冻结解锁时间（7天后）
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    
    __table_args__ = (
        Index('idx_commission_ledgers_user', 'user_id', 'created_at'),
        Index('idx_commission_ledgers_unlock', 'status', 'unlock_at'),
        Index('idx_commission_ledgers_period', 'period'),
    )


# ==================== 推广员系统 ====================

class PromoterProfile(Base):
    """推广员身份"""
    __tablename__ = "promoter_profiles"
    
    user_id = Column(BigInteger, primary_key=True)
    is_promoter = Column(Boolean, default=False)  # 是否已激活推广员身份
    activated_at = Column(DateTime, nullable=True)
    activation_payment_id = Column(Integer, nullable=True)  # 充值30元的支付单（改为Integer匹配Payment主键）
    promo_credit_balance = Column(Integer, default=0)  # 推广积分余额（营销预算）
    total_invited_count = Column(Integer, default=0)  # 累计邀请人数
    total_commission_earned = Column(DECIMAL(10, 2), default=0)  # 累计佣金收入
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        CheckConstraint('promo_credit_balance >= 0', name='check_promo_credit_positive'),
    )


class PromoCreditLedger(Base):
    """推广积分流水"""
    __tablename__ = "promo_credit_ledgers"
    
    ledger_id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, nullable=False)  # 推广员ID
    type = Column(String(50), nullable=False)  # promoter_activation_grant/invite_bonus_grant等
    amount = Column(Integer, nullable=False)
    balance_after = Column(Integer, nullable=False)
    ref_type = Column(String(50), nullable=True)
    ref_id = Column(BigInteger, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    
    __table_args__ = (
        Index('idx_promo_ledgers_user', 'user_id', 'created_at'),
    )


class ReferralCode(Base):
    """推广码表"""
    __tablename__ = "referral_codes"
    
    code_id = Column(BigInteger, primary_key=True, autoincrement=True)
    code = Column(String(20), unique=True, nullable=False)  # SKY2025ABC
    promoter_user_id = Column(BigInteger, nullable=False)
    
    # 统计
    total_invites = Column(Integer, default=0)  # 总邀请人数
    total_commission_coins = Column(Numeric(10, 2), default=0)  # 总佣金（金币）
    
    # 状态
    is_active = Column(Boolean, default=True)
    
    # 时间
    created_at = Column(DateTime, server_default=func.now())
    
    __table_args__ = (
        Index('idx_referral_codes_promoter', 'promoter_user_id'),
    )


class ReferralBinding(Base):
    """邀请绑定表"""
    __tablename__ = "referral_bindings"
    
    binding_id = Column(BigInteger, primary_key=True, autoincrement=True)
    
    # 关系
    referral_code = Column(String(20), nullable=False)
    promoter_user_id = Column(BigInteger, nullable=False)
    new_user_id = Column(BigInteger, nullable=False)
    
    # 时间
    created_at = Column(DateTime, server_default=func.now())
    
    __table_args__ = (
        Index('idx_referral_bindings_new_user', 'new_user_id', unique=True),
        Index('idx_referral_bindings_promoter', 'promoter_user_id'),
    )


# ==================== 财务体系 ====================

class Product(Base):
    """商品配置表（充值档位、月卡）"""
    __tablename__ = "products"
    
    product_id = Column(Integer, primary_key=True, autoincrement=True)
    product_type = Column(String(20), nullable=False)  # recharge/subscription
    name = Column(String(100), nullable=False)
    price_yuan = Column(DECIMAL(10, 2), nullable=False)
    credits = Column(Integer, nullable=True)  # 充值商品对应的积分
    bonus_credits = Column(Integer, default=0)  # 赠送积分
    duration_days = Column(Integer, nullable=True)  # 月卡天数
    daily_credits = Column(Integer, nullable=True)  # 月卡每日积分
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    
    __table_args__ = (
        Index('idx_products_type', 'product_type', 'is_active'),
    )


class Payment(Base):
    """支付单表"""
    __tablename__ = "payments"
    
    payment_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, nullable=False)
    product_id = Column(Integer, nullable=False)  # 关联products表（改为Integer匹配Product主键）
    
    # 金额
    amount_cny = Column(Numeric(10, 2), nullable=False)  # 支付金额（元）
    
    # 支付渠道
    pay_channel = Column(String(20), nullable=False)  # wechat/alipay/mock
    
    # 第三方
    vendor_payment_id = Column(String(100), nullable=True)  # 第三方支付单号
    
    # 状态
    status = Column(String(20), default="pending")  # pending/success/failed/cancelled
    
    # 支付参数（给前端拉起支付用）
    pay_params = Column(Text, nullable=True)  # JSON字符串
    
    # 时间
    created_at = Column(DateTime, server_default=func.now())
    paid_at = Column(DateTime, nullable=True)  # 支付成功时间
    
    __table_args__ = (
        Index('idx_payments_user', 'user_id', 'created_at'),
        Index('idx_payments_status', 'status'),
    )


class Subscription(Base):
    """月卡订阅表"""
    __tablename__ = "subscriptions"
    
    subscription_id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, nullable=False)
    product_id = Column(Integer, nullable=False)  # 月卡商品ID（改为Integer匹配Product主键）
    payment_id = Column(Integer, nullable=True)  # 关联支付单（改为Integer匹配Payment主键）
    
    # 订阅周期
    start_at = Column(DateTime, nullable=False)
    end_at = Column(DateTime, nullable=False)
    
    # 状态
    status = Column(String(20), default="active")  # active/expired/cancelled
    
    # 时间
    created_at = Column(DateTime, server_default=func.now())
    
    __table_args__ = (
        Index('idx_subscriptions_user', 'user_id', 'status'),
    )


class DailyRewardClaim(Base):
    """每日领取记录表"""
    __tablename__ = "daily_reward_claims"
    
    claim_id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, nullable=False)
    subscription_id = Column(BigInteger, nullable=False)
    
    # 领取日期
    claim_date = Column(Date, nullable=False)  # 哪一天领取的
    
    # 奖励
    credits_amount = Column(Integer, default=30)  # 领取的积分
    
    # 时间
    created_at = Column(DateTime, server_default=func.now())
    
    __table_args__ = (
        Index('idx_daily_claims_user_date', 'user_id', 'claim_date', unique=True),
    )


class TaskDefinition(Base):
    """任务定义表（系统配置）"""
    __tablename__ = "task_definitions"
    
    task_def_id = Column(Integer, primary_key=True, autoincrement=True)
    task_key = Column(String(50), unique=True, nullable=False)  # login_daily/gen_success等
    
    # 任务信息
    title = Column(String(100), nullable=False)
    description = Column(String(500), nullable=True)
    
    # 奖励
    reward_credits = Column(Integer, default=2)  # 完成奖励积分
    
    # 分类
    category = Column(String(20), nullable=False)  # active/create/social
    
    # 是否可重复
    is_repeatable = Column(Boolean, default=True)  # 每日任务都是True
    
    # 是否启用
    is_active = Column(Boolean, default=True)
    
    # 时间
    created_at = Column(DateTime, server_default=func.now())


class DailyTaskAssignment(Base):
    """每日任务分配表"""
    __tablename__ = "daily_task_assignments"
    
    assignment_id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, nullable=False)
    task_key = Column(String(50), nullable=False)  # 关联task_definitions
    
    # 分配日期
    assign_date = Column(Date, nullable=False)
    
    # 状态
    status = Column(String(20), default="pending")  # pending/completed/claimed
    
    # 时间
    created_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)  # 完成时间
    claimed_at = Column(DateTime, nullable=True)  # 领取时间
    
    __table_args__ = (
        Index('idx_task_assignments_user_date', 'user_id', 'assign_date'),
        Index('idx_task_assignments_status', 'status'),
    )


class Withdrawal(Base):
    """提现单表"""
    __tablename__ = "withdrawals"
    
    withdrawal_id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, nullable=False)
    
    # 金额
    amount_cny = Column(Numeric(10, 2), nullable=False)  # 提现金额（元）
    amount_coins = Column(Numeric(10, 2), nullable=False)  # 扣除的金币（1:1）
    
    # 提现方式
    method = Column(String(20), nullable=False)  # bank_card/alipay/wechat
    account_info = Column(Text, nullable=False)  # JSON：账户信息
    
    # 状态
    status = Column(String(20), default="applied")  # applied/approved/paid/rejected/cancelled
    
    # 备注
    reject_reason = Column(String(500), nullable=True)  # 拒绝原因
    admin_note = Column(String(500), nullable=True)  # 管理员备注
    
    # 时间
    created_at = Column(DateTime, server_default=func.now())
    processed_at = Column(DateTime, nullable=True)  # 处理时间
    
    __table_args__ = (
        Index('idx_withdrawals_user', 'user_id', 'created_at'),
        Index('idx_withdrawals_status', 'status'),
    )


# ==================== 验证码表（Phase 0需要） ====================

class VerificationCode(Base):
    """验证码表（手机/邮箱）"""
    __tablename__ = "verification_codes"
    
    code_id = Column(BigInteger, primary_key=True, autoincrement=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(100), nullable=True)
    code = Column(String(6), nullable=False)
    purpose = Column(String(20), nullable=False)  # login/register
    is_used = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    
    __table_args__ = (
        Index('idx_verification_codes_phone', 'phone', 'is_used'),
        Index('idx_verification_codes_email', 'email', 'is_used'),
    )


# ==================== Phase 1: 视频生成体系 ====================

class Task(Base):
    """生成任务表"""
    __tablename__ = "tasks"
    
    task_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, nullable=False)
    
    # 来源信息
    source_type = Column(String(50), nullable=True)  # direct/storyboard_shot/remix
    source_id = Column(BigInteger, nullable=True)  # storyboard_shot_id / parent_work_id
    
    # 供应商信息
    vendor = Column(String(50), default="dyuapi_sora2")
    vendor_task_id = Column(String(100), nullable=True)
    
    # 生成参数
    prompt = Column(Text, nullable=False)
    prompt_final = Column(Text, nullable=True)  # 最终提示词（可能经过AI优化）
    duration_sec = Column(Integer, nullable=False)  # 10/15/25
    ratio = Column(String(10), default="9:16")  # 9:16/16:9/1:1
    model = Column(String(50), nullable=True)
    
    # 参考图（图生视频）
    reference_image_asset_id = Column(BigInteger, nullable=True)
    
    # 状态
    status = Column(String(20), default="QUEUED")  # QUEUED/IN_PROGRESS/SUCCESS/FAILURE
    progress = Column(Integer, default=0)  # 0-100
    
    # 结果
    video_id = Column(BigInteger, nullable=True)  # 生成成功后的video_asset_id
    
    # 费用
    cost_credits = Column(Integer, nullable=False)
    
    # 错误信息
    error_message = Column(Text, nullable=True)
    
    # 项目归属
    project_id = Column(BigInteger, nullable=True)
    
    # 时间
    created_at = Column(DateTime, server_default=func.now())
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    __table_args__ = (
        Index('idx_tasks_user', 'user_id', 'created_at'),
        Index('idx_tasks_status', 'status'),
        Index('idx_tasks_vendor_task_id', 'vendor_task_id'),
    )


class VideoAsset(Base):
    """视频资产表"""
    __tablename__ = "video_assets"
    
    video_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, nullable=False)
    task_id = Column(BigInteger, nullable=True)  # 关联生成任务
    
    # 视频信息
    duration_sec = Column(Integer, nullable=False)
    ratio = Column(String(10), nullable=False)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    file_size_bytes = Column(BigInteger, nullable=True)
    
    # 播放链接（供应商提供）
    watermarked_play_url = Column(String(500), nullable=True)  # 带水印预览
    no_watermark_download_url = Column(String(500), nullable=True)  # 无水印下载（临时链接）
    
    # 供应商信息
    vendor = Column(String(50), default="dyuapi_sora2")
    vendor_video_id = Column(String(100), nullable=True)
    
    # 项目归属
    project_id = Column(BigInteger, nullable=True)
    
    # 下载次数
    download_count = Column(Integer, default=0)
    
    # 时间
    created_at = Column(DateTime, server_default=func.now())
    
    __table_args__ = (
        Index('idx_video_assets_user', 'user_id', 'created_at'),
        Index('idx_video_assets_project', 'project_id'),
    )


class Project(Base):
    """项目表（视频分类文件夹）"""
    __tablename__ = "projects"
    
    project_id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    
    # 统计
    video_count = Column(Integer, default=0)
    
    # 时间
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        Index('idx_projects_user', 'user_id'),
    )


class MediaAsset(Base):
    """媒体资产表（上传的图片等）"""
    __tablename__ = "media_assets"
    
    asset_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, nullable=False)
    
    # 文件信息
    asset_type = Column(String(20), nullable=False)  # image/audio/video
    file_url = Column(String(500), nullable=False)
    file_size_bytes = Column(BigInteger, nullable=True)
    mime_type = Column(String(100), nullable=True)
    
    # 图片专用
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    
    # 时间
    created_at = Column(DateTime, server_default=func.now())
    
    __table_args__ = (
        Index('idx_media_assets_user', 'user_id', 'created_at'),
    )


# ==================== Phase 2: 作品发布与社交 ====================

class Work(Base):
    """作品表（发布到社区的视频）"""
    __tablename__ = "works"
    
    work_id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, nullable=False)
    video_id = Column(BigInteger, nullable=False)  # 关联video_asset
    
    # 作品信息
    title = Column(String(200), nullable=True)
    description = Column(Text, nullable=True)
    cover_image_url = Column(String(500), nullable=True)
    
    # 提示词
    prompt = Column(Text, nullable=False)
    is_prompt_public = Column(Boolean, default=False)  # 是否公开提示词
    prompt_unlock_cost = Column(Integer, default=5)  # 提示词解锁费用（积分）
    
    # 二创设置
    allow_remix = Column(Boolean, default=True)  # 是否允许二创
    remix_share_rate = Column(DECIMAL(5, 2), default=0.30)  # 二创分成比例（30%）
    
    # 来源信息（如果是二创）
    parent_work_id = Column(BigInteger, nullable=True)  # 原作品ID
    is_remix = Column(Boolean, default=False)
    
    # 统计数据
    view_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    comment_count = Column(Integer, default=0)
    collect_count = Column(Integer, default=0)
    share_count = Column(Integer, default=0)
    tip_count = Column(Integer, default=0)  # 打赏次数
    remix_count = Column(Integer, default=0)  # 被二创次数
    prompt_unlock_count = Column(Integer, default=0)  # 提示词解锁次数
    
    # 创作者收益统计
    total_tip_income = Column(DECIMAL(10, 2), default=0)  # 打赏收入
    total_prompt_income = Column(DECIMAL(10, 2), default=0)  # 提示词收入
    total_remix_income = Column(DECIMAL(10, 2), default=0)  # 二创分成收入
    
    # 发布状态
    status = Column(String(20), default="published")  # draft/published/hidden
    
    # 时间
    created_at = Column(DateTime, server_default=func.now())
    published_at = Column(DateTime, nullable=True)
    
    __table_args__ = (
        Index('idx_works_user', 'user_id', 'created_at'),
        Index('idx_works_status', 'status', 'published_at'),
        Index('idx_works_parent', 'parent_work_id'),
    )


class WorkLike(Base):
    """作品点赞表"""
    __tablename__ = "work_likes"
    
    like_id = Column(BigInteger, primary_key=True, autoincrement=True)
    work_id = Column(BigInteger, nullable=False)
    user_id = Column(BigInteger, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    
    __table_args__ = (
        Index('idx_work_likes_work', 'work_id'),
        Index('idx_work_likes_user', 'user_id', 'created_at'),
        # 唯一索引：一个用户只能点赞一次
        Index('idx_work_likes_unique', 'work_id', 'user_id', unique=True),
    )


class WorkComment(Base):
    """作品评论表"""
    __tablename__ = "work_comments"
    
    comment_id = Column(BigInteger, primary_key=True, autoincrement=True)
    work_id = Column(BigInteger, nullable=False)
    user_id = Column(BigInteger, nullable=False)
    content = Column(Text, nullable=False)
    
    # 回复关系
    parent_comment_id = Column(BigInteger, nullable=True)  # 回复的评论ID
    
    # 统计
    like_count = Column(Integer, default=0)
    
    # 时间
    created_at = Column(DateTime, server_default=func.now())
    
    __table_args__ = (
        Index('idx_work_comments_work', 'work_id', 'created_at'),
        Index('idx_work_comments_user', 'user_id'),
    )


class WorkCollection(Base):
    """作品收藏表"""
    __tablename__ = "work_collections"
    
    collection_id = Column(BigInteger, primary_key=True, autoincrement=True)
    work_id = Column(BigInteger, nullable=False)
    user_id = Column(BigInteger, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    
    __table_args__ = (
        Index('idx_work_collections_user', 'user_id', 'created_at'),
        Index('idx_work_collections_work', 'work_id'),
        # 唯一索引：一个用户只能收藏一次
        Index('idx_work_collections_unique', 'work_id', 'user_id', unique=True),
    )


class WorkTip(Base):
    """作品打赏表"""
    __tablename__ = "work_tips"
    
    tip_id = Column(BigInteger, primary_key=True, autoincrement=True)
    work_id = Column(BigInteger, nullable=False)
    creator_user_id = Column(BigInteger, nullable=False)  # 创作者
    tipper_user_id = Column(BigInteger, nullable=False)  # 打赏者
    
    # 打赏金额
    amount_credits = Column(Integer, nullable=False)  # 打赏积分
    amount_coins = Column(DECIMAL(10, 2), nullable=False)  # 创作者收到的金币
    platform_fee = Column(DECIMAL(10, 2), nullable=False)  # 平台抽成
    
    # 时间
    created_at = Column(DateTime, server_default=func.now())
    
    __table_args__ = (
        Index('idx_work_tips_work', 'work_id'),
        Index('idx_work_tips_creator', 'creator_user_id', 'created_at'),
        Index('idx_work_tips_tipper', 'tipper_user_id'),
    )


class PromptUnlock(Base):
    """提示词解锁表"""
    __tablename__ = "prompt_unlocks"
    
    unlock_id = Column(BigInteger, primary_key=True, autoincrement=True)
    work_id = Column(BigInteger, nullable=False)
    creator_user_id = Column(BigInteger, nullable=False)  # 创作者
    unlocking_user_id = Column(BigInteger, nullable=False)  # 解锁者
    
    # 费用
    cost_credits = Column(Integer, nullable=False)  # 解锁费用（积分）
    income_coins = Column(DECIMAL(10, 2), nullable=False)  # 创作者收入（金币）
    platform_fee = Column(DECIMAL(10, 2), nullable=False)  # 平台抽成
    
    # 时间
    created_at = Column(DateTime, server_default=func.now())
    
    __table_args__ = (
        Index('idx_prompt_unlocks_work', 'work_id'),
        Index('idx_prompt_unlocks_creator', 'creator_user_id'),
        # 唯一索引：一个用户只能解锁一次
        Index('idx_prompt_unlocks_unique', 'work_id', 'unlocking_user_id', unique=True),
    )


class Follow(Base):
    """关注关系表"""
    __tablename__ = "follows"
    
    follow_id = Column(BigInteger, primary_key=True, autoincrement=True)
    follower_user_id = Column(BigInteger, nullable=False)  # 关注者
    following_user_id = Column(BigInteger, nullable=False)  # 被关注者
    created_at = Column(DateTime, server_default=func.now())
    
    __table_args__ = (
        Index('idx_follows_follower', 'follower_user_id'),
        Index('idx_follows_following', 'following_user_id'),
        # 唯一索引：防止重复关注
        Index('idx_follows_unique', 'follower_user_id', 'following_user_id', unique=True),
    )


# ==================== Phase 3: 故事版 + 批量生成 ====================

class Storyboard(Base):
    """故事版表（8个镜头的脚本）"""
    __tablename__ = "storyboards"
    
    storyboard_id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, nullable=False)
    project_id = Column(BigInteger, nullable=True)  # 归属项目
    
    # 主题
    topic_prompt = Column(Text, nullable=True)  # 主题提示词
    
    # 全局设置
    global_role_id = Column(BigInteger, nullable=True)  # 全局角色（可被单个镜头覆盖）
    
    # 镜头排序 (使用Text存储JSON格式的数组，兼容SQLite)
    shot_order = Column(Text, default='[]')  # 镜头顺序数组 [shot_id1, shot_id2, ...]，存储为JSON字符串
    
    # 时间
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        Index('idx_storyboards_user', 'user_id', 'created_at'),
        Index('idx_storyboards_project', 'project_id'),
    )


class Shot(Base):
    """镜头表（故事版中的单个镜头）"""
    __tablename__ = "shots"
    
    shot_id = Column(BigInteger, primary_key=True, autoincrement=True)
    storyboard_id = Column(BigInteger, nullable=False)
    
    # 镜头参数
    prompt = Column(Text, nullable=False)  # 镜头描述提示词
    duration_sec = Column(Integer, nullable=False)  # 10/15/25
    shot_size = Column(String(20), nullable=True)  # 远景/全景/中景/近景/特写
    camera_move = Column(String(20), nullable=True)  # 静止/跟拍/推近/拉远/环绕
    
    # 角色设置
    role_id = Column(BigInteger, nullable=True)  # 镜头专属角色
    has_role_override = Column(Boolean, default=False)  # 是否覆盖全局角色
    
    # 参考图
    reference_image_asset_id = Column(BigInteger, nullable=True)
    
    # 时间
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        Index('idx_shots_storyboard', 'storyboard_id'),
    )


# ==================== Phase 4: 运营增长系统 ====================

# 注意：Phase 4 的表已经在上面定义过了，这里不需要重复定义
# Payment、Subscription、DailyRewardClaim、TaskDefinition、DailyTaskAssignment、
# Withdrawal、ReferralCode、ReferralBinding 等类已在前面定义
