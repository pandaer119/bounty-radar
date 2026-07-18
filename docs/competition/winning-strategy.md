# KeeperHub Winning Strategy

## Read When

- 设计功能优先级、90 秒演示、提交材料或最终冲刺计划前。

## Owner

- Product Lead / Competition Ops

## Update Trigger

- KeeperHub 评审规则、奖项、提交物或产品主叙事变化。

## Validation

- 每条策略能映射到官方评审要求，并由真实产品状态或链上证据支撑。

## Product Wedge

`BountyProof Agent` 不是又一个会聊天的“赛事推荐机器人”。它把一条官方赏金事实转成可核验、可人工批准、可由 KeeperHub 执行的 Sepolia 证据，并保留来源哈希、评分解释、执行记录和交易链接。

## Five Winning Moves

1. **前 15 秒就展示真实执行结果**：先出现 KeeperHub run 与 Sepolia 交易链接，再解释评分，直接回应“真实交易优先于纯推理或 mockup”。
2. **让 KeeperHub 成为必需层**：KeeperHub 负责人工批准后的写合约、执行状态和审计轨迹；移除 KeeperHub 后产品闭环应明确失效。
3. **把可靠性做成可见功能**：展示确定性 source hash、revision chain、失败状态、可重试边界与高风险机会阻断，不只展示成功动画。
4. **同时争取主奖与 onboarding 奖**：保持集成小而深，使用官方 MCP 和 Web3 plugin，README 单独说明新用户如何复现第一笔测试网证明。
5. **只做一条窄而完整的链**：官方事实 → 风险调整评分 → 人工批准 → KeeperHub → Sepolia registry → 区块浏览器；x402/MPP 和多链留作扩展。

## 90-Second Demo Arc

- **0–10 秒**：问题——AI/Web3 赏金很多，但规则、风险与可执行性混在一起。
- **10–28 秒**：Radar 读取已核验机会，解释为什么 KeeperHub 排第一、实盘交易赛被阻断。
- **28–43 秒**：生成 `opportunityKey + sourceHash + score`，强调此时尚未连接钱包。
- **43–68 秒**：人工批准后由 KeeperHub MCP 运行 Web3 workflow，在 Sepolia 调用 `OpportunityRegistry.record`。
- **68–82 秒**：展示 KeeperHub audit trail、合约 revision 与区块浏览器交易。
- **82–90 秒**：一句话收束——Agent 不只找到机会，还能留下可验证的执行证据。

## Submission Risks To Avoid

- 不用预录或伪造交易代替由 Agent 经 KeeperHub 执行的真实测试网交易。
- 不把 KeeperHub 降成可替换的按钮或 logo；链上执行和审计必须真实依赖它。
- 不在演示或仓库中暴露钱包私钥、组织 API key、真实资金或可复用签名。
- 不宣称未公布的 KYC、税务、发奖链、gas sponsorship 或赛前代码政策。
- 7 月 27 日起单独记录 KeeperHub 集成提交，提交前在官方 Q&A 确认赛前代码边界。

## Evidence Boundary

- 赛事规则与提交物来自 [KeeperHub 官方活动页](https://dorahacks.io/hackathon/agents-onchain/detail)。
- MCP、链和写合约能力分别以 [MCP 文档](https://docs.keeperhub.com/ai-tools/mcp-server)、[Chains API](https://docs.keeperhub.com/api/chains) 与 [Web3 Plugin](https://docs.keeperhub.com/plugins/web3) 为准。
- 上述获奖动作是基于官方评审维度的产品策略推断，不是官方获奖保证。
