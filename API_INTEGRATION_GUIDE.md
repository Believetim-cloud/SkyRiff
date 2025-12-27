# SkyRiff API 集成指南

## 📋 概述

SkyRiff APP已成功集成Sora2视频生成API，包含完整的视频生成、进度查询和资产管理功能。

---

## 🎯 已集成的功能

### 1. **工具页 (ToolsPage)**
- ✅ AI视频生成入口
- ✅ 文生视频功能
- ✅ 支持多种模型选择

### 2. **创作页 (CreatePage)**
- ✅ 图生视频功能
- ✅ 支持图片上传
- ✅ 支持图片URL输入
- ✅ 提示词输入
- ✅ 参数配置（方向、时长等）

### 3. **资产页 (AssetsPage)**
- ✅ 视频列表展示
- ✅ 自动进度更新
- ✅ 状态显示（生成中/已完成/失败）
- ✅ 视频播放和下载
- ✅ 本地存储管理

---

## 📁 项目结构

```
/src/app/
├── services/
│   ├── api-config.ts          # API配置（URL、模型、超时等）
│   ├── api-types.ts           # TypeScript类型定义
│   ├── sora-api.ts            # API服务层（所有API调用）
│   └── storage.ts             # 本地存储服务
├── components/
│   ├── VideoGenerator.tsx     # 视频生成对话框组件
│   ├── ToolsPage.tsx          # 工具页（已集成）
│   ├── CreatePage.tsx         # 创作页（已集成）
│   └── AssetsPage.tsx         # 资产页（已集成）
└── App.tsx                    # 主应用

/API_DOCUMENTATION.md          # 完整API文档
```

---

## 🔧 配置API Key

### 步骤1: 修改API配置

编辑 `/src/app/services/api-config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://prod-cn.your-api-server.com',
  API_KEY: 'YOUR_ACTUAL_API_KEY', // 👈 替换这里
  // ...
};
```

### 步骤2: 环境变量（推荐）

创建 `.env` 文件：

```env
VITE_SORA_API_KEY=your_actual_api_key
VITE_SORA_BASE_URL=http://prod-cn.your-api-server.com
```

然后修改 `api-config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_SORA_BASE_URL || 'http://prod-cn.your-api-server.com',
  API_KEY: import.meta.env.VITE_SORA_API_KEY || 'YOUR_API_KEY',
  // ...
};
```

---

## 🚀 使用方式

### 方式1: 工具页生成视频

1. 点击底部导航的 **"工具"** Tab
2. 点击 **"AI视频生成"** 卡片
3. 选择模式：文生视频 或 图生视频
4. 输入提示词和参数
5. 点击 **"开始生成"**
6. 等待生成完成
7. 前往 **"资产"** Tab查看结果

### 方式2: 创作页生成视频

1. 点击底部导航的 **"创作"** Tab（中间大按钮）
2. 输入提示词
3. 可选：上传图片或输入图片URL
4. 配置参数（方向、时长等）
5. 点击底部的 **向上箭头按钮**
6. 在弹出的对话框中确认生成
7. 前往 **"资产"** Tab查看结果

### 方式3: 资产页查看进度

1. 点击底部导航的 **"资产"** Tab
2. 查看所有生成的视频
3. 进行中的视频会显示进度条
4. 完成的视频可以点击播放或下载
5. 点击右上角 **"刷新"** 按钮手动更新进度

---

## 📊 API使用流程

### 文生视频完整流程

```typescript
import { generateVideoFromText } from './services/sora-api';

// 生成视频
const response = await generateVideoFromText(
  '可爱的狗 开飞机',  // prompt
  'sora2-portrait-15s', // model
  (task) => {
    // 进度回调
    console.log(`进度: ${task.progress}%`);
    console.log(`状态: ${task.status}`);
  }
);

if (response.success) {
  const videoUrl = response.data.video_url;
  console.log('视频生成成功:', videoUrl);
} else {
  console.error('生成失败:', response.error?.message);
}
```

### 图生视频完整流程

```typescript
import { generateVideoFromImageFile } from './services/sora-api';

// 上传文件生成
const file = fileInput.files[0];
const response = await generateVideoFromImageFile(
  file,                     // 图片文件
  '换一个风格，广告片',     // prompt
  'sora2-portrait-15s',     // model
  (task) => {
    console.log(`进度: ${task.progress}%`);
  }
);
```

### 仅查询进度

```typescript
import { getVideoStatus } from './services/sora-api';

const response = await getVideoStatus('video_xxx');

if (response.success) {
  const task = response.data;
  console.log(`状态: ${task.status}`);
  console.log(`进度: ${task.progress}%`);
  
  if (task.status === 'success') {
    console.log('视频URL:', task.video_url);
  }
}
```

---

## 🎨 可用模型

### 普通模式（3-5分钟）

| 模型ID | 说明 | 时长 | 用途 |
|--------|------|------|------|
| `sora2-portrait` | 竖屏 | 10秒 | 快速预览 |
| `sora2-landscape` | 横屏 | 10秒 | 快速预览 |
| `sora2-portrait-15s` | 竖屏 | 15秒 | 高质量 |
| `sora2-landscape-15s` | 横屏 | 15秒 | 高质量 |

### Pro模式（15-30分钟）

| 模型ID | 说明 | 时长 | 用途 |
|--------|------|------|------|
| `sora2-pro-portrait-25s` | 竖屏 | 25秒 | 专业创作 |
| `sora2-pro-landscape-25s` | 横屏 | 25秒 | 专业创作 |
| `sora2-pro-portrait-hd-15s` | 竖屏高清 | 15秒 | 超高质量 |
| `sora2-pro-landscape-hd-15s` | 横屏高清 | 15秒 | 超高质量 |

---

## 💾 本地存储

所有生成的视频都会自动保存到浏览器的 LocalStorage 中：

```typescript
import { 
  getLocalVideos,      // 获取所有视频
  getProcessingVideos, // 获取进行中的视频
  getCompletedVideos,  // 获取已完成的视频
  deleteLocalVideo,    // 删除视频
} from './services/storage';

// 示例
const allVideos = getLocalVideos();
console.log('共有视频:', allVideos.length);

const processing = getProcessingVideos();
console.log('正在生成:', processing.length);
```

---

## ⚙️ 高级配置

### 调整轮询间隔

编辑 `/src/app/services/api-config.ts`:

```typescript
export const API_CONFIG = {
  // ...
  POLLING: {
    INTERVAL: 5000,  // 5秒轮询一次（默认）
    MAX_ATTEMPTS: 360, // 最多尝试360次
  },
};
```

### 调整超时时间

```typescript
export const API_CONFIG = {
  // ...
  TIMEOUT: {
    DEFAULT: 30000,              // 30秒
    VIDEO_GENERATION: 300000,    // 5分钟
    VIDEO_GENERATION_PRO: 1800000, // 30分钟
  },
};
```

---

## 🐛 故障排查

### 问题1: API Key错误

**症状**: 返回401错误  
**解决**: 
1. 检查 `api-config.ts` 中的 `API_KEY` 是否正确
2. 确认API Key有效且未过期

### 问题2: 视频生成失败

**症状**: 任务状态变为 `failed`  
**可能原因**:
- 提示词不符合审查要求
- 图片包含真人或拟真人
- 网络问题

**解决**:
1. 检查提示词是否合规
2. 更换图片重试
3. 查看错误消息详情

### 问题3: 进度不更新

**症状**: 资产页进度一直卡住  
**解决**:
1. 点击右上角"刷新"按钮
2. 检查网络连接
3. 查看浏览器控制台错误信息

### 问题4: 视频无法播放

**症状**: 点击视频没有反应  
**解决**:
1. 确认任务状态为 `success`
2. 检查 `video_url` 是否有效
3. 在新标签页打开视频URL测试

---

## 📞 技术支持

如遇问题，请查看：

1. **API完整文档**: `/API_DOCUMENTATION.md`
2. **浏览器控制台**: 查看错误日志
3. **网络请求**: 检查Network面板

---

## 🎉 功能演示

### 生成视频的完整操作流程

```
1. 打开APP
   ↓
2. 点击"工具" Tab
   ↓
3. 点击"AI视频生成"
   ↓
4. 选择"文生视频"模式
   ↓
5. 输入: "可爱的狗 开飞机"
   ↓
6. 选择模型: "竖屏 15秒"
   ↓
7. 点击"开始生成"
   ↓
8. 等待进度条完成（3-5分钟）
   ↓
9. 点击"资产" Tab
   ↓
10. 查看生成的视频
    ↓
11. 点击播放/下载
```

---

## 📝 下一步计划

- [ ] 添加视频预览功能
- [ ] 支持批量生成
- [ ] 添加视频编辑功能
- [ ] 集成去水印功能
- [ ] 支持视频分享到社交平台
- [ ] 添加生成历史记录
- [ ] 支持视频标签和分类

---

**🎊 恭喜！您的SkyRiff APP已经完全集成了Sora2 API！**

现在您可以：
- ✅ 在工具页生成AI视频
- ✅ 在创作页上传图片生成视频
- ✅ 在资产页管理所有视频
- ✅ 实时查看生成进度
- ✅ 播放和下载生成的视频

**开始创作您的AI视频吧！** 🚀
