# 🚀 立即启动指南

## ✅ 配置已完成！

您的API Key已经配置好了：

```
✅ API地址: https://api.dyuapi.com
✅ API Key: sk-AGzq...（已保存）
✅ .env文件: 已创建
✅ 服务器代码: 已更新
```

---

## 🎯 立即启动（3步完成）

### 第1步：进入server目录

```bash
cd server
```

### 第2步：安装依赖（首次运行）

```bash
npm install
```

这会安装：
- express - Web服务器
- axios - HTTP客户端
- cors - 跨域支持
- multer - 文件上传
- form-data - 表单数据处理

预计时间：1-2分钟

### 第3步：启动真实API服务器

```bash
npm start
```

**成功标志**：看到以下信息
```
🚀 ========================================
🎬 SkyRiff Real API Server 已启动！
🚀 ========================================

📡 服务地址: http://localhost:3001
💚 健康检查: http://localhost:3001/health
⚙️  配置信息: http://localhost:3001/config

🔧 配置:
  Sora API: https://api.dyuapi.com
  API Key: ✅ 已配置 (sk-AGzq...)

📋 可用接口:
  POST   /v1/videos              - 创建视频生成任务
  GET    /v1/videos/:id          - 查询任务进度
  GET    /v1/videos/:id/content  - 获取视频内容
  POST   /v1/chat/completions    - Chat兼容模式

✅ 准备就绪！可以开始使用真实API

💡 前端配置BASE_URL为 http://localhost:3001
```

---

## 🎬 开始生成真实AI视频

### 第1步：打开前端应用

在浏览器中点击 **"Open in New Tab"** 按钮

### 第2步：进入工作室

点击底部中间的大按钮 **"工作室"**（紫色渐变圆形按钮）

### 第3步：生成第一个视频

1. 点击 **"🎬 生成AI视频"**
2. 输入提示词，例如：
   ```
   可爱的狗 开飞机
   ```
3. 选择模型：**"竖屏 15秒"**
4. 点击 **"开始生成"**

### 第4步：等待生成

- 进度条会实时更新
- 真实API需要 **3-5分钟**
- 服务器终端会显示详细日志

### 第5步：查看视频

- 生成完成后自动跳转到 **"资产"** 页面
- 或手动点击底部 **"资产"** Tab
- 点击视频即可播放
- 支持下载和分享

---

## 🧪 验证配置

### 测试1：健康检查

```bash
curl http://localhost:3001/health
```

应该返回：
```json
{
  "status": "ok",
  "message": "SkyRiff Real API Server is running",
  "config": {
    "baseUrl": "https://api.dyuapi.com",
    "hasApiKey": true,
    "environment": "production"
  },
  "timestamp": "2024-12-22T..."
}
```

### 测试2：配置信息

```bash
curl http://localhost:3001/config
```

应该返回：
```json
{
  "baseUrl": "https://api.dyuapi.com",
  "hasApiKey": true,
  "environment": "production",
  "note": "✅ API Key已配置"
}
```

### 测试3：创建视频任务

```bash
curl -X POST http://localhost:3001/v1/videos \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "可爱的狗 开飞机",
    "model": "sora2-portrait-15s"
  }'
```

应该返回类似：
```json
{
  "id": "video_xxx...",
  "status": "pending",
  "progress": 0,
  "model": "sora2-portrait-15s",
  "created_at": 1703260800
}
```

---

## 📊 服务器日志说明

### 正常日志

```
2024-12-22T10:30:15.123Z - POST /v1/videos
📝 接收到请求: { prompt: '可爱的狗 开飞机', model: 'sora2-portrait-15s', ... }
📝 文生视频
📡 代理请求: POST https://api.dyuapi.com/v1/videos
✅ 任务创建成功: video_abc123...
```

### 查询进度

```
2024-12-22T10:30:20.456Z - GET /v1/videos/video_abc123
🔍 查询任务: video_abc123
📡 代理请求: GET https://api.dyuapi.com/v1/videos/video_abc123
```

### 错误日志

如果出现错误，会显示详细信息：
```
❌ 代理请求失败: {
  error: {
    message: "具体错误信息",
    code: 400
  }
}
```

---

## 🎯 完整使用流程

```
┌─────────────────────────────────────┐
│ 1. 启动服务器                       │
│    cd server && npm start           │
└──────────┬──────────────────────────┘
           │
           ↓
┌─────────────────────────────────────┐
│ 2. 打开前端应用                     │
│    点击 "Open in New Tab"           │
└──────────┬──────────────────────────┘
           │
           ↓
┌─────────────────────────────────────┐
│ 3. 进入工作室                       │
│    底部中间按钮 → 工作室            │
└──────────┬──────────────────────────┘
           │
           ↓
┌─────────────────────────────────────┐
│ 4. 生成AI视频                       │
│    输入提示词 → 选择模型 → 生成     │
└──────────┬──────────────────────────┘
           │
           ↓
┌─────────────────────────────────────┐
│ 5. 等待3-5分钟                      │
│    进度条实时更新                   │
└──────────┬──────────────────────────┘
           │
           ↓
┌─────────────────────────────────────┐
│ 6. 查看视频                         │
│    资产页 → 点击播放                │
└─────────────────────────────────────┘
```

---

## 🔍 故障排查

### 问题1：依赖安装失败

**解决**：
```bash
# 清理缓存
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### 问题2：端口已被占用

**错误信息**：`Error: listen EADDRINUSE: address already in use :::3001`

**解决**：
```bash
# macOS/Linux
lsof -ti:3001 | xargs kill -9

# Windows
netstat -ano | findstr :3001
taskkill /PID [PID号] /F
```

### 问题3：API请求失败

**检查清单**：
1. ✅ API Key是否正确？
   ```bash
   cat .env | grep DYUAPI_API_KEY
   ```

2. ✅ 网络连接是否正常？
   ```bash
   curl https://api.dyuapi.com/health
   ```

3. ✅ 服务器是否运行？
   ```bash
   curl http://localhost:3001/health
   ```

### 问题4：视频生成失败

**可能原因**：
- 提示词违规（被内容审查拦截）
- API余额不足
- 网络超时

**查看详细错误**：
- 服务器终端会显示具体错误信息
- 前端界面也会显示错误提示

---

## 💰 费用说明

### API计费

- 根据生成的视频时长和质量计费
- 建议先用短视频测试（10秒）
- 确认可用后再生成长视频

### 查看用量

访问 API 提供商的控制台查看：
- 当前余额
- 使用记录
- 费用明细

---

## 🎊 恭喜！您已完成配置

现在您可以：

✅ **生成真实AI视频** - 调用真实Sora2 API  
✅ **管理视频资产** - 所有视频保存在资产页  
✅ **实时查看进度** - 进度条自动更新  
✅ **下载和分享** - 完整的视频管理功能  

---

## 📞 需要帮助？

### 快速命令参考

```bash
# 启动服务器
cd server && npm start

# 查看健康状态
curl http://localhost:3001/health

# 查看配置
curl http://localhost:3001/config

# 停止服务器
Ctrl+C
```

### 文档参考

- [REAL_SERVER_README.md](./REAL_SERVER_README.md) - 真实服务器详细文档
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - 配置指南
- [../COMPLETE_USAGE_GUIDE.md](../COMPLETE_USAGE_GUIDE.md) - 完整使用指南

---

## 🎬 立即开始！

```bash
# 复制粘贴这些命令，立即启动：

cd server
npm install
npm start

# 然后打开前端应用，开始创作！
```

**祝您创作愉快！** 🚀✨

---

*立即启动指南 | 配置时间: 2024-12-22*
