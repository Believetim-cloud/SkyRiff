# 🎬 SkyRiff 完整使用指南

## 🎉 已完成的所有更新

### ✅ 1. UI修复
- ✅ **图片显示问题已修复** - 图片现在完美显示在手机界面内
- ✅ **响应式优化** - 对话框适配移动端屏幕
- ✅ **间距调整** - 更紧凑的布局，更好的用户体验
- ✅ **文本大小** - 优化为适合移动端的字号

### ✅ 2. 真实服务器已创建
- ✅ **real-api-server.js** - 完整的代理服务器
- ✅ **实际调用Sora2 API** - 不是模拟，是真实的
- ✅ **API Key保护** - 使用环境变量，安全可靠
- ✅ **完整日志** - 详细的请求和响应日志

### ✅ 3. 一键启动脚本
- ✅ **start.sh** (macOS/Linux) - 自动化启动
- ✅ **start.bat** (Windows) - Windows支持
- ✅ **智能配置** - 自动检测和引导配置

---

## 🚀 立即开始使用

### 方式A：使用Mock服务器（推荐新手）⭐

**优点**：无需API Key，立即可用，免费

```bash
# 1. 进入server目录
cd server

# 2. 安装依赖（首次）
npm install

# 3. 启动Mock服务器
npm run start:mock

# 4. 打开前端应用
# 点击 "Open in New Tab"

# 5. 开始创作！
# 工作室 → 生成AI视频
```

### 方式B：使用真实API服务器 🆕

**优点**：真实的AI生成，实际可用

#### macOS/Linux:

```bash
# 1. 进入server目录
cd server

# 2. 运行启动脚本（会自动引导配置）
chmod +x start.sh
./start.sh

# 按提示输入API Key

# 3. 打开前端应用
# 点击 "Open in New Tab"

# 4. 开始创作真实AI视频！
```

#### Windows:

```cmd
REM 1. 进入server目录
cd server

REM 2. 双击运行 start.bat
REM 或在命令行运行：
start.bat

REM 按提示输入API Key

REM 3. 打开前端应用

REM 4. 开始创作！
```

#### 手动配置（适合高级用户）:

```bash
# 1. 进入server目录
cd server

# 2. 安装依赖
npm install

# 3. 复制配置文件
cp .env.example .env

# 4. 编辑.env文件
nano .env
# 或使用任何文本编辑器
# 修改 SORA_API_KEY=your_actual_key

# 5. 启动真实服务器
npm start

# 6. 打开前端应用
# 点击 "Open in New Tab"
```

---

## 📱 UI修复详情

### 修复的问题

#### 之前：
- ❌ 图片超出手机屏幕
- ❌ 间距过大，内容看不全
- ❌ 字体太大，不适合移动端

#### 现在：
- ✅ 图片完美适配屏幕（使用 `object-contain`）
- ✅ 紧凑的布局（padding从6减到4）
- ✅ 优化的字号（text-sm, text-xs）
- ✅ 可滚动内容区域（max-h-[95vh]）
- ✅ 删除图片预览的功能
- ✅ 响应式设计

### 新的UI特性

```
📱 移动端优化：
  • 对话框从底部滑出
  • 圆角设计（rounded-t-3xl）
  • 95%视口高度，留出安全区域
  • 可滚动内容区

💻 桌面端优化：
  • 居中显示
  • 最大宽度限制（max-w-lg）
  • 四周圆角（rounded-3xl）
  • 更好的视觉效果
```

---

## 🆕 真实服务器功能

### 核心特性

1. **API代理** - 安全地调用Sora2 API
   ```
   前端 → 本地服务器 → Sora2 API
   ```

2. **API Key保护** - 不暴露给前端
   ```javascript
   // 服务器端
   headers: { 'Authorization': `Bearer ${SORA_API_KEY}` }
   
   // 前端无需知道API Key
   ```

3. **文件上传支持** - 处理图片上传
   ```javascript
   // 自动处理FormData
   formData.append('input_reference', file);
   ```

4. **完整日志** - 便于调试
   ```
   📡 代理请求: POST /v1/videos
   ✅ 任务创建成功: video_xxx
   ```

5. **错误处理** - 友好的错误提示
   ```json
   {
     "error": {
       "message": "具体错误信息",
       "type": "api_error"
     }
   }
   ```

---

## 📊 两种服务器对比

| 特性 | Mock服务器 | 真实服务器 |
|------|-----------|-----------|
| **文件** | `mock-api.js` | `real-api-server.js` |
| **启动命令** | `npm run start:mock` | `npm start` |
| **需要API Key** | ❌ 不需要 | ✅ 需要 |
| **调用真实API** | ❌ 模拟 | ✅ 实际调用 |
| **视频内容** | 演示视频 | AI生成视频 |
| **生成时间** | 15-30秒 | 3-30分钟 |
| **费用** | 💚 完全免费 | 💰 按API计费 |
| **进度模拟** | ✅ 自动更新 | ✅ 真实进度 |
| **适用场景** | 学习/开发/演示 | 生产环境 |
| **推荐人群** | 新手/开发者 | 正式用户 |

---

## 🎯 完整使用流程

### 场景1：快速体验（使用Mock）

```
第1步：启动Mock服务器
├─ cd server
├─ npm install
└─ npm run start:mock
  ✅ 15秒启动完成

第2步：打开前端
├─ 点击 "Open in New Tab"
└─ 看到SkyRiff界面
  ✅ APP已打开

第3步：生成视频
├─ 点击"工作室"
├─ 点击"生成AI视频"
├─ 输入："可爱的狗 开飞机"
├─ 选择："竖屏 15秒"
└─ 点击"开始生成"
  ⏱️ 等待15秒

第4步：查看结果
├─ 进度：0% → 100%
├─ 自动跳转到资产页
└─ 点击播放演示视频
  🎉 完成！

总耗时：约1分钟
```

### 场景2：实际使用（真实API）

```
第1步：配置API Key
├─ cd server
├─ cp .env.example .env
└─ 编辑.env，填入真实API Key
  ✅ API Key已配置

第2步：启动真实服务器
├─ npm start
└─ 看到"✅ API Key已配置"
  ✅ 服务器就绪

第3步：打开前端
└─ 点击 "Open in New Tab"
  ✅ APP已连接真实API

第4步：生成视频
├─ 工作室 → 生成AI视频
├─ 输入提示词
├─ 选择模型
└─ 开始生成
  ⏱️ 等待3-5分钟

第5步：获得AI视频
├─ 真实的AI生成内容
├─ 可下载保存
└─ 可分享发布
  🎉 创作完成！

总耗时：约5-10分钟
```

---

## 💡 使用建议

### 新手学习路径

```
Day 1（2小时）
├─ 使用Mock服务器
├─ 熟悉所有功能
├─ 尝试不同提示词
└─ 完成10+个测试视频

Day 2（3小时）
├─ 配置真实API Key
├─ 启动真实服务器
├─ 生成第一个真实视频
└─ 掌握高级功能

Day 3（4小时）
├─ 批量创作
├─ 优化提示词
├─ 使用Pro模型
└─ 创作专业作品
```

### 专业创作建议

1. **先测试，再正式**
   ```
   Mock测试提示词 → 真实API生成最终版
   ```

2. **合理选择模型**
   ```
   预览：10秒模型
   日常：15秒模型
   专业：Pro模型
   ```

3. **批量创作流程**
   ```
   准备5-10个提示词 → 依次提交 → 统一管理 → 批量下载
   ```

---

## 🔧 高级配置

### 自定义服务器端口

```bash
# macOS/Linux
PORT=3002 npm start

# Windows
set PORT=3002
npm start
```

前端也需要更新：
```typescript
// /src/app/services/api-config.ts
BASE_URL: 'http://localhost:3002'
```

### 自定义Sora API地址

编辑 `.env`:
```env
SORA_API_BASE_URL=https://your-custom-api.com
SORA_API_KEY=your_key
```

### 使用PM2管理

```bash
# 安装PM2
npm install -g pm2

# 启动
pm2 start real-api-server.js --name skyriff-api

# 查看状态
pm2 status

# 查看日志
pm2 logs skyriff-api

# 重启
pm2 restart skyriff-api

# 停止
pm2 stop skyriff-api
```

---

## 🐛 故障排查

### 问题1：UI显示不正常

**解决**：清除浏览器缓存
```
1. 按 Cmd+Shift+R (Mac) 或 Ctrl+Shift+R (Windows)
2. 或右键 → 检查 → Application → Clear storage
```

### 问题2：图片还是超出屏幕

**检查**：
1. 浏览器宽度是否超过480px？
   - APP设计最大宽度480px
   - 缩小浏览器窗口测试

2. 是否使用了最新代码？
   - 确认VideoGenerator.tsx已更新

### 问题3：服务器启动失败

**检查清单**：
```
✅ Node.js已安装？ node -v
✅ 依赖已安装？ ls node_modules
✅ 端口未被占用？ lsof -ti:3001
✅ API Key已配置？ cat .env
```

### 问题4：API请求失败

**查看日志**：
```bash
# 服务器终端会显示详细日志
📡 代理请求: POST ...
❌ 代理请求失败: [错误信息]
```

**常见原因**：
- API Key错误
- 网络连接问题
- Sora API服务不可用
- 提示词违规

---

## 📚 相关文档

### 核心文档

1. **[START_HERE.md](./START_HERE.md)** - 总体开始指南
2. **[QUICK_START.md](./QUICK_START.md)** - 快速开始
3. **[FEATURE_DEMO.md](./FEATURE_DEMO.md)** - 功能演示

### 服务器文档

4. **[server/README.md](./server/README.md)** - Mock服务器
5. **[server/REAL_SERVER_README.md](./server/REAL_SERVER_README.md)** - 真实服务器 🆕

### API文档

6. **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - 完整API文档
7. **[API_DETAILED_GUIDE.md](./API_DETAILED_GUIDE.md)** - 详细使用指南
8. **[API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md)** - 快速参考

---

## 🎉 总结

### 您现在拥有：

✅ **完美的UI** - 图片正确显示，移动端优化  
✅ **Mock服务器** - 无需API Key，立即可用  
✅ **真实服务器** - 实际调用Sora2 API  
✅ **一键启动** - 自动化脚本，简单易用  
✅ **完整文档** - 详细的使用说明  
✅ **生产就绪** - 可以实际部署使用  

### 立即开始：

```bash
# 方式A：Mock服务器（测试）
cd server && npm run start:mock

# 方式B：真实服务器（生产）
cd server && ./start.sh  # macOS/Linux
cd server && start.bat   # Windows
```

**🎬 享受AI视频创作的乐趣吧！** 🚀✨

---

## 📞 需要帮助？

### 查看文档
- UI问题 → 本文档 "UI修复详情"
- 服务器问题 → [server/REAL_SERVER_README.md](./server/REAL_SERVER_README.md)
- API问题 → [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### 检查配置
```bash
# 健康检查
curl http://localhost:3001/health

# 配置信息
curl http://localhost:3001/config
```

---

*完整使用指南 v1.0.0 | 更新日期: 2024-12-22*

**感谢使用SkyRiff！祝创作愉快！** 🎊
