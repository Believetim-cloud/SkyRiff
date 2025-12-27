import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'skyriff.db')

def column_type(conn, table, column):
    cur = conn.execute(f'PRAGMA table_info({table})')
    for cid, name, ctype, notnull, dflt, pk in cur.fetchall():
        if name == column:
            return ctype.upper()
    return None

def migrate_tasks(conn):
    ctype = column_type(conn, 'tasks', 'task_id')
    if ctype and 'INTEGER' in ctype:
        return
    conn.executescript("""
    CREATE TABLE tasks_new (
        task_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id BIGINT NOT NULL,
        source_type VARCHAR(50),
        source_id BIGINT,
        vendor VARCHAR(50) DEFAULT 'dyuapi_sora2',
        vendor_task_id VARCHAR(100),
        prompt TEXT NOT NULL,
        prompt_final TEXT,
        duration_sec INTEGER NOT NULL,
        ratio VARCHAR(10) DEFAULT '9:16',
        model VARCHAR(50),
        reference_image_asset_id BIGINT,
        status VARCHAR(20) DEFAULT 'QUEUED',
        progress INTEGER DEFAULT 0,
        video_id BIGINT,
        cost_credits INTEGER NOT NULL,
        error_message TEXT,
        project_id BIGINT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        started_at DATETIME,
        completed_at DATETIME
    );
    INSERT INTO tasks_new (
        user_id, source_type, source_id, vendor, vendor_task_id, prompt, prompt_final,
        duration_sec, ratio, model, reference_image_asset_id, status, progress, video_id,
        cost_credits, error_message, project_id, created_at, started_at, completed_at
    )
    SELECT
        user_id, source_type, source_id, vendor, vendor_task_id, prompt, prompt_final,
        duration_sec, ratio, model, reference_image_asset_id, status, progress, video_id,
        cost_credits, error_message, project_id, created_at, started_at, completed_at
    FROM tasks;
    DROP TABLE tasks;
    ALTER TABLE tasks_new RENAME TO tasks;
    """)

def migrate_video_assets(conn):
    ctype = column_type(conn, 'video_assets', 'video_id')
    if ctype and 'INTEGER' in ctype:
        return
    conn.executescript("""
    CREATE TABLE video_assets_new (
        video_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id BIGINT NOT NULL,
        task_id BIGINT,
        duration_sec INTEGER NOT NULL,
        ratio VARCHAR(10) NOT NULL,
        width INTEGER,
        height INTEGER,
        file_size_bytes BIGINT,
        watermarked_play_url VARCHAR(500),
        no_watermark_download_url VARCHAR(500),
        vendor VARCHAR(50) DEFAULT 'dyuapi_sora2',
        vendor_video_id VARCHAR(100),
        project_id BIGINT,
        download_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    INSERT INTO video_assets_new (
        user_id, task_id, duration_sec, ratio, width, height, file_size_bytes,
        watermarked_play_url, no_watermark_download_url, vendor, vendor_video_id,
        project_id, download_count, created_at
    )
    SELECT
        user_id, task_id, duration_sec, ratio, width, height, file_size_bytes,
        watermarked_play_url, no_watermark_download_url, vendor, vendor_video_id,
        project_id, download_count, created_at
    FROM video_assets;
    DROP TABLE video_assets;
    ALTER TABLE video_assets_new RENAME TO video_assets;
    """)

def migrate_media_assets(conn):
    ctype = column_type(conn, 'media_assets', 'asset_id')
    if ctype and 'INTEGER' in ctype:
        return
    conn.executescript("""
    CREATE TABLE media_assets_new (
        asset_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id BIGINT NOT NULL,
        asset_type VARCHAR(20) NOT NULL,
        file_url VARCHAR(500) NOT NULL,
        file_size_bytes BIGINT,
        mime_type VARCHAR(100),
        width INTEGER,
        height INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    INSERT INTO media_assets_new (
        user_id, asset_type, file_url, file_size_bytes, mime_type, width, height, created_at
    )
    SELECT
        user_id, asset_type, file_url, file_size_bytes, mime_type, width, height, created_at
    FROM media_assets;
    DROP TABLE media_assets;
    ALTER TABLE media_assets_new RENAME TO media_assets;
    """)

def main():
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.execute('PRAGMA foreign_keys=OFF')
        migrate_tasks(conn)
        migrate_video_assets(conn)
        migrate_media_assets(conn)
        conn.execute('PRAGMA foreign_keys=ON')
        conn.commit()
        print('OK')
    finally:
        conn.close()

if __name__ == '__main__':
    main()
