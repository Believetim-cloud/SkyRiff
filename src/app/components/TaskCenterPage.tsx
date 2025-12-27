import { useState, useEffect } from 'react';
import { ArrowLeft, Target, CheckCircle, Circle, Gift, Loader2 } from 'lucide-react';
import { getTodayTasks, completeTask, claimTaskReward, DailyTask } from '../services/backend-api';

interface TaskCenterPageProps {
  onBack: () => void;
}

export function TaskCenterPage({ onBack }: TaskCenterPageProps) {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingTask, setProcessingTask] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await getTodayTasks();
      if (response.code === 200) {
        setTasks(response.data.items);
      }
    } catch (err: any) {
      console.error('❌ 加载任务失败：', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskKey: string) => {
    setProcessingTask(taskKey);
    
    try {
      await completeTask(taskKey);
      await loadTasks();
    } catch (err: any) {
      console.error('❌ 完成任务失败：', err);
      alert(err.message);
    } finally {
      setProcessingTask(null);
    }
  };

  const handleClaimReward = async (taskKey: string, rewardCredits: number) => {
    setProcessingTask(taskKey);
    
    try {
      const response = await claimTaskReward(taskKey);
      if (response.code === 200) {
        alert(`✅ 领取成功！\n\n获得 ${rewardCredits} 积分`);
        await loadTasks();
      }
    } catch (err: any) {
      console.error('❌ 领取奖励失败：', err);
      alert(err.message);
    } finally {
      setProcessingTask(null);
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'active':
        return 'from-blue-500 to-cyan-500';
      case 'create':
        return 'from-purple-500 to-pink-500';
      case 'social':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getCategoryName = (category?: string) => {
    switch (category) {
      case 'active':
        return '活跃';
      case 'create':
        return '创作';
      case 'social':
        return '社交';
      default:
        return '任务';
    }
  };

  const completedCount = tasks.filter(t => t.status === 'completed' || t.status === 'claimed').length;
  const totalRewards = tasks.reduce((sum, t) => sum + (t.reward_credits || 0), 0);
  const earnedRewards = tasks.filter(t => t.status === 'claimed').reduce((sum, t) => sum + (t.reward_credits || 0), 0);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 bg-black/20">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Target className="w-6 h-6" />
          任务中心
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
            {/* 统计卡片 */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-8 h-8 text-white" />
                <div>
                  <div className="text-white font-bold text-xl">今日任务</div>
                  <div className="text-white/80 text-sm">完成任务领取积分</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/20 rounded-xl p-3 text-center">
                  <div className="text-white/80 text-xs mb-1">已完成</div>
                  <div className="text-white font-bold text-xl">
                    {completedCount}/{tasks.length}
                  </div>
                </div>

                <div className="bg-white/20 rounded-xl p-3 text-center">
                  <div className="text-white/80 text-xs mb-1">已获得</div>
                  <div className="text-white font-bold text-xl">
                    {earnedRewards}
                  </div>
                </div>

                <div className="bg-white/20 rounded-xl p-3 text-center">
                  <div className="text-white/80 text-xs mb-1">总奖励</div>
                  <div className="text-white font-bold text-xl">
                    {totalRewards}
                  </div>
                </div>
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-200 text-sm">
                {error}
              </div>
            )}

            {/* 任务列表 */}
            <div className="space-y-3">
              {tasks.map((task) => {
                const isPending = task.status === 'pending';
                const isCompleted = task.status === 'completed';
                const isClaimed = task.status === 'claimed';
                const isProcessing = processingTask === task.task_key;

                return (
                  <div
                    key={task.assignment_id}
                    className={`bg-white/10 backdrop-blur-lg rounded-2xl p-5 transition-all ${
                      isClaimed ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* 状态图标 */}
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getCategoryColor(task.category)} flex items-center justify-center flex-shrink-0`}>
                        {isClaimed ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : isCompleted ? (
                          <Gift className="w-6 h-6 text-white animate-bounce" />
                        ) : (
                          <Circle className="w-6 h-6 text-white" />
                        )}
                      </div>

                      {/* 任务信息 */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-semibold">{task.title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r ${getCategoryColor(task.category)} text-white`}>
                            {getCategoryName(task.category)}
                          </span>
                        </div>
                        <p className="text-white/60 text-sm mb-3">{task.description}</p>

                        {/* 奖励 */}
                        <div className="flex items-center gap-2 mb-3">
                          <Gift className="w-4 h-4 text-yellow-300" />
                          <span className="text-yellow-300 font-semibold">
                            +{task.reward_credits} 积分
                          </span>
                        </div>

                        {/* 操作按钮 */}
                        {isPending && (
                          <button
                            onClick={() => handleCompleteTask(task.task_key)}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-all text-sm flex items-center gap-2"
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                处理中...
                              </>
                            ) : (
                              <>完成任务（测试）</>
                            )}
                          </button>
                        )}

                        {isCompleted && (
                          <button
                            onClick={() => handleClaimReward(task.task_key, task.reward_credits || 0)}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-all text-sm flex items-center gap-2 animate-pulse"
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                领取中...
                              </>
                            ) : (
                              <>
                                <Gift className="w-4 h-4" />
                                领取奖励
                              </>
                            )}
                          </button>
                        )}

                        {isClaimed && (
                          <div className="flex items-center gap-2 text-green-400 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            <span>已领取</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 说明 */}
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
              <p className="text-white/80 text-sm font-semibold mb-2">💡 任务说明</p>
              <ul className="text-white/60 text-xs space-y-1">
                <li>• 每天自动分配3个任务</li>
                <li>• 包含：活跃类、创作类、社交类各1个</li>
                <li>• 完成任务后即可领取积分奖励</li>
                <li>• 每个任务奖励2积分，每天最多6积分</li>
                <li>• "完成任务"按钮为测试功能，实际会自动检测</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
