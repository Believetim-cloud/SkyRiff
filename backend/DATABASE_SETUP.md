# 🗄️ SkyRiff 数据库设置指南

## 🔍 刚才的错误原因

```
sqlite3.OperationalError: no such table: users
```

**原因：** 数据库文件存在，但表结构还没有创建

**解决方案：** 运行数据库初始化脚本创建所有表

---

## ✅ 快速修复（只需 1 步）

在命令行中运行：

```cmd
cd /d D:\Figma_skyriff\backend
init_database.bat
```

或直接双击：`D:\Figma_skyriff\backend\init_database.bat`

---

## 📋 初始化脚本功能

`init_database.bat` 会自动完成：

1. ✅ 检查 Python 环境
2. ✅ 创建 .env 配置文件（如果不存在）
3. ✅ 创建所有数据库表（36张表）
4. ✅ 创建测试用户（user_id=1）
5. ✅ 初始化用户钱包（赠送100积分）
6. ✅ 验证数据库完整性

---

## 🎯 完整操作流程

### 方式 1：一键设置并启动（推荐）

```cmd
cd /d D:\Figma_skyriff\backend
setup_and_start.bat
```

**功能：**
- 自动检查并安装依赖
- 自动初始化数据库
- 自动启动后端服务器

### 方式 2：分步操作

**步骤 1：初始化数据库**
```cmd
cd /d D:\Figma_skyriff\backend
init_database.bat
```

**步骤 2：启动后端**
```cmd
start_backend.bat
```

---

## 📊 数据库表结构

初始化后会创建以下 36 张表：

### 用户体系（2张表）
- `users` - 用户基本信息
- `user_stats` - 用户统计数据

### 钱包体系（6张表）
- `credit_wallets` - 积分钱包
- `credit_ledgers` - 积分流水
- `coin_wallets` - 金币钱包
- `coin_ledgers` - 金币流水
- `frozen_coins` - 冻结金币
- `settlement_records` - 结算记录

### 任务体系（4张表）
- `generation_tasks` - 生成任务
- `task_media_assets` - 任务媒体资源
- `storyboards` - 分镜脚本
- `storyboard_shots` - 分镜镜头

### 作品体系（5张表）
- `works` - 作品表
- `work_prompt_locks` - 提示词解锁
- `work_remix_relations` - 二创关系
- `work_likes` - 点赞记录
- `work_views` - 观看记录

### 社交体系（3张表）
- `follows` - 关注关系
- `comments` - 评论
- `tips` - 打赏记录

### 资产管理（1张表）
- `media_assets` - 媒体资产

### 支付充值（2张表）
- `payment_orders` - 支付订单
- `payment_products` - 充值商品

### 月卡订阅（2张表）
- `subscription_plans` - 订阅套餐
- `user_subscriptions` - 用户订阅

### 推广员系统（3张表）
- `promoter_applications` - 推广员申请
- `promoter_stats` - 推广员统计
- `commission_records` - 佣金记录

### 任务中心（3张表）
- `user_tasks` - 用户任务
- `task_rewards` - 任务奖励
- `task_categories` - 任务分类

### 排行榜（2张表）
- `ranking_snapshots` - 排行榜快照
- `ranking_entries` - 排行榜记录

### 提现系统（3张表）
- `withdrawal_accounts` - 提现账户
- `withdrawal_requests` - 提现申请
- `withdrawal_records` - 提现记录

---

## 👤 测试用户信息

初始化后会自动创建测试用户：

| 字段 | 值 |
|------|-----|
| User ID | 1 |
| Phone | 13800138000 |
| Email | test@skyriff.com |
| Nickname | 测试用户 |
| Avatar | https://via.placeholder.com/150 |
| Status | normal |
| Credits | 100（赠送） |
| Coins | 0 |

**登录方式：**

前端登录时输入 `user_id: 1` 即可

---

## 🧪 验证数据库

### 方法 1：使用 Python

```python
python -c "
from app.db.database import SessionLocal
from app.db.models import User

db = SessionLocal()
user = db.query(User).filter(User.user_id == 1).first()
print(f'User: {user.nickname}')
db.close()
"
```

### 方法 2：使用 SQLite 命令行

```cmd
sqlite3 skyriff.db
```

```sql
-- 查看所有表
.tables

-- 查看用户
SELECT * FROM users;

-- 查看钱包余额
SELECT * FROM credit_wallets WHERE user_id = 1;

-- 退出
.quit
```

### 方法 3：使用 API 接口

启动后端后访问：
```
http://localhost:8000/api/v1/auth/login_mock
```

POST 请求体：
```json
{
  "user_id": 1
}
```

---

## 🔄 重置数据库

如果需要清空数据库重新开始：

### 方式 1：删除数据库文件

```cmd
cd /d D:\Figma_skyriff\backend
del skyriff.db
init_database.bat
```

### 方式 2：使用设置脚本

```cmd
setup_and_start.bat
```

选择 "Y" 重新创建数据库

---

## 📂 数据库文件位置

### SQLite（当前配置）

**文件位置：**
```
D:\Figma_skyriff\backend\skyriff.db
```

**特点：**
- ✅ 单文件，易于备份
- ✅ 无需安装额外软件
- ✅ 适合开发和测试

### PostgreSQL（生产环境）

**配置方式：**

1. 修改 `.env`：
```env
DATABASE_URL=postgresql://skyriff:skyriff123@localhost:5432/skyriff_db
```

2. 重新初始化：
```cmd
init_database.bat
```

---

## 🛠️ 数据库管理工具

### SQLite

**推荐工具：**
- DB Browser for SQLite（免费）
- DBeaver（免费，支持多种数据库）
- DataGrip（付费，功能强大）

**下载地址：**
- DB Browser: https://sqlitebrowser.org/
- DBeaver: https://dbeaver.io/
- DataGrip: https://www.jetbrains.com/datagrip/

### 使用 DB Browser

1. 下载并安装 DB Browser for SQLite
2. 打开数据库文件：`D:\Figma_skyriff\backend\skyriff.db`
3. 浏览表结构和数据
4. 执行 SQL 查询

---

## ⚠️ 常见问题

### Q1：运行 init_database.bat 报错

**A：** 确保已安装依赖

```cmd
install_dependencies.bat
init_database.bat
```

### Q2：提示 "no such table: users"

**A：** 数据库表未创建，运行初始化脚本

```cmd
init_database.bat
```

### Q3：初始化后仍然报错

**A：** 删除数据库文件重新初始化

```cmd
del skyriff.db
init_database.bat
```

### Q4：如何添加更多测试用户？

**A：** 编辑 `init_database.py`，在 `create_test_user()` 函数中添加更多用户

### Q5：数据库文件在哪里？

**A：** `D:\Figma_skyriff\backend\skyriff.db`

---

## 📜 数据库脚本说明

### init_database.py

**功能：**
- 创建所有数据库表
- 插入测试数据
- 验证数据库完整性

**运行方式：**
```cmd
python init_database.py
```

### init_database.bat

**功能：**
- 检查 Python 环境
- 创建 .env 配置
- 调用 init_database.py
- 显示初始化结果

**运行方式：**
```cmd
init_database.bat
```

### setup_and_start.bat

**功能：**
- 一键完成所有设置
- 自动安装依赖
- 自动初始化数据库
- 自动启动服务器

**运行方式：**
```cmd
setup_and_start.bat
```

---

## 🎯 快速参考

### 首次使用

```cmd
cd /d D:\Figma_skyriff\backend
setup_and_start.bat
```

### 仅初始化数据库

```cmd
cd /d D:\Figma_skyriff\backend
init_database.bat
```

### 重置数据库

```cmd
cd /d D:\Figma_skyriff\backend
del skyriff.db
init_database.bat
```

### 启动后端

```cmd
cd /d D:\Figma_skyriff\backend
start_backend.bat
```

---

## ✅ 成功标志

### 初始化成功

```
========================================
🎉 Database initialization completed successfully!
========================================

You can now:
  1. Start the backend: start_backend.bat
  2. Login with user_id: 1
  3. Visit: http://localhost:8000/docs
```

### 启动成功

```
INFO: Uvicorn running on http://0.0.0.0:8000
INFO: Application startup complete.
```

### 测试成功

访问 http://localhost:8000/health

响应：
```json
{
  "status": "healthy"
}
```

---

## 📞 获取帮助

| 文档 | 说明 |
|------|------|
| `DATABASE_SETUP.md` | 本文档 |
| `CONFIG_GUIDE.md` | 配置指南 |
| `README_EMOJI_FIX.md` | 启动指南 |

---

**🎉 现在运行 `init_database.bat` 初始化数据库吧！**

---

**最后更新：** 2024-12-26  
**状态：** ✅ 数据库初始化脚本已创建  
**表数量：** 36 张表  
**测试用户：** user_id=1
