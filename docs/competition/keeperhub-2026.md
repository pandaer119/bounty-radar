# KeeperHub Agents Onchain 2026

## Read When

- 决定首期交付范围、报名、KeeperHub 集成、演示或提交材料前。

## Owner

- Product Lead / Competition Ops

## Update Trigger

- 官方规则、日期、奖金、资格、提交物或技术文档变化。

## Validation

- 只采用官方赛事页、KeeperHub 官方文档与官方 GitHub；提交前再次逐项核验。

## Confirmed Snapshot · 2026-07-18

- 全球线上，18 岁以上个人或团队可参赛；受适用制裁限制地区除外。
- 2026-07-27 开始，2026-08-13 截止，2026-08-20 公布。
- $5,000 稳定币奖励：前三名 $2,000 / $1,200 / $800；另有两份 onboarding bounty 共 $1,000，可与前三名叠加。
- 必须把 KeeperHub 作为链上执行层并完成真实交易；纯推理、mockup 或只展示 Agent 决策不合格。
- 提交 GitHub、短演示视频和由 Agent 经 KeeperHub 执行的交易链接。

官方入口：

- [赛事页](https://dorahacks.io/hackathon/agents-onchain/detail)
- [KeeperHub MCP](https://docs.keeperhub.com/ai-tools/mcp-server)
- [Chains API](https://docs.keeperhub.com/api/chains)
- [Web3 Plugin](https://docs.keeperhub.com/plugins/web3)

## MVP Story

`BountyProof Agent` 读取已核验机会，生成机会 ID、证据哈希和评分；达到门槛后通过 KeeperHub 在 Sepolia 调用 `OpportunityRegistry.record(...)`。演示必须完整展示“官方证据 → 决策 → KeeperHub run/audit trail → 区块浏览器交易”。

## Unconfirmed Before Submission

- 赛前已有代码的允许边界。
- KYC、税务、奖金领取期限、具体稳定币与发奖链。
- 主网 gas sponsorship 的精确范围；不得将其视为保证。
