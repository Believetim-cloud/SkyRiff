/**
 * 测试控制台 - 用于系统性测试所有功能
 */
import { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Loader2, Play, ChevronDown, ChevronRight } from 'lucide-react';
import * as BackendAPI from '../services/backend-api';
import { API_CONFIG } from '../services/api-config';
import { BackendHealthCheck } from './BackendHealthCheck';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  data?: any;
  duration?: number;
}

interface TestSection {
  title: string;
  tests: TestResult[];
  expanded: boolean;
}

export function TestConsole({ onClose }: { onClose: () => void }) {
  const [sections, setSections] = useState<TestSection[]>([
    {
      title: '🔐 认证系统',
      expanded: true,
      tests: [
        { name: '模拟登录 (user_id=1)', status: 'pending' },
        { name: '获取Token状态', status: 'pending' },
      ],
    },
    {
      title: '💰 钱包系统',
      expanded: true,
      tests: [
        { name: '获取钱包数据', status: 'pending' },
        { name: 'Credits余额检查', status: 'pending' },
        { name: 'Coins余额检查', status: 'pending' },
      ],
    },
    {
      title: '🛒 商品与支付',
      expanded: false,
      tests: [
        { name: '获取充值商品列表', status: 'pending' },
        { name: '获取月卡商品列表', status: 'pending' },
        { name: '创建支付单测试', status: 'pending' },
        { name: '模拟支付成功', status: 'pending' },
      ],
    },
    {
      title: '🎫 月卡会员',
      expanded: false,
      tests: [
        { name: '获取月卡状态', status: 'pending' },
        { name: '每日签到领取', status: 'pending' },
      ],
    },
    {
      title: '📋 任务中心',
      expanded: false,
      tests: [
        { name: '获取今日任务', status: 'pending' },
        { name: '完成任务测试', status: 'pending' },
        { name: '领取任务奖励', status: 'pending' },
      ],
    },
    {
      title: '👤 用户信息',
      expanded: false,
      tests: [
        { name: '获取用户资料', status: 'pending' },
      ],
    },
  ]);

  const [autoTestRunning, setAutoTestRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // 添加日志
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  // 更新测试结果
  const updateTest = (sectionIndex: number, testIndex: number, updates: Partial<TestResult>) => {
    setSections(prev => {
      const newSections = [...prev];
      newSections[sectionIndex].tests[testIndex] = {
        ...newSections[sectionIndex].tests[testIndex],
        ...updates,
      };
      return newSections;
    });
  };

  // 切换分组展开/收起
  const toggleSection = (index: number) => {
    setSections(prev => {
      const newSections = [...prev];
      newSections[index].expanded = !newSections[index].expanded;
      return newSections;
    });
  };

  // ===== 测试函数 =====

  // 1. 认证系统测试
  const testAuth = async () => {
    const sectionIndex = 0;
    
    // 测试1: 模拟登录
    try {
      updateTest(sectionIndex, 0, { status: 'running' });
      addLog('开始测试：模拟登录...');
      
      const startTime = Date.now();
      const response = await BackendAPI.loginMock(1);
      const duration = Date.now() - startTime;
      
      if (response.code === 200 && response.data?.access_token) {
        updateTest(sectionIndex, 0, {
          status: 'success',
          message: `登录成功！Token: ${response.data.access_token.substring(0, 20)}...`,
          data: response.data,
          duration,
        });
        addLog(`✅ 登录成功，耗时 ${duration}ms`);
      } else {
        throw new Error('登录响应格式错误');
      }
    } catch (error: any) {
      updateTest(sectionIndex, 0, {
        status: 'error',
        message: error.message,
      });
      addLog(`❌ 登录失败: ${error.message}`);
    }
    
    // 测试2: 获取Token状态
    try {
      updateTest(sectionIndex, 1, { status: 'running' });
      addLog('检查Token状态...');
      
      const token = await BackendAPI.getAuthToken();
      if (token) {
        updateTest(sectionIndex, 1, {
          status: 'success',
          message: `Token已保存: ${token.substring(0, 30)}...`,
        });
        addLog(`✅ Token状态正常`);
      } else {
        throw new Error('Token未找到');
      }
    } catch (error: any) {
      updateTest(sectionIndex, 1, {
        status: 'error',
        message: error.message,
      });
      addLog(`❌ Token检查失败: ${error.message}`);
    }
  };

  // 2. 钱包系统测试
  const testWallet = async () => {
    const sectionIndex = 1;
    
    // 测试1: 获取钱包数据
    try {
      updateTest(sectionIndex, 0, { status: 'running' });
      addLog('开始测试：获取钱包数据...');
      
      const startTime = Date.now();
      const response = await BackendAPI.getMyWallet();
      const duration = Date.now() - startTime;
      
      if (response.code === 200 && response.data) {
        updateTest(sectionIndex, 0, {
          status: 'success',
          message: `成功获取钱包数据`,
          data: response.data,
          duration,
        });
        addLog(`✅ 钱包数据加载成功，耗时 ${duration}ms`);
        
        // 测试2: Credits余额
        updateTest(sectionIndex, 1, {
          status: 'success',
          message: `当前Credits: ${response.data.balance_credits}`,
          data: { credits: response.data.balance_credits },
        });
        addLog(`💎 Credits余额: ${response.data.balance_credits}`);
        
        // 测试3: Coins余额
        updateTest(sectionIndex, 2, {
          status: 'success',
          message: `当前Coins: ${response.data.balance_coins.toFixed(2)}`,
          data: { coins: response.data.balance_coins },
        });
        addLog(`🪙 Coins余额: ${response.data.balance_coins.toFixed(2)}`);
      } else {
        throw new Error('钱包数据格式错误');
      }
    } catch (error: any) {
      updateTest(sectionIndex, 0, {
        status: 'error',
        message: error.message,
      });
      updateTest(sectionIndex, 1, { status: 'error', message: '无法获取钱包数据' });
      updateTest(sectionIndex, 2, { status: 'error', message: '无法获取钱包数据' });
      addLog(`❌ 钱包测试失败: ${error.message}`);
    }
  };

  // 3. 商品与支付测试
  const testProducts = async () => {
    const sectionIndex = 2;
    
    // 测试1: 获取充值商品
    try {
      updateTest(sectionIndex, 0, { status: 'running' });
      addLog('开始测试：获取充值商品列表...');
      
      const startTime = Date.now();
      const response = await BackendAPI.getProducts('recharge');
      const duration = Date.now() - startTime;
      
      if (response.code === 200 && response.data?.items) {
        updateTest(sectionIndex, 0, {
          status: 'success',
          message: `找到 ${response.data.items.length} 个充值商品`,
          data: response.data.items,
          duration,
        });
        addLog(`✅ 充值商品加载成功，共 ${response.data.items.length} 个，耗时 ${duration}ms`);
        
        // 测试3和4: 创建支付单并模拟支付（使用充值商品）
        if (response.data.items.length > 0) {
          const firstRechargeProduct = response.data.items[0];
          
          // 创建支付单
          try {
            updateTest(sectionIndex, 2, { status: 'running' });
            addLog(`创建支付单：商品ID ${firstRechargeProduct.product_id} (${firstRechargeProduct.name})...`);
            
            const createTime = Date.now();
            const paymentResponse = await BackendAPI.createPayment(firstRechargeProduct.product_id, 'mock');
            const createDuration = Date.now() - createTime;
            
            if (paymentResponse.code === 200 && paymentResponse.data) {
              updateTest(sectionIndex, 2, {
                status: 'success',
                message: `支付单创建成功，ID: ${paymentResponse.data.payment_id}`,
                data: paymentResponse.data,
                duration: createDuration,
              });
              addLog(`✅ 支付单创建成功，ID: ${paymentResponse.data.payment_id}，耗时 ${createDuration}ms`);
              
              // 模拟支付成功
              try {
                updateTest(sectionIndex, 3, { status: 'running' });
                addLog(`模拟支付成功：支付单ID ${paymentResponse.data.payment_id}...`);
                
                const callbackTime = Date.now();
                const callbackResponse = await BackendAPI.mockPaymentCallback(paymentResponse.data.payment_id, true);
                const callbackDuration = Date.now() - callbackTime;
                
                if (callbackResponse.code === 200) {
                  updateTest(sectionIndex, 3, {
                    status: 'success',
                    message: `支付成功，状态: ${callbackResponse.data.status}`,
                    data: callbackResponse.data,
                    duration: callbackDuration,
                  });
                  addLog(`✅ 支付成功，耗时 ${callbackDuration}ms`);
                } else {
                  throw new Error('支付回调失败');
                }
              } catch (error: any) {
                updateTest(sectionIndex, 3, {
                  status: 'error',
                  message: error.message,
                });
                addLog(`❌ 支付回调失败: ${error.message}`);
              }
            } else {
              throw new Error('支付单创建失败');
            }
          } catch (error: any) {
            updateTest(sectionIndex, 2, {
              status: 'error',
              message: error.message,
            });
            updateTest(sectionIndex, 3, { status: 'error', message: '前置条件未满足' });
            addLog(`❌ 支付单创建失败: ${error.message}`);
          }
        } else {
          updateTest(sectionIndex, 2, { status: 'error', message: '没有可用的商品' });
          updateTest(sectionIndex, 3, { status: 'error', message: '前置条件未满足' });
        }
      } else {
        throw new Error('商品数据格式错误');
      }
    } catch (error: any) {
      updateTest(sectionIndex, 0, {
        status: 'error',
        message: error.message,
      });
      addLog(`❌ 充值商品加载失败: ${error.message}`);
    }
    
    // 测试2: 获取月卡商品
    try {
      updateTest(sectionIndex, 1, { status: 'running' });
      addLog('开始测试：获取月卡商品列表...');
      
      const startTime = Date.now();
      const response = await BackendAPI.getProducts('subscription');
      const duration = Date.now() - startTime;
      
      if (response.code === 200 && response.data?.items) {
        updateTest(sectionIndex, 1, {
          status: 'success',
          message: `找到 ${response.data.items.length} 个月卡商品`,
          data: response.data.items,
          duration,
        });
        addLog(`✅ 月卡商品加载成功，共 ${response.data.items.length} 个，耗时 ${duration}ms`);
      } else {
        throw new Error('月卡商品数据格式错误');
      }
    } catch (error: any) {
      updateTest(sectionIndex, 1, {
        status: 'error',
        message: error.message,
      });
      addLog(`❌ 月卡商品加载失败: ${error.message}`);
    }
  };

  // 4. 月卡会员测试
  const testSubscription = async () => {
    const sectionIndex = 3;
    
    // 测试1: 获取月卡状态
    try {
      updateTest(sectionIndex, 0, { status: 'running' });
      addLog('开始测试：获取月卡状态...');
      
      const startTime = Date.now();
      const response = await BackendAPI.getMySubscription();
      const duration = Date.now() - startTime;
      
      if (response.code === 200) {
        if (response.data) {
          updateTest(sectionIndex, 0, {
            status: 'success',
            message: `月卡有效，剩余 ${response.data.days_remaining} 天`,
            data: response.data,
            duration,
          });
          addLog(`✅ 月卡状态：有效，剩余 ${response.data.days_remaining} 天，耗时 ${duration}ms`);
          
          // 测试2: 每日签到
          try {
            updateTest(sectionIndex, 1, { status: 'running' });
            addLog('尝试每日签到领取...');
            
            const claimTime = Date.now();
            const claimResponse = await BackendAPI.claimDailyReward();
            const claimDuration = Date.now() - claimTime;
            
            if (claimResponse.code === 200) {
              updateTest(sectionIndex, 1, {
                status: 'success',
                message: `签到成功，获得 ${claimResponse.data.credits_amount} Credits`,
                data: claimResponse.data,
                duration: claimDuration,
              });
              addLog(`✅ 签到成功，获得 ${claimResponse.data.credits_amount} Credits，耗时 ${claimDuration}ms`);
            } else {
              throw new Error(claimResponse.message || '签到失败');
            }
          } catch (error: any) {
            updateTest(sectionIndex, 1, {
              status: 'error',
              message: error.message,
            });
            addLog(`❌ 签到失败: ${error.message}`);
          }
        } else {
          updateTest(sectionIndex, 0, {
            status: 'success',
            message: '未购买月卡',
            duration,
          });
          updateTest(sectionIndex, 1, { status: 'error', message: '需要先购买月卡' });
          addLog(`⚠️ 未购买月卡，耗时 ${duration}ms`);
        }
      } else {
        throw new Error('获取月卡状态失败');
      }
    } catch (error: any) {
      updateTest(sectionIndex, 0, {
        status: 'error',
        message: error.message,
      });
      updateTest(sectionIndex, 1, { status: 'error', message: '前置条件未满足' });
      addLog(`❌ 月卡测试失败: ${error.message}`);
    }
  };

  // 5. 任务中心测试
  const testTasks = async () => {
    const sectionIndex = 4;
    
    // 测试1: 获取今日任务
    try {
      updateTest(sectionIndex, 0, { status: 'running' });
      addLog('开始测试：获取今日任务...');
      
      const startTime = Date.now();
      const response = await BackendAPI.getTodayTasks();
      const duration = Date.now() - startTime;
      
      if (response.code === 200 && response.data?.items) {
        const tasks = response.data.items;
        updateTest(sectionIndex, 0, {
          status: 'success',
          message: `今日共有 ${tasks.length} 个任务`,
          data: tasks,
          duration,
        });
        addLog(`✅ 任务加载成功，共 ${tasks.length} 个，耗时 ${duration}ms`);
        
        // 测试2和3: 完成任务并领取奖励
        if (tasks.length > 0) {
          const firstTask = tasks[0];
          
          // 完成任务
          if (firstTask.status === 'pending') {
            try {
              updateTest(sectionIndex, 1, { status: 'running' });
              addLog(`完成任务：${firstTask.task_key}...`);
              
              const completeTime = Date.now();
              const completeResponse = await BackendAPI.completeTask(firstTask.task_key);
              const completeDuration = Date.now() - completeTime;
              
              if (completeResponse.code === 200) {
                updateTest(sectionIndex, 1, {
                  status: 'success',
                  message: `任务完成：${firstTask.task_key}`,
                  data: completeResponse.data,
                  duration: completeDuration,
                });
                addLog(`✅ 任务完成，耗时 ${completeDuration}ms`);
                
                // 领取奖励
                try {
                  updateTest(sectionIndex, 2, { status: 'running' });
                  addLog(`领取奖励：${firstTask.task_key}...`);
                  
                  const claimTime = Date.now();
                  const claimResponse = await BackendAPI.claimTaskReward(firstTask.task_key);
                  const claimDuration = Date.now() - claimTime;
                  
                  if (claimResponse.code === 200) {
                    updateTest(sectionIndex, 2, {
                      status: 'success',
                      message: `奖励已领取：${claimResponse.data.reward_credits} Credits`,
                      data: claimResponse.data,
                      duration: claimDuration,
                    });
                    addLog(`✅ 奖励领取成功，耗时 ${claimDuration}ms`);
                  } else {
                    throw new Error('领取奖励失败');
                  }
                } catch (error: any) {
                  updateTest(sectionIndex, 2, {
                    status: 'error',
                    message: error.message,
                  });
                  addLog(`❌ 领取奖励失败: ${error.message}`);
                }
              } else {
                throw new Error('完成任务失败');
              }
            } catch (error: any) {
              updateTest(sectionIndex, 1, {
                status: 'error',
                message: error.message,
              });
              updateTest(sectionIndex, 2, { status: 'error', message: '前置条件未满足' });
              addLog(`❌ 完成任务失败: ${error.message}`);
            }
          } else {
            updateTest(sectionIndex, 1, { status: 'error', message: `任务状态为 ${firstTask.status}，无法完成` });
            updateTest(sectionIndex, 2, { status: 'error', message: '前置条件未满足' });
            addLog(`⚠️ 任务 ${firstTask.task_key} 状态为 ${firstTask.status}`);
          }
        } else {
          updateTest(sectionIndex, 1, { status: 'error', message: '没有可用任务' });
          updateTest(sectionIndex, 2, { status: 'error', message: '前置条件未满足' });
        }
      } else {
        throw new Error('任务数据格式错误');
      }
    } catch (error: any) {
      updateTest(sectionIndex, 0, {
        status: 'error',
        message: error.message,
      });
      updateTest(sectionIndex, 1, { status: 'error', message: '前置条件未满足' });
      updateTest(sectionIndex, 2, { status: 'error', message: '前置条件未满足' });
      addLog(`❌ 任务测试失败: ${error.message}`);
    }
  };

  // 6. 用户信息测试
  const testUser = async () => {
    const sectionIndex = 5;
    
    try {
      updateTest(sectionIndex, 0, { status: 'running' });
      addLog('开始测试：获取用户资料...');
      
      const startTime = Date.now();
      const response = await BackendAPI.getUserProfile();
      const duration = Date.now() - startTime;
      
      if (response.code === 200 && response.data) {
        updateTest(sectionIndex, 0, {
          status: 'success',
          message: `用户: ${response.data.nickname || '未设置昵称'}`,
          data: response.data,
          duration,
        });
        addLog(`✅ 用户资料加载成功，耗时 ${duration}ms`);
      } else {
        throw new Error('用户数据格式错误');
      }
    } catch (error: any) {
      updateTest(sectionIndex, 0, {
        status: 'error',
        message: error.message,
      });
      addLog(`❌ 用户资料加载失败: ${error.message}`);
    }
  };

  // 自动测试所有功能
  const runAllTests = async () => {
    setAutoTestRunning(true);
    setLogs([]);
    addLog('🚀 开始自动化测试...');
    addLog('━━━━━━━━━━━━━━━━━━━━━━');
    
    await testAuth();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testWallet();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testProducts();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testSubscription();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testTasks();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testUser();
    
    addLog('━━━━━━━━━━━━━━━━━━━━━━');
    addLog('✅ 自动化测试完成！');
    setAutoTestRunning(false);
  };

  // 渲染状态图标
  const renderStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[90vh] bg-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-700 flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">🧪 系统测试控制台</h2>
            <p className="text-sm text-gray-400 mt-1">SkyRiff 后端API完整测试</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={runAllTests}
              disabled={autoTestRunning}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              {autoTestRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  测试中...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  自动测试全部
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>

        {/* 主体内容 */}
        <div className="flex-1 overflow-hidden flex gap-4 p-6">
          {/* 左侧：测试列表 */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {/* 后端健康检查 */}
            <BackendHealthCheck />
            
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="bg-[#242424] rounded-lg overflow-hidden border border-gray-700">
                {/* 分组标题 */}
                <button
                  onClick={() => toggleSection(sectionIndex)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {section.expanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                    <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                    <span className="text-sm text-gray-500">
                      ({section.tests.filter(t => t.status === 'success').length}/{section.tests.length})
                    </span>
                  </div>
                </button>

                {/* 测试项列表 */}
                {section.expanded && (
                  <div className="p-4 pt-0 space-y-2">
                    {section.tests.map((test, testIndex) => (
                      <div
                        key={testIndex}
                        className="flex items-start gap-3 p-3 bg-[#1a1a1a] rounded-lg border border-gray-800"
                      >
                        {renderStatusIcon(test.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-white font-medium">{test.name}</p>
                            {test.duration && (
                              <span className="text-xs text-gray-500">{test.duration}ms</span>
                            )}
                          </div>
                          {test.message && (
                            <p className={`text-sm mt-1 ${
                              test.status === 'error' ? 'text-red-400' : 'text-gray-400'
                            }`}>
                              {test.message}
                            </p>
                          )}
                          {test.data && (
                            <details className="mt-2">
                              <summary className="text-xs text-blue-400 cursor-pointer hover:underline">
                                查看详细数据
                              </summary>
                              <pre className="mt-2 p-2 bg-black/50 rounded text-xs text-gray-300 overflow-x-auto">
                                {JSON.stringify(test.data, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 右侧：实时日志 */}
          <div className="w-1/3 bg-[#0a0a0a] rounded-lg border border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">📝 实时日志</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1">
              {logs.length === 0 ? (
                <p className="text-gray-500 text-center mt-8">等待测试...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="text-gray-300">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 底部统计 */}
        <div className="border-t border-gray-700 p-4 bg-[#242424]">
          <div className="flex items-center justify-between text-sm">
            <div className="flex gap-6">
              <span className="text-green-400">
                ✅ 成功: {sections.reduce((sum, s) => sum + s.tests.filter(t => t.status === 'success').length, 0)}
              </span>
              <span className="text-red-400">
                ❌ 失败: {sections.reduce((sum, s) => sum + s.tests.filter(t => t.status === 'error').length, 0)}
              </span>
              <span className="text-gray-400">
                📊 总计: {sections.reduce((sum, s) => sum + s.tests.length, 0)} 项
              </span>
            </div>
            <span className="text-gray-500">
              后端地址: {API_CONFIG.BASE_URL}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}