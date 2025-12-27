/**
 * 视频池服务
 * 管理发布的视频和推荐算法
 */

import type { LocalVideo } from './api-types';

const VIDEO_POOL_KEY = 'skyriff_video_pool';
const USER_INTERACTIONS_KEY = 'skyriff_user_interactions';

export interface PublishedVideo extends LocalVideo {
  publishedAt: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  rewards: number;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  tags?: string[];
  description?: string;
}

export interface UserInteraction {
  videoId: string;
  type: 'view' | 'like' | 'comment' | 'share' | 'skip';
  timestamp: number;
  watchTime?: number; // 观看时长（秒）
}

/**
 * 获取视频池中的所有视频
 */
export function getVideoPool(): PublishedVideo[] {
  try {
    const data = localStorage.getItem(VIDEO_POOL_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('读取视频池失败:', error);
    return [];
  }
}

/**
 * 发布视频到视频池
 */
export function publishVideo(
  video: LocalVideo,
  description?: string,
  tags?: string[]
): PublishedVideo {
  const publishedVideo: PublishedVideo = {
    ...video,
    publishedAt: Date.now(),
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    rewards: 0,
    author: {
      id: 'current_user',
      name: '我',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    },
    description,
    tags,
  };

  const pool = getVideoPool();
  pool.unshift(publishedVideo); // 最新的放在前面
  
  try {
    localStorage.setItem(VIDEO_POOL_KEY, JSON.stringify(pool));
  } catch (error) {
    console.error('发布视频失败:', error);
  }

  return publishedVideo;
}

/**
 * 获取用户互动记录
 */
function getUserInteractions(): UserInteraction[] {
  try {
    const data = localStorage.getItem(USER_INTERACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('读取互动记录失败:', error);
    return [];
  }
}

/**
 * 记录用户互动
 */
export function recordInteraction(interaction: UserInteraction): void {
  const interactions = getUserInteractions();
  interactions.push(interaction);
  
  // 只保留最近1000条记录
  if (interactions.length > 1000) {
    interactions.splice(0, interactions.length - 1000);
  }
  
  try {
    localStorage.setItem(USER_INTERACTIONS_KEY, JSON.stringify(interactions));
  } catch (error) {
    console.error('记录互动失败:', error);
  }
}

/**
 * 更新视频统计数据
 */
export function updateVideoStats(
  videoId: string,
  updates: Partial<Pick<PublishedVideo, 'views' | 'likes' | 'comments' | 'shares' | 'rewards'>>
): void {
  const pool = getVideoPool();
  const video = pool.find(v => v.id === videoId);
  
  if (video) {
    Object.assign(video, updates);
    
    try {
      localStorage.setItem(VIDEO_POOL_KEY, JSON.stringify(pool));
    } catch (error) {
      console.error('更新视频统计失败:', error);
    }
  }
}

/**
 * 计算视频热度分数
 */
function calculateHotScore(video: PublishedVideo): number {
  const now = Date.now();
  const ageInHours = (now - video.publishedAt) / (1000 * 60 * 60);
  
  // 时间衰减因子（越新的视频权重越高）
  const timeDecay = Math.exp(-ageInHours / 24); // 24小时半衰期
  
  // 互动权重
  const interactionScore = 
    video.views * 1 +
    video.likes * 10 +
    video.comments * 15 +
    video.shares * 20 +
    video.rewards * 50;
  
  // 完播率估算（基于观看和互动比例）
  const completionRate = video.views > 0 
    ? Math.min((video.likes + video.comments) / video.views, 1) 
    : 0;
  
  return interactionScore * timeDecay * (1 + completionRate);
}

/**
 * 计算视频与用户兴趣的相关性
 */
function calculateRelevanceScore(video: PublishedVideo, userInteractions: UserInteraction[]): number {
  // 获取用户最近的互动
  const recentInteractions = userInteractions.slice(-50);
  
  // 用户喜欢的视频
  const likedVideoIds = new Set(
    recentInteractions
      .filter(i => i.type === 'like')
      .map(i => i.videoId)
  );
  
  // 用户跳过的视频
  const skippedVideoIds = new Set(
    recentInteractions
      .filter(i => i.type === 'skip')
      .map(i => i.videoId)
  );
  
  let score = 1.0;
  
  // 如果是同一作者的视频
  const authorVideos = recentInteractions.filter(i => 
    i.type === 'like' && likedVideoIds.has(i.videoId)
  );
  if (authorVideos.length > 0) {
    score *= 1.5; // 提升同作者视频的权重
  }
  
  // 如果用户曾跳过该视频，降低权重
  if (skippedVideoIds.has(video.id)) {
    score *= 0.1;
  }
  
  // 观看时长因子
  const avgWatchTime = recentInteractions
    .filter(i => i.watchTime !== undefined)
    .reduce((sum, i) => sum + (i.watchTime || 0), 0) / Math.max(recentInteractions.length, 1);
  
  if (avgWatchTime > video.duration * 0.7) {
    score *= 1.3; // 用户倾向于看完视频
  }
  
  return score;
}

/**
 * 获取推荐视频（发现页）
 */
export function getRecommendedVideos(limit: number = 20): PublishedVideo[] {
  const pool = getVideoPool();
  const interactions = getUserInteractions();
  
  // 已经看过的视频
  const viewedVideoIds = new Set(
    interactions
      .filter(i => i.type === 'view')
      .map(i => i.videoId)
  );
  
  // 过滤掉已看过的视频
  let candidates = pool.filter(v => !viewedVideoIds.has(v.id));
  
  // 如果候选视频不够，加入一些已看过的视频
  if (candidates.length < limit) {
    candidates = pool;
  }
  
  // 计算每个视频的推荐分数
  const scoredVideos = candidates.map(video => ({
    video,
    score: calculateRelevanceScore(video, interactions) * (0.8 + Math.random() * 0.4), // 加入随机性
  }));
  
  // 按分数排序
  scoredVideos.sort((a, b) => b.score - a.score);
  
  return scoredVideos.slice(0, limit).map(item => item.video);
}

/**
 * 获取热门视频
 */
export function getHotVideos(limit: number = 20): PublishedVideo[] {
  const pool = getVideoPool();
  
  // 计算热度分数
  const scoredVideos = pool.map(video => ({
    video,
    score: calculateHotScore(video),
  }));
  
  // 按热度排序
  scoredVideos.sort((a, b) => b.score - a.score);
  
  return scoredVideos.slice(0, limit).map(item => item.video);
}

/**
 * 获取排行榜视频
 */
export function getRankingVideos(
  type: 'likes' | 'views' | 'rewards' = 'likes',
  period: 'day' | 'week' | 'month' | 'all' = 'week',
  limit: number = 20
): PublishedVideo[] {
  const pool = getVideoPool();
  const now = Date.now();
  
  // 根据时间段过滤
  let periodMs = Infinity;
  if (period === 'day') periodMs = 24 * 60 * 60 * 1000;
  else if (period === 'week') periodMs = 7 * 24 * 60 * 60 * 1000;
  else if (period === 'month') periodMs = 30 * 24 * 60 * 60 * 1000;
  
  const filtered = pool.filter(v => now - v.publishedAt < periodMs);
  
  // 按指定类型排序
  filtered.sort((a, b) => b[type] - a[type]);
  
  return filtered.slice(0, limit);
}

/**
 * 搜索视频
 */
export function searchVideos(query: string): PublishedVideo[] {
  const pool = getVideoPool();
  const lowerQuery = query.toLowerCase();
  
  return pool.filter(video => 
    video.title.toLowerCase().includes(lowerQuery) ||
    video.prompt.toLowerCase().includes(lowerQuery) ||
    video.description?.toLowerCase().includes(lowerQuery) ||
    video.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * 初始化示例视频（首次使用时）
 */
export function initializeSampleVideos(): void {
  const pool = getVideoPool();
  
  // 检查是否有旧的视频（pexels.com 或 archive.org 或 googleapis）
  const hasOldVideos = pool.some(v => 
    v.videoUrl?.includes('pexels.com') || 
    v.videoUrl?.includes('archive.org') ||
    v.videoUrl?.includes('googleapis.com')
  );
  
  // 检查是否已有所有10个示例视频
  const hasSample10 = pool.some(v => v.id === 'sample_10');
  
  // 如果有旧视频，强制重新初始化
  if (hasOldVideos) {
    console.log('🔄 检测到旧视频数据，正在清理并重新初始化...');
  } else if (hasSample10) {
    return; // 已有完整的10个示例视频，且没有旧数据
  }
  
  // 清空旧数据并重新创建10个示例视频
  const sampleVideos: PublishedVideo[] = [
    {
      id: 'sample_1',
      taskId: 'sample_1',
      title: '星空下的梦想',
      prompt: '璀璨星空下，一个人站在山顶眺望远方，充满希望和梦想',
      model: 'sora-1.0-turbo',
      status: 'success',
      progress: 100,
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop',
      createdAt: Date.now() - 2 * 60 * 60 * 1000,
      completedAt: Date.now() - 2 * 60 * 60 * 1000,
      duration: 15,
      orientation: 'portrait',
      quality: 'pro',
      size: '720x1280',
      publishedAt: Date.now() - 2 * 60 * 60 * 1000,
      views: 12500,
      likes: 2340,
      comments: 156,
      shares: 89,
      rewards: 850,
      author: {
        id: 'creator_1',
        name: '星空创作者',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      },
      description: '用AI创作的星空主题视频，希望能给大家带来希望和力量',
      tags: ['星空', '梦想', '治愈'],
    },
    {
      id: 'sample_2',
      taskId: 'sample_2',
      title: '未来城市夜景',
      prompt: '赛博朋克风格的未来城市，霓虹灯闪烁，飞行器穿梭',
      model: 'sora-1.0-turbo',
      status: 'success',
      progress: 100,
      videoUrl: 'https://media.w3.org/2010/05/video/movie_300.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=600&fit=crop',
      createdAt: Date.now() - 5 * 60 * 60 * 1000,
      completedAt: Date.now() - 5 * 60 * 60 * 1000,
      duration: 10,
      orientation: 'portrait',
      quality: 'hd',
      size: '720x1280',
      publishedAt: Date.now() - 5 * 60 * 60 * 1000,
      views: 8900,
      likes: 1780,
      comments: 92,
      shares: 67,
      rewards: 520,
      author: {
        id: 'creator_2',
        name: 'AI艺术家',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      },
      description: '赛博朋克主题的城市夜景，充满科技感',
      tags: ['科幻', '城市', '赛博朋克'],
    },
    {
      id: 'sample_3',
      taskId: 'sample_3',
      title: '科技感宣传片',
      prompt: '高科技产品展示，粒子特效，未来感十足',
      model: 'sora-1.0-turbo-pro',
      status: 'success',
      progress: 100,
      videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=600&fit=crop',
      createdAt: Date.now() - 24 * 60 * 60 * 1000,
      completedAt: Date.now() - 24 * 60 * 60 * 1000,
      duration: 25,
      orientation: 'portrait',
      quality: 'pro',
      size: '720x1280',
      publishedAt: Date.now() - 24 * 60 * 60 * 1000,
      views: 15600,
      likes: 3120,
      comments: 234,
      shares: 156,
      rewards: 1200,
      author: {
        id: 'creator_3',
        name: '未来导演',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      },
      description: '使用最新AI技术创作的科技宣传片',
      tags: ['科技', '未来', '创意'],
    },
    {
      id: 'sample_4',
      taskId: 'sample_4',
      title: '梦幻森林探险',
      prompt: '神秘的魔法森林，发光的植物和飘舞的萤火虫',
      model: 'sora-1.0-turbo',
      status: 'success',
      progress: 100,
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=400&h=600&fit=crop',
      createdAt: Date.now() - 3 * 60 * 60 * 1000,
      completedAt: Date.now() - 3 * 60 * 60 * 1000,
      duration: 12,
      orientation: 'portrait',
      quality: 'hd',
      size: '720x1280',
      publishedAt: Date.now() - 3 * 60 * 60 * 1000,
      views: 9800,
      likes: 2150,
      comments: 145,
      shares: 78,
      rewards: 620,
      author: {
        id: 'creator_4',
        name: '魔法艺术家',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      },
      description: '走进魔法森林，感受大自然的神奇',
      tags: ['魔法', '森林', '梦幻'],
    },
    {
      id: 'sample_5',
      taskId: 'sample_5',
      title: '宇宙星际之旅',
      prompt: '穿越星际，探索遥远的星系和神秘的行星',
      model: 'sora-1.0-turbo-pro',
      status: 'success',
      progress: 100,
      videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=600&fit=crop',
      createdAt: Date.now() - 6 * 60 * 60 * 1000,
      completedAt: Date.now() - 6 * 60 * 60 * 1000,
      duration: 18,
      orientation: 'portrait',
      quality: 'pro',
      size: '720x1280',
      publishedAt: Date.now() - 6 * 60 * 60 * 1000,
      views: 18900,
      likes: 4230,
      comments: 312,
      shares: 198,
      rewards: 1560,
      author: {
        id: 'creator_5',
        name: '宇宙探索者',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      },
      description: '跟随我的镜头，一起探索宇宙的奥秘',
      tags: ['宇宙', '星际', '探索'],
    },
    {
      id: 'sample_6',
      taskId: 'sample_6',
      title: '海底世界奇遇',
      prompt: '五彩斑斓的珊瑚礁，神秘的海洋生物游弋',
      model: 'sora-1.0-turbo',
      status: 'success',
      progress: 100,
      videoUrl: 'https://media.w3.org/2010/05/video/movie_300.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=600&fit=crop',
      createdAt: Date.now() - 8 * 60 * 60 * 1000,
      completedAt: Date.now() - 8 * 60 * 60 * 1000,
      duration: 14,
      orientation: 'portrait',
      quality: 'hd',
      size: '720x1280',
      publishedAt: Date.now() - 8 * 60 * 60 * 1000,
      views: 11200,
      likes: 2680,
      comments: 178,
      shares: 92,
      rewards: 740,
      author: {
        id: 'creator_6',
        name: '深海潜水员',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      },
      description: '潜入深海，发现另一个奇妙的世界',
      tags: ['海洋', '珊瑚', '潜水'],
    },
    {
      id: 'sample_7',
      taskId: 'sample_7',
      title: '古城黄昏漫步',
      prompt: '夕阳下的古老城市，石板路和红砖墙诉说着历史',
      model: 'sora-1.0-turbo',
      status: 'success',
      progress: 100,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?w=400&h=600&fit=crop',
      createdAt: Date.now() - 12 * 60 * 60 * 1000,
      completedAt: Date.now() - 12 * 60 * 60 * 1000,
      duration: 16,
      orientation: 'portrait',
      quality: 'hd',
      size: '720x1280',
      publishedAt: Date.now() - 12 * 60 * 60 * 1000,
      views: 7650,
      likes: 1890,
      comments: 124,
      shares: 58,
      rewards: 480,
      author: {
        id: 'creator_7',
        name: '时光旅行者',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
      },
      description: '漫步古城，感受时光的流转',
      tags: ['古城', '历史', '黄昏'],
    },
    {
      id: 'sample_8',
      taskId: 'sample_8',
      title: '雪山日出奇观',
      prompt: '雪山之巅，日出的第一缕阳光照亮冰雪世界',
      model: 'sora-1.0-turbo-pro',
      status: 'success',
      progress: 100,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
      createdAt: Date.now() - 16 * 60 * 60 * 1000,
      completedAt: Date.now() - 16 * 60 * 60 * 1000,
      duration: 20,
      orientation: 'portrait',
      quality: 'pro',
      size: '720x1280',
      publishedAt: Date.now() - 16 * 60 * 60 * 1000,
      views: 13400,
      likes: 3450,
      comments: 267,
      shares: 145,
      rewards: 1120,
      author: {
        id: 'creator_8',
        name: '登山摄影师',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      },
      description: '凌晨4点的雪山，只为等待这一刻的震撼',
      tags: ['雪山', '日出', '壮观'],
    },
    {
      id: 'sample_9',
      taskId: 'sample_9',
      title: '雨夜霓虹街景',
      prompt: '雨后的城市街道，霓虹灯在水面上倒映出梦幻光影',
      model: 'sora-1.0-turbo',
      status: 'success',
      progress: 100,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1519682577862-22b62b24e493?w=400&h=600&fit=crop',
      createdAt: Date.now() - 20 * 60 * 60 * 1000,
      completedAt: Date.now() - 20 * 60 * 60 * 1000,
      duration: 13,
      orientation: 'portrait',
      quality: 'hd',
      size: '720x1280',
      publishedAt: Date.now() - 20 * 60 * 60 * 1000,
      views: 10800,
      likes: 2540,
      comments: 165,
      shares: 88,
      rewards: 690,
      author: {
        id: 'creator_9',
        name: '雨夜诗人',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      },
      description: '雨夜的城市，有着独特的浪漫',
      tags: ['雨夜', '霓虹', '城市'],
    },
    {
      id: 'sample_10',
      taskId: 'sample_10',
      title: '樱花飘落时刻',
      prompt: '春日樱花盛开，花瓣随风飘落，美如梦境',
      model: 'sora-1.0-turbo',
      status: 'success',
      progress: 100,
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=400&h=600&fit=crop',
      createdAt: Date.now() - 1 * 60 * 60 * 1000,
      completedAt: Date.now() - 1 * 60 * 60 * 1000,
      duration: 11,
      orientation: 'portrait',
      quality: 'hd',
      size: '720x1280',
      publishedAt: Date.now() - 1 * 60 * 60 * 1000,
      views: 16700,
      likes: 3980,
      comments: 289,
      shares: 167,
      rewards: 1340,
      author: {
        id: 'creator_10',
        name: '春日追梦人',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      },
      description: '樱花的美只有短暂的几周，要珍惜每一刻',
      tags: ['樱花', '春天', '浪漫'],
    },
  ];
  
  try {
    localStorage.setItem(VIDEO_POOL_KEY, JSON.stringify(sampleVideos));
    console.log('✅ 示例视频初始化完成');
  } catch (error) {
    console.error('初始化示例视频失败:', error);
  }
}

/**
 * 清空视频池
 */
export function clearVideoPool(): void {
  try {
    localStorage.removeItem(VIDEO_POOL_KEY);
    localStorage.removeItem(USER_INTERACTIONS_KEY);
  } catch (error) {
    console.error('清空视频池失败:', error);
  }
}