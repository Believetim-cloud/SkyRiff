import { useEffect, useState } from 'react';
import { ShortVideoPlayer } from './ShortVideoPlayer';
import { getRecommendedVideos, initializeSampleVideos } from '../services/video-pool';
import { getWorksFeed, Work } from '../services/backend-api';
import type { PublishedVideo } from '../services/video-pool';
import { Loader } from 'lucide-react';

interface DiscoverPageProps {
  onUserClick: (userId: string) => void;
  feedType?: 'discover' | 'hot' | 'following';
}

export function DiscoverPage({ onUserClick, feedType = 'discover' }: DiscoverPageProps) {
  const [videos, setVideos] = useState<PublishedVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeed();
  }, [feedType]);

  const loadFeed = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 尝试从后端获取真实数据
      const response = await getWorksFeed(feedType);
      if (response.code === 200 && response.data.items.length > 0) {
        const adaptedVideos = response.data.items.map(adaptWorkToPublishedVideo);
        setVideos(adaptedVideos);
      } else {
        // 如果没有数据或后端未就绪，回退到本地模拟数据
        console.log('使用本地模拟数据');
        loadMockData();
      }
    } catch (err) {
      console.warn('获取Feed失败, 回退到模拟数据:', err);
      // 失败时也回退到模拟数据，保证演示效果
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockData = () => {
    initializeSampleVideos();
    const recommendedVideos = getRecommendedVideos(20);
    setVideos(recommendedVideos);
  };

  const adaptWorkToPublishedVideo = (work: Work): PublishedVideo => ({
    id: work.work_id.toString(),
    taskId: work.video_id.toString(),
    title: work.title,
    prompt: work.description || work.title, // Use description as prompt fallback
    model: 'sora-2.0',
    status: 'success',
    progress: 100,
    videoUrl: work.video_url,
    thumbnailUrl: work.cover_url,
    createdAt: new Date(work.created_at).getTime(),
    duration: work.duration_sec,
    orientation: work.ratio === '9:16' ? 'portrait' : 'landscape',
    quality: 'hd',
    size: '1080p',
    publishedAt: new Date(work.created_at).getTime(),
    views: work.view_count,
    likes: work.like_count,
    comments: work.comment_count,
    shares: work.share_count,
    rewards: 0, 
    author: {
      id: work.author.user_id.toString(),
      name: work.author.nickname,
      avatar: work.author.avatar_url
    },
    description: work.description,
    tags: []
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        <Loader className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-black text-white">
        <div className="text-center">
          <p className="mb-2">暂无推荐视频</p>
          <p className="text-sm text-white/70">去创作页生成视频并发布吧！</p>
        </div>
      </div>
    );
  }

  return (
    <ShortVideoPlayer
      videos={videos}
      onUserClick={onUserClick}
    />
  );
}