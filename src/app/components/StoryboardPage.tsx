import { useState } from 'react';
import { ArrowLeft, Plus, GripVertical, Trash2, Play } from 'lucide-react';

interface Shot {
  id: string;
  sequence: number;
  duration: number;
  shotType: string;
  cameraMove: string;
  characterConsistency: boolean;
  prompt: string;
}

interface StoryboardPageProps {
  onBack: () => void;
}

export function StoryboardPage({ onBack }: StoryboardPageProps) {
  const [shots, setShots] = useState<Shot[]>([
    {
      id: '1',
      sequence: 1,
      duration: 5,
      shotType: '特写',
      cameraMove: '推进',
      characterConsistency: true,
      prompt: '一位年轻女性抬头仰望星空，眼神充满憧憬',
    },
    {
      id: '2',
      sequence: 2,
      duration: 10,
      shotType: '全景',
      cameraMove: '环绕',
      characterConsistency: true,
      prompt: '未来城市夜景，霓虹灯闪烁，飞行器穿梭',
    },
  ]);

  const addShot = () => {
    const newShot: Shot = {
      id: Date.now().toString(),
      sequence: shots.length + 1,
      duration: 5,
      shotType: '中景',
      cameraMove: '静止',
      characterConsistency: false,
      prompt: '',
    };
    setShots([...shots, newShot]);
  };

  const removeShot = (id: string) => {
    setShots(shots.filter(s => s.id !== id));
  };

  const toggleConsistency = (id: string) => {
    setShots(shots.map(s => 
      s.id === id ? { ...s, characterConsistency: !s.characterConsistency } : s
    ));
  };

  const updateShot = (id: string, field: keyof Shot, value: any) => {
    setShots(shots.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-background)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-[var(--color-surface-elevated)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--color-text-primary)]" />
        </button>
        <h2 className="flex-1">故事版编辑</h2>
        <button
          onClick={addShot}
          className="p-2 rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Shots List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {shots.map((shot) => (
          <div
            key={shot.id}
            className="p-4 rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-border)]"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <button className="cursor-grab active:cursor-grabbing text-[var(--color-text-secondary)]">
                <GripVertical className="w-5 h-5" />
              </button>
              <div className="flex-1 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[var(--color-primary)] text-white text-sm">
                  #{shot.sequence}
                </span>
                <span className="text-sm text-[var(--color-text-secondary)]">镜头</span>
              </div>
              <button
                onClick={() => removeShot(shot.id)}
                className="p-2 rounded-lg hover:bg-[var(--color-error)]/10 text-[var(--color-error)] transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Fields */}
            <div className="space-y-3">
              {/* Duration */}
              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                  时长（秒）
                </label>
                <input
                  type="number"
                  value={shot.duration}
                  onChange={(e) => updateShot(shot.id, 'duration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)]"
                />
              </div>

              {/* Shot Type & Camera Move */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                    景别
                  </label>
                  <select
                    value={shot.shotType}
                    onChange={(e) => updateShot(shot.id, 'shotType', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)]"
                  >
                    <option>特写</option>
                    <option>近景</option>
                    <option>中景</option>
                    <option>全景</option>
                    <option>远景</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                    运镜
                  </label>
                  <select
                    value={shot.cameraMove}
                    onChange={(e) => updateShot(shot.id, 'cameraMove', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)]"
                  >
                    <option>静止</option>
                    <option>推进</option>
                    <option>拉远</option>
                    <option>平移</option>
                    <option>环绕</option>
                    <option>跟随</option>
                  </select>
                </div>
              </div>

              {/* Character Consistency */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-elevated)]">
                <span className="text-sm text-[var(--color-text-primary)]">角色一致性</span>
                <button
                  onClick={() => toggleConsistency(shot.id)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    shot.characterConsistency ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      shot.characterConsistency ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Prompt */}
              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                  镜头描述
                </label>
                <textarea
                  value={shot.prompt}
                  onChange={(e) => updateShot(shot.id, 'prompt', e.target.value)}
                  placeholder="输入这个镜头的详细描述..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] resize-none"
                />
              </div>
            </div>
          </div>
        ))}

        {/* Add Shot Button */}
        <button
          onClick={addShot}
          className="w-full h-40 rounded-[var(--radius-card)] border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors flex items-center justify-center group"
        >
          <Plus className="w-16 h-16 text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)] transition-colors" strokeWidth={1.5} />
        </button>
      </div>

      {/* Bottom Action */}
      <div className="p-4 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
        <button className="w-full py-4 rounded-[var(--radius-button)] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
          <Play className="w-5 h-5" />
          批量生成 {shots.length} 个镜头
        </button>
      </div>
    </div>
  );
}