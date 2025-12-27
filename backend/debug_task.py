import asyncio
import os
from app.vendors.dyuapi_sora2 import DyuSora2Adapter

async def main():
    # Set env var if needed, or rely on .env loading if implemented in config
    # For now assume config.py loads .env or defaults are set
    # Manually setting key just in case
    os.environ["DYUAPI_API_KEY"] = "sk-AGzqrTi9DgKloCal64gR4xNhVIgnhmg3qmTYC0IQh1gLxi89"
    
    adapter = DyuSora2Adapter()
    task_id = "video_45c0f0f9-b628-4dc6-b7f0-81acc618c37e"
    
    print(f"Checking task: {task_id}")
    try:
        r = await adapter.get_task_status(task_id)
        print("Raw response:", r)
        parsed = adapter.parse_task_response(r)
        print("Parsed:", parsed)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    asyncio.run(main())
