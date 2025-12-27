import { API_CONFIG } from './api-config';

// 会话ID，用于破坏缓存但保持单次会话内URL稳定
const SESSION_ID = Date.now();

// 认证 Token Key
const AUTH_TOKEN_KEY = 'skyriff_auth_token';

/**
 * 跨平台存储适配器接口
 * 方便后续迁移到 React Native (AsyncStorage/SecureStore) 或 Electron
 */
interface TokenStorage {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}

// 默认 Web 实现 (localStorage)
const webStorage: TokenStorage = {
  getItem: (key) => localStorage.getItem(key),
  setItem: (key, value) => localStorage.setItem(key, value),
  removeItem: (key) => localStorage.removeItem(key),
};

// 当前使用的存储适配器 (可在初始化时替换为 RN 或 Electron 实现)
export const tokenStorage: TokenStorage = webStorage;

// 获取 Token
export async function getAuthToken(): Promise<string | null> {
  return tokenStorage.getItem(AUTH_TOKEN_KEY);
}

// 设置 Token
export async function setAuthToken(token: string) {
  await tokenStorage.setItem(AUTH_TOKEN_KEY, token);
}

// 移除 Token
export async function removeAuthToken() {
  await tokenStorage.removeItem(AUTH_TOKEN_KEY);
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

// 通用请求函数
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const url = `${API_CONFIG.BASE_URL}/api/v1${endpoint}`;

  try {
    console.log('[Request]', url, options);
    const response = await fetch(url, {
      ...options,
      mode: 'cors',
      credentials: 'omit',
      keepalive: true,
      headers,
    });

    // 处理非 JSON 响应（例如 500 错误页）
    const contentType = response.headers.get("content-type");
    let errorText = "";
    if (contentType && contentType.includes("application/json")) {
        // 尝试作为 JSON 读取，但如果不是有效 JSON，这里会抛出异常
        try {
            const json = await response.json();
            if (!response.ok) {
                if (json.detail) {
                    if (Array.isArray(json.detail)) {
                        const messages = json.detail.map((err: any) => {
                            const field = err.loc ? err.loc[err.loc.length - 1] : 'unknown';
                            return `${field}: ${err.msg}`;
                        }).join('; ');
                        throw new Error(messages);
                    }
                    throw new Error(json.detail);
                }
                throw new Error(json.message || `API Request Failed: ${response.status}`);
            }
            return json;
        } catch (e) {
            // 如果 response.json() 失败或我们手动抛出的 Error，会走到下面的 catch
            // 如果是 JSON 解析失败，我们 fallback 到 text()
            if (e instanceof Error && !e.message.startsWith('API Request Failed') && !e.message.includes('Unexpected token')) {
                 throw e;
            }
        }
    } 
    
    // 如果不是 JSON 或 JSON 解析失败
    if (!response.ok) {
        errorText = await response.text();
        console.error(`API Error: ${response.status} ${response.statusText}`, errorText);
        if (response.status === 401) {
            throw new AuthError('登录已过期，请重新登录');
        }
        throw new Error(`请求失败 (${response.status}): ${response.statusText}`);
    }
    
    // 如果是 200 但不是 JSON (极少情况)
    return {} as T;

  } catch (error) {
      if (error instanceof AuthError) {
          throw error;
      }
      console.error('Request failed:', error, '→', url);
      if (error instanceof Error && error.message === 'Failed to fetch') {
        throw new Error('网络请求失败，请检查服务器连接');
      }
      throw error;
    }
}

// 模拟登录
export async function loginMock(userId: number): Promise<any> {
  const response = await request<any>('/auth/login_mock', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
  
  if (response.code === 200 && response.data?.access_token) {
    await setAuthToken(response.data.access_token);
  }
  
  return response;
}

// ===== 视频生成相关 (Video Generation) =====

export interface CreateTaskPayload {
  prompt: string;
  duration_sec: number;
  ratio: string;
  reference_image_asset_id?: number;
  project_id?: number;
  model?: string;
}

export interface TaskStatusResponse {
  task_id: number;
  status: 'QUEUED' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILURE';
  progress: number;
  video_id?: number;
  error_message?: string;
}

export interface VideoAssetResponse {
  video_id: number;
  duration_sec: number;
  ratio: string;
  watermarked_play_url: string;
  created_at: string;
  // ... other fields
}

/**
 * 创建生成任务
 */
export async function createTask(payload: CreateTaskPayload): Promise<any> {
  return request<any>('/tasks/create', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * 获取任务状态
 */
export async function getTaskStatus(taskId: number): Promise<any> {
  const token = await getAuthToken();
  const endpoint = token ? `/tasks/${taskId}?token=${encodeURIComponent(token)}` : `/tasks/${taskId}`;
  return request<any>(endpoint);
}

/**
 * 获取视频资产详情
 */
export async function getVideoAsset(videoId: number): Promise<any> {
  return request<any>(`/assets/videos/${videoId}`);
}

/**
 * 获取视频下载链接（后端代理）
 */
export function getVideoDownloadUrl(videoId: number): string {
  const token = localStorage.getItem('skyriff_auth_token');
  // 注意：这里直接返回URL，因为是GET请求，可以直接在浏览器打开
  // 但是需要带上token，通常做法是：
  // 1. URL参数带token (不安全)
  // 2. 使用fetch下载blob (当前方案)
  return `${API_CONFIG.BASE_URL}/api/v1/assets/videos/${videoId}/download`;
}

/**
 * 获取视频流播放链接（后端代理/本地缓存）
 */
export function getVideoStreamUrl(videoId: number | string): string {
  // 注意：这个URL需要带上Authorization header才能访问，
  // 但 <video src="..."> 不支持自定义Header。
  // 解决方案：
  // 1. URL中带临时Token（标准做法）
  // 2. 或者，由于是本地运行，我们暂时假设Cookies或允许特定Referer
  // 3. 实际上，为了简单起见，我们可以让后端在这个特定接口上放宽鉴权，或者在URL参数中传递 access_token
  // 这里我们采用 URL 参数传递 token 的方式 (需要在后端支持 Query Token)
  
  // 暂时先返回原始URL，待后端支持 Query Token 后再切换
  // 但为了解决用户现在的问题，我们可以尝试直接使用 backendVideoId 拼接，
  // 并修改后端 stream_video 接口允许 Query 参数 token
  const token = localStorage.getItem('skyriff_auth_token');
  
  // 如果没有 token，尝试从全局变量或 cookie 获取 (备用)
  const effectiveToken = token || '';

  // 检查是否是本地静态资源（通过视频对象本身判断有点难，这里只能构造代理URL）
  // 理想情况是后端直接返回完整的播放URL。
  // 但既然我们用了代理，就统一走代理，除非我们能在前端知道它已经是 /static 开头了。
  // 可是这里的入参只有 videoId。
  
  const proxyUrl = `${API_CONFIG.BASE_URL}/api/v1/assets/videos/${videoId}/stream?token=${effectiveToken}`;
  // 使用会话ID防止跨会话缓存，但保持会话内稳定，避免频繁重载
  console.log(`[Video Stream] Generating URL for video ${videoId}: ${proxyUrl}`);
  return `${proxyUrl}&sid=${SESSION_ID}`;
}

/**
 * 获取视频Blob对象URL（用于绕过浏览器跨域/ORB拦截）
 */
export async function getVideoBlobUrl(videoId: number | string): Promise<string> {
  const token = await getAuthToken();
  const base = `${API_CONFIG.BASE_URL}/api/v1/assets/videos/${videoId}/stream`;
  const url = token ? `${base}?token=${token}` : base;
  console.log('[Video Blob] Fetching', url);
  const resp = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    credentials: 'omit',
  });
  if (!resp.ok) {
    const txt = await resp.text().catch(() => '');
    throw new Error(`Blob fetch failed: ${resp.status} ${txt}`);
  }
  const blob = await resp.blob();
  const objectUrl = window.URL.createObjectURL(blob);
  console.log('[Video Blob] Ready URL', objectUrl);
  return objectUrl;
}

/**
 * 下载视频文件
 */
export async function downloadVideoFile(videoId: number, filename: string): Promise<void> {
  const token = await getAuthToken();
  const url = `${API_CONFIG.BASE_URL}/api/v1/assets/videos/${videoId}/download`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
}

/**
 * 上传图片 (Media Asset)
 */
export async function uploadImage(file: File): Promise<any> {
  const token = await getAuthToken();
  const formData = new FormData();
  formData.append('file', file);

  const url = `${API_CONFIG.BASE_URL}/api/v1/assets/media/upload`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
        throw new Error(`Upload Failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

// ===== 作品相关 (Works) =====

export interface PublishWorkPayload {
  video_id: number;
  title: string;
  description?: string;
  is_prompt_public?: boolean;
  prompt_unlock_cost?: number;
  allow_remix?: boolean;
}

export interface Work {
  work_id: number;
  user_id: number;
  video_id: number;
  title: string;
  description: string;
  cover_url: string;
  video_url: string;
  duration_sec: number;
  ratio: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  collect_count: number;
  share_count: number;
  is_liked: boolean;
  is_collected: boolean;
  is_prompt_public: boolean;
  prompt_unlock_cost: number;
  author: {
    user_id: number;
    nickname: string;
    avatar_url: string;
  };
  created_at: string;
}

export interface WorkListResponse {
  code: number;
  message: string;
  data: {
    items: Work[];
    next_cursor?: number;
    has_more: boolean;
  };
}

export interface WorkResponse {
  code: number;
  message: string;
  data: Work;
}

/**
 * 发布作品
 */
export async function publishWork(payload: PublishWorkPayload): Promise<WorkResponse> {
  const token = await getAuthToken();
  const endpoint = token ? `/works/publish?token=${encodeURIComponent(token)}` : '/works/publish';
  return request<WorkResponse>(endpoint, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * 获取作品流
 */
export async function getWorksFeed(
  feedType: 'discover' | 'hot' | 'following' = 'discover',
  cursor?: number,
  limit: number = 10
): Promise<WorkListResponse> {
  const params = new URLSearchParams({
    feed_type: feedType,
    limit: limit.toString(),
  });
  if (cursor) {
    params.append('cursor', cursor.toString());
  }
  return request<WorkListResponse>(`/works/feed?${params.toString()}`);
}

/**
 * 获取作品详情
 */
export async function getWorkDetail(workId: number): Promise<WorkResponse> {
  return request<WorkResponse>(`/works/${workId}`);
}

/**
 * 点赞作品
 */
export async function likeWork(workId: number): Promise<any> {
  return request(`/works/${workId}/like`, { method: 'POST' });
}

/**
 * 取消点赞
 */
export async function unlikeWork(workId: number): Promise<any> {
  return request(`/works/${workId}/like`, { method: 'DELETE' });
}

/**
 * 收藏作品
 */
export async function collectWork(workId: number): Promise<any> {
  return request(`/works/${workId}/collect`, { method: 'POST' });
}

/**
 * 取消收藏
 */
export async function uncollectWork(workId: number): Promise<any> {
  return request(`/works/${workId}/collect`, { method: 'DELETE' });
}

/**
 * 发表评论
 */
export async function addComment(workId: number, content: string): Promise<any> {
  return request(`/works/${workId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

/**
 * 获取评论列表
 */
export async function getComments(workId: number, cursor?: number, limit: number = 20): Promise<any> {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (cursor) params.append('cursor', cursor.toString());
  return request(`/works/${workId}/comments?${params.toString()}`);
}

/**
 * 打赏作品
 */
export async function tipWork(workId: number, amount: number): Promise<any> {
  return request(`/works/${workId}/tip`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
}

/**
 * 解锁提示词
 */
export async function unlockPrompt(workId: number): Promise<any> {
  return request(`/works/${workId}/unlock_prompt`, { method: 'POST' });
}

// ===== 钱包相关 (Wallet) =====

export interface WalletInfo {
  balance_credits: number;
  balance_coins: number;
  total_recharged: number;
  total_earned: number;
  total_spent: number;
}

export async function getMyWallet(): Promise<any> {
  const response = await request<any>('/wallets/me');
  if (response.code === 200 && response.data) {
     const walletInfo: WalletInfo = {
         balance_credits: response.data.credits || 0,
         balance_coins: parseFloat(response.data.coins_available || "0"),
         total_recharged: 0,
         total_earned: 0,
         total_spent: 0
     };
     // 直接返回封装好的数据结构，匹配 ApiResponse 格式
     return {
         code: 200,
         message: "success",
         data: walletInfo
     };
  }
  return response;
}

// ===== 支付相关 (Payment) =====

export interface Product {
    product_id: number;
    name: string;
    price_yuan: number;
    credits: number;
    bonus_credits: number;
    product_type: string;
}

export async function getProducts(type: string = 'recharge'): Promise<any> {
    return request(`/products?product_type=${type}`);
}

export async function createPayment(productId: number, payChannel: string = 'mock'): Promise<any> {
    return request('/payments/create', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, pay_channel: payChannel })
    });
}

export async function mockPaymentCallback(paymentId: number): Promise<any> {
    return request('/payments/callback', {
        method: 'POST',
        body: JSON.stringify({ payment_id: paymentId, success: true })
    });
}

// ===== 订阅相关 (Subscription) =====

export interface Subscription {
  subscription_id: number;
  start_at: string;
  end_at: string;
  status: string;
  days_remaining: number;
  today_claimed: boolean;
}

export async function buySubscription(productId: number, payChannel: string = 'mock'): Promise<any> {
    return request('/subscriptions/buy', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, pay_channel: payChannel })
    });
}

export async function getMySubscription(): Promise<any> {
    return request('/subscriptions/me');
}

export async function claimDailyReward(): Promise<any> {
    return request('/subscriptions/claim_daily', { method: 'POST' });
}

// ===== 任务中心相关 (Task Center) =====

export interface DailyTask {
  assignment_id: number;
  task_key: string;
  status: 'pending' | 'completed' | 'claimed';
  title: string;
  description: string;
  reward_credits: number;
  category: string;
}

export async function getTodayTasks(): Promise<any> {
    return request('/tasks_center/today');
}

export async function completeTask(taskKey: string): Promise<any> {
    return request(`/tasks_center/${taskKey}/complete`, { method: 'POST' });
}

export async function claimTaskReward(taskKey: string): Promise<any> {
    return request(`/tasks_center/${taskKey}/claim`, { method: 'POST' });
}

// ===== 排行榜相关 (Rankings) =====

export interface RankingUser {
    rank: number;
    user_id: number;
    nickname: string;
    avatar_url: string;
    total_tipped_credits: number;
    total_works: number;
    total_followers: number;
}

export interface PopularWork {
    rank: number;
    work_id: number;
    title: string;
    cover_url?: string;
    like_count: number;
    view_count: number;
    creator: {
        user_id: number;
        nickname: string;
        avatar_url: string;
    };
}

export async function getTipRanking(limit: number = 10): Promise<any> {
    return request(`/rankings/creators/tips?limit=${limit}`);
}

export async function getPopularWorksRanking(limit: number = 10): Promise<any> {
    return request(`/rankings/works/popular?limit=${limit}`);
}
