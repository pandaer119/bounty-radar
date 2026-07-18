# Roadmap

## Read When

- Before planning, resuming work, or deciding next actions.

## Owner

- Project Assistant

## Update Trigger

- Plans, milestones, risks, or next actions change.

## Validation

- Next actions are current, actionable, and not duplicated elsewhere.

## Long-term Positioning

- 本项目按长期产品建设，不以单次黑客松或单一赏金平台为终点。
- WTF Hackathon、KeeperHub 等比赛用于验证不同的产品能力、执行链路和市场需求，并沉淀可复用证据与运行轨迹。
- 演进顺序保持为：可信证据与安全执行闭环 → 扩大机会来源与自动核验 → 复杂 Agentic RAG → 受控 Skill 演进 → 达标后的多 Agent 编排。
- 长期建设仍遵守按需启用原则；未达到下方量化门槛的能力只保留设计入口，不提前开发。

## Current Focus

- WTF Hackathon 已报名；Nox Confidential Strategy Vault 已完成 Sepolia 部署、真实加密写入和 owner-only 本地解密闭环，当前进入公开提交材料阶段。

## Next Actions

1. 创建公开 GitHub 与公开 dApp，录制 4 分钟以内演示，发布 X 帖子并提交 DoraHacks。
2. 7 月 27 日后确认赛前代码边界，连接 KeeperHub 官方 MCP。
3. 提交前重新核验 WTF 与 KeeperHub 的发奖、KYC、税务和领取条件。

## Risks

- KeeperHub 外部执行需要组织钱包、测试币与人工连接。
- 公开提交前应避免在截图、视频或仓库中暴露私密策略明文；演示时使用专门的非敏感示例值。
- 当前 simulate API 面向本地/受控环境；若公开部署，启用服务端认证与限流后才能配置组织 key。
- 具体 KYC、税务、发奖链和领取期限未公布。
- 官方机会快照不是自动实时爬虫；超过 7 天会标记 stale，需重新核验。

## 保留能力库

以下能力不是当前交付主链，但属于项目中后期能力，不因当前暂缓而删除；只有同时达到对应的规模、安全、评测与收益门槛才启用：

- **复杂 Agentic RAG（中期）**
  - 规模门槛：持续跟踪不少于 100 个有效赏金，或单个机会需要交叉核验不少于 3 个独立官方来源，现有精确检索/人工核验已形成明显积压。
  - 安全前置：官方来源白名单、原文快照、内容哈希、时效/失效治理、权限过滤和外部内容注入隔离全部完成。
  - 评测门槛：至少 30 个跨文档检索用例；关键事实与引用对应准确率不低于 95%，高风险事实必须 100% 可追溯，未经授权的外部动作保持为 0。
- **自动生成和修改 Skill（中期）**
  - 数据门槛：累计不少于 30 条真实、脱敏、可回放的运行轨迹，同类可复用问题至少重复出现 5 次。
  - 治理前置：只生成候选 Skill 或差异提案；具备隔离测试、人工审批、版本记录、feature flag 和一键回滚。
  - 评测门槛：候选 Skill 在不少于 20 个相关场景中通过确定性验证，保留集无回归；不得自动修改钱包、权限、风控、签名或广播规则。
- **大规模多 Agent 编排（后期）**
  - 基础门槛：单 Agent 的状态机、trace、checkpoint、幂等和评测闭环已稳定，风险违规与重复外部写入均为 0。
  - 任务门槛：存在至少 3 个彼此独立、可并行验收的赏金或来源分区，串行处理已经造成持续积压或明显墙钟瓶颈。
  - 架构前置：唯一写入 orchestrator；核验 Agent 默认只读；任务边界、预算、超时、租约、结果合并和独立复核协议齐全。
  - 收益门槛：小规模试点相对同预算单 Agent 至少降低 30% 墙钟时间，或带来至少 10 个百分点的有效来源覆盖提升，且总成本不超过 3 倍。
