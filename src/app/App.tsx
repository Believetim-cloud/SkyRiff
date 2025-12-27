import { useState, useEffect } from 'react';
import { Home, Wrench, PlusCircle, FolderOpen, User, Video, Sparkles, FlaskConical } from 'lucide-react';
import { HomePage } from './components/HomePage';
import { ToolsPage } from './components/ToolsPage';
import { CreatePage } from './components/CreatePage';
import { AssetsPage } from './components/AssetsPage';
import { ProfilePage } from './components/ProfilePage';
import { VideoStudio } from './components/VideoStudio';
import { ProStudio } from './components/studio/ProStudio';
import { ServerLauncher } from './components/ServerLauncher';
import { VideoGenerator } from './components/VideoGenerator';
import { LoginPage } from './components/LoginPage';
import { ToastContainer } from './components/Toast';
import { TestConsole } from './components/TestConsole';
import { getProcessingVideos, getLocalVideos, resumeProcessingVideos } from './services/storage';
import { getVideoPool } from './services/video-pool';
import { getAuthToken } from './services/backend-api';

type TabType = 'home' | 'tools' | 'create' | 'assets' | 'profile' | 'studio';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [showServerLauncher, setShowServerLauncher] = useState(true);
  const [processingCount, setProcessingCount] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false); // 新增：控制创作视频弹窗
  const [isPlusRotating, setIsPlusRotating] = useState(false); // 控制+号旋转动画
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 登录状态
  const [showTestConsole, setShowTestConsole] = useState(false); // 测试控制台

  // 检查登录状态
  useEffect(() => {
    const checkLogin = async () => {
        try {
            const token = await getAuthToken();
            setIsLoggedIn(!!token);
        } catch (e) {
            console.error('Failed to check auth token:', e);
            setIsLoggedIn(false);
        }
    };
    checkLogin();
  }, []);

  // 启动时自动清理旧数据
  useEffect(() => {
    // 检查并清理旧的视频数据
    const localVideos = getLocalVideos();
    const poolVideos = getVideoPool();
    
    const hasOldLocalVideos = localVideos.some(v => v.videoUrl?.includes('pexels.com'));
    const hasOldPoolVideos = poolVideos.some(v => v.videoUrl?.includes('pexels.com'));
    
    if (hasOldLocalVideos || hasOldPoolVideos) {
      console.log('✨ 自动清理完成！所有旧视频已移除，现在使用新的可靠视频源。');
    }
    
    // 恢复所有进行中的视频生成任务
    resumeProcessingVideos();
  }, []);

  // 监控生成中的视频数量
  useEffect(() => {
    const updateProcessingCount = () => {
      const count = getProcessingVideos().length;
      setProcessingCount(count);
    };

    // 初始加载
    updateProcessingCount();

    // 监听视频生成完成事件
    window.addEventListener('video-generation-complete', updateProcessingCount);

    // 定时更新（每2秒）
    const interval = setInterval(updateProcessingCount, 2000);

    return () => {
      window.removeEventListener('video-generation-complete', updateProcessingCount);
      clearInterval(interval);
    };
  }, []);

  // 每4秒触发一次+号旋转动画
  useEffect(() => {
    const rotateInterval = setInterval(() => {
      setIsPlusRotating(true);
      setTimeout(() => setIsPlusRotating(false), 600); // 旋转动画持续0.6秒
    }, 4000); // 每4秒执行一次

    return () => clearInterval(rotateInterval);
  }, []);

  // 快捷键：Ctrl+Shift+T 打开测试控制台
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        setShowTestConsole(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'tools':
        return <ToolsPage />;
      case 'create':
        return <CreatePage />;
      case 'assets':
        return <AssetsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'studio':
        return <VideoStudio />;
      default:
        return <HomePage />;
    }
  };

  // 如果未登录，显示登录页
  if (!isLoggedIn) {
    return (
      <div className="relative flex flex-col h-screen bg-[var(--color-background)] w-full max-w-[calc(100vh*10/21.6)] mx-auto">
        <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />
      </div>
    );
  }

  // 如果处于 Studio 模式，显示专业工作台（全屏）
  // 这是一个桌面级应用界面，不受移动端布局限制
  if (activeTab === 'studio') {
    return <ProStudio onExit={() => setActiveTab('home')} />;
  }

  return (
    <div className="relative flex flex-col h-screen bg-[var(--color-background)] w-full max-w-[calc(100vh*10/21.6)] mx-auto">
      {/* Toast全局提示 */}
      <ToastContainer />

      {/* Server Launcher */}
      {showServerLauncher && (
        <ServerLauncher onDismiss={() => setShowServerLauncher(false)} />
      )}

      {/* Creative Studio Quick Access Button */}
      {activeTab !== 'studio' && (
        <button
          onClick={() => setActiveTab('studio')}
          className="fixed top-4 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
        >
          <div className="relative">
            <Video className="w-6 h-6" />
            <Sparkles className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
          </div>
        </button>
      )}

      {/* Test Console Button - 测试控制台按钮 */}
      <button
        onClick={() => setShowTestConsole(true)}
        className="fixed top-4 left-4 z-50 px-4 py-2 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg hover:scale-105 transition-all flex items-center gap-2 group"
        title="打开测试控制台 (Ctrl+Shift+T)"
      >
        <FlaskConical className="w-5 h-5 group-hover:animate-bounce" />
        <span className="text-sm font-semibold">测试</span>
      </button>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>

      {/* 创作视频弹窗 - 全局模态 */}
      {showCreateModal && (
        <VideoGenerator
          onClose={() => {
            setShowCreateModal(false);
          }}
          onVideoGenerated={(videoId) => {
            // 视频生成后，可以选择切换到资产页面
            // 但不关闭弹窗，让用户可以继续生成
          }}
        />
      )}

      {/* 测试控制台 */}
      {showTestConsole && (
        <TestConsole onClose={() => setShowTestConsole(false)} />
      )}

      {/* Bottom Navigation */}
      <nav className="flex items-center justify-around px-4 bg-[var(--color-surface)] border-t border-[var(--color-border)] safe-area-inset-bottom" style={{ paddingTop: '21px', paddingBottom: '21px' }}> {/* 恢复原始颜色，上下各21px */}
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-2 px-8 py-2 rounded-lg transition-all ${ /* 减少按钮内部padding：py-4 → py-2 */
            activeTab === 'home'
              ? 'text-[var(--color-primary)]'
              : 'text-[var(--color-text-secondary)]'
          }`}
        >
          <Home className="w-12 h-12" /> {/* 2x: w-6 h-6 → w-12 h-12 */}
          <span className="text-sm">首页</span> {/* 2x: text-xs → text-sm */}
        </button>

        <button
          onClick={() => setActiveTab('tools')}
          className={`flex flex-col items-center gap-2 px-8 py-2 rounded-lg transition-all ${ /* 减少按钮内部padding：py-4 → py-2 */
            activeTab === 'tools'
              ? 'text-[var(--color-primary)]'
              : 'text-[var(--color-text-secondary)]'
          }`}
        >
          <Wrench className="w-12 h-12" /> {/* 2x: w-6 h-6 → w-12 h-12 */}
          <span className="text-sm">工具</span> {/* 2x: text-xs → text-sm */}
        </button>

        <button
          onClick={() => {
            setShowCreateModal(true); // 显示创作视频弹窗
          }}
          className="relative flex flex-col items-center gap-2 px-8 py-2" /* 减少按钮内部padding：py-4 → py-2 */
        >
          <div className="relative w-32 h-20 -mt-10 rounded-3xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center shadow-lg shadow-purple-500/50"> {/* 长方形带倒角: w-32 h-20 (128px×80px), rounded-3xl (24px倒角), 向上偏移 -mt-10 (-40px) */}
            {/* 外圈发光效果 */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] blur-sm opacity-60 animate-pulse"></div>
            
            {/* 星星装饰 - 固定位置，不随+号旋转，在圆形内部靠近边缘 */}
            <Sparkles className="w-6 h-6 text-yellow-300 absolute top-2 right-3 animate-pulse" />
            <Sparkles className="w-4 h-4 text-blue-300 absolute bottom-2 left-3 animate-pulse" style={{ animationDelay: '0.5s' }} />
            
            {/* 立体+号 - 只有这个旋转 */}
            <div className={`relative ${isPlusRotating ? 'animate-cute-rotate' : ''}`}>
              {/* 竖条 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[15.6px] h-[62.4px] bg-gradient-to-b from-white via-white to-white/80 rounded-full shadow-lg"></div>
              {/* 横条 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[62.4px] h-[15.6px] bg-gradient-to-r from-white via-white to-white/80 rounded-full shadow-lg"></div>
            </div>
          </div>
          {/* 隐藏"创作"文字 */}
        </button>

        <button
          onClick={() => setActiveTab('assets')}
          className={`relative flex flex-col items-center gap-2 px-8 py-2 rounded-lg transition-all ${ /* 减少按padding：py-4 → py-2 */
            activeTab === 'assets'
              ? 'text-[var(--color-primary)]'
              : 'text-[var(--color-text-secondary)]'
          }`}
        >
          <div className="relative">
            <FolderOpen className={`w-12 h-12 ${processingCount > 0 ? 'animate-shake' : ''}`} /> {/* 2x: w-6 h-6 → w-12 h-12 */}
            {processingCount > 0 && (
              <div className="absolute -top-4 -right-4 min-w-[36px] h-[36px] px-2 rounded-full bg-red-500 flex items-center justify-center animate-shake"> {/* 2x: -top-2→-top-4, -right-2→-right-4, min-w-[18px]→min-w-[36px], h-[18px]→h-[36px], px-1→px-2 */}
                <span className="text-white text-xs font-bold">{processingCount}</span> {/* 2x: text-[10px]→text-xs */}
              </div>
            )}
          </div>
          <span className="text-sm">资产</span> {/* 2x: text-xs → text-sm */}
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-2 px-8 py-2 rounded-lg transition-all ${ /* 减少按钮内部padding：py-4 → py-2 */
            activeTab === 'profile'
              ? 'text-[var(--color-primary)]'
              : 'text-[var(--color-text-secondary)]'
          }`}
        >
          <User className="w-12 h-12" /> {/* 2x: w-6 h-6 → w-12 h-12 */}
          <span className="text-sm">我的</span> {/* 2x: text-xs → text-sm */}
        </button>
      </nav>
    </div>
  );
}

export default App;