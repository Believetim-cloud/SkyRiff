# SkyRiff Sora2 API 接口文档

## 📋 概述

本文档包含SkyRiff项目的Sora2视频生成API所有接口说明。

**Base URL**: `http://prod-cn.your-api-server.com`

**认证方式**: Bearer Token

**API版本**: v1.0

---

## 📑 接口清单

| 序号 | 接口名称 | 方法 | 路径 | 说明 |
|------|---------|------|------|------|
| 1 | [文生视频](#1-文生视频异步请求) | POST | /v1/videos | 根据提示词生成视频（异步） |
| 2 | [图生视频-直接传图](#2-图生视频直接传图异步请求) | POST | /v1/videos | 上传图片生成视频（异步） |
| 3 | [图生视频-URL传图](#3-图生视频url传图异步请求) | POST | /v1/videos | 通过图片URL生成视频（异步） |
| 4 | [查询任务进度](#4-查询任务进度异步查询) | GET | /v1/videos/{video_id} | 查询视频生成进度 |
| 5 | [查看视频内容](#5-查看视频内容) | GET | /v1/videos/{video_id}/content | 直接查看视频（较慢） |
| 6 | [Chat兼容模式](#6-chat兼容模式) | POST | /v1/chat/completions | 聊天格式视频生成（娱乐用） |
| 7 | [去水印-草稿](#7-去水印草稿未发作品) | POST | /v1/chat/completions | 获取草稿无水印视频 |
| 8 | [去水印-作品地址](#8-去水印作品地址) | POST | /v1/chat/completions | 获取发布作品无水印视频 |

---

## 🎬 可用模型说明

### 普通模式（生产力，3-5分钟）

| 模型名称 | 屏幕方向 | 时长 | 用途 |
|---------|---------|------|------|
| `sora2-landscape` | 横屏（电脑） | 10秒 | 快速生成横屏视频 |
| `sora2-portrait` | 竖屏（手机） | 10秒 | 快速生成竖屏视频 |
| `sora2-landscape-15s` | 横屏（电脑） | 15秒 | 高质量横屏视频 |
| `sora2-portrait-15s` | 竖屏（手机） | 15秒 | 高质量竖屏视频 |

### Pro 模式（创作，15-30分钟）

| 模型名称 | 屏幕方向 | 时长 | 特点 |
|---------|---------|------|------|
| `sora2-pro-landscape-25s` | 横屏（电脑） | 25秒 | 高清创作视频 |
| `sora2-pro-portrait-25s` | 竖屏（手机） | 25秒 | 高清创作视频 |
| `sora2-pro-landscape-hd-15s` | 横屏（电脑） | 15秒 | 超高清快速生成 |
| `sora2-pro-portrait-hd-15s` | 竖屏（手机） | 15秒 | 超高清快速生成 |

---

## ⚠️ 审查流程

所有视频生成都会经过以下审查：

1. **真人或拟真人内容审查**  
   - ❌ 禁止包含真人或拟真人图像

2. **提示词合规性检查**  
   - ❌ 禁止暴力、色情、版权侵权或涉及名人信息

3. **生成结果审查**  
   - ⚠️ 即使生成进度达到90%以上，如内容不合规仍可能被拒绝

> **注意**：请确保内容符合审查要求，避免生成失败。

---

## 🔌 接口详情

### 1. 文生视频（异步请求）

**接口说明**: 根据文本提示词生成视频，任务异步处理。

**URL**: `POST /v1/videos`

#### 请求参数

**Headers**:
```http
Authorization: Bearer {{YOUR_API_KEY}}
Accept: application/json
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "prompt": "可爱的狗 开飞机",
  "model": "sora2-portrait-15s"
}
```

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| prompt | string | ✅ 是 | 视频描述提示词 | "可爱的狗 开飞机" |
| model | string | ✅ 是 | 使用的模型名称 | "sora2-portrait-15s" |

#### 返回数据

**成功响应** (200):
```json
{
  "id": "video_c916cb42-8a53-480c-a8e5-62f9cf962bfd",
  "object": "video.generation",
  "model": "sora2-portrait-15s",
  "status": "pending",
  "progress": 0,
  "created_at": 1703260800,
  "size": "720x1280"
}
```

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | string | 任务ID，用于查询进度 |
| object | string | 对象类型 |
| model | string | 使用的模型 |
| status | string | 任务状态：pending/processing/success/failed |
| progress | number | 任务进度 0-100 |
| created_at | number | 创建时间戳 |
| size | string | 视频尺寸 |

#### 示例代码

**JavaScript**:
```javascript
const response = await fetch('http://prod-cn.your-api-server.com/v1/videos', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: '可爱的狗 开飞机',
    model: 'sora2-portrait-15s'
  })
});

const data = await response.json();
console.log('Task ID:', data.id);
```

**Python**:
```python
import requests

url = "http://prod-cn.your-api-server.com/v1/videos"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "prompt": "可爱的狗 开飞机",
    "model": "sora2-portrait-15s"
}

response = requests.post(url, json=data, headers=headers)
result = response.json()
print(f"Task ID: {result['id']}")
```

**cURL**:
```bash
curl -X POST 'http://prod-cn.your-api-server.com/v1/videos' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "prompt": "可爱的狗 开飞机",
    "model": "sora2-portrait-15s"
  }'
```

---

### 2. 图生视频-直接传图（异步请求）

**接口说明**: 上传图片文件，根据图片和提示词生成视频。

**URL**: `POST /v1/videos`

#### 请求参数

**Headers**:
```http
Authorization: Bearer {{YOUR_API_KEY}}
Accept: application/json
Content-Type: multipart/form-data
```

**Body** (FormData):
```
input_reference: [Binary File]
prompt: "换一个风格 广告"
model: "sora2-portrait-15s"
size: "1280x720" (可选)
seconds: "4" (可选)
```

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| input_reference | file | ✅ 是 | 上传的图片文件 | [Binary] |
| prompt | string | ✅ 是 | 视频描述提示词 | "换一个风格 广告" |
| model | string | ✅ 是 | 使用的模型名称 | "sora2-portrait-15s" |
| size | string | ❌ 否 | 视频尺寸 | "1280x720" |
| seconds | string | ❌ 否 | 视频时长 | "4" |

#### 返回数据

**成功响应** (200):
```json
{
  "id": "video_xxx",
  "object": "video.generation",
  "model": "sora2-portrait-15s",
  "status": "pending",
  "progress": 0,
  "created_at": 1703260800,
  "size": "720x1280"
}
```

#### 示例代码

**JavaScript**:
```javascript
const formData = new FormData();
formData.append('input_reference', fileInput.files[0]);
formData.append('prompt', '换一个风格 广告');
formData.append('model', 'sora2-portrait-15s');

const response = await fetch('http://prod-cn.your-api-server.com/v1/videos', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: formData
});

const data = await response.json();
console.log('Task ID:', data.id);
```

**Python**:
```python
import requests

url = "http://prod-cn.your-api-server.com/v1/videos"
headers = {
    "Authorization": "Bearer YOUR_API_KEY"
}
files = {
    'input_reference': open('image.png', 'rb')
}
data = {
    'prompt': '换一个风格 广告',
    'model': 'sora2-portrait-15s'
}

response = requests.post(url, headers=headers, files=files, data=data)
print(response.json())
```

**cURL**:
```bash
curl -X POST 'http://prod-cn.your-api-server.com/v1/videos' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -F 'input_reference=@/path/to/image.png' \
  -F 'prompt=换一个风格 广告' \
  -F 'model=sora2-portrait-15s'
```

---

### 3. 图生视频-URL传图（异步请求）

**接口说明**: 通过在线图片URL生成视频。支持 JPG/PNG 等常见格式。

**URL**: `POST /v1/videos`

#### 请求参数

**Headers**:
```http
Authorization: Bearer {{YOUR_API_KEY}}
Accept: application/json
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "image_url": "https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png",
  "prompt": "根据我的图片生成一个 广告宣传片",
  "model": "sora2-portrait-15s"
}
```

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| image_url | string | ✅ 是 | 在线图片URL | "https://example.com/image.png" |
| prompt | string | ✅ 是 | 视频描述提示词 | "生成广告宣传片" |
| model | string | ✅ 是 | 使用的模型名称 | "sora2-portrait-15s" |

#### 返回数据

**成功响应** (200):
```json
{
  "id": "video_xxx",
  "object": "video.generation",
  "model": "sora2-portrait-15s",
  "status": "pending",
  "progress": 0,
  "created_at": 1703260800,
  "size": "720x1280"
}
```

#### 示例代码

**JavaScript**:
```javascript
const response = await fetch('http://prod-cn.your-api-server.com/v1/videos', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    image_url: 'https://example.com/image.png',
    prompt: '根据我的图片生成一个 广告宣传片',
    model: 'sora2-portrait-15s'
  })
});

const data = await response.json();
console.log('Task ID:', data.id);
```

**Python**:
```python
import requests

url = "http://prod-cn.your-api-server.com/v1/videos"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "image_url": "https://example.com/image.png",
    "prompt": "根据我的图片生成一个 广告宣传片",
    "model": "sora2-portrait-15s"
}

response = requests.post(url, json=data, headers=headers)
print(response.json())
```

---

### 4. 查询任务进度（异步查询）

**接口说明**: 根据任务ID查询视频生成进度和结果。

**URL**: `GET /v1/videos/{video_id}`

#### 请求参数

**Headers**:
```http
Authorization: Bearer {{YOUR_API_KEY}}
Accept: application/json
```

**Path参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| video_id | string | ✅ 是 | 视频任务ID | "video_c916cb42-8a53-480c-a8e5-62f9cf962bfd" |

#### 返回数据

**处理中** (200):
```json
{
  "id": "video_c916cb42-8a53-480c-a8e5-62f9cf962bfd",
  "size": "720x1280",
  "model": "sora2-portrait-15s",
  "object": "video.generation",
  "status": "processing",
  "progress": 45,
  "video_url": null,
  "created_at": 1703260800,
  "completed_at": null
}
```

**已完成** (200):
```json
{
  "id": "video_c916cb42-8a53-480c-a8e5-62f9cf962bfd",
  "size": "720x1280",
  "model": "sora2-portrait-15s",
  "object": "video.generation",
  "status": "success",
  "progress": 100,
  "video_url": "https://cdn.example.com/videos/xxx.mp4",
  "created_at": 1703260800,
  "completed_at": 1703261100
}
```

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | string | 任务ID |
| status | string | 状态：pending/processing/success/failed |
| progress | number | 进度 0-100 |
| video_url | string | 视频下载链接（完成后可用） |
| created_at | number | 创建时间戳 |
| completed_at | number | 完成时间戳 |

#### 使用建议

1. **轮询查询**: 建议每5-10秒查询一次进度
2. **判断完成**: `status === 'success'` 或 `progress === 100`
3. **下载视频**: 使用返回的 `video_url` 直接下载

#### 示例代码

**JavaScript (轮询查询)**:
```javascript
async function pollVideoStatus(videoId) {
  const url = `http://prod-cn.your-api-server.com/v1/videos/${videoId}`;
  
  while (true) {
    const response = await fetch(url, {
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    });
    
    const data = await response.json();
    console.log(`Progress: ${data.progress}%`);
    
    if (data.status === 'success') {
      console.log('Video ready:', data.video_url);
      return data.video_url;
    }
    
    if (data.status === 'failed') {
      throw new Error('Video generation failed');
    }
    
    // 等待5秒后继续查询
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

// 使用示例
const videoUrl = await pollVideoStatus('video_xxx');
```

**Python (轮询查询)**:
```python
import requests
import time

def poll_video_status(video_id):
    url = f"http://prod-cn.your-api-server.com/v1/videos/{video_id}"
    headers = {"Authorization": "Bearer YOUR_API_KEY"}
    
    while True:
        response = requests.get(url, headers=headers)
        data = response.json()
        
        print(f"Progress: {data['progress']}%")
        
        if data['status'] == 'success':
            print(f"Video ready: {data['video_url']}")
            return data['video_url']
        
        if data['status'] == 'failed':
            raise Exception('Video generation failed')
        
        # 等待5秒
        time.sleep(5)

# 使用示例
video_url = poll_video_status('video_xxx')
```

---

### 5. 查看视频内容

**接口说明**: 直接查看视频内容（较慢，建议使用任务查询接口获取URL后下载）。

**URL**: `GET /v1/videos/{video_id}/content`

#### 请求参数

**Headers**:
```http
Authorization: Bearer {{YOUR_API_KEY}}
Accept: application/json
```

**Path参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| video_id | string | ✅ 是 | 视频任务ID |

#### 返回数据

返回视频二进制流。

> ⚠️ **注意**: 此接口较慢，仅供备用。建议使用接口4获取 `video_url` 后直接下载。

#### 示例代码

**JavaScript**:
```javascript
const response = await fetch(
  `http://prod-cn.your-api-server.com/v1/videos/${videoId}/content`,
  {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  }
);

const blob = await response.blob();
const url = URL.createObjectURL(blob);
// 使用url播放或下载视频
```

---

### 6. Chat兼容模式

**接口说明**: 聊天格式兼容接口，支持流式输出。**仅供娱乐使用，不具备生产效率**，响应时间约15分钟。

**URL**: `POST /v1/chat/completions`

#### 请求参数

**Headers**:
```http
Authorization: Bearer {{YOUR_API_KEY}}
Accept: application/json
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "model": "sora2-portrait-15s",
  "stream": true,
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "竖屏 动起来"
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "https://example.com/image.png"
          }
        }
      ]
    }
  ]
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| model | string | ✅ 是 | 模型名称 |
| stream | boolean | ❌ 否 | 是否流式输出 |
| messages | array | ✅ 是 | 消息列表 |

#### 可用模型

- `sora2-landscape`: 横屏10秒
- `sora2-portrait`: 竖屏10秒
- `sora2-landscape-15s`: 横屏15秒
- `sora2-portrait-15s`: 竖屏15秒

> ⚠️ **注意**: Pro模型随后接入

#### 示例代码

**JavaScript (流式输出)**:
```javascript
const response = await fetch('http://prod-cn.your-api-server.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'sora2-portrait-15s',
    stream: true,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: '竖屏 动起来' },
          { 
            type: 'image_url', 
            image_url: { url: 'https://example.com/image.png' }
          }
        ]
      }
    ]
  })
});

const reader = response.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log(new TextDecoder().decode(value));
}
```

---

### 7. 去水印（草稿未发作品）

**接口说明**: 获取Sora草稿箱中未发布作品的无水印视频链接。

**URL**: `POST /v1/chat/completions`

#### 前提条件

1. ✅ 必须正确传递 **AT (accessToken)** 功能
2. ✅ 使用完整的 **accessToken 字段**
3. ✅ 从 `https://sora.chatgpt.com/api/auth/session` 获取session
4. ✅ 确保请求参数**首尾无空格**

#### 请求参数

**Headers**:
```http
Authorization: Bearer {{YOUR_API_KEY}}
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "model": "sora-drafts-url",
  "stream": false,
  "messages": [
    {
      "role": "user",
      "content": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE5MzQ0ZTY1LWJiYzktNDRkMS1hOWQwLWY5NTdiMDc5YmQwZSIsInR5cCI6IkpXVCJ9..."
    }
  ]
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| model | string | ✅ 是 | 固定值：`sora-drafts-url` |
| stream | boolean | ✅ 是 | **必须为 false**（非流式） |
| messages[].content | string | ✅ 是 | 完整的 accessToken |

> ⚠️ **重要**: 
> - 必须使用 `stream: false` 非流式模式
> - content 是完整的 accessToken，不要有首尾空格

#### 返回数据

**成功响应** (200):
```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1703260800,
  "model": "sora-drafts-url",
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "视频解析成功"
      }
    }
  ],
  "links": {
    "gif": "https://cdn.example.com/xxx.gif",
    "text": "视频描述文本",
    "id": "draft_xxx",
    "mp4": "https://cdn.example.com/xxx_no_watermark.mp4",
    "mp4_wm": "https://cdn.example.com/xxx_with_watermark.mp4",
    "md": "# Markdown内容",
    "thumbnail": "https://cdn.example.com/thumbnail.jpg"
  },
  "usage": {
    "completion_tokens": 10,
    "total_tokens": 100,
    "prompt_tokens": 90
  },
  "post_id": "draft_xxx",
  "original_input": "原始提示词",
  "post_info": {
    "attachments_count": 1,
    "view_count": 0,
    "like_count": 0,
    "title": "草稿标题"
  }
}
```

#### 关键字段说明

| 字段名 | 说明 |
|--------|------|
| links.mp4 | **无水印视频链接** ⭐ |
| links.mp4_wm | 带水印视频链接 |
| links.gif | GIF预览链接 |
| links.thumbnail | 缩略图链接 |
| post_info | 视频信息统计 |

#### 示例代码

**JavaScript**:
```javascript
const response = await fetch('http://prod-cn.your-api-server.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'sora-drafts-url',
    stream: false,
    messages: [
      {
        role: 'user',
        content: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE5MzQ0ZTY1...' // accessToken
      }
    ]
  })
});

const data = await response.json();
const noWatermarkUrl = data.links.mp4; // 无水印视频URL
console.log('无水印视频:', noWatermarkUrl);
```

**Python**:
```python
import requests

url = "http://prod-cn.your-api-server.com/v1/chat/completions"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "model": "sora-drafts-url",
    "stream": False,
    "messages": [
        {
            "role": "user",
            "content": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE5MzQ0ZTY1..."  # accessToken
        }
    ]
}

response = requests.post(url, json=data, headers=headers)
result = response.json()
no_watermark_url = result['links']['mp4']
print(f'无水印视频: {no_watermark_url}')
```

---

### 8. 去水印（作品地址）

**接口说明**: 通过Sora发布作品的URL获取无水印视频链接。

**URL**: `POST /v1/chat/completions`

#### 请求参数

**Headers**:
```http
Authorization: Bearer {{YOUR_API_KEY}}
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "model": "sora_url",
  "stream": false,
  "messages": [
    {
      "role": "user",
      "content": "https://sora.chatgpt.com/p/s_68f6140d88a881911111111111111a6b5c803d4e147b6c"
    }
  ]
}
```

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| model | string | ✅ 是 | 固定值：`sora_url` |
| stream | boolean | ✅ 是 | **必须为 false**（非流式） |
| messages[].content | string | ✅ 是 | Sora作品完整URL |

> ⚠️ **重要**: 
> - 必须使用 `stream: false` 非流式模式
> - content 是完整的作品URL，注意首尾不要有空格

#### 返回数据

**成功响应** (200):
```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1703260800,
  "model": "sora_url",
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "视频解析成功"
      }
    }
  ],
  "links": {
    "gif": "https://cdn.example.com/xxx.gif",
    "text": "视频描述文本",
    "id": "s_68f6140d88a881911111111111111a6b5c803d4e147b6c",
    "mp4": "https://cdn.example.com/xxx_no_watermark.mp4",
    "mp4_wm": "https://cdn.example.com/xxx_with_watermark.mp4",
    "md": "# Markdown内容",
    "thumbnail": "https://cdn.example.com/thumbnail.jpg"
  },
  "usage": {
    "completion_tokens": 10,
    "total_tokens": 100,
    "prompt_tokens": 90
  },
  "post_id": "s_68f6140d88a881911111111111111a6b5c803d4e147b6c",
  "original_input": "原始提示词",
  "post_info": {
    "attachments_count": 1,
    "view_count": 1234,
    "like_count": 56,
    "title": "作品标题"
  }
}
```

#### 关键字段说明

| 字段名 | 说明 |
|--------|------|
| links.mp4 | **无水印视频链接** ⭐ |
| links.mp4_wm | 带水印视频链接 |
| links.gif | GIF预览链接 |
| links.thumbnail | 缩略图链接 |
| post_info.view_count | 观看次数 |
| post_info.like_count | 点赞次数 |

#### 示例代码

**JavaScript**:
```javascript
const response = await fetch('http://prod-cn.your-api-server.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'sora_url',
    stream: false,
    messages: [
      {
        role: 'user',
        content: 'https://sora.chatgpt.com/p/s_68f6140d88a881911111111111111a6b5c803d4e147b6c'
      }
    ]
  })
});

const data = await response.json();
const noWatermarkUrl = data.links.mp4; // 无水印视频URL
const videoInfo = data.post_info;

console.log('无水印视频:', noWatermarkUrl);
console.log('观看次数:', videoInfo.view_count);
console.log('点赞次数:', videoInfo.like_count);
```

**Python**:
```python
import requests

url = "http://prod-cn.your-api-server.com/v1/chat/completions"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "model": "sora_url",
    "stream": False,
    "messages": [
        {
            "role": "user",
            "content": "https://sora.chatgpt.com/p/s_68f6140d88a881911111111111111a6b5c803d4e147b6c"
        }
    ]
}

response = requests.post(url, json=data, headers=headers)
result = response.json()

no_watermark_url = result['links']['mp4']
video_info = result['post_info']

print(f'无水印视频: {no_watermark_url}')
print(f"观看次数: {video_info['view_count']}")
print(f"点赞次数: {video_info['like_count']}")
```

---

## 🔐 认证说明

### Token获取

请联系管理员获取API Key。

### Token使用

在所有接口请求头中加入：

```http
Authorization: Bearer YOUR_API_KEY
```

---

## 📋 任务状态说明

| 状态 | 说明 | 操作建议 |
|------|------|---------|
| `pending` | 任务已创建，等待处理 | 继续等待 |
| `processing` | 任务处理中 | 继续轮询查询 |
| `success` | 任务完成 | 可以下载视频 |
| `failed` | 任务失败 | 检查错误信息，重新提交 |

---

## 🔢 错误码说明

| HTTP状态码 | 说明 | 处理方式 |
|-----------|------|---------|
| 200 | 成功 | - |
| 400 | 请求参数错误 | 检查参数格式 |
| 401 | 认证失败 | 检查API Key |
| 403 | 权限不足 | 联系管理员 |
| 404 | 资源不存在 | 检查任务ID |
| 429 | 请求过于频繁 | 降低请求频率 |
| 500 | 服务器错误 | 稍后重试 |

---

## 📊 完整使用流程示例

### 流程1: 文生视频完整流程

```javascript
// 步骤1: 创建视频生成任务
const createTask = async () => {
  const response = await fetch('http://prod-cn.your-api-server.com/v1/videos', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: '可爱的狗 开飞机',
      model: 'sora2-portrait-15s'
    })
  });
  
  const data = await response.json();
  return data.id; // 返回任务ID
};

// 步骤2: 轮询查询任务状态
const pollTask = async (taskId) => {
  while (true) {
    const response = await fetch(
      `http://prod-cn.your-api-server.com/v1/videos/${taskId}`,
      {
        headers: {
          'Authorization': 'Bearer YOUR_API_KEY'
        }
      }
    );
    
    const data = await response.json();
    console.log(`进度: ${data.progress}%`);
    
    if (data.status === 'success') {
      return data.video_url; // 返回视频URL
    }
    
    if (data.status === 'failed') {
      throw new Error('生成失败');
    }
    
    // 等待5秒后继续查询
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
};

// 步骤3: 下载视频
const downloadVideo = async (videoUrl) => {
  const response = await fetch(videoUrl);
  const blob = await response.blob();
  
  // 创建下载链接
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'video.mp4';
  a.click();
};

// 完整流程
(async () => {
  try {
    console.log('创建任务...');
    const taskId = await createTask();
    
    console.log('等待生成...');
    const videoUrl = await pollTask(taskId);
    
    console.log('下载视频...');
    await downloadVideo(videoUrl);
    
    console.log('完成！');
  } catch (error) {
    console.error('错误:', error);
  }
})();
```

### 流程2: 图生视频完整流程

```python
import requests
import time

def create_image_to_video_task(image_url, prompt, model='sora2-portrait-15s'):
    """创建图生视频任务"""
    url = "http://prod-cn.your-api-server.com/v1/videos"
    headers = {
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    }
    data = {
        "image_url": image_url,
        "prompt": prompt,
        "model": model
    }
    
    response = requests.post(url, json=data, headers=headers)
    result = response.json()
    return result['id']

def poll_task_status(task_id):
    """轮询查询任务状态"""
    url = f"http://prod-cn.your-api-server.com/v1/videos/{task_id}"
    headers = {"Authorization": "Bearer YOUR_API_KEY"}
    
    while True:
        response = requests.get(url, headers=headers)
        data = response.json()
        
        print(f"进度: {data['progress']}%")
        
        if data['status'] == 'success':
            return data['video_url']
        
        if data['status'] == 'failed':
            raise Exception('生成失败')
        
        time.sleep(5)

def download_video(video_url, filename='video.mp4'):
    """下载视频"""
    response = requests.get(video_url, stream=True)
    with open(filename, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    print(f'视频已保存到: {filename}')

# 完整流程
if __name__ == '__main__':
    try:
        print('创建任务...')
        task_id = create_image_to_video_task(
            image_url='https://example.com/image.png',
            prompt='生成广告宣传片',
            model='sora2-portrait-15s'
        )
        print(f'任务ID: {task_id}')
        
        print('等待生成...')
        video_url = poll_task_status(task_id)
        print(f'视频URL: {video_url}')
        
        print('下载视频...')
        download_video(video_url)
        
        print('完成！')
    except Exception as e:
        print(f'错误: {e}')
```

---

## 💡 使用建议

### 1. 轮询频率
- **建议**: 每5-10秒查询一次进度
- **避免**: 过于频繁的请求会被限流

### 2. 超时设置
- **普通模式**: 建议设置5分钟超时
- **Pro模式**: 建议设置30分钟超时

### 3. 错误重试
- 对于 `5xx` 错误，建议重试3次
- 每次重试间隔递增（如1秒、2秒、4秒）

### 4. 视频下载
- **优先使用**: `video_url` 直接下载
- **避免使用**: `/content` 接口（较慢）

### 5. 内容审查
- 提交前自查内容是否合规
- 避免真人、暴力、色情等违规内容
- 即使生成到90%也可能被拒绝

### 6. 模型选择
- **快速预览**: 使用普通模式（10秒/15秒）
- **高质量创作**: 使用Pro模式（25秒/HD）
- **横竖屏选择**: 根据使用场景选择对应模型

---

## 🌐 环境配置

### 生产环境
- **Base URL**: `http://prod-cn.your-api-server.com`
- **超时时间**: 30分钟

---

## 📊 频率限制

| 接口类型 | 限制 | 说明 |
|---------|------|------|
| 视频生成 | 待确认 | 根据账户等级不同 |
| 进度查询 | 待确认 | 建议5-10秒/次 |
| 去水印 | 待确认 | 注意合理使用 |

> 具体限制请联系管理员确认

---

## 📞 技术支持

- **API文档**: 本文档
- **问题反馈**: 请联系技术支持
- **更新日志**: 查看底部更新记录

---

## 📝 更新日志

### v1.0.0 (2024-12-22)
- ✅ 初始版本发布
- ✅ 包含8个核心API接口
- ✅ 支持文生视频、图生视频
- ✅ 支持任务查询和视频下载
- ✅ 支持Chat兼容模式
- ✅ 支持去水印功能

---

## 🎯 快速导航

- [文生视频](#1-文生视频异步请求) - 最基础的视频生成
- [图生视频-URL](#3-图生视频url传图异步请求) - 最常用的图生视频
- [查询进度](#4-查询任务进度异步查询) - 获取视频下载链接
- [去水印-作品](#8-去水印作品地址) - 获取无水印视频

---

**© 2024 SkyRiff Sora2 API Documentation**

*最后更新: 2024-12-22*
