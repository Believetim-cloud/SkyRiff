# SkyRiff - AI视频社交APP

<div align="center">

![SkyRiff Logo](https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=200&fit=crop)

**面向创作者的AI视频创作平台**

包含视频生成、社交分享和创作者激励功能

[功能特性](#功能特性) • [技术栈](#技术栈) • [快速开始](#快速开始) • [项目结构](#项目结构) • [设计系统](#设计系统)

</div>

---

## 📱 产品概述

SkyRiff是一款创新的AI视频社交应用，采用iOS风格的深色主题设计，为创作者提供强大的AI视频创作工具和社交分享平台。

### 核心功能模块

- 🏠 **首页** - 发现、热门、排行三种浏览模式
- 🛠️ **工具** - AI视频生成、扩展分镜、故事版编辑
- ✨ **创作** - 智能参数设置和角色选择
- 📁 **资产** - 视频和角色资产管理
- 👤 **我的** - 个人中心和数据统计

---

## ✨ 功能特性

### 1️⃣ 首页 - 三种浏览模式

#### 🔍 发现模式（默认）
- 全屏视频滚动体验（类似抖音）
- 上下滑动切换视频
- 左侧创作者信息、右侧互动按钮
- 点赞、评论、分享、收藏功能

#### 🔥 热门模式
- 网格布局展示（每行2个视频）
- 竖向滚动浏览
- 视频缩略图和基本信息

#### 🏆 排行模式
- **角色排行榜** - 展示热门AI角色
- **二次创作排行** - 展示创作数据
- 包含热度值、用户名、作品数等信息

### 2️⃣ 工具页 - 三大AI功能

#### 📹 AI视频生成
- 智能视频创作
- 多种风格选择
- 参数化控制

#### 🎬 扩展分镜
- 自动分镜扩展
- 场景智能衔接

#### 📝 故事版编辑器
- **完整的分镜管理系统**
- 添加/删除/编辑分镜
- 每个分镜包含：
  - ⏱️ 时长设置
  - 📷 景别选择（特写、中景、全景等）
  - 🎥 运镜方式（推、拉、摇、移等）
  - 👥 角色一致性控制
  - 📄 分镜描述
- 底部大加号按钮快速添加
- 批量生成功能

### 3️⃣ 创作页 - 智能创作工具

#### 🖼️ 图片上传
- 点击按钮上传图片
- 图片显示在设置面板和角色列表之间
- 图片尺寸优化显示（70%）

#### ⚙️ 参数设置
- **方位选择**: 横版、竖版、方形
- **时长设置**: 5秒、10秒、15秒
- **视频数量**: 1、2、4个

#### 🎭 角色选择
- 预设角色风格库
- 角色预览和切换
- 支持自定义角色

#### 🚀 一键生成
- 大型圆形生成按钮
- 带上箭头动画效果
- 进度反馈

### 4️⃣ 资产页 - 内容管理

#### 📹 视频资产
- 网格布局（每行3个）
- 视频状态管理：
  - ✅ 生成成功
  - ⏳ 处理中
  - ❌ 生成失败
- 视频预览和播放

#### 👥 角色资产
- 自定义角色管理
- 角色编辑和删除

### 5️⃣ 我的页面 - 个人中心

#### 👤 用户信息
- 头像、昵称、简介
- 粉丝、关注、获赞数据

#### 🎯 功能菜单
- 👫 好友管理
- 💰 余额充值
- ⭐ 积分系统
- 🎁 礼物中心
- 📊 数据中心

#### ⚙️ 设置选项
- 账号设置
- 隐私设置
- 退出登录

---

## 🎨 设计系统

### 配色方案（iOS深色主题）

```css
/* 主色调 */
--color-primary: #0A84FF      /* iOS蓝 - 主色 */
--color-secondary: #6C5CE7    /* 紫色 - 强调色 */
--color-success: #2ECC71      /* 绿色 - 成功状态 */
--color-warning: #F1C40F      /* 黄色 - 警告状态 */
--color-error: #E74C3C        /* 红色 - 错误状态 */

/* 背景色 */
--color-background: #000000   /* 纯黑背景 */
--color-surface: #1C1C1E      /* 卡片背景 */
--color-surface-elevated: #2C2C2E  /* 浮层背景 */
--color-border: #38383A       /* 边框颜色 */

/* 文字颜色 */
--color-text-primary: #FFFFFF    /* 主文字 */
--color-text-secondary: #ABABAB  /* 次要文字 */
--color-text-tertiary: #6E6E73   /* 辅助文字 */
```

### 圆角规范

```css
--radius-button: 12px   /* 按钮圆角 */
--radius-card: 16px     /* 卡片圆角 */
--radius-sm: 8px        /* 小圆角 */
```

### 间距规范

```css
--spacing-xs: 4px    /* 极小间距 */
--spacing-sm: 8px    /* 小间距 */
--spacing-md: 16px   /* 中等间距 */
--spacing-lg: 24px   /* 大间距 */
--spacing-xl: 32px   /* 超大间距 */
```

### 字体系统

- **主字体**: PingFang SC（中文）
- **英文字体**: Inter
- **系统回退**: -apple-system, BlinkMacSystemFont, sans-serif

### 图标系统

使用 **Lucide React** 图标库，所有图标统一风格。

---

## 🛠️ 技术栈

### 核心框架
- **React** 18.3.1 - UI框架
- **TypeScript** - 类型系统
- **Vite** 6.3.5 - 构建工具

### 样式方案
- **Tailwind CSS** 4.1.12 - 原子化CSS
- **CSS Variables** - 主题系统

### UI组件库
- **Radix UI** - 无障碍组件基础
- **Lucide React** - 图标系统
- **Material UI** - 部分高级组件

### 动画库
- **Motion** (Framer Motion) 12.23.24 - 动画效果

### 其他工具库
- **React DnD** - 拖拽功能
- **React Slick** - 轮播组件
- **Recharts** - 图表展示
- **React Hook Form** - 表单管理

---

## 📦 项目结构

```
skyriff-app/
├── src/
│   ├── app/
│   │   ├── App.tsx                          # 主应用入口
│   │   └── components/
│   │       ├── HomePage.tsx                 # 首页（发现/热门/排行）
│   │       ├── ToolsPage.tsx                # 工具页（三大功能）
│   │       ├── CreatePage.tsx               # 创作页（参数设置）
│   │       ├── AssetsPage.tsx               # 资产页（视频管理）
│   │       ├── ProfilePage.tsx              # 我的页面
│   │       ├── DiscoverPage.tsx             # 发现页组件
│   │       ├── RankingPage.tsx              # 排行榜组件
│   │       ├── StoryboardPage.tsx           # 故事版编辑器
│   │       ├── UserProfilePage.tsx          # 用户详情页
│   │       ├── figma/
│   │       │   └── ImageWithFallback.tsx    # 图片组件
│   │       └── ui/                          # UI组件库（40+组件）
│   │           ├── button.tsx
│   │           ├── card.tsx
│   │           ├── input.tsx
│   │           ├── select.tsx
│   │           ├── tabs.tsx
│   │           └── ...
│   └── styles/
│       ├── theme.css                        # 主题配置（颜色、间距）
│       ├── tailwind.css                     # Tailwind配置
│       ├── index.css                        # 全局样式
│       └── fonts.css                        # 字体配置
├── package.json                             # 项目依赖
├── vite.config.ts                           # Vite配置
├── postcss.config.mjs                       # PostCSS配置
└── README.md                                # 项目说明
```

---

## 🚀 快速开始

### 环境要求

- Node.js 16.0+
- npm 或 pnpm

### 安装步骤

```bash
# 1. 克隆项目（或解压项目文件）
cd skyriff-app

# 2. 安装依赖
npm install
# 或使用 pnpm
pnpm install

# 3. 启动开发服务器
npm run dev

# 4. 打开浏览器访问
# http://localhost:5173
```

### 构建生产版本

```bash
# 构建
npm run build

# 构建产物在 dist/ 目录
```

---

## 📱 页面导航

应用底部有5个Tab页面：

| 图标 | 名称 | 功能 |
|------|------|------|
| 🏠 | 首页 | 发现、热门、排行 |
| 🛠️ | 工具 | AI视频生成、扩展分镜、故事版 |
| ➕ | 创作 | 图片上传、参数设置、角色选择 |
| 📁 | 资产 | 视频和角色资产管理 |
| 👤 | 我的 | 个人中心和设置 |

**中间的"创作"按钮采用凸起设计，��引用户注意。**

---

## 🎯 核心功能详解

### 故事版编辑器使用指南

1. **进入编辑器**: 从工具页点击"故事版"卡片
2. **添加分镜**: 
   - 点击列表底部的大加号按钮
   - 自动创建新的空白分镜
3. **编辑分镜**:
   - 时长：选择5秒/10秒/15秒
   - 景别：特写/近景/中景/全景/远景
   - 运镜：推/拉/摇/移/跟/升/降/固定
   - 角色一致性：关闭/低/中/高
   - 描述：输入分镜详细描述
4. **删除分镜**: 点击右上角删除按钮
5. **批量生成**: 点击底部"批量生成视频"按钮

### 创作页使用指南

1. **上传参考图**: 点击"点击上传图片"按钮
2. **选择方位**: 横版(16:9) / 竖版(9:16) / 方形(1:1)
3. **设置时长**: 5秒 / 10秒 / 15秒
4. **选择数量**: 1个 / 2个 / 4个
5. **选择角色**: 滑动选择预设角色
6. **生成视频**: 点击底部圆形生成按钮

### 发现页交互说明

- **上下滑动**: 切换视频
- **点击左侧头像**: 进入创作者主页
- **点击右侧按钮**:
  - ❤️ 点赞
  - 💬 评论
  - 🔄 分享
  - ⭐ 收藏

---

## 🎨 美术资源

### Unsplash图片使用

项目中所有美术资源均来自Unsplash，搜索关键词：

| 场景 | 搜索词 | 用途 |
|------|--------|------|
| 视频缩略图 | cinematic video | 发现页、热门页视频 |
| 用户头像 | portrait | 用户头像 |
| 角色风格 | anime character | 角色库 |
| 工具背景 | ai technology | 工具卡片背景 |
| 故事版背景 | storyboard film | 故事版页面 |

### 图片组件使用

```tsx
import { ImageWithFallback } from './components/figma/ImageWithFallback';

<ImageWithFallback 
  src={imageUrl} 
  alt="描述"
  className="w-full h-full object-cover"
/>
```

---

## 🔧 开发指南

### 添加新页面

1. 在 `/src/app/components/` 创建新组件
2. 在 `App.tsx` 中导入组件
3. 添加到路由逻辑中

### 修改主题颜色

编辑 `/src/styles/theme.css` 中的CSS变量：

```css
@theme {
  --color-primary: #0A84FF;  /* 修改主色 */
  --color-secondary: #6C5CE7; /* 修改强调色 */
}
```

### 添加新图标

```tsx
import { IconName } from 'lucide-react';

<IconName className="w-6 h-6" />
```

查看可用图标: https://lucide.dev

---

## 📊 数据结构

### 视频对象

```typescript
interface Video {
  id: string;
  thumbnail: string;
  title: string;
  creator: {
    name: string;
    avatar: string;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
  status: 'success' | 'processing' | 'failed';
}
```

### 分镜对象

```typescript
interface Shot {
  id: string;
  duration: number;
  shotSize: string;
  cameraMovement: string;
  characterConsistency: string;
  description: string;
}
```

---

## 🐛 常见问题

### Q: 如何修改应用最大宽度？

A: 在 `App.tsx` 中修改 `max-w-[480px]` 类名。

### Q: 如何添加新的Tab页面？

A: 
1. 在 `TabType` 类型中添加新类型
2. 在导航栏添加新按钮
3. 在 `renderContent()` 中添加路由

### Q: 图片加载失败怎么办？

A: 使用 `ImageWithFallback` 组件，它会自动显示占位符。

---

## 📝 待开发功能

- [ ] 用户注册/登录系统
- [ ] 视频上传功能
- [ ] 评论系统
- [ ] 实时聊天
- [ ] 支付集成
- [ ] 数据分析面板
- [ ] 推送通知
- [ ] 多语言支持

---

## 📄 许可证

本项目仅供学习和演示使用。

---

## 👥 团队

SkyRiff 由创意团队开发

---

## 🙏 致谢

- **Unsplash** - 提供高质量免费图片
- **Lucide** - 精美的图标库
- **Radix UI** - 无障碍组件基础
- **Tailwind CSS** - 强大的CSS框架

---

<div align="center">

**Built with ❤️ for Creators**

[返回顶部](#skyriff---ai视频社交app)

</div>
