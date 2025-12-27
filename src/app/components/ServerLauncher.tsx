/**
 * 应用操作说明组件
 * 展示如何使用 SkyRiff 视频创作平台
 */

import { useState, useEffect } from 'react';
import { Sparkles, Video, Image, Folder, CheckCircle2, XCircle, Zap } from 'lucide-react';
import { API_CONFIG } from '../services/api-config';

interface ServerLauncherProps {
  onDismiss?: () => void;
}

export function ServerLauncher({ onDismiss }: ServerLauncherProps) {
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // 检测服务器状态
  const checkServerStatus = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000),
      });
      setServerStatus(response.ok ? 'online' : 'offline');
    } catch (error) {
      setServerStatus('offline');
    }
  };

  useEffect(() => {
    checkServerStatus();
    const interval = setInterval(checkServerStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  // 处理点击空白处关闭
  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  // 如果服务器在线，显示简洁提示
  if (serverStatus === 'online') {
    return (
      <div className="fixed top-4 right-4 z-50 bg-green-500/10 border border-green-500/30 rounded-2xl p-4 backdrop-blur-xl max-w-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-green-500 font-medium">服务器在线</h3>
            <p className="text-xs text-green-400/70 mt-0.5">
              {API_CONFIG.BASE_URL}
            </p>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-green-500/50 hover:text-green-500 text-2xl leading-none"
            >
              ×
            </button>
          )}
        </div>
      </div>
    );
  }

  // 服务器离线时显示操作说明
  return (
    <div 
      className="fixed inset-0 z-[100] bg-gradient-to-b from-purple-600 via-blue-600 to-indigo-700 flex flex-col items-center justify-center p-8 w-full max-w-[calc(100vh*9/16)] mx-auto left-0 right-0"
      onClick={handleDismiss} // 点击空白处关闭
    >
      <div 
        className="w-full max-w-2xl bg-[var(--color-background)] rounded-3xl overflow-hidden border border-[var(--color-border)] shadow-2xl"
        onClick={(e) => e.stopPropagation()} // 阻止事件冒泡，防止点击内容区域时关闭
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-white text-3xl font-bold mb-2">
            欢迎使用 SkyRiff
          </h1>
          <p className="text-white/80">
            AI 视频创作平台 · 让创意无限可能
          </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* 服务器状态 */}
          <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <XCircle className="w-5 h-5 text-amber-500" />
            <span className="text-amber-500 font-medium">
              服务器离线 · 当前为演示模式
            </span>
          </div>

          {/* 功能介绍 */}
          <div className="space-y-4">
            <h2 className="text-[var(--color-text-primary)] text-xl font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-[var(--color-primary)]" />
              核心功能
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {/* 生成AI视频 */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Video className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-purple-200 font-bold mb-1">1️⃣ 生成 AI 视频</h3>
                    <p className="text-purple-300/70 text-sm leading-relaxed">
                      输入文字描述，AI 自动生成精彩视频。支持自定义时长、分辨率和循环播放。
                    </p>
                  </div>
                </div>
              </div>

              {/* 图片转视频 */}
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Image className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-blue-200 font-bold mb-1">2️⃣ 图片转视频</h3>
                    <p className="text-blue-300/70 text-sm leading-relaxed">
                      上传图片，添加文字提示，让静态画面动起来。支持多种风格转换。
                    </p>
                  </div>
                </div>
              </div>

              {/* 管理视频资产 */}
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Folder className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-green-200 font-bold mb-1">3️⃣ 视频资产管理</h3>
                    <p className="text-green-300/70 text-sm leading-relaxed">
                      查看生成历史，下载视频，管理所有创作资产。支持搜索和筛选。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 快速开始 */}
          <div className="bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 border border-[var(--color-primary)]/30 rounded-xl p-6">
            <h3 className="text-[var(--color-text-primary)] font-bold mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
              快速开始
            </h3>
            <div className="space-y-2 text-[var(--color-text-secondary)] text-sm">
              <p>• 点击底部"工作室"按钮，进入创作空间</p>
              <p>• 输入您的创意描述，点击"生成视频"</p>
              <p>• 等待 AI 处理，即可获得精彩视频</p>
              <p>• 在"资产"页面管理您的所有作品</p>
            </div>
          </div>

          {/* 提示信息 */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <p className="text-blue-400 text-sm">
              💡 <strong>提示：</strong>当前为演示模式，所有功能可正常使用。如需连接真实 API，请启动后端服务器。
            </p>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={checkServerStatus}
              className="flex-1 py-3 rounded-xl bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-colors font-medium"
            >
              检测服务器
            </button>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white hover:opacity-90 transition-opacity font-medium shadow-lg"
              >
                开始使用
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}