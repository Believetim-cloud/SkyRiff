/**
 * 我的视频服务
 * 管理用户发布的视频和隐藏状态
 */

import type { PublishedVideo } from './video-pool';
import { getVideoPool, updateVideoStats } from './video-pool';

const MY_VIDEOS_KEY = 'skyriff_my_videos';
const HIDDEN_VIDEOS_KEY = 'skyriff_hidden_videos';

export interface MyVideoMeta {
  videoId: string;
  isHidden: boolean;
  hiddenAt?: number;
}

/**
 * 获取当前用户发布的所有视频
 */
export function getMyPublishedVideos(): PublishedVideo[] {
  const pool = getVideoPool();
  return pool.filter(v => v.author.id === 'current_user');
}

/**
 * 获取当前用户发布的公开视频
 */
export function getMyVisibleVideos(): PublishedVideo[] {
  const myVideos = getMyPublishedVideos();
  const hiddenIds = getHiddenVideoIds();
  return myVideos.filter(v => !hiddenIds.has(v.id));
}

/**
 * 获取当前用户发布的隐藏视频
 */
export function getMyHiddenVideos(): PublishedVideo[] {
  const myVideos = getMyPublishedVideos();
  const hiddenIds = getHiddenVideoIds();
  return myVideos.filter(v => hiddenIds.has(v.id));
}

/**
 * 获取隐藏视频ID集合
 */
function getHiddenVideoIds(): Set<string> {
  try {
    const data = localStorage.getItem(HIDDEN_VIDEOS_KEY);
    const ids: string[] = data ? JSON.parse(data) : [];
    return new Set(ids);
  } catch (error) {
    console.error('读取隐藏视频列表失败:', error);
    return new Set();
  }
}

/**
 * 隐藏视频
 */
export function hideVideo(videoId: string): void {
  const hiddenIds = getHiddenVideoIds();
  hiddenIds.add(videoId);
  
  try {
    localStorage.setItem(HIDDEN_VIDEOS_KEY, JSON.stringify(Array.from(hiddenIds)));
  } catch (error) {
    console.error('隐藏视频失败:', error);
  }
}

/**
 * 取消隐藏视频
 */
export function unhideVideo(videoId: string): void {
  const hiddenIds = getHiddenVideoIds();
  hiddenIds.delete(videoId);
  
  try {
    localStorage.setItem(HIDDEN_VIDEOS_KEY, JSON.stringify(Array.from(hiddenIds)));
  } catch (error) {
    console.error('取消隐藏视频失败:', error);
  }
}

/**
 * 删除我的视频
 */
export function deleteMyVideo(videoId: string): void {
  // 从隐藏列表中移除
  const hiddenIds = getHiddenVideoIds();
  hiddenIds.delete(videoId);
  
  try {
    localStorage.setItem(HIDDEN_VIDEOS_KEY, JSON.stringify(Array.from(hiddenIds)));
  } catch (error) {
    console.error('更新隐藏列表失败:', error);
  }
  
  // 从视频池中移除
  const pool = getVideoPool();
  const updatedPool = pool.filter(v => v.id !== videoId);
  
  try {
    localStorage.setItem('skyriff_video_pool', JSON.stringify(updatedPool));
  } catch (error) {
    console.error('删除视频失败:', error);
  }
}

/**
 * 检查视频是否被隐藏
 */
export function isVideoHidden(videoId: string): boolean {
  const hiddenIds = getHiddenVideoIds();
  return hiddenIds.has(videoId);
}

/**
 * 获取所有已发布视频的ID集合
 * 用于在资产页过滤已发布的视频
 */
export function getAllPublishedVideoIds(): Set<string> {
  const myVideos = getMyPublishedVideos();
  return new Set(myVideos.map(v => v.id));
}