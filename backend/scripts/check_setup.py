"""
环境检查脚本
检查所有依赖和配置是否正确
"""
import sys
import os

def check_python_version():
    """检查Python版本"""
    print("🐍 检查Python版本...")
    version = sys.version_info
    if version.major == 3 and version.minor >= 11:
        print(f"  ✅ Python {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print(f"  ❌ Python版本过低: {version.major}.{version.minor}.{version.micro}")
        print("     需要Python 3.11+")
        return False


def check_packages():
    """检查必要的包"""
    print("\n📦 检查依赖包...")
    required = [
        "fastapi",
        "uvicorn",
        "sqlalchemy",
        "psycopg2",
        "pydantic",
        "jose",
        "passlib"
    ]
    
    missing = []
    for package in required:
        try:
            __import__(package)
            print(f"  ✅ {package}")
        except ImportError:
            print(f"  ❌ {package} 未安装")
            missing.append(package)
    
    if missing:
        print(f"\n  请安装缺失的包：pip install {' '.join(missing)}")
        return False
    return True


def check_env_file():
    """检查环境变量文件"""
    print("\n⚙️  检查环境配置...")
    env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
    
    if not os.path.exists(env_path):
        print("  ❌ .env 文件不存在")
        print("     请复制 .env.example 为 .env 并修改配置")
        return False
    
    print("  ✅ .env 文件存在")
    
    # 检查关键配置
    with open(env_path, 'r') as f:
        content = f.read()
        
        checks = [
            ("DATABASE_URL", "数据库连接"),
            ("SECRET_KEY", "密钥"),
        ]
        
        for key, name in checks:
            if key in content:
                print(f"  ✅ {name} ({key}) 已配置")
            else:
                print(f"  ❌ {name} ({key}) 未配置")
                return False
    
    return True


def check_database_connection():
    """检查数据库连接"""
    print("\n🗄️  检查数据库连接...")
    
    try:
        # 添加父目录到路径
        sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
        
        from app.core.config import settings
        from sqlalchemy import create_engine
        
        # 尝试连接数据库
        engine = create_engine(settings.DATABASE_URL)
        conn = engine.connect()
        conn.close()
        
        print("  ✅ 数据库连接成功")
        print(f"     {settings.DATABASE_URL.split('@')[1] if '@' in settings.DATABASE_URL else '***'}")
        return True
        
    except Exception as e:
        print(f"  ❌ 数据库连接失败: {e}")
        print("\n  请检查：")
        print("  1. PostgreSQL是否已启动")
        print("  2. DATABASE_URL配置是否正确")
        print("  3. 数据库是否已创建（CREATE DATABASE skyriff;）")
        return False


def main():
    """主检查流程"""
    print("=" * 60)
    print("SkyRiff 后端环境检查")
    print("=" * 60)
    
    checks = [
        ("Python版本", check_python_version),
        ("依赖包", check_packages),
        ("环境配置", check_env_file),
        ("数据库连接", check_database_connection),
    ]
    
    results = []
    for name, check_func in checks:
        result = check_func()
        results.append((name, result))
    
    # 总结
    print("\n" + "=" * 60)
    print("检查结果汇总")
    print("=" * 60)
    
    all_passed = True
    for name, result in results:
        status = "✅ 通过" if result else "❌ 失败"
        print(f"  {name}: {status}")
        if not result:
            all_passed = False
    
    print("=" * 60)
    
    if all_passed:
        print("\n🎉 所有检查通过！可以启动服务了：")
        print("\n  1. 初始化数据库：python scripts/init_data.py")
        print("  2. 启动服务：python -m app.main")
        print("  3. 访问API文档：http://localhost:8000/docs")
    else:
        print("\n⚠️  部分检查失败，请先解决上述问题")
        sys.exit(1)


if __name__ == "__main__":
    main()
