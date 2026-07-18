# WTF Nox Submission Copy

## Read When

- Before publishing the X post or completing the DoraHacks project form.

## Submission Fields

### Project Name

Bounty Radar

### Tagline

AI Agent × Web3 bounty intelligence with Nox-encrypted strategy execution.

### Short Description

Bounty Radar turns fragmented bounty pages into a verifiable decision workspace. It records official evidence, scores opportunity fit and risk, keeps wallet and submission actions behind explicit human confirmation, and uses iExec Nox to encrypt competitive strategy values before writing an unreadable handle to Ethereum Sepolia. Only the wallet owner can decrypt the strategy locally through an EIP-712 signature; plaintext is never written back on-chain.

### Full Description

Bounty hunters currently compare prize pools, deadlines, eligibility rules and technical fit across disconnected pages. The result is slow, hard to audit and easy to bias. Bounty Radar creates one evidence-backed pipeline for opportunity discovery, risk-adjusted scoring and safe execution.

For the WTF Hackathon, the product includes a Nox Confidential Strategy Vault. Budget, planned hours and confidence are packed in the browser and encrypted through Nox. The Sepolia contract stores only the encrypted handle and emits permission events. The connected owner wallet can later sign an EIP-712 request and decrypt the original values locally; the dApp never sends wallet private keys or decrypted plaintext to the server or chain.

The submission is a working public Next.js dApp with a public GitHub repository, tested Solidity contract, real Sepolia deployment, confirmed encrypted write, owner-only decryption acceptance, API health checks and a Chinese product demo under four minutes.

### Nox Integration

- Browser-side strategy packing for budget, planned hours and confidence.
- Nox encrypted handle and proof generation.
- `ConfidentialStrategyVault` stores the encrypted handle on Ethereum Sepolia.
- Contract ACL grants access to the contract and wallet owner.
- Owner-only local decryption after EIP-712 signature.
- Plaintext is never written back to the chain or public documentation.

### Tech Stack

Next.js 16, React 19, TypeScript, Solidity 0.8.36, Hardhat 3, Viem, MetaMask, iExec Nox SDK, Ethereum Sepolia, Vitest and Vercel.

### Public Links

- GitHub: <https://github.com/pandaer119/bounty-radar>
- Live dApp: <https://bounty-radar-pandaer119s-projects.vercel.app>
- Demo video: <https://github.com/pandaer119/bounty-radar/releases/download/v0.1.0-nox-demo/Bounty-Radar-Nox-Demo.mp4>
- Contract: <https://sepolia.etherscan.io/address/0xB766Ca2571645b19b7DA65fb1774DB87F4eE4B37>
- Deploy transaction: <https://sepolia.etherscan.io/tx/0x7661ee2c528676042608b391ed606802a21e4b2ae898d362d4abcd41abcd8c96>
- Encrypted write transaction: <https://sepolia.etherscan.io/tx/0xc6d6a8e3c7278d6401b11da1ba3289c16f299d8909d690a2653ce24e3b3a3fcd>

### Demo Instructions

1. Open the public dApp and inspect the verified opportunity queue and scoring rail.
2. Open the Nox confidential strategy section; the deployed Sepolia contract is preconfigured.
3. Connect MetaMask on Ethereum Sepolia.
4. Enter non-sensitive demonstration values and approve the encrypted write transaction.
5. Use the owner-decrypt action and approve the EIP-712 signature.
6. Confirm that plaintext appears only in the current browser session and is not written on-chain.

## X Post Draft

Attach the accepted MP4 directly to the post, then publish this copy:

> 🚀 Bounty Radar for WTF Hackathon: AI Agent × Web3 bounty intelligence with iExec Nox. It verifies opportunities, scores risk, encrypts strategy on Sepolia, and supports owner-only local decrypt. Code: https://github.com/pandaer119/bounty-radar @iEx_ec #Web3 #AI

The raw copy is 261 Unicode characters before X applies its fixed URL weighting, so it fits a standard post while leaving the live dApp in the GitHub README and attached demo.

## Final Gate

- Attach `/Volumes/star/网页版剪映/成品视频/Bounty-Radar-Nox-参赛演示.mp4` to the X post; the public GitHub Release URL above remains the durable downloadable master.
- Publish the X post and capture its URL.
- Confirm a real Discord, WhatsApp or WeChat backup contact in the DoraHacks Contact step; do not infer it from unrelated account names.
- Paste the public video and X URLs into DoraHacks.
- Recheck that the public GitHub, dApp, contract and transaction links open without login.
- Submit only after the form preview shows the intended wallet/account and all public links.
