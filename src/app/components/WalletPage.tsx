import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, ArrowLeft, RefreshCw } from 'lucide-react';
import { getMyWallet, WalletInfo } from '../services/backend-api';

interface WalletPageProps {
  onBack: () => void;
  onNavigateToRecharge: () => void;
}

export function WalletPage({ onBack, onNavigateToRecharge }: WalletPageProps) {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadWallet = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await getMyWallet();
      if (response.code === 200) {
        setWallet(response.data);
      } else {
        setError(response.message || '加载失败');
      }
    } catch (err: any) {
      console.error('❌ 加载钱包失败：', err);
      setError(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 bg-black/20">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">我的钱包</h1>
        <button
          onClick={loadWallet}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-5 h-5 text-white ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && !wallet ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-white animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-200">
            {error}
          </div>
        ) : wallet ? (
          <div className="space-y-4">
            {/* 双钱包卡片 */}
            <div className="grid grid-cols-2 gap-4">
              {/* 积分钱包 */}
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-5 h-5 text-white/80" />
                  <span className="text-white/80 text-sm">积分余额</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {wallet.balance_credits}
                </div>
                <div className="text-white/60 text-xs">Credits</div>
              </div>

              {/* 金币钱包 */}
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-5 h-5 text-white/80" />
                  <span className="text-white/80 text-sm">金币余额</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {(wallet.balance_coins || 0).toFixed(2)}
                </div>
                <div className="text-white/60 text-xs">元（可提现）</div>
              </div>
            </div>

            {/* 统计卡片 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4">账户统计</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span className="text-white/80">累计充值</span>
                  </div>
                  <span className="text-white font-semibold">
                    ¥{(wallet.total_recharged || 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    <span className="text-white/80">累计收益</span>
                  </div>
                  <span className="text-white font-semibold">
                    {wallet.total_earned || 0} 积分
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-orange-400" />
                    <span className="text-white/80">累计消费</span>
                  </div>
                  <span className="text-white font-semibold">
                    {wallet.total_spent || 0} 积分
                  </span>
                </div>
              </div>
            </div>

            {/* 快捷操作 */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={onNavigateToRecharge}
                className="py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all"
              >
                充值积分
              </button>
              <button
                onClick={() => alert('提现功能开发中...')}
                className="py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all border border-white/20"
              >
                提现金币
              </button>
            </div>

            {/* 说明 */}
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
              <p className="text-white/80 text-sm font-semibold mb-2">💡 钱包说明</p>
              <ul className="text-white/60 text-xs space-y-1">
                <li>• <strong>积分（Credits）</strong>：用于生成视频，消费使用</li>
                <li>• <strong>金币（Coins）</strong>：创作者收益，可提现</li>
                <li>• 1元 = 1金币，提现最低100元</li>
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}