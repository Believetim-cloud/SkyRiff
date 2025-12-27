import { useState, useEffect } from 'react';
import { ArrowLeft, Zap, CheckCircle, Loader2, Gift } from 'lucide-react';
import { getProducts, createPayment, mockPaymentCallback, Product } from '../services/backend-api';

interface RechargePageProps {
  onBack: () => void;
}

export function RechargePage({ onBack }: RechargePageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await getProducts('recharge');
      if (response.code === 200) {
        setProducts(response.data.items);
      }
    } catch (err: any) {
      console.error('❌ 加载商品失败：', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async () => {
    if (!selectedProduct) return;

    setProcessing(true);
    setError('');

    try {
      // 1. 创建支付单
      const paymentRes = await createPayment(selectedProduct.product_id, 'mock');
      
      if (paymentRes.code === 200) {
        const paymentId = paymentRes.data.payment_id;
        
        // 2. 模拟支付成功
        const callbackRes = await mockPaymentCallback(paymentId, true);
        
        if (callbackRes.code === 200) {
          alert(`✅ 充值成功！\n\n获得 ${selectedProduct.credits! + selectedProduct.bonus_credits} 积分\n- 基础积分：${selectedProduct.credits}\n- 赠送积分：${selectedProduct.bonus_credits}`);
          onBack();
        }
      }
    } catch (err: any) {
      console.error('❌ 充值失败：', err);
      setError(err.message || '充值失败');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 bg-black/20">
        <button
          onClick={onBack}
          disabled={processing}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">充值积分</h1>
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
            {/* 充值档位 */}
            <div className="grid grid-cols-2 gap-4">
              {products.map((product) => {
                const totalCredits = product.credits! + product.bonus_credits;
                const isSelected = selectedProduct?.product_id === product.product_id;
                const hasBonus = product.bonus_credits > 0;

                return (
                  <button
                    key={product.product_id}
                    onClick={() => setSelectedProduct(product)}
                    disabled={processing}
                    className={`relative p-6 rounded-2xl transition-all ${
                      isSelected
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 scale-105 shadow-2xl'
                        : 'bg-white/10 backdrop-blur-lg hover:bg-white/20'
                    } disabled:opacity-50`}
                  >
                    {/* 赠送标签 */}
                    {hasBonus && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Gift className="w-3 h-3" />
                        送{product.bonus_credits}
                      </div>
                    )}

                    {/* 选中标记 */}
                    {isSelected && (
                      <CheckCircle className="absolute top-2 left-2 w-6 h-6 text-white" />
                    )}

                    {/* 积分数量 */}
                    <div className="flex items-center justify-center mb-2">
                      <Zap className={`w-8 h-8 ${isSelected ? 'text-yellow-300' : 'text-purple-400'}`} />
                    </div>
                    <div className={`text-2xl font-bold mb-1 ${isSelected ? 'text-white' : 'text-white/90'}`}>
                      {totalCredits}
                    </div>
                    <div className={`text-sm mb-3 ${isSelected ? 'text-white/80' : 'text-white/60'}`}>
                      积分
                    </div>

                    {/* 价格 */}
                    <div className={`text-xl font-bold ${isSelected ? 'text-yellow-300' : 'text-purple-400'}`}>
                      ¥{product.price_yuan}
                    </div>

                    {/* 性价比标签 */}
                    {hasBonus && (
                      <div className={`text-xs mt-2 ${isSelected ? 'text-white/80' : 'text-white/60'}`}>
                        超值优惠
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 选中的商品详情 */}
            {selectedProduct && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-3">商品详情</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-white/80">
                    <span>基础积分：</span>
                    <span className="font-semibold">{selectedProduct.credits} 积分</span>
                  </div>
                  {selectedProduct.bonus_credits > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>赠送积分：</span>
                      <span className="font-semibold">+{selectedProduct.bonus_credits} 积分</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white font-bold pt-2 border-t border-white/20">
                    <span>合计获得：</span>
                    <span className="text-yellow-300">
                      {selectedProduct.credits! + selectedProduct.bonus_credits} 积分
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 错误提示 */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-200 text-sm">
                {error}
              </div>
            )}

            {/* 充值按钮 */}
            <button
              onClick={handleRecharge}
              disabled={!selectedProduct || processing}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  支付中...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  立即充值
                  {selectedProduct && ` ¥${selectedProduct.price_yuan}`}
                </>
              )}
            </button>

            {/* 说明 */}
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
              <p className="text-white/80 text-sm font-semibold mb-2">💡 充值说明</p>
              <ul className="text-white/60 text-xs space-y-1">
                <li>• 积分用于生成视频，1次生成消耗10积分</li>
                <li>• 充值后积分立即到账</li>
                <li>• 当前为测试模式，模拟支付</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
