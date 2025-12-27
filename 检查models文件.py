"""
检查 models.py 中的潜在语法错误
"""

def check_models_file():
    file_path = r"D:\Figma_skyriff\backend\app\db\models.py"
    
    print("🔍 检查 models.py 文件...")
    print("=" * 60)
    
    problems_found = []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    for i, line in enumerate(lines, 1):
        # 检查1: 行尾反斜杠（非字符串内）
        if line.rstrip().endswith('\\'):
            if '"""' not in line and "'''" not in line:
                problems_found.append({
                    'line': i,
                    'type': '行尾反斜杠',
                    'content': line.rstrip()
                })
        
        # 检查2: 转义引号 \"
        if '\\"' in line:
            problems_found.append({
                'line': i,
                'type': '转义引号 \\"',
                'content': line.rstrip()
            })
        
        # 检查3: 异常的反斜杠模式
        if '\\' in line:
            # 排除正常的转义字符
            if not any(escape in line for escape in ['\\n', '\\t', '\\r', '\\\\']):
                if '"' in line or "'" in line:
                    problems_found.append({
                        'line': i,
                        'type': '可疑的反斜杠',
                        'content': line.rstrip()
                    })
    
    if problems_found:
        print(f"❌ 发现 {len(problems_found)} 个潜在问题:\n")
        
        for problem in problems_found:
            print(f"第 {problem['line']} 行 - {problem['type']}")
            print(f"内容: {problem['content']}")
            print("-" * 60)
    else:
        print("✅ 未发现明显的语法错误！")
    
    print("\n" + "=" * 60)
    print("💡 建议:")
    print("1. 如果发现问题，运行 '修复models文件.py' 自动修复")
    print("2. 或者手动编辑文件，删除所有 \\ 和 \\\"")
    print("3. 修复后重新启动后端测试")

if __name__ == "__main__":
    try:
        check_models_file()
    except FileNotFoundError:
        print("❌ 文件不存在，请检查路径:")
        print("   D:\\Figma_skyriff\\backend\\app\\db\\models.py")
    except Exception as e:
        print(f"❌ 错误: {e}")
        import traceback
        traceback.print_exc()
