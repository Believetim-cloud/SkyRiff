/**
 * SkyRiff Sora2 API 类型定义
 */

// 任务状态
export type VideoStatus = 'pending' | 'processing' | 'success' | 'failed';

// 方向
export type Orientation = 'portrait' | 'landscape';

// 质量
export type Quality = 'standard' | 'pro' | 'hd';

// 视频生成任务
export interface VideoGenerationTask {
  id: string;
  object: string;
  model: string;
  status: VideoStatus;
  progress: number;
  created_at: number;
  completed_at?: number;
  size: string;
  video_url?: string;
  error_message?: string;
  video_id?: number; // 后端数据库ID
}

// 文生视频请求参数
export interface TextToVideoRequest {
  prompt: string;
  model: string;
}

// 图生视频URL请求参数
export interface ImageUrlToVideoRequest {
  image_url: string;
  prompt: string;
  model: string;
}

// 图生视频文件上传请求参数
export interface ImageFileToVideoRequest {
  file: File;
  prompt: string;
  model: string;
  size?: string;
  seconds?: string;
}

// Chat消息类型
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string | ChatMessageContent[];
}

export interface ChatMessageContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
  };
}

// Chat请求参数
export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
}

// Chat响应
export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    finish_reason: string;
    index: number;
    message: {
      role: string;
      content: string;
    };
  }[];
  links?: {
    gif: string;
    text: string;
    id: string;
    mp4: string;
    mp4_wm: string;
    md: string;
    thumbnail: string;
  };
  usage: {
    completion_tokens: number;
    total_tokens: number;
    prompt_tokens: number;
  };
  post_id?: string;
  original_input?: string;
  post_info?: {
    attachments_count: number;
    view_count: number;
    like_count: number;
    title: string;
  };
}

// 去水印请求参数
export interface WatermarkRemovalRequest {
  accessToken?: string; // 草稿用
  postUrl?: string; // 作品地址用
}

// 本地视频数据（用于存储）
export interface LocalVideo {
  id: string;
  taskId: string;
  backendTaskId?: number; // 后端任务ID
  backendVideoId?: number; // 后端视频ID
  title: string;
  prompt: string;
  model: string;
  status: VideoStatus;
  progress: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  createdAt: number;
  completedAt?: number;
  duration: number;
  orientation: Orientation;
  quality: Quality;
  size: string;
}

// API错误
export interface ApiError {
  code: number;
  message: string;
  details?: string;
}

// API响应包装
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}
