/**
 * 离线模式 API
 * 当后端服务器不可用时，使用前端模拟数据
 */

import type {
  VideoGenerationTask,
  ApiResponse,
  TextToVideoRequest,
  ImageUrlToVideoRequest,
  ImageFileToVideoRequest,
  ChatCompletionRequest,
  ChatCompletionResponse,
} from './api-types';

// 真实可播放的演示视频列表
const DEMO_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
];

// 存储所有离线任务
const offlineTasks = new Map<string, VideoGenerationTask>();

/**
 * 生成视频ID
 */
function generateVideoId(): string {
  return `video_${Math.random().toString(36).substring(2, 15)}${Date.now()}`;
}

/**
 * 获取随机演示视频
 */
function getRandomDemoVideo(): string {
  return DEMO_VIDEOS[Math.floor(Math.random() * DEMO_VIDEOS.length)];
}

/**
 * 创建文生视频任务（离线模式）
 */
export async function createOfflineTextToVideo(
  request: TextToVideoRequest
): Promise<ApiResponse<VideoGenerationTask>> {
  return new Promise((resolve) => {
    const videoId = generateVideoId();
    const timestamp = Math.floor(Date.now() / 1000);

    // 确定视频尺寸
    let videoSize = request.size || '720x1280';
    if (request.model.includes('landscape')) {
      videoSize = '1280x720';
    } else if (request.model.includes('portrait')) {
      videoSize = '720x1280';
    }

    const task: VideoGenerationTask = {
      id: videoId,
      object: 'video.generation',
      model: request.model,
      prompt: request.prompt,
      status: 'pending',
      progress: 0,
      created_at: timestamp,
      size: videoSize,
    };

    offlineTasks.set(videoId, task);

    // 模拟异步处理
    setTimeout(() => {
      resolve({
        success: true,
        data: task,
      });

      // 启动进度模拟
      startOfflineProgressSimulation(videoId, request.model);
    }, 500);
  });
}

/**
 * 创建图生视频任务（离线模式）
 */
export async function createOfflineImageToVideo(
  request: ImageUrlToVideoRequest | ImageFileToVideoRequest
): Promise<ApiResponse<VideoGenerationTask>> {
  return new Promise((resolve) => {
    const videoId = generateVideoId();
    const timestamp = Math.floor(Date.now() / 1000);

    // 确定视频尺寸
    let videoSize = request.size || '720x1280';
    if (request.model.includes('landscape')) {
      videoSize = '1280x720';
    } else if (request.model.includes('portrait')) {
      videoSize = '720x1280';
    }

    const task: VideoGenerationTask = {
      id: videoId,
      object: 'video.generation',
      model: request.model,
      prompt: request.prompt,
      status: 'pending',
      progress: 0,
      created_at: timestamp,
      size: videoSize,
    };

    offlineTasks.set(videoId, task);

    // 模拟异步处理
    setTimeout(() => {
      resolve({
        success: true,
        data: task,
      });

      // 启动进度模拟
      startOfflineProgressSimulation(videoId, request.model);
    }, 500);
  });
}

/**
 * 查询任务进度（离线模式）
 */
export async function getOfflineVideoTask(
  videoId: string
): Promise<ApiResponse<VideoGenerationTask>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const task = offlineTasks.get(videoId);

      if (!task) {
        resolve({
          success: false,
          error: {
            code: 404,
            message: '未找到任务',
            details: `任务 ${videoId} 不存在`,
          },
        });
        return;
      }

      resolve({
        success: true,
        data: task,
      });
    }, 300);
  });
}

/**
 * 模拟任务进度更新
 */
function startOfflineProgressSimulation(videoId: string, model: string): void {
  const task = offlineTasks.get(videoId);
  if (!task) return;

  // 根据模型确定完成时间
  const isPro = model.includes('pro');
  const totalTime = isPro ? 20000 : 10000; // Pro: 20秒, 标准: 10秒（快速演示）
  const interval = 500; // 每0.5秒更新一次
  const increment = 100 / (totalTime / interval);

  const timer = setInterval(() => {
    const currentTask = offlineTasks.get(videoId);
    if (!currentTask) {
      clearInterval(timer);
      return;
    }

    // 更新进度
    currentTask.progress = Math.min(100, currentTask.progress + increment);

    // 状态转换
    if (currentTask.progress > 0 && currentTask.progress < 100) {
      currentTask.status = 'processing';
    } else if (currentTask.progress >= 100) {
      currentTask.status = 'success';
      currentTask.progress = 100;
      currentTask.video_url = getRandomDemoVideo();
      currentTask.completed_at = Math.floor(Date.now() / 1000);
      clearInterval(timer);

      console.log(`✅ 离线模式：视频生成完成！ID: ${videoId}`);
    }

    offlineTasks.set(videoId, currentTask);
  }, interval);
}

/**
 * 清空所有离线任务
 */
export function clearOfflineTasks(): void {
  offlineTasks.clear();
}

/**
 * 获取所有离线任务
 */
export function getAllOfflineTasks(): VideoGenerationTask[] {
  return Array.from(offlineTasks.values());
}

export async function createOfflineChatCompletion(
  request: ChatCompletionRequest
): Promise<ApiResponse<ChatCompletionResponse>> {
  const last = request.messages[request.messages.length - 1];
  const content =
    typeof last.content === 'string'
      ? last.content
      : Array.isArray(last.content)
      ? last.content
          .map((c) => (c.type === 'text' ? c.text || '' : c.image_url?.url || ''))
          .join(' ')
      : '';
  const now = Math.floor(Date.now() / 1000);
  return {
    success: true,
    data: {
      id: `offline_${now}`,
      object: 'chat.completion',
      created: now,
      model: request.model,
      choices: [
        {
          finish_reason: 'stop',
          index: 0,
          message: {
            role: 'assistant',
            content: `这是离线模拟回复：${content}`.slice(0, 500),
          },
        },
      ],
      usage: {
        completion_tokens: 20,
        total_tokens: 40,
        prompt_tokens: 20,
      },
    },
  };
}
