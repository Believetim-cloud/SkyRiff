import { useState, useEffect, useRef } from 'react';
import { Video, Heart, MessageCircle, Send, Share2, MoreVertical, Play, ChevronRight, Lock, Users, TrendingUp, EyeOff, Trash2, User, RotateCcw, ArrowLeft, Volume2, VolumeX, AlertTriangle, Settings, Coins, Gift, Zap, ArrowUp, ArrowDown, Loader, X, CheckCircle, XCircle, Info, Wallet, Crown, Target } from 'lucide-react';
import type { PublishedVideo } from '../services/video-pool';
import { getMyVisibleVideos, getMyHiddenVideos, hideVideo, deleteMyVideo } from '../services/my-videos';
import { clearVideoPool, initializeSampleVideos } from '../services/video-pool';
import { createFailedVideo, createProcessingVideo, clearAllLocalVideos } from '../services/storage';
import { removeAuthToken } from '../services/backend-api';
import { showToast } from './Toast';
import { WalletPage } from './WalletPage';
import { RechargePage } from './RechargePage';
import { SubscriptionPage } from './SubscriptionPage';
import { TaskCenterPage } from './TaskCenterPage';

// 确认对话框配置类型
interface ConfirmDialogConfig {
  type: 'confirm' | 'alert' | 'prompt';
  title: string;
  message: string;
  icon?: 'warning' | 'success' | 'error' | 'info';
  confirmText?: string;
  cancelText?: string;
  onConfirm: (value?: string) => void;
  onCancel?: () => void;
  defaultValue?: string;
}

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'posts' | 'characters' | 'private'>('posts');
  const [visibleVideos, setVisibleVideos] = useState<PublishedVideo[]>([]);
  const [hiddenVideos, setHiddenVideos] = useState<PublishedVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<PublishedVideo | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showDataCenter, setShowDataCenter] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<ConfirmDialogConfig | null>(null);
  const [promptValue, setPromptValue] = useState('');
  
  // 新增：控制新功能页面显示
  const [showWallet, setShowWallet] = useState(false);
  const [showRecharge, setShowRecharge] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showTaskCenter, setShowTaskCenter] = useState(false);

  useEffect(() => {
    loadMyVideos();
  }, []);
  
  const loadMyVideos = () => {
    setVisibleVideos(getMyVisibleVideos());
    setHiddenVideos(getMyHiddenVideos());
  };
  
  const handleResetVideos = () => {
    setDialogConfig({
      type: 'confirm',
      title: '重置示例视频',
      message: '这将：\n\n1. 清除所有已发布的视频\n2. 恢复10个示例热门视频\n3. 清除所有互动记录',
      icon: 'warning',
      confirmText: '确认重置',
      cancelText: '取消',
      onConfirm: () => {
        clearVideoPool();
        initializeSampleVideos();
        setShowDataCenter(false);
        loadMyVideos();
        setDialogConfig(null);
      },
      onCancel: () => setDialogConfig(null)
    });
  };
  
  const handleCreateFailedVideo = () => {
    setPromptValue('生成超时，请稍后重试');
    setDialogConfig({
      type: 'prompt',
      title: '创建失败视频',
      message: '请输入失败原因：',
      icon: 'error',
      confirmText: '创建',
      cancelText: '取消',
      defaultValue: '生成超时，请稍后重试',
      onConfirm: (errorMessage) => {
        if (errorMessage && errorMessage.trim()) {
          createFailedVideo(errorMessage);
          setShowDataCenter(false);
          setDialogConfig({
            type: 'alert',
            title: '创建成功',
            message: '失败视频已创建，请前往资产页查看',
            icon: 'success',
            confirmText: '确定',
            onConfirm: () => setDialogConfig(null)
          });
        } else {
          setDialogConfig(null);
        }
      },
      onCancel: () => setDialogConfig(null)
    });
  };
  
  const handleCreateProcessingVideo = () => {
    createProcessingVideo(
      '演示视频生成', 
      '这是一个演示生成中状态的示例视频', 
      15, 
      'portrait', 
      'standard'
    );
    setShowDataCenter(false);
    setDialogConfig({
      type: 'alert',
      title: '创建成功',
      message: '生成中视频已创建！\n\n请前往资产页查看，视频将在20-40秒内完成生成。',
      icon: 'success',
      confirmText: '确定',
      onConfirm: () => setDialogConfig(null)
    });
  };
  
  const handleClearAssetVideos = () => {
    setDialogConfig({
      type: 'confirm',
      title: '清除资产视频',
      message: '确定要清除所有资产页面的视频吗？\n\n这将删除所有本地生成的视频（不包括已发布的视频）\n\n注意：此操作不可恢复！',
      icon: 'warning',
      confirmText: '确认清除',
      cancelText: '取消',
      onConfirm: () => {
        clearAllLocalVideos();
        setShowDataCenter(false);
        setDialogConfig({
          type: 'alert',
          title: '清除成功',
          message: '✅ 已清除所有资产视频\n\n旧的视频数据已删除，现在重新生成视频将使用新的视频源。',
          icon: 'success',
          confirmText: '确定',
          onConfirm: () => setDialogConfig(null)
        });
      },
      onCancel: () => setDialogConfig(null)
    });
  };
  
  const handleResetAllData = () => {
    setDialogConfig({
      type: 'confirm',
      title: '完全重置所有数据',
      message: '🚨 警告：这将清除：\n\n1. 所有已发布的视频\n2. 所有本地资产视频\n3. 所有互动记录\n\n然后恢复10个全新的示例视频\n\n确定要继续吗？',
      icon: 'error',
      confirmText: '确认重置',
      cancelText: '取消',
      onConfirm: () => {
        clearVideoPool();
        clearAllLocalVideos();
        initializeSampleVideos();
        setShowDataCenter(false);
        loadMyVideos();
        setDialogConfig({
          type: 'alert',
          title: '重置成功',
          message: '✅ 数据已完全重置！\n\n所有旧视频已清除，已恢复10个新的示例视频。\n请刷新页面以查看更新。',
          icon: 'success',
          confirmText: '确定',
          onConfirm: () => setDialogConfig(null)
        });
      },
      onCancel: () => setDialogConfig(null)
    });
  };

  const handleLogout = () => {
    setDialogConfig({
      type: 'confirm',
      title: '退出登录',
      message: '确定要退出当前账号吗？',
      icon: 'warning',
      confirmText: '退出',
      cancelText: '取消',
      onConfirm: async () => {
        await removeAuthToken();
        // 刷新页面以触发 App.tsx 的登录状态检查
        window.location.reload();
      },
      onCancel: () => setDialogConfig(null)
    });
  };
  
  const handleVideoClick = (video: PublishedVideo, index: number) => {
    setSelectedVideo(video);
    setCurrentVideoIndex(index);
  };

  const displayVideos = activeTab === 'private' ? hiddenVideos : visibleVideos;

  // 如果显示新功能页面，则渲染对应页面
  if (showWallet) {
    return <WalletPage onBack={() => setShowWallet(false)} onNavigateToRecharge={() => { setShowWallet(false); setShowRecharge(true); }} />;
  }

  if (showRecharge) {
    return <RechargePage onBack={() => setShowRecharge(false)} />;
  }

  if (showSubscription) {
    return <SubscriptionPage onBack={() => setShowSubscription(false)} />;
  }

  if (showTaskCenter) {
    return <TaskCenterPage onBack={() => setShowTaskCenter(false)} />;
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 overflow-y-auto relative">
      {/* Header */}
      <div className="relative px-4 pt-4 pb-6 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] backdrop-blur-xl">{/* 添加磨砂效果 */}
        <button className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
          <Settings className="w-5 h-5 text-white" />
        </button>

        {/* User Info */}
        <div className="flex items-center gap-4 mb-6">
          <div 
            className="relative cursor-pointer group" 
            onClick={handleLogout}
            title="点击退出登录"
          >
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop"
              alt="User avatar"
              className="w-20 h-20 rounded-full border-4 border-white/20 hover:border-red-500/50 transition-colors"
            />
            {/* 这里的 absolute inset-0 可能会被图片遮挡或者 z-index 问题，尝试提升 z-index 并确保 hover 触发 */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <span className="text-xs text-white font-medium">退出</span>
            </div>
            {/* 添加一个常驻的小图标指示 */}
            <div className="absolute -bottom-1 -right-1 bg-gray-800 rounded-full p-1 border border-white/20">
                <Settings className="w-3 h-3 text-white/70" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-white mb-1">创作者昵称</h2>
            <p className="text-sm text-white/80">ID: skyriff_2024</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-white/10 backdrop-blur">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-white" />
              <span className="text-xs text-white/80">粉丝</span>
            </div>
            <p className="text-white">12.5K</p>
          </div>
          <div className="p-3 rounded-lg bg-white/10 backdrop-blur">
            <div className="flex items-center gap-2 mb-1">
              <Video className="w-4 h-4 text-white" />
              <span className="text-xs text-white/80">作品</span>
            </div>
            <p className="text-white">{visibleVideos.length + hiddenVideos.length}</p>
          </div>
        </div>
      </div>

      {/* Feature Menu */}
      <div className="px-4 py-4 space-y-0.5">
        {/* 新增：钱包入口 */}
        <button 
          onClick={() => setShowWallet(true)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-gray-800/50 backdrop-blur-md border border-gray-700/30 hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-[var(--color-text-primary)]">我的钱包</span>
          </div>
          <ChevronRight className="w-5 h-5 text-[var(--color-text-secondary)]" />
        </button>

        {/* 新增：充值入口 */}
        <button 
          onClick={() => setShowRecharge(true)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-gray-800/50 backdrop-blur-md border border-gray-700/30 hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-[var(--color-text-primary)]">充值积分</span>
          </div>
          <ChevronRight className="w-5 h-5 text-[var(--color-text-secondary)]" />
        </button>

        {/* 新增：月卡入口 */}
        <button 
          onClick={() => setShowSubscription(true)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-gray-800/50 backdrop-blur-md border border-gray-700/30 hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <span className="text-[var(--color-text-primary)]">月卡会员</span>
          </div>
          <ChevronRight className="w-5 h-5 text-[var(--color-text-secondary)]" />
        </button>

        {/* 新增：任务中心入口 */}
        <button 
          onClick={() => setShowTaskCenter(true)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-gray-800/50 backdrop-blur-md border border-gray-700/30 hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-[var(--color-text-primary)]">任务中心</span>
          </div>
          <ChevronRight className="w-5 h-5 text-[var(--color-text-secondary)]" />
        </button>

        <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-gray-800/50 backdrop-blur-md border border-gray-700/30 hover:bg-gray-700/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-[var(--color-text-primary)]">我的好友</span>
          </div>
          <ChevronRight className="w-5 h-5 text-[var(--color-text-secondary)]" />
        </button>

        <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-gray-800/50 backdrop-blur-md border border-gray-700/30 hover:bg-gray-700/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <span className="text-[var(--color-text-primary)]">我的余额</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[var(--color-text-secondary)]">1,250</span>
            <ChevronRight className="w-5 h-5 text-[var(--color-text-secondary)]" />
          </div>
        </button>

        <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-gray-800/50 backdrop-blur-md border border-gray-700/30 hover:bg-gray-700/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-[var(--color-text-primary)]">我的积分</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[var(--color-text-secondary)]">8,500</span>
            <ChevronRight className="w-5 h-5 text-[var(--color-text-secondary)]" />
          </div>
        </button>

        <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-gray-800/50 backdrop-blur-md border border-gray-700/30 hover:bg-gray-700/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <span className="text-[var(--color-text-primary)]">我的礼物</span>
          </div>
          <ChevronRight className="w-5 h-5 text-[var(--color-text-secondary)]" />
        </button>

        <button 
          onClick={() => setShowDataCenter(true)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-gray-800/50 backdrop-blur-md border border-gray-700/30 hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-[var(--color-text-primary)]">数据中心</span>
          </div>
          <ChevronRight className="w-5 h-5 text-[var(--color-text-secondary)]" />
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--color-border)] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 sticky top-0 z-10">
        <div className="grid grid-cols-3">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center justify-center gap-2 py-20 border-b-2 transition-colors ${
              activeTab === 'posts'
                ? 'border-white text-[var(--color-text-primary)]'
                : 'border-transparent text-[var(--color-text-secondary)]'
            }`}
          >
            <Video className="w-4 h-4" />
            <span className="text-sm">帖子</span>
          </button>
          <button
            onClick={() => setActiveTab('characters')}
            className={`flex items-center justify-center gap-2 py-20 border-b-2 transition-colors ${
              activeTab === 'characters'
                ? 'border-white text-[var(--color-text-primary)]'
                : 'border-transparent text-[var(--color-text-secondary)]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-sm">出演角色</span>
          </button>
          <button
            onClick={() => setActiveTab('private')}
            className={`flex items-center justify-center gap-2 py-20 border-b-2 transition-colors ${
              activeTab === 'private'
                ? 'border-white text-[var(--color-text-primary)]'
                : 'border-transparent text-[var(--color-text-secondary)]'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span className="text-sm">私密</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'posts' && (
        <div className="grid grid-cols-3 gap-0.5">
          {visibleVideos.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <Video className="w-12 h-12 text-[var(--color-text-tertiary)] mx-auto mb-3" />
              <p className="text-[var(--color-text-secondary)]">暂无发布的视频</p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-2">前往资产页发布视频</p>
            </div>
          ) : (
            visibleVideos.map((video, index) => (
              <VideoThumbnail
                key={video.id}
                video={video}
                onClick={() => handleVideoClick(video, index)}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'characters' && (
        <div className="p-4">
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-[var(--color-text-tertiary)] mx-auto mb-3" />
            <p className="text-[var(--color-text-secondary)]">暂无角色数据</p>
          </div>
        </div>
      )}

      {activeTab === 'private' && (
        <div className="grid grid-cols-3 gap-0.5">
          {hiddenVideos.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <Lock className="w-12 h-12 text-[var(--color-text-tertiary)] mx-auto mb-3" />
              <p className="text-[var(--color-text-secondary)]">暂无私密视频</p>
            </div>
          ) : (
            hiddenVideos.map((video, index) => (
              <VideoThumbnail
                key={video.id}
                video={video}
                onClick={() => handleVideoClick(video, index)}
              />
            ))
          )}
        </div>
      )}

      {/* 全屏视频播放器 */}
      {selectedVideo && (
        <FullscreenVideoPlayer
          videos={displayVideos}
          initialIndex={currentVideoIndex}
          onClose={() => setSelectedVideo(null)}
          onVideosChange={loadMyVideos}
          onShowDialog={setDialogConfig}
        />
      )}

      {/* 数据中心对话框 */}
      {showDataCenter && (
        <div
          className="absolute inset-0 bg-black/60 z-[100] flex items-end"
          onClick={() => setShowDataCenter(false)}
        >
          <div
            className="w-full bg-gray-900 rounded-t-3xl pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 顶部拖动条 */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-600 rounded-full"></div>
            </div>

            {/* 标题 */}
            <div className="px-6 py-4 border-b border-gray-800">
              <h3 className="text-xl text-white font-semibold">数据中心</h3>
              <p className="text-sm text-gray-400 mt-1">选择操作</p>
            </div>

            {/* 操作列表 */}
            <div className="px-4 py-2">
              <button
                onClick={handleResetVideos}
                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-800/50 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <RotateCcw className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-white font-medium">重置示例视频</div>
                  <div className="text-sm text-gray-400">清除所有数据并恢复示例</div>
                </div>
              </button>

              <button
                onClick={handleCreateFailedVideo}
                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-800/50 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-white font-medium">创建失败视频</div>
                  <div className="text-sm text-gray-400">演示生成失败的效果</div>
                </div>
              </button>

              <button
                onClick={handleCreateProcessingVideo}
                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-800/50 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Loader className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-white font-medium">创建处理中视频</div>
                  <div className="text-sm text-gray-400">演示生成中的效果</div>
                </div>
              </button>

              <button
                onClick={handleClearAssetVideos}
                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-800/50 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-white font-medium">清除资产视频</div>
                  <div className="text-sm text-gray-400">删除所有本地生成的视频</div>
                </div>
              </button>

              <button
                onClick={handleResetAllData}
                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-800/50 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-white font-medium">完全重置数据</div>
                  <div className="text-sm text-gray-400">清除所有数据并恢复示例</div>
                </div>
              </button>

              {/* 取消按钮 */}
              <button
                onClick={() => setShowDataCenter(false)}
                className="w-full mt-4 px-6 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl text-white font-medium transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 通用确认对话框 */}
      {dialogConfig && (
        <CustomDialog
          config={dialogConfig}
          promptValue={promptValue}
          onPromptChange={setPromptValue}
        />
      )}
    </div>
  );
}

/**
 * 通用确认对话框组件
 */
interface CustomDialogProps {
  config: ConfirmDialogConfig;
  promptValue: string;
  onPromptChange: (value: string) => void;
}

function CustomDialog({ config, promptValue, onPromptChange }: CustomDialogProps) {
  const getIcon = () => {
    switch (config.icon) {
      case 'warning':
        return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'error':
        return <XCircle className="w-8 h-8 text-red-500" />;
      case 'info':
        return <Info className="w-8 h-8 text-blue-500" />;
      default:
        return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
    }
  };

  const handleConfirm = () => {
    if (config.type === 'prompt') {
      config.onConfirm(promptValue);
    } else {
      config.onConfirm();
    }
  };

  return (
    <div
      className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center px-6"
      onClick={() => config.onCancel?.()}
      style={{ writingMode: 'horizontal-tb' }}
    >
      <div
        className="w-full max-w-[280px] bg-[#1c1c1e] rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ writingMode: 'horizontal-tb' }}
      >
        {/* 图标和标题 */}
        <div className="pt-6 pb-4 px-6 text-center">
          <div className="flex justify-center mb-3">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
              config.icon === 'error' ? 'bg-red-500/20' :
              config.icon === 'success' ? 'bg-green-500/20' :
              config.icon === 'warning' ? 'bg-yellow-500/20' :
              'bg-blue-500/20'
            }`}>
              {getIcon()}
            </div>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2" style={{ writingMode: 'horizontal-tb' }}>
            {config.title}
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line" style={{ writingMode: 'horizontal-tb' }}>
            {config.message}
          </p>
        </div>

        {/* 输入框（仅prompt类型） */}
        {config.type === 'prompt' && (
          <div className="px-6 pb-4">
            <input
              type="text"
              value={promptValue}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder={config.defaultValue}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-base"
              style={{ writingMode: 'horizontal-tb' }}
              autoFocus
            />
          </div>
        )}

        {/* 按钮组 */}
        <div className="border-t border-gray-700/50">
          {config.type !== 'alert' && config.onCancel && (
            <button
              onClick={() => config.onCancel?.()}
              className="w-full py-3.5 text-blue-500 font-medium hover:bg-white/5 transition-colors border-b border-gray-700/50"
              style={{ writingMode: 'horizontal-tb' }}
            >
              {config.cancelText || '取消'}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`w-full py-3.5 font-semibold hover:bg-white/5 transition-colors ${
              config.icon === 'error' ? 'text-red-500' : 'text-blue-500'
            }`}
            style={{ writingMode: 'horizontal-tb' }}
          >
            {config.confirmText || '确定'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 视频缩略图组件
 */
interface VideoThumbnailProps {
  video: PublishedVideo;
  onClick: () => void;
}

function VideoThumbnail({ video, onClick }: VideoThumbnailProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div
      className="aspect-[3/4] bg-[var(--color-surface)] cursor-pointer group relative overflow-hidden"
      onClick={onClick}
    >
      <video
        ref={videoRef}
        src={video.videoUrl}
        className="w-full h-full object-cover"
        loop
        muted
        playsInline
        onMouseEnter={(e) => {
          const videoEl = e.currentTarget;
          videoEl.play().catch(err => console.log('播放失败:', err));
        }}
        onMouseLeave={(e) => {
          const videoEl = e.currentTarget;
          videoEl.pause();
          videoEl.currentTime = 0;
        }}
      />
      
      {/* 播放提示 */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Play className="w-8 h-8 text-white fill-white" />
      </div>
      
      {/* 播放次数 */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs">
        <Play className="w-3 h-3 fill-white" />
        <span>{formatNumber(video.views)}</span>
      </div>
    </div>
  );
}

/**
 * 全屏视频播放器组件
 */
interface FullscreenVideoPlayerProps {
  videos: PublishedVideo[];
  initialIndex: number;
  onClose: () => void;
  onVideosChange: () => void;
  onShowDialog: (config: ConfirmDialogConfig) => void;
}

function FullscreenVideoPlayer({ videos, initialIndex, onClose, onVideosChange, onShowDialog }: FullscreenVideoPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const startY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  const currentVideo = videos[currentIndex];

  // 处理上下滑动
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    
    const deltaY = e.touches[0].clientY - startY.current;
    
    if (Math.abs(deltaY) > 50) {
      if (deltaY < 0 && currentIndex < videos.length - 1) {
        // 上滑 - 下一个视频
        setCurrentIndex(currentIndex + 1);
        isDragging.current = false;
      } else if (deltaY > 0 && currentIndex > 0) {
        // 下滑 - 上一个视频
        setCurrentIndex(currentIndex - 1);
        isDragging.current = false;
      }
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
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

  const handleHide = () => {
    setShowMenu(false);
    onShowDialog({
      type: 'confirm',
      title: '隐藏视频',
      message: '确认隐��这个视频吗？\\n\\n隐藏后，视频将从帖子页面移至私密页面',
      icon: 'warning',
      confirmText: '确认隐藏',
      cancelText: '取消',
      onConfirm: () => {
        hideVideo(currentVideo.id);
        // 关闭对话框
        onShowDialog(null as any);
        // 使用Toast提示，2秒后自动消失
        showToast.success('操作成功，视频已隐藏');
        // 延迟关闭，让用户看到Toast提示
        setTimeout(() => {
          onVideosChange();
          onClose();
        }, 300);
      },
      onCancel: () => {
        onShowDialog(null as any);
      }
    });
  };

  const handleDelete = () => {
    setShowMenu(false);
    onShowDialog({
      type: 'confirm',
      title: '删除视频',
      message: '确认删除这个视频吗？\\n\\n删除后将无法恢复，视频将从所有地方永久移除',
      icon: 'error',
      confirmText: '确认删除',
      cancelText: '取消',
      onConfirm: () => {
        deleteMyVideo(currentVideo.id);
        // 关闭对话框
        onShowDialog(null as any);
        // 使用Toast提示，2秒后自动消失
        showToast.success('删除成功，视频已删除');
        // 延迟关闭，让用户看到Toast提示
        setTimeout(() => {
          onVideosChange();
          onClose();
        }, 300);
      },
      onCancel: () => {
        onShowDialog(null as any);
      }
    });
  };

  const formatNumber = (num: number): string => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}w`;
    }
    return num.toString();
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 视频播放器 */}
      <video
        ref={videoRef}
        key={currentVideo.id}
        src={currentVideo.videoUrl}
        className="absolute inset-0 w-full h-full object-contain"
        autoPlay
        loop
        muted={isMuted}
        playsInline
        onClick={handleVideoClick}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* 暂停/播放图标 */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-20 h-20 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-10 h-10 text-white fill-white ml-1" />
          </div>
        </div>
      )}

      {/* 顶部返回按钮 */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/50 to-transparent">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 flex items-center justify-center text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        {/* 视频计数 */}
        <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-sm">
          {currentIndex + 1} / {videos.length}
        </div>
      </div>

      {/* 右侧互动按钮 */}
      <div className="absolute right-4 bottom-32 flex flex-col gap-4 z-20">
        {/* 音量按钮 */}
        <button
          onClick={handleMuteToggle}
          className="flex flex-col items-center"
        >
          <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 flex items-center justify-center transition-colors">
            {isMuted ? (
              <VolumeX className="w-6 h-6 text-white" />
            ) : (
              <Volume2 className="w-6 h-6 text-white" />
            )}
          </div>
        </button>

        {/* 操作按钮 */}
        <button
          onClick={() => setShowMenu(true)}
          className="flex flex-col items-center"
        >
          <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 flex items-center justify-center transition-colors">
            <MoreVertical className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs mt-1">操作</span>
        </button>

        {/* 滑动提示 */}
        {currentIndex < videos.length - 1 && (
          <div className="flex flex-col items-center text-white/60">
            <ArrowUp className="w-5 h-5 animate-bounce" />
            <span className="text-xs">上滑</span>
          </div>
        )}
        {currentIndex > 0 && (
          <div className="flex flex-col items-center text-white/60">
            <ArrowDown className="w-5 h-5 animate-bounce" />
            <span className="text-xs">下滑</span>
          </div>
        )}
      </div>

      {/* 底部信息 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20">
        <div className="max-w-[calc(100%-5rem)]">
          <h3 className="text-white font-medium mb-2">
            {currentVideo.title}
          </h3>
          <p className="text-white/90 text-sm leading-relaxed line-clamp-2">
            {currentVideo.description || currentVideo.prompt}
          </p>
          <div className="flex items-center gap-4 mt-3 text-white/80 text-xs">
            <span>❤️ {formatNumber(currentVideo.likes)}</span>
            <span>💬 {formatNumber(currentVideo.comments)}</span>
            <span>👁 {formatNumber(currentVideo.views)}</span>
          </div>
        </div>
      </div>

      {/* 操作菜单 */}
      {showMenu && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end z-[100]"
          onClick={() => setShowMenu(false)}
        >
          <div
            className="w-full bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl border-t border-gray-700/50 rounded-t-3xl p-4 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-[var(--color-border)] rounded-full mx-auto mb-6" />
            
            <div className="space-y-2">
              <button
                onClick={handleHide}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-lg bg-gray-800/50 backdrop-blur-md border border-gray-700/30 hover:bg-gray-700/50 transition-colors"
              >
                <EyeOff className="w-5 h-5 text-[var(--color-text-primary)]" />
                <span className="text-[var(--color-text-primary)]">隐藏视频</span>
              </button>
              
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors backdrop-blur-md border border-red-500/20"
              >
                <Trash2 className="w-5 h-5 text-red-500" />
                <span className="text-red-500">删除视频</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}w`;
  }
  return num.toString();
}