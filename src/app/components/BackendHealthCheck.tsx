/**
 * 后端健康检查组件
 * 用于检测后端服务是否正常运行
 */
import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader2, RefreshCw, Copy, Terminal, ExternalLink } from 'lucide-react';

import { API_CONFIG } from '../services/api-config';

interface HealthStatus {
  status: 'checking' | 'healthy' | 'unhealthy';
  message: string;
  details?: any;
}

export function BackendHealthCheck() {
  const [health, setHealth] = useState<HealthStatus>({
    status: 'checking',
    message: '检查中...',
  });
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const checkHealth = async () => {
    setHealth({ status: 'checking', message: '正在检查后端服务...' });

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        setHealth({
          status: 'healthy',
          message: '后端服务运行正常',
          details: data,
        });
      } else {
        setHealth({
          status: 'unhealthy',
          message: `后端服务响应异常: ${response.status}`,
        });
      }
    } catch (error) {
      setHealth({
        status: 'unhealthy',
        message: '无法连接到后端服务',
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(label);
      setTimeout(() => setCopySuccess(null), 2000);
    });
  };

  useEffect(() => {
    checkHealth();
    // 每5秒自动检查一次
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {health.status === 'checking' && (
            <Loader2 className="w-5 h-5 text-blue-400 animate-spin mt-0.5" />
          )}
          {health.status === 'healthy' && (
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
          )}
          {health.status === 'unhealthy' && (
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
          )}
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">后端服务状态</span>
              {health.status === 'healthy' && (
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                  运行中
                </span>
              )}
              {health.status === 'unhealthy' && (
                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                  未连接
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 mt-1">{health.message}</p>
            
            {health.status === 'unhealthy' && (
              <div className="mt-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-red-300" />
                  <p className="font-medium text-red-300">⚠️ 后端服务未启动</p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p className="text-red-200">请按以下步骤启动后端服务：</p>
                  
                  {/* 步骤 1 */}
                  <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400">步骤 1: 进入后端目录</span>
                      <button
                        onClick={() => copyToClipboard('cd D:\\Figma_skyriff\\backend', 'step1')}
                        className="p-1 hover:bg-slate-700 rounded transition-colors"
                        title="复制命令"
                      >
                        {copySuccess === 'step1' ? (
                          <CheckCircle className="w-3 h-3 text-green-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-400" />
                        )}
                      </button>
                    </div>
                    <code className="text-xs text-blue-300 font-mono block bg-slate-950 p-2 rounded">
                      cd D:\Figma_skyriff\backend
                    </code>
                  </div>
                  
                  {/* 步骤 2 */}
                  <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400">步骤 2: 初始化数据库（首次启动）</span>
                      <button
                        onClick={() => copyToClipboard('python init_database.py', 'step2')}
                        className="p-1 hover:bg-slate-700 rounded transition-colors"
                        title="复制命令"
                      >
                        {copySuccess === 'step2' ? (
                          <CheckCircle className="w-3 h-3 text-green-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-400" />
                        )}
                      </button>
                    </div>
                    <code className="text-xs text-blue-300 font-mono block bg-slate-950 p-2 rounded">
                      python init_database.py
                    </code>
                  </div>
                  
                  {/* 步骤 3 */}
                  <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400">步骤 3: 启动后端服务</span>
                      <button
                        onClick={() => copyToClipboard('uvicorn app.main:app --reload', 'step3')}
                        className="p-1 hover:bg-slate-700 rounded transition-colors"
                        title="复制命令"
                      >
                        {copySuccess === 'step3' ? (
                          <CheckCircle className="w-3 h-3 text-green-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-400" />
                        )}
                      </button>
                    </div>
                    <code className="text-xs text-blue-300 font-mono block bg-slate-950 p-2 rounded">
                      uvicorn app.main:app --reload
                    </code>
                  </div>
                  
                  {/* 快捷方式 */}
                  <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                    <p className="text-xs text-blue-300 font-medium mb-2">💡 快捷方式：</p>
                    <p className="text-xs text-blue-200/80">
                      您也可以双击运行后端目录下的 <code className="bg-blue-900/30 px-1 py-0.5 rounded">启动后端.bat</code> 文件
                    </p>
                  </div>
                  
                  {/* 成功提示 */}
                  <div className="mt-2 text-xs text-slate-400">
                    <p>✓ 看到 "Uvicorn running on http://0.0.0.0:8001" 即表示启动成功</p>
                    <p>✓ 页面将自动检测并连接后端服务</p>
                  </div>
                </div>
              </div>
            )}
            
            {health.status === 'healthy' && health.details && (
              <div className="mt-2 text-xs text-green-300/60">
                连接到: {API_CONFIG.BASE_URL}
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={checkHealth}
          disabled={health.status === 'checking'}
          className="p-2 hover:bg-slate-800 rounded transition-colors disabled:opacity-50"
          title="刷新检查"
        >
          <RefreshCw
            className={`w-4 h-4 text-slate-400 ${
              health.status === 'checking' ? 'animate-spin' : ''
            }`}
          />
        </button>
      </div>
    </div>
  );
}