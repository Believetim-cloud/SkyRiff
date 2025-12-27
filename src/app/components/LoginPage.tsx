import { useState, useEffect } from 'react';
import { LogIn, Loader2, Zap, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { loginMock } from '../services/backend-api';
import { API_CONFIG } from '../services/api-config';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

type ServerStatus = 'checking' | 'online' | 'offline';

// 使用统一配置的后端地址
const BACKEND_URL = API_CONFIG.BASE_URL;

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [userId, setUserId] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState<ServerStatus>('checking');

  // 检测后端服务状态
  useEffect(() => {
    const checkServerStatus = async () => {
      setServerStatus('checking');
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        // 访问健康检查端点
        const response = await fetch(`${BACKEND_URL}/health`, {
          signal: controller.signal,
          method: 'GET',
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'healthy') {
            setServerStatus('online');
            return;
          }
        }
        
        setServerStatus('offline');
      } catch (err: any) {
        console.log('🔍 服务器检测失败:', err.message);
        setServerStatus('offline');
      }
    };

    checkServerStatus();
    // 每30秒检查一次
    const interval = setInterval(checkServerStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    if (!userId) {
      setError('请输入用户ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await loginMock(parseInt(userId));
      
      if (response.code === 200) {
        console.log('✅ 登录成功！', response.data);
        onLoginSuccess();
      } else {
        setError(response.message || '登录失败');
      }
    } catch (err: any) {
      console.error('❌ 登录失败：', err);
      setError(err.message || '登录失败，请检查后端是否启动');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && userId) {
      handleLogin();
    }
  };

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '24px',
      writingMode: 'horizontal-tb' as const
    }}>
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        writingMode: 'horizontal-tb' as const
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '48px', writingMode: 'horizontal-tb' as const }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '96px',
            height: '96px',
            background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
            borderRadius: '24px',
            marginBottom: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <Zap style={{ width: '48px', height: '48px', color: 'white' }} />
          </div>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: 'bold', 
            color: 'white', 
            marginBottom: '12px',
            writingMode: 'horizontal-tb' as const,
            textOrientation: 'upright' as const
          }}>
            SkyRiff
          </h1>
          <p style={{ 
            fontSize: '20px', 
            color: 'rgba(255,255,255,0.7)',
            writingMode: 'horizontal-tb' as const
          }}>
            AI视频创作平台
          </p>
        </div>

        {/* 登录表单 */}
        <div style={{ width: '100%', maxWidth: '400px', writingMode: 'horizontal-tb' as const }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: 'white', 
            textAlign: 'center', 
            marginBottom: '32px',
            writingMode: 'horizontal-tb' as const
          }}>
            欢迎登录
          </h2>
          
          {/* 用户ID输入 */}
          <div style={{ marginBottom: '24px', writingMode: 'horizontal-tb' as const }}>
            <label style={{ 
              display: 'block', 
              color: 'rgba(255,255,255,0.9)', 
              fontWeight: '500',
              textAlign: 'center',
              marginBottom: '12px',
              writingMode: 'horizontal-tb' as const
            }}>
              测试账号
            </label>
            <input
              type="number"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入用户ID"
              disabled={loading}
              autoFocus
              style={{
                width: '100%',
                padding: '16px 24px',
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '16px',
                color: 'white',
                textAlign: 'center',
                fontSize: '20px',
                outline: 'none',
                backdropFilter: 'blur(10px)',
                writingMode: 'horizontal-tb' as const
              }}
            />
            <p style={{ 
              color: 'rgba(255,255,255,0.6)', 
              fontSize: '14px', 
              textAlign: 'center',
              marginTop: '12px',
              writingMode: 'horizontal-tb' as const
            }}>
              💡 输入任意数字即可登录（如：1、2、3...）
            </p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.3)',
              border: '2px solid rgba(239, 68, 68, 0.5)',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '24px',
              backdropFilter: 'blur(10px)',
              writingMode: 'horizontal-tb' as const
            }}>
              <p style={{ 
                color: 'rgba(254, 202, 202, 1)', 
                textAlign: 'center', 
                fontWeight: '500',
                writingMode: 'horizontal-tb' as const
              }}>
                {error}
              </p>
            </div>
          )}

          {/* 登录按钮 */}
          <button
            onClick={handleLogin}
            disabled={loading || !userId}
            style={{
              width: '100%',
              padding: '20px',
              background: loading || !userId ? 'rgba(168, 85, 247, 0.5)' : 'linear-gradient(90deg, #a855f7 0%, #ec4899 100%)',
              border: 'none',
              borderRadius: '16px',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '20px',
              cursor: loading || !userId ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
              transition: 'all 0.3s',
              writingMode: 'horizontal-tb' as const
            }}
          >
            {loading ? (
              <>
                <Loader2 style={{ width: '24px', height: '24px', animation: 'spin 1s linear infinite' }} />
                <span style={{ writingMode: 'horizontal-tb' as const }}>登录中...</span>
              </>
            ) : (
              <>
                <LogIn style={{ width: '24px', height: '24px' }} />
                <span style={{ writingMode: 'horizontal-tb' as const }}>立即登录</span>
              </>
            )}
          </button>

          {/* 后端服务状态 */}
          <div style={{
            background: serverStatus === 'online' 
              ? 'rgba(34, 197, 94, 0.2)' 
              : serverStatus === 'offline'
              ? 'rgba(239, 68, 68, 0.2)'
              : 'rgba(251, 191, 36, 0.2)',
            border: serverStatus === 'online'
              ? '2px solid rgba(34, 197, 94, 0.4)'
              : serverStatus === 'offline'
              ? '2px solid rgba(239, 68, 68, 0.4)'
              : '2px solid rgba(251, 191, 36, 0.4)',
            borderRadius: '16px',
            padding: '16px',
            marginTop: '16px',
            backdropFilter: 'blur(10px)',
            writingMode: 'horizontal-tb' as const,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            {serverStatus === 'checking' && (
              <>
                <AlertCircle style={{ width: '20px', height: '20px', color: 'rgba(251, 191, 36, 1)' }} />
                <span style={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  fontSize: '14px',
                  fontWeight: '500',
                  writingMode: 'horizontal-tb' as const
                }}>
                  正在检测服务器...
                </span>
              </>
            )}
            {serverStatus === 'online' && (
              <>
                <CheckCircle style={{ width: '20px', height: '20px', color: 'rgba(34, 197, 94, 1)' }} />
                <div style={{ writingMode: 'horizontal-tb' as const }}>
                  <span style={{ 
                    color: 'rgba(255,255,255,0.9)', 
                    fontSize: '14px',
                    fontWeight: '500',
                    writingMode: 'horizontal-tb' as const
                  }}>
                    ✅ 后端服务在线
                  </span>
                  <div style={{ 
                    color: 'rgba(255,255,255,0.6)', 
                    fontSize: '12px',
                    marginTop: '4px',
                    writingMode: 'horizontal-tb' as const
                  }}>
                    {BACKEND_URL}
                  </div>
                </div>
              </>
            )}
            {serverStatus === 'offline' && (
              <>
                <XCircle style={{ width: '20px', height: '20px', color: 'rgba(239, 68, 68, 1)' }} />
                <div style={{ writingMode: 'horizontal-tb' as const }}>
                  <span style={{ 
                    color: 'rgba(255,255,255,0.9)', 
                    fontSize: '14px',
                    fontWeight: '500',
                    writingMode: 'horizontal-tb' as const
                  }}>
                    ❌ 后端服务离线
                  </span>
                  <div style={{ 
                    color: 'rgba(255,255,255,0.6)', 
                    fontSize: '12px',
                    marginTop: '4px',
                    writingMode: 'horizontal-tb' as const
                  }}>
                    请启动后端：python -m app.main
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 提示信息 */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.2)',
            border: '2px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '16px',
            padding: '20px',
            marginTop: '24px',
            backdropFilter: 'blur(10px)',
            writingMode: 'horizontal-tb' as const
          }}>
            <p style={{ 
              color: 'rgba(255,255,255,0.9)', 
              fontWeight: '600',
              marginBottom: '8px',
              textAlign: 'center',
              writingMode: 'horizontal-tb' as const
            }}>
              🔧 开发测试模式
            </p>
            <ul style={{ 
              color: 'rgba(255,255,255,0.7)', 
              fontSize: '14px',
              lineHeight: '1.8',
              paddingLeft: '20px',
              writingMode: 'horizontal-tb' as const
            }}>
              <li style={{ writingMode: 'horizontal-tb' as const }}>确保后端启动：python -m app.main</li>
              <li style={{ writingMode: 'horizontal-tb' as const }}>后端地址：{API_CONFIG.BASE_URL}</li>
              <li style={{ writingMode: 'horizontal-tb' as const }}>首次登录会自动创建账号</li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}