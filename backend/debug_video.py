import asyncio
import os
from app.vendors.dyuapi_sora2 import DyuSora2Adapter

async def main():
    os.environ["DYUAPI_API_KEY"] = "sk-AGzqrTi9DgKloCal64gR4xNhVIgnhmg3qmTYC0IQh1gLxi89"
    
    adapter = DyuSora2Adapter()
    video_id = "video_45c0f0f9-b628-4dc6-b7f0-81acc618c37e"
    
    print(f"Checking video: {video_id}")
    try:
        r = await adapter.get_video_detail(video_id)
        print("Raw response:", r)
        parsed = adapter.parse_video_response(r)
        print("Parsed:", parsed)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    asyncio.run(main())
