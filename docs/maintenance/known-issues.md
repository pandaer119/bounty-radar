# Known Issues

## Read When

- Before debugging, regression analysis, or release checks.

## Owner

- Debugger / Project Assistant

## Update Trigger

- A recurring, complex, or resolved issue changes.

## Validation

- Each issue includes status, evidence, and verification where possible.

## Issues

- **KH-001 · KeeperHub 写操作未启用** — Status: expected. simulate-only adapter 已完成，但总开关默认关闭；等待比赛开始、人工钱包连接与官方 MCP 配置后才允许真实测试网写入。Evidence: `src/lib/keeperhub/client.ts`、`src/app/api/proofs/simulate/route.ts`。
- **DATA-001 · 机会库是核验快照** — Status: accepted for MVP. 超过 7 天 API 会标记 stale，但不会自动抓取新规则。Evidence: `src/app/api/opportunities/route.ts`。
