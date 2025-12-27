/**
 * 创作画廊视图 - 灵感和创意展示
 */

import { Sparkles, Upload, Wand2, Star } from 'lucide-react';

interface GalleryViewProps {
  onCreateNew: () => void;
}

export function GalleryView({ onCreateNew }: GalleryViewProps) {
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
