/**
 * API配置文件
 * 包含所有Sora2 API的配置信息
 */

// ==================== API配置 ====================

export const API_CONFIG = {
  // 🔧 开发模式：优先使用环境变量，否则回退到本地Mock
  // 在 .env 文件中设置 VITE_API_BASE_URL=http://192.168.x.x:8000 可用于真机调试
  // 注意：后端服务现在默认运行在 8001 端口
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001',
  API_KEY: import.meta.env.VITE_API_KEY || 'mock-api-key-for-development',
  
  // 🚀 生产模式配置
  // 生产环境会自动读取 .env.production 中的 VITE_API_BASE_URL
  
  // 轮询配置
  POLLING: {
    INTERVAL: 5000,        // 轮询间隔：5秒
    MAX_ATTEMPTS: 360,     // 最大尝试次数：360次 = 30分钟
    INITIAL_DELAY: 2000,   // 初始延迟：2秒
  },
  
  // 超时配置
  TIMEOUT: {
    REQUEST: 30000,        // 请求超时：30秒
    UPLOAD: 120000,        // 上传超时：2分钟
  },
};

// API端点
export const API_ENDPOINTS = {
  // 视频生成
  VIDEO_GENERATION: '/v1/videos',
  VIDEO_STATUS: (videoId: string) => `/v1/videos/${videoId}`,
  VIDEO_CONTENT: (videoId: string) => `/v1/videos/${videoId}/content`,
  
  // Chat兼容模式
  CHAT_COMPLETIONS: '/v1/chat/completions',
};

// 可用模型列表
export const MODELS = {
  // 普通模式 (3-5分钟)
  LANDSCAPE_10S: 'sora2-landscape',
  PORTRAIT_10S: 'sora2-portrait',
  LANDSCAPE_15S: 'sora2-landscape-15s',
  PORTRAIT_15S: 'sora2-portrait-15s',
  
  // Pro模式 (15-30分钟)
  PRO_LANDSCAPE_25S: 'sora2-pro-landscape-25s',
  PRO_PORTRAIT_25S: 'sora2-pro-portrait-25s',
  PRO_LANDSCAPE_HD_15S: 'sora2-pro-landscape-hd-15s',
  PRO_PORTRAIT_HD_15S: 'sora2-pro-portrait-hd-15s',
  
  // 去水印模型
  WATERMARK_REMOVAL_DRAFT: 'sora-drafts-url',
  WATERMARK_REMOVAL_POST: 'sora_url',
};

// 模型元数据
export const MODEL_METADATA = [
  {
    id: MODELS.PORTRAIT_10S,
    name: '竖屏 10秒',
    orientation: 'portrait',
    duration: 10,
    quality: 'standard',
    estimatedTime: '3-5分钟',
    type: 'productivity',
  },
  {
    id: MODELS.LANDSCAPE_10S,
    name: '横屏 10秒',
    orientation: 'landscape',
    duration: 10,
    quality: 'standard',
    estimatedTime: '3-5分钟',
    type: 'productivity',
  },
  {
    id: MODELS.PORTRAIT_15S,
    name: '竖屏 15秒',
    orientation: 'portrait',
    duration: 15,
    quality: 'standard',
    estimatedTime: '3-5分钟',
    type: 'productivity',
  },
  {
    id: MODELS.LANDSCAPE_15S,
    name: '横屏 15秒',
    orientation: 'landscape',
    duration: 15,
    quality: 'standard',
    estimatedTime: '3-5分钟',
    type: 'productivity',
  },
  {
    id: MODELS.PRO_PORTRAIT_25S,
    name: '竖屏 25秒 Pro',
    orientation: 'portrait',
    duration: 25,
    quality: 'pro',
    estimatedTime: '15-30分钟',
    type: 'creative',
  },
  {
    id: MODELS.PRO_LANDSCAPE_25S,
    name: '横屏 25秒 Pro',
    orientation: 'landscape',
    duration: 25,
    quality: 'pro',
    estimatedTime: '15-30分钟',
    type: 'creative',
  },
  {
    id: MODELS.PRO_PORTRAIT_HD_15S,
    name: '竖屏 15秒 HD',
    orientation: 'portrait',
    duration: 15,
    quality: 'hd',
    estimatedTime: '15-30分钟',
    type: 'creative',
  },
  {
    id: MODELS.PRO_LANDSCAPE_HD_15S,
    name: '横屏 15秒 HD',
    orientation: 'landscape',
    duration: 15,
    quality: 'hd',
    estimatedTime: '15-30分钟',
    type: 'creative',
  },
];