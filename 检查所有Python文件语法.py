"""
检查所有Python文件的语法正确性
"""
import os
import py_compile
from pathlib import Path

def check_python_files(directory="backend"):
    """检查目录下所有Python文件的语法"""
    print(f"🔍 检查 {directory}/ 目录下的所有 Python 文件...")
    print("=" * 70)
    
    errors = []
    checked = 0
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.py'):
                filepath = os.path.join(root, file)
                checked += 1
                
                try:
                    py_compile.compile(filepath, doraise=True)
                    print(f"✅ {filepath}")
                except SyntaxError as e:
                    print(f"❌ {filepath}")
                    errors.append({
                        'file': filepath,
                        'error': str(e),
                        'line': e.lineno,
                        'text': e.text
                    })
    
    print("\n" + "=" * 70)
    print(f"\n📊 检查完成！")
    print(f"   总文件数: {checked}")
    print(f"   错误数: {len(errors)}\n")
    
    if errors:
        print("❌ 发现以下语法错误:\n")
        for i, err in enumerate(errors, 1):
            print(f"错误 {i}:")
            print(f"  文件: {err['file']}")
            print(f"  行号: {err['line']}")
            print(f"  内容: {err['text']}")
            print(f"  错误: {err['error']}")
            print("-" * 70)
        
        return False
    else:
        print("✅ 所有文件语法正确！")
        return True

if __name__ == "__main__":
    success = check_python_files()
    exit(0 if success else 1)
