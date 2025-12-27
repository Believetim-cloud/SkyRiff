/**
 * SkyRiff Real API Server
 * 真实的服务端，代理调用Sora2 API
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

// ==================== 配置 ====================

const CONFIG = {
  // Sora2 API配置
  SORA_API_BASE_URL: process.env.DYUAPI_BASE_URL || process.env.SORA_API_BASE_URL || 'https://api.dyuapi.com',
  SORA_API_KEY: process.env.DYUAPI_API_KEY || process.env.SORA_API_KEY || 'YOUR_API_KEY',
  
  // 服务器配置
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
};

// ==================== 中间件 ====================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ==================== 工具函数 ====================

/**
 * 创建Sora API请求的公共配置
 */
function getSoraHeaders() {
  return {
    'Authorization': `Bearer ${CONFIG.SORA_API_KEY}`,
    'Accept': 'application/json',
  };
}

/**
 * 代理Sora API请求
 */
async function proxySoraRequest(method, endpoint, data, headers = {}) {
  try {
    const url = `${CONFIG.SORA_API_BASE_URL}${endpoint}`;
    const config = {
      method,
      url,
      headers: {
        ...getSoraHeaders(),
        ...headers,
      },
    };

    if (data) {
      if (data instanceof FormData) {
        config.data = data;
        config.headers = {
          ...config.headers,
          ...data.getHeaders(),
        };
      } else {
        config.data = data;
        config.headers['Content-Type'] = 'application/json';
      }
    }

    console.log(`📡 代理请求: ${method} ${url}`);
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`❌ 代理请求失败:`, error.response?.data || error.message);
    return {
      success: false,
      error: {
        message: error.response?.data?.error?.message || error.message,
        code: error.response?.status || 500,
        details: error.response?.data,
      },
    };
  }
}

// ==================== API路由 ====================

/**
 * 1. 文生视频 & 2. 图生视频（直接传图）& 3. 图生视频（URL传图）
 */
app.post('/v1/videos', upload.single('input_reference'), async (req, res) => {
  try {
    const { prompt, model, size, seconds, image_url } = req.body;
    const hasFile = req.file;

    console.log('📝 接收到请求:', {
      prompt,
      model,
      hasFile: !!hasFile,
      hasImageUrl: !!image_url,
    });

    // 验证参数
    if (!prompt || !model) {
      return res.status(400).json({
        error: {
          message: '缺少必填参数：prompt 和 model',
          type: 'invalid_request_error',
        },
      });
    }

    let result;

    if (hasFile) {
      // 图生视频 - 文件上传
      console.log('📸 图生视频（文件上传）');
      
      const formData = new FormData();
      formData.append('input_reference', fs.createReadStream(req.file.path));
      formData.append('prompt', prompt);
      formData.append('model', model);
      if (size) formData.append('size', size);
      if (seconds) formData.append('seconds', seconds);

      result = await proxySoraRequest('POST', '/v1/videos', formData);

      // 清理临时文件
      fs.unlinkSync(req.file.path);
    } else if (image_url) {
      // 图生视频 - URL传图
      console.log('🔗 图生视频（URL）');
      
      result = await proxySoraRequest('POST', '/v1/videos', {
        prompt,
        model,
        image_url,
        size,
        seconds,
      });
    } else {
      // 文生视频
      console.log('📝 文生视频');
      
      result = await proxySoraRequest('POST', '/v1/videos', {
        prompt,
        model,
        size,
        seconds,
      });
    }

    if (result.success) {
      console.log('✅ 任务创建成功:', result.data.id);
      res.json(result.data);
    } else {
      res.status(result.error.code || 500).json({
        error: {
          message: result.error.message,
          type: 'api_error',
        },
      });
    }
  } catch (error) {
    console.error('❌ 服务器错误:', error);
    res.status(500).json({
      error: {
        message: '服务器内部错误',
        type: 'server_error',
      },
    });
  }
});

/**
 * 4. 查询任务进度
 */
app.get('/v1/videos/:video_id', async (req, res) => {
  try {
    const { video_id } = req.params;

    console.log('🔍 查询任务:', video_id);

    const result = await proxySoraRequest('GET', `/v1/videos/${video_id}`);

    if (result.success) {
      res.json(result.data);
    } else {
      res.status(result.error.code || 404).json({
        error: {
          message: result.error.message,
          type: 'api_error',
        },
      });
    }
  } catch (error) {
    console.error('❌ 查询错误:', error);
    res.status(500).json({
      error: {
        message: '服务器内部错误',
        type: 'server_error',
      },
    });
  }
});

/**
 * 5. 查看视频内容
 */
app.get('/v1/videos/:video_id/content', async (req, res) => {
  try {
    const { video_id } = req.params;

    console.log('🎬 获取视频内容:', video_id);

    const result = await proxySoraRequest('GET', `/v1/videos/${video_id}/content`);

    if (result.success) {
      // 如果返回的是重定向URL，直接重定向
      if (result.data.video_url) {
        res.redirect(result.data.video_url);
      } else {
        res.json(result.data);
      }
    } else {
      res.status(result.error.code || 404).json({
        error: {
          message: result.error.message,
          type: 'api_error',
        },
      });
    }
  } catch (error) {
    console.error('❌ 获取视频错误:', error);
    res.status(500).json({
      error: {
        message: '服务器内部错误',
        type: 'server_error',
      },
    });
  }
});

/**
 * 6. Chat兼容模式
 */
app.post('/v1/chat/completions', async (req, res) => {
  try {
    const { messages, model } = req.body;

    console.log('💬 Chat模式请求');

    const result = await proxySoraRequest('POST', '/v1/chat/completions', {
      messages,
      model,
    });

    if (result.success) {
      res.json(result.data);
    } else {
      res.status(result.error.code || 500).json({
        error: {
          message: result.error.message,
          type: 'api_error',
        },
      });
    }
  } catch (error) {
    console.error('❌ Chat错误:', error);
    res.status(500).json({
      error: {
        message: '服务器内部错误',
        type: 'server_error',
      },
    });
  }
});

/**
 * 健康检查
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'SkyRiff Real API Server is running',
    config: {
      baseUrl: CONFIG.SORA_API_BASE_URL,
      hasApiKey: !!CONFIG.SORA_API_KEY && CONFIG.SORA_API_KEY !== 'YOUR_API_KEY',
      environment: CONFIG.NODE_ENV,
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * 配置信息
 */
app.get('/config', (req, res) => {
  res.json({
    baseUrl: CONFIG.SORA_API_BASE_URL,
    hasApiKey: !!CONFIG.SORA_API_KEY && CONFIG.SORA_API_KEY !== 'YOUR_API_KEY',
    environment: CONFIG.NODE_ENV,
    note: CONFIG.SORA_API_KEY === 'YOUR_API_KEY' ? 
      '⚠️ 请设置环境变量 SORA_API_KEY' : 
      '✅ API Key已配置',
  });
});

// ==================== 启动服务器 ====================

app.listen(CONFIG.PORT, () => {
  console.log('');
  console.log('🚀 ========================================');
  console.log('🎬 SkyRiff Real API Server 已启动！');
  console.log('🚀 ========================================');
  console.log('');
  console.log(`📡 服务地址: http://localhost:${CONFIG.PORT}`);
  console.log(`💚 健康检查: http://localhost:${CONFIG.PORT}/health`);
  console.log(`⚙️  配置信息: http://localhost:${CONFIG.PORT}/config`);
  console.log('');
  console.log('🔧 配置:');
  console.log(`  Sora API: ${CONFIG.SORA_API_BASE_URL}`);
  
  if (CONFIG.SORA_API_KEY === 'YOUR_API_KEY') {
    console.log(`  API Key: ⚠️  未配置（请设置环境变量 SORA_API_KEY）`);
  } else {
    console.log(`  API Key: ✅ 已配置 (${CONFIG.SORA_API_KEY.slice(0, 8)}...)`);
  }
  
  console.log('');
  console.log('📋 可用接口:');
  console.log('  POST   /v1/videos              - 创建视频生成任务');
  console.log('  GET    /v1/videos/:id          - 查询任务进度');
  console.log('  GET    /v1/videos/:id/content  - 获取视频内容');
  console.log('  POST   /v1/chat/completions    - Chat兼容模式');
  console.log('');
  
  if (CONFIG.SORA_API_KEY === 'YOUR_API_KEY') {
    console.log('⚠️  提示: 需要配置真实API Key才能正常使用');
    console.log('   设置方法: export SORA_API_KEY=your_actual_key');
    console.log('   或者修改 .env 文件');
  } else {
    console.log('✅ 准备就绪！可以开始使用真实API');
  }
  
  console.log('');
  console.log('💡 前端配置BASE_URL为 http://localhost:' + CONFIG.PORT);
  console.log('');
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('');
  console.log('👋 正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('');
  console.log('👋 正在关闭服务器...');
  process.exit(0);
});