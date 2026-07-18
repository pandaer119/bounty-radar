# iExec Nox Developer Feedback

Tested on 2026-07-18 with:

- `@iexec-nox/handle@0.1.0-beta.13`
- `@iexec-nox/nox-protocol-contracts@0.2.4`
- Hardhat 3, Solidity 0.8.36, Viem 2, Ethereum Sepolia

## What worked well

- `createViemHandleClient` fits an existing Viem wallet flow without introducing a second wallet abstraction.
- `encryptInput(value, "uint256", contract)` returns a compact `handle` and `handleProof` pair that maps cleanly to a Solidity method.
- The Sepolia gateway, compute contract and subgraph defaults are bundled in the SDK, reducing configuration mistakes.
- The explicit `Nox.allowThis` and `Nox.allow` model makes the intended ACL visible during contract review.

## Friction encountered

- The Solidity package requires `^0.8.35`; an existing project on 0.8.29 must upgrade its compiler before the import can compile.
- The most important permission rule—calling `allowThis` and `allow` after storing or deriving a handle—is easy to miss. A compile-time helper, lint rule, or more prominent failing example would prevent silent integration errors.
- Examples would be stronger with one complete Viem flow covering network switching, transaction receipt waiting, reading the stored handle, and owner decryption in the same repository.
- Local contract tests can compile the Nox contract, but realistic encrypted-operation tests need the dedicated Hardhat plugin. A short compatibility table for Hardhat 3 and starter versions would make adoption faster.

## Suggestions

1. Publish a canonical end-to-end Viem starter with React, Solidity, tests, Sepolia deployment, and decryption UX.
2. Add a typed helper that couples a stored handle with the required ACL calls, or clearly flags missing permission propagation.
3. Document expected wallet signature counts and recommended UI copy for encryption versus decryption.
4. Version the network configuration page alongside the SDK and expose a small `getSupportedChains()` API.

## Scope disclosure

Bounty Radar and its public opportunity-scoring workspace existed before this hackathon. The Nox confidential strategy contract, encrypted strategy client, wallet UX, deployment path, tests, documentation, and this feedback were added for the WTF Hackathon Summer Edition.
