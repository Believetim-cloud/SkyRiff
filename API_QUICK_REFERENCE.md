# 📋 SkyRiff API 快速参考卡

## 🔗 API端点速查

### Base URL
```
http://prod-cn.your-api-server.com
```

### 认证
```http
Authorization: Bearer YOUR_API_KEY
```

---

## 📡 接口列表

| 接口 | 方法 | 路径 | 功能 |
|------|------|------|------|
| 文生视频 | POST | `/v1/videos` | 文字→视频 |
| 图生视频 | POST | `/v1/videos` | 图片→视频 |
| 查询进度 | GET | `/v1/videos/{id}` | 查询状态 |
| 查看内容 | GET | `/v1/videos/{id}/content` | 获取视频 |
| Chat模式 | POST | `/v1/chat/completions` | 聊天生成 |

---

## 🎬 模型速查

### 标准模型（3-5分钟）

| 模型ID | 说明 | 时长 |
|--------|------|------|
| `sora2-portrait` | 竖屏快速 | 10秒 |
| `sora2-landscape` | 横屏快速 | 10秒 |
| `sora2-portrait-15s` | 竖屏标准 ⭐ | 15秒 |
| `sora2-landscape-15s` | 横屏标准 ⭐ | 15秒 |

### Pro模型（15-30分钟）

| 模型ID | 说明 | 时长 |
|--------|------|------|
| `sora2-pro-portrait-25s` | 竖屏Pro | 25秒 |
| `sora2-pro-landscape-25s` | 横屏Pro | 25秒 |
| `sora2-pro-portrait-hd-15s` | 竖屏高清 | 15秒 |
| `sora2-pro-landscape-hd-15s` | 横屏高清 | 15秒 |

---

## 💻 代码速查

### 1️⃣ 文生视频

```typescript
import { generateVideoFromText } from './services/sora-api';

const result = await generateVideoFromText(
  '可爱的狗 开飞机',
  'sora2-portrait-15s',
  (task) => console.log(`${task.progress}%`)
);
```

### 2️⃣ 图生视频

```typescript
import { generateVideoFromImageFile } from './services/sora-api';

const result = await generateVideoFromImageFile(
  file,
  '让画面动起来',
  'sora2-portrait-15s'
);
```

### 3️⃣ 查询状态

```typescript
import { getVideoStatus } from './services/sora-api';

const result = await getVideoStatus('video_id');
console.log(result.data.progress); // 0-100
```

### 4️⃣ 本地存储

```typescript
import { getLocalVideos } from './services/storage';

const videos = getLocalVideos();
console.log(`共${videos.length}个视频`);
```

---

## 📦 请求示例

### 文生视频请求

```http
POST /v1/videos
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "prompt": "可爱的狗 开飞机",
  "model": "sora2-portrait-15s"
}
```

### 响应

```json
{
  "id": "video_xxx",
  "status": "pending",
  "progress": 0,
  "model": "sora2-portrait-15s",
  "created_at": 1703260800
}
```

---

## 🔄 任务状态

| 状态 | 说明 | 进度 |
|------|------|------|
| `pending` | 等待处理 | 0% |
| `processing` | 生成中 | 1-99% |
| `success` | 已完成 ✅ | 100% |
| `failed` | 失败 ❌ | - |

---

## 🎯 使用流程

### 标准流程

```
1. 创建任务 → 获得 video_id
   ↓
2. 轮询查询 → 每5秒一次
   ↓
3. 获取结果 → video_url
   ↓
4. 下载视频 → 完成
```

### 代码实现

```typescript
// 1. 创建
const create = await createTextToVideo({
  prompt: '提示词',
  model: 'sora2-portrait-15s'
});

// 2. 轮询
const result = await pollVideoStatus(
  create.data.id,
  (task) => console.log(task.progress)
);

// 3. 获取
const videoUrl = result.data.video_url;
```

---

## ⚡ 快速命令

### JavaScript一键生成

```javascript
// 复制粘贴即可使用
generateVideoFromText(
  '可爱的狗 开飞机',
  'sora2-portrait-15s'
).then(r => console.log(r.data.video_url));
```

### Python一键生成

```python
# 完整流程
import requests, time

def generate(prompt, model):
    # 创建任务
    r = requests.post(
        'http://prod-cn.your-api-server.com/v1/videos',
        json={'prompt': prompt, 'model': model},
        headers={'Authorization': 'Bearer YOUR_API_KEY'}
    )
    vid = r.json()['id']
    
    # 等待完成
    while True:
        s = requests.get(
            f'http://prod-cn.your-api-server.com/v1/videos/{vid}',
            headers={'Authorization': 'Bearer YOUR_API_KEY'}
        ).json()
        
        if s['status'] == 'success':
            return s['video_url']
        
        time.sleep(5)

# 使用
url = generate('可爱的狗 开飞机', 'sora2-portrait-15s')
print(url)
```

---

## 🚨 错误处理

### HTTP状态码

| 代码 | 说明 | 处理方式 |
|------|------|---------|
| 200 | 成功 | - |
| 400 | 参数错误 | 检查参数 |
| 401 | 认证失败 | 检查API Key |
| 429 | 请求过多 | 降低频率 |
| 500 | 服务器错误 | 稍后重试 |

### 常见错误

```typescript
// 错误处理示例
try {
  const result = await generateVideoFromText(...);
  
  if (!result.success) {
    switch (result.error.code) {
      case 401:
        console.error('API Key错误');
        break;
      case 429:
        console.error('请求过于频繁');
        break;
      default:
        console.error(result.error.message);
    }
  }
} catch (err) {
  console.error('网络错误:', err);
}
```

---

## 📊 性能参考

### 生成时间

| 模型类型 | 预计时间 | 最长时间 |
|---------|---------|---------|
| 10秒模型 | 3分钟 | 5分钟 |
| 15秒模型 | 4分钟 | 6分钟 |
| Pro模型 | 20分钟 | 30分钟 |

### 轮询建议

- **间隔**: 5秒/次
- **超时**: 30分钟
- **重试**: 3次

---

## 🎨 提示词模板

### 快速模板

```
自然风景:
"[天气][时间][地点]，[主要元素]，[氛围]"
示例: "晴朗的早晨森林中，阳光透过树叶，宁静祥和"

动物主题:
"[数量][动物][动作]在[地点]，[环境描述]"
示例: "一只金毛犬欢快奔跑在草地上，阳光明媚"

城市场景:
"[时间][城市特征]，[主要元素]，[风格]"
示例: "夜晚繁华都市，霓虹灯闪烁，赛博朋克风格"
```

---

## 🔧 配置文件

### api-config.ts

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://prod-cn.your-api-server.com',
  API_KEY: 'YOUR_API_KEY', // 👈 改这里
  POLLING: {
    INTERVAL: 5000,  // 5秒
    MAX_ATTEMPTS: 360 // 30分钟
  }
};
```

---

## 📱 快捷操作

### APP内操作

| 功能 | 路径 |
|------|------|
| 生成视频 | 工作室 → 生成AI视频 |
| 图片转视频 | 工作室 → 图片转视频 |
| 查看资产 | 底部"资产"Tab |
| 刷新状态 | 资产页右上角 |

### 快捷键（桌面端）

| 按键 | 功能 |
|------|------|
| `Ctrl/Cmd + N` | 新建生成 |
| `Ctrl/Cmd + R` | 刷新列表 |
| `Ctrl/Cmd + ,` | 打开设置 |
| `F5` | 刷新页面 |

---

## 💡 最佳实践

### ✅ 推荐做法

1. **先用标准模型测试**
   - 使用15秒模型快速预览
   - 满意后再用Pro模型

2. **提示词要详细**
   - 描述清晰具体
   - 包含动作和氛围

3. **合理设置轮询**
   - 5秒间隔较合适
   - 避免过于频繁

4. **处理错误情况**
   - 捕获异常
   - 提供用户反馈

### ❌ 避免做法

1. **不要过于频繁请求**
   - 会被限流
   - 影响其他任务

2. **不要使用违规内容**
   - 真人图像
   - 敏感内容

3. **不要忽略错误**
   - 可能导致任务丢失
   - 影响用户体验

---

## 📞 获取帮助

### 文档链接

- **完整API文档**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **详细使用指南**: [API_DETAILED_GUIDE.md](./API_DETAILED_GUIDE.md)
- **快速开始**: [QUICK_START.md](./QUICK_START.md)
- **集成指南**: [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)

### 快速链接

- **配置API Key**: 编辑 `/src/app/services/api-config.ts`
- **查看示例**: `/API_DETAILED_GUIDE.md` 第1-4节
- **故障排查**: `/QUICK_START.md` → "遇到问题？"

---

## 🎯 一分钟速成

### 最快上手流程

```
1. 改API Key → /src/app/services/api-config.ts
2. 打开APP → 点"工作室"
3. 点"生成AI视频" → 输入提示词
4. 选"竖屏15秒" → 点"开始生成"
5. 等3-5分钟 → 完成！
```

### 测试命令

```javascript
// 浏览器控制台输入
fetch('http://prod-cn.your-api-server.com/v1/videos', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: '测试',
    model: 'sora2-portrait'
  })
})
.then(r => r.json())
.then(d => console.log('成功!', d))
```

---

**💾 保存此卡片，随时查阅！**

*最后更新: 2024-12-22*
