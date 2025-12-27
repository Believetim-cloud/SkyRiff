"""
常量定义（来自业务规则配置文档）
"""

# ==================== 充值档位 ====================
RECHARGE_TIERS = [
    {"product_id": 1, "price_yuan": 6, "credits": 120, "bonus_credits": 0},
    {"product_id": 2, "price_yuan": 30, "credits": 600, "bonus_credits": 0},
    {"product_id": 3, "price_yuan": 68, "credits": 1360, "bonus_credits": 0},
    {"product_id": 4, "price_yuan": 128, "credits": 2560, "bonus_credits": 0},
    {"product_id": 5, "price_yuan": 328, "credits": 6560, "bonus_credits": 0},
    {"product_id": 6, "price_yuan": 648, "credits": 12960, "bonus_credits": 0},
    {"product_id": 7, "price_yuan": 2880, "credits": 57600, "bonus_credits": 0},
]

# ==================== 月卡配置 ====================
SUBSCRIPTION_CONFIG = {
    "product_id": 100,
    "price_yuan": 29,
    "duration_days": 30,
    "daily_credits": 30,
}

# ==================== 视频生成费用 ====================
VIDEO_GENERATION_COSTS = {
    10: 10,  # 10秒 = 10积分
    15: 15,  # 15秒 = 15积分
    25: 25,  # 25秒 = 25积分
}

# ==================== 其他费用 ====================
DOWNLOAD_NO_WATERMARK_COST = 6  # 无水印下载费用
UNLOCK_PROMPT_COST = 5  # 解锁提示词费用
REMIX_EXTRA_COST = 2  # 二创额外费用

# ==================== 打赏档位 ====================
TIP_AMOUNTS = [10, 20, 50, 100]  # 积分

# ==================== 货币汇率 ====================
CREDIT_TO_YUAN = 0.05  # 1积分 = 0.05元
COIN_TO_YUAN = 1.0  # 1金币 = 1元

# ==================== 平台抽成 ====================
PLATFORM_FEE_RATES = {
    "creator_tip": 0.10,  # 打赏抽成10%
    "creator_prompt": 0.10,  # 提示词抽成10%
    "creator_remix": 0.10,  # 二创抽成10%
    "brand_order": 0.05,  # 商单抽成5%
}

# ==================== 推广员配置 ====================
PROMOTER_ACTIVATION_FEE = 30  # 推广员激活费用（元）
PROMOTER_ACTIVATION_REWARD = 600  # 推广员激活奖励（推广积分）
NEW_USER_REFERRAL_BONUS = 50  # 新用户奖励（积分）
DIRECT_COMMISSION_RATE = 0.05  # 直接推广佣金比例（5%）
UPLINE_COMMISSION_RATE = 0.001  # 二级推广佣金比例（0.1%）

# ==================== 提现配置 ====================
MIN_WITHDRAWAL_AMOUNT = 100  # 最低提现金额（元）
FREEZE_DAYS = 7  # 冻结天数

# ==================== 任务中心配置 ====================
DAILY_TASK_COUNT = 3  # 每日任务数量
TASK_REWARD_CREDITS = 2  # 每个任务奖励积分

# ==================== 时长与比例 ====================
VIDEO_DURATIONS = [10, 15, 25]  # 支持的时长（秒）
VIDEO_RATIOS = ["9:16", "16:9", "1:1"]  # 支持的比例

# ==================== 任务状态 ====================
TASK_STATUS = {
    "NOT_START": "未开始",
    "QUEUED": "排队中",
    "IN_PROGRESS": "生成中",
    "SUCCESS": "成功",
    "FAILURE": "失败",
}

# ==================== 支付状态 ====================
PAYMENT_STATUS = {
    "PENDING": "待支付",
    "SUCCESS": "成功",
    "FAILED": "失败",
    "REFUNDED": "已退款",
}

# ==================== 订阅状态 ====================
SUBSCRIPTION_STATUS = {
    "ACTIVE": "激活中",
    "EXPIRED": "已过期",
    "CANCELLED": "已取消",
}

# ==================== 提现状态 ====================
WITHDRAWAL_STATUS = {
    "APPLIED": "已申请",
    "APPROVED": "已批准",
    "PAID": "已打款",
    "REJECTED": "已拒绝",
}

# ==================== 作品发布状态 ====================
PUBLISH_STATUS = {
    "DRAFT": "草稿",
    "PUBLISHED": "已发布",
    "HIDDEN": "已隐藏",
}

# ==================== 用户状态 ====================
USER_STATUS = {
    "NORMAL": "正常",
    "BANNED": "封禁",
}
