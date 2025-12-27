"""
数据库初始化脚本
创建所有数据表并插入测试数据
"""
import sys
from pathlib import Path

# 添加项目根目录到路径
sys.path.insert(0, str(Path(__file__).parent))

from app.db.database import Base, engine, SessionLocal
from app.db import models
from datetime import datetime


def create_tables():
    """创建所有数据表"""
    print("=" * 80)
    print("🗄️  Creating database tables...")
    print("=" * 80)
    
    # 创建所有表
    Base.metadata.create_all(bind=engine)
    
    print("\n✅ All tables created successfully!")
    print("\nCreated tables:")
    for table_name in Base.metadata.tables.keys():
        print(f"  - {table_name}")


def create_test_user():
    """创建测试用户"""
    print("\n" + "=" * 80)
    print("👤 Creating test user...")
    print("=" * 80)
    
    db = SessionLocal()
    try:
        # 检查是否已存在测试用户
        existing_user = db.query(models.User).filter(models.User.user_id == 1).first()
        if existing_user:
            print("\n⚠️  Test user (user_id=1) already exists, skipping...")
            return
        
        # 创建测试用户
        test_user = models.User(
            user_id=1,
            phone="13800138000",
            email="test@skyriff.com",
            nickname="测试用户",
            avatar_url="https://via.placeholder.com/150",
            bio="这是一个测试用户",
            status="normal"
        )
        db.add(test_user)
        
        # 创建用户统计
        user_stats = models.UserStats(
            user_id=1,
            total_videos_generated=0,
            total_works_published=0,
            total_likes_received=0,
            total_followers=0,
            total_following=0
        )
        db.add(user_stats)
        
        # 创建积分钱包
        credit_wallet = models.CreditWallet(
            user_id=1,
            balance_credits=100  # 赠送100积分
        )
        db.add(credit_wallet)
        
        # 创建金币钱包
        coin_wallet = models.CoinWallet(
            user_id=1,
            balance_coins=0,
            pending_coins=0
        )
        db.add(coin_wallet)
        
        db.commit()
        
        print("\n✅ Test user created successfully!")
        print("\nTest user details:")
        print(f"  User ID: 1")
        print(f"  Phone: 13800138000")
        print(f"  Email: test@skyriff.com")
        print(f"  Nickname: 测试用户")
        print(f"  Credits: 100")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Failed to create test user: {e}")
        raise
    finally:
        db.close()


def verify_database():
    """验证数据库"""
    print("\n" + "=" * 80)
    print("🔍 Verifying database...")
    print("=" * 80)
    
    db = SessionLocal()
    try:
        # 检查用户表
        user_count = db.query(models.User).count()
        print(f"\n✅ Users table: {user_count} records")
        
        # 检查钱包表
        credit_wallet_count = db.query(models.CreditWallet).count()
        print(f"✅ Credit wallets table: {credit_wallet_count} records")
        
        coin_wallet_count = db.query(models.CoinWallet).count()
        print(f"✅ Coin wallets table: {coin_wallet_count} records")
        
        # 检查统计表
        stats_count = db.query(models.UserStats).count()
        print(f"✅ User stats table: {stats_count} records")
        
        # 查询测试用户
        test_user = db.query(models.User).filter(models.User.user_id == 1).first()
        if test_user:
            print(f"\n✅ Test user found:")
            print(f"   - ID: {test_user.user_id}")
            print(f"   - Nickname: {test_user.nickname}")
            print(f"   - Phone: {test_user.phone}")
            print(f"   - Status: {test_user.status}")
            
            # 查询钱包余额
            credit_wallet = db.query(models.CreditWallet).filter(
                models.CreditWallet.user_id == 1
            ).first()
            if credit_wallet:
                print(f"   - Credits: {credit_wallet.balance_credits}")
        
    except Exception as e:
        print(f"\n❌ Verification failed: {e}")
        raise
    finally:
        db.close()


def main():
    """主函数"""
    print("\n")
    print("╔" + "=" * 78 + "╗")
    print("║" + " " * 20 + "SkyRiff Database Initialization" + " " * 27 + "║")
    print("╚" + "=" * 78 + "╝")
    print()
    
    try:
        # 1. 创建数据表
        create_tables()
        
        # 2. 创建测试用户
        create_test_user()
        
        # 3. 验证数据库
        verify_database()
        
        print("\n" + "=" * 80)
        print("🎉 Database initialization completed successfully!")
        print("=" * 80)
        print("\nYou can now:")
        print("  1. Start the backend: start_backend.bat")
        print("  2. Login with user_id: 1")
        print("  3. Visit: http://localhost:8000/docs")
        print("\n")
        
    except Exception as e:
        print("\n" + "=" * 80)
        print(f"❌ Database initialization failed!")
        print("=" * 80)
        print(f"\nError: {e}")
        print("\nPlease check:")
        print("  1. Database connection settings in .env")
        print("  2. Database server is running")
        print("  3. Database user has proper permissions")
        print("\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
