/**
 * 全屏短视频播放器
 * 支持上下滑动切换视频
 */

import { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Gift, MoreVertical, Volume2, VolumeX, ArrowLeft, Play, Pause } from 'lucide-react';
import type { PublishedVideo } from '../services/video-pool';
import { recordInteraction, updateVideoStats } from '../services/video-pool';

interface ShortVideoPlayerProps {
  videos: PublishedVideo[];
  initialIndex?: number;
  onUserClick?: (userId: string) => void;
  onBack?: () => void; // 返回按钮回调
}

export function ShortVideoPlayer({ videos, initialIndex = 0, onUserClick, onBack }: ShortVideoPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoStartTime = useRef<number>(Date.now());

  const currentVideo = videos[currentIndex];

  // 记录观看
  useEffect(() => {
    if (currentVideo) {
      videoStartTime.current = Date.now();
      
      recordInteraction({
        videoId: currentVideo.id,
        type: 'view',
        timestamp: Date.now(),
      });

      updateVideoStats(currentVideo.id, {
        views: currentVideo.views + 1,
      });
    }
  }, [currentIndex, currentVideo]);

  // 键盘控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        handlePrevious();
      } else if (e.key === 'ArrowDown') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, videos.length]);

  const handleNext = () => {
    if (currentIndex < videos.length - 1) {
      recordWatchTime();
      setCurrentIndex(currentIndex + 1);
      setIsLiked(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      recordWatchTime();
      setCurrentIndex(currentIndex - 1);
      setIsLiked(false);
    }
  };

  const recordWatchTime = () => {
    const watchTime = (Date.now() - videoStartTime.current) / 1000;
    recordInteraction({
      videoId: currentVideo.id,
      type: watchTime < currentVideo.duration * 0.3 ? 'skip' : 'view',
      timestamp: Date.now(),
      watchTime,
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // 向上滑动
      handleNext();
    }

    if (touchEnd - touchStart > 50) {
      // 向下滑动
      handlePrevious();
    }
  };

  const handleLike = () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);

    if (newLiked) {
      recordInteraction({
        videoId: currentVideo.id,
        type: 'like',
        timestamp: Date.now(),
      });

      updateVideoStats(currentVideo.id, {
        likes: currentVideo.likes + 1,
      });
    } else {
      updateVideoStats(currentVideo.id, {
        likes: Math.max(0, currentVideo.likes - 1),
      });
    }
  };

  const handleShare = () => {
    recordInteraction({
      videoId: currentVideo.id,
      type: 'share',
      timestamp: Date.now(),
    });

    updateVideoStats(currentVideo.id, {
      shares: currentVideo.shares + 1,
    });

    // 复制链接
    navigator.clipboard.writeText(`SkyRiff视频: ${currentVideo.title}`);
    alert('链接已复制！');
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

  const formatNumber = (num: number): string => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}w`;
    }
    return num.toString();
  };

  if (!currentVideo) {
    return (
      <div className="flex items-center justify-center h-full bg-black text-white">
        暂无视频
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 视频播放器 */}
      <video
        key={currentVideo.id}
        src={currentVideo.videoUrl}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted={isMuted}
        playsInline
        ref={videoRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={handleVideoClick}
      />

      {/* 渐变遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

      {/* 顶部信息 */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
        <div className="text-white text-sm">
          {currentIndex + 1} / {videos.length}
        </div>
      </div>

      {/* 右侧互动按钮 */}
      <div className="absolute right-4 bottom-24 flex flex-col gap-6 z-10">
        {/* 作者头像 */}
        <button
          onClick={() => onUserClick?.(currentVideo.author.id)}
          className="relative"
        >
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white">
            <img
              src={currentVideo.author.avatar}
              alt={currentVideo.author.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white text-xs">
            +
          </div>
        </button>

        {/* 点赞 */}
        <button
          onClick={handleLike}
          className="flex flex-col items-center gap-1"
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            isLiked 
              ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]' 
              : 'bg-black/30 backdrop-blur-sm'
          }`}>
            <Heart
              className={`w-6 h-6 transition-all ${
                isLiked ? 'fill-white text-white scale-110' : 'text-white'
              }`}
            />
          </div>
          <span className="text-white text-xs">{formatNumber(currentVideo.likes)}</span>
        </button>

        {/* 评论 */}
        <button className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs">{formatNumber(currentVideo.comments)}</span>
        </button>

        {/* 分享 */}
        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs">{formatNumber(currentVideo.shares)}</span>
        </button>

        {/* 打赏 */}
        <button className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs">{formatNumber(currentVideo.rewards)}</span>
        </button>

        {/* 音量 */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
            {isMuted ? (
              <VolumeX className="w-6 h-6 text-white" />
            ) : (
              <Volume2 className="w-6 h-6 text-white" />
            )}
          </div>
        </button>
      </div>

      {/* 底部信息 */}
      <div className="absolute left-4 right-20 bottom-24 z-10">
        {/* 作者信息 */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => onUserClick?.(currentVideo.author.id)}
            className="text-white font-medium"
          >
            @{currentVideo.author.name}
          </button>
          <button className="px-3 py-1 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white text-xs">
            关注
          </button>
        </div>

        {/* 标题 */}
        <h3 className="text-white font-medium mb-2">
          {currentVideo.title}
        </h3>

        {/* 描述 */}
        {currentVideo.description && (
          <p className="text-white/90 text-sm mb-2 line-clamp-2">
            {currentVideo.description}
          </p>
        )}

        {/* 提示词 */}
        <p className="text-white/70 text-sm mb-2 line-clamp-2">
          {currentVideo.prompt}
        </p>

        {/* 标签 */}
        {currentVideo.tags && currentVideo.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {currentVideo.tags.map((tag, index) => (
              <span
                key={index}
                className="text-white text-xs px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 滑动提示 */}
      {currentIndex === 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="text-white text-center bg-black/50 backdrop-blur-sm px-6 py-3 rounded-2xl animate-bounce">
            <p className="text-sm">👆 向上滑动看下一个</p>
            <p className="text-xs text-white/70 mt-1">或使用键盘 ↑↓ 方向键</p>
          </div>
        </div>
      )}

      {/* 暂停/播放图标 */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-10 h-10 text-white fill-white ml-1" />
          </div>
        </div>
      )}

      {/* 返回按钮 */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}