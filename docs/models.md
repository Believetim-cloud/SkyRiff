# 大洋芋 (DYU API) Sora 模型列表整理

本文档整理了供应商提供的全部 18 个模型，包含普通模式、Pro 模式、测试模型及辅助工具。

## 📊 模型概览

| 模型名称 | 类型 | 时长/规格 | 价格 (估算) | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| **基础生成模型** | | | | |
| `sora2` | 通用 | 5-10s | 0.090 | 默认模型，自动适配比例 |
| `sora2-landscape` | 横屏 | 10s | 0.090 | 16:9 横屏标准模型 |
| `sora2-portrait` | 竖屏 | 10s | 0.090 | 9:16 竖屏标准模型 |
| `sora2-landscape-15s` | 横屏 | 15s | 0.090 | 16:9 横屏加长版 |
| `sora2-portrait-15s` | 竖屏 | 15s | 0.090 | 9:16 竖屏加长版 |
| **Pro / HD 高级模型** | | | | |
| `sora2-pro-landscape-25s` | 横屏 Pro | 25s | 1.500 | 高质量超长生成 |
| `sora2-pro-portrait-25s` | 竖屏 Pro | 25s | 1.500 | 高质量超长生成 |
| `sora2-pro-landscape-hd-10s` | 横屏 HD | 10s | 1.500 | 高清画质版 |
| `sora2-pro-portrait-hd-10s` | 竖屏 HD | 10s | 1.500 | 高清画质版 |
| `sora2-pro-landscape-hd-15s` | 横屏 HD | 15s | 1.500 | 高清画质加长版 |
| `sora2-pro-portrait-hd-15s` | 竖屏 HD | 15s | 1.500 | 高清画质加长版 |
| **测试模型 (Test)** | | | | |
| `sora2-landscape-test` | 横屏测试 | 10s | 待定 | 快速测试用 |
| `sora2-portrait-test` | 竖屏测试 | 10s | 待定 | 快速测试用 |
| `sora2-landscape-15s-test` | 横屏测试 | 15s | 待定 | 快速测试用 |
| `sora2-portrait-15s-test` | 竖屏测试 | 15s | 待定 | 快速测试用 |
| **辅助工具** | | | | |
| `sora_url` | 去水印 | - | 0.010 | 官方视频去水印 |
| `sora-drafts-url` | 去水印 | - | 0.100 | 草稿视频去水印 |
| `character-training` | 训练 | - | 0.000 | 角色一致性训练 |

## 💡 使用建议

1.  **性价比首选**：日常生成建议使用 `sora2-landscape-15s` 或 `sora2-portrait-15s`，价格与 10s 版本相同，但时长增加了 50%。
2.  **追求画质**：如果对画质有极高要求，或需要制作 25s 长视频，请选择 `Pro` 系列模型，但注意价格较高（约普通版的 16 倍）。
3.  **开发测试**：在调试接口或 prompt 时，可优先使用带 `-test` 后缀的模型（如果供应商开放），通常生成速度更快。

## ⚙️ 系统配置更新建议

建议将系统中的 `MODEL_METADATA` 更新为包含上述主要模型（排除 test 模型），以便用户有更多选择。

### 推荐添加的模型 ID：
*   `sora2-pro-landscape-hd-10s`
*   `sora2-pro-portrait-hd-10s`
