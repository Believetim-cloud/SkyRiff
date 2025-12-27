# ⚙️ SkyRiff 配置指南

## 🔍 刚才的错误原因

你遇到的错误是：
```
ValidationError: 2 validation errors for Settings
DATABASE_URL
  Field required [type=missing]
SECRET_KEY
  Field required [type=missing]
```

**原因：** 缺少 `.env` 配置文件

**解决方案：** 已自动创建 `.env` 文件，包含所有必需配置

---

## ✅ 已完成的修复

1. ✅ 创建了 `.env` 配置文件（包含所有必需配置）
2. ✅ 创建了 `.env.example` 模板文件
3. ✅ 更新了 `config.py`，添加了默认值
4. ✅ 创建了 `setup_config.bat` 配置工具

---

## 🚀 立即启动（配置已就绪）

现在可以直接启动后端了：

```cmd
cd /d D:\Figma_skyriff\backend
start_backend.bat
```

如果启动成功，会看到：
```
INFO: Uvicorn running on http://0.0.0.0:8000
INFO: Application startup complete.
```

---

## 📂 配置文件说明

### 1. `.env` - 实际配置文件

**位置：** `D:\Figma_skyriff\backend\.env`

**用途：** 存储实际的环境变量配置

**内容：**
```env
# 数据库配置（使用 SQLite，无需安装 PostgreSQL）
DATABASE_URL=sqlite:///./skyriff.db

# 安全密钥
SECRET_KEY=your-secret-key-here-change-this-in-production-skyriff-2024

# 其他配置...
```

### 2. `.env.example` - 配置模板

**位置：** `D:\Figma_skyriff\backend\.env.example`

**用途：** 配置文件的示例模板

**使用方法：**
```cmd
# 复制模板创建配置文件
copy .env.example .env

# 编辑配置文件
notepad .env
```

### 3. `setup_config.bat` - 配置工具

**位置：** `D:\Figma_skyriff\backend\setup_config.bat`

**用途：** 自动创建和管理配置文件

**使用方法：**
```cmd
# 运行配置工具
setup_config.bat
```

---

## 🗄️ 数据库配置

### 方式 1：SQLite（推荐开发使用）✅

**优点：**
- ✅ 无需安装额外软件
- ✅ 配置简单，开箱即用
- ✅ 适合开发和测试

**配置：**
```env
DATABASE_URL=sqlite:///./skyriff.db
```

**数据库文件位置：**
```
D:\Figma_skyriff\backend\skyriff.db
```

### 方式 2：PostgreSQL（推荐生产使用）

**优点：**
- ✅ 性能更好
- ✅ 支持高并发
- ✅ 适合生产环境

**配置：**
```env
DATABASE_URL=postgresql://skyriff:skyriff123@localhost:5432/skyriff_db
```

**安装步骤：**

1. 下载 PostgreSQL：https://www.postgresql.org/download/windows/

2. 创建数据库：
```sql
CREATE DATABASE skyriff_db;
CREATE USER skyriff WITH PASSWORD 'skyriff123';
GRANT ALL PRIVILEGES ON DATABASE skyriff_db TO skyriff;
```

3. 修改 `.env` 文件中的 `DATABASE_URL`

---

## 🔐 安全配置

### SECRET_KEY（JWT 密钥）

**重要性：** ⚠️ 非常重要，用于加密 JWT token

**当前配置：**
```env
SECRET_KEY=your-secret-key-here-change-this-in-production-skyriff-2024
```

**生产环境必须更换！**

**生成安全密钥：**
```cmd
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**示例输出：**
```
xK3mP9qL7wN2vB5tY8uE4rT6iO1pA3sD
```

**更新配置：**
```env
SECRET_KEY=xK3mP9qL7wN2vB5tY8uE4rT6iO1pA3sD
```

---

## 📋 完整配置参数

### 应用配置

```env
APP_NAME=SkyRiff              # 应用名称
DEBUG=True                     # 调试模式（生产环境改为 False）
ENVIRONMENT=development        # 环境：development/staging/production
```

### 数据库配置

```env
DATABASE_URL=sqlite:///./skyriff.db   # 数据库连接字符串
```

### JWT 配置

```env
SECRET_KEY=your-secret-key             # JWT 密钥（必须修改）
ACCESS_TOKEN_EXPIRE_DAYS=7             # Token 过期天数
ALGORITHM=HS256                        # 加密算法
```

### Redis 配置（可选）

```env
REDIS_URL=redis://localhost:6379/0     # Redis 连接
```

### 短信配置

```env
SMS_PROVIDER=mock              # 短信服务商：mock/aliyun/tencent
SMS_API_KEY=                   # 短信 API 密钥（可选）
```

### 外部 API 配置

```env
DYUAPI_BASE_URL=https://api.dyuapi.com   # DyuAPI 地址
DYUAPI_API_KEY=                          # DyuAPI 密钥（可选）
```

### 文件存储配置

```env
STORAGE_TYPE=local             # 存储类型：local/oss
UPLOAD_DIR=./uploads           # 上传目录
```

### 日志配置

```env
LOG_LEVEL=INFO                 # 日志级别：DEBUG/INFO/WARNING/ERROR
```

---

## 🛠️ 配置管理工具

### 查看当前配置

```cmd
# 方法 1：直接查看文件
type .env

# 方法 2：使用记事本编辑
notepad .env

# 方法 3：使用配置工具
setup_config.bat
```

### 重置配置

```cmd
# 删除现有配置
del .env

# 从模板创建新配置
copy .env.example .env

# 或使用配置工具
setup_config.bat
```

### 备份配置

```cmd
# 创建备份
copy .env .env.backup

# 恢复备份
copy .env.backup .env
```

---

## 🧪 验证配置

### 方法 1：启动服务器

```cmd
start_backend.bat
```

**成功标志：**
```
INFO: Uvicorn running on http://0.0.0.0:8000
INFO: Application startup complete.
```

### 方法 2：使用环境检查工具

```cmd
check_environment.bat
```

**查看输出：**
```
[5/7] Checking configuration file...
[OK] .env file exists
```

---

## ⚠️ 常见问题

### Q1：启动时提示 "Field required"

**A：** 缺少必需的配置参数

**解决方案：**
```cmd
# 确保 .env 文件存在
dir .env

# 如果不存在，运行配置工具
setup_config.bat
```

### Q2：数据库连接失败

**A：** 数据库配置错误或数据库未运行

**解决方案：**
```env
# 使用 SQLite（无需额外配置）
DATABASE_URL=sqlite:///./skyriff.db
```

### Q3：如何修改配置？

**A：** 编辑 `.env` 文件，重启服务器

**步骤：**
```cmd
# 1. 停止服务器（Ctrl+C）

# 2. 编辑配置
notepad .env

# 3. 保存后重启
start_backend.bat
```

### Q4：配置文件被误删怎么办？

**A：** 从模板重新创建

**解决方案：**
```cmd
# 从模板创建
copy .env.example .env

# 或使用配置工具
setup_config.bat
```

---

## 🎯 快速参考

### 开发环境（当前配置）✅

```env
DATABASE_URL=sqlite:///./skyriff.db
SECRET_KEY=your-secret-key-here-change-this-in-production-skyriff-2024
DEBUG=True
SMS_PROVIDER=mock
STORAGE_TYPE=local
```

**特点：**
- ✅ 无需安装 PostgreSQL
- ✅ 无需真实短信服务
- ✅ 本地文件存储
- ✅ 开箱即用

### 生产环境配置

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
SECRET_KEY=<generate-strong-key>
DEBUG=False
ENVIRONMENT=production
SMS_PROVIDER=aliyun
STORAGE_TYPE=oss
LOG_LEVEL=WARNING
```

**特点：**
- ✅ 使用 PostgreSQL
- ✅ 强密钥
- ✅ 关闭调试
- ✅ 云存储
- ✅ 真实短信

---

## 📞 获取帮助

| 文档 | 说明 |
|------|------|
| `CONFIG_GUIDE.md` | 本文档 |
| `.env.example` | 配置模板 |
| `README_EMOJI_FIX.md` | 启动指南 |
| `START_HERE.txt` | 快速开始 |

---

## ✅ 下一步

配置文件已创建完成，现在可以：

```cmd
# 1. 启动后端
start_backend.bat

# 2. 测试访问
访问 http://localhost:8000/health

# 3. 查看 API 文档
访问 http://localhost:8000/docs
```

**🎉 配置完成，祝使用愉快！**

---

**最后更新：** 2024-12-26  
**状态：** ✅ 配置文件已创建  
**数据库：** SQLite（开发环境）  
**密钥：** 已设置（生产环境需更换）
