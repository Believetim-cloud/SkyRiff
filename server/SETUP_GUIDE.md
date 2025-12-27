# 🔧 SkyRiff 真实API配置指南

## ✅ UI已修复

界面显示问题已完全修复：
- ✅ 内容不再挤到右侧
- ✅ 对话框完美居中显示
- ✅ 所有padding和间距已优化
- ✅ 响应式设计完美适配手机

---

## 🚀 配置真实API（3步完成）

### 方式A：直接提供API Key给我

**您只需要提供**：
1. Sora2 API Key（类似 `sk-xxx...`）
2. API服务器地址（如 `http://prod-cn.your-api-server.com`）

**我会立即**：
1. 创建 `.env` 文件
2. 配置好所有参数
3. 启动真实服务器

### 方式B：手动配置（推荐高级用户）

#### 第1步：创建 `.env` 文件

```bash
cd server
cp .env.example .env
```

#### 第2步：编辑 `.env` 文件

打开 `server/.env` 文件，填入：

```env
# Sora2 API配置
SORA_API_BASE_URL=http://prod-cn.your-api-server.com
SORA_API_KEY=sk-your-actual-api-key-here

# 服务器端口
PORT=3001

# 环境
NODE_ENV=production
```

**重要**：
- `SORA_API_KEY` - 您的真实API Key
- `SORA_API_BASE_URL` - API服务器地址

#### 第3步：安装依赖并启动

```bash
# 安装依赖（首次）
npm install

# 启动真实服务器
npm start
```

看到这个就成功了：
```
🚀 ========================================
🎬 SkyRiff Real API Server 已启动！
🚀 ========================================

📡 服务地址: http://localhost:3001
  API Key: ✅ 已配置 (sk-xxxxx...)

✅ 准备就绪！可以开始使用真实API
```

---

## 📊 验证配置

### 检查1：健康检查

```bash
curl http://localhost:3001/health
```

应该返回：
```json
{
  "status": "ok",
  "message": "SkyRiff Real API Server is running",
  "config": {
    "baseUrl": "http://prod-cn.your-api-server.com",
    "hasApiKey": true,
    "environment": "production"
  }
}
```

### 检查2：配置信息

```bash
curl http://localhost:3001/config
```

应该返回：
```json
{
  "baseUrl": "http://prod-cn.your-api-server.com",
  "hasApiKey": true,
  "environment": "production",
  "note": "✅ API Key已配置"
}
```

**如果看到 `hasApiKey: false`，说明API Key未正确配置！**

---

## 🎬 开始使用

### 第1步：确保服务器运行

终端显示：
```
✅ 准备就绪！可以开始使用真实API
```

### 第2步：打开前端应用

点击 "Open in New Tab" 按钮

### 第3步：生成第一个真实AI视频

```
1. 点击底部"工作室"（中间的大按钮）
2. 点击"🎬 生成AI视频"
3. 输入提示词："可爱的狗 开飞机"
4. 选择模型："竖屏 15秒"
5. 点击"开始生成"
6. 等待3-5分钟（真实生成需要时间）
7. 完成后自动跳转到"资产"页面
8. 点击视频即可播放
```

### 第4步：在资产页查看视频

```
1. 点击底部"资产"Tab
2. 看到所有生成的视频列表
3. 点击任意视频播放
4. 支持下载和分享
```

---

## 🆚 Mock vs 真实服务器

| 对比项 | Mock服务器 | 真实服务器 ✅ |
|--------|-----------|--------------|
| **启动命令** | `npm run start:mock` | `npm start` |
| **需要API Key** | ❌ | ✅ 需要 |
| **视频内容** | 演示视频 | AI生成 |
| **生成时间** | 15秒 | 3-5分钟 |
| **资产页显示** | ✅ 显示 | ✅ 显示 |
| **费用** | 免费 | 按API计费 |

---

## 🐛 常见问题

### Q1: API Key配置不成功？

**检查**：
```bash
# 方法1：查看.env文件
cat server/.env

# 方法2：验证配置
curl http://localhost:3001/config

# 方法3：查看服务器日志
# 启动时会显示 "✅ API Key已配置"
```

### Q2: 视频生成失败？

**可能原因**：
1. API Key无效或过期
2. API服务器地址错误
3. 提示词违规（被审查拦截）
4. 网络连接问题

**查看日志**：
```bash
# 服务器终端会显示详细错误
📡 代理请求: POST /v1/videos
❌ 代理请求失败: [具体错误信息]
```

### Q3: 生成的视频在资产里看不到？

**原因**：
- 视频正在生成中（未完成）
- 检查任务状态是否为 `success`

**解决**：
1. 点击资产页右上角"刷新"按钮
2. 资产页每5秒自动刷新
3. 等待视频生成完成（3-5分钟）

### Q4: 如何切换回Mock模式？

**简单**：
```bash
# 停止真实服务器（Ctrl+C）

# 启动Mock服务器
npm run start:mock
```

前端无需修改，自动使用Mock API！

---

## 📝 API Key安全

### ⚠️ 重要提醒

1. **不要泄露** - API Key是私密信息
2. **不要提交** - .env文件已在.gitignore中
3. **定期更换** - 建议定期更换API Key
4. **监控使用** - 关注API使用量和费用

### ✅ 安全实践

```bash
# ✅ 使用环境变量
export SORA_API_KEY=xxx

# ✅ 使用.env文件
echo "SORA_API_KEY=xxx" > .env

# ❌ 不要硬编码
const API_KEY = "sk-123..."; // 危险！
```

---

## 🎊 完成配置！

配置完成后，您的APP将：

✅ **完全可用** - 所有功能正常工作  
✅ **真实生成** - 调用真实Sora2 API  
✅ **资产管理** - 所有视频保存在资产页  
✅ **进度显示** - 实时显示生成进度  
✅ **生产就绪** - 可以实际使用  

---

## 💡 下一步

1. **生成测试视频** - 先用简单提示词测试
2. **优化提示词** - 学习高级提示词技巧
3. **批量创作** - 同时生成多个视频
4. **分享作品** - 下载并分享您的视频

**🎬 开始创作真实的AI视频吧！** 🚀✨

---

## 📞 需要帮助？

如果您需要帮助配置API Key，请直接提供：

```
API服务器地址: http://...
API Key: sk-...
```

我会立即为您配置好一切！

---

*配置指南 v1.0.0 | 更新日期: 2024-12-22*
