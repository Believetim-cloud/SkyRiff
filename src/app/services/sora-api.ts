/**
 * SkyRiff Sora2 API 服务层
 * 封装所有API调用，支持自动离线模式
 */

import { API_CONFIG, API_ENDPOINTS } from './api-config';
import {
  createOfflineTextToVideo,
  createOfflineImageToVideo,
  getOfflineVideoTask,
  createOfflineChatCompletion,
} from './offline-api';
import type {
  VideoGenerationTask,
  TextToVideoRequest,
  ImageUrlToVideoRequest,
  ImageFileToVideoRequest,
  ChatCompletionRequest,
  ChatCompletionResponse,
  WatermarkRemovalRequest,
  ApiResponse,
} from './api-types';

// 离线模式标志
let isOfflineMode = false;
let offlineModeChecked = false;

/**
 * 检测是否需要使用离线模式
 */
async function checkOfflineMode(): Promise<boolean> {
  if (offlineModeChecked) {
    return isOfflineMode;
  }

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });
    isOfflineMode = !response.ok;
  } catch (error) {
    isOfflineMode = true;
  }

  offlineModeChecked = true;
  
  if (isOfflineMode) {
    console.log('🔄 离线模式已启用：使用前端模拟数据');
  } else {
    console.log('✅ 在线模式：连接到后端服务器');
  }

  return isOfflineMode;
}

/**
 * 创建请求头
 */
function createHeaders(isFormData: boolean = false): HeadersInit {
  const headers: HeadersInit = {
    'Authorization': `Bearer ${API_CONFIG.API_KEY}`,
    'Accept': 'application/json',
  };
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
}

/**
 * 处理API响应
 */
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    const errorText = await response.text();
    return {
      success: false,
      error: {
        code: response.status,
        message: response.statusText,
        details: errorText,
      },
    };
  }
  
  const data = await response.json();
  return {
    success: true,
    data,
  };
}

/**
 * 1. 文生视频（异步请求）
 */
export async function createTextToVideo(
  request: TextToVideoRequest
): Promise<ApiResponse<VideoGenerationTask>> {
  if (await checkOfflineMode()) {
    return createOfflineTextToVideo(request);
  }

  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.VIDEO_GENERATION}`,
      {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(request),
      }
    );
    
    return await handleResponse<VideoGenerationTask>(response);
  } catch (error) {
    return {
      success: false,
      error: {
        code: -1,
        message: '网络错误',
        details: error instanceof Error ? error.message : '未知错误',
      },
    };
  }
}

/**
 * 2. 图生视频 - URL传图（异步请求）
 */
export async function createImageUrlToVideo(
  request: ImageUrlToVideoRequest
): Promise<ApiResponse<VideoGenerationTask>> {
  if (await checkOfflineMode()) {
    return createOfflineImageToVideo(request);
  }

  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.VIDEO_GENERATION}`,
      {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(request),
      }
    );
    
    return await handleResponse<VideoGenerationTask>(response);
  } catch (error) {
    return {
      success: false,
      error: {
        code: -1,
        message: '网络错误',
        details: error instanceof Error ? error.message : '未知错误',
      },
    };
  }
}

/**
 * 3. 图生视频 - 直接传图（异步请求）
 */
export async function createImageFileToVideo(
  request: ImageFileToVideoRequest
): Promise<ApiResponse<VideoGenerationTask>> {
  if (await checkOfflineMode()) {
    return createOfflineImageToVideo(request);
  }

  try {
    const formData = new FormData();
    formData.append('input_reference', request.file);
    formData.append('prompt', request.prompt);
    formData.append('model', request.model);
    
    if (request.size) {
      formData.append('size', request.size);
    }
    
    if (request.seconds) {
      formData.append('seconds', request.seconds);
    }
    
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.VIDEO_GENERATION}`,
      {
        method: 'POST',
        headers: createHeaders(true), // FormData不需要Content-Type
        body: formData,
      }
    );
    
    return await handleResponse<VideoGenerationTask>(response);
  } catch (error) {
    return {
      success: false,
      error: {
        code: -1,
        message: '网络错误',
        details: error instanceof Error ? error.message : '未知错误',
      },
    };
  }
}

/**
 * 4. 查询任务进度
 */
export async function getVideoStatus(
  videoId: string
): Promise<ApiResponse<VideoGenerationTask>> {
  if (await checkOfflineMode()) {
    return getOfflineVideoTask(videoId);
  }

  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.VIDEO_STATUS(videoId)}`,
      {
        method: 'GET',
        headers: createHeaders(),
      }
    );
    
    return await handleResponse<VideoGenerationTask>(response);
  } catch (error) {
    return {
      success: false,
      error: {
        code: -1,
        message: '网络错误',
        details: error instanceof Error ? error.message : '未知错误',
      },
    };
  }
}

/**
 * 5. 查看视频内容（不推荐使用，建议使用getVideoStatus获取URL）
 */
export async function getVideoContent(videoId: string): Promise<Blob | null> {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.VIDEO_CONTENT(videoId)}`,
      {
        method: 'GET',
        headers: createHeaders(),
      }
    );
    
    if (!response.ok) {
      return null;
    }
    
    return await response.blob();
  } catch (error) {
    console.error('获取视频内容失败:', error);
    return null;
  }
}

/**
 * 6. Chat兼容模式
 */
export async function createChatCompletion(
  request: ChatCompletionRequest
): Promise<ApiResponse<ChatCompletionResponse>> {
  if (await checkOfflineMode()) {
    return createOfflineChatCompletion(request);
  }
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CHAT_COMPLETIONS}`,
      {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(request),
      }
    );
    
    return await handleResponse<ChatCompletionResponse>(response);
  } catch (error) {
    return {
      success: false,
      error: {
        code: -1,
        message: '网络错误',
        details: error instanceof Error ? error.message : '未知错误',
      },
    };
  }
}

/**
 * 7. 去水印 - 草稿
 */
export async function removeWatermarkFromDraft(
  accessToken: string
): Promise<ApiResponse<ChatCompletionResponse>> {
  return createChatCompletion({
    model: 'sora-drafts-url',
    stream: false,
    messages: [
      {
        role: 'user',
        content: accessToken,
      },
    ],
  });
}

/**
 * 8. 去水印 - 作品地址
 */
export async function removeWatermarkFromPost(
  postUrl: string
): Promise<ApiResponse<ChatCompletionResponse>> {
  return createChatCompletion({
    model: 'sora_url',
    stream: false,
    messages: [
      {
        role: 'user',
        content: postUrl,
      },
    ],
  });
}

/**
 * 轮询查询任务状态直到完成
 * @param videoId 任务ID
 * @param onProgress 进度回调
 * @param maxAttempts 最大尝试次数
 * @param interval 轮询间隔（毫秒）
 */
export async function pollVideoStatus(
  videoId: string,
  onProgress?: (task: VideoGenerationTask) => void,
  maxAttempts: number = API_CONFIG.POLLING.MAX_ATTEMPTS,
  interval: number = API_CONFIG.POLLING.INTERVAL
): Promise<ApiResponse<VideoGenerationTask>> {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const response = await getVideoStatus(videoId);
    
    if (!response.success) {
      return response;
    }
    
    const task = response.data!;
    
    // 调用进度回调
    if (onProgress) {
      onProgress(task);
    }
    
    // 如果完成或失败，返回结果
    if (task.status === 'success' || task.status === 'failed') {
      return response;
    }
    
    // 等待后继续查询
    await new Promise(resolve => setTimeout(resolve, interval));
    attempts++;
  }
  
  // 超时
  return {
    success: false,
    error: {
      code: -2,
      message: '查询超时',
      details: `已尝试 ${maxAttempts} 次，仍未完成`,
    },
  };
}

/**
 * 完整的视频生成流程（文生视频）
 * @param prompt 提示词
 * @param model 模型
 * @param onProgress 进度回调
 */
export async function generateVideoFromText(
  prompt: string,
  model: string,
  onProgress?: (task: VideoGenerationTask) => void
): Promise<ApiResponse<VideoGenerationTask>> {
  // 1. 创建任务
  const createResponse = await createTextToVideo({ prompt, model });
  
  if (!createResponse.success || !createResponse.data) {
    return createResponse;
  }
  
  const taskId = createResponse.data.id;
  
  // 2. 轮询查询进度
  return pollVideoStatus(taskId, onProgress);
}

/**
 * 完整的视频生成流程（图生视频-URL）
 */
export async function generateVideoFromImageUrl(
  imageUrl: string,
  prompt: string,
  model: string,
  onProgress?: (task: VideoGenerationTask) => void
): Promise<ApiResponse<VideoGenerationTask>> {
  // 1. 创建任务
  const createResponse = await createImageUrlToVideo({
    image_url: imageUrl,
    prompt,
    model,
  });
  
  if (!createResponse.success || !createResponse.data) {
    return createResponse;
  }
  
  const taskId = createResponse.data.id;
  
  // 2. 轮询查询进度
  return pollVideoStatus(taskId, onProgress);
}

/**
 * 完整的视频生成流程（图生视频-文件上传）
 */
export async function generateVideoFromImageFile(
  file: File,
  prompt: string,
  model: string,
  onProgress?: (task: VideoGenerationTask) => void,
  size?: string,
  seconds?: string
): Promise<ApiResponse<VideoGenerationTask>> {
  // 1. 创建任务
  const createResponse = await createImageFileToVideo({
    file,
    prompt,
    model,
    size,
    seconds,
  });
  
  if (!createResponse.success || !createResponse.data) {
    return createResponse;
  }
  
  const taskId = createResponse.data.id;
  
  // 2. 轮询查询进度
  return pollVideoStatus(taskId, onProgress);
}
