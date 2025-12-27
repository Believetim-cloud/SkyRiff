/**
 * 故事版 API 服务
 */

import { API_CONFIG } from './api-config';
import { getAuthToken } from './backend-api';

const API_BASE_URL = `${API_CONFIG.BASE_URL}/api/v1`;

export interface Shot {
  shot_id: number;
  storyboard_id: number;
  prompt: string;
  duration_sec: number;
  shot_size?: string;
  camera_move?: string;
  status: string;
  video_id?: number;
  task_id?: number;
}

export interface Storyboard {
  storyboard_id: number;
  topic_prompt: string;
  shots: Shot[];
  shot_order: number[];
  created_at: string;
}

export interface StoryboardListResponse {
  code: number;
  message: string;
  data: {
    items: Storyboard[];
    has_more: boolean;
    next_cursor?: number;
  };
}

export interface StoryboardResponse {
  code: number;
  message: string;
  data: Storyboard;
}

// 通用请求方法
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = await getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Request failed: ${response.status}`);
  }
  return response.json();
}

/**
 * 获取故事版列表
 */
export async function getStoryboards(limit: number = 20): Promise<StoryboardListResponse> {
  return request<StoryboardListResponse>(`/storyboards/?limit=${limit}`);
}

/**
 * 获取单个故事版详情
 */
export async function getStoryboard(id: number): Promise<StoryboardResponse> {
  return request<StoryboardResponse>(`/storyboards/${id}`);
}

/**
 * 创建故事版
 */
export async function createStoryboard(topic: string, shots: Partial<Shot>[]): Promise<StoryboardResponse> {
  return request<StoryboardResponse>('/storyboards/create', {
    method: 'POST',
    body: JSON.stringify({
      topic_prompt: topic,
      shots: shots
    })
  });
}

/**
 * 批量生成视频
 */
export async function batchGenerate(storyboardId: number, ratio: string = '16:9', model: string = 'sora2'): Promise<any> {
  return request(`/storyboards/${storyboardId}/batch_generate`, {
    method: 'POST',
    body: JSON.stringify({
      storyboard_id: storyboardId,
      ratio,
      model
    })
  });
}
