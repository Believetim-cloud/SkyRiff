import { useState, useEffect } from 'react';
import { ArrowLeft, Crown, Gift, Calendar, Loader2, CheckCircle } from 'lucide-react';
import { getMySubscription, buySubscription, claimDailyReward, getProducts, Subscription, Product } from '../services/backend-api';

interface SubscriptionPageProps {
  onBack: () => void;
}

export function SubscriptionPage({ onBack }: SubscriptionPageProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // 加载月卡商品
      const productsRes = await getProducts('subscription');
      if (productsRes.code === 200 && productsRes.data.items.length > 0) {
        setProduct(productsRes.data.items[0]);
      }

      // 加载我的月卡状态
      const subRes = await getMySubscription();
      if (subRes.code === 200 && subRes.data) {
        setSubscription(subRes.data);
      }
    } catch (err: any) {
      console.error('❌ 加载数据失败：', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!product) return;

    setBuying(true);
    setError('');

    try {
      const response = await buySubscription(product.product_id);
      
      if (response.code === 200) {
        alert(`✅ 购买成功！\n\n月卡已激活，有效期30天\n每天可领取${product.daily_credits}积分`);
        await loadData();
      }
    } catch (err: any) {
      console.error('❌ 购买失败：', err);
      setError(err.message || '购买失败');
    } finally {
      setBuying(false);
    }
  };

  const handleClaimDaily = async () => {
    setClaiming(true);
    setError('');

    try {
      const response = await claimDailyReward();
      
      if (response.code === 200) {
        alert(`✅ 领取成功！\n\n获得 ${response.data.credits_amount} 积分`);
        await loadData();
      }
    } catch (err: any) {
      console.error('❌ 领取失败：', err);
      setError(err.message || '领取失败');
      alert(`❌ ${err.message || '今日已领取或月卡已过期'}`);
    } finally {
      setClaiming(false);
    }
  };

  const hasActiveSubscription = subscription && subscription.status === 'active';

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 bg-black/20">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Crown className="w-6 h-6 text-yellow-300" />
          月卡会员
        </h1>
        <div className="w-10" />
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* 月卡状态卡片 */}
            {hasActiveSubscription ? (
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Crown className="w-8 h-8 text-white" />
                  <div>
                    <div className="text-white font-bold text-xl">会员已激活</div>
                    <div className="text-white/80 text-sm">尊享每日领取特权</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-white/20 rounded-xl p-4">
                    <Calendar className="w-5 h-5 text-white/80 mb-2" />
                    <div className="text-white/80 text-sm">剩余天数</div>
                    <div className="text-white font-bold text-2xl">
                      {subscription.days_remaining}天
                    </div>
                  </div>

                  <div className="bg-white/20 rounded-xl p-4">
                    <Gift className="w-5 h-5 text-white/80 mb-2" />
                    <div className="text-white/80 text-sm">今日状态</div>
                    <div className="text-white font-bold text-lg">
                      {subscription.today_claimed ? '已领取' : '可领取'}
                    </div>
                  </div>
                </div>

                {/* 每日领取按钮 */}
                <button
                  onClick={handleClaimDaily}
                  disabled={claiming || subscription.today_claimed}
                  className="w-full mt-4 py-4 bg-white hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed text-orange-600 font-bold text-lg rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {claiming ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      领取中...
                    </>
                  ) : subscription.today_claimed ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      今日已领取
                    </>
                  ) : (
                    <>
                      <Gift className="w-5 h-5" />
                      领取今日积分
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* 未开通月卡 */
              product && (
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                  <div className="text-center mb-6">
                    <Crown className="w-16 h-16 text-yellow-300 mx-auto mb-3" />
                    <h2 className="text-2xl font-bold text-white mb-2">开通月卡会员</h2>
                    <p className="text-white/60">享受每日领取特权</p>
                  </div>

                  <div className="bg-white/10 rounded-xl p-6 mb-6">
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold text-yellow-300 mb-2">
                        ¥{product.price_yuan}
                      </div>
                      <div className="text-white/60 text-sm">30天有效期</div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-white/80">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span>每天领取 {product.daily_credits} 积分</span>
                      </div>
                      <div className="flex items-center gap-3 text-white/80">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span>30天共 {product.daily_credits! * 30} 积分</span>
                      </div>
                      <div className="flex items-center gap-3 text-white/80">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span>性价比超高，比单次充值划算近2倍</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleBuy}
                    disabled={buying}
                    className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {buying ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        购买中...
                      </>
                    ) : (
                      <>
                        <Crown className="w-5 h-5" />
                        立即开通 ¥{product.price_yuan}
                      </>
                    )}
                  </button>
                </div>
              )
            )}

            {/* 错误提示 */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-200 text-sm">
                {error}
              </div>
            )}

            {/* 会员特权说明 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-300" />
                会员特权
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div>
                    <div className="text-white font-semibold mb-1">每日领取</div>
                    <div className="text-white/60 text-xs">
                      每天可领取30积分，连续领取不中断
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div>
                    <div className="text-white font-semibold mb-1">超值优惠</div>
                    <div className="text-white/60 text-xs">
                      月卡29元=900积分，单次充值30元仅600积分
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <div>
                    <div className="text-white font-semibold mb-1">自动续期</div>
                    <div className="text-white/60 text-xs">
                      多次购买自动延长有效期，不会浪费
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 说明 */}
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
              <p className="text-white/80 text-sm font-semibold mb-2">💡 温馨提示</p>
              <ul className="text-white/60 text-xs space-y-1">
                <li>• 购买后立即生效，有效期30天</li>
                <li>• 每天登录后即可领取积分</li>
                <li>• 过期后积分不会清零，可继续使用</li>
                <li>• 当前为测试模式，模拟支付</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
