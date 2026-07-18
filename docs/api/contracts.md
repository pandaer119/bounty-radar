# API Contracts

## Read When

- 修改机会 API、BountyProof preview、错误语义或客户端请求层前。

## Owner

- Backend / API

## Update Trigger

- 路由、响应字段、错误码、缓存或超时策略变化。

## Validation

- `npm run typecheck`、单元测试和本地 HTTP smoke test 通过。

## `GET /api/opportunities`

返回按风险调整分数排序的机会，以及 `verifiedAt`、`generatedAt`、数据源模式和 stale 标记。响应 `cache-control: no-store`，避免把过期赛事当实时状态。

## `POST /api/proofs/preview`

请求：

```json
{"opportunityId":"keeperhub-agents-onchain-2026"}
```

成功响应包含确定性的 `opportunityKey`、`sourceHash`、评分和 Sepolia KeeperHub 调用草案。没有已部署合约地址时返回 `needs_contract_deployment`，不会发送交易。

错误：

- `400 INVALID_JSON`
- `404 OPPORTUNITY_NOT_FOUND`
- `422 INVALID_OPPORTUNITY_ID`
- `422 RISK_GATE_BLOCKED`

## `GET /api/integrations/keeperhub/status`

只返回布尔型就绪状态：组织凭据是否存在、合约地址是否有效、人工模拟开关是否开启，以及 `broadcastEnabled: false`。不得返回 API key、合约地址值或其他服务端配置。

状态：

- `configuration_required`
- `human_approval_required`
- `ready_for_simulation`

## `POST /api/proofs/simulate`

请求与 preview 相同。服务端重新计算 proof 和风险门禁，再通过 KeeperHub Direct Execution 调用 `contract-call`，请求体固定 `network=sepolia` 与 `simulate=true`；API 不提供 broadcast 参数。

额外错误：

- `403 KEEPERHUB_SIMULATION_APPROVAL_REQUIRED`
- `503 KEEPERHUB_CONFIGURATION_ERROR`
- `401 KEEPERHUB_UNAUTHORIZED`
- `403 KEEPERHUB_FORBIDDEN`
- `409 KEEPERHUB_CONFLICT`
- `429 KEEPERHUB_RATE_LIMITED`
- `502/504 KEEPERHUB_UPSTREAM_ERROR | KEEPERHUB_NETWORK_ERROR | KEEPERHUB_TIMEOUT | KEEPERHUB_INVALID_RESPONSE`

429、5xx、网络与超时采用有界重试；上游错误正文和敏感字段不会返回前端。只有明确的 `status=simulated` 且没有 `transactionHash` 才视为成功。

## Client Boundary

所有浏览器请求经 `src/lib/api-client.ts`，统一处理超时、HTTP 错误和重试语义。服务端密钥与合约配置不得进入客户端 bundle。
