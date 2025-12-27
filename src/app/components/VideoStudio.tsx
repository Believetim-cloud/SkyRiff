/**
 * AI视频工作室 - 主功能页面
 * 集成所有视频生成和管理功能
 */

import { useState } from 'react';
import { Sparkles, Image, FolderOpen, Star, ArrowLeft, Wand2, Upload, Link as LinkIcon, Video } from 'lucide-react';
import { VideoGenerator } from './VideoGenerator';
import { AssetsPage } from './AssetsPage';

type ViewType = 'home' | 'text-to-video' | 'image-to-video' | 'assets' | 'gallery';

interface FeatureCard {
  id: ViewType;
  title: string;
  description: string;
  icon: typeof Sparkles;
  gradient: string;
  bgImage: string;
  badge?: string;
}

export function VideoStudio() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [showVideoGenerator, setShowVideoGenerator] = useState(false);
  const [generatorMode, setGeneratorMode] = useState<'text' | 'image'>('text');

  const features: FeatureCard[] = [
    {
      id: 'text-to-video',
      title: '🎬 生成AI视频',
      description: '输入文字描述，AI为你创造精彩视频',
      icon: Sparkles,
      gradient: 'from-purple-600/90 to-pink-600/90',
      bgImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop',
      badge: '最受欢迎',
    },
    {
      id: 'image-to-video',
      title: '📸 图片转视频',
      description: '上传图片，让静态画面动起来',
      icon: Image,
      gradient: 'from-blue-600/90 to-cyan-600/90',
      bgImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop',
      badge: '强大功能',
    },
    {
      id: 'assets',
      title: '📁 管理视频资产',
      description: '查看和管理所有生成的视频',
      icon: FolderOpen,
      gradient: 'from-green-600/90 to-emerald-600/90',
      bgImage: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&h=600&fit=crop',
    },
    {
      id: 'gallery',
      title: '✨ 创作精彩作品',
      description: '探索灵感，创造专业级视频',
      icon: Star,
      gradient: 'from-orange-600/90 to-red-600/90',
      bgImage: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=600&fit=crop',
      badge: 'Pro',
    },
  ];

  const handleFeatureClick = (featureId: ViewType) => {
    if (featureId === 'text-to-video') {
      setGeneratorMode('text');
      setShowVideoGenerator(true);
    } else if (featureId === 'image-to-video') {
      setGeneratorMode('image');
      setShowVideoGenerator(true);
    } else if (featureId === 'assets') {
      setCurrentView('assets');
    } else if (featureId === 'gallery') {
      setCurrentView('gallery');
    }
  };

  // 如果显示视频生成器
  if (showVideoGenerator) {
    return (
      <VideoGenerator
        onClose={() => setShowVideoGenerator(false)}
        initialMode={generatorMode}
        onVideoGenerated={() => {
          // 视频生成后，不关闭弹窗，让用户可以继续生成
          // setShowVideoGenerator(false);
          // setCurrentView('assets');
        }}
      />
    );
  }

  // 如果显示资产页
  if (currentView === 'assets') {
    return (
      <div className="flex flex-col h-full bg-[var(--color-background)]">
        <div className="flex items-center gap-3 px-4 py-3 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
          <button
            onClick={() => setCurrentView('home')}
            className="p-2 rounded-lg hover:bg-[var(--color-surface-elevated)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--color-text-primary)]" />
          </button>
          <h2 className="text-[var(--color-text-primary)]">视频资产管理</h2>
        </div>
        <div className="flex-1 overflow-hidden">
          <AssetsPage />
        </div>
      </div>
    );
  }

  // 如果显示作品画廊
  if (currentView === 'gallery') {
    return (
      <div className="flex flex-col h-full bg-[var(--color-background)]">
        <div className="flex items-center gap-3 px-4 py-3 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
          <button
            onClick={() => setCurrentView('home')}
            className="p-2 rounded-lg hover:bg-[var(--color-surface-elevated)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--color-text-primary)]" />
          </button>
          <h2 className="text-[var(--color-text-primary)]">创作精彩作品</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <GalleryView onCreateNew={() => {
            setCurrentView('home');
            setGeneratorMode('text');
            setShowVideoGenerator(true);
          }} />
        </div>
      </div>
    );
  }

  // 主页视图
  return (
    <div className="h-full flex flex-col bg-[var(--color-background)] w-full max-w-screen overflow-hidden">
      {currentView === 'home' ? (
        <>
          {/* Header */}
          <div className="px-4 py-6 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)]">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                {/* 背景发光 */}
                <div className="absolute inset-0 rounded-2xl bg-white/30 blur-md"></div>
                
                {/* 主图标 */}
                <div className="relative">
                  <Video className="w-7 h-7 text-white relative z-10" />
                  {/* 小装饰 */}
                  <Sparkles className="w-3 h-3 text-yellow-300 absolute -top-0.5 -right-0.5 animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-white text-xl font-bold">AI创作中心</h1>
                <p className="text-white/80 text-sm">创造属于你的精彩内容</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="px-4 py-4 bg-[var(--color-surface)]">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl bg-[var(--color-background)]">
                <div className="text-2xl font-bold text-[var(--color-primary)]">8</div>
                <div className="text-xs text-[var(--color-text-secondary)] mt-1">可用模型</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-[var(--color-background)]">
                <div className="text-2xl font-bold text-[var(--color-secondary)]">0</div>
                <div className="text-xs text-[var(--color-text-secondary)] mt-1">生成的视频</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-[var(--color-background)]">
                <div className="text-2xl font-bold text-[var(--color-success)]">100%</div>
                <div className="text-xs text-[var(--color-text-secondary)] mt-1">功能就绪</div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[var(--color-text-primary)] font-medium">选择功能</h3>
              <span className="text-xs text-[var(--color-text-tertiary)]">滑动查看更多</span>
            </div>

            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <button
                  key={feature.id}
                  onClick={() => handleFeatureClick(feature.id)}
                  className="relative w-full h-48 rounded-3xl overflow-hidden group transition-transform active:scale-[0.98]"
                >
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <img
                      src={feature.bgImage}
                      alt={feature.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient}`} />
                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-black/20" />
                  </div>

                  {/* Badge */}
                  {feature.badge && (
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
                      <span className="text-xs text-white font-medium">{feature.badge}</span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="relative h-full flex flex-col justify-end p-6 text-left">
                    <div className="mb-4 inline-flex">
                      <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-white text-2xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-white/90 text-sm">{feature.description}</p>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                </button>
              );
            })}
          </div>

          {/* Bottom Tips */}
          <div className="px-4 py-3 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
            <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
              <Wand2 className="w-4 h-4" />
              <span>提示：点任意功能卡片开始创作</span>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

/**
 * 作品画廊视图
 */
function GalleryView({ onCreateNew }: { onCreateNew: () => void }) {
  const inspirations = [
    {
      id: 1,
      title: '梦幻星空',
      prompt: '璀璨的星空夜景，流星划过天际，银河清晰可见',
      thumbnail: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=600&fit=crop',
      model: 'sora2-portrait-15s',
    },
    {
      id: 2,
      title: '海浪日落',
      prompt: '金色日落下的海浪拍打沙滩，温暖的光线',
      thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=600&fit=crop',
      model: 'sora2-landscape-15s',
    },
    {
      id: 3,
      title: '森林小溪',
      prompt: '阳光透过树叶，清澈的小溪流水，宁静祥和',
      thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=600&fit=crop',
      model: 'sora2-portrait',
    },
    {
      id: 4,
      title: '城市夜景',
      prompt: '繁华都市的霓虹灯光，车流穿梭，充满未来感',
      thumbnail: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&h=600&fit=crop',
      model: 'sora2-landscape',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-[var(--color-text-primary)] text-xl mb-2">灵感画廊</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          参考这些创意，创造你自己的精彩作品
        </p>
      </div>

      {/* Create New Button */}
      <button
        onClick={onCreateNew}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
      >
        <Sparkles className="w-5 h-5" />
        <span className="font-medium">开始新的创作</span>
      </button>

      {/* Tips */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <Upload className="w-6 h-6 text-[var(--color-primary)] mb-2" />
          <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-1">上传图片</h4>
          <p className="text-xs text-[var(--color-text-secondary)]">让静态图片动起来</p>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <Wand2 className="w-6 h-6 text-[var(--color-secondary)] mb-2" />
          <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-1">AI生成</h4>
          <p className="text-xs text-[var(--color-text-secondary)]">文字变成视频</p>
        </div>
      </div>

      {/* Inspiration Gallery */}
      <div>
        <h3 className="text-[var(--color-text-primary)] font-medium mb-3">创意灵感</h3>
        <div className="grid grid-cols-2 gap-3">
          {inspirations.map((item) => (
            <button
              key={item.id}
              onClick={onCreateNew}
              className="text-left rounded-2xl overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors"
            >
              <div className="aspect-[9/16] relative">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h4 className="text-white font-medium text-sm mb-1">{item.title}</h4>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 mb-2">
                  {item.prompt}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                    点击使用
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Pro Tips */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
        <div className="flex items-start gap-3">
          <Star className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-[var(--color-text-primary)] font-medium mb-1">专业提示</h4>
            <ul className="text-xs text-[var(--color-text-secondary)] space-y-1">
              <li>• 提示词越详细，生成效果越好</li>
              <li>• Pro模型质量更高，但耗时更长</li>
              <li>• 避免真人和敏感内容</li>
              <li>• 建议先用标准模型预览</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}