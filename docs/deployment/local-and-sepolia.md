# Local and Sepolia Deployment

## Read When

- 本地启动、生产构建、测试网部署或 KeeperHub 连接前。

## Owner

- Release / Smart Contract Engineer

## Update Trigger

- Node、构建命令、网络、环境变量、合约或部署流程变化。

## Validation

- 本地构建成功；Sepolia 部署只有在人工确认后才记录真实地址和交易证据。

## Local

```bash
npm install
npm run dev
npm test
npm run build
npm run keeperhub:preflight
```

`keeperhub:preflight` 完全离线，只输出字段是否存在、格式是否有效以及固定 Sepolia chain ID；不会回显凭据或地址值。

生成交接包：

```bash
npm run keeperhub:handoff -- --opportunity-id keeperhub-agents-onchain-2026
```

输出是 `keeperhub-contract-call-handoff.v1`，默认 `simulate: true`、`networkAccess: false`、`transactionCreated: false`。

## Sepolia Gate

### Nox Confidential Strategy Vault

页面在未配置地址时提供“部署已审核合约（0 ETH）”入口。它只读取本地 Hardhat 产物并调用 MetaMask 的 Sepolia 部署；应用不接触私钥。部署前核对网络、发起账户、`value = 0`、gas 和字节码来源，部署后把公开地址写入：

```bash
NEXT_PUBLIC_NOX_STRATEGY_VAULT_ADDRESS=0x...
```

随后至少完成一次真实加密写入与所有者解密，并记录部署/写入交易链接。Nox SDK 已内置 Sepolia gateway、compute contract 与 subgraph；不要用自定义主网配置替换测试网。

已确认的 Sepolia 实证（2026-07-18）：

- 合约：`0xB766Ca2571645b19b7DA65fb1774DB87F4eE4B37`
- 部署交易：`0x7661ee2c528676042608b391ed606802a21e4b2ae898d362d4abcd41abcd8c96`，区块 `11299843`，状态 `success`
- 首次加密写入：`0xc6d6a8e3c7278d6401b11da1ba3289c16f299d8909d690a2653ce24e3b3a3fcd`，区块 `11299900`，状态 `success`
- 链上句柄：`0x0000aa36a72301afd7f9707d5d597fa098298b1f5404655f8188c442d0b78086`
- 链上更新时间：`2026-07-18T16:18:48Z`

以上公开信息已通过 Sepolia RPC 二次读取核对；钱包所有者 EIP-712 签名后的浏览器本地解密也已成功验收，策略明文只在当前 React 内存中显示。

### Public dApp

- Production URL: <https://bounty-radar-pandaer119s-projects.vercel.app>
- Vercel deployment ID: `dpl_Eqcve35c4zYqHKq9QWKVQuw7jKtp`
- Framework preset: Next.js
- Production status: `Ready`
- Access protection: SSO deployment protection disabled，允许评委匿名访问
- Online checks: 首页、`/api/health`、`/api/opportunities`、`/api/contracts/nox-strategy-vault` 均返回 `200`

### KeeperHub

当前不自动部署。进入测试网前必须：

1. 本人创建并备份钱包，领取纯测试币。
2. 确认比赛允许的赛前代码边界。
3. 部署 `OpportunityRegistry`，初始 executor 指向拟连接的 KeeperHub 组织钱包。
4. 将地址写入服务端 `OPPORTUNITY_REGISTRY_ADDRESS`，不得放入客户端源码。
5. 在本机服务端配置 KeeperHub 组织 key；不要粘贴到聊天或提交到仓库。
6. 人工设置 `KEEPERHUB_SIMULATION_ENABLED=true`，先运行 Direct Execution 安全模拟。
7. 核对 ABI、参数、gas estimate、from/to 和 `wouldRevert=false` 后，再批准比赛期 MCP 真实执行。

模拟 API 仍需要 KeeperHub 组织钱包作为 from address，但不会签名或广播；真实执行入口当前没有实现。

禁止在本项目保存助记词、私钥、真实资金账户或主网交易密钥。
