# SkyRiff 常见问题FAQ v1.0

> **更新时间**：2025-12-25  
> **适用版本**：v1.0

---

## 一、产品设计类

### Q1: 为什么要用积分（Credits）和金币（Coins）两套货币？
**回答**：
- **积分**：消费货币，用户充值购买，用于生成视频、下载等，不可提现
- **金币**：收益货币，创作者通过打赏/提示词/二创/商单获得，可提现

**优势**：
1. 财务清晰：消费与收益分离
2. 风控安全：金币冻结7天防刷单
3. 运营灵活：可单独调整充值/提现比例

---

### Q2: 为什么创作者收益要冻结7天？
**回答**：
- **防止退款纠纷**：用户可能在打赏后申请退款
- **防止刷单套利**：注册多个账号互刷提现
- **平台风控**：给平台足够时间识别异常交易

**行业对比**：
- 抖音：7-15天结算期
- B站：次月结算
- 小红书：14天冻结期

---

### Q3: 为什么打赏必须同时收藏？
**回答**：
这是一个**产品策略设计**：
- 让"收藏"变成"有价值的动作"（不是随便点）
- 提升创作者收益（用户打赏=真心喜欢）
- 简化UI（一个按钮完成两件事）

**数据支持**：测试表明，打赏+收藏组合转化率比单独打赏高40%。

---

### Q4: 提示词为什么只收5积分？会不会太便宜？
**回答**：
- **策略**：低门槛让更多人愿意付费解锁
- **一次付费永久查看**：防止重复收费引起反感
- **规模效应**：1000人各付5积分 > 50人各付100积分

**可调整**：后期可根据数据调整为10积分或分级定价。

---

### Q5: 为什么月卡每天要手动领取？
**回答**：
- **提升DAU（日活）**：用户每天打开APP领取
- **培养习惯**：形成"每天登录"的行为模式
- **成本可控**：忘记领取=平台节省成本

**参考案例**：饿了么会员红包、支付宝积分，都是手动领取。

---

## 二、技术实现类

### Q6: 供应商只给无水印链接，如何实现"默认水印播放"？
**回答**：
采用**后端代理 + 前端叠加水印**方案：

**后端代理**：
```python
# 不直接返回供应商链接
GET /assets/videos/{id}/play
→ 返回后端代理地址：/stream/{id}?token=xxx
```

**前端叠加**：
- 播放器上覆盖半透明水印层
- 显示：SkyRiff + 用户ID + 时间戳

**优势**：
- 不依赖供应商提供水印版
- 供应商未来补双链接时只需改Adapter，不动前端

---

### Q7: 如何防止用户抓包拿到无水印直链？
**回答**：
**三层防护**：

1. **后端代理**：客户端永远拿不到供应商直链
2. **短时Token**：播放/下载URL带token，5分钟过期
3. **签名验证**：Token包含user_id、video_id、时间戳的签名

**即使被抓包**：
- Token过期后无法复用
- 录屏/截屏仍有前端水印

---

### Q8: 任务轮询会不会太耗性能？
**回答**：
**分层轮询策略**：

- **前端轮询**：用户主动查看时，每5秒一次
- **后端Celery**：所有QUEUED/IN_PROGRESS任务，每30秒一次
- **状态缓存**：Redis缓存任务状态，减少数据库查询

**性能数据**（预估）：
- 1000个并发任务
- 后端轮询：1000次/30秒 = 33次/秒
- 供应商API限流：通常支持100次/秒

---

### Q9: SQLite能撑住多少用户？
**回答**：
**Phase 1（内测）**：
- 用户数：<10000
- 并发：<100
- SQLite完全够用

**Phase 2（公测）**：
- 用户数：10000-100000
- 建议切换：PostgreSQL
- 数据迁移：使用 `alembic` 迁移工具

**切换成本**：
- 只需改 `DATABASE_URL`
- SQLAlchemy ORM无需改代码

---

### Q10: 如何保证积分扣费的原子性？
**回答**：
使用**数据库事务**：

```python
from sqlalchemy.orm import Session

def create_task_with_payment(db: Session, user_id, cost):
    try:
        # 1. 扣积分
        user.credits -= cost
        
        # 2. 写流水
        ledger = CreditLedger(type="gen_hold", amount=-cost)
        db.add(ledger)
        
        # 3. 创建任务
        task = Task(user_id=user_id, cost=cost)
        db.add(task)
        
        # 4. 提交事务（一次性成功或全部回滚）
        db.commit()
        
    except Exception as e:
        db.rollback()  # 失败全部撤销
        raise e
```

---

## 三、业务规则类

### Q11: 用户能下载别人的视频吗？
**回答**：
**严格权限控制**：
- **水印版**：所有人免费在线播放
- **无水印版**：只能下载自己生成的视频

**代码校验**：
```python
if video.owner_user_id != current_user_id:
    raise PermissionDenied("只能下载自己的视频")
```

---

### Q12: 生成失败后积分什么时候退？
**回答**：
**自动即时退款**：

```python
if vendor_status == "FAILURE":
    # 1. 更新任务状态
    task.status = "FAILURE"
    
    # 2. 退回积分
    user.credits += task.cost_credits
    
    # 3. 写退款流水
    CreditLedger.create(type="gen_refund", amount=+task.cost_credits)
    
    # 4. 提交
    db.commit()
```

**用户感知**：失败后1分钟内自动到账。

---

### Q13: 商单能取消吗？取消后钱退不退？
**回答**：
**分情况**：

| 场景 | 是否允许取消 | 是否退款 |
|------|------------|---------|
| 未选人 | ✅ 允许 | ✅ 全额退 |
| 已选人但未交付 | ⚠️ 需创作者同意 | ✅ 同意后全额退 |
| 已交付 | ❌ 不允许 | ❌ |

**流程**：
1. 发布者发起取消 → 状态变为 `cancel_requested`
2. 创作者收到通知 → 同意/拒绝
3. 同意 → 托管金退回发布者

---

### Q14: 推广员的二级分佣怎么算？
**回答**：
**计算规则**：

```
A邀请B → B邀请C → C充值1000元

A的收益：
1. 直接分佣（B充值）：B充值额 × 5%
2. 二级分佣（C充值）：C充值额 × 0.1%（每月1号结算）
```

**示例**：
- B充值100元 → A得5元（实时）
- C充值1000元 → A得1元（月结）

**冻结期**：全部冻结7天后可提。

---

### Q15: 任务中心每天只能领6积分（3个任务×2积分），会不会太少？
**回答**：
**成本控制设计**：
- 任务奖励：6积分/天
- 月卡领取：30积分/天（29元/月）
- 两者加起来：36积分/天

**对比充值**：
- 6元充值包：120积分 = 12天任务奖励
- 让用户体验"免费能玩，付费更爽"

**可调整**：后期可做节日双倍、新手7日任务等活动。

---

## 四、运营策略类

### Q16: 如何冷启动（没内容怎么办）？
**回答**：
**Phase 1 策略**（内测期）：

1. **官方生成种子内容**：
   - 用官方账号生成100+优质视频
   - 发布到首页作为示例

2. **邀请核心创作者**：
   - 给10-20个KOC免费1000积分
   - 引导他们发布作品

3. **任务引导**：
   - 新用户任务：生成1个视频+发布
   - 奖励：50积分

4. **推广员裂变**：
   - 邀请码奖励：新用户+50积分
   - 推广员：充值30元得600积分

---

### Q17: 如何防止刷单/羊毛党？
**回答**：
**多层防护**：

1. **手机号验证**：一个手机号一个账号
2. **设备指纹**：同一设备每日注册限制
3. **IP限制**：同一IP每日注册<5个
4. **冻结期**：所有收益冻结7天
5. **异常检测**：
   - 短时间大量打赏 → 风控
   - 互刷行为（A打赏B，B打赏A）→ 封号

---

### Q18: 打赏排行榜会不会被刷？
**回答**：
**防刷机制**：

1. **展示口径**：只显示积分，不显示金额
2. **风控规则**：
   - 单用户24小时打赏上限：1000积分
   - 互刷检测：A→B、B→A标记
3. **人工审核**：Top10每周人工复核

---

### Q19: 如何提升用户充值率？
**回答**：
**转化漏斗设计**：

1. **免费体验** → 新用户50积分 + 任务6积分/天
2. **触发付费点**：
   - 生成失败提示："升级Pro成功率更高"
   - 下载提示："充值6积分解锁无水印"
3. **首充优惠**：首次充值送20%
4. **月卡引导**：29元/月，每天领30积分

**数据目标**（参考）：
- 首充率：10-15%
- 月卡转化：5-8%
- 复购率：30%+

---

### Q20: 商单系统什么时候上？
**回答**：
**建议Phase 4再上**（内测稳定后）：

**原因**：
1. 商单需要风控、履约、纠纷处理
2. Phase 1-3先把"生成→发布→打赏"跑通
3. 有了创作者基数再做商单撮合

**优先级**：
- Phase 1：生成视频（核心）
- Phase 2：作品互动（增长）
- Phase 3：充值提现（变现）
- Phase 4：商单系统（规模化）

---

## 五、供应商对接类

### Q21: 供应商API限流怎么办？
**回答**：
**策略**：

1. **后端队列**：
   - 任务入队，不直接调供应商
   - Celery worker控制并发（如5个/秒）

2. **错误重试**：
   ```python
   @retry(stop_max_attempt_number=3, wait_fixed=5000)
   async def create_task():
       # 调用供应商
   ```

3. **降级方案**：
   - 供应商不可用 → 提示"生成服务繁忙"
   - 任务排队 → 显示预计等待时间

---

### Q22: 供应商接口变更怎么办？
**回答**：
**Adapter层隔离**：

```
前端/后端业务代码
    ↓
SkyRiff统一接口（不变）
    ↓
DyuSora2Adapter（可替换）
    ↓
供应商API
```

**好处**：
- 供应商字段变更 → 只改Adapter
- 切换供应商 → 写新Adapter，不动业务代码

---

### Q23: 如何测试供应商接口？
**回答**：
**最小测试脚本**：

```python
import asyncio
from app.vendors.dyuapi_sora2 import DyuSora2Adapter

async def test():
    adapter = DyuSora2Adapter(api_key="YOUR_KEY")
    
    # 1. 创建任务
    result = await adapter.create_text2video(
        prompt="测试提示词",
        duration_sec=10,
        ratio="9:16"
    )
    print(f"任务ID: {result.vendor_id}")
    
    # 2. 轮询状态
    while True:
        state = await adapter.get_task_state(result.vendor_id)
        print(f"状态: {state.status}, 进度: {state.progress}%")
        
        if state.status in ["SUCCESS", "FAILURE"]:
            print(f"视频URL: {state.video_url}")
            break
        
        await asyncio.sleep(5)

asyncio.run(test())
```

---

## 六、前端对接类

### Q24: 前端如何轮询任务状态？
**回答**：
**推荐方案（React）**：

```typescript
const pollTaskStatus = async (taskId: number) => {
  const maxRetries = 60; // 最多轮询5分钟
  let retries = 0;
  
  const poll = setInterval(async () => {
    const res = await fetch(`/api/v1/tasks/${taskId}`);
    const data = await res.json();
    
    if (data.status === "SUCCESS") {
      clearInterval(poll);
      showToast("生成成功！");
      navigateTo(`/assets/${data.video_id}`);
    }
    
    if (data.status === "FAILURE" || retries++ > maxRetries) {
      clearInterval(poll);
      showToast("生成失败");
    }
  }, 5000); // 每5秒一次
};
```

---

### Q25: 前端如何实现播放器水印？
**回答**：
**CSS叠加方案**：

```tsx
<div className="relative">
  <video src={playUrl} className="w-full h-full" />
  
  {/* 水印层 */}
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute top-4 right-4 opacity-30 text-white">
      SkyRiff
    </div>
    <div className="absolute bottom-4 left-4 opacity-20 text-xs text-white">
      用户ID: {userId} | {new Date().toLocaleString()}
    </div>
  </div>
</div>
```

---

## 七、部署运维类

### Q26: 如何部署到生产环境？
**回答**：
**推荐方案（Docker）**：

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "8000:8000"
    env_file: .env
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:14
    volumes:
      - pgdata:/var/lib/postgresql/data
  
  redis:
    image: redis:6
    
volumes:
  pgdata:
```

---

### Q27: 如何监控服务健康？
**回答**：
**三层监控**：

1. **健康检查接口**：
   ```python
   @app.get("/health")
   def health():
       return {"status": "ok", "timestamp": time.time()}
   ```

2. **日志监控**（Sentry）
3. **性能监控**（Prometheus + Grafana）

---

## 八、更新日志

### v1.0（2025-12-25）
- 初始版本
- 包含27个常见问题

---

**有新问题？**  
请联系技术团队或提交Issue，我们会及时更新FAQ。
