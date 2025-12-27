# 🐛 常见问题 FAQ

## 🔍 快速查找

| 问题分类 | 跳转链接 |
|---------|---------|
| 启动问题 | [启动相关](#启动问题) |
| 端口占用 | [端口问题](#端口占用问题) |
| 数据库问题 | [数据库相关](#数据库问题) |
| 前后端连接 | [连接问题](#前后端连接问题) |
| 文件错误 | [文件相关](#文件错误) |

---

## 启动问题

### Q1: 后端启动失败，报错 "SyntaxError"

**错误信息：**
```
SyntaxError: unexpected character after line continuation character
File: D:\Figma_skyriff\backend\app\db\models.py, line 375
```

**原因：** 文件中混入了非法转义字符

**✅ 解决方法：** 已修复！直接重启后端即可：
```bash
cd D:\Figma_skyriff\backend
python -m app.main
```

---

### Q2: 前端启动后浏览器不自动打开

**✅ 解决方法：**

手动打开浏览器访问：**http://localhost:5173**

---

### Q3: 启动后显示"后端离线"（红色状态框）

**可能原因：**
1. 后端未启动
2. 后端启动失败
3. 端口被占用

**✅ 解决方法：**

1. 检查后端命令行窗口是否有错误
2. 确认看到 `Uvicorn running on http://127.0.0.1:8000`
3. 浏览器访问 http://localhost:8000/health 测试

---

## 端口占用问题

### Q4: 端口 8000 被占用

**错误信息：**
```
Error: [Errno 10048] Address already in use
```

**✅ 解决方法：**

**Windows：**
```bash
# 1. 查找占用端口的进程
netstat -ano | findstr :8000

# 2. 结束进程（替换 <PID> 为实际进程ID）
taskkill /PID <PID> /F
```

**Mac/Linux：**
```bash
# 1. 查找进程
lsof -i :8000

# 2. 结束进程
kill -9 <PID>
```

---

### Q5: 端口 5173 被占用

**✅ 解决方法：**

同上，将端口号改为 5173

---

## 数据库问题

### Q6: 数据库文件不存在

**错误信息：**
```
sqlite3.OperationalError: unable to open database file
```

**✅ 解决方法：**

```bash
cd D:\Figma_skyriff\backend
python scripts/init_data.py
```

---

### Q7: 表结构不匹配

**错误信息：**
```
sqlalchemy.exc.OperationalError: no such table: users
```

**✅ 解决方法：**

重新初始化数据库：
```bash
cd D:\Figma_skyriff\backend

# 删除旧数据库（谨慎！会丢失数据）
rm skyriff.db  # Linux/Mac
del skyriff.db  # Windows

# 重新初始化
python scripts/init_data.py
```

---

## 前后端连接问题

### Q8: 前端请求后端 404

**错误信息：**
```
GET http://localhost:8000/api/health 404 (Not Found)
```

**✅ 解决方法：**

1. 检查后端是否在 8000 端口运行
2. 确认后端路由正确
3. 查看后端日志是否有错误

---

### Q9: CORS 跨域错误

**错误信息：**
```
Access to fetch at 'http://localhost:8000' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**✅ 解决方法：**

后端已配置 CORS，如果还有问题：

```python
# backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # 添加你的前端地址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 文件错误

### Q10: 找不到模块

**错误信息：**
```
ModuleNotFoundError: No module named 'fastapi'
```

**✅ 解决方法：**

```bash
# 后端依赖
cd backend
pip install -r requirements.txt

# 前端依赖
cd ..
npm install
```

---

### Q11: Python 版本不兼容

**错误信息：**
```
SyntaxError: invalid syntax (match-case requires Python 3.10+)
```

**✅ 解决方法：**

安装 Python 3.10 或更高版本：
- 下载：https://www.python.org/downloads/
- 安装后重新运行

---

## 其他问题

### Q12: 验证码收不到

**原因：** Mock 环境下，验证码直接打印在后端命令行

**✅ 解决方法：**

查看后端命令行窗口，找到：
```
[MOCK] 发送验证码: 手机号=13800138000, 验证码=123456
```

---

### Q13: 登录失败

**可能原因：**
1. 验证码错误
2. 验证码过期（5分钟）
3. 后端数据库问题

**✅ 解决方法：**

1. 检查验证码是否正确（从后端日志复制）
2. 重新获取验证码
3. 查看后端日志错误信息

---

### Q14: 生成视频失败

**原因：** 使用 Mock API，返回模拟数据

**✅ 解决方法：**

这是正常的！Mock 环境下：
- 视频生成会返回示例链接
- 数据都是模拟的
- 真实环境需要配置 Sora API Key

---

## 💡 还是解决不了？

### 检查清单

- [ ] Python 版本 >= 3.10
- [ ] Node.js 版本 >= 18
- [ ] 后端成功启动（看到 Uvicorn running）
- [ ] 前端成功启动（浏览器自动打开）
- [ ] 两个服务都在运行
- [ ] 没有端口冲突

### 终极解决方案

重新来一遍：

```bash
# 1. 关闭所有命令行窗口
# 2. 重新启动

cd D:\Figma_skyriff
双击运行: 启动.bat
```

---

## 📞 获取帮助

如果以上方法都不行：

1. 查看后端完整错误日志
2. 查看浏览器控制台错误
3. 检查文件是否完整
4. 重新下载项目

---

## 🎯 相关文档

- [快速启动指南](./01-快速启动指南.md)
- [生产部署架构](./03-生产部署架构.md)
- [前后端连接说明](./06-前后端连接说明.md)
