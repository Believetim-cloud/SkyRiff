"""
修复 BigInteger 到 Integer 的脚本
SQLite 不支持 BigInteger 类型，需要全部改为 Integer
"""
import re

def fix_models_file():
    """修复 models.py 文件"""
    file_path = "app/db/models.py"
    
    print("=" * 80)
    print("🔧 修复 models.py 中的 BigInteger 类型")
    print("=" * 80)
    
    try:
        # 读取文件
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 统计需要替换的数量
        count = content.count('BigInteger')
        print(f"\n找到 {count} 处 BigInteger 需要替换")
        
        # 替换 BigInteger 为 Integer
        new_content = content.replace('BigInteger', 'Integer')
        
        # 保存文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"✅ 已将所有 BigInteger 替换为 Integer")
        print(f"✅ 修复完成！")
        
        return True
        
    except Exception as e:
        print(f"❌ 修复失败: {e}")
        return False


def main():
    print("\n")
    print("╔" + "=" * 78 + "╗")
    print("║" + " " * 20 + "SQLite BigInteger 修复工具" + " " * 28 + "║")
    print("╚" + "=" * 78 + "╝")
    print()
    
    print("SQLite 不支持 BigInteger 类型，需要改为 Integer")
    print("此脚本将自动修复 models.py 文件")
    print()
    
    if fix_models_file():
        print("\n" + "=" * 80)
        print("🎉 修复成功！")
        print("=" * 80)
        print("\n下一步操作：")
        print("  1. 删除旧数据库: del skyriff.db")
        print("  2. 重新初始化: python init_database.py")
        print("  3. 启动后端: uvicorn app.main:app --reload")
        print()
    else:
        print("\n" + "=" * 80)
        print("❌ 修复失败！")
        print("=" * 80)
        print()


if __name__ == "__main__":
    main()
