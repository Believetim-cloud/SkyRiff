"""
自动修复 models.py 中的转义引号问题
"""
import re

def fix_models_file():
    file_path = r"D:\Figma_skyriff\backend\app\db\models.py"
    
    # 读取文件
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 记录原始内容（备份）
    backup_path = file_path + ".backup"
    with open(backup_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ 已创建备份: {backup_path}")
    
    # 修复问题
    fixes_made = 0
    
    # 1. 修复 \" 转义的引号
    original_content = content
    content = content.replace('\\"', '"')
    if content != original_content:
        fixes_made += 1
        print("✅ 修复了转义引号 \\\"")
    
    # 2. 修复行尾多余的反斜杠
    original_content = content
    content = re.sub(r'\\\s*\n', '\n', content)
    if content != original_content:
        fixes_made += 1
        print("✅ 修复了行尾反斜杠")
    
    # 3. 修复中文注释中的转义
    # 查找所有可能的问题模式
    lines = content.split('\n')
    fixed_lines = []
    for i, line in enumerate(lines, 1):
        original_line = line
        
        # 检查是否有异常的反斜杠
        if '\\' in line and '"' in line:
            # 如果是注释行，清理转义
            if '#' in line:
                # 提取注释部分
                parts = line.split('#', 1)
                if len(parts) == 2:
                    code_part = parts[0]
                    comment_part = parts[1]
                    # 清理注释中的转义
                    comment_part = comment_part.replace('\\"', '"')
                    line = code_part + '#' + comment_part
            
            # 如果是字符串，检查三引号注释
            if '"""' in line or "'''" in line:
                line = line.replace('\\"', '"')
        
        fixed_lines.append(line)
        
        if line != original_line:
            fixes_made += 1
            print(f"✅ 修复第 {i} 行: {original_line[:50]}...")
    
    content = '\n'.join(fixed_lines)
    
    # 写回文件
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"\n🎉 修复完成！共修复 {fixes_made} 处问题")
    print(f"📂 原文件: {file_path}")
    print(f"📂 备份文件: {backup_path}")
    print("\n⚠️ 如果还有问题，可以从备份恢复")

if __name__ == "__main__":
    try:
        fix_models_file()
    except Exception as e:
        print(f"❌ 错误: {e}")
        import traceback
        traceback.print_exc()
