/**
 * 热门视频卡片
 * 支持悬停播放预览
 */

import { useState, useRef } from 'react';
import { Heart, Gift, Play } from 'lucide-react';
import type { PublishedVideo } from '../services/video-pool';

interface HotVideoCardProps {
  video: PublishedVideo;
  index: number;
  onPlay: (index: number) => void;
  onLike: () => void;
  onUserClick: () => void;
}

export function HotVideoCard({ video, index, onPlay, onLike, onUserClick }: HotVideoCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (videoRef.current) {
      videoRef.current.play().catch(err => console.log('播放失败:', err));
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}w`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <div
      className="relative rounded-[var(--radius-card)] overflow-hidden bg-[var(--color-surface)] group cursor-pointer"
      onClick={() => onPlay(index)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Video Cover */}
      <div className="aspect-[9/16] relative bg-black">
        {/* 缩略图背景 */}
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* 视频层（悬停时播放） */}
        <video
          ref={videoRef}
          src={video.videoUrl}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity ${
            isHovering ? 'opacity-100' : 'opacity-0'
          }`}
          loop
          muted
          playsInline
          preload="metadata"
        />
        
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        
        {/* 播放图标 - 不悬停时显示 */}
        {!isHovering && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-7 h-7 text-white fill-white ml-1" />
            </div>
          </div>
        )}
        
        {/* 悬停提示 */}
        {isHovering && (
          <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] animate-pulse">
            <span className="text-xs text-white font-medium">● 播放中</span>
          </div>
        )}
        
        {/* 底部信息 */}
        <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
          {/* 标题 */}
          <h3 className="text-white font-medium line-clamp-2 mb-2 drop-shadow-lg">
            {video.title}
          </h3>
          
          {/* Stats */}
          <div className="flex items-center justify-between">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike();
              }}
              className="flex items-center gap-1.5 text-white hover:scale-110 transition-transform"
            >
              <Heart className="w-4 h-4 fill-red-500 text-red-500 drop-shadow-lg" />
              <span className="text-xs font-medium drop-shadow-lg">{formatNumber(video.likes)}</span>
            </button>
            <button 
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-white"
            >
              <Gift className="w-4 h-4 text-yellow-400 drop-shadow-lg" />
              <span className="text-xs font-medium drop-shadow-lg">{formatNumber(video.rewards)}</span>
            </button>
          </div>
          
          {/* Author */}
          <div className="flex items-center gap-2 pt-1.5 border-t border-white/10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUserClick();
              }}
              className="flex items-center gap-2 flex-1 min-w-0"
            >
              <img
                src={video.author.avatar}
                alt={video.author.name}
                className="w-6 h-6 rounded-full border-2 border-white/50 flex-shrink-0 drop-shadow-lg"
              />
              <span className="text-xs text-white/95 font-medium truncate drop-shadow-lg">
                {video.author.name}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}