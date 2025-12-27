# 🚀 SkyRiff - 快速开始指南

> **重要提示**：您现在看到的是 Figma Make 的在线预览版本。要在本地运行，需要先下载项目到电脑！

---

## 📋 目录

1. [准备工作](#准备工作)
2. [下载项目](#下载项目)
3. [安装依赖](#安装依赖)
4. [配置环境](#配置环境)
5. [启动项目](#启动项目)
6. [常见问题](#常见问题)

---

## 🛠️ 准备工作

### 必需安装的软件

1. **Node.js**（必需）
   - 下载：https://nodejs.org/
   - 选择 LTS 版本
   - 安装时勾选 "Add to PATH"
   - 验证：打开命令行输入 `node -v`

2. **VS Code**（强烈推荐）
   - 下载：https://code.visualstudio.com/
   - 免费、强大、好用

3. **Git**（可选）
   - 下载：https://git-scm.com/
   - 如果使用 Git Clone 方式需要

---

## 📥 下载项目

### 方法1：下载压缩包（推荐）

1. 在 Figma Make 界面找到 **"下载"** 或 **"Export"** 按钮
2. 下载 `.zip` 文件
3. 解压到合适的位置，例如：
   - 桌面：`C:\Users\你的用户名\Desktop\skyriff`
   - 文档：`C:\Users\你的用户名\Documents\skyriff`

### 方法2：Git Clone

如果有 Git 仓库地址：

```bash
cd C:\Users\你的用户名\Desktop
git clone [仓库地址]
```

---

## ⚙️ 安装依赖

### 使用 VS Code（推荐）

1. 右键项目文件夹 → "通过 Code 打开"
2. 按 `Ctrl + \`` 打开终端
3. 安装前端依赖：
   ```bash
   npm install
   ```
4. 安装后端依赖：
   ```bash
   cd server
   npm install
   ```

### 使用命令行

1. 打开命令行（Win+R → 输入 `cmd` → 回车）
2. 进入项目文件夹：
   ```bash
   cd C:\Users\你的用户名\Desktop\skyriff
   ```
3. 安装前端依赖：
   ```bash
   npm install
   ```
4. 安装后端依赖：
   ```bash
   cd server
   npm install
   ```

---

## 🔑 配置环境

1. 在项目根目录找到 `.env` 文件（如果没有就创建一个）
2. 填入以下内容：

```env
# Sora API 配置
SORA_API_KEY=your-api-key-here
SORA_API_BASE_URL=https://api.sora.com

# 服务器配置
PORT=3001
```

3. 把 `your-api-key-here` 替换成您的真实 API 密钥

> 💡 **没有 API 密钥？** 可以先使用内置的 Mock 数据测试！

---

## 🚀 启动项目

### 需要同时启动前端和后端！

#### 方法A：使用 VS Code（推荐）

1. **终端1 - 启动后端：**
   ```bash
   cd server
   npm start
   ```
   看到 "✅ 准备就绪！" 就成功了！

2. **终端2 - 启动前端：**（打开新终端）
   ```bash
   npm run dev
   ```
   浏览器会自动打开 http://localhost:5173

#### 方法B：使用 Win+R 快捷方式

1. **启动后端：**
   - 按 `Win + R`
   - 输入：
     ```
     cmd /c "cd /d C:\Users\你的用户名\Desktop\skyriff\server && npm start"
     ```
   - 回车

2. **启动前端：**（新开一个 Win+R）
   - 按 `Win + R`
   - 输入：
     ```
     cmd /c "cd /d C:\Users\你的用户名\Desktop\skyriff && npm run dev"
     ```
   - 回车

### ✅ 成功标志

- **后端**：显示 "🚀 SkyRiff Real API Server 已启动！"
- **前端**：浏览器显示 SkyRiff 应用界面
- **地址**：http://localhost:5173

> ⚠️ **重要**：启动后不要关闭终端窗口！

---

## ❓ 常见问题

### Q1：`npm install` 报错？

**解决方案：**
1. 检查 Node.js 是否安装：`node -v`
2. 如果报错 "不是内部或外部命令"，重新安装 Node.js
3. 确保勾选 "Add to PATH"

### Q2：端口被占用？

**解决方案：**
1. 打开 `.env` 文件
2. 修改端口号：`PORT=3002`（或其他端口）
3. 重新启动服务器

### Q3：页面一片空白？

**解决方案：**
1. 确保后端服务器已启动
2. 刷新浏览器（F5）
3. 按 F12 查看控制台错误信息

### Q4：找不到下载按钮？

**查找位置：**
- Figma Make 右上角
- 菜单栏：File → Export
- 分享按钮旁边

### Q5：没有 Sora API 密钥？

**解决方案：**
- 可以先使用 Mock 数据测试
- 服务器内置了模拟数据
- 等拿到真实密钥再替换

---

## 📚 详细教程

项目根目录下有更详细的教程文档：

- **📦如何下载项目到本地电脑.txt** - 纯文本教程
- **📦下载到本地-图文教程.html** - 图文版教程（双击打开）
- **✅最终解决方案.txt** - 服务器启动教程
- **🚀最简单-看这个.txt** - 快速启动指南

---

## ⚡ 快速启动命令（收藏这个！）

以后启动项目，只需要：

### 后端（终端1）：
```bash
cd C:\Users\你的用户名\Desktop\skyriff\server
npm start
```

### 前端（终端2）：
```bash
cd C:\Users\你的用户名\Desktop\skyriff
npm run dev
```

### 或使用 Win+R 一键启动：
```
cmd /c "cd /d C:\Users\你的用户名\Desktop\skyriff\server && npm start"
```

---

## 🎯 项目结构

```
skyriff/
├── server/              # 后端服务器
│   ├── real-api-server.js
│   ├── package.json
│   └── .env
├── src/                 # 前端源代码
│   ├── app/
│   │   ├── components/
│   │   └── App.tsx
│   ├── services/        # API 服务层
│   └── styles/
├── package.json         # 前端配置
└── .env                 # 环境变量
```

---

## 🎉 总结

1. ✅ 安装 Node.js
2. ✅ 下载并解压项目
3. ✅ 运行 `npm install`（前端和后端）
4. ✅ 配置 `.env` 文件
5. ✅ 启动后端（`cd server && npm start`）
6. ✅ 启动前端（`npm run dev`）
7. ✅ 打开浏览器访问 http://localhost:5173

---

## 💬 需要帮助？

如果遇到任何问题：

1. 查看 [常见问题](#常见问题) 部分
2. 查看详细教程文档
3. 随时联系我！

---

**祝您使用愉快！🎬✨**
