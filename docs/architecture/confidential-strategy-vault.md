# Confidential Strategy Vault

## Read When

- 修改 Nox 合约、策略编码、钱包交互、解密权限或 Sepolia 部署流程前。

## Owner

- Smart Contract / Frontend

## Update Trigger

- Nox SDK、合约 ABI、打包格式、网络或权限模型变化。

## Validation

- Solidity 编译和合约测试通过；策略打包测试通过；生产构建通过；真实写入只在钱包确认后进行。

## Product Wedge

参赛者在公开赏金市场里需要比较预算、时间和获奖信心，但这些信息一旦明文上链就会暴露竞争策略。`ConfidentialStrategyVault` 把三项数据先在浏览器编码成单个 `uint256`，再通过 Nox SDK 加密；Sepolia 只保存不可读句柄和更新时间。

## Data Flow

1. 用户输入预算、投入小时和信心值。
2. 前端按 `[budget:224 bits][hours:24 bits][confidence:8 bits]` 打包，范围检查在加密前完成。
3. `@iexec-nox/handle` 为目标合约生成 `handle` 和 `handleProof`。
4. 钱包确认 `setStrategy(bytes32,bytes)` Sepolia 交易。
5. 合约调用 `Nox.fromExternal` 验证证明，并显式执行 `Nox.allowThis` 与 `Nox.allow(owner)`。
6. 公开读取只能得到句柄；所有者通过 EIP-712 签名后在浏览器本地解密并拆包。

## Security Invariants

- 不保存助记词、私钥、钱包密码或签名。
- 合约部署与每次策略写入都需要 MetaMask 明确确认。
- 解密后的明文只保存在 React 内存状态，不写入链上或浏览器存储。
- 句柄可公开读取，但 Nox ACL 只给合约和写入者权限。
- 前端固定 Ethereum Sepolia；检测到其他网络时请求用户切换。
- 未配置或未部署合约时，加密保存按钮保持禁用。

## Source Map

- `contracts/ConfidentialStrategyVault.sol`：句柄验证、存储和 ACL。
- `src/lib/nox/strategy.ts`：ABI、范围验证、打包与拆包。
- `src/components/confidential-strategy-vault.tsx`：MetaMask、Nox SDK、部署、写入和本地解密 UX。
- `src/app/api/contracts/nox-strategy-vault/route.ts`：只读返回已编译合约字节码，供人工钱包部署。
- `src/lib/nox/strategy.test.ts`：编码边界和往返测试。
- `contracts/ConfidentialStrategyVault.t.sol`：初始链上状态测试。

## Current Gate

代码与本地验收已通过；真实 Sepolia 部署、首次加密写入和解密往返仍需钱包持有人确认后产生链上证据。
