# 🚀 一键启动 SkyRiff

## Windows 用户

### 方式1：双击运行（最简单！）⭐

```
找到文件：quick-start.bat
双击运行
等待启动
完成！
```

### 方式2：命令行

```cmd
quick-start.bat
```

---

## Mac/Linux 用户

### 一键启动

```bash
chmod +x quick-start.sh
./quick-start.sh
```

或者一行命令：

```bash
chmod +x quick-start.sh && ./quick-start.sh
```

---

## 启动成功标志

看到以下信息就成功了：

```
🚀 ========================================
🎬 SkyRiff Real API Server 已启动！
🚀 ========================================

📡 服务地址: http://localhost:3001

✅ 准备就绪！可以开始使用真实API
```

---

## 接下来做什么？

### 1. 打开前端应用

点击浏览器的 **"Open in New Tab"** 按钮

### 2. 进入工作室

点击底部中间的紫色大圆按钮 **"工作室"**

### 3. 生成第一个视频

```
① 点击 "🎬 生成AI视频"
② 输入提示词："可爱的狗 开飞机"
③ 选择模型："竖屏 15秒"
④ 点击 "开始生成"
⑤ 等待3-5分钟
⑥ 自动跳转到"资产"页
⑦ 点击播放按钮 ▶️
```

---

## 就是这么简单！

```
双击 quick-start.bat (Windows)
或运行 ./quick-start.sh (Mac/Linux)

→ 打开前端
→ 进入工作室
→ 生成视频
→ 完成！
```

---

## 遇到问题？

### 查看详细文档

- **[开始使用.md](./开始使用.md)** - 快速开始指南
- **[真实API使用指南.md](./真实API使用指南.md)** - 完整教程
- **[一键启动说明.txt](./一键启动说明.txt)** - 纯文本说明

### 常见问题

**端口被占用？**
```bash
# Mac/Linux
lsof -ti:3001 | xargs kill -9

# Windows
netstat -ano | findstr :3001
```

**依赖安装失败？**
```bash
rm -rf node_modules
npm install
```

---

**祝您创作愉快！** 🎬✨

*SkyRiff v1.0.0*
