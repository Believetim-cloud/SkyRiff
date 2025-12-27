"""
资产接口
"""
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Request
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.schemas.assets import (
    VideoAssetResponse, DownloadUrlResponse, MediaUploadResponse,
    ProjectResponse, CreateProjectRequest, UpdateProjectRequest
)
from app.schemas.common import ResponseModel
from app.services.asset_service import AssetService
from app.api.dependencies import get_current_user
from typing import Optional
import uuid
import os

router = APIRouter(prefix="/api/v1/assets", tags=["资产"])


# ==================== 视频资产 ====================

@router.get("/videos", response_model=ResponseModel)
async def list_videos(
    project_id: Optional[int] = Query(None, description="项目ID过滤"),
    cursor: Optional[int] = Query(None, description="游标（video_id）"),
    limit: int = Query(20, ge=1, le=100, description="每页数量"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取视频资产列表
    
    **需要登录**：是
    
    **功能**：
    - 返回用户生成的所有视频
    - 支持按项目过滤
    - 游标分页
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "success",
        "data": {
            "items": [
                {
                    "video_id": 5001,
                    "duration_sec": 10,
                    "ratio": "9:16",
                    "watermarked_play_url": "https://...",
                    "download_count": 2,
                    "created_at": "2025-12-25T10:00:00"
                }
            ],
            "has_more": false,
            "next_cursor": null
        }
    }
    ```
    """
    service = AssetService(db)
    
    videos = service.list_videos(
        user_id=current_user.user_id,
        project_id=project_id,
        limit=limit,
        cursor=cursor
    )
    
    items = [VideoAssetResponse.model_validate(video) for video in videos]
    has_more = len(items) == limit
    next_cursor = items[-1].video_id if has_more and items else None
    
    return ResponseModel(
        code=200,
        message="success",
        data={
            "items": items,
            "has_more": has_more,
            "next_cursor": next_cursor
        }
    )


@router.get("/videos/{video_id}", response_model=ResponseModel)
async def get_video(
    video_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取单个视频详情
    
    **需要登录**：是
    
    **权限**：只能查看自己的视频
    """
    service = AssetService(db)
    
    try:
        video = service.get_video(video_id, current_user.user_id)
        video_data = VideoAssetResponse.model_validate(video)
        
        return ResponseModel(code=200, message="success", data=video_data)
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/videos/{video_id}/stream", response_model=None)
async def stream_video(
    video_id: int,
    request: Request,
    token: Optional[str] = Query(None), # 允许 token 通过 Query 传递
    db: Session = Depends(get_db)
):
    """
    在线播放视频（通过后端代理或本地流）
    
    **需要登录**：是（支持 Header Auth 或 Query Param Token）
    
    **功能**：
    - 如果视频已缓存到本地，直接返回本地文件流
    - 如果未缓存，通过后端代理流式传输，解决CORS和网络不稳定问题
    """
    # 手动鉴权逻辑
    # 1. 优先尝试从 Depends(get_current_user) 获取（但这里为了避开 Depends 抛出 401，我们手动处理）
    # 2. 尝试从 Query Param 获取
    from app.core.security import get_current_user_from_token
    
    user = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        try:
            user = await get_current_user_from_token(auth_header.split(" ")[1], db)
        except:
            pass
            
    if not user and token:
        try:
            user = await get_current_user_from_token(token, db)
        except:
            pass
            
    if not user:
        raise HTTPException(status_code=401, detail="未认证")

    service = AssetService(db)
    current_user = user # 兼容后续代码
    
    try:
        print(f"🎯 Stream request video_id={video_id}")
        print(f"   - Origin: {request.headers.get('origin')}")
        print(f"   - Referer: {request.headers.get('referer')}")
        print(f"   - Range: {request.headers.get('range')}")
        print(f"   - Token(query): {'yes' if token else 'no'} | Token(header): {'yes' if auth_header else 'no'}")
        
        # 获取视频详情
        video = service.get_video(video_id, current_user.user_id)
        
        # 1. 检查是否是本地路径（以/static/开头）
        if video.watermarked_play_url and video.watermarked_play_url.startswith("/static/"):
            # 构造本地文件绝对路径
            import os
            
            backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
            rel_path = video.watermarked_play_url.replace("/static/", "", 1)
            file_path = os.path.join(backend_dir, "static", rel_path)
            
            if os.path.exists(file_path):
                from fastapi.responses import FileResponse
                return FileResponse(file_path, media_type="video/mp4")
            else:
                print(f"⚠️ 本地文件不存在: {file_path}，尝试从供应商重新获取URL")
                # 尝试从供应商重新获取URL
                if video.vendor_video_id:
                    try:
                        from app.services.task_service import TaskService
                        # 注意：这里需要重新初始化 service，或者重构代码以共享 service 实例
                        # 简单起见，我们假设 AssetService 无法直接调用 TaskService，
                        # 但我们可以直接使用 Adapter
                        from app.services.sora_api import SoraAdapter
                        adapter = SoraAdapter()
                        detail = await adapter.get_video_detail(video.vendor_video_id)
                        parsed = adapter.parse_video_response(detail)
                        if parsed.get("watermarked_play_url"):
                            video.watermarked_play_url = parsed.get("watermarked_play_url")
                            # 可选：更新回数据库？暂时不更新，避免反复覆写
                            print(f"✅ 已恢复远程URL: {video.watermarked_play_url}")
                    except Exception as e:
                        print(f"❌ 恢复远程URL失败: {e}")
        
        # 2. 如果是远程URL，使用后端代理流式传输 (Proxy Stream)
        # 这样解决CORS和ORB拦截问题
        video_url = video.watermarked_play_url
        if not video_url or video_url.startswith("/static/"):
            # 如果还是本地路径且文件不存在，或者为空
            print(f"❌ 无法播放: URL无效或文件丢失 - {video_url}")
            raise ValueError("视频文件不可用")
            
        import httpx
        from fastapi.responses import StreamingResponse
        print(f"🔀 Proxying stream from remote: {video_url}")
        
        # 准备 Headers (转发 Range)
        headers = {}
        range_header = request.headers.get("range")
        if range_header:
            headers["Range"] = range_header
        
        client = httpx.AsyncClient(timeout=120.0, verify=False, follow_redirects=True)
        req = client.build_request("GET", video_url, headers=headers)
        
        try:
            r = await client.send(req, stream=True)
            # 不使用 raise_for_status，因为 206 也是正常响应
            print(f"   - Remote response: status={r.status_code}, type={r.headers.get('content-type')}, length={r.headers.get('content-length')}")
            
            async def iter_file():
                try:
                    async for chunk in r.aiter_bytes():
                        yield chunk
                except Exception as e:
                    print(f"❌ Stream proxy exception: {e}")
                finally:
                    await r.aclose()
                    await client.aclose()
            
            # 转发响应头
            response_headers = {}
            # 注意：不转发 Content-Length，因为流式传输可能导致长度不一致，让浏览器自动处理 Chunked
            # if "content-length" in r.headers:
            #     response_headers["Content-Length"] = r.headers["content-length"]
            
            # 重要：不转发 Content-Range 和 Accept-Ranges，因为我们的代理可能不支持 Range 请求的完美透传
            # 这会导致浏览器认为支持 Range，但实际流式传输时断开，从而引发 ERR_ABORTED
            # if "content-range" in r.headers:
            #    response_headers["Content-Range"] = r.headers["content-range"]
            # if "accept-ranges" in r.headers:
            #    response_headers["Accept-Ranges"] = r.headers["accept-ranges"]
            
            if "content-type" in r.headers:
                response_headers["Content-Type"] = r.headers["content-type"]
            
            return StreamingResponse(
                iter_file(),
                status_code=200, # 强制返回 200，不返回 206 Partial Content，避免浏览器期待 Range 支持
                media_type=r.headers.get("content-type", "video/mp4"),
                headers=response_headers
            )
            
        except Exception as e:
            await client.aclose()
            print(f"❌ Stream setup exception: {e}")
            # Fallback: 直接重定向到远程URL，绕过代理问题
            try:
                from fastapi.responses import RedirectResponse
                print("↪️ Fallback redirect to remote video URL")
                return RedirectResponse(video_url, status_code=302)
            except Exception as e2:
                print(f"❌ Fallback redirect failed: {e2}")
                raise HTTPException(status_code=500, detail="视频流不可用")
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(f"Stream error: {e}")
        raise HTTPException(status_code=500, detail="播放服务暂时不可用")


@router.get("/videos/{video_id}/download", response_model=None)
async def download_video(
    video_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    下载视频（通过后端代理）
    
    **需要登录**：是
    
    **功能**：
    - 代理下载供应商视频，解决CORS和强制下载问题
    - 强制浏览器弹出下载框
    """
    service = AssetService(db)
    
    try:
        # 获取视频详情（鉴权）
        video = service.get_video(video_id, current_user.user_id)
        
        # 1. 优先使用本地文件（如果存在）
        if video.watermarked_play_url and video.watermarked_play_url.startswith("/static/"):
            import os
            backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
            rel_path = video.watermarked_play_url.replace("/static/", "", 1)
            file_path = os.path.join(backend_dir, "static", rel_path)
            
            if os.path.exists(file_path):
                from fastapi.responses import FileResponse
                return FileResponse(file_path, media_type="video/mp4", filename=f"skyriff_video_{video_id}.mp4")
            else:
                 # 尝试恢复
                 if video.vendor_video_id:
                     try:
                         from app.services.sora_api import SoraAdapter
                         adapter = SoraAdapter()
                         detail = await adapter.get_video_detail(video.vendor_video_id)
                         parsed = adapter.parse_video_response(detail)
                         if parsed.get("watermarked_play_url"):
                             video.watermarked_play_url = parsed.get("watermarked_play_url")
                     except:
                         pass

        # 2. 如果是远程URL，使用代理下载
        video_url = video.watermarked_play_url
        if not video_url or video_url.startswith("/static/"):
            raise ValueError("视频文件不可用")
            
        import httpx
        from fastapi.responses import StreamingResponse
        
        # 使用专用 client 以支持 header 转发
        client = httpx.AsyncClient(timeout=120.0, verify=False, follow_redirects=True)
        req = client.build_request("GET", video_url)
        
        try:
            r = await client.send(req, stream=True)
            r.raise_for_status()
            
            # 提取头部信息
            content_length = r.headers.get("content-length")
            headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
            if content_length:
                headers["Content-Length"] = content_length
                
            async def iter_file():
                try:
                    async for chunk in r.aiter_bytes():
                        yield chunk
                except Exception as e:
                    print(f"❌ Download proxy exception: {e}")
                finally:
                    await r.aclose()
                    await client.aclose()
                        
            filename = f"skyriff_video_{video_id}.mp4"
            
            return StreamingResponse(
                iter_file(),
                media_type="video/mp4",
                headers=headers
            )
        except Exception as e:
            await client.aclose()
            print(f"❌ Download setup exception: {e}")
            raise HTTPException(status_code=500, detail="无法连接到下载源")
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(f"Download error: {e}")
        raise HTTPException(status_code=500, detail="下载服务暂时不可用")


# ==================== 媒体上传 ====================

@router.post("/media/upload", response_model=ResponseModel)
async def upload_media(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    上传媒体文件（图片）
    
    **需要登录**：是
    
    **支持格式**：jpg, jpeg, png, webp
    
    **最大大小**：10MB
    
    **用途**：图生视频的参考图
    
    **请求方式**：multipart/form-data
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "上传成功",
        "data": {
            "asset_id": 123,
            "asset_type": "image",
            "file_url": "https://storage.example.com/uploads/abc.jpg",
            "file_size_bytes": 102400,
            "width": 1024,
            "height": 768
        }
    }
    ```
    """
    # 校验文件类型
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="不支持的文件格式")
    
    # 读取文件
    content = await file.read()
    file_size = len(content)
    
    # 校验文件大小（10MB）
    if file_size > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="文件过大，最大10MB")
    
    # 生成唯一文件名
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    
    # 保存文件（简化版：本地存储）
    # TODO: 生产环境应使用OSS（阿里云/腾讯云）
    from app.core.config import settings
    upload_dir = settings.UPLOAD_DIR
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = os.path.join(upload_dir, filename)
    with open(file_path, "wb") as f:
        f.write(content)
    
    # 生成文件URL（简化版：相对路径）
    # TODO: 生产环境应返回CDN URL
    file_url = f"/uploads/{filename}"
    
    # 获取图片尺寸（简化版：跳过）
    # TODO: 使用PIL获取真实尺寸
    width = None
    height = None
    
    # 创建媒体资产记录
    service = AssetService(db)
    media = service.create_media_asset(
        user_id=current_user.user_id,
        asset_type="image",
        file_url=file_url,
        file_size_bytes=file_size,
        mime_type=file.content_type,
        width=width,
        height=height
    )
    
    return ResponseModel(
        code=200,
        message="上传成功",
        data=MediaUploadResponse(
            asset_id=media.asset_id,
            asset_type=media.asset_type,
            file_url=media.file_url,
            file_size_bytes=media.file_size_bytes,
            width=media.width,
            height=media.height,
            created_at=media.created_at
        )
    )


# ==================== 项目管理 ====================

@router.get("/projects", response_model=ResponseModel)
async def list_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取项目列表
    
    **需要登录**：是
    
    **响应示例**：
    ```json
    {
        "code": 200,
        "message": "success",
        "data": [
            {
                "project_id": 1,
                "name": "我的第一个项目",
                "video_count": 5,
                "created_at": "2025-12-25T10:00:00"
            }
        ]
    }
    ```
    """
    service = AssetService(db)
    projects = service.list_projects(current_user.user_id)
    
    items = [ProjectResponse.model_validate(p) for p in projects]
    
    return ResponseModel(code=200, message="success", data=items)


@router.post("/projects", response_model=ResponseModel)
async def create_project(
    req: CreateProjectRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    创建项目
    
    **需要登录**：是
    
    **请求示例**：
    ```json
    {
        "name": "我的第一个项目",
        "description": "用于存放测试视频"
    }
    ```
    """
    service = AssetService(db)
    
    project = service.create_project(
        user_id=current_user.user_id,
        name=req.name,
        description=req.description
    )
    
    project_data = ProjectResponse.model_validate(project)
    
    return ResponseModel(code=200, message="创建成功", data=project_data)


@router.patch("/projects/{project_id}", response_model=ResponseModel)
async def update_project(
    project_id: int,
    req: UpdateProjectRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    更新项目
    
    **需要登录**：是
    """
    service = AssetService(db)
    
    try:
        project = service.update_project(
            project_id=project_id,
            user_id=current_user.user_id,
            name=req.name,
            description=req.description
        )
        
        project_data = ProjectResponse.model_validate(project)
        
        return ResponseModel(code=200, message="更新成功", data=project_data)
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/projects/{project_id}", response_model=ResponseModel)
async def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    删除项目
    
    **需要登录**：是
    
    **注意**：只删除项目，不删除视频（视频会解除关联）
    """
    service = AssetService(db)
    
    try:
        service.delete_project(project_id, current_user.user_id)
        
        return ResponseModel(code=200, message="删除成功", data=None)
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
