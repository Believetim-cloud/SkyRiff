"""
Phase 4 数据初始化脚本
初始化任务定义和商品数据
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.database import SessionLocal, engine, Base
from app.db.models import TaskDefinition, Product


def init_task_definitions(db):
    """初始化任务定义"""
    tasks = [
        # 活跃类
        {
            "task_key": "login_daily",
            "title": "每日登录",
            "description": "每天登录即可领取2积分",
            "reward_credits": 2,
            "category": "active",
            "is_repeatable": True,
            "is_active": True
        },
        # 创作类
        {
            "task_key": "gen_success",
            "title": "生成视频",
            "description": "成功生成1个视频",
            "reward_credits": 2,
            "category": "create",
            "is_repeatable": True,
            "is_active": True
        },
        {
            "task_key": "publish_work",
            "title": "发布作品",
            "description": "发布1个作品到社区",
            "reward_credits": 2,
            "category": "create",
            "is_repeatable": True,
            "is_active": True
        },
        # 社交类
        {
            "task_key": "like_work",
            "title": "点赞作品",
            "description": "给其他用户的作品点赞",
            "reward_credits": 2,
            "category": "social",
            "is_repeatable": True,
            "is_active": True
        },
        {
            "task_key": "follow_user",
            "title": "关注用户",
            "description": "关注1个创作者",
            "reward_credits": 2,
            "category": "social",
            "is_repeatable": True,
            "is_active": True
        },
        {
            "task_key": "tip_and_favorite",
            "title": "打赏并收藏",
            "description": "打赏并收藏1个作品",
            "reward_credits": 2,
            "category": "social",
            "is_repeatable": True,
            "is_active": True
        },
    ]
    
    for task_data in tasks:
        # 检查是否已存在
        existing = db.query(TaskDefinition).filter(
            TaskDefinition.task_key == task_data['task_key']
        ).first()
        
        if not existing:
            task_def = TaskDefinition(**task_data)
            db.add(task_def)
    
    db.commit()
    print(f"✅ 初始化了 {len(tasks)} 个任务定义")


def init_products(db):
    """初始化商品数据"""
    products = [
        # 充值档位
        {
            "product_type": "recharge",
            "name": "100积分",
            "price_yuan": 6.00,
            "credits": 100,
            "bonus_credits": 0,
            "is_active": True
        },
        {
            "product_type": "recharge",
            "name": "600积分",
            "price_yuan": 30.00,
            "credits": 600,
            "bonus_credits": 0,
            "is_active": True
        },
        {
            "product_type": "recharge",
            "name": "1500积分",
            "price_yuan": 68.00,
            "credits": 1500,
            "bonus_credits": 100,  # 赠送100
            "is_active": True
        },
        {
            "product_type": "recharge",
            "name": "3200积分",
            "price_yuan": 128.00,
            "credits": 3200,
            "bonus_credits": 300,  # 赠送300
            "is_active": True
        },
        # 月卡
        {
            "product_type": "subscription",
            "name": "月卡会员",
            "price_yuan": 29.00,
            "credits": None,
            "bonus_credits": 0,
            "duration_days": 30,
            "daily_credits": 30,  # 每日可领30积分
            "is_active": True
        },
    ]
    
    # 清空旧数据（可选）
    db.query(Product).delete()
    
    for product_data in products:
        product = Product(**product_data)
        db.add(product)
    
    db.commit()
    print(f"✅ 初始化了 {len(products)} 个商品")


def main():
    """主函数"""
    print("🚀 开始初始化 Phase 4 数据...")
    
    # 创建所有表（如果不存在）
    Base.metadata.create_all(bind=engine)
    
    # 创建数据库会话
    db = SessionLocal()
    
    try:
        # 初始化任务定义
        init_task_definitions(db)
        
        # 初始化商品
        init_products(db)
        
        print("🎉 Phase 4 数据初始化完成！")
        
    except Exception as e:
        print(f"❌ 初始化失败: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
