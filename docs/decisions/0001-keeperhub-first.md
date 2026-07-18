# ADR-0001 · KeeperHub First

## Read When

- 重新评估首场赛事、链或核心产品方向前。

## Owner

- Product Architect

## Update Trigger

- KeeperHub 规则重大变化、比赛关闭，或出现更高匹配且可验证的新机会。

## Validation

- 对照官方规则与本项目交付能力复核；替换时新增 ADR，不静默覆盖。

## Decision

首场选择 KeeperHub Agents Onchain；Flare Summer Signal 只作为后备。

## Why

- KeeperHub 明确允许个人参赛，技术主题与 MCP/Agent/链上执行直接匹配。
- 可以使用 Sepolia 测试币完成真实交易，不要求投入真实资金。
- Flare Confidential Compute 官方仍标注尚未公开可用，首场排期风险过高。

## Consequences

- 当前先完成机会评分、证据哈希、合约与 dry-run，不在比赛开始前制造模糊的 KeeperHub 提交历史。
- 7 月 27 日后接入官方 MCP，并在公开问答确认赛前代码边界。
