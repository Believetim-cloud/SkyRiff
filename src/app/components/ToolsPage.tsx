import { Sparkles, Film, Layout, Star, ArrowRight, Zap, Palette } from 'lucide-react';
import { useState } from 'react';
import { StoryboardPage } from './StoryboardPage';
import { VideoGenerator } from './VideoGenerator';
import { GalleryView } from './GalleryView';

export function ToolsPage() {
  const [showStoryboard, setShowStoryboard] = useState(false);
  const [showVideoGenerator, setShowVideoGenerator] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  if (showStoryboard) {
    return <StoryboardPage onBack={() => setShowStoryboard(false)} />;
  }

  if (showVideoGenerator) {
    return (
      <VideoGenerator
        onClose={() => setShowVideoGenerator(false)}
        initialMode="text"
      />
    );
  }

  if (showGallery) {
    return (
      <div className="flex flex-col h-full bg-[var(--color-background)]">
        <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
          <button
            onClick={() => setShowGallery(false)}
            className="text-[var(--color-primary)] text-sm"
          >
            返回
          </button>
          <h2 className="text-[var(--color-text-primary)]">创作精彩作品</h2>
          <div className="w-12"></div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <GalleryView 
            onCreateNew={() => {
              setShowGallery(false);
              setShowVideoGenerator(true);
            }} 
          />
        </div>
      </div>
    );
  }

  const tools = [
    {
      id: 'video-generation',
      title: 'AI视频生成',
      description: '使用AI快速生成精彩视频',
      icon: Sparkles,
      badge: '热门',
      bgImage: 'https://images.unsplash.com/photo-1690041066826-6284d0745a87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaSUyMHZpZGVvJTIwZ2VuZXJhdGlvbiUyMGFic3RyYWN0fGVufDF8fHx8MTc2NjQxMjAyNnww&ixlib=rb-4.1.0&q=80&w=1080',
      gradient: 'from-purple-600/90 to-pink-600/90',
      glowColor: 'shadow-purple-500/50',
      onClick: () => setShowVideoGenerator(true),
    },
    {
      id: 'extend-shots',
      title: '扩展分镜',
      description: '延长视频时长，扩展更多内容',
      icon: Film,
      badge: '专业',
      bgImage: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWRlbyUyMGVkaXRpbmclMjB0aW1lbGluZXxlbnwxfHx8fDE3NjYzMDAyODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      gradient: 'from-blue-600/90 to-cyan-600/90',
      glowColor: 'shadow-blue-500/50',
      onClick: () => {},
    },
    {
      id: 'storyboard',
      title: '故事版',
      description: '制作专业的视频故事版',
      icon: Layout,
      badge: '精选',
      bgImage: 'https://images.unsplash.com/photo-1539598809342-2a8cb7a1d2ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9yeWJvYXJkJTIwYW5pbWF0aW9uJTIwZnJhbWVzfGVufDF8fHx8MTc2NjQxMjAyN3ww&ixlib=rb-4.1.0&q=80&w=1080',
      gradient: 'from-orange-600/90 to-red-600/90',
      glowColor: 'shadow-orange-500/50',
      onClick: () => setShowStoryboard(true),
    },
    {
      id: 'gallery',
      title: '创作精彩作品',
      description: '探索灵感，创造专业级视频',
      icon: Star,
      badge: '灵感',
      bgImage: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=600&fit=crop',
      gradient: 'from-yellow-600/90 to-orange-600/90',
      glowColor: 'shadow-yellow-500/50',
      onClick: () => setShowGallery(true),
    },
  ];

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 pb-6">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 backdrop-blur-xl">{/* 添加磨砂效果 */}
        <h1 className="text-white text-2xl mb-2">AI工具箱</h1>
        <p className="text-[var(--color-text-secondary)] text-sm">探索强大的AI视频创作工具</p>
      </div>

      {/* Tool Cards - 左右边距40px, 卡片间距50px */}
      <div style={{ paddingLeft: '40px', paddingRight: '40px' }}>
        {tools.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={tool.onClick}
              className={`relative w-full rounded-3xl overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:scale-[0.98] shadow-xl ${tool.glowColor} hover:z-10`}
              style={{
                animationDelay: `${index * 100}ms`,
                height: '180px',
                marginBottom: index < tools.length - 1 ? '50px' : '0',
              }}
            >
              {/* Background Image with Parallax Effect */}
              <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                <img
                  src={tool.bgImage}
                  alt={tool.title}
                  className="w-full h-full object-cover"
                />
                {/* Multi-layer Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} mix-blend-multiply`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-black/20" />
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {/* Badge */}
                <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
                  <span className="text-white text-xs font-medium">{tool.badge}</span>
                </div>
                {/* Arrow Icon */}
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center transition-transform group-hover:translate-x-1">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-6 text-left">
                {/* Icon Container */}
                <div className="mb-4 inline-flex">
                  <div className="p-3.5 rounded-2xl bg-white/25 backdrop-blur-md border border-white/30 shadow-lg transition-all group-hover:bg-white/35 group-hover:scale-110">
                    <Icon className="w-8 h-8 text-white drop-shadow-lg" />
                  </div>
                </div>
                
                {/* Title */}
                <h3 className="text-white text-2xl font-bold mb-2 drop-shadow-lg tracking-tight">
                  {tool.title}
                </h3>
                
                {/* Description */}
                <p className="text-white/95 text-sm leading-relaxed drop-shadow-md">
                  {tool.description}
                </p>
              </div>

              {/* Shine Effect on Hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full" 
                   style={{ transition: 'transform 1s ease-in-out' }} />
              
              {/* Border Glow */}
              <div className="absolute inset-0 rounded-3xl border border-white/0 group-hover:border-white/20 transition-all duration-300" />
            </button>
          );
        })}
      </div>
    </div>
  );
}