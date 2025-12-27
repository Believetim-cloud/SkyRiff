# 🎬 SkyRiff - AI视频创作平台

> 专业的AI视频生成应用 | iOS风格深色主题 | 真实Sora2 API集成 | **真正的一键启动**

---

## 🎉 一键启动！（最简单的方式）⭐

### Windows 用户 - 双击即可！

```
1. 找到 quick-start.bat
2. 双击运行
3. 等待启动完成
4. 打开前端，开始创作！
```

或在命令行运行：
```cmd
quick-start.bat
```

### Mac/Linux 用户 - 一行命令！

```bash
chmod +x quick-start.sh && ./quick-start.sh
```

### 启动过程（自动完成）

```
✅ [1/3] 检查项目目录... OK
📦 [2/3] 自动安装依赖...（首次1-2分钟）
🚀 [3/3] 启动服务器...

→ 看到 "✅ 准备就绪！" 就成功了！
```

**就是这么简单！无需手动 cd、npm install、npm start**

---

## 🎉 一切就绪！立即开始

### ✅ 已完成配置

- ✅ **UI修复完成** - 界面完美显示
- ✅ **API已配置** - 真实Sora2 API Key已保存
- ✅ **服务器就绪** - 代理服务器已创建
- ✅ **文档完整** - 10+ 份详细文档

### 🚀 3步启动（最简单的方式）

#### macOS / Linux:

```bash
chmod +x quick-start.sh
./quick-start.sh
```

#### Windows:

```cmd
quick-start.bat
```

#### 手动启动:

```bash
cd server
npm install
npm start
```

---

## 📱 应用功能

### 4大核心功能

1. **🎬 生成AI视频**（文生视频）
   - 输入文字提示词
   - AI自动生成视频
   - 多种模型选择

2. **🖼️ 图片转视频**（图生视频）
   - 上传图片或URL
   - 让静态图片动起来
   - 支持风格转换

3. **📂 管理视频资产**
   - 所有生成的视频
   - 播放、下载、分享
   - 自动保存管理

4. **✨ 创作精彩作品**
   - 精选视频展示
   - 社交分享功能
   - 创作者激励

---

## 🎯 使用流程

```
┌──────────────────────┐
│  1. 启动服务器       │  cd server && npm start
│     (约1分钟)        │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│  2. 打开前端         │  点击 "Open in New Tab"
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│  3. 进入工作室       │  底部中间按钮
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│  4. 生成AI视频       │  输入提示词 → 选择模型
│     (等待3-5分钟)    │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│  5. 查看视频         │  资产页 → 播放
└──────────────────────┘
```

---

## 📊 配置说明

### API配置（已完成）✅

```env
# 文件位置: /server/.env
DYUAPI_API_KEY=sk-AGzq...（已配置）
DYUAPI_BASE_URL=https://api.dyuapi.com
PORT=3001
NODE_ENV=production
```

### 验证配置

```bash
# 健康检查
curl http://localhost:3001/health

# 配置信息
curl http://localhost:3001/config
```

---

## 🆚 两种模式

| 模式 | 启动命令 | API Key | 视频 | 时间 | 费用 |
|------|---------|---------|------|------|------|
| **Mock** | `npm run start:mock` | ❌ | 演示 | 15秒 | 免费 |
| **真实** ⭐ | `npm start` | ✅ | AI生成 | 3-5分钟 | 计费 |

---

## 📚 文档导航

### 快速开始
- **[READY_TO_START.md](./READY_TO_START.md)** ⭐ 立即开始（推荐）
- **[quick-start.sh](./quick-start.sh)** - 一键启动脚本（Mac/Linux）
- **[quick-start.bat](./quick-start.bat)** - 一键启动脚本（Windows）

### 服务器文档
- **[server/START_NOW.md](./server/START_NOW.md)** - 服务器启动指南
- **[server/REAL_SERVER_README.md](./server/REAL_SERVER_README.md)** - 真实服务器详解
- **[server/SETUP_GUIDE.md](./server/SETUP_GUIDE.md)** - 配置指南

### 完整指南
- **[COMPLETE_USAGE_GUIDE.md](./COMPLETE_USAGE_GUIDE.md)** - 完整使用指南
- **[START_HERE.md](./START_HERE.md)** - 总体开始指南
- **[FEATURE_DEMO.md](./FEATURE_DEMO.md)** - 功能演示

### API文档
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - API完整文档
- **[API_DETAILED_GUIDE.md](./API_DETAILED_GUIDE.md)** - API详细指南
- **[API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md)** - API快速参考

---

## 🎓 使用技巧

### 提示词示例

**推荐提示词**:
```
✅ "可爱的狗 开飞机"
✅ "城市街道 下雨天 霓虹灯闪烁"
✅ "海边日落 海浪拍打岸边 宁静"
✅ "森林中 小鹿奔跑 阳光洒下"
```

### 模型选择

- **竖屏 10秒** - 快速测试，成本低
- **竖屏 15秒** - 日常推荐，平衡选择
- **Pro 15秒** - 高质量，专业作品

### 生成时间

- Mock模式：15-30秒
- 真实API（10秒视频）：3-5分钟
- 真实API（15秒视频）：5-10分钟
- Pro模型：可能更长

---

## 🐛 故障排查

### 常见问题

**Q1: 端口被占用？**
```bash
# macOS/Linux
lsof -ti:3001 | xargs kill -9

# Windows
netstat -ano | findstr :3001
taskkill /PID [PID号] /F
```

**Q2: 依赖安装失败？**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Q3: API请求失败？**
- 检查网络连接
- 确认API Key有效
- 查看服务器日志
- 检查API余额

**Q4: 视频不显示？**
- 点击资产页刷新按钮
- 等待视频生成完成
- 检查任务状态

---

## 📂 项目结构

```
SkyRiff/
├── src/app/                    # 前端应用
│   ├── components/             # React组件
│   │   ├── VideoGenerator.tsx  # 视频生成器（已修复）
│   │   ├── VideoStudio.tsx     # 视频工作室
│   │   ├── AssetsPage.tsx      # 资产管理
│   │   └── ...
│   ├── services/               # 服务层
│   │   ├── sora-api.ts         # API客户端
│   │   ├── api-config.ts       # API配置
│   │   └── storage.ts          # 本地存储
│   └── styles/                 # 样式文件
│
├── server/                     # 后端服务器
│   ├── real-api-server.js      # 真实API服务器 ⭐
│   ├── mock-api.js             # Mock服务器
│   ├── .env                    # API配置（已创建）✅
│   ├── package.json            # 依赖配置
│   └── ...文档
│
├── docs/                       # 完整文档（10+份）
│
├── quick-start.sh              # 快速启动（Mac/Linux）
├── quick-start.bat             # 快速启动（Windows）
├── READY_TO_START.md           # 准备就绪指南 ⭐
└── README_FINAL.md             # 本文件
```

---

## 💡 最佳实践

### 新手推荐

1. **第1天**：使用Mock模式
   - 熟悉所有功能
   - 测试不同提示词
   - 了解工作流程

2. **第2天**：切换真实API
   - 生成真实AI视频
   - 创作实际作品

### 专业用户

- 直接使用真实API
- 批量创作视频
- 优化提示词技巧
- 商业化应用

---

## 💰 费用控制

### 建议策略

1. 先用10秒模型测试
2. 确认效果满意后生成长视频
3. 批量创作时注意余额
4. 定期检查API使用量

---

## 🎊 技术栈

### 前端
- React 18
- TypeScript
- Tailwind CSS 4.0
- Vite

### 后端
- Node.js
- Express
- Axios
- Multer

### API
- Sora2 API
- DYUAPI服务

---

## 🔒 安全说明

- ✅ API Key保存在 `.env` 文件
- ✅ `.env` 已添加到 `.gitignore`
- ✅ 前端不暴露API Key
- ✅ 服务器端代理转发
- ⚠️ 不要将API Key提交到Git

---

## 📞 获取帮助

### 快速命令

```bash
# 启动服务器
cd server && npm start

# 验证配置
curl http://localhost:3001/config

# 查看健康状态
curl http://localhost:3001/health
```

### 查看文档

从这里开始：
1. [READY_TO_START.md](./READY_TO_START.md) - 立即开始
2. [server/START_NOW.md](./server/START_NOW.md) - 服务器启动

---

## 🎉 开始创作！

### 最简单的启动方式

**macOS/Linux:**
```bash
./quick-start.sh
```

**Windows:**
```cmd
quick-start.bat
```

**手动:**
```bash
cd server && npm install && npm start
```

---

## ⭐ 特色功能

- 🎨 **精美UI** - iOS风格深色主题
- 🚀 **真实API** - 实际调用Sora2
- 📱 **移动优先** - 完美适配手机
- 💎 **功能完整** - 4大核心功能
- 📚 **文档详细** - 10+ 份文档
- 🔧 **开箱即用** - 一键启动

---

## 🙏 致谢

感谢使用 SkyRiff AI视频创作平台！

**祝您创作愉快！** 🎬✨

---

*SkyRiff v1.0.0 | 配置完成时间: 2024-12-22*

**现在就开始创作您的第一个AI视频吧！** 🚀