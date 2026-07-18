# WTF Hackathon Summer Edition · Nox

## Read When

- 报名、Nox 开发、Sepolia 部署、公开仓库、视频或 DoraHacks 提交前。

## Owner

- Product Lead / Competition Ops

## Update Trigger

- 官方规则、截止日、交付物、评审标准或提交状态变化。

## Validation

- 只采用官方 DoraHacks 页面与 Nox 文档；提交前重新逐项核验。

## Confirmed Snapshot · 2026-07-18

- 活动奖池 1,500 USD：第一名 750、第二名 500、第三名 250。
- 当前账号已作为单人参赛者完成报名；DoraHacks 主按钮已显示 `Unregister`。
- 官方评审强调创意、端到端真实工作、Ethereum Sepolia 部署、Nox 技术实现和直观 UX。
- 必须提供公开 GitHub、完整可读源码、README、部署/使用文档、可用前端和 4 分钟以内演示视频。
- 必须在仓库根目录提供 `feedback.md`。
- 需要在 X 发布项目介绍、演示视频和公开 GitHub 链接，并标记 `@iEx_ec`。
- 官方 Discord：<https://discord.gg/RXYHBJceMe>。

官方入口：

- [WTF Hackathon](https://dorahacks.io/hackathon/wtf-hackathon/detail)
- [Nox Hello World](https://docs.noxprotocol.io/getting-started/hello-world)
- [Nox JavaScript SDK](https://docs.noxprotocol.io/references/js-sdk)
- [Nox npm packages](https://www.npmjs.com/org/iexec-nox?activeTab=packages)

## Hackathon Scope

本仓库原有 Bounty Radar、评分、BountyProof 与 KeeperHub simulate-only 工作台。WTF Hackathon 期间新增的是：

- `ConfidentialStrategyVault` Nox 合约；
- 策略打包/拆包和 Nox SDK 客户端；
- MetaMask Sepolia 部署、加密写入与 owner-only 解密界面；
- Nox 架构、部署、反馈和比赛交付文档；
- 相应单元、合约与端到端安全状态测试。

## Submission Checklist

- [x] DoraHacks 报名成功
- [x] Nox Hello World journey 完成并有 Sepolia 交易证据
- [x] Nox 合约、前端和测试实现
- [x] 根目录 `feedback.md`
- [x] 部署 `ConfidentialStrategyVault` 到 Sepolia
- [x] 完成一次加密写入 → owner 解密往返
- [x] 将合约与交易链接写入 README/本文
- [x] 创建公开 GitHub 仓库并核对可访问性
- [x] 部署可公开访问的 dApp
- [x] 录制 4 分钟以内演示视频
- [ ] 发布 X 帖子并标记 `@iEx_ec`
- [ ] 在 DoraHacks 提交最终项目

## Public Evidence

- Tutorial contract: `0xA3eF50EBA8ACE33ac23AF92F831fF846664592B1`
- Tutorial deploy transaction: [Sepolia Etherscan](https://sepolia.etherscan.io/tx/0xb5679210093b88cdc839bd48648f4093a63c41d846be7fae41edd1d69009ce95)
- Submission contract: [0xB766Ca2571645b19b7DA65fb1774DB87F4eE4B37](https://sepolia.etherscan.io/address/0xB766Ca2571645b19b7DA65fb1774DB87F4eE4B37)
- Submission deploy transaction: [0x7661ee2c528676042608b391ed606802a21e4b2ae898d362d4abcd41abcd8c96](https://sepolia.etherscan.io/tx/0x7661ee2c528676042608b391ed606802a21e4b2ae898d362d4abcd41abcd8c96)
- First encrypted strategy transaction: [0xc6d6a8e3c7278d6401b11da1ba3289c16f299d8909d690a2653ce24e3b3a3fcd](https://sepolia.etherscan.io/tx/0xc6d6a8e3c7278d6401b11da1ba3289c16f299d8909d690a2653ce24e3b3a3fcd)
- Public handle: `0x0000aa36a72301afd7f9707d5d597fa098298b1f5404655f8188c442d0b78086`
- On-chain updated time: `2026-07-18T16:18:48Z`
- Owner decrypt acceptance: 钱包 EIP-712 签名后，浏览器成功解出并显示原始策略三项值；页面确认明文只保留在当前 React 内存，不写回链上。
- Public GitHub: <https://github.com/pandaer119/bounty-radar>
- Live dApp: <https://bounty-radar-pandaer119s-projects.vercel.app>
- Vercel production deployment: `dpl_Eqcve35c4zYqHKq9QWKVQuw7jKtp`，状态 `Ready`
- Public acceptance: 首页 `200`；健康、机会和合约字节码 API 均 `200`；客户端脚本包含 Nox UI 与正确的 Sepolia 合约地址。
- Local demo master: `/Volumes/star/网页版剪映/成品视频/Bounty-Radar-Nox-参赛演示.mp4`
- Demo QC: `123s`、`1920×1080`、`30fps`、H.264 + AAC；七个章节画面抽检通过，平均音量 `-19.7 dB`、峰值 `-2.0 dB`。
- Public demo video: <https://github.com/pandaer119/bounty-radar/releases/download/v0.1.0-nox-demo/Bounty-Radar-Nox-Demo.mp4>
- Demo SHA-256: `9fedfea3fd20c0db144efa896b3222571fb1dad3e22182d578c68495cbede4d9`
