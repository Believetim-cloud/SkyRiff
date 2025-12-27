import { useState, useEffect, useRef } from 'react';
import { Video, Users, Heart, Play, Download, MoreVertical, Clock, CheckCircle, XCircle, Loader, X, Pause, Volume2, VolumeX, Send, Trash2, ArrowLeft, RefreshCw, AlertTriangle, Info } from 'lucide-react';
import { getLocalVideos, getProcessingVideos, deleteLocalVideo, clearAllLocalVideos, fixStuckVideos } from '../services/storage';
import { updateVideoStatus } from '../services/storage';
import { getTaskStatus, getVideoStreamUrl, getVideoDownloadUrl, publishWork, PublishWorkPayload, downloadVideoFile, AuthError, getVideoBlobUrl } from '../services/backend-api';
import { publishVideo } from '../services/video-pool';
import { getAllPublishedVideoIds } from '../services/my-videos';
import { showToast } from './Toast';
import type { LocalVideo } from '../services/api-types';
import { API_CONFIG } from '../services/api-config';

// Helper function to get correct video source
const getVideoSrc = (video: LocalVideo) => {
    // 1. 如果是本地静态文件，直接使用静态服务器路径
    if (video.videoUrl && video.videoUrl.startsWith('/static/')) {
        return `${API_CONFIG.BASE_URL}${video.videoUrl}`;
    }
    // 2. 如果是远程文件，走后端代理流
    if (video.backendVideoId) {
        return getVideoStreamUrl(video.backendVideoId);
    }
    // 3. 兜底（可能是原始远程URL，可能会跨域）
    return video.videoUrl;
};

type TabType = 'videos' | 'characters' | 'favorites';

// 确认对话框配置类型
interface ConfirmDialogConfig {
  type: 'confirm' | 'alert';
  title: string;
  message: string;
  icon?: 'warning' | 'success' | 'error' | 'info';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface VideoAsset {
  id: string;
  thumbnail: string;
  title: string;
  duration: number;
  createdAt: string;
  status: string;
  project: string;
}

const mockVideos: VideoAsset[] = [
  {
    id: '1',
    thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=300&fit=crop',
    title: '星空下的梦想',
    duration: 15,
    createdAt: '2小时前',
    status: 'success',
    project: '个人作品',
  },
  {
    id: '2',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
    title: '未来城市夜景',
    duration: 10,
    createdAt: '5小时前',
    status: 'success',
    project: '商业项目',
  },
  {
    id: '3',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop',
    title: '科技感宣传片',
    duration: 25,
    createdAt: '1天前',
    status: 'processing',
    project: '客户委托',
  },
];

const mockCharacters = [
  {
    id: '1',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
    name: '女主角-艾莉',
    usedCount: 12,
  },
  {
    id: '2',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    name: '男主角-杰克',
    usedCount: 8,
  },
];

export function AssetsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('videos');
  const [videos, setVideos] = useState<LocalVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<LocalVideo | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // 自动修复卡住的视频 (禁用，避免误判)
    // fixStuckVideos();
    
    // 强制同步一次所有远程视频的状态 (防止URL已变成本地但前端不知道)
    const syncRemoteVideos = async () => {
        const localVideos = getLocalVideos();
        // 筛选出需要同步的视频：
        // 1. 状态是 success，但 videoUrl 为空
        // 2. 状态是 success，且 videoUrl 不是本地路径，且有 backendVideoId (可能是旧的远程URL)
        const remoteVideos = localVideos.filter(v => 
            v.status === 'success' && (
                !v.videoUrl || 
                (!v.videoUrl.startsWith('/static/') && v.backendVideoId)
            )
        );
        
        if (remoteVideos.length > 0) {
            console.log(`Checking ${remoteVideos.length} remote videos for local updates...`);
            for (const video of remoteVideos) {
                // 重新放入处理队列，触发一次 refreshProcessingVideos 逻辑
                // 或者直接在这里查询
                try {
                    // 如果没有 backendTaskId，但有 backendVideoId，直接查询视频资产详情
                    if (!video.backendTaskId && video.backendVideoId) {
                         try {
                             const detail = await getVideoAsset(video.backendVideoId);
                             if (detail?.code === 200 && detail.data?.watermarked_play_url) {
                                 const updated = { ...video, videoUrl: detail.data.watermarked_play_url };
                                 console.log(`[Sync] Updated by asset ${video.backendVideoId}: ${updated.videoUrl}`);
                                 updateVideoStatus(video.id, updated);
                             }
                         } catch (e) {
                             console.warn(`[Sync] getVideoAsset failed for ${video.backendVideoId}`, e);
                         }
                         continue;
                    }

                    if (video.backendTaskId) {
                        const response = await getTaskStatus(video.backendTaskId);
                        if (response.code === 200 && response.data) {
                            const taskData = response.data;
                            // 如果后端有了新的URL (可能是本地 /static/...)，或者前端本来就没有URL
                            if (taskData.video_url && taskData.video_url !== video.videoUrl) {
                                console.log(`Updating video URL for ${video.id}: ${taskData.video_url}`);
                                const updated = { ...video, videoUrl: taskData.video_url };
                                updateVideoStatus(video.id, updated);
                            }
                        }
                    }
                } catch (e) {
                    console.error('Failed to sync video:', video.id);
                }
            }
            loadVideos();
        }
    };
    syncRemoteVideos();

    loadVideos();
    
    // 监听视频生成完成事件
    const handleVideoComplete = () => {
      loadVideos();
    };
    
    window.addEventListener('video-generation-complete', handleVideoComplete);
    
    // 每3秒轮询一次，更新生成中视频的状态
    const pollInterval = setInterval(() => {
      const processingVideos = getProcessingVideos();
      if (processingVideos.length > 0) {
        refreshProcessingVideos();
      }
    }, 3000);
    
    return () => {
      window.removeEventListener('video-generation-complete', handleVideoComplete);
      clearInterval(pollInterval);
    };
  }, []);

  const loadVideos = () => {
    const localVideos = getLocalVideos();
    const publishedIds = getAllPublishedVideoIds();
    // 过滤掉已发布的视频
    const unpublishedVideos = localVideos.filter(v => !publishedIds.has(v.id));
    setVideos(unpublishedVideos);
  };

  const refreshProcessingVideos = async () => {
    const processingVideos = getProcessingVideos();
    
    if (processingVideos.length === 0) return;
    
    // 查询每个进行中视频的状态
    for (const video of processingVideos) {
      // 如果没有 backendTaskId，说明是无效的任务或者旧数据
      if (!video.backendTaskId) {
          console.warn(`Found stale processing video without task ID: ${video.id}`);
          const failedTask = {
              ...video,
              status: 'failed' as const,
              progress: 0,
              error: '任务数据丢失',
              error_message: '无法关联到后端任务'
          };
          // @ts-ignore
          updateVideoStatus(video.id, failedTask);
          continue;
      }

      try {
        const response = await getTaskStatus(video.backendTaskId);
        
        if (response.code === 200 && response.data) {
          const taskData = response.data;
          
          // 转换状态格式
          let status = 'processing';
          if (taskData.status === 'SUCCESS') status = 'success';
          if (taskData.status === 'FAILURE') status = 'failed';
          
          const updatedTask = {
              ...video,
              status: status,
              progress: taskData.progress || 0,
              error: taskData.status === 'FAILURE' ? '生成失败' : undefined,
              error_message: taskData.error_message,
              backendVideoId: taskData.video_id,
              videoUrl: taskData.video_url || video.videoUrl
          };
          
          // 如果成功且有视频URL，更新缩略图
          if (status === 'success') {
              // 优先信任后端返回的视频URL；如果缺失，则尝试直接查询视频资产详情
              if (taskData.video_url) {
                  updatedTask.thumbnailUrl = taskData.video_url; // 视频本身作为缩略图
                  updatedTask.videoUrl = taskData.video_url;
              } else if (taskData.video_id) {
                  try {
                      const detail = await getVideoAsset(taskData.video_id);
                      if (detail?.code === 200 && detail.data?.watermarked_play_url) {
                          updatedTask.thumbnailUrl = detail.data.watermarked_play_url;
                          updatedTask.videoUrl = detail.data.watermarked_play_url;
                      }
                  } catch (e) {
                      console.warn(`[Refresh] getVideoAsset failed for ${taskData.video_id}`, e);
                  }
              }
          }

          // @ts-ignore
          updateVideoStatus(video.id, updatedTask);
        }
      } catch (error: any) {
          // 处理 404 任务不存在
          if (error.message && error.message.includes('404')) {
             console.warn(`任务 ${video.backendTaskId} 不存在 (404)，标记为失效`);
             const failedTask = {
                 ...video,
                 status: 'failed',
                 progress: 0,
                 error: '任务已失效或过期',
                 error_message: '服务器上找不到该任务，可能已被清理'
             };
             // @ts-ignore
             updateVideoStatus(video.id, failedTask);
             const shortTitle = video.title && video.title.length > 5 ? video.title.substring(0, 5) + '...' : video.title || '视频';
             showToast.error(`视频 "${shortTitle}" 任务已失效`);
          } else if (error instanceof AuthError) {
             console.warn('登录已过期，暂停更新视频状态');
             return; 
          } else {
             console.error('更新视频状态异常:', error);
             // 对于其他网络错误，暂时保持 processing 状态，等待下一次重试
          }
      }
    }
    
    // 重新加载视频列表
    loadVideos();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshProcessingVideos();
    } catch (e) {
      // 忽略
    }
    setIsRefreshing(false);
  };
  
  // 手动重试失败的任务
  const handleRetryFailed = async (video: LocalVideo) => {
    if (confirm('尝试重新获取该视频状态？')) {
        showToast.info('正在刷新状态...');
        
        // 将状态重置为 processing，触发下一次轮询
        const retryTask = {
            ...video,
            status: 'processing' as const,
            error_message: undefined,
            error: undefined // 清除错误信息
        };
        updateVideoStatus(video.id, retryTask);
        loadVideos();
        
        // 立即触发一次刷新
        await refreshProcessingVideos();
    }
  };

  const handleFixStuck = () => {
    // const fixedCount = fixStuckVideos(); // 暂时移除自动修复卡住逻辑，因为这会误伤正在正常生成的视频
    // if (fixedCount > 0) {
    //   loadVideos(); // 刷新列表
    //   showToast.success(`✅ 已修复 ${fixedCount} 个卡住的视频！`);
    // } else {
    //   showToast.info('没有发现卡住的视频');
    // }
    showToast.info('自动修复功能已暂停，系统会自动管理任务状态');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'processing':
        return <Loader className="w-4 h-4 text-[var(--color-warning)] animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-[var(--color-success)]" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-[var(--color-error)]" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '等待中';
      case 'processing':
        return '生成中';
      case 'success':
        return '已完成';
      case 'failed':
        return '失败';
      default:
        return '未知';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    return `${days}天前`;
  };

  const handleDownloadVideo = async (video: LocalVideo) => {
    // 优先使用后端代理下载（解决CORS和网速问题）
    if (video.backendVideoId) {
        try {
            await downloadVideoFile(video.backendVideoId, `${video.title || 'video'}.mp4`);
            showToast.success('开始下载...');
            return;
        } catch (e) {
            console.error('Backend download failed, falling back to direct URL', e);
        }
    }

    if (!video.videoUrl) return;
    
    // 创建一个临时的a标签来下载
    const link = document.createElement('a');
    link.href = video.videoUrl;
    link.download = `${video.title || 'video'}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 获取处理中的视频
  const processingVideos = getProcessingVideos();
  // 合并所有视频（本地 + 处理中）
  const allVideos = getLocalVideos();
  
  // 过滤掉已发布的视频ID
  const publishedIds = getAllPublishedVideoIds();
  const unpublishedVideos = allVideos.filter(v => !publishedIds.has(v.id));

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950"> {/* 更深的背景 */}
      {/* Header */}
      <div className="px-4 py-3 bg-black/30 backdrop-blur-xl border-b border-white/5 flex items-center justify-between">{/* 磨砂效果 */}
        <div>
          <h1 className="text-[var(--color-text-primary)] text-lg">我的资产</h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            共 {unpublishedVideos.length} 个视频
            {processingVideos.length > 0 && (
              <span className="ml-2 text-orange-500 animate-pulse">
                {processingVideos.length} 个生成中
              </span>
            )}
          </p>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center gap-4 px-8 py-4 rounded-lg transition-all text-base ${ // 2x: gap-2→gap-4, px-4→px-8, py-2→py-4, 增加text-base
              activeTab === 'videos'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]'
            }`}
          >
            <Video className="w-8 h-8" /> {/* 2x: w-4 h-4 → w-8 h-8 */}
            视频资产 ({videos.length})
          </button>
          <button
            onClick={() => setActiveTab('characters')}
            className={`flex items-center gap-4 px-8 py-4 rounded-lg transition-all text-base ${ // 2x: gap-2→gap-4, px-4→px-8, py-2→py-4, 增加text-base
              activeTab === 'characters'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]'
            }`}
          >
            <Users className="w-8 h-8" /> {/* 2x: w-4 h-4 → w-8 h-8 */}
            角色资产
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-4 px-8 py-4 rounded-lg transition-all text-base ${ // 2x: gap-2→gap-4, px-4→px-8, py-2→py-4, 增加text-base
              activeTab === 'favorites'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]'
            }`}
          >
            <Heart className="w-8 h-8" /> {/* 2x: w-4 h-4 → w-8 h-8 */}
            收藏
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {activeTab === 'videos' && (
          <>
            {videos.length === 0 ? (
              <div className="text-center py-12">
                <Video className="w-12 h-12 text-[var(--color-text-tertiary)] mx-auto mb-3" />
                <p className="text-[var(--color-text-secondary)] mb-4">暂无视频资产</p>
                <p className="text-sm text-[var(--color-text-tertiary)]">
                  前往工具页或创作页生成视频
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="rounded-lg bg-[var(--color-surface)] overflow-hidden"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-[3/4] bg-[var(--color-surface-elevated)]">
                      {video.status === 'success' && video.videoUrl ? (
                        // 已完成的视频显示视频播放器
                        <div className="relative w-full h-full group">
                          <video
                            src={getVideoSrc(video)}
                            className="w-full h-full object-cover"
                            loop
                            muted
                            playsInline
                            crossOrigin="anonymous" // 解决跨域重定向导致的 ORB 拦截问题
                            onMouseEnter={(e) => {
                              const videoEl = e.currentTarget;
                              // 静默捕获播放错误，避免控制台刷屏
                              videoEl.play().catch(() => {});
                            }}
                            onMouseLeave={(e) => {
                              const videoEl = e.currentTarget;
                              videoEl.pause();
                              videoEl.currentTime = 0;
                            }}
                            onError={async (e) => {
                              // 发生错误时，尝试使用 Blob URL 作为回退
                              try {
                                const blobUrl = await getVideoBlobUrl(video.backendVideoId || video.id);
                                const el = e.currentTarget;
                                el.src = blobUrl;
                                el.play().catch(() => {});
                              } catch (err) {
                                console.warn('Thumbnail blob fallback failed', err);
                              }
                            }}
                            onClick={() => setSelectedVideo(video)}
                          />
                          
                          {/* 播放提示 */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                              <Play className="w-6 h-6 text-black ml-1" />
                            </div>
                          </div>
                          
                          {/* 成功状态图标 */}
                          <div className="absolute top-2 left-2">
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </div>
                      ) : video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-900">
                          <Video className="w-8 h-8 text-[var(--color-text-tertiary)]" />
                        </div>
                      )}
                      
                      {/* 生成中状态 */}
                      {(video.status === 'pending' || video.status === 'processing') && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                          {/* 旋转动画 */}
                          <div className="relative mb-4">
                            <div className="w-16 h-16 rounded-full border-4 border-gray-700"></div>
                            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-[var(--color-primary)] animate-spin"></div>
                          </div>
                          
                          {/* 生成中文字 */}
                          <span className="text-white font-medium mb-2">生成中...</span>
                          
                          {/* 进度百分比 */}
                          <span className="text-[var(--color-primary)] text-2xl font-bold mb-3">{video.progress}%</span>
                          
                          {/* 进度条 */}
                          <div className="w-4/5 h-1.5 bg-gray-700 rounded-full overflow-hidden mb-3">
                            <div 
                              className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-300"
                              style={{ width: `${video.progress}%` }}
                            ></div>
                          </div>
                          
                          {/* 预计时间提示 */}
                          <p className="text-xs text-gray-400 text-center px-2">
                            {video.status === 'pending' ? '排队等待中...' : '话题心等待，预计需要 3-5 分钟'}
                          </p>

                          {/* 允许手动刷新 */}
                          <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                refreshProcessingVideos();
                            }}
                            className="mt-2 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] transition-colors"
                          >
                            刷新进度
                          </button>
                          
                          {/* 状态图标 */}
                          <div className="absolute top-2 left-2">
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                              <Loader className="w-4 h-4 text-white animate-spin" />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* 失败状态 */}
                      {video.status === 'failed' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                          {/* 失败图标 */}
                          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-3">
                            <XCircle className="w-10 h-10 text-red-500" />
                          </div>
                          
                          {/* 失败文字 */}
                          <span className="text-red-500 font-medium mb-2">生成失败</span>
                          
                          {/* 失败原因 */}
                          <p className="text-xs text-gray-400 text-center px-3 leading-relaxed mb-2">
                            {video.error || '未知错误，请稍后重试'}
                          </p>
                          
                          {/* 重试按钮 */}
                          <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRetryFailed(video);
                            }}
                            className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs transition-colors flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            刷新状态
                          </button>
                          
                          {/* 状态图标 */}
                          <div className="absolute top-2 left-2">
                            <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                              <XCircle className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {video.status === 'success' && (
                        <>
                          <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-white text-xs">
                            {video.duration}s
                          </div>
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadVideo(video);
                            }}
                            className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full bg-black/60 hover:bg-[var(--color-primary)] flex items-center justify-center text-white transition-colors backdrop-blur-sm"
                            title="下载视频"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-2">
                      <h3 className="text-xs text-[var(--color-text-primary)] truncate">
                        {video.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] mt-0.5">
                        <div className="flex items-center gap-0.5 truncate">
                          <Clock className="w-2.5 h-2.5 flex-shrink-0" />
                          <span className="truncate">{formatTimestamp(video.createdAt)}</span>
                        </div>
                        <span className="text-xs">
                          {getStatusText(video.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'characters' && (
          <div className="grid grid-cols-2 gap-4">
            {mockCharacters.map((character) => (
              <div
                key={character.id}
                className="rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden"
              >
                <div className="aspect-square">
                  <img
                    src={character.avatar}
                    alt={character.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm text-[var(--color-text-primary)] mb-1">
                    {character.name}
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    使用 {character.usedCount} 次
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 text-[var(--color-text-tertiary)] mx-auto mb-3" />
            <p className="text-[var(--color-text-secondary)]">暂无收藏内容</p>
            {/* 隐藏的清理工具，点击5次触发 */}
            <div 
                className="mt-8 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => {
                    if (confirm('⚠️ 危险操作：是否清理所有“失败”的任务？\n\n这将删除所有状态为“失败”的本地记录。')) {
                        const all = getLocalVideos();
                        const failed = all.filter(v => v.status === 'failed');
                        failed.forEach(v => deleteLocalVideo(v.id));
                        loadVideos();
                        showToast.success(`已清理 ${failed.length} 个失败任务`);
                    }
                }}
            >
                <p className="text-xs text-red-900">清理失败任务 (Debug)</p>
            </div>
          </div>
        )}
      </div>

      {/* 全屏视频播放器 */}
      {selectedVideo && selectedVideo.videoUrl && (
        <VideoPlayerModal
          video={{
             ...selectedVideo,
             videoUrl: getVideoSrc(selectedVideo)
          }}
          onClose={() => setSelectedVideo(null)}
          onPublishSuccess={loadVideos}
        />
      )}

      {/* 删除视频确认对话框 */}
      {showDeleteDialog && videoToDelete && (
        <DeleteVideoDialog
          videoId={videoToDelete}
          onClose={() => setShowDeleteDialog(false)}
          onDeleteSuccess={loadVideos}
        />
      )}
    </div>
  );
}

/**
 * 全屏视频播放器组件
 */
interface VideoPlayerModalProps {
  video: LocalVideo;
  onClose: () => void;
  onPublishSuccess?: () => void;
}

function VideoPlayerModal({ video, onClose, onPublishSuccess }: VideoPlayerModalProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // 补回缺失的 isLoading 状态
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // 发布表单状态
  const [publishTitle, setPublishTitle] = useState(video.title || '');
  const [publishDesc, setPublishDesc] = useState(video.prompt || '');
  const [isPromptPublic, setIsPromptPublic] = useState(true);
  const [unlockCost, setUnlockCost] = useState(5);
  const [allowRemix, setAllowRemix] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleDownload = async () => {
    // 优先使用后端代理下载（解决CORS和网速问题）
    if (video.backendVideoId) {
        try {
            await downloadVideoFile(video.backendVideoId, `${video.title || 'video'}.mp4`);
            showToast.success('开始下载...');
            return;
        } catch (e) {
            console.error('Backend download failed, falling back to direct URL', e);
        }
    }

    if (!video.videoUrl) return;
    
    // 创建一个临时的a标签来下载
    const link = document.createElement('a');
    link.href = video.videoUrl;
    link.download = `${video.title || 'video'}.mp4`;
    // link.target = '_blank'; // 不需要
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleVideoClick = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePublish = () => {
    setShowPublishDialog(true);
  };

  const handleConfirmPublish = async () => {
    if (!video.backendVideoId) {
      // 如果没有后端ID，尝试使用 mock 发布 (兼容旧数据)
      console.warn('视频缺少后端ID，使用本地模拟发布');
      publishVideo(video, publishDesc); // Use the edited description
      setShowPublishDialog(false);
      showToast.success('发布成功 (本地模拟)！');
      if (onPublishSuccess) onPublishSuccess();
      onClose();
      return;
    }

    try {
      setIsPublishing(true);
      const payload: PublishWorkPayload = {
        video_id: video.backendVideoId,
        title: publishTitle,
        description: publishDesc,
        is_prompt_public: isPromptPublic,
        prompt_unlock_cost: unlockCost,
        allow_remix: allowRemix
      };

      await publishWork(payload);
      
      setShowPublishDialog(false);
      showToast.success('发布成功！视频已发布到社区');
      
      if (onPublishSuccess) {
        onPublishSuccess();
      }
      onClose();
    } catch (error) {
      console.error('发布失败:', error);
      const errorMessage = error instanceof Error ? error.message : '发布失败，请重试';
      // 汉化常见错误
      let displayError = errorMessage;
      if (errorMessage.includes('Failed to fetch')) {
        displayError = '网络连接失败，无法连接到服务器';
      } else if (errorMessage.includes('视频不存在')) {
        displayError = '服务器端找不到该视频数据（可能已被重置），仅支持本地查看';
      }
      showToast.error(displayError);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    deleteLocalVideo(video.id);
    setShowDeleteDialog(false);
    if (onPublishSuccess) {
      onPublishSuccess(); // 刷新列表
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* 视频播放器容器 - 限制最大宽度，但保证最小宽度以防挤压 */}
      <div className="relative w-full h-full max-w-md min-w-[320px] mx-auto bg-black flex flex-col justify-center">
        {/* Loading Indicator */}
        {isLoading && !videoError && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <Loader className="w-8 h-8 text-white animate-spin" />
            </div>
          </div>
        )}

        {!videoError ? (
          <video
            ref={videoRef}
            src={getVideoSrc(video)}
            className="w-full h-full object-contain"
            autoPlay
            loop
            muted={isMuted}
            playsInline
            crossOrigin="anonymous" // 解决跨域重定向导致的 ORB 拦截问题
            onClick={handleVideoClick}
            onLoadStart={() => setIsLoading(true)}
            onWaiting={() => setIsLoading(true)}
            onCanPlay={() => setIsLoading(false)}
            onError={async () => {
              // 先尝试 Blob 回退
              try {
                const blobUrl = await getVideoBlobUrl(video.backendVideoId || video.id);
                if (videoRef.current) {
                  videoRef.current.src = blobUrl;
                  await videoRef.current.play().catch(() => {});
                  setVideoError(false);
                  setIsLoading(false);
                  return;
                }
              } catch (err) {
                console.warn('Fullscreen blob fallback failed', err);
              }
              // 失败则进入错误占位
              setVideoError(true);
              setIsLoading(false);
            }}
            onLoadedData={() => {
              setIsLoading(false);
            }}
          />
        ) : (
        // 视频加载失败的占位符
        <div className="w-full max-w-md aspect-[9/16] bg-gray-900 flex flex-col items-center justify-center">
          <Video className="w-16 h-16 text-gray-600 mb-4" />
          <p className="text-white text-sm mb-2">视频加载失败</p>
          <p className="text-gray-400 text-xs px-8 text-center mb-4">
            视频文件可能已过期或无法访问
          </p>
          <button 
            onClick={() => {
                setVideoError(false);
                setIsLoading(true);
                if (videoRef.current) {
                    videoRef.current.load();
                }
            }}
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-3 h-3" />
            重试加载
          </button>
        </div>
      )}

      {/* 顶部返回按钮 */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 flex items-center justify-center text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      {/* 暂停/播放图标 */}
      {!isPlaying && !videoError && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-20 h-20 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-10 h-10 text-white fill-white ml-1" />
          </div>
        </div>
      )}

      {/* 右侧互动按钮 */}
        <div className="absolute right-4 bottom-32 flex flex-col gap-4 z-20">
          {/* 音量按钮 */}
          <button
            onClick={handleMuteToggle}
            className="flex flex-col items-center"
          >
            <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 flex items-center justify-center transition-colors">
              {isMuted ? (
                <VolumeX className="w-6 h-6 text-white" />
              ) : (
                <Volume2 className="w-6 h-6 text-white" />
              )}
            </div>
          </button>

          {/* 下载按钮 */}
          <button
            onClick={handleDownload}
            className="flex flex-col items-center"
          >
            <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 flex items-center justify-center transition-colors">
              <Download className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xs mt-1">下载</span>
          </button>

          {/* 发布按钮 */}
        <button
          onClick={handlePublish}
          className="flex flex-col items-center"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:opacity-90 flex items-center justify-center transition-opacity shadow-lg">
            <Send className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs mt-1">发布</span>
        </button>

        {/* 删除按钮 */}
        <button
          onClick={handleDelete}
          className="flex flex-col items-center"
        >
          <div className="w-12 h-12 rounded-full bg-red-500/90 hover:bg-red-500 flex items-center justify-center transition-colors shadow-lg">
            <Trash2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs mt-1">删除</span>
        </button>
      </div>

      {/* 底部信息 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20">
        <div className="max-w-[calc(100%-5rem)]">
          <h3 className="text-white font-medium mb-2">
            {video.title}
          </h3>
          <p className="text-white/90 text-sm leading-relaxed line-clamp-2">
            {video.prompt}
          </p>
          <div className="flex items-center gap-4 mt-3 text-white/80 text-xs">
            <span>{video.duration}秒</span>
            <span>•</span>
            <span>{new Date(video.createdAt).toLocaleDateString('zh-CN')}</span>
          </div>
        </div>
      </div>

      {/* 删除确认对话框 */}
      {showDeleteDialog && (
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] px-6"
        >
          <div 
            className="w-full max-w-[280px] bg-[#1c1c1e] rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* 图标和标题 */}
            <div className="pt-6 pb-4 px-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                删除视频
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                确认要删除这个视频吗？<br />删除后将无法恢复
              </p>
            </div>

            {/* 按钮组 */}
            <div className="border-t border-gray-700/50">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="w-full py-3.5 text-blue-500 font-medium hover:bg-white/5 transition-colors border-b border-gray-700/50"
              >
                取消
              </button>
              <button
                onClick={handleConfirmDelete}
                className="w-full py-3.5 text-red-500 font-semibold hover:bg-white/5 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 发布确认对话框 - 改为底部抽屉样式 (Absolute定位在播放器内部) */}
      {showPublishDialog && (
        <>
          {/* 背景遮罩 */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={() => setShowPublishDialog(false)}
          />
          
          {/* 底部抽屉 */}
          <div 
            className="absolute inset-x-0 bottom-0 z-[61] bg-[#1c1c1e] rounded-t-3xl overflow-hidden flex flex-col max-h-[85%] animate-slideInFromBottom"
          >
            {/* 标题栏 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
              <h3 className="text-lg font-semibold text-white">发布作品</h3>
              <button 
                onClick={() => setShowPublishDialog(false)}
                className="p-2 -mr-2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 表单内容 - 可滚动 */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1">
              {/* 标题输入 */}
              <div className="space-y-2">
                <label className="text-sm text-gray-400">作品标题</label>
                <input
                  type="text"
                  value={publishTitle}
                  onChange={(e) => setPublishTitle(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[var(--color-primary)]"
                  placeholder="给你的作品起个名字..."
                />
              </div>

              {/* 描述输入 */}
              <div className="space-y-2">
                <label className="text-sm text-gray-400">作品描述 / 提示词</label>
                <textarea
                  value={publishDesc}
                  onChange={(e) => setPublishDesc(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white h-24 resize-none focus:outline-none focus:border-[var(--color-primary)]"
                  placeholder="描述一下你的作品..."
                />
              </div>

              {/* 开关选项 */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm text-white">公开提示词</span>
                    <span className="text-xs text-gray-500">允许他人查看使用的提示词</span>
                  </div>
                  <button 
                    onClick={() => setIsPromptPublic(!isPromptPublic)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${isPromptPublic ? 'bg-green-500' : 'bg-gray-600'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isPromptPublic ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                {!isPromptPublic && (
                   <div className="flex items-center justify-between pl-4 border-l-2 border-gray-700">
                    <div className="flex flex-col">
                      <span className="text-sm text-white">解锁费用 (积分)</span>
                      <span className="text-xs text-gray-500">他人查看提示词需支付</span>
                    </div>
                    <input
                      type="number"
                      value={unlockCost}
                      onChange={(e) => setUnlockCost(Number(e.target.value))}
                      className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white text-right focus:outline-none focus:border-[var(--color-primary)]"
                      min="0"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm text-white">允许二创 (Remix)</span>
                    <span className="text-xs text-gray-500">允许他人基于此作品创作</span>
                  </div>
                  <button 
                    onClick={() => setAllowRemix(!allowRemix)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${allowRemix ? 'bg-green-500' : 'bg-gray-600'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${allowRemix ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* 按钮组 */}
            <div className="border-t border-gray-800 p-4 flex gap-3 bg-[#1c1c1e] safe-area-bottom">
              <button
                onClick={() => setShowPublishDialog(false)}
                className="flex-1 py-3 rounded-xl bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors"
                disabled={isPublishing}
              >
                取消
              </button>
              <button
                onClick={handleConfirmPublish}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center"
                disabled={isPublishing}
              >
                {isPublishing ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    发布中...
                  </>
                ) : '确认发布'}
              </button>
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  );
}

/**
 * 删除视频确认对话框组件
 */
interface DeleteVideoDialogProps {
  videoId: string;
  onClose: () => void;
  onDeleteSuccess?: () => void;
}

function DeleteVideoDialog({ videoId, onClose, onDeleteSuccess }: DeleteVideoDialogProps) {
  const handleDelete = () => {
    if (confirm('确认删除这个视频吗？\n\n删除后将无法恢复')) {
      deleteLocalVideo(videoId);
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
        onClose();
      }, 2000);
    }
  };

  const [showSuccess, setShowSuccess] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-[90%] max-w-md bg-[var(--color-surface)] rounded-2xl p-8 text-center">
        {/* 删除图标 */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>

        <h3 className="text-xl font-medium text-[var(--color-text-primary)] mb-3">
          确认删除？
        </h3>

        <div className="space-y-2 mb-6">
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            删除后将无法恢复
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated-hover)] transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            删除
          </button>
        </div>

        {/* 删除成功提示 */}
        {showSuccess && (
          <div className="mt-4">
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              视频已删除
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
