# Development Log

## Read When

- Before handoff, project review, or resuming old work.

## Owner

- Project Assistant

## Update Trigger

- Meaningful project state, architecture, feature, release, or docs changes.

## Validation

- Entries are durable summaries, not raw command logs.

## Log

- **2026-07-18 · Initial MVP** — 建立 Next.js 决策台、机会评分 API、BountyProof preview、KeeperHub dry-run 边界、授权链上注册表、TypeScript/Solidity 测试与项目记忆入口。详情见 `docs/architecture/bounty-proof.md` 与 `docs/competition/keeperhub-2026.md`。
- **2026-07-18 · Browser acceptance** — 使用本机 Chrome 完成 1440、1024、390 三视口和完整决策流验收；验证机会 API、证明预览、基础可访问性、零 API/console 错误与高风险阻断，并修复筛选后详情未切换及缺失站点图标的问题。截图见 `docs/evidence/screenshots/`。
- **2026-07-18 · KeeperHub safe integration** — 按官方实时 schema 实现 Direct Execution simulate-only 客户端、状态/模拟 API、显式人工总开关、脱敏错误、有界重试、离线预检与 handoff 工具；UI 增加 execution rail，并在真实 Chrome 中验证未配置态不会产生外部请求。真实广播入口仍不存在。
- **2026-07-18 · WTF registration and Nox MVP** — 完成 DoraHacks 单人报名与 Nox Hello World Sepolia journey；新增 `ConfidentialStrategyVault`、单句柄策略编码、MetaMask 人工部署/写入/解密 UX、SDK 依赖、单元/合约测试、提交清单和 `feedback.md`。本地生产构建与 Chrome 页面验收通过，真实新合约部署仍处于钱包确认门禁。
- **2026-07-18 · Nox Sepolia end-to-end acceptance** — `ConfidentialStrategyVault` 已部署到 `0xB766Ca2571645b19b7DA65fb1774DB87F4eE4B37`；部署交易 `0x7661…8c96` 与首次加密写入 `0xc6d6…3fcd` 均在 Sepolia 成功确认。RPC 二次读取返回非零 Nox 句柄和 `2026-07-18T16:18:48Z` 更新时间；钱包所有者 EIP-712 签名后，浏览器成功完成本地解密且未把明文写回链上。
