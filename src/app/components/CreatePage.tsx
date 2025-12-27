import { VideoGenerator } from './VideoGenerator';

export function CreatePage() {
  // 创作Tab现在只是一个占位页面
  // 实际的创作功能通过全局模态弹窗实现
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950">
      {/* Header */}
      <div className="px-4 py-3 bg-black/30 backdrop-blur-xl border-b border-white/5">
        <h1 className="text-[var(--color-text-primary)] text-lg">创作中心</h1>
      </div>
      <div className="flex items-center justify-center h-full">{/* 移除重复背景 */}
        <div className="text-center px-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl text-[var(--color-text-primary)] mb-2">开始创作</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            点击下方的创作按钮开始生成AI视频
          </p>
        </div>
      </div>
    </div>
  );
}