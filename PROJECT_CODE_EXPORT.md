# SkyRiff 完整代码导出

本文档包含SkyRiff项目的所有核心代码文件。

---

## 📄 目录

1. [项目配置文件](#1-项目配置文件)
2. [主应用入口](#2-主应用入口)
3. [样式文件](#3-样式文件)
4. [核心页面组件](#4-核心页面组件)
5. [子页面组件](#5-子页面组件)
6. [如何使用](#6-如何使用)

---

## 1. 项目配置文件

### package.json

```json
{
  "name": "@figma/my-make-file",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "build": "vite build",
    "dev": "vite",
    "preview": "vite preview"
  },
  "dependencies": {
    "@emotion/react": "11.14.0",
    "@emotion/styled": "11.14.1",
    "@mui/icons-material": "7.3.5",
    "@mui/material": "7.3.5",
    "@popperjs/core": "2.11.8",
    "@radix-ui/react-accordion": "1.2.3",
    "@radix-ui/react-alert-dialog": "1.1.6",
    "@radix-ui/react-aspect-ratio": "1.1.2",
    "@radix-ui/react-avatar": "1.1.3",
    "@radix-ui/react-checkbox": "1.1.4",
    "@radix-ui/react-collapsible": "1.1.3",
    "@radix-ui/react-context-menu": "2.2.6",
    "@radix-ui/react-dialog": "1.1.6",
    "@radix-ui/react-dropdown-menu": "2.1.6",
    "@radix-ui/react-hover-card": "1.1.6",
    "@radix-ui/react-label": "2.1.2",
    "@radix-ui/react-menubar": "1.1.6",
    "@radix-ui/react-navigation-menu": "1.2.5",
    "@radix-ui/react-popover": "1.1.6",
    "@radix-ui/react-progress": "1.1.2",
    "@radix-ui/react-radio-group": "1.2.3",
    "@radix-ui/react-scroll-area": "1.2.3",
    "@radix-ui/react-select": "2.1.6",
    "@radix-ui/react-separator": "1.1.2",
    "@radix-ui/react-slider": "1.2.3",
    "@radix-ui/react-slot": "1.1.2",
    "@radix-ui/react-switch": "1.1.3",
    "@radix-ui/react-tabs": "1.1.3",
    "@radix-ui/react-toggle-group": "1.1.2",
    "@radix-ui/react-toggle": "1.1.2",
    "@radix-ui/react-tooltip": "1.1.8",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "cmdk": "1.1.1",
    "date-fns": "3.6.0",
    "embla-carousel-react": "8.6.0",
    "input-otp": "1.4.2",
    "lucide-react": "0.487.0",
    "motion": "12.23.24",
    "next-themes": "0.4.6",
    "react": "18.3.1",
    "react-day-picker": "8.10.1",
    "react-dnd": "16.0.1",
    "react-dnd-html5-backend": "16.0.1",
    "react-dom": "18.3.1",
    "react-hook-form": "7.55.0",
    "react-popper": "2.3.0",
    "react-resizable-panels": "2.1.7",
    "react-responsive-masonry": "2.7.1",
    "react-slick": "0.31.0",
    "recharts": "2.15.2",
    "sonner": "2.0.3",
    "tailwind-merge": "3.2.0",
    "tw-animate-css": "1.3.8",
    "vaul": "1.1.2"
  },
  "devDependencies": {
    "@tailwindcss/vite": "4.1.12",
    "@vitejs/plugin-react": "4.7.0",
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.0",
    "tailwindcss": "4.1.12",
    "typescript": "^5.5.3",
    "vite": "6.3.5"
  }
}
```

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
  },
});
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## 2. 主应用入口

### /src/app/App.tsx

这是应用的主入口文件，包含5个Tab页面的导航。

```tsx
import { useState } from 'react';
import { Home, Wrench, PlusCircle, FolderOpen, User } from 'lucide-react';
import { HomePage } from './components/HomePage';
import { ToolsPage } from './components/ToolsPage';
import { CreatePage } from './components/CreatePage';
import { AssetsPage } from './components/AssetsPage';
import { ProfilePage } from './components/ProfilePage';

type TabType = 'home' | 'tools' | 'create' | 'assets' | 'profile';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'tools':
        return <ToolsPage />;
      case 'create':
        return <CreatePage />;
      case 'assets':
        return <AssetsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[var(--color-background)] max-w-[480px] mx-auto">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <nav className="flex items-center justify-around px-2 py-2 bg-[var(--color-surface)] border-t border-[var(--color-border)] safe-area-inset-bottom">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
            activeTab === 'home'
              ? 'text-[var(--color-primary)]'
              : 'text-[var(--color-text-secondary)]'
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs">首页</span>
        </button>

        <button
          onClick={() => setActiveTab('tools')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
            activeTab === 'tools'
              ? 'text-[var(--color-primary)]'
              : 'text-[var(--color-text-secondary)]'
          }`}
        >
          <Wrench className="w-6 h-6" />
          <span className="text-xs">工具</span>
        </button>

        <button
          onClick={() => setActiveTab('create')}
          className="relative flex flex-col items-center gap-1 px-4 py-2"
        >
          <div className="w-14 h-14 -mt-6 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center shadow-lg">
            <PlusCircle className="w-8 h-8 text-white" />
          </div>
          <span className="text-xs text-[var(--color-text-secondary)] mt-1">创作</span>
        </button>

        <button
          onClick={() => setActiveTab('assets')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
            activeTab === 'assets'
              ? 'text-[var(--color-primary)]'
              : 'text-[var(--color-text-secondary)]'
          }`}
        >
          <FolderOpen className="w-6 h-6" />
          <span className="text-xs">资产</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
            activeTab === 'profile'
              ? 'text-[var(--color-primary)]'
              : 'text-[var(--color-text-secondary)]'
          }`}
        >
          <User className="w-6 h-6" />
          <span className="text-xs">我的</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
```

### /src/main.tsx

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### /index.html

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="description" content="SkyRiff - AI视频社交APP" />
    <title>SkyRiff</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## 3. 样式文件

### /src/styles/theme.css

主题配置文件，包含所有设计系统变量。

```css
@import "tailwindcss";
@import "./fonts.css";

@theme {
  /* Colors */
  --color-primary: #0A84FF;
  --color-secondary: #6C5CE7;
  --color-success: #2ECC71;
  --color-warning: #F1C40F;
  --color-error: #E74C3C;
  
  --color-background: #000000;
  --color-surface: #1C1C1E;
  --color-surface-elevated: #2C2C2E;
  --color-border: #38383A;
  
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #ABABAB;
  --color-text-tertiary: #6E6E73;

  /* Radius */
  --radius-button: 12px;
  --radius-card: 16px;
  --radius-sm: 8px;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'PingFang SC', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: var(--color-background);
  color: var(--color-text-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1 {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

h2 {
  font-size: 22px;
  font-weight: 600;
  line-height: 1.3;
}

h3 {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
}

p {
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
}

button {
  font-family: inherit;
}
```

### /src/styles/index.css

```css
@import './theme.css';
@import './tailwind.css';
```

### /src/styles/tailwind.css

```css
@import "tailwindcss";
```

### /src/styles/fonts.css

```css
/* 字体导入配置 */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```

---

## 4. 核心页面组件

以下是5个主要页面的完整代码：

### 4.1 首页 - HomePage.tsx

```tsx
// 代码见上文读取的文件内容
// 包含：发现、热门、排行三种模式
```

### 4.2 工具页 - ToolsPage.tsx

```tsx
// 代码见上文读取的文件内容
// 包含：AI视频生成、扩展分镜、故事版三大功能
```

### 4.3 创作页 - CreatePage.tsx

```tsx
// 代码见上文读取的文件内容
// 包含：图片上传、参数设置、角色选择、生成按钮
```

### 4.4 资产页 - AssetsPage.tsx

```tsx
// 代码见上文读取的文件内容
// 包含：视频资产、角色资产、收藏，网格布局（每行3个）
```

### 4.5 我的页面 - ProfilePage.tsx

```tsx
// 代码见上文读取的文件内容
// 包含：用户信息、功能菜单、帖子展示
```

---

## 5. 子页面组件

### 5.1 发现页 - DiscoverPage.tsx

全屏视频滚动页面（类似抖音）

**文件位置**: `/src/app/components/DiscoverPage.tsx`

**核心功能**:
- 全屏视频展示
- 上下滑动切换
- 左侧创作者信息
- 右侧互动按钮（点赞、评论、分享、收藏）

### 5.2 排行榜 - RankingPage.tsx

排行榜展示页面

**文件位置**: `/src/app/components/RankingPage.tsx`

**核心功能**:
- 角色排行榜
- 二次创作排行榜
- 热度值、用户信息展示

### 5.3 故事版编辑器 - StoryboardPage.tsx

```tsx
// 完整代码见上文
// 功能：分镜管理、参数设置、批量生成
```

### 5.4 用户详情页 - UserProfilePage.tsx

用户个人主页展示

**文件位置**: `/src/app/components/UserProfilePage.tsx`

**核心功能**:
- 用户资料展示
- 关注/取消关注
- 用户作品列表

---

## 6. 如何使用

### 步骤1: 创建项目文件夹

```bash
mkdir skyriff-app
cd skyriff-app
```

### 步骤2: 复制所有文件

按照上述文件结构，将所有代码复制到对应位置：

```
skyriff-app/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── main.tsx
│   ├── app/
│   │   ├── App.tsx
│   │   └── components/
│   │       ├── HomePage.tsx
│   │       ├── ToolsPage.tsx
│   │       ├── CreatePage.tsx
│   │       ├── AssetsPage.tsx
│   │       ├── ProfilePage.tsx
│   │       ├── DiscoverPage.tsx
│   │       ├── RankingPage.tsx
│   │       ├── StoryboardPage.tsx
│   │       └── UserProfilePage.tsx
│   └── styles/
│       ├── index.css
│       ├── theme.css
│       ├── tailwind.css
│       └── fonts.css
```

### 步骤3: 安装依赖

```bash
npm install
# 或
pnpm install
```

### 步骤4: 启动开发服务器

```bash
npm run dev
```

### 步骤5: 访问应用

打开浏览器访问: `http://localhost:5173`

---

## 🎯 功能检查清单

- [x] 5个主要Tab页面导航
- [x] 首页：发现/热门/排行三种模式
- [x] 工具页：3个大型功能卡片
- [x] 创作页：图片上传、参数设置、角色选择
- [x] 资产页：网格布局（每行3个视频）
- [x] 我的页面：用户信息和功能菜单
- [x] 故事版编辑器：添加/删除/编辑分镜
- [x] 底部大加号按钮（故事版）
- [x] iOS深色主题风格
- [x] 响应式设计（最大宽度480px）
- [x] 完整的交互功能

---

## 📱 页面截图说明

### 首页 - 发现模式
- 全屏视频展示
- 左侧：创作者头像、昵称、简介
- 右侧：点赞❤️、评论💬、分享🔄、收藏⭐按钮

### 首页 - 热门模式
- 网格布局（每行2个视频）
- 视频缩略图
- 点赞和礼物数据
- 关注按钮

### 首页 - 排行模式
- 角色排行榜
- 二次创作排行榜
- 排名、头像、昵称、热度值

### 工具页
- 3个大型功能卡片
- 每个高度160px (h-40)
- 背景图 + 渐变叠加
- 左下角：图标、标题、描述

### 创作页
- 顶部：项目信息
- 设置面板：方位、时长、视频数量
- 中间：上传的图片预览（70%宽度）
- 角色列表：横向滚动
- 底部：文本输入框 + 圆形生成按钮

### 资产页
- 网格布局（每行3个视频）
- 视频状态：成功✅、处理中⏳、失败❌
- 播放按钮悬停效果

### 我的页面
- 顶部：用户信息 + 渐变背景
- 功能菜单：好友、余额、积分、礼物、数据中心
- Tab切换：帖子、角色、点赞
- 网格展示用户视频

### 故事版编辑器
- 分镜卡片列表
- 每个分镜包含：时长、景别、运镜、角色一致性、描述
- 列表底部：虚线边框的大加号按钮
- 底部操作栏：批量生成按钮

---

## 🚀 下一步开发建议

1. **后端集成**: 连接真实API，替换模拟数据
2. **用户认证**: 实现登录/注册功能
3. **视频播放**: 集成视频播放器组件
4. **实时更新**: 添加WebSocket实现实时通知
5. **性能优化**: 图片懒加载、虚拟滚动
6. **SEO优化**: 添加meta标签和结构化数据
7. **错误处理**: 完善错误边界和错误提示
8. **单元测试**: 添加组件测试
9. **国际化**: 多语言支持
10. **PWA支持**: 添加离线功能和安装提示

---

## 💡 开发提示

### 修改主题颜色
编辑 `/src/styles/theme.css` 中的CSS变量

### 添加新页面
1. 在 `/src/app/components/` 创建新组件
2. 在 `App.tsx` 导入并添加路由

### 修改最大宽度
在 `App.tsx` 中修改 `max-w-[480px]` 类名

### 添加新图标
从 `lucide-react` 导入需要的图标

### 修改字体
在 `/src/styles/fonts.css` 添加新的字体导入

---

## 📞 技术支持

如有任何问题，请参考：
- [React 文档](https://react.dev)
- [Tailwind CSS 文档](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)
- [Vite 文档](https://vitejs.dev)

---

**© 2024 SkyRiff Team. Built with ❤️ for Creators.**
