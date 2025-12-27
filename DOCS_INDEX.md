# 📚 SkyRiff 项目文档导航

欢迎使用SkyRiff AI视频创作平台！这里是所有文档的导航页面。

---

## 🚀 快速开始

**建议阅读顺序**：新手用户请按以下顺序阅读文档

1. **[快速开始指南](./QUICK_START.md)** ⭐ 最重要！
   - 10分钟完成配置
   - 生成第一个视频
   - 常见问题排查

2. **[API集成指南](./API_INTEGRATION_GUIDE.md)**
   - 完整集成说明
   - 使用方式详解
   - 故障排查

3. **[API完整文档](./API_DOCUMENTATION.md)**
   - 8个API接口详细说明
   - 请求/响应示例
   - 代码示例（JS/Python/cURL）

---

## 📖 文档列表

### 核心文档

| 文档 | 说明 | 适合人群 |
|------|------|---------|
| [README.md](./README.md) | 项目总体介绍 | 所有人 |
| [QUICK_START.md](./QUICK_START.md) | 快速开始（10分钟） | 新手 ⭐ |
| [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md) | 完整集成指南 | 开发者 |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | API接口文档 | 开发者 |

### 技术文档

| 文档 | 说明 |
|------|------|
| [COMPLETE_SOURCE_CODE.md](./COMPLETE_SOURCE_CODE.md) | 完整源代码 |
| [PROJECT_CODE_EXPORT.md](./PROJECT_CODE_EXPORT.md) | 代码导出说明 |

### 资源文档

| 文档 | 说明 |
|------|------|
| [ASSETS_COMPLETE_LIST.md](./ASSETS_COMPLETE_LIST.md) | 美术资源清单 |
| [ATTRIBUTIONS.md](./ATTRIBUTIONS.md) | 版权说明 |

---

## 🎯 按需求查找

### 我想...

#### 配置和开始使用
- 👉 [快速开始指南](./QUICK_START.md)
- 👉 [API集成指南 - 配置API Key](./API_INTEGRATION_GUIDE.md#配置api-key)

#### 了解API接口
- 👉 [API完整文档](./API_DOCUMENTATION.md)
- 👉 [API接口清单](./API_DOCUMENTATION.md#接口清单)

#### 生成视频
- 👉 [快速开始 - 步骤3](./QUICK_START.md#步骤3-生成第一个视频5分钟)
- 👉 [集成指南 - 使用方式](./API_INTEGRATION_GUIDE.md#使用方式)

#### 排查问题
- 👉 [快速开始 - 遇到问题？](./QUICK_START.md#遇到问题)
- 👉 [集成指南 - 故障排查](./API_INTEGRATION_GUIDE.md#故障排查)

#### 查看代码
- 👉 [完整源代码](./COMPLETE_SOURCE_CODE.md)
- 👉 [项目结构说明](./API_INTEGRATION_GUIDE.md#项目结构)

#### 了解项目
- 👉 [项目README](./README.md)
- 👉 [资源清单](./ASSETS_COMPLETE_LIST.md)

---

## 🗂️ 项目文件结构

```
SkyRiff/
├── src/
│   ├── app/
│   │   ├── services/              # API服务层
│   │   │   ├── api-config.ts     # API配置
│   │   │   ├── api-types.ts      # 类型定义
│   │   │   ├── sora-api.ts       # API调用
│   │   │   └── storage.ts        # 本地存储
│   │   ├── components/            # React组件
│   │   │   ├── VideoGenerator.tsx # 视频生成器
│   │   │   ├── ToolsPage.tsx     # 工具页
│   │   │   ├── CreatePage.tsx    # 创作页
│   │   │   └── AssetsPage.tsx    # 资产页
│   │   └── App.tsx               # 主应用
│   └── styles/                   # 样式文件
├── API_DOCUMENTATION.md          # API文档 ⭐
├── API_INTEGRATION_GUIDE.md      # 集成指南 ⭐
├── QUICK_START.md                # 快速开始 ⭐
├── README.md                     # 项目说明
├── COMPLETE_SOURCE_CODE.md       # 完整代码
└── ...其他文档
```

---

## 📋 快速参考

### API端点

```
Base URL: http://prod-cn.your-api-server.com

POST   /v1/videos                    # 创建视频任务
GET    /v1/videos/{video_id}         # 查询任务状态
GET    /v1/videos/{video_id}/content # 获取视频内容
POST   /v1/chat/completions          # Chat兼容模式
```

### 常用模型

| 模型 | 说明 | 时长 | 速度 |
|------|------|------|------|
| `sora2-portrait` | 竖屏标准 | 10秒 | 3-5分钟 |
| `sora2-portrait-15s` | 竖屏加长 | 15秒 | 3-5分钟 |
| `sora2-pro-portrait-25s` | 竖屏Pro | 25秒 | 15-30分钟 |

### 快速代码示例

```javascript
// 生成视频
import { generateVideoFromText } from './services/sora-api';

const result = await generateVideoFromText(
  '可爱的狗 开飞机',
  'sora2-portrait-15s',
  (task) => console.log(`进度: ${task.progress}%`)
);

if (result.success) {
  console.log('视频URL:', result.data.video_url);
}
```

---

## 🎓 学习路径

### 初学者路径（第一天）

1. ✅ 阅读 [快速开始指南](./QUICK_START.md)
2. ✅ 配置API Key
3. ✅ 生成第一个视频
4. ✅ 了解基本功能

### 开发者路径（第二天）

1. ✅ 阅读 [API集成指南](./API_INTEGRATION_GUIDE.md)
2. ✅ 了解项目结构
3. ✅ 学习API使用流程
4. ✅ 测试不同模型

### 高级路径（第三天）

1. ✅ 阅读 [API完整文档](./API_DOCUMENTATION.md)
2. ✅ 理解所有API接口
3. ✅ 查看完整源代码
4. ✅ 自定义和优化功能

---

## 🔍 关键词索引

### A
- API Key配置 → [快速开始](./QUICK_START.md#步骤1-配置api-key2分钟)
- API文档 → [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### B
- 本地存储 → [集成指南 - 本地存储](./API_INTEGRATION_GUIDE.md#本地存储)

### C
- 创作页 → [集成指南 - 创作页](./API_INTEGRATION_GUIDE.md#2-创作页-createpage)

### G
- 故障排查 → [快速开始 - 遇到问题](./QUICK_START.md#遇到问题)
- 工具页 → [集成指南 - 工具页](./API_INTEGRATION_GUIDE.md#1-工具页-toolspage)

### M
- 模型列表 → [API文档 - 可用模型](./API_DOCUMENTATION.md#可用模型说明)

### P
- 配置 → [快速开始 - 步骤1](./QUICK_START.md#步骤1-配置api-key2分钟)

### S
- 视频生成 → [快速开始 - 步骤3](./QUICK_START.md#步骤3-生成第一个视频5分钟)

### T
- 提示词 → [快速开始 - 推荐提示词](./QUICK_START.md#推荐的第一批测试提示词)

### W
- 问题排查 → [集成指南 - 故障排查](./API_INTEGRATION_GUIDE.md#故障排查)

### Z
- 资产管理 → [集成指南 - 资产页](./API_INTEGRATION_GUIDE.md#3-资产页-assetspage)

---

## 💬 获取帮助

### 遇到问题时的检查清单

1. ✅ 查看 [快速开始 - 遇到问题？](./QUICK_START.md#遇到问题)
2. ✅ 查看 [集成指南 - 故障排查](./API_INTEGRATION_GUIDE.md#故障排查)
3. ✅ 打开浏览器控制台（F12）查看错误
4. ✅ 检查Network面板的API请求
5. ✅ 确认API Key配置正确

### 常见问题快速链接

- [API Key错误](./QUICK_START.md#api-key错误)
- [视频生成失败](./QUICK_START.md#视频生成失败)
- [进度不更新](./QUICK_START.md#进度不更新)
- [视频无法播放](./QUICK_START.md#视频无法播放)

---

## 📊 更新记录

| 日期 | 版本 | 更新内容 |
|------|------|---------|
| 2024-12-22 | v1.0 | 初始版本发布 |
| - | - | 完成API集成 |
| - | - | 创建所有文档 |

---

## 🎯 推荐阅读顺序

### 快速体验（30分钟）
```
1. README.md (5分钟)
   ↓
2. QUICK_START.md (10分钟)
   ↓
3. 实际操作：生成第一个视频 (15分钟)
```

### 深入了解（2小时）
```
1. QUICK_START.md (10分钟)
   ↓
2. API_INTEGRATION_GUIDE.md (30分钟)
   ↓
3. API_DOCUMENTATION.md (1小时)
   ↓
4. 实际测试各种功能 (20分钟)
```

### 完全掌握（1天）
```
1. 所有文档通读 (3小时)
   ↓
2. 查看完整源码 (2小时)
   ↓
3. 测试所有功能 (2小时)
   ↓
4. 自定义和优化 (1小时)
```

---

## 🌟 核心亮点

- ✅ **完整集成**: 8个API接口全部集成
- ✅ **简单易用**: 10分钟快速开始
- ✅ **文档齐全**: 详细的使用指南
- ✅ **代码示例**: 多语言代码示例
- ✅ **自动管理**: 进度自动更新
- ✅ **本地存储**: 视频自动保存

---

**🎉 祝你使用愉快！开始创作精彩的AI视频吧！** 🚀✨

---

*最后更新: 2024-12-22*
