# Technical Debt

## Read When

- Before refactors, planning, quality reviews, or cleanup work.

## Owner

- Project Assistant

## Update Trigger

- Debt is found, resolved, reprioritized, or invalidated.

## Validation

- Items include impact, affected area, and status.

## Items

- **TD-001 · 自动官方源同步** — Impact: 机会核验仍需人工运行搜索与更新快照。Area: `src/data/opportunities.ts`。Status: planned after first competition.
- **TD-002 · KeeperHub run observability** — Impact: UI 已展示模拟就绪和 gas 结果，但尚无真实 execution ID、状态轮询、audit trail 与区块浏览器链接。Area: KeeperHub server adapter/UI. Status: blocked until MCP access and human-approved wallet.
- **TD-003 · 公开环境调用保护** — Impact: simulate endpoint 只有显式环境开关，没有用户级认证或持久化限流；不能携带组织 key 直接公开部署。Area: server auth/rate limit. Status: required before public hosted demo.
