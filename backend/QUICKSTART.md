# 🚀 SkyRiff 后端 - 5分钟快速启动

## 前提条件
- ✅ Python 3.11+ 已安装
- ✅ PostgreSQL 14+ 已安装并运行
- ✅ 已创建数据库：`CREATE DATABASE skyriff;`

---

## 第1步：安装依赖（1分钟）

```bash
cd backend
pip install -r requirements.txt
```

---

## 第2步：配置环境变量（1分钟）

```bash
cp .env.example .env
```

编辑 `.env` 文件，修改数据库连接：

```bash
DATABASE_URL=postgresql://你的用户名:你的密码@localhost:5432/skyriff
SECRET_KEY=your-secret-key-change-in-production-min-32-chars
```

---

## 第3步：检查环境（30秒）

```bash
python scripts/check_setup.py
```

如果所有检查通过，继续下一步。

---

## 第4步：初始化数据库（1分钟）

```bash
python scripts/init_data.py
```

这将：
- ✅ 创建所有数据库表（15张表）
- ✅ 插入7个充值档位配置
- ✅ 插入1个月卡配置

---

## 第5步：启动服务（30秒）

```bash
python -m app.main
```

或者：

```bash
uvicorn app.main:app --reload
```

服务启动在：`http://localhost:8000`

---

## 第6步：测试接口（1分钟）

### 方式1：浏览器测试
打开：http://localhost:8000/docs

在Swagger UI中直接测试接口。

### 方式2：自动化测试
```bash
python tests/test_phase0.py
```

按提示输入验证码（从后端控制台查看）。

### 方式3：手动cURL测试

#### 1) 发送验证码
```bash
curl -X POST http://localhost:8000/api/v1/auth/send_sms \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138000", "purpose": "login"}'
```

**查看控制台**，找到验证码（开发环境会打印）：
```
📱 Mock SMS: 手机号 13800138000 收到验证码: 123456
```

#### 2) 登录
```bash
curl -X POST http://localhost:8000/api/v1/auth/login/phone \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138000", "code": "123456"}'
```

保存返回的 `token`。

#### 3) 获取钱包余额
```bash
curl -X GET http://localhost:8000/api/v1/wallets/me \
  -H "Authorization: Bearer 你的token"
```

---

## ✅ 验收标准

如果看到以下响应，说明Phase 0开发成功：

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

## 🎉 恭喜！Phase 0 完成！

下一步：
- 📖 查看 `/docs/04-开发优先级清单.md` 了解Phase 1任务
- 🔌 查看 `/docs/06-供应商API对接文档.md` 准备对接Sora2
- 💡 查看 `/backend/README.md` 了解更多技术细节

---

## ❓ 常见问题

### Q1：数据库连接失败
**A**：检查：
1. PostgreSQL是否运行：`pg_isready`
2. 数据库是否存在：`psql -l | grep skyriff`
3. 用户名密码是否正确

### Q2：导入错误
**A**：确保从 `backend/` 目录运行，不要在 `backend/app/` 内运行。

### Q3：端口被占用
**A**：修改启动命令：
```bash
uvicorn app.main:app --reload --port 8001
```

---

## 📞 获取帮助

1. 查看 `/docs/08-常见问题FAQ.md`
2. 查看 `/backend/README.md`
3. 检查后端控制台日志
