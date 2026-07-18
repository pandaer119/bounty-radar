# BountyProof Architecture

## Read When

- 修改评分、证据哈希、KeeperHub 执行边界或链上合约前。

## Owner

- Product Architect / Smart Contract Engineer

## Update Trigger

- 证据模型、合约接口、执行网络或 KeeperHub 集成方式变化。

## Validation

- `npm run test:unit` 与 `npm run test:contract` 通过；API 不泄露服务端配置。

## Data Flow

```text
官方规则 -> 结构化机会 -> 风险调整评分 -> 确定性 evidence hash
                                         -> 本地 calldata / 离线 handoff
                                         -> 人工开启 simulate 总开关
                                         -> KeeperHub Direct Execution simulate:true
                                         -> 人工批准真实 MCP 执行
                                         -> Sepolia OpportunityRegistry
```

## Boundaries

- `src/data/opportunities.ts`：当前官方核验快照，不把搜索片段当最终证据。
- `src/lib/scoring.ts`：纯函数评分，时间可注入以便复现。
- `src/lib/bounty-proof.ts`：对机会 ID 和规范化官方证据做 SHA-256。
- `src/lib/keeperhub/draft.ts`：仅在服务端生成合约调用草案；没有地址时保持阻断。
- `src/lib/keeperhub/client.ts`：只暴露安全模拟；ABI/参数按官方 Direct Execution 契约序列化，拒绝非 `simulated` 或带交易哈希的响应。
- `src/app/api/proofs/simulate/route.ts`：同时执行机会风险门禁、显式模拟开关与服务端配置门禁。
- `contracts/OpportunityRegistry.sol`：仅授权执行者可写，证据以修订链追加，不覆盖旧记录。

## Security Invariants

- 默认网络只能是 Sepolia，禁止把真实资金或主网私钥作为 MVP 前置条件。
- 前端不接收、不存储 KeeperHub API key、助记词或私钥。
- `KEEPERHUB_SIMULATION_ENABLED` 默认关闭；未人工设为 `true` 时不会向 KeeperHub 发出模拟请求。
- 客户端请求体强制 `simulate: true`，代码不存在广播方法；响应若含 `transactionHash` 会作为安全契约漂移被拒绝。
- 任何真实外部写操作必须经过人工批准；当前代码没有广播入口。
- 高资金风险机会在 API 证明层再次阻断，不能只依赖 UI 标签。
