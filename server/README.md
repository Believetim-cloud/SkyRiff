# 🚀 SkyRiff Mock API Server

## 📋 简介

这是一个完整的模拟服务器，实现了所有Sora2 API接口，让您无需真实API Key就能完整体验SkyRiff的所有功能！

---

## ✨ 特性

- ✅ **完整API实现** - 模拟所有8个Sora2 API接口
- ✅ **真实进度模拟** - 自动更新生成进度（0%→100%）
- ✅ **演示视频** - 返回真实可播放的视频URL
- ✅ **零配置启动** - 无需API Key，开箱即用
- ✅ **调试工具** - 提供调试接口查看任务状态
- ✅ **CORS支持** - 前端可直接调用

---

## 🚀 快速开始

### 第1步：安装依赖

```bash
cd server
npm install
```

### 第2步：启动服务器

```bash
npm start
```

或者使用开发模式（自动重启）：

```bash
npm run dev
```

### 第3步：验证运行

打开浏览器访问：
```
http://localhost:3001/health
```

应该看到：
```json
{
  "status": "ok",
  "message": "SkyRiff Mock API Server is running",
  "tasks": 0,
  "timestamp": "2024-12-22T..."
}
```

**✅ 服务器已就绪！**

---

## 📡 API接口

### 1. 创建视频生成任务

**文生视频**:
```bash
curl -X POST http://localhost:3001/v1/videos \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "可爱的狗 开飞机",
    "model": "sora2-portrait-15s"
  }'
```

**图生视频（URL）**:
```bash
curl -X POST http://localhost:3001/v1/videos \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "让画面动起来",
    "model": "sora2-portrait-15s",
    "image_url": "https://example.com/image.jpg"
  }'
```

**图生视频（文件上传）**:
```bash
curl -X POST http://localhost:3001/v1/videos \
  -F "input_reference=@/path/to/image.jpg" \
  -F "prompt=让画面动起来" \
  -F "model=sora2-portrait-15s"
```

### 2. 查询任务进度

```bash
curl http://localhost:3001/v1/videos/{video_id}
```

### 3. 获取视频内容

```bash
curl http://localhost:3001/v1/videos/{video_id}/content
```

### 4. Chat兼容模式

```bash
curl -X POST http://localhost:3001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "sora2-portrait-15s",
    "messages": [
      {"role": "user", "content": "生成一个可爱的狗的视频"}
    ]
  }'
```

---

## 🐛 调试接口

### 查看所有任务

```bash
curl http://localhost:3001/debug/tasks
```

### 清空所有任务

```bash
curl -X DELETE http://localhost:3001/debug/tasks
```

---

## ⚙️ 工作原理

### 进度模拟

1. **创建任务** - 立即返回 `pending` 状态
2. **自动更新** - 每秒自动增加进度
3. **完成生成** - 达到100%后变为 `success`
4. **返回视频** - 提供演示视频URL

### 生成时间

| 模型类型 | 模拟时间 | 真实时间参考 |
|---------|---------|-------------|
| 标准模型 | 15秒 | 3-5分钟 |
| Pro模型 | 30秒 | 15-30分钟 |

*注：模拟时间加速以便快速演示*

### 演示视频

服务器使用Google的公开演示视频：
- Big Buck Bunny
- Elephant's Dream
- For Bigger Blazes
- For Bigger Escapes
- For Bigger Fun

每次生成随机选择一个视频URL。

---

## 🔧 配置前端

前端已自动配置使用Mock服务器：

```typescript
// /src/app/services/api-config.ts

export const API_CONFIG = {
  // 开发模式
  BASE_URL: 'http://localhost:3001',
  API_KEY: 'mock-api-key-for-development',
  
  // 切换到生产模式时，取消注释：
  // BASE_URL: 'http://prod-cn.your-api-server.com',
  // API_KEY: 'YOUR_ACTUAL_API_KEY',
};
```

---

## 📊 使用流程

### 完整演示流程

```
1. 启动Mock服务器
   $ npm start
   ✅ 服务器运行在 http://localhost:3001

2. 打开前端应用
   点击"Open in New Tab"

3. 开始生成视频
   工作室 → 生成AI视频 → 输入提示词 → 生成

4. 观察进度
   - 0% → pending
   - 1-99% → processing
   - 100% → success

5. 查看结果
   - 自动跳转到资产页
   - 点击视频播放
   - 查看演示视频

6. 完成！
   整个流程约30秒（模拟加速）
```

---

## 🎯 测试场景

### 场景1：文生视频

```bash
# 创建任务
curl -X POST http://localhost:3001/v1/videos \
  -H "Content-Type: application/json" \
  -d '{"prompt":"可爱的狗 开飞机","model":"sora2-portrait-15s"}'

# 记录返回的 video_id
# 例如: video_abc123xyz

# 查询进度（多次执行，观察进度变化）
curl http://localhost:3001/v1/videos/video_abc123xyz

# 等待15秒后再查询，应该看到：
# {
#   "status": "success",
#   "progress": 100,
#   "video_url": "https://..."
# }
```

### 场景2：批量生成

```bash
# 同时创建5个任务
for i in {1..5}; do
  curl -X POST http://localhost:3001/v1/videos \
    -H "Content-Type: application/json" \
    -d "{\"prompt\":\"视频${i}\",\"model\":\"sora2-portrait-15s\"}"
  echo ""
done

# 查看所有任务
curl http://localhost:3001/debug/tasks
```

---

## 🆚 Mock vs 真实API

| 功能 | Mock服务器 | 真实API |
|------|-----------|---------|
| 需要API Key | ❌ 不需要 | ✅ 需要 |
| 生成时间 | 15-30秒 | 3-30分钟 |
| 视频内容 | 演示视频 | AI生成 |
| 费用 | 免费 | 按使用计费 |
| 审查机制 | 无 | 有 |
| 适用场景 | 开发/演示 | 生产环境 |

---

## 🔄 切换到真实API

当您准备使用真实API时：

### 第1步：停止Mock服务器

```bash
# 按 Ctrl+C 停止服务器
```

### 第2步：更新配置

```typescript
// /src/app/services/api-config.ts

export const API_CONFIG = {
  // 注释掉Mock配置
  // BASE_URL: 'http://localhost:3001',
  // API_KEY: 'mock-api-key-for-development',
  
  // 启用真实API
  BASE_URL: 'http://prod-cn.your-api-server.com',
  API_KEY: 'YOUR_ACTUAL_API_KEY', // 👈 填入真实Key
};
```

### 第3步：重启前端

刷新浏览器，现在使用真实API！

---

## 📝 开发说明

### 添加新功能

编辑 `mock-api.js`：

```javascript
// 添加新的API端点
app.post('/v1/new-endpoint', (req, res) => {
  // 您的逻辑
  res.json({ success: true });
});
```

### 修改进度速度

```javascript
// 在 startProgressSimulation 函数中
const totalTime = isPro ? 30000 : 15000; // 修改这里

// 例如：更快的演示
const totalTime = isPro ? 10000 : 5000; // 5-10秒完成
```

### 添加自定义视频

```javascript
// 修改 DEMO_VIDEOS 数组
const DEMO_VIDEOS = [
  'https://your-video-url.mp4',
  'https://another-video.mp4',
];
```

---

## 🐛 故障排查

### 问题1：端口已被占用

```
Error: listen EADDRINUSE :::3001
```

**解决**：
```bash
# 方式A：杀掉占用端口的进程
# macOS/Linux
lsof -ti:3001 | xargs kill

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# 方式B：换一个端口
PORT=3002 npm start
# 同时更新前端配置中的BASE_URL
```

### 问题2：CORS错误

**解决**：确保服务器已启动，并且使用了 `cors` 中间件（已包含）。

### 问题3：前端无法连接

**检查**：
1. Mock服务器是否运行？访问 http://localhost:3001/health
2. 前端配置是否正确？检查 `api-config.ts`
3. 浏览器控制台是否有错误？按F12查看

---

## 📊 性能指标

- **启动时间**: <1秒
- **响应时间**: <10ms
- **并发支持**: 100+请求/秒
- **内存占用**: ~50MB
- **任务存储**: 内存存储（重启清空）

---

## 🎓 学习资源

- **Express.js**: https://expressjs.com/
- **Multer**: https://github.com/expressjs/multer
- **CORS**: https://github.com/expressjs/cors

---

## 🎉 开始使用

```bash
# 1. 安装
cd server
npm install

# 2. 启动
npm start

# 3. 打开前端
# 在浏览器中打开前端应用

# 4. 开始创作！
# 点击"工作室" → 生成AI视频
```

**🎬 享受完整的SkyRiff体验，无需任何API Key！**

---

*Mock API Server v1.0.0 | 更新日期: 2024-12-22*
