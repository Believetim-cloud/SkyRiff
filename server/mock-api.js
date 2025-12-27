/**
 * SkyRiff Mock API Server
 * 模拟Sora2 API的所有接口，用于开发和演示
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 存储所有任务
const tasks = new Map();

// 模拟视频URL（使用公开的演示视频）
const DEMO_VIDEOS = [
  // 使用多个真实可播放的视频示例
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
];

// 生成随机视频ID
function generateVideoId() {
  return `video_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
}

// 生成随机视频URL
function getRandomDemoVideo() {
  return DEMO_VIDEOS[Math.floor(Math.random() * DEMO_VIDEOS.length)];
}

// 模拟任务进度更新
function startProgressSimulation(videoId, model) {
  const task = tasks.get(videoId);
  if (!task) return;

  // 根据模型类型确定完成时间
  const isPro = model.includes('pro');
  const totalTime = isPro ? 30000 : 15000; // Pro: 30秒, 标准: 15秒（加速演示）
  const interval = 1000; // 每秒更新
  const increment = 100 / (totalTime / interval);

  const timer = setInterval(() => {
    const currentTask = tasks.get(videoId);
    if (!currentTask) {
      clearInterval(timer);
      return;
    }

    // 更新进度
    currentTask.progress = Math.min(100, currentTask.progress + increment);

    // 状态转换
    if (currentTask.progress > 0 && currentTask.progress < 100) {
      currentTask.status = 'processing';
    } else if (currentTask.progress >= 100) {
      currentTask.status = 'success';
      currentTask.progress = 100;
      currentTask.video_url = getRandomDemoVideo();
      currentTask.completed_at = Math.floor(Date.now() / 1000);
      clearInterval(timer);
    }

    tasks.set(videoId, currentTask);
  }, interval);
}

// ==================== API路由 ====================

// 1. 文生视频 & 2. 图生视频（直接传图）& 3. 图生视频（URL传图）
app.post('/v1/videos', upload.single('input_reference'), (req, res) => {
  try {
    const { prompt, model, size, seconds, image_url } = req.body;
    const hasFile = req.file;

    // 验证必填参数
    if (!prompt || !model) {
      return res.status(400).json({
        error: {
          message: '缺少必填参数：prompt 和 model',
          type: 'invalid_request_error',
        },
      });
    }

    // 验证模型
    const validModels = [
      'sora2-portrait',
      'sora2-landscape',
      'sora2-portrait-15s',
      'sora2-landscape-15s',
      'sora2-pro-portrait-25s',
      'sora2-pro-landscape-25s',
      'sora2-pro-portrait-hd-15s',
      'sora2-pro-landscape-hd-15s',
    ];

    if (!validModels.includes(model)) {
      return res.status(400).json({
        error: {
          message: `无效的模型: ${model}`,
          type: 'invalid_request_error',
        },
      });
    }

    // 创建任务
    const videoId = generateVideoId();
    const timestamp = Math.floor(Date.now() / 1000);

    // 确定视频尺寸
    let videoSize = size || '720x1280';
    if (model.includes('landscape')) {
      videoSize = '1280x720';
    } else if (model.includes('portrait')) {
      videoSize = '720x1280';
    }

    const task = {
      id: videoId,
      object: 'video.generation',
      model: model,
      prompt: prompt,
      status: 'pending',
      progress: 0,
      created_at: timestamp,
      size: videoSize,
      video_url: null,
      completed_at: null,
      // 额外信息
      has_image: hasFile || image_url ? true : false,
      image_url: image_url || null,
    };

    tasks.set(videoId, task);

    // 启动进度模拟
    setTimeout(() => {
      startProgressSimulation(videoId, model);
    }, 500);

    // 返回响应
    res.json({
      id: videoId,
      object: 'video.generation',
      model: model,
      status: 'pending',
      progress: 0,
      created_at: timestamp,
      size: videoSize,
    });

    console.log(`✅ 创建任务: ${videoId} | 模型: ${model} | 提示词: ${prompt}`);
  } catch (error) {
    console.error('❌ 错误:', error);
    res.status(500).json({
      error: {
        message: '服务器内部错误',
        type: 'server_error',
      },
    });
  }
});

// 4. 查询任务进度
app.get('/v1/videos/:video_id', (req, res) => {
  const { video_id } = req.params;

  const task = tasks.get(video_id);

  if (!task) {
    return res.status(404).json({
      error: {
        message: `未找到任务: ${video_id}`,
        type: 'not_found_error',
      },
    });
  }

  // 返回任务信息
  const response = {
    id: task.id,
    object: task.object,
    model: task.model,
    prompt: task.prompt,
    status: task.status,
    progress: Math.round(task.progress),
    created_at: task.created_at,
    size: task.size,
  };

  // 如果已完成，添加视频URL
  if (task.status === 'success') {
    response.video_url = task.video_url;
    response.completed_at = task.completed_at;
  }

  res.json(response);
});

// 5. 查看视频内容（直接返回）
app.get('/v1/videos/:video_id/content', (req, res) => {
  const { video_id } = req.params;

  const task = tasks.get(video_id);

  if (!task) {
    return res.status(404).json({
      error: {
        message: `未找到任务: ${video_id}`,
        type: 'not_found_error',
      },
    });
  }

  if (task.status !== 'success') {
    return res.status(400).json({
      error: {
        message: '视频尚未生成完成',
        type: 'invalid_request_error',
      },
    });
  }

  // 重定向到视频URL
  res.redirect(task.video_url);
});

// 6. Chat兼容模式
app.post('/v1/chat/completions', (req, res) => {
  const { messages, model } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({
      error: {
        message: '缺少必填参数: messages',
        type: 'invalid_request_error',
      },
    });
  }

  // 提取提示词（最后一条用户消息）
  const lastMessage = messages.filter((m) => m.role === 'user').pop();
  const prompt = lastMessage?.content || '';

  // 创建视频生成任务
  const videoId = generateVideoId();
  const timestamp = Math.floor(Date.now() / 1000);
  const videoModel = model || 'sora2-portrait-15s';

  const task = {
    id: videoId,
    object: 'video.generation',
    model: videoModel,
    prompt: prompt,
    status: 'pending',
    progress: 0,
    created_at: timestamp,
    size: '720x1280',
    video_url: null,
    completed_at: null,
  };

  tasks.set(videoId, task);
  startProgressSimulation(videoId, videoModel);

  // 返回Chat格式响应
  res.json({
    id: `chatcmpl-${videoId}`,
    object: 'chat.completion',
    created: timestamp,
    model: videoModel,
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: `视频生成任务已创建！任务ID: ${videoId}\n\n您可以使用以下命令查询进度：\nGET /v1/videos/${videoId}`,
        },
        finish_reason: 'stop',
      },
    ],
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    },
  });

  console.log(`✅ Chat模式创建任务: ${videoId} | 提示词: ${prompt}`);
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'SkyRiff Mock API Server is running',
    tasks: tasks.size,
    timestamp: new Date().toISOString(),
  });
});

// 获取所有任务（调试用）
app.get('/debug/tasks', (req, res) => {
  const allTasks = Array.from(tasks.values());
  res.json({
    total: allTasks.length,
    tasks: allTasks,
  });
});

// 清空所有任务（调试用）
app.delete('/debug/tasks', (req, res) => {
  const count = tasks.size;
  tasks.clear();
  res.json({
    message: `已清空 ${count} 个任务`,
  });
});

// 启动服务器
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ========================================');
  console.log('🎬 SkyRiff Mock API Server 已启动！');
  console.log('🚀 ========================================');
  console.log('');
  console.log(`📡 服务地址: http://localhost:${PORT}`);
  console.log(`💚 健康检查: http://localhost:${PORT}/health`);
  console.log(`🐛 调试接口: http://localhost:${PORT}/debug/tasks`);
  console.log('');
  console.log('📋 可用接口:');
  console.log('  POST   /v1/videos              - 创建视频生成任务');
  console.log('  GET    /v1/videos/:id          - 查询任务进度');
  console.log('  GET    /v1/videos/:id/content  - 获取视频内容');
  console.log('  POST   /v1/chat/completions    - Chat兼容模式');
  console.log('');
  console.log('💡 提示: 前端配置BASE_URL为 http://localhost:' + PORT);
  console.log('');
  console.log('✅ 准备就绪！开始接收请求...');
  console.log('');
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('');
  console.log('👋 正在关闭服务器...');
  process.exit(0);
});