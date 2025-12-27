import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  type: ToastType;
  message: string;
  duration?: number; // 毫秒
}

interface ToastItem extends ToastConfig {
  id: string;
}

// 全局Toast管理器
class ToastManager {
  private listeners: ((toasts: ToastItem[]) => void)[] = [];
  private toasts: ToastItem[] = [];
  private idCounter = 0;

  subscribe(listener: (toasts: ToastItem[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  show(config: ToastConfig) {
    const id = `toast-${this.idCounter++}`;
    const toast: ToastItem = {
      ...config,
      id,
      duration: config.duration || 3000,
    };

    this.toasts.push(toast);
    this.notify();

    // 自动移除
    setTimeout(() => {
      this.remove(id);
    }, toast.duration);
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.notify();
  }

  clear() {
    this.toasts = [];
    this.notify();
  }
}

export const toastManager = new ToastManager();

// 便捷方法
export const showToast = {
  success: (message: string, duration?: number) => {
    toastManager.show({ type: 'success', message, duration });
  },
  error: (message: string, duration?: number) => {
    toastManager.show({ type: 'error', message, duration });
  },
  warning: (message: string, duration?: number) => {
    toastManager.show({ type: 'warning', message, duration });
  },
  info: (message: string, duration?: number) => {
    toastManager.show({ type: 'info', message, duration });
  },
};

/**
 * Toast容器组件 - 渲染所有Toast
 */
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setToasts);
    return unsubscribe;
  }, []);

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

/**
 * 单个Toast项
 */
interface ToastItemProps {
  toast: ToastItem;
}

function ToastItem({ toast }: ToastItemProps) {
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'stay' | 'exit'>('enter');

  useEffect(() => {
    // 阶段1: 进入动画 - 从中间往上移动 (0-500ms)
    const enterTimer = setTimeout(() => {
      setAnimationPhase('stay');
    }, 500);

    // 阶段2: 停留 (500ms - duration-500ms)
    const stayDuration = (toast.duration || 3000) - 1000; // 总时长减去进入和退出动画时长
    const exitTimer = setTimeout(() => {
      setAnimationPhase('exit');
    }, 500 + stayDuration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [toast.duration]);

  const getIcon = () => {
    const iconClass = "w-7 h-7";
    switch (toast.type) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-white`} />;
      case 'error':
        return <XCircle className={`${iconClass} text-white`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-white`} />;
      case 'info':
        return <Info className={`${iconClass} text-white`} />;
    }
  };

  const getIconBgColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-blue-500';
    }
  };

  // 根据动画阶段设置不同的transform和opacity
  const getAnimationStyle = () => {
    switch (animationPhase) {
      case 'enter':
        return 'opacity-0 translate-y-[200px]'; // 从中间位置开始（向下200px）
      case 'stay':
        return 'opacity-100 translate-y-0'; // 移动到目标位置
      case 'exit':
        return 'opacity-0 -translate-y-[100px]'; // 继续向上移动并消失
    }
  };

  return (
    <div
      className={`
        flex items-start gap-4 px-6 py-4 rounded-2xl
        bg-black/90 backdrop-blur-xl border border-white/10
        shadow-2xl pointer-events-auto
        transition-all duration-500 ease-out
        ${getAnimationStyle()}
      `}
    >
      {/* 图标 */}
      <div className={`flex-shrink-0 w-12 h-12 rounded-full ${getIconBgColor()} flex items-center justify-center shadow-lg mt-0.5`}>
        {getIcon()}
      </div>

      {/* 消息文字 - 横排显示 */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium whitespace-pre-wrap break-words leading-relaxed text-sm">
          {toast.message}
        </p>
      </div>
    </div>
  );
}