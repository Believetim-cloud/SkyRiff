# SkyRiff API接口规格文档 v1.0

## 一、接口设计规范

### 1.1 基础信息
- **Base URL**：`https://api.skyriff.com/v1`
- **协议**：HTTPS
- **认证方式**：Bearer Token (JWT)
- **请求格式**：JSON / multipart/form-data
- **响应格式**：JSON

### 1.2 统一响应结构
```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

**错误码规范**：
- `0`：成功
- `1001-1999`：用户相关错误
- `2001-2999`：业务逻辑错误
- `3001-3999`：支付相关错误
- `4001-4999`：第三方服务错误
- `5001-5999`：系统错误

### 1.3 分页参数
```json
{
  "cursor": "next_page_token",
  "limit": 20
}
```

**分页响应**：
```json
{
  "items": [],
  "next_cursor": "abc123",
  "has_more": true
}
```

---

## 二、认证模块

### 2.1 发送短信验证码
**POST** `/auth/sms/send`

**请求体**：
```json
{
  "phone": "13800138000"
}
```

**响应**：
```json
{
  "code": 0,
  "message": "验证码已发送",
  "data": {
    "expire_in": 300
  }
}
```

---

### 2.2 验证码登录
**POST** `/auth/sms/verify`

**请求体**：
```json
{
  "phone": "13800138000",
  "code": "123456"
}
```

**响应**：
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": 10001,
      "nickname": "用户昵称",
      "avatar_url": "https://...",
      "is_new_user": false
    }
  }
}
```

---

### 2.3 微信登录初始化
**POST** `/auth/wechat/init`

**请求体**：
```json
{
  "platform": "app"  // app/web
}
```

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "app_id": "wx1234567890",
    "redirect_uri": "https://...",
    "state": "random_state"
  }
}
```

---

### 2.4 微信登录回调
**POST** `/auth/wechat/callback`

**请求体**：
```json
{
  "code": "wechat_auth_code",
  "state": "random_state"
}
```

**响应**：
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": 10001,
      "nickname": "用户昵称",
      "avatar_url": "https://...",
      "is_new_user": true
    }
  }
}
```

---

## 三、用户模块

### 3.1 获取当前用户信息
**GET** `/me`

**Headers**：
```
Authorization: Bearer {token}
```

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "user_id": 10001,
    "nickname": "用户昵称",
    "avatar_url": "https://...",
    "bio": "个人简介",
    "phone": "138****8000",
    "is_creator": true,
    "is_promoter": false,
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

---

### 3.2 更新个人资料
**PATCH** `/me/profile`

**请求体**：
```json
{
  "nickname": "新昵称",
  "avatar_asset_id": 12345,
  "bio": "这是我的简介"
}
```

**响应**：
```json
{
  "code": 0,
  "message": "更新成功",
  "data": {
    "user_id": 10001,
    "nickname": "新昵称",
    "avatar_url": "https://...",
    "bio": "这是我的简介"
  }
}
```

---

### 3.3 获取用户主页
**GET** `/users/{user_id}/profile`

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "user": {
      "user_id": 10001,
      "nickname": "用户昵称",
      "avatar_url": "https://...",
      "bio": "个人简介"
    },
    "stats": {
      "likes_received_count": 1250,
      "followers_count": 888,
      "following_count": 123,
      "works_count": 45
    },
    "is_following": false
  }
}
```

---

### 3.4 获取用户作品列表
**GET** `/users/{user_id}/works`

**Query参数**：
- `cursor`：分页游标
- `limit`：每页数量（默认20）

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "work_id": 1001,
        "title": "作品标题",
        "cover_url": "https://...",
        "watermarked_play_url": "https://...",
        "like_count": 520,
        "favorite_count": 88,
        "tip_count": 12,
        "created_at": "2025-01-15T10:00:00Z"
      }
    ],
    "next_cursor": "abc123",
    "has_more": true
  }
}
```

---

### 3.5 关注用户
**POST** `/users/{user_id}/follow`

**响应**：
```json
{
  "code": 0,
  "message": "关注成功",
  "data": {
    "is_following": true
  }
}
```

---

### 3.6 取消关注
**POST** `/users/{user_id}/unfollow`

**响应**：
```json
{
  "code": 0,
  "message": "已取消关注",
  "data": {
    "is_following": false
  }
}
```

---

## 四、钱包模块

### 4.1 获取钱包余额
**GET** `/me/wallets`

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "credits": {
      "balance": 1250
    },
    "coins": {
      "available": 85.50,
      "pending": 120.00,
      "pending_details": [
        {
          "amount": 50.00,
          "unlock_at": "2025-01-22T00:00:00Z",
          "source": "打赏收入"
        },
        {
          "amount": 70.00,
          "unlock_at": "2025-01-23T00:00:00Z",
          "source": "提示词收入"
        }
      ]
    }
  }
}
```

---

### 4.2 获取流水明细
**GET** `/wallet/ledgers`

**Query参数**：
- `type`：credits / coins
- `cursor`：分页游标
- `limit`：每页数量（默认20）

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "ledger_id": 10001,
        "type": "gen_spend",
        "amount": -10,
        "balance_after": 1240,
        "description": "生成10秒视频",
        "created_at": "2025-01-15T10:00:00Z"
      },
      {
        "ledger_id": 10002,
        "type": "recharge",
        "amount": 600,
        "balance_after": 1250,
        "description": "充值30元",
        "created_at": "2025-01-15T11:00:00Z"
      }
    ],
    "next_cursor": "abc123",
    "has_more": true
  }
}
```

---

## 五、创作模块

### 5.1 上传图片
**POST** `/media/upload`

**请求格式**：multipart/form-data

**请求体**：
```
file: <binary>
```

**响应**：
```json
{
  "code": 0,
  "message": "上传成功",
  "data": {
    "asset_id": 12345,
    "url": "https://cdn.skyriff.com/images/12345.png",
    "size": 1024000,
    "width": 1024,
    "height": 1024
  }
}
```

---

### 5.2 创建生成任务
**POST** `/tasks/create`

**请求体**：
```json
{
  "prompt": "一只可爱的猫咪在草地上奔跑",
  "duration_sec": 10,
  "ratio": "9:16",
  "model": "sora2",
  "project_id": 123,
  "reference_image_asset_id": 12345,
  "note": "这是我的第一个作品"
}
```

**参数说明**：
- `prompt`：提示词（必填）
- `duration_sec`：时长，10/15/25（必填）
- `ratio`：比例，9:16/16:9/1:1（必填）
- `model`：模型，sora2/sora2Pro（必填）
- `project_id`：项目ID（可选）
- `reference_image_asset_id`：参考图片ID（可选，图生时必填）
- `note`：备注（可选）

**响应**：
```json
{
  "code": 0,
  "message": "任务创建成功",
  "data": {
    "task_id": 10001,
    "status": "QUEUED",
    "cost_credits": 10,
    "estimated_time": 30
  }
}
```

**错误示例**：
```json
{
  "code": 2001,
  "message": "积分不足",
  "data": {
    "current_balance": 5,
    "required": 10
  }
}
```

---

### 5.3 查询任务列表
**GET** `/tasks`

**Query参数**：
- `status`：NOT_START/QUEUED/IN_PROGRESS/SUCCESS/FAILURE
- `cursor`：分页游标
- `limit`：每页数量（默认20）

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "task_id": 10001,
        "prompt": "一只可爱的猫咪在草地上奔跑",
        "duration_sec": 10,
        "ratio": "9:16",
        "status": "IN_PROGRESS",
        "progress": 65,
        "cost_credits": 10,
        "created_at": "2025-01-15T10:00:00Z",
        "started_at": "2025-01-15T10:00:10Z"
      }
    ],
    "next_cursor": "abc123",
    "has_more": true
  }
}
```

---

### 5.4 查询任务详情
**GET** `/tasks/{task_id}`

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "task_id": 10001,
    "prompt": "一只可爱的猫咪在草地上奔跑",
    "duration_sec": 10,
    "ratio": "9:16",
    "model": "sora2",
    "status": "SUCCESS",
    "progress": 100,
    "cost_credits": 10,
    "video_id": 20001,
    "created_at": "2025-01-15T10:00:00Z",
    "started_at": "2025-01-15T10:00:10Z",
    "finished_at": "2025-01-15T10:00:40Z"
  }
}
```

**失败示例**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "task_id": 10001,
    "status": "FAILURE",
    "progress": 0,
    "error_message": "生成超时，请稍后重试",
    "cost_credits": 10,
    "refunded": true
  }
}
```

---

## 六、资产模块

### 6.1 获取视频资产列表
**GET** `/assets/videos`

**Query参数**：
- `project_id`：项目ID（可选）
- `cursor`：分页游标
- `limit`：每页数量（默认20）

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "video_id": 20001,
        "project_id": 123,
        "watermarked_play_url": "https://...",
        "thumbnail_url": "https://...",
        "duration_sec": 10,
        "ratio": "9:16",
        "publish_status": "draft",
        "created_at": "2025-01-15T10:00:40Z"
      }
    ],
    "next_cursor": "abc123",
    "has_more": true
  }
}
```

---

### 6.2 无水印下载
**POST** `/assets/videos/{video_id}/download_no_watermark`

**响应**：
```json
{
  "code": 0,
  "message": "扣费成功",
  "data": {
    "download_url": "https://...",
    "expire_at": "2025-01-15T11:00:00Z",
    "cost_credits": 6
  }
}
```

**错误示例**：
```json
{
  "code": 2002,
  "message": "只能下载自己的视频",
  "data": null
}
```

---

### 6.3 获取项目列表
**GET** `/projects`

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "project_id": 123,
        "name": "我的第一个项目",
        "video_count": 15,
        "created_at": "2025-01-01T00:00:00Z",
        "updated_at": "2025-01-15T10:00:00Z"
      }
    ]
  }
}
```

---

### 6.4 创建项目
**POST** `/projects`

**请求体**：
```json
{
  "name": "新项目"
}
```

**响应**：
```json
{
  "code": 0,
  "message": "创建成功",
  "data": {
    "project_id": 124,
    "name": "新项目",
    "video_count": 0,
    "created_at": "2025-01-15T10:00:00Z"
  }
}
```

---

### 6.5 重命名项目
**PATCH** `/projects/{project_id}`

**请求体**：
```json
{
  "name": "项目新名称"
}
```

**响应**：
```json
{
  "code": 0,
  "message": "更新成功",
  "data": {
    "project_id": 124,
    "name": "项目新名称",
    "updated_at": "2025-01-15T10:05:00Z"
  }
}
```

---

## 七、作品模块

### 7.1 发布作品
**POST** `/works/publish`

**请求体**：
```json
{
  "video_id": 20001,
  "title": "可爱的小猫",
  "description": "一只在草地上奔跑的可爱猫咪",
  "is_prompt_locked": true,
  "prompt_price_credits": 5,
  "remix_fee_credits": 2
}
```

**响应**：
```json
{
  "code": 0,
  "message": "发布成功",
  "data": {
    "work_id": 30001,
    "share_link": "https://skyriff.com/works/30001",
    "created_at": "2025-01-15T10:00:00Z"
  }
}
```

---

### 7.2 首页Feed
**GET** `/feed`

**Query参数**：
- `tab`：discover/hot/rank
- `cursor`：分页游标
- `limit`：每页数量（默认20）

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "work_id": 30001,
        "creator": {
          "user_id": 10001,
          "nickname": "创作者昵称",
          "avatar_url": "https://..."
        },
        "title": "可爱的小猫",
        "cover_url": "https://...",
        "watermarked_play_url": "https://...",
        "like_count": 520,
        "favorite_count": 88,
        "tip_count": 12,
        "share_count": 45,
        "views": 12000,
        "has_prompt_locked": true,
        "prompt_price_credits": 5,
        "remix_fee_credits": 2,
        "is_liked": false,
        "is_favorited": false,
        "created_at": "2025-01-15T10:00:00Z"
      }
    ],
    "next_cursor": "abc123",
    "has_more": true
  }
}
```

---

### 7.3 作品详情
**GET** `/works/{work_id}`

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "work_id": 30001,
    "creator": {
      "user_id": 10001,
      "nickname": "创作者昵称",
      "avatar_url": "https://...",
      "bio": "个人简介"
    },
    "title": "可爱的小猫",
    "description": "一只在草地上奔跑的可爱猫咪",
    "cover_url": "https://...",
    "watermarked_play_url": "https://...",
    "like_count": 520,
    "favorite_count": 88,
    "tip_count": 12,
    "share_count": 45,
    "views": 12000,
    "has_prompt_locked": true,
    "prompt_price_credits": 5,
    "remix_fee_credits": 2,
    "is_liked": false,
    "is_favorited": false,
    "is_prompt_unlocked": false,
    "share_link": "https://skyriff.com/works/30001",
    "created_at": "2025-01-15T10:00:00Z"
  }
}
```

---

### 7.4 点赞作品
**POST** `/works/{work_id}/like`

**响应**：
```json
{
  "code": 0,
  "message": "点赞成功",
  "data": {
    "is_liked": true,
    "like_count": 521
  }
}
```

---

### 7.5 取消点赞
**POST** `/works/{work_id}/unlike`

**响应**：
```json
{
  "code": 0,
  "message": "已取消点赞",
  "data": {
    "is_liked": false,
    "like_count": 520
  }
}
```

---

### 7.6 打赏并收藏
**POST** `/works/{work_id}/tip_and_favorite`

**请求体**：
```json
{
  "amount_credits": 20
}
```

**参数说明**：
- `amount_credits`：打赏积分，仅允许10/20/50/100

**响应**：
```json
{
  "code": 0,
  "message": "打赏成功",
  "data": {
    "tipped": true,
    "favorited": true,
    "cost_credits": 20,
    "creator_coins_pending": 18.0,
    "already_favorited": false
  }
}
```

---

### 7.7 解锁提示词
**POST** `/works/{work_id}/prompt/unlock`

**响应**：
```json
{
  "code": 0,
  "message": "解锁成功",
  "data": {
    "prompt_text": "一只可爱的橘猫在绿色草地上快乐地奔跑，阳光明媚，微风轻拂...",
    "cost_credits": 5,
    "creator_coins_pending": 4.5
  }
}
```

**已解锁示例**：
```json
{
  "code": 0,
  "message": "already_unlocked",
  "data": {
    "prompt_text": "一只可爱的橘猫在绿色草地上快乐地奔跑，阳光明媚，微风轻拂...",
    "cost_credits": 0
  }
}
```

---

### 7.8 查看提示词
**GET** `/works/{work_id}/prompt`

**响应（已解锁）**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "locked": false,
    "prompt_text": "一只可爱的橘猫在绿色草地上快乐地奔跑，阳光明媚，微风轻拂..."
  }
}
```

**响应（未解锁）**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "locked": true,
    "price_credits": 5
  }
}
```

---

### 7.9 二次创作
**POST** `/works/{work_id}/remix`

**请求体**：
```json
{
  "prompt_delta": "但是天空下着小雨",
  "duration_sec": 15,
  "ratio": "9:16",
  "model": "sora2",
  "project_id": 123
}
```

**参数说明**：
- `prompt_delta`：用户新增的提示词（可选）
- 其他参数同创建任务接口

**响应**：
```json
{
  "code": 0,
  "message": "二创任务创建成功",
  "data": {
    "task_id": 10002,
    "remix_fee": 2,
    "gen_cost": 15,
    "total_cost": 17,
    "original_creator_coins_pending": 1.8
  }
}
```

---

## 八、收藏模块

### 8.1 我的收藏
**GET** `/me/favorites`

**Query参数**：
- `cursor`：分页游标
- `limit`：每页数量（默认20）

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "work_id": 30001,
        "title": "可爱的小猫",
        "cover_url": "https://...",
        "watermarked_play_url": "https://...",
        "creator": {
          "user_id": 10001,
          "nickname": "创作者昵称",
          "avatar_url": "https://..."
        },
        "like_count": 520,
        "favorited_at": "2025-01-15T11:00:00Z"
      }
    ],
    "next_cursor": "abc123",
    "has_more": true
  }
}
```

---

### 8.2 收藏作品
**POST** `/works/{work_id}/favorite`

**响应**：
```json
{
  "code": 0,
  "message": "收藏成功",
  "data": {
    "is_favorited": true,
    "favorite_count": 89
  }
}
```

---

### 8.3 取消收藏
**DELETE** `/works/{work_id}/favorite`

**响应**：
```json
{
  "code": 0,
  "message": "已取消收藏",
  "data": {
    "is_favorited": false,
    "favorite_count": 88
  }
}
```

---

## 九、充值模块

### 9.1 获取商品列表
**GET** `/products`

**Query参数**：
- `type`：credits_pack/subscription_monthly/coins_pack

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "product_id": 1,
        "type": "credits_pack",
        "name": "6元充值包",
        "price_cny": 6.00,
        "credits_amount": 120,
        "description": "可生成12个10秒视频"
      },
      {
        "product_id": 2,
        "type": "credits_pack",
        "name": "30元充值包",
        "price_cny": 30.00,
        "credits_amount": 600,
        "description": "可生成60个10秒视频"
      }
    ]
  }
}
```

---

### 9.2 创建支付单
**POST** `/payments/create`

**请求体**：
```json
{
  "product_id": 2,
  "pay_channel": "wechat"
}
```

**参数说明**：
- `pay_channel`：wechat/alipay

**响应**：
```json
{
  "code": 0,
  "message": "支付单创建成功",
  "data": {
    "payment_id": 40001,
    "amount_cny": 30.00,
    "pay_params": {
      "app_id": "wx1234567890",
      "partner_id": "1234567890",
      "prepay_id": "wx15123456789012345678901234567890",
      "package": "Sign=WXPay",
      "noncestr": "abc123",
      "timestamp": "1234567890",
      "sign": "signature_here"
    },
    "expire_at": "2025-01-15T10:15:00Z"
  }
}
```

---

### 9.3 支付回调（服务端接口）
**POST** `/payments/callback`

此接口由支付平台回调，不对外暴露。

**处理逻辑**：
1. 验证签名
2. 更新支付单状态
3. 发放积分/金币
4. 写入流水记录

---

## 十、月卡模块

### 10.1 我的月卡
**GET** `/subscriptions/me`

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "active_subscription": {
      "subscription_id": 50001,
      "start_at": "2025-01-01T00:00:00Z",
      "end_at": "2025-01-31T23:59:59Z",
      "days_remaining": 16,
      "today_claimed": true
    }
  }
}
```

**无月卡示例**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "active_subscription": null
  }
}
```

---

### 10.2 购买月卡
**POST** `/subscriptions/buy`

**请求体**：
```json
{
  "product_id": 10,
  "pay_channel": "wechat"
}
```

**响应**：
```json
{
  "code": 0,
  "message": "支付单创建成功",
  "data": {
    "subscription_id": 50002,
    "payment_id": 40002,
    "amount_cny": 29.00,
    "pay_params": {
      "app_id": "wx1234567890",
      "prepay_id": "wx15123456789012345678901234567890"
    }
  }
}
```

---

### 10.3 每日领取积分
**POST** `/subscriptions/claim_daily`

**响应**：
```json
{
  "code": 0,
  "message": "领取成功",
  "data": {
    "credits_claimed": 30,
    "new_balance": 1280
  }
}
```

**错误示例（今日已领）**：
```json
{
  "code": 2003,
  "message": "今日已领取，明天再来",
  "data": {
    "next_claim_at": "2025-01-16T00:00:00Z"
  }
}
```

---

## 十一、任务中心

### 11.1 今日任务
**GET** `/tasks_center/today`

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "tasks": [
      {
        "task_key": "login_daily",
        "title": "每日登录",
        "description": "每天登录即可领取",
        "reward_credits": 2,
        "status": "completed",
        "can_claim": true
      },
      {
        "task_key": "gen_success",
        "title": "生成视频",
        "description": "生成1个视频",
        "reward_credits": 2,
        "status": "pending",
        "can_claim": false
      },
      {
        "task_key": "like_work",
        "title": "点赞作品",
        "description": "点赞1个作品",
        "reward_credits": 2,
        "status": "pending",
        "can_claim": false
      }
    ]
  }
}
```

**状态说明**：
- `pending`：未完成
- `completed`：已完成，可领取
- `claimed`：已领取

---

### 11.2 领取任务奖励
**POST** `/tasks_center/claim`

**请求体**：
```json
{
  "task_key": "login_daily"
}
```

**响应**：
```json
{
  "code": 0,
  "message": "领取成功",
  "data": {
    "credits_claimed": 2,
    "new_balance": 1252
  }
}
```

---

## 十二、推广模块

### 12.1 激活推广员
**POST** `/promoter/activate`

**请求体**：
```json
{
  "pay_channel": "wechat"
}
```

**响应**：
```json
{
  "code": 0,
  "message": "支付单创建成功",
  "data": {
    "payment_id": 40003,
    "amount_cny": 30.00,
    "pay_params": {}
  }
}
```

**支付成功后自动**：
1. 发放600积分
2. 生成推广码
3. 设置`is_promoter=true`

---

### 12.2 推广员信息
**GET** `/promoter/me`

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "is_promoter": true,
    "referral_code": "SKY2025ABC",
    "promo_credits": 600,
    "stats": {
      "total_invites": 25,
      "total_commission_coins": 125.50
    }
  }
}
```

---

### 12.3 绑定邀请码
**POST** `/referrals/bind`

**请求体**：
```json
{
  "code": "SKY2025ABC"
}
```

**响应**：
```json
{
  "code": 0,
  "message": "绑定成功",
  "data": {
    "bonus_credits": 50,
    "new_balance": 50
  }
}
```

**错误示例**：
```json
{
  "code": 2004,
  "message": "邀请码无效或已失效",
  "data": null
}
```

---

## 十三、提现模块

### 13.1 申请提现
**POST** `/withdrawals/create`

**请求体**：
```json
{
  "amount_cny": 150.00,
  "method": "alipay",
  "account_info": {
    "account": "user@example.com",
    "name": "张三"
  }
}
```

**参数说明**：
- `amount_cny`：提现金额（>=100）
- `method`：bank_card/alipay/wechat
- `account_info`：账户信息

**响应**：
```json
{
  "code": 0,
  "message": "提现申请已提交",
  "data": {
    "withdrawal_id": 60001,
    "amount_cny": 150.00,
    "status": "applied",
    "estimated_arrival": "1-3个工作日"
  }
}
```

**错误示例（金额不足）**：
```json
{
  "code": 2005,
  "message": "可提现余额不足",
  "data": {
    "available": 85.50,
    "required": 150.00
  }
}
```

---

### 13.2 提现记录
**GET** `/withdrawals/me`

**Query参数**：
- `cursor`：分页游标
- `limit`：每页数量（默认20）

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "withdrawal_id": 60001,
        "amount_cny": 150.00,
        "method": "alipay",
        "status": "paid",
        "created_at": "2025-01-15T10:00:00Z",
        "processed_at": "2025-01-16T14:30:00Z"
      }
    ],
    "next_cursor": "abc123",
    "has_more": false
  }
}
```

**状态说明**：
- `applied`：已申请
- `approved`：已审核
- `paid`：已打款
- `rejected`：已拒绝

---

## 十四、排行榜

### 14.1 创作者打赏排行
**GET** `/rankings/creators/tips`

**Query参数**：
- `limit`：默认10（Top10）

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "rank": 1,
        "user_id": 10001,
        "nickname": "顶级创作者",
        "avatar_url": "https://...",
        "total_tipped_credits": 12500,
        "followers_count": 8888
      },
      {
        "rank": 2,
        "user_id": 10002,
        "nickname": "热门创作者",
        "avatar_url": "https://...",
        "total_tipped_credits": 8900,
        "followers_count": 5500
      }
    ]
  }
}
```

---

## 十五、我的主页

### 15.1 我的主页数据
**GET** `/me/home`

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "user": {
      "user_id": 10001,
      "nickname": "我的昵称",
      "avatar_url": "https://...",
      "bio": "个人简介"
    },
    "stats": {
      "likes_received_count": 1250,
      "followers_count": 888
    },
    "wallets": {
      "credits_balance": 1250,
      "coins_available": 85.50,
      "coins_pending": 120.00
    },
    "subscription": {
      "is_active": true,
      "can_claim_today": false,
      "days_remaining": 16
    },
    "tabs_count": {
      "published_count": 45,
      "liked_count": 120,
      "favorite_count": 88
    }
  }
}
```

---

### 15.2 我的作品列表
**GET** `/me/works`

**Query参数**：
- `status`：published/draft
- `cursor`：分页游标
- `limit`：每页数量（默认20）

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "work_id": 30001,
        "title": "我的作品",
        "cover_url": "https://...",
        "like_count": 520,
        "created_at": "2025-01-15T10:00:00Z"
      }
    ],
    "next_cursor": "abc123",
    "has_more": true
  }
}
```

---

## 十六、错误码表

| 错误码 | 说明 |
|-------|------|
| 0 | 成功 |
| 1001 | 用户未登录 |
| 1002 | Token已过期 |
| 1003 | 用户不存在 |
| 1004 | 用户已被封禁 |
| 2001 | 积分不足 |
| 2002 | 权限不足 |
| 2003 | 今日已领取 |
| 2004 | 邀请码无效 |
| 2005 | 金币余额不足 |
| 2006 | 提现金额不符合要求 |
| 3001 | 支付失败 |
| 3002 | 支付已取消 |
| 3003 | 支付单不存在 |
| 4001 | 视频生成失败 |
| 4002 | 供应商服务异常 |
| 5001 | 系统错误 |
| 5002 | 数据库错误 |
| 5003 | 缓存服务异常 |

---

**文档版本**：v1.0
**最后更新**：2025-12-25
**负责人**：SkyRiff技术团队
