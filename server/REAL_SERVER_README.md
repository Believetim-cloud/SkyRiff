# 🚀 SkyRiff 真实API服务器

## 📋 简介

这是一个**真实的代理服务器**，能够实际调用Sora2 API，让您的APP完全可用！

---

## 🆚 两种服务器对比

| 特性 | Mock服务器 | 真实服务器 ⭐ |
|------|-----------|-------------|
| **文件** | mock-api.js | real-api-server.js |
| **需要API Key** | ❌ 不需要 | ✅ 需要 |
| **调用真实API** | ❌ 模拟 | ✅ 实际调用 |
| **视频内容** | 演示视频 | AI生成视频 |
| **生成时间** | 15-30秒 | 3-30分钟 |
| **费用** | 免费 | 按API计费 |
| **适用场景** | 开发/演示 | 生产环境 |

---

## 🚀 快速开始

### 第1步：安装依赖

```bash
cd server
npm install
```

### 第2步：配置API Key

**方式A：使用环境变量（推荐）**

```bash
# macOS/Linux
export SORA_API_KEY=your_actual_api_key
export SORA_API_BASE_URL=http://prod-cn.your-api-server.com

# Windows (CMD)
set SORA_API_KEY=your_actual_api_key
set SORA_API_BASE_URL=http://prod-cn.your-api-server.com

# Windows (PowerShell)
$env:SORA_API_KEY="your_actual_api_key"
$env:SORA_API_BASE_URL="http://prod-cn.your-api-server.com"
```

**方式B：使用.env文件（更简单）**

```bash
# 复制示例文件
cp .env.example .env

# 编辑.env文件
# 修改 SORA_API_KEY=YOUR_ACTUAL_API_KEY
```

编辑 `.env` 文件：
```env
SORA_API_BASE_URL=http://prod-cn.your-api-server.com
SORA_API_KEY=sk-your-actual-api-key-here
PORT=3001
NODE_ENV=production
```

### 第3步：启动真实服务器

```bash
npm start
```

看到以下信息表示成功：
```
🚀 ========================================
🎬 SkyRiff Real API Server 已启动！
🚀 ========================================

📡 服务地址: http://localhost:3001

🔧 配置:
  Sora API: http://prod-cn.your-api-server.com
  API Key: ✅ 已配置 (sk-xxxxx...)

✅ 准备就绪！可以开始使用真实API
```

### 第4步：验证配置

打开浏览器访问：
```
http://localhost:3001/config
```

应该看到：
```json
{
  "baseUrl": "http://prod-cn.your-api-server.com",
  "hasApiKey": true,
  "environment": "production",
  "note": "✅ API Key已配置"
}
```

**✅ 配置成功！现在可以使用真实API了！**

---

## 📡 工作原理

### 代理架构

```
前端APP
   ↓
本地服务器 (localhost:3001)
   ↓ 代理转发
Sora2 API (prod-cn.your-api-server.com)
   ↓
返回结果
   ↓
前端APP
```

### 为什么需要代理服务器？

1. **保护API Key** - API Key只在服务器端，不暴露给前端
2. **CORS处理** - 解决跨域问题
3. **文件上传** - 处理图片上传的FormData
4. **统一管理** - 集中处理所有API请求
5. **日志记录** - 便于调试和监控

---

## 🔧 使用方法

### 启动真实服务器

```bash
# 标准启动
npm start

# 开发模式（自动重启）
npm run dev
```

### 启动Mock服务器（测试用）

```bash
# Mock服务器（无需API Key）
npm run start:mock

# Mock开发模式
npm run dev:mock
```

---

## 📊 完整使用流程

### 1. 配置服务器

```bash
# 进入server目录
cd server

# 安装依赖
npm install

# 配置API Key
cp .env.example .env
# 编辑.env，填入真实API Key
```

### 2. 启动服务器

```bash
npm start
```

### 3. 前端已自动配置

前端已经配置为使用localhost:3001：

```typescript
// /src/app/services/api-config.ts
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001',
  API_KEY: 'mock-api-key-for-development',
  // API Key在服务器端配置，前端不需要
};
```

### 4. 开始使用

打开前端APP，所有功能都会调用真实API！

---

## 🎯 测试真实API

### 测试文生视频

```bash
curl -X POST http://localhost:3001/v1/videos \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "可爱的狗 开飞机",
    "model": "sora2-portrait-15s"
  }'
```

预期响应：
```json
{
  "id": "video_abc123...",
  "status": "pending",
  "progress": 0,
  "model": "sora2-portrait-15s",
  "created_at": 1703260800
}
```

### 查询进度

```bash
# 使用上一步返回的video_id
curl http://localhost:3001/v1/videos/video_abc123...
```

### 测试图片上传

```bash
curl -X POST http://localhost:3001/v1/videos \
  -F "input_reference=@/path/to/image.jpg" \
  -F "prompt=让画面动起来" \
  -F "model=sora2-portrait-15s"
```

---

## 🔄 切换服务器模式

### 当前使用Mock → 切换到真实API

**第1步**：确保真实服务器配置好API Key

```bash
# 检查配置
curl http://localhost:3001/config
```

**第2步**：停止Mock服务器（如果在运行）

按 `Ctrl+C` 停止

**第3步**：启动真实服务器

```bash
npm start
```

**第4步**：前端无需修改

前端配置已经指向 `localhost:3001`，会自动使用真实服务器！

---

## 🐛 故障排查

### 问题1：API Key未配置

**症状**：
```
⚠️  API Key: 未配置
```

**解决**：
```bash
# 方式A：环境变量
export SORA_API_KEY=your_key

# 方式B：.env文件
echo "SORA_API_KEY=your_key" > .env
```

### 问题2：API请求失败

**检查步骤**：

1. 检查服务器日志
```bash
# 终端会显示详细日志
📡 代理请求: POST http://...
✅ 任务创建成功: video_xxx
或
❌ 代理请求失败: ...
```

2. 验证API Key
```bash
curl http://localhost:3001/config
```

3. 测试连接
```bash
curl http://localhost:3001/health
```

### 问题3：上传图片失败

**原因**：文件路径或格式问题

**解决**：
```bash
# 确保文件存在
ls /path/to/image.jpg

# 确保是图片格式
file /path/to/image.jpg

# 使用绝对路径
curl -F "input_reference=@$(pwd)/image.jpg" ...
```

---

## 📝 环境变量说明

### 必填变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `SORA_API_KEY` | Sora2 API密钥 | sk-xxx... |
| `SORA_API_BASE_URL` | Sora2 API地址 | http://prod-cn... |

### 可选变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `PORT` | 服务器端口 | 3001 |
| `NODE_ENV` | 运行环境 | development |

---

## 🔒 安全建议

### API Key保护

1. ✅ **使用.env文件**
   ```bash
   # .env文件已在.gitignore中
   # 不会被提交到Git
   ```

2. ✅ **使用环境变量**
   ```bash
   export SORA_API_KEY=xxx
   # 不写在代码里
   ```

3. ❌ **不要硬编码**
   ```javascript
   // 错误示例
   const API_KEY = 'sk-12345...'; // ❌
   ```

### 生产环境部署

```bash
# 使用生产模式
NODE_ENV=production npm start

# 使用PM2管理
pm2 start real-api-server.js --name skyriff-api

# 使用Docker
docker build -t skyriff-api .
docker run -e SORA_API_KEY=xxx -p 3001:3001 skyriff-api
```

---

## 📊 性能优化

### 请求日志

服务器会自动记录所有请求：

```
2024-12-22T... - POST /v1/videos
📡 代理请求: POST http://prod-cn.../v1/videos
✅ 任务创建成功: video_xxx
```

### 错误处理

所有API错误都会被捕获并转发：

```javascript
{
  "error": {
    "message": "具体错误信息",
    "type": "api_error",
    "code": 400
  }
}
```

---

## 🎓 开发说明

### 添加新的API端点

编辑 `real-api-server.js`：

```javascript
app.post('/v1/new-endpoint', async (req, res) => {
  const result = await proxySoraRequest(
    'POST',
    '/v1/new-endpoint',
    req.body
  );
  
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(result.error.code).json({
      error: result.error
    });
  }
});
```

### 自定义中间件

```javascript
// 请求限流
const rateLimit = require('express-rate-limit');
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 最多100个请求
}));
```

---

## 📦 部署建议

### 本地开发

```bash
npm run dev
```

### 生产环境

```bash
# 方式A：直接运行
NODE_ENV=production npm start

# 方式B：使用PM2
npm install -g pm2
pm2 start real-api-server.js
pm2 save
pm2 startup

# 方式C：使用systemd
sudo nano /etc/systemd/system/skyriff-api.service
sudo systemctl start skyriff-api
sudo systemctl enable skyriff-api
```

---

## 🎉 开始使用真实API！

现在您的APP已经完全可用：

1. ✅ **UI已修复** - 图片正确显示在手机界面
2. ✅ **真实服务器** - 实际调用Sora2 API
3. ✅ **完整功能** - 所有4大功能都可用
4. ✅ **生产就绪** - 可以实际生成AI视频

**立即开始创作真实的AI视频作品吧！** 🎬✨

---

## 💡 快速命令参考

```bash
# 安装
cd server && npm install

# 配置
cp .env.example .env
# 编辑.env文件

# 启动真实服务器
npm start

# 启动Mock服务器（测试）
npm run start:mock

# 检查配置
curl http://localhost:3001/config

# 健康检查
curl http://localhost:3001/health
```

---

*Real API Server v1.0.0 | 更新日期: 2024-12-22*
