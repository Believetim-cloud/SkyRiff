import { useState, useEffect, useRef } from 'react';
import { Heart, Gift, TrendingUp, Flame, Trophy, RefreshCw } from 'lucide-react';
import { DiscoverPage } from './DiscoverPage';
import { UserProfilePage } from './UserProfilePage';
import { RankingPage } from './RankingPage';
import { ShortVideoPlayer } from './ShortVideoPlayer';
import { getHotVideos, initializeSampleVideos, clearVideoPool } from '../services/video-pool';
import { getWorksFeed, Work } from '../services/backend-api';
import type { PublishedVideo } from '../services/video-pool';
import { HotVideoCard } from './HotVideoCard';

export function HomePage() {
  const [activeTab, setActiveTab] = useState<'discover' | 'hot' | 'ranking'>('discover');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [hotVideos, setHotVideos] = useState<PublishedVideo[]>([]);
  const [isPlayingHotVideo, setIsPlayingHotVideo] = useState(false);
  const [hotVideoIndex, setHotVideoIndex] = useState(0);

  useEffect(() => {
    // 初始化示例视频 (keep for backup)
    initializeSampleVideos();
    
    // 初始加载热门视频
    loadHotVideos();
  }, []);

  // 切换到热门页时重新加载
  useEffect(() => {
    if (activeTab === 'hot') {
      loadHotVideos();
    }
  }, [activeTab]);

  const loadHotVideos = async () => {
    try {
      const response = await getWorksFeed('hot');
      if (response.code === 200 && response.data.items.length > 0) {
        const adapted = response.data.items.map(adaptWorkToPublishedVideo);
        setHotVideos(adapted);
      } else {
         const videos = getHotVideos(20);
         setHotVideos(videos);
      }
    } catch (e) {
      console.warn('Failed to load hot videos, falling back to mock:', e);
      const videos = getHotVideos(20);
      setHotVideos(videos);
    }
  };

  const adaptWorkToPublishedVideo = (work: Work): PublishedVideo => ({
    id: work.work_id.toString(),
    taskId: work.video_id.toString(),
    title: work.title,
    prompt: work.description || work.title,
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

  const handleResetData = () => {
    if (confirm('确定要重置所有示例视频吗？这将清除所有已发布的视频！')) {
      clearVideoPool();
      initializeSampleVideos();
      loadHotVideos();
      alert('✅ 已重置为10个示例视频！');
    }
  };

  // If viewing a user profile, render that instead
  if (selectedUserId) {
    return (
      <UserProfilePage
        userId={selectedUserId}
        onBack={() => setSelectedUserId(null)}
      />
    );
  }

  // 如果正在全屏播放热门视频
  if (isPlayingHotVideo) {
    return (
      <div className="h-full bg-black">
        <ShortVideoPlayer
          videos={hotVideos}
          initialIndex={hotVideoIndex}
          onUserClick={(userId) => {
            setIsPlayingHotVideo(false);
            setSelectedUserId(userId);
          }}
          onBack={() => setIsPlayingHotVideo(false)}
        />
      </div>
    );
  }

  const toggleLike = (id: string) => {
    setHotVideos(hotVideos.map(v => 
      v.id === id ? { ...v, likes: v.likes + (Math.random() > 0.5 ? 1 : -1) } : v
    ));
  };

  const toggleFollow = (id: string) => {
    setHotVideos(hotVideos.map(v => 
      v.id === id ? { ...v, author: { ...v.author, isFollowing: !v.author.isFollowing } } : v
    ));
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950">
      {/* Top Tabs */}
      <div className="flex items-center justify-center gap-12 px-6 py-6 bg-black/30 backdrop-blur-xl sticky top-0 z-10 border-b border-white/5">{/* 磨砂效果 */}
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex items-center gap-6 px-12 py-6 rounded-lg transition-all text-lg ${ /* 3x: gap-2→gap-6, px-4→px-12, py-2→py-6, 增加text-lg */
            activeTab === 'discover'
              ? 'bg-[var(--color-primary)] text-white'
              : 'text-[var(--color-text-secondary)]'
          }`}
        >
          <TrendingUp className="w-12 h-12" /> {/* 3x: w-4 h-4 → w-12 h-12 */}
          发现
        </button>
        <button
          onClick={() => setActiveTab('hot')}
          className={`flex items-center gap-6 px-12 py-6 rounded-lg transition-all text-lg ${ /* 3x: gap-2→gap-6, px-4→px-12, py-2→py-6, 增加text-lg */
            activeTab === 'hot'
              ? 'bg-[var(--color-primary)] text-white'
              : 'text-[var(--color-text-secondary)]'
          }`}
        >
          <Flame className="w-12 h-12" /> {/* 3x: w-4 h-4 → w-12 h-12 */}
          热门
        </button>
        <button
          onClick={() => setActiveTab('ranking')}
          className={`flex items-center gap-6 px-12 py-6 rounded-lg transition-all text-lg ${ /* 3x: gap-2→gap-6, px-4→px-12, py-2→py-6, 增加text-lg */
            activeTab === 'ranking'
              ? 'bg-[var(--color-primary)] text-white'
              : 'text-[var(--color-text-secondary)]'
          }`}
        >
          <Trophy className="w-12 h-12" /> {/* 3x: w-4 h-4 → w-12 h-12 */}
          排行
        </button>
      </div>

      {/* Render discover tab as full-screen video */}
      {activeTab === 'discover' && (
        <div className="flex-1 overflow-hidden">
          <DiscoverPage onUserClick={(userId) => setSelectedUserId(userId)} />
        </div>
      )}

      {/* Hot tab shows grid view */}
      {activeTab === 'hot' && (
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* 调试信息 */}
          <div className="mb-3 px-2">
            <p className="text-xs text-[var(--color-text-secondary)]">
              共 {hotVideos.length} 个热门视频
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 pb-20">
            {hotVideos.map((video, index) => (
              <HotVideoCard
                key={video.id}
                video={video}
                index={index}
                onPlay={(idx) => {
                  setHotVideoIndex(idx);
                  setIsPlayingHotVideo(true);
                }}
                onLike={() => toggleLike(video.id)}
                onUserClick={() => setSelectedUserId(video.author.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Ranking tab shows ranking page */}
      {activeTab === 'ranking' && (
        <div className="flex-1 overflow-hidden">
          <RankingPage />
        </div>
      )}
    </div>
  );
}