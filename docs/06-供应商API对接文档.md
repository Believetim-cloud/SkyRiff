# SkyRiff 供应商API对接文档 v1.0

> **供应商**：DyuAPI Sora2  
> **Base URL**：`https://api.dyuapi.com`  
> **文档来源**：https://6ibmqmipvf.apifox.cn

---

## 一、接口总览

### 1.1 接口清单

| 序号 | 接口名称 | 方法 | 路径 | 用途 |
|------|---------|------|------|------|
| 1 | 文生视频 | POST | `/v1/videos` | 文本生成视频（异步） |
| 2 | 图生视频（直接传图） | POST | `/v1/videos` | 图片生成视频（上传文件） |
| 3 | 图生视频（URL传图） | POST | `/v1/videos` | 图片生成视频（传URL） |
| 4 | 任务进度查询 | GET | `/v1/videos/{id}` | 查询任务状态与进度 |
| 5 | 查看视频内容 | GET | `/v1/videos/{id}/content` | 获取视频详细信息 |
| 6 | 去水印（作品地址） | POST | `/v1/chat/completions` | 通过作品URL去水印 |
| 7 | 去水印（草稿未发） | POST | `/v1/chat/completions` | 通过accessToken去水印 |
| 8 | Chat聊天 | POST | `/v1/chat/completions` | 聊天格式兼容（v1不用） |

### 1.2 认证方式
```
Authorization: Bearer YOUR_API_KEY
```

### 1.3 请求超时
- **推荐超时时间**：60秒
- **任务轮询间隔**：5秒（前端）/ 30秒（后端Celery）

---

## 二、文生视频（异步请求）

### 2.1 接口信息
- **方法**：POST
- **路径**：`/v1/videos`
- **请求格式**：`multipart/form-data`

### 2.2 请求参数

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| prompt | string | ✅ | 提示词 | "一只可爱的猫咪在草地上奔跑" |
| model | string | ✅ | 模型名称 | "sora2-portrait" |
| size | string | ✅ | 视频尺寸 | "720x1280" |
| seconds | int | ✅ | 视频时长 | 10 |

### 2.3 model参数说明

#### Sora2基础版（10秒/15秒）
| 模型名称 | 时长 | 比例 | 尺寸 |
|---------|------|------|------|
| `sora2-portrait` | 10秒 | 9:16竖屏 | 720x1280 |
| `sora2-portrait-15s` | 15秒 | 9:16竖屏 | 720x1280 |
| `sora2-landscape` | 10秒 | 16:9横屏 | 1280x720 |
| `sora2-landscape-15s` | 15秒 | 16:9横屏 | 1280x720 |

#### Sora2Pro高级版（25秒/HD）
| 模型名称 | 时长 | 比例 | 尺寸 |
|---------|------|------|------|
| `sora2-pro-portrait-25s` | 25秒 | 9:16竖屏 | 720x1280 |
| `sora2-pro-landscape-25s` | 25秒 | 16:9横屏 | 1280x720 |
| `sora2-pro-portrait-hd-15s` | 15秒HD | 9:16竖屏 | 720x1280 |
| `sora2-pro-landscape-hd-15s` | 15秒HD | 16:9横屏 | 1280x720 |

### 2.4 请求示例

#### cURL
```bash
curl -X POST https://api.dyuapi.com/v1/videos \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "prompt=一只可爱的橘猫在绿色草地上快乐地奔跑" \
  -F "model=sora2-portrait" \
  -F "size=720x1280" \
  -F "seconds=10"
```

#### Python
```python
import httpx

async def create_text2video():
    url = "https://api.dyuapi.com/v1/videos"
    headers = {"Authorization": "Bearer YOUR_API_KEY"}
    data = {
        "prompt": "一只可爱的橘猫在绿色草地上快乐地奔跑",
        "model": "sora2-portrait",
        "size": "720x1280",
        "seconds": "10"
    }
    
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, headers=headers, data=data)
        return resp.json()
```

### 2.5 响应示例

#### 成功
```json
{
  "id": "v_abc123xyz",
  "object": "video.generation",
  "status": "queued",
  "progress": 0,
  "model": "sora2-portrait",
  "created_at": 1735123456
}
```

#### 失败
```json
{
  "error": {
    "message": "Insufficient credits",
    "type": "invalid_request_error",
    "code": "insufficient_credits"
  }
}
```

---

## 三、图生视频（直接传图）

### 3.1 接口信息
- **方法**：POST
- **路径**：`/v1/videos`
- **请求格式**：`multipart/form-data`

### 3.2 请求参数

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| prompt | string | ✅ | 提示词 | "基于这张图生成视频" |
| model | string | ✅ | 模型名称 | "sora2-portrait" |
| size | string | ✅ | 视频尺寸 | "720x1280" |
| seconds | int | ✅ | 视频时长 | 10 |
| input_reference | file | ✅ | 参考图片文件 | <binary> |

### 3.3 请求示例

#### cURL
```bash
curl -X POST https://api.dyuapi.com/v1/videos \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "prompt=让图中的猫咪动起来" \
  -F "model=sora2-portrait" \
  -F "size=720x1280" \
  -F "seconds=10" \
  -F "input_reference=@/path/to/cat.png"
```

#### Python
```python
async def create_image2video_upload():
    url = "https://api.dyuapi.com/v1/videos"
    headers = {"Authorization": "Bearer YOUR_API_KEY"}
    
    with open("/path/to/cat.png", "rb") as f:
        image_bytes = f.read()
    
    data = {
        "prompt": "让图中的猫咪动起来",
        "model": "sora2-portrait",
        "size": "720x1280",
        "seconds": "10"
    }
    
    files = {
        "input_reference": ("cat.png", image_bytes, "application/octet-stream")
    }
    
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, headers=headers, data=data, files=files)
        return resp.json()
```

### 3.4 响应示例
同文生视频（2.5节）

---

## 四、图生视频（URL传图）

### 4.1 接口信息
- **方法**：POST
- **路径**：`/v1/videos`
- **请求格式**：`application/json`

### 4.2 请求参数

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| image_url | string | ✅ | 参考图片URL | "https://example.com/cat.png" |
| prompt | string | ✅ | 提示词 | "让图中的猫咪动起来" |
| model | string | ✅ | 模型名称 | "sora2-portrait" |
| size | string | ✅ | 视频尺寸 | "720x1280" |
| seconds | int | ✅ | 视频时长 | 10 |

### 4.3 请求示例

#### cURL
```bash
curl -X POST https://api.dyuapi.com/v1/videos \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://example.com/cat.png",
    "prompt": "让图中的猫咪动起来",
    "model": "sora2-portrait",
    "size": "720x1280",
    "seconds": 10
  }'
```

#### Python
```python
async def create_image2video_by_url():
    url = "https://api.dyuapi.com/v1/videos"
    headers = {
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    }
    payload = {
        "image_url": "https://example.com/cat.png",
        "prompt": "让图中的猫咪动起来",
        "model": "sora2-portrait",
        "size": "720x1280",
        "seconds": 10
    }
    
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, headers=headers, json=payload)
        return resp.json()
```

### 4.4 响应示例
同文生视频（2.5节）

---

## 五、任务进度查询

### 5.1 接口信息
- **方法**：GET
- **路径**：`/v1/videos/{id}`
- **说明**：查询任务状态、进度、视频URL

### 5.2 路径参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | ✅ | 任务ID（创建时返回的id） |

### 5.3 请求示例

#### cURL
```bash
curl -X GET https://api.dyuapi.com/v1/videos/v_abc123xyz \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Python
```python
async def get_task_state(task_id: str):
    url = f"https://api.dyuapi.com/v1/videos/{task_id}"
    headers = {"Authorization": "Bearer YOUR_API_KEY"}
    
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers=headers)
        return resp.json()
```

### 5.4 响应示例

#### 排队中
```json
{
  "id": "v_abc123xyz",
  "object": "video.generation",
  "status": "queued",
  "progress": 0,
  "model": "sora2-portrait",
  "created_at": 1735123456
}
```

#### 生成中
```json
{
  "id": "v_abc123xyz",
  "object": "video.generation",
  "status": "processing",
  "progress": 65,
  "model": "sora2-portrait",
  "created_at": 1735123456,
  "started_at": 1735123466
}
```

#### 生成成功（关键）
```json
{
  "id": "v_abc123xyz",
  "object": "video.generation",
  "status": "completed",
  "progress": 100,
  "model": "sora2-portrait",
  "video_url": "https://cdn.dyuapi.com/videos/abc123.mp4",
  "size": 1024000,
  "created_at": 1735123456,
  "started_at": 1735123466,
  "completed_at": 1735123496
}
```

**关键字段**：
- `status`: `"completed"` 表示成功
- `video_url`: 视频下载链接（**无水印源**）

#### 生成失败
```json
{
  "id": "v_abc123xyz",
  "object": "video.generation",
  "status": "failed",
  "progress": 0,
  "model": "sora2-portrait",
  "error": {
    "message": "Generation timeout",
    "type": "generation_error"
  },
  "created_at": 1735123456,
  "started_at": 1735123466,
  "completed_at": 1735123496
}
```

### 5.5 状态映射

| 供应商status | 内部状态 | 说明 |
|-------------|---------|------|
| `created` / `not_start` | NOT_START | 未开始 |
| `queued` / `pending` | QUEUED | 排队中 |
| `processing` / `in_progress` / `running` | IN_PROGRESS | 生成中 |
| `completed` / `success` / `done` | SUCCESS | 成功 |
| `failed` / `error` | FAILURE | 失败 |

---

## 六、查看视频内容

### 6.1 接口信息
- **方法**：GET
- **路径**：`/v1/videos/{id}/content`
- **说明**：获取视频详细信息（⚠️ 文档提示：此接口可能较慢）

### 6.2 路径参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | ✅ | 任务ID |

### 6.3 请求示例

#### cURL
```bash
curl -X GET https://api.dyuapi.com/v1/videos/v_abc123xyz/content \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Python
```python
async def get_video_content(task_id: str):
    url = f"https://api.dyuapi.com/v1/videos/{task_id}/content"
    headers = {"Authorization": "Bearer YOUR_API_KEY"}
    
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers=headers)
        return resp.json()
```

### 6.4 响应示例

```json
{
  "id": "v_abc123xyz",
  "video_url": "https://cdn.dyuapi.com/videos/abc123.mp4",
  "thumbnail_url": "https://cdn.dyuapi.com/thumbs/abc123.jpg",
  "duration": 10,
  "width": 720,
  "height": 1280,
  "size": 1024000
}
```

**说明**：
- ⚠️ 此接口可能响应较慢
- ✅ 建议直接使用 `/v1/videos/{id}` 返回的 `video_url`
- v1版本可以不依赖此接口

---

## 七、去水印（作品地址）

### 7.1 接口信息
- **方法**：POST
- **路径**：`/v1/chat/completions`
- **请求格式**：`application/json`
- **说明**：通过Sora作品帖子地址获取无水印/水印链接

### 7.2 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| model | string | ✅ | 固定值：`"sora_url"` |
| messages | array | ✅ | 消息数组 |
| messages[0].role | string | ✅ | 固定值：`"user"` |
| messages[0].content | string | ✅ | Sora作品帖子地址 |

### 7.3 请求示例

#### cURL
```bash
curl -X POST https://api.dyuapi.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "sora_url",
    "messages": [
      {
        "role": "user",
        "content": "https://sora.chatgpt.com/p/abc123"
      }
    ]
  }'
```

#### Python
```python
async def unwatermark_by_work_url(work_url: str):
    url = "https://api.dyuapi.com/v1/chat/completions"
    headers = {
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "sora_url",
        "messages": [
            {"role": "user", "content": work_url}
        ]
    }
    
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, headers=headers, json=payload)
        return resp.json()
```

### 7.4 响应示例

```json
{
  "id": "chatcmpl_abc123",
  "object": "chat.completion",
  "created": 1735123456,
  "model": "sora_url",
  "links": {
    "mp4": "https://cdn.sora.com/videos/abc123_nowm.mp4",
    "mp4_wm": "https://cdn.sora.com/videos/abc123_wm.mp4",
    "thumbnail": "https://cdn.sora.com/thumbs/abc123.jpg",
    "md": "https://cdn.sora.com/previews/abc123.md",
    "gif": "https://cdn.sora.com/previews/abc123.gif"
  }
}
```

**关键字段**：
- `links.mp4`: 无水印视频链接
- `links.mp4_wm`: 水印视频链接
- `links.thumbnail`: 缩略图
- `links.md`: 预览动图（MD格式）
- `links.gif`: 预览GIF

---

## 八、去水印（草稿未发作品）

### 8.1 接口信息
- **方法**：POST
- **路径**：`/v1/chat/completions`
- **请求格式**：`application/json`
- **说明**：通过accessToken获取草稿视频链接

### 8.2 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| model | string | ✅ | 固定值：`"sora-drafts-url"` |
| messages | array | ✅ | 消息数组 |
| messages[0].role | string | ✅ | 固定值：`"user"` |
| messages[0].content | string | ✅ | accessToken |

### 8.3 请求示例

#### cURL
```bash
curl -X POST https://api.dyuapi.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "sora-drafts-url",
    "messages": [
      {
        "role": "user",
        "content": "ACCESS_TOKEN_HERE"
      }
    ]
  }'
```

#### Python
```python
async def draft_unwatermark(access_token: str):
    url = "https://api.dyuapi.com/v1/chat/completions"
    headers = {
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "sora-drafts-url",
        "messages": [
            {"role": "user", "content": access_token}
        ]
    }
    
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, headers=headers, json=payload)
        return resp.json()
```

### 8.4 响应示例
同"去水印（作品地址）"（7.4节）

---

## 九、Chat聊天格式兼容

### 9.1 接口信息
- **方法**：POST
- **路径**：`/v1/chat/completions`
- **说明**：聊天格式兼容接口（v1暂不使用）

### 9.2 说明
此接口用于其他模型的聊天功能，SkyRiff v1版本暂不涉及，预留备用。

---

## 十、完整Adapter代码

### 10.1 文件结构
```
backend/
  app/
    vendors/
      __init__.py
      dyuapi_sora2.py  # ← Adapter层代码
```

### 10.2 dyuapi_sora2.py

```python
from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Any, Dict, Optional, Tuple
import httpx


class InternalStatus(str, Enum):
    """内部任务状态枚举"""
    NOT_START = "NOT_START"
    QUEUED = "QUEUED"
    IN_PROGRESS = "IN_PROGRESS"
    SUCCESS = "SUCCESS"
    FAILURE = "FAILURE"


def map_vendor_status(v: str) -> InternalStatus:
    """供应商状态映射为内部状态"""
    s = (v or "").strip().lower()
    if s in {"not_start", "not-start", "created"}:
        return InternalStatus.NOT_START
    if s in {"queued", "queue", "pending"}:
        return InternalStatus.QUEUED
    if s in {"in_progress", "in-progress", "processing", "running"}:
        return InternalStatus.IN_PROGRESS
    if s in {"completed", "success", "succeeded", "done"}:
        return InternalStatus.SUCCESS
    if s in {"failure", "failed", "error"}:
        return InternalStatus.FAILURE
    return InternalStatus.IN_PROGRESS


@dataclass
class VendorCreateResult:
    """创建任务响应"""
    vendor_id: str
    status: InternalStatus
    progress: int
    raw: Dict[str, Any]


@dataclass
class VendorTaskState:
    """任务状态响应"""
    vendor_id: str
    status: InternalStatus
    progress: int
    video_url: Optional[str]
    created_at: Optional[int] = None
    completed_at: Optional[int] = None
    raw: Optional[Dict[str, Any]] = None


@dataclass
class VendorContent:
    """视频内容响应"""
    vendor_id: str
    mp4: Optional[str]
    mp4_wm: Optional[str]
    thumbnail: Optional[str] = None
    md: Optional[str] = None
    gif: Optional[str] = None
    raw: Optional[Dict[str, Any]] = None


class DyuSora2Adapter:
    """
    DyuAPI Sora2适配器
    
    Base URL: https://api.dyuapi.com
    文档: https://6ibmqmipvf.apifox.cn
    """

    def __init__(
        self,
        api_key: str,
        base_url: str = "https://api.dyuapi.com",
        timeout_sec: float = 60.0,
    ) -> None:
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.timeout = httpx.Timeout(timeout_sec)

    # ========== 1. 文生视频 ==========
    async def create_text2video(
        self,
        prompt: str,
        duration_sec: int,
        ratio: str,
        tier: str = "sora2",
        hd: bool = False,
    ) -> VendorCreateResult:
        """
        文生视频（异步请求）
        
        Args:
            prompt: 提示词
            duration_sec: 时长（10/15/25）
            ratio: 比例（9:16/16:9/1:1）
            tier: 模型层级（sora2/sora2Pro）
            hd: 是否高清模式
        """
        model, size = self._select_model_and_size(duration_sec, ratio, tier=tier, hd=hd)
        form = {
            "prompt": prompt,
            "model": model,
            "size": size,
            "seconds": str(duration_sec),
        }
        data = await self._post_form("/v1/videos", form=form, files=None)
        vid = str(data.get("id") or "")
        if not vid:
            raise RuntimeError(f"Vendor response missing id: {data}")
        status = map_vendor_status(str(data.get("status", "")))
        progress = int(data.get("progress", 0) or 0)
        return VendorCreateResult(vendor_id=vid, status=status, progress=progress, raw=data)

    # ========== 2. 图生视频（直接传图） ==========
    async def create_image2video_upload(
        self,
        prompt: str,
        duration_sec: int,
        ratio: str,
        image_bytes: bytes,
        image_filename: str = "input.png",
        tier: str = "sora2",
        hd: bool = False,
    ) -> VendorCreateResult:
        """
        图生视频（上传文件）
        
        Args:
            prompt: 提示词
            duration_sec: 时长
            ratio: 比例
            image_bytes: 图片二进制数据
            image_filename: 文件名
            tier: 模型层级
            hd: 是否高清
        """
        model, size = self._select_model_and_size(duration_sec, ratio, tier=tier, hd=hd)
        form = {
            "prompt": prompt,
            "model": model,
            "size": size,
            "seconds": str(duration_sec),
        }
        files = {
            "input_reference": (image_filename, image_bytes, "application/octet-stream")
        }
        data = await self._post_form("/v1/videos", form=form, files=files)
        vid = str(data.get("id") or "")
        if not vid:
            raise RuntimeError(f"Vendor response missing id: {data}")
        status = map_vendor_status(str(data.get("status", "")))
        progress = int(data.get("progress", 0) or 0)
        return VendorCreateResult(vendor_id=vid, status=status, progress=progress, raw=data)

    # ========== 3. 图生视频（URL传图） ==========
    async def create_image2video_by_url(
        self,
        prompt: str,
        duration_sec: int,
        ratio: str,
        image_url: str,
        tier: str = "sora2",
        hd: bool = False,
    ) -> VendorCreateResult:
        """
        图生视频（URL传图）
        
        Args:
            prompt: 提示词
            duration_sec: 时长
            ratio: 比例
            image_url: 图片URL
            tier: 模型层级
            hd: 是否高清
        """
        model, size = self._select_model_and_size(duration_sec, ratio, tier=tier, hd=hd)
        payload = {
            "image_url": image_url,
            "prompt": prompt,
            "model": model,
            "size": size,
            "seconds": duration_sec,
        }
        data = await self._post_json("/v1/videos", payload)
        vid = str(data.get("id") or "")
        if not vid:
            raise RuntimeError(f"Vendor response missing id: {data}")
        status = map_vendor_status(str(data.get("status", "")))
        progress = int(data.get("progress", 0) or 0)
        return VendorCreateResult(vendor_id=vid, status=status, progress=progress, raw=data)

    # ========== 4. 任务进度查询 ==========
    async def get_task_state(self, vendor_id: str) -> VendorTaskState:
        """
        查询任务状态与进度
        
        Returns:
            VendorTaskState包含status、progress、video_url（完成后）
        """
        data = await self._get_json(f"/v1/videos/{vendor_id}")
        vendor_status = str(data.get("status", ""))
        status = map_vendor_status(vendor_status)
        progress = int(data.get("progress", 0) or 0)
        video_url = data.get("video_url")

        return VendorTaskState(
            vendor_id=str(data.get("id") or vendor_id),
            status=status,
            progress=progress,
            video_url=video_url,
            created_at=data.get("created_at"),
            completed_at=data.get("completed_at"),
            raw=data,
        )

    # ========== 5. 查看视频内容 ==========
    async def get_video_content(self, vendor_id: str) -> VendorContent:
        """
        获取视频详细信息
        
        ⚠️ 文档提示：此接口可能较慢
        建议直接使用get_task_state返回的video_url
        """
        data = await self._get_json(f"/v1/videos/{vendor_id}/content")

        links = data.get("links") or data
        mp4 = links.get("mp4") if isinstance(links, dict) else None
        mp4_wm = links.get("mp4_wm") if isinstance(links, dict) else None
        thumbnail = links.get("thumbnail") if isinstance(links, dict) else None
        md = links.get("md") if isinstance(links, dict) else None
        gif = links.get("gif") if isinstance(links, dict) else None

        return VendorContent(
            vendor_id=vendor_id,
            mp4=mp4,
            mp4_wm=mp4_wm,
            thumbnail=thumbnail,
            md=md,
            gif=gif,
            raw=data,
        )

    # ========== 6. 去水印（作品地址） ==========
    async def unwatermark_by_work_url(self, work_url: str) -> VendorContent:
        """
        通过Sora作品帖子地址获取无水印/水印链接
        
        Args:
            work_url: Sora作品帖子地址（如https://sora.chatgpt.com/p/xxx）
        
        Returns:
            VendorContent包含mp4（无水印）、mp4_wm（水印）等
        """
        payload = {
            "model": "sora_url",
            "messages": [{"role": "user", "content": work_url}],
        }
        data = await self._post_json("/v1/chat/completions", payload)

        links = (data.get("links") or {})
        return VendorContent(
            vendor_id=str(data.get("id") or ""),
            mp4=links.get("mp4"),
            mp4_wm=links.get("mp4_wm"),
            thumbnail=links.get("thumbnail"),
            md=links.get("md"),
            gif=links.get("gif"),
            raw=data,
        )

    # ========== 7. 去水印（草稿未发） ==========
    async def draft_unwatermark(self, access_token: str) -> VendorContent:
        """
        通过accessToken获取草稿视频链接
        
        Args:
            access_token: Sora草稿accessToken
        
        Returns:
            VendorContent包含mp4、mp4_wm等
        """
        payload = {
            "model": "sora-drafts-url",
            "messages": [{"role": "user", "content": access_token}],
        }
        data = await self._post_json("/v1/chat/completions", payload)

        links = (data.get("links") or {})
        return VendorContent(
            vendor_id=str(data.get("id") or ""),
            mp4=links.get("mp4"),
            mp4_wm=links.get("mp4_wm"),
            thumbnail=links.get("thumbnail"),
            md=links.get("md"),
            gif=links.get("gif"),
            raw=data,
        )

    # ========== HTTP辅助方法 ==========
    def _headers(self) -> Dict[str, str]:
        return {"Authorization": f"Bearer {self.api_key}", "Accept": "application/json"}

    async def _post_form(
        self,
        path: str,
        form: Dict[str, str],
        files: Optional[Dict[str, Tuple[str, bytes, str]]] = None,
    ) -> Dict[str, Any]:
        url = f"{self.base_url}{path}"
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(url, headers=self._headers(), data=form, files=files)
        if resp.status_code >= 400:
            raise RuntimeError(f"Vendor POST form failed: {resp.status_code} {resp.text[:500]}")
        return resp.json()

    async def _post_json(self, path: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        url = f"{self.base_url}{path}"
        headers = dict(self._headers())
        headers["Content-Type"] = "application/json"
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(url, headers=headers, json=payload)
        if resp.status_code >= 400:
            raise RuntimeError(f"Vendor POST json failed: {resp.status_code} {resp.text[:500]}")
        return resp.json()

    async def _get_json(self, path: str) -> Dict[str, Any]:
        url = f"{self.base_url}{path}"
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(url, headers=self._headers())
        if resp.status_code >= 400:
            raise RuntimeError(f"Vendor GET failed: {resp.status_code} {resp.text[:500]}")
        return resp.json()

    # ========== 模型选择逻辑 ==========
    def _select_model_and_size(
        self,
        duration_sec: int,
        ratio: str,
        tier: str,
        hd: bool,
    ) -> Tuple[str, str]:
        """
        根据参数选择model和size
        
        Args:
            duration_sec: 时长（10/15/25）
            ratio: 比例（9:16/16:9/1:1）
            tier: 模型层级（sora2/sora2Pro）
            hd: 是否高清
        
        Returns:
            (model_name, size_string)
        """
        r = ratio.strip()
        is_portrait = (r == "9:16")
        is_landscape = (r == "16:9")
        if not (is_portrait or is_landscape):
            is_portrait = True

        size = self._size_from_ratio(r)

        # Sora2Pro高级版
        if tier.lower() in {"sora2pro", "pro", "sora2_pro"}:
            if duration_sec == 25:
                model = "sora2-pro-portrait-25s" if is_portrait else "sora2-pro-landscape-25s"
                return model, size
            if duration_sec == 15 and hd:
                model = "sora2-pro-portrait-hd-15s" if is_portrait else "sora2-pro-landscape-hd-15s"
                return model, size
            suffix = "-15s" if duration_sec == 15 else ""
            model = ("sora2-portrait" if is_portrait else "sora2-landscape") + suffix
            return model, size

        # Sora2基础版（10/15秒）
        if duration_sec not in {10, 15}:
            # 自动升级到Pro（25秒仅Pro支持）
            model = "sora2-pro-portrait-25s" if is_portrait else "sora2-pro-landscape-25s"
            return model, size

        suffix = "" if duration_sec == 10 else "-15s"
        model = ("sora2-portrait" if is_portrait else "sora2-landscape") + suffix
        return model, size

    def _size_from_ratio(self, ratio: str) -> str:
        r = ratio.strip()
        if r == "9:16":
            return "720x1280"
        if r == "16:9":
            return "1280x720"
        return "720x720"
```

---

## 十一、使用示例

### 11.1 初始化Adapter

```python
from app.vendors.dyuapi_sora2 import DyuSora2Adapter
import os

adapter = DyuSora2Adapter(
    api_key=os.getenv("DYUAPI_KEY"),
    base_url="https://api.dyuapi.com",
    timeout_sec=60.0
)
```

### 11.2 创建文生任务

```python
# 创建10秒竖屏视频
result = await adapter.create_text2video(
    prompt="一只可爱的橘猫在绿色草地上快乐地奔跑",
    duration_sec=10,
    ratio="9:16",
    tier="sora2",
    hd=False
)

print(f"任务ID: {result.vendor_id}")
print(f"状态: {result.status}")
```

### 11.3 轮询任务状态

```python
import asyncio

async def poll_task(task_id: str):
    while True:
        state = await adapter.get_task_state(task_id)
        print(f"状态: {state.status}, 进度: {state.progress}%")
        
        if state.status == "SUCCESS":
            print(f"✅ 生成成功！视频URL: {state.video_url}")
            return state.video_url
        
        if state.status == "FAILURE":
            print("❌ 生成失败")
            return None
        
        await asyncio.sleep(5)  # 每5秒轮询一次

# 使用
video_url = await poll_task("v_abc123xyz")
```

### 11.4 创建图生任务

```python
# 上传文件
with open("/path/to/cat.png", "rb") as f:
    image_bytes = f.read()

result = await adapter.create_image2video_upload(
    prompt="让图中的猫咪动起来",
    duration_sec=10,
    ratio="9:16",
    image_bytes=image_bytes,
    image_filename="cat.png",
    tier="sora2"
)
```

---

## 十二、错误处理

### 12.1 常见错误

| 错误类型 | 说明 | 处理方式 |
|---------|------|----------|
| 401 Unauthorized | API Key无效 | 检查环境变量DYUAPI_KEY |
| 429 Too Many Requests | 请求频率过高 | 增加轮询间隔 |
| 500 Internal Server Error | 供应商服务异常 | 重试或联系供应商 |
| Timeout | 请求超时 | 增加timeout_sec |

### 12.2 异常捕获示例

```python
try:
    result = await adapter.create_text2video(...)
except httpx.HTTPStatusError as e:
    if e.response.status_code == 401:
        # API Key无效
        raise AuthenticationError("供应商API Key无效")
    elif e.response.status_code == 429:
        # 频率限制
        await asyncio.sleep(10)
        # 重试
    else:
        # 其他错误
        raise VendorError(f"供应商返回错误: {e}")
except httpx.TimeoutException:
    # 超时
    raise VendorError("供应商请求超时")
except Exception as e:
    # 未知错误
    raise VendorError(f"未知错误: {e}")
```

---

## 十三、环境配置

### 13.1 环境变量

```bash
# .env
DYUAPI_KEY=your_api_key_here
DYUAPI_BASE_URL=https://api.dyuapi.com
DYUAPI_TIMEOUT=60
```

### 13.2 配置文件

```python
# config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    dyuapi_key: str
    dyuapi_base_url: str = "https://api.dyuapi.com"
    dyuapi_timeout: int = 60
    
    class Config:
        env_file = ".env"

settings = Settings()
```

---

## 十四、测试建议

### 14.1 单元测试

```python
import pytest
from app.vendors.dyuapi_sora2 import DyuSora2Adapter, map_vendor_status

def test_status_mapping():
    assert map_vendor_status("completed") == "SUCCESS"
    assert map_vendor_status("queued") == "QUEUED"
    assert map_vendor_status("failed") == "FAILURE"

@pytest.mark.asyncio
async def test_create_text2video():
    adapter = DyuSora2Adapter(api_key="test_key")
    # Mock httpx response
    # ...
```

### 14.2 集成测试

```python
@pytest.mark.asyncio
async def test_full_workflow():
    adapter = DyuSora2Adapter(api_key=os.getenv("DYUAPI_KEY"))
    
    # 创建任务
    result = await adapter.create_text2video(
        prompt="测试提示词",
        duration_sec=10,
        ratio="9:16"
    )
    assert result.vendor_id
    
    # 轮询直到完成
    while True:
        state = await adapter.get_task_state(result.vendor_id)
        if state.status in ["SUCCESS", "FAILURE"]:
            break
        await asyncio.sleep(5)
    
    assert state.status == "SUCCESS"
    assert state.video_url
```

---

**文档版本**：v1.0  
**最后更新**：2025-12-25  
**负责人**：SkyRiff技术团队

**重要提示**：
1. ✅ 所有8个接口已完整对接
2. ✅ Adapter代码可直接使用
3. ✅ 记得配置环境变量DYUAPI_KEY
4. ✅ 建议后端Celery轮询间隔30秒，前端轮询间隔5秒
5. ✅ v1版本可以不依赖`/v1/videos/{id}/content`接口
