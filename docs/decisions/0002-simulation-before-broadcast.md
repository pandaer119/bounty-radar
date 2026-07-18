# ADR 0002 · Simulation Before Broadcast

## Read When

- 修改 KeeperHub 调用方式、模拟开关、服务端凭据、钱包或真实链上执行边界前。

## Owner

- Product Architect / Security

## Update Trigger

- Direct Execution 契约、认证、模拟能力或真实 broadcast 模型变化。

## Validation

- KeeperHub client、API、离线工具和浏览器测试证明默认环境无法广播交易。

## Decision

KeeperHub 集成分成两个不可混淆的阶段：

1. 应用内只实现官方 Direct Execution `simulate: true`，并要求服务端配置、机会风险门禁和 `KEEPERHUB_SIMULATION_ENABLED=true` 三项同时满足。
2. 真实测试网写入只在比赛开始、人工确认、钱包完成配置后通过 KeeperHub MCP 执行；当前应用不提供 broadcast 方法或路由。

模拟成功还必须返回 `status=simulated` 且不能包含 `transactionHash`；否则视为上游契约漂移并拒绝结果。

## Rationale

- 在不花 gas、不签名、不广播的情况下验证 ABI、参数、from address、gas estimate 和回滚风险。
- 防止把 UI 点击、dry-run 或本地 calldata 错报成比赛要求的真实 Agent 交易。
- 保留明确的人类控制点，避免组织 key 一旦配置就自动触发外部调用。

## Consequences

- 当前可以完成安全集成和演示前置验证，但不能声称已经产生 KeeperHub execution ID 或链上交易。
- 公开部署前还需增加服务端认证与限流；本阶段只面向本机或受控演示环境。
