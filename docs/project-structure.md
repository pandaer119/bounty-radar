# Project Structure

## Read When

- Before broad feature work, refactors, file moves, or onboarding.

## Owner

- Project Assistant

## Update Trigger

- Directory, module, entry point, generated output, or important file changes.

## Validation

- Paths exist or are explicitly marked removed.

## Top-Level Directories

- `src/app/`：Next.js 页面、机会/证明 API 与 Nox 部署字节码只读端点。
- `src/components/`：机会决策台的 UI 组件。
- `src/data/`：人工核验后的官方机会快照。
- `src/lib/`：评分、API client、BountyProof、Nox 策略编码与 KeeperHub 服务端草案边界。
- `contracts/`：`OpportunityRegistry`、`ConfidentialStrategyVault` 与 Solidity 测试。
- `scripts/`：KeeperHub/Sepolia 离线预检与 simulate-only handoff 生成。
- `tests/e2e/`：真实 Chrome 的关键决策流与三视口验收。
- `tests/scripts/`：离线工具的密钥不泄露、风险门禁和交接格式测试。
- `docs/`：架构、产品、API、比赛、部署、路线图和证据层。

## Important Files

- `src/components/radar-dashboard.tsx`：主工作台状态与筛选编排。
- `src/components/confidential-strategy-vault.tsx`：Nox 钱包连接、部署、加密写入和本地解密。
- `src/lib/nox/strategy.ts`：策略 ABI、范围验证与单句柄编码。
- `src/app/api/contracts/nox-strategy-vault/route.ts`：已编译 Nox 合约字节码的只读部署端点。
- `src/lib/scoring.ts`：风险调整评分真源。
- `src/lib/bounty-proof.ts`：确定性链上证据载荷。
- `src/lib/keeperhub/draft.ts`：服务端 Sepolia calldata 草案。
- `src/lib/keeperhub/client.ts`：KeeperHub simulate-only Direct Execution 客户端与错误归一化。
- `src/app/api/integrations/keeperhub/status/route.ts`：不泄露配置值的执行就绪状态。
- `src/app/api/proofs/simulate/route.ts`：三重门禁后的 KeeperHub 非广播模拟。
- `contracts/OpportunityRegistry.sol`：授权写入与证据修订链。
- `contracts/ConfidentialStrategyVault.sol`：Nox 外部句柄验证、ACL 和 owner 策略存储。
- `scripts/keeperhub-preflight.mjs`：离线环境与固定链预检。
- `scripts/export-keeperhub-handoff.mjs`：离线生成可复现 BountyProof 调用交接包。
- `playwright.config.ts`：本机 Chrome 端到端验收与测试服务器配置。
- `docs/evidence/screenshots/`：桌面、平板、手机的实测视觉证据。

## Module Boundaries

- UI 不直接读取官方站点或调用 KeeperHub；必须经过 API/client boundary。
- 赛事事实属于 `src/data/`，评分规则属于 `src/lib/scoring.ts`，禁止混写。
- 外部链上执行必须在服务端 adapter，并保留人工批准门禁。
- Nox 是显式钱包交互例外：仅在用户点击后请求 MetaMask，私钥和签名始终留在钱包扩展。

## Avoid Editing Without Reason

- `package-lock.json`、`.next/`、`artifacts/`、`cache/` 等生成内容。
- `.env*`、钱包、私钥、API key 和任何真实资金凭据。
- 已核验机会的日期或规则，除非同时更新官方证据与测试。
