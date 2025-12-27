import sqlite3

def fix_task():
    conn = sqlite3.connect('skyriff.db')
    cursor = conn.cursor()
    
    # 修复任务 18，将其状态重置为 IN_PROGRESS
    # 这样后端下次查询时会重新同步供应商状态，并触发 create_video_asset
    task_id = 18
    print(f"Fixing task {task_id}...")
    
    cursor.execute("UPDATE tasks SET status='IN_PROGRESS' WHERE task_id=?", (task_id,))
    
    if cursor.rowcount > 0:
        print("Success: Task status reset to IN_PROGRESS")
    else:
        print("Warning: Task not found")
        
    conn.commit()
    conn.close()

if __name__ == "__main__":
    fix_task()
