"""
数据库初始化脚本
插入产品配置数据（充值档位、月卡等）
"""
import sys
import os

# 添加父目录到Python路径
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.database import SessionLocal, init_db
from app.db.models import Product
from app.core.constants import RECHARGE_TIERS, SUBSCRIPTION_CONFIG


def init_products():
    """初始化商品配置"""
    db = SessionLocal()
    
    try:
        # 检查是否已初始化
        existing = db.query(Product).first()
        if existing:
            print("⚠️  Products already initialized, skipping...")
            return
        
        print("📦 Initializing products...")
        
        # 1. 插入充值档位
        for tier in RECHARGE_TIERS:
            product = Product(
                product_id=tier["product_id"],
                product_type="recharge",
                name=f"充值{tier['price_yuan']}元",
                price_yuan=tier["price_yuan"],
                credits=tier["credits"],
                bonus_credits=tier["bonus_credits"],
                is_active=True
            )
            db.add(product)
            print(f"  ✅ {product.name}: {tier['credits']}积分")
        
        # 2. 插入月卡
        subscription = Product(
            product_id=SUBSCRIPTION_CONFIG["product_id"],
            product_type="subscription",
            name="月卡会员",
            price_yuan=SUBSCRIPTION_CONFIG["price_yuan"],
            duration_days=SUBSCRIPTION_CONFIG["duration_days"],
            daily_credits=SUBSCRIPTION_CONFIG["daily_credits"],
            is_active=True
        )
        db.add(subscription)
        print(f"  ✅ {subscription.name}: {SUBSCRIPTION_CONFIG['price_yuan']}元/月")
        
        db.commit()
        print("✅ Products initialized successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


def main():
    """主函数"""
    print("=" * 60)
    print("SkyRiff 数据库初始化")
    print("=" * 60)
    
    # 1. 创建表
    print("\n📋 Step 1: Creating tables...")
    init_db()
    
    # 2. 插入初始数据
    print("\n📋 Step 2: Inserting initial data...")
    init_products()
    
    print("\n" + "=" * 60)
    print("✅ Database initialization completed!")
    print("=" * 60)


if __name__ == "__main__":
    main()
