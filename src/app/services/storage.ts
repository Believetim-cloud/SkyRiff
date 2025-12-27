/**
 * 本地存储服务
 * 管理用户生成的视频数据
 */

import type { LocalVideo, VideoGenerationTask } from './api-types';

const STORAGE_KEY = 'skyriff_videos';

/**
 * 获取所有本地视频
 */
export function getLocalVideos(): LocalVideo[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const videos = data ? JSON.parse(data) : [];
    
    // 自动清理包含旧URL的视频（pexels.com 和 archive.org）
    const hasOldVideos = videos.some((v: LocalVideo) => 
      v.videoUrl?.includes('pexels.com') || 
      v.videoUrl?.includes('archive.org')
    );
    
    if (hasOldVideos) {
      console.log('🔄 检测到旧资产视频，正在自动清理...');
      const cleanedVideos = videos.filter((v: LocalVideo) => 
        !v.videoUrl?.includes('pexels.com') && 
        !v.videoUrl?.includes('archive.org')
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedVideos));
      return cleanedVideos;
    }
    
    return videos;
  } catch (error) {
    console.error('读取本地视频失败:', error);
    return [];
  }
}

/**
 * 保存视频到本地
 */
export function saveLocalVideo(video: LocalVideo): void {
  try {
    const videos = getLocalVideos();
    const existingIndex = videos.findIndex(v => v.id === video.id);
    
    if (existingIndex >= 0) {
      // 更新现有视频
      videos[existingIndex] = video;
    } else {
      // 添加新视频
      videos.unshift(video); // 最新的放在前面
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
  } catch (error) {
    console.error('保存视频失败:', error);
  }
}

/**
 * 从API任务创建本地视频对象
 */
export function createLocalVideoFromTask(
  task: VideoGenerationTask,
  additionalData: {
    title: string;
    prompt: string;
    duration: number;
    orientation: 'portrait' | 'landscape';
    quality: 'standard' | 'pro' | 'hd';
  }
): LocalVideo {
  return {
    id: task.id,
    taskId: task.id,
    title: additionalData.title,
    prompt: additionalData.prompt,
    model: task.model,
    status: task.status,
    progress: task.progress,
    videoUrl: task.video_url,
    thumbnailUrl: task.video_url, // 可以后续生成缩略图
    createdAt: task.created_at * 1000, // 转换为毫秒
    completedAt: task.completed_at ? task.completed_at * 1000 : undefined,
    duration: additionalData.duration,
    orientation: additionalData.orientation,
    quality: additionalData.quality,
    size: task.size,
  };
}

/**
 * 更新视频状态
 */
export function updateVideoStatus(videoId: string, task: VideoGenerationTask): void {
  const videos = getLocalVideos();
  const video = videos.find(v => v.id === videoId);
  
  if (video) {
    video.status = task.status;
    video.progress = task.progress;
    video.videoUrl = task.video_url;
    
    if (task.completed_at) {
      video.completedAt = task.completed_at * 1000;
    }
    
    if (task.video_id) {
      video.backendVideoId = task.video_id;
    }
    
    saveLocalVideo(video);
  }
}

/**
 * 删除视频
 */
export function deleteLocalVideo(videoId: string): void {
  try {
    const videos = getLocalVideos();
    const filtered = videos.filter(v => v.id !== videoId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('删除视频失败:', error);
  }
}

/**
 * 获取单个视频
 */
export function getLocalVideo(videoId: string): LocalVideo | undefined {
  const videos = getLocalVideos();
  return videos.find(v => v.id === videoId);
}

/**
 * 清理所有本地视频数据（用于测试和重置）
 */
export function clearAllLocalVideos(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('已清理所有本地视频数据');
  } catch (error) {
    console.error('清理本地视频数据失败:', error);
  }
}

/**
 * 获取当前视频索引（用于调试）
 */
export function getCurrentVideoIndex(): number {
  try {
    const storedIndex = localStorage.getItem('skyriff_video_index');
    return storedIndex ? parseInt(storedIndex, 10) : 0;
  } catch (e) {
    return 0;
  }
}

/**
 * 重置视频索引到0（用于重新开始循环）
 */
export function resetVideoIndex(): void {
  try {
    localStorage.setItem('skyriff_video_index', '0');
    console.log('✅ 视频索引已重置为0，下次生成将从第一个视频开始');
  } catch (e) {
    console.error('重置视频索引失败:', e);
  }
}

/**
 * 按状态筛选视频
 */
export function getVideosByStatus(status: 'pending' | 'processing' | 'success' | 'failed'): LocalVideo[] {
  return getLocalVideos().filter(v => v.status === status);
}

/**
 * 获取进行中的视频
 */
export function getProcessingVideos(): LocalVideo[] {
  return getLocalVideos().filter(
    v => v.status === 'pending' || v.status === 'processing'
  );
}

/**
 * 获取已完成的视频
 */
export function getCompletedVideos(): LocalVideo[] {
  return getVideosByStatus('success');
}

/**
 * 获取失败的视频
 */
export function getFailedVideos(): LocalVideo[] {
  return getVideosByStatus('failed');
}

/**
 * 创建一个失败状态的示例视频（用于演示）
 */
export function createFailedVideo(errorMessage: string): void {
  const failedVideo: LocalVideo = {
    id: `failed_${Date.now()}`,
    taskId: `task_failed_${Date.now()}`,
    title: '视频生成失败',
    prompt: '这是一个演示失败状态的示例视频',
    model: 'sora-1.0-turbo',
    status: 'failed',
    progress: 0,
    error: errorMessage,
    createdAt: Date.now(),
    duration: 15,
    orientation: 'portrait',
    quality: 'standard',
  };
  
  saveLocalVideo(failedVideo);
}

/**
 * 创建一个生成中的视频，并模拟进度更新
 */
export function createProcessingVideo(
  title: string,
  prompt: string,
  duration: number,
  orientation: 'portrait' | 'landscape',
  quality: 'standard' | 'pro' | 'hd'
): string {
  const videoId = `video_${Date.now()}`;
  
  const newVideo: LocalVideo = {
    id: videoId,
    taskId: `task_${Date.now()}`,
    title,
    prompt,
    model: 'sora-1.0-turbo',
    status: 'pending',
    progress: 0,
    createdAt: Date.now(),
    duration,
    orientation,
    quality,
  };
  
  saveLocalVideo(newVideo);
  
  return videoId;
}


/**
 * 完成视频生成
 */
function completeVideoGeneration(videoId: string): void {
  const video = getLocalVideo(videoId);
  if (!video) return;
  
  // 60个可靠的测试视频URL
  const sampleVideos = [
    // Google Cloud Storage 示例视频 (13个)
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
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    
    // Archive.org 公共领域视频 - 替换为可靠的Google Cloud Storage视频
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    
    // 样本视频库 (10个)
    'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_2mb.mp4',
    'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_5mb.mp4',
    'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_10mb.mp4',
    'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
    'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_2MB.mp4',
    'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_5MB.mp4',
    'https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s_1MB.mp4',
    'https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_5MB.mp4',
    'https://test-videos.co.uk/vids/sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4',
    
    // 测试媒体文件 (10个)
    'https://media.w3.org/2010/05/sintel/trailer.mp4',
    'https://media.w3.org/2010/05/bunny/trailer.mp4',
    'https://media.w3.org/2010/05/video/movie_300.mp4',
    'https://download.blender.org/demo/movies/BBB/bbb_sunflower_1080p_30fps_normal.mp4',
    'https://download.blender.org/demo/movies/ToS/tears_of_steel_720p.mov',
    'https://storage.googleapis.com/web-dev-assets/video-and-source-tags/chrome.mp4',
    'https://storage.googleapis.com/web-dev-assets/video-and-source-tags/chrome-small.mp4',
    'https://html5demos.com/assets/dizzy.mp4',
    'https://www.html5rocks.com/en/tutorials/video/basics/Chrome_ImF.mp4',
    'https://www.html5rocks.com/en/tutorials/video/basics/devstories.mp4',
    
    // 额外备用视频 (15个) - 使用Google Storage的重复但添加参数避免完全相同
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4?v=1',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4?v=1',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4?v=1',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4?v=1',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4?v=1',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4?v=1',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4?v=1',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4?v=1',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4?v=1',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4?v=1',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4?v=1',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4?v=1',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4?v=1',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4?v=2',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4?v=2',
    
    // 新增 20个可靠视频源
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4?v=2',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4?v=2',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4?v=2',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4?v=2',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4?v=2',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4?v=2',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4?v=2',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4?v=2',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4?v=2',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4?v=2',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4?v=2',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4?v=3',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4?v=3',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4?v=3',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4?v=3',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4?v=3',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4?v=3',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4?v=3',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4?v=3',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4?v=3',
  ];
  
  // 获取当前索引（从localStorage读取，确保按顺序循环）
  const currentIndexKey = 'skyriff_video_index';
  let currentIndex = 0;
  try {
    const storedIndex = localStorage.getItem(currentIndexKey);
    if (storedIndex) {
      currentIndex = parseInt(storedIndex, 10);
    }
  } catch (e) {
    // 如果读取失败，使用0
  }
  
  // 选择当前索引对应的视频
  const selectedVideoUrl = sampleVideos[currentIndex % sampleVideos.length];
  
  // 更新索引并保存
  const nextIndex = (currentIndex + 1) % sampleVideos.length;
  try {
    localStorage.setItem(currentIndexKey, nextIndex.toString());
    console.log(`🎬 生成视频 #${currentIndex + 1}/80:`, selectedVideoUrl.substring(0, 80) + '...');
  } catch (e) {
    // 忽略存储错误
  }
  
  video.status = 'success';
  video.progress = 100;
  video.videoUrl = selectedVideoUrl;
  video.thumbnailUrl = selectedVideoUrl;
  video.completedAt = Date.now();
  
  saveLocalVideo(video);
  
  // 触发自定义事件通知UI更新
  window.dispatchEvent(new CustomEvent('video-generation-complete', { detail: { videoId } }));
}

/**
 * 修复卡住的视频
 * 检查所有"生成中"的视频，如果创建时间超过5分钟，自动完成生成
 */
export function fixStuckVideos(): number {
  const processingVideos = getProcessingVideos();
  let fixedCount = 0;
  const now = Date.now();
  const maxProcessingTime = 10 * 60 * 1000; // 10分钟超时
  
  processingVideos.forEach(video => {
    const timeElapsed = now - video.createdAt;
    
    if (timeElapsed > maxProcessingTime) {
      console.log(`🔧 修复卡住的视频: ${video.title} (已等待 ${Math.floor(timeElapsed / 1000)}秒)`);
      
      // 自动完成视频
      // completeVideoGeneration(video.id); // 移除模拟完成逻辑
      
      // 标记为失败，因为真实环境不应自动成功模拟
      const failedVideo = { ...video };
      failedVideo.status = 'failed';
      failedVideo.error = '生成超时，请重试';
      failedVideo.progress = 0;
      failedVideo.completedAt = Date.now();
      
      saveLocalVideo(failedVideo);
      fixedCount++;
    }
  });
  
  if (fixedCount > 0) {
    console.log(`✅ 已修复 ${fixedCount} 个卡住的视频 (标记为失败)`);
  }
  
  return fixedCount;
}

/**
 * 恢复所有进行中的视频（页面重新加载时调用）
 */
export function resumeProcessingVideos(): void {
  const processingVideos = getProcessingVideos();
  
  if (processingVideos.length === 0) return;
  
  console.log(`🔄 发现 ${processingVideos.length} 个未完成的视频，等待后台更新...`);
}

