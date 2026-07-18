# Bounty Radar Workspace

## Read When

- 修改机会列表、筛选、评分展示、详情面板或 BountyProof 交互前。

## Owner

- Frontend / Product

## Update Trigger

- UI 主任务、筛选字段、评分维度、状态或安全门禁变化。

## Validation

- 1440px、1024px、390px 视口可完成搜索、筛选、选中机会和生成证明草案。

## Main Job

用户进入后无需阅读说明即可判断：哪个机会优先、为什么、截止多久、需要交付什么、哪些动作必须本人完成。

## Screen Structure

- 左侧：产品身份、首期流程和零资金自动化边界。
- 顶部：官方证据状态与四项决策指标。
- 中部：可分享筛选参数、机会队列与本地候选收藏。
- 右侧：评分剖面、BountyProof execution rail、KeeperHub 配置/广播状态、提交要求、下一步动作和人工门禁。

## Explicit States

- Loading：指标和队列骨架屏。
- Error：保留本地偏好并提供重试。
- Empty：提示放宽筛选。
- Refreshing：同步按钮与状态图标反馈。
- Risk blocked：禁止为实盘类机会生成证明或执行草案。
- Configuration required：合约或 KeeperHub 服务端凭据未配置，安全模拟按钮保持禁用。
- Human approval required：前置配置已完成，但模拟总开关未由人工开启。
- Simulated：展示 gas estimate 与不会回滚状态，仍明确没有签名、广播或交易哈希。
