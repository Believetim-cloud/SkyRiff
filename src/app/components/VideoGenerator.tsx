/**
 * 视频生成对话框组件
 */

import { useState } from 'react';
import { X, Sparkles, Image as ImageIcon, Upload, Link as LinkIcon, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { MODEL_METADATA, MODELS } from '../services/api-config';
import type { VideoGenerationTask } from '../services/api-types';
import { createProcessingVideo, getLocalVideo, saveLocalVideo } from '../services/storage';
import { getAuthToken, createTask, getTaskStatus, getVideoAsset, uploadImage } from '../services/backend-api';
import { MobileKeyboard } from './MobileKeyboard';

interface VideoGeneratorProps {
  onClose: () => void;
  onVideoGenerated?: (videoId: string) => void;
  initialMode?: 'text' | 'image';
  initialPrompt?: string;
  initialImage?: string;
  hideOverlay?: boolean; // 新增：是否隐藏背景遮罩
  hideCloseButton?: boolean; // 新增：是否隐藏关闭按钮
}

export function VideoGenerator({ 
  onClose, 
  onVideoGenerated,
  initialMode = 'text',
  initialPrompt = '',
  initialImage = '',
  hideOverlay = false, // 新增：默认不隐藏背景遮罩
  hideCloseButton = false, // 新增：默认显示关闭按钮
}: VideoGeneratorProps) {
  const [mode, setMode] = useState<'text' | 'image'>(initialMode);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [imageUrl, setImageUrl] = useState(initialImage);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedModel, setSelectedModel] = useState(MODELS.PORTRAIT_15S);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [checkingStep, setCheckingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [generatedVideoId, setGeneratedVideoId] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  // 生成次数统计
  const [generationCount, setGenerationCount] = useState(0);
  // 键盘显示状态
  const [showKeyboard, setShowKeyboard] = useState(true);

  const selectedModelMeta = MODEL_METADATA.find(m => m.id === selectedModel);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // 创建预览URL
      const previewUrl = URL.createObjectURL(file);
      setImageUrl(previewUrl);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('请输入提示词');
      return;
    }

    if (mode === 'image' && !imageUrl && !imageFile) {
      setError('请上传图片或输入图片URL');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedVideoId(null);
    setGeneratedVideoUrl(null);

    let videoId = '';

    try {
      // 创建生成中的视频任务
      const modelMeta = MODEL_METADATA.find(m => m.id === selectedModel);
      videoId = createProcessingVideo(
        prompt.slice(0, 50) || '视频生成中',
        prompt,
        modelMeta?.duration || 15,
        modelMeta?.orientation || 'portrait',
        modelMeta?.quality || 'standard'
      );

      // 增加生成次数
      setGenerationCount(prev => prev + 1);

      const token = await getAuthToken();
      if (token) {
        const duration = modelMeta?.duration || 15;
        const ratio = (modelMeta?.orientation || 'portrait') === 'portrait' ? '9:16' : '16:9';
        try {
          let refImageId: number | undefined = undefined;
          if (mode === 'image') {
            if (imageFile) {
              const up = await uploadImage(imageFile);
              refImageId = up.data?.asset_id;
            } else if (imageUrl) {
              try {
                const resp = await fetch(imageUrl);
                const blob = await resp.blob();
                const ext = blob.type.includes('png') ? 'png' : (blob.type.includes('webp') ? 'webp' : 'jpg');
                const file = new File([blob], `image-from-url.${ext}`, { type: blob.type || 'image/jpeg' });
                const up = await uploadImage(file);
                refImageId = up.data?.asset_id;
              } catch {}
            }
          }
          const created = await createTask({
            prompt,
            duration_sec: duration,
            ratio,
            reference_image_asset_id: refImageId,
            model: selectedModel,
          });
          
          if (created.code === 200 && created.data?.task_id) {
            const taskId = created.data.task_id;
            // 保存后端任务ID
            const lv = getLocalVideo(videoId);
            if (lv) {
              lv.backendTaskId = taskId;
              saveLocalVideo(lv);
            }

            // 通知外部组件生成完成
            if (onVideoGenerated) {
              onVideoGenerated(videoId);
            }

            // 显示成功状态
            setGeneratedVideoId(videoId);
            setIsGenerating(false);

            let attempts = 0;
            const maxAttempts = 360;
            const intervalMs = 2000;
            const timer = setInterval(async () => {
              attempts++;
              try {
                const status = await getTaskStatus(taskId);
                if (status.success && status.data) {
                  const lv = getLocalVideo(videoId);
                  if (lv) {
                    lv.progress = status.data.progress || lv.progress;
                    lv.status = status.data.status === 'IN_PROGRESS' ? 'processing' : lv.status;
                    saveLocalVideo(lv);
                  }
                  if (status.data.status === 'SUCCESS' && status.data.video_id) {
                    clearInterval(timer);
                    try {
                      const asset = await getVideoAsset(status.data.video_id);
                      const url = asset.data?.watermarked_play_url;
                      const v = getLocalVideo(videoId);
                      if (v) {
                        v.status = 'success';
                        v.progress = 100;
                        v.backendVideoId = status.data.video_id; // 保存后端视频ID
                        if (url) {
                          v.videoUrl = url;
                          v.thumbnailUrl = url;
                          setGeneratedVideoUrl(url || null);
                        }
                        v.completedAt = Date.now();
                        saveLocalVideo(v);
                        window.dispatchEvent(new CustomEvent('video-generation-complete', { detail: { videoId } }));
                      }
                    } catch {}
                  } else if (status.data.status === 'FAILURE') {
                    clearInterval(timer);
                    const v = getLocalVideo(videoId);
                    if (v) {
                      v.status = 'failed';
                      v.progress = 0;
                      saveLocalVideo(v);
                    }
                    setError(status.data.error_message || '生成失败');
                  }
                }
              } catch {}
              if (attempts >= maxAttempts) {
                clearInterval(timer);
              }
            }, intervalMs);
          } else {
             throw new Error(created.error?.message || '创建任务失败');
          }
        } catch (e) {
             throw e;
        }
      } else {
          // 离线模式或无Token，保持原有模拟逻辑
          // ... (Existing fallback logic if needed, but for now we assume online)
           if (onVideoGenerated) {
            onVideoGenerated(videoId);
          }
          setGeneratedVideoId(videoId);
          setIsGenerating(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
      // 标记本地视频为失败
      if (videoId) {
          const lv = getLocalVideo(videoId);
          if (lv) {
              lv.status = 'failed';
              lv.error = err instanceof Error ? err.message : '创建失败';
              lv.progress = 0;
              saveLocalVideo(lv);
          }
      }
      setIsGenerating(false);
    }
  };

  // 处理关闭，重置计数器
  const handleClose = () => {
    setGenerationCount(0);
    onClose();
  };

  return (
    <div 
      className={`fixed inset-0 z-[60] ${hideOverlay ? '' : 'bg-gradient-to-b from-gray-600/60 via-gray-400/50 to-gray-600/60 backdrop-blur-xl'} w-full max-w-[calc(100vh*9/16)] mx-auto left-0 right-0`}
      onClick={handleClose} // 点击背景遮罩关闭
    >
      {/* 弹窗内容 - 绝对定位在键盘上方 */}
      <div 
        className="absolute bottom-[40vh] left-0 right-0 w-full sm:w-auto sm:min-w-[28rem] sm:max-w-lg sm:mx-auto bg-[var(--color-background)] rounded-t-3xl overflow-hidden flex flex-col max-h-[55vh] animate-slideInFromBottom"
        onClick={(e) => e.stopPropagation()} // 阻止事件冒泡，防止点击内容区域时关闭
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] flex-shrink-0">
          <h2 className="text-[var(--color-text-primary)]">创作视频</h2>
          {!hideCloseButton && (
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-[var(--color-surface)] transition-colors"
            >
              <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
            </button>
          )}
        </div>

        {/* 生成次数统计 */}
        {generationCount > 0 && (
          <div className="px-4 py-2 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-text-secondary)] text-center">
              当前已生成 <span className="text-[var(--color-primary)] font-medium">{generationCount}</span> 次
            </p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 模式选择 */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode('text')}
              className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex flex-col items-center gap-1 ${
                mode === 'text'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-xs">文生视频</span>
            </button>
            <button
              onClick={() => setMode('image')}
              className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex flex-col items-center gap-1 ${
                mode === 'image'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span className="text-xs">图生视频</span>
            </button>
          </div>

          {/* 图片上传/URL (仅图生视频模式) */}
          {mode === 'image' && (
            <div className="space-y-2">
              <label className="block text-xs text-[var(--color-text-secondary)]">
                上传图片或输入URL
              </label>
              
              {/* 图片预览 */}
              {imageUrl && (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[var(--color-surface)]">
                  <img
                    src={imageUrl}
                    alt="预览"
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={() => {
                      setImageUrl('');
                      setImageFile(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}

              {/* 上传按钮 */}
              <label className="block py-2.5 px-4 rounded-xl bg-[var(--color-surface)] text-[var(--color-text-primary)] text-center cursor-pointer hover:bg-[var(--color-surface-elevated)] transition-colors text-sm">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                选择图片文件
              </label>

              {/* URL输入 */}
              <input
                type="text"
                value={imageFile ? '' : imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="或输入图片URL"
                disabled={!!imageFile}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm disabled:opacity-50"
              />
            </div>
          )}

          {/* 提示词输入 */}
          <div className="space-y-2">
            <label className="block text-xs text-[var(--color-text-secondary)]">
              {mode === 'text' ? '描述您想要的视频' : '描述如何处理图片'}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={mode === 'text' ? '例如：可爱的狗 开飞机' : '例如：让画面动起来'}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none text-sm"
            />
          </div>

          {/* 模型选择 */}
          <div className="space-y-2">
            <label className="block text-xs text-[var(--color-text-secondary)]">
              选择模型
            </label>
            <div className="grid grid-cols-2 gap-2">
              {MODEL_METADATA.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`p-2.5 rounded-xl text-left transition-all ${
                    selectedModel === model.id
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-[var(--color-surface)] text-[var(--color-text-primary)]'
                  }`}
                >
                  <div className="font-medium text-xs">{model.name}</div>
                  <div className={`text-xs mt-0.5 ${
                    selectedModel === model.id
                      ? 'text-white/70'
                      : 'text-[var(--color-text-tertiary)]'
                  }`}>
                    {model.estimatedTime}
                  </div>
                </button>
              ))}
            </div>
            {selectedModelMeta && (
              <p className="text-xs text-[var(--color-text-tertiary)]">
                预计生成时间：{selectedModelMeta.estimatedTime}
              </p>
            )}
          </div>

          {/* 检查步骤显示 */}
          {isGenerating && (
            <div className="space-y-3 p-4 rounded-xl bg-[var(--color-surface)]">
              <div className="flex items-center gap-3">
                <Loader className="w-5 h-5 animate-spin text-[var(--color-primary)]" />
                <span className="text-sm text-[var(--color-text-primary)]">
                  {checkingStep}
                </span>
              </div>
            </div>
          )}

          {/* 成功消息 */}
          {generatedVideoId && !isGenerating && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-green-500 font-medium mb-1">生成成功！</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    视频已添加到资产页面，正在生成中...
                  </p>
                </div>
              </div>
            </div>
          )}

          {(generatedVideoUrl || (generatedVideoId && getLocalVideo(generatedVideoId)?.videoUrl)) && (
            <div className="rounded-xl overflow-hidden bg-black">
              <video
                src={generatedVideoUrl || getLocalVideo(generatedVideoId!)?.videoUrl || ''}
                controls
                playsInline
                className="w-full h-auto max-h-[40vh]"
              />
            </div>
          )}

          {/* 错误消息 */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-500 font-medium">生成失败</p>
                  <p className="text-sm text-red-400 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[var(--color-border)] flex gap-3 flex-shrink-0">
          {!hideCloseButton && (
            <button
              onClick={handleClose}
              className="flex-1 py-3 rounded-xl bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-colors text-sm"
            >
              取消
            </button>
          )}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <Loader className="w-5 h-5 animate-spin" />
                生成中...
              </span>
            ) : (
              '开始生成'
            )}
          </button>
        </div>
      </div>

      {/* Mobile Keyboard - 独立在底部 */}
      {showKeyboard && (
        <div 
          className="w-full max-w-[calc(100vh*9/16)] absolute bottom-0 left-0 right-0 mx-auto"
          onClick={(e) => e.stopPropagation()} // 阻止事件冒泡
        >
          <MobileKeyboard />
        </div>
      )}
    </div>
  );
}
