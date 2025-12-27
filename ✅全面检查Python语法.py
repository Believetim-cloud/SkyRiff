#!/usr/bin/env python3
"""
全面检查所有 Python 文件的语法
特别检查：转义引号、行尾反斜杠等常见问题
"""
import os
import ast
import re
from pathlib import Path
from typing import List, Dict, Tuple

class PythonSyntaxChecker:
    def __init__(self, root_dir="backend"):
        self.root_dir = root_dir
        self.errors = []
        self.warnings = []
        self.checked_files = 0
        
    def check_all_files(self) -> bool:
        """检查所有 Python 文件"""
        print("=" * 80)
        print("🔍 开始全面检查 Python 代码...")
        print("=" * 80)
        
        for root, dirs, files in os.walk(self.root_dir):
            for file in files:
                if file.endswith('.py'):
                    filepath = os.path.join(root, file)
                    self.check_file(filepath)
        
        self.print_report()
        return len(self.errors) == 0
    
    def check_file(self, filepath: str):
        """检查单个文件"""
        self.checked_files += 1
        print(f"\n检查: {filepath}")
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
            
            # 1. 检查 Python 语法
            try:
                ast.parse(content)
                print(f"  ✅ 语法正确")
            except SyntaxError as e:
                error_msg = f"语法错误: {e.msg} (行 {e.lineno})"
                print(f"  ❌ {error_msg}")
                self.errors.append({
                    'file': filepath,
                    'line': e.lineno,
                    'error': error_msg,
                    'text': e.text
                })
                return  # 语法错误就不继续检查了
            
            # 2. 检查转义引号（代码行中）
            escaped_quotes = self.check_escaped_quotes(filepath, lines)
            if escaped_quotes:
                self.errors.extend(escaped_quotes)
            
            # 3. 检查行尾反斜杠
            trailing_backslashes = self.check_trailing_backslashes(filepath, lines)
            if trailing_backslashes:
                self.warnings.extend(trailing_backslashes)
            
            # 4. 检查其他潜在问题
            other_issues = self.check_other_issues(filepath, lines)
            if other_issues:
                self.warnings.extend(other_issues)
                
        except Exception as e:
            error_msg = f"读取文件失败: {str(e)}"
            print(f"  ❌ {error_msg}")
            self.errors.append({
                'file': filepath,
                'error': error_msg
            })
    
    def check_escaped_quotes(self, filepath: str, lines: List[str]) -> List[Dict]:
        """检查转义引号（排除注释和文档字符串）"""
        errors = []
        in_docstring = False
        docstring_char = None
        
        for i, line in enumerate(lines, 1):
            # 跟踪文档字符串
            if '"""' in line or "'''" in line:
                if '"""' in line:
                    if not in_docstring:
                        in_docstring = True
                        docstring_char = '"""'
                    elif docstring_char == '"""':
                        in_docstring = False
                if "'''" in line:
                    if not in_docstring:
                        in_docstring = True
                        docstring_char = "'''"
                    elif docstring_char == "'''":
                        in_docstring = False
            
            # 跳过文档字符串
            if in_docstring:
                continue
            
            # 移除行内注释
            if '#' in line:
                code_part = line.split('#')[0]
            else:
                code_part = line
            
            # 检查转义引号（在代码部分）
            # 匹配模式：= \"xxx\" 或 (\"xxx\")
            if r'\"' in code_part:
                # 排除是在字符串内的情况
                # 简单检测：如果 \" 前面没有引号开始，就是错误
                pattern = r'(?<![\"\'])\\\"'
                if re.search(pattern, code_part):
                    print(f"  ⚠️  第 {i} 行: 发现转义引号")
                    errors.append({
                        'file': filepath,
                        'line': i,
                        'error': '发现转义引号 \\"',
                        'text': line.strip()
                    })
        
        return errors
    
    def check_trailing_backslashes(self, filepath: str, lines: List[str]) -> List[Dict]:
        """检查行尾反斜杠（不在字符串中的）"""
        warnings = []
        
        for i, line in enumerate(lines, 1):
            # 跳过空行和注释
            stripped = line.strip()
            if not stripped or stripped.startswith('#'):
                continue
            
            # 检查行尾反斜杠（排除字符串内）
            if line.rstrip().endswith('\\'):
                # 简单判断：如果不是在字符串内
                if not self.is_in_string(line):
                    print(f"  ⚠️  第 {i} 行: 行尾反斜杠")
                    warnings.append({
                        'file': filepath,
                        'line': i,
                        'warning': '行尾反斜杠',
                        'text': line.strip()
                    })
        
        return warnings
    
    def check_other_issues(self, filepath: str, lines: List[str]) -> List[Dict]:
        """检查其他潜在问题"""
        warnings = []
        
        for i, line in enumerate(lines, 1):
            # 检查混用制表符和空格
            if '\t' in line and '    ' in line:
                warnings.append({
                    'file': filepath,
                    'line': i,
                    'warning': '混用制表符和空格',
                    'text': line[:50]
                })
        
        return warnings
    
    def is_in_string(self, line: str) -> bool:
        """简单判断反斜杠是否在字符串内"""
        # 这是一个简化的判断
        in_string = False
        string_char = None
        
        for char in line:
            if char in ['"', "'"]:
                if not in_string:
                    in_string = True
                    string_char = char
                elif char == string_char:
                    in_string = False
        
        return in_string
    
    def print_report(self):
        """打印检查报告"""
        print("\n" + "=" * 80)
        print("📊 检查报告")
        print("=" * 80)
        print(f"检查文件数: {self.checked_files}")
        print(f"发现错误: {len(self.errors)}")
        print(f"发现警告: {len(self.warnings)}")
        
        if self.errors:
            print("\n❌ 发现以下错误:\n")
            for i, err in enumerate(self.errors, 1):
                print(f"错误 {i}:")
                print(f"  文件: {err['file']}")
                if 'line' in err:
                    print(f"  行号: {err['line']}")
                print(f"  错误: {err['error']}")
                if 'text' in err and err['text']:
                    print(f"  内容: {err['text']}")
                print("-" * 80)
        
        if self.warnings:
            print("\n⚠️  发现以下警告:\n")
            for i, warn in enumerate(self.warnings, 1):
                print(f"警告 {i}:")
                print(f"  文件: {warn['file']}")
                if 'line' in warn:
                    print(f"  行号: {warn['line']}")
                print(f"  警告: {warn['warning']}")
                if 'text' in warn:
                    print(f"  内容: {warn['text']}")
                print("-" * 80)
        
        if not self.errors and not self.warnings:
            print("\n✅ 所有文件检查通过！没有发现问题。")
        elif not self.errors:
            print("\n✅ 没有语法错误，但有一些警告需要注意。")
        else:
            print("\n❌ 发现语法错误，需要修复！")
        
        print("=" * 80)


def main():
    checker = PythonSyntaxChecker("backend")
    success = checker.check_all_files()
    
    if success:
        print("\n🎉 所有检查通过！代码可以安全使用。")
        return 0
    else:
        print("\n⚠️  发现问题，请修复后再使用。")
        print("💡 提示: 运行 '修复models文件.py' 可以自动修复部分问题。")
        return 1


if __name__ == "__main__":
    exit(main())
