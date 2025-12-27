# SkyRiff 后端服务（Phase 0）

> **当前版本**：Phase 0 - 用户登录 + 钱包系统  
> **框架**：FastAPI + PostgreSQL + SQLAlchemy  
> **状态**：✅ 完全按照文档开发，可直接运行

---

## 📦 已实现功能

### Phase 0 核心功能
- ✅ 手机验证码登录
- ✅ JWT认证系统
- ✅ 三钱包系统（Credits/Coins/Commission）
- ✅ 用户资料管理
- ✅ 积分流水查询
- ✅ 产品配置初始化

### 数据库表（完全按照文档）
- ✅ `users` - 用户表
- ✅ `user_stats` - 用户统计
- ✅ `credit_wallets` - 生成积分钱包
- ✅ `credit_ledgers` - 积分流水
- ✅ `coin_wallets` - 创作者金币钱包
- ✅ `coin_ledgers` - 金币流水
- ✅ `commission_wallets` - 推广员佣金钱包
- ✅ `commission_ledgers` - 佣金流水
- ✅ `promoter_profiles` - 推广员身份
- ✅ `promo_credit_ledgers` - 推广积分流水
- ✅ `referral_codes` - 推广码
- ✅ `referral_bindings` - 邀请绑定
- ✅ `products` - 商品配置
- ✅ `payments` - 支付订单
- ✅ `verification_codes` - 验证码

### API接口
- ✅ `POST /api/v1/auth/send_sms` - 发送短信验证码
- ✅ `POST /api/v1/auth/login/phone` - 手机登录
- ✅ `GET /api/v1/users/me` - 获取当前用户资料
- ✅ `GET /api/v1/users/me/stats` - 获取用户统计
- ✅ `PATCH /api/v1/users/me` - 更新用户资料
- ✅ `GET /api/v1/wallets/me` - 获取三钱包余额
- ✅ `GET /api/v1/wallets/ledgers/credits` - 获取积分流水
- ✅ `GET /api/v1/wallets/ledgers/coins` - 获取金币流水

---

## 🚀 快速启动

### 1. 环境要求
- Python 3.11+
- PostgreSQL 14+
- Redis 6+（可选，Phase 1需要）

### 2. 安装依赖
```bash
cd backend
pip install -r requirements.txt
```

### 3. 配置环境变量
```bash
cp .env.example .env
```

编辑 `.env` 文件，修改数据库连接：
```bash
DATABASE_URL=postgresql://你的用户名:你的密码@localhost:5432/skyriff
```

### 4. 初始化数据库
```bash
python scripts/init_data.py
```

这个脚本会：
- 创建所有数据库表
- 插入7个充值档位配置
- 插入1个月卡配置

### 5. 启动服务
```bash
python -m app.main
```

或者使用uvicorn：
```bash
uvicorn app.main:app --reload
```

服务将启动在 `http://localhost:8000`

### 6. 查看API文档
打开浏览器访问：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 🧪 测试

### 自动化测试
```bash
python tests/test_phase0.py
```

### 手动测试流程

#### 1. 发送验证码
```bash
curl -X POST http://localhost:8000/api/v1/auth/send_sms \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138000", "purpose": "login"}'
```

**开发环境**会在控制台打印验证码，例如：
```
📱 Mock SMS: 手机号 13800138000 收到验证码: 123456
```

#### 2. 登录
```bash
curl -X POST http://localhost:8000/api/v1/auth/login/phone \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138000", "code": "123456"}'
```

响应：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user_id": 1,
    "is_new_user": true
  }
}
```

保存 `token` 用于后续请求。

#### 3. 获取钱包余额
```bash
curl -X GET http://localhost:8000/api/v1/wallets/me \
  -H "Authorization: Bearer 你的token"
```

响应：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "credits": 0,
    "coins_available": "0.00",
    "coins_pending": "0.00",
    "commission_available": "0.00",
    "commission_pending": "0.00"
  }
}
```

---

## 📂 项目结构

```
backend/
├── app/
│   ├── api/                    # API路由层
│   │   ├── auth.py             # 认证接口
│   │   ├── users.py            # 用户接口
│   │   ├── wallets.py          # 钱包接口
│   │   └── dependencies.py     # 依赖注入
│   │
│   ├── core/                   # 核心配置
│   │   ├── config.py           # 环境配置
│   │   ├── security.py         # JWT/加密
│   │   └── constants.py        # 常量定义
│   │
│   ├── db/                     # 数据库
│   │   ├── database.py         # 数据库连接
│   │   └── models.py           # ORM模型（15张表）
│   │
│   ├── schemas/                # Pydantic Schema
│   │   ├── common.py           # 通用Schema
│   │   ├── auth.py             # 认证Schema
│   │   ├── users.py            # 用户Schema
│   │   └── wallets.py          # 钱包Schema
│   │
│   ├── services/               # 业务逻辑层
│   │   ├── auth_service.py     # 认证服务
│   │   └── wallet_service.py   # 钱包服务
│   │
│   └── main.py                 # FastAPI主应用
│
├── scripts/
│   └── init_data.py            # 数据库初始化脚本
│
├── tests/
│   └── test_phase0.py          # Phase 0测试
│
├── requirements.txt            # Python依赖
├── .env.example                # 环境变量示例
└── README.md                   # 本文件
```

---

## ✅ Phase 0 验收标准

所有功能已实现，可验收：

- [x] 能登录（手机验证码）
- [x] 能看到三钱包余额
- [x] 新用户自动初始化钱包（余额为0）
- [x] 能查询积分流水（虽然是空的）
- [x] 所有接口使用JWT认证
- [x] 数据库表结构完全按照文档
- [x] 产品配置已初始化（7个充值档位 + 1个月卡）

---

## 🎯 下一步：Phase 1

Phase 1将实现：
- 视频生成任务（对接Sora2 API）
- 任务轮询与状态更新
- 视频资产管理
- 无水印下载（扣6积分）

参考文档：
- `/docs/04-开发优先级清单.md` - Phase 1任务清单
- `/docs/06-供应商API对接文档.md` - Sora2 API对接

---

## 📖 相关文档

所有开发文档在 `/docs` 目录：

1. **产品需求文档** - 了解业务全貌
2. **技术架构文档** - 查看完整数据库设计
3. **API接口规格文档** - 60+个接口定义
4. **开发优先级清单** - Phase 0-4详细任务
5. **业务规则配置文档** - 所有费用/比例/时间配置
6. **供应商API对接文档** - Sora2 API完整文档
7. **快速启动指南** - 10分钟快速启动
8. **常见问题FAQ** - 47个问题解答
9. **项目结构建议** - 标准化目录结构

---

## 🔧 开发说明

### 命名规范（完全按照文档）
- **表名**：users, credit_wallets（蛇形命名）
- **字段名**：user_id, created_at（蛇形命名）
- **API路径**：/api/v1/auth/login（小写+中划线）
- **变量名**：current_user（蛇形命名）

### 数据库约束
- 所有钱包余额 >= 0（CHECK约束）
- 一个用户只能绑定一个推广员（UNIQUE约束）
- 所有流水必须记录操作后余额（balance_after字段）

### 业务规则
- 新用户登录自动初始化三钱包（余额为0）
- JWT token有效期7天
- 短信验证码5分钟有效
- 开发环境验证码打印在控制台（SMS_PROVIDER=mock）

---

## 🙋 问题反馈

如遇到问题：
1. 先查看 `/docs/08-常见问题FAQ.md`
2. 检查 `.env` 配置是否正确
3. 确认数据库是否正常连接
4. 查看后端控制台日志

---

**Phase 0开发完成！✅**

所有代码完全按照文档规范编写，可直接投入使用。
