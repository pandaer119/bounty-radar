"use client";

import { useState } from "react";
import { createViemHandleClient, type Handle } from "@iexec-nox/handle";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, ShieldCheck, Wallet } from "lucide-react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type Address,
  type Hex,
} from "viem";
import { sepolia } from "viem/chains";
import {
  confidentialStrategyVaultAbi,
  getStrategyVaultAddress,
  packStrategy,
  SEPOLIA_CHAIN_ID,
  shortenAddress,
  unpackStrategy,
  validateStrategy,
  ZERO_HANDLE,
  type StrategyValues,
} from "@/lib/nox/strategy";

type PendingAction = "connect" | "deploy" | "save" | "decrypt";
type BrowserProvider = {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
};

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || undefined),
});

const defaultStrategy: StrategyValues = {
  budgetUsd: 500,
  effortHours: 40,
  confidence: 75,
};

function getBrowserProvider(): BrowserProvider {
  const provider = (window as typeof window & { ethereum?: BrowserProvider }).ethereum;
  if (!provider?.request) throw new Error("没有检测到 MetaMask，请先安装或启用钱包扩展");
  return provider;
}

async function connectSepoliaWallet() {
  const provider = getBrowserProvider();
  let walletClient = createWalletClient({
    chain: sepolia,
    transport: custom(provider as Parameters<typeof custom>[0]),
  });

  const currentChainId = await walletClient.getChainId();
  if (currentChainId !== SEPOLIA_CHAIN_ID) {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}` }],
    });
    walletClient = createWalletClient({
      chain: sepolia,
      transport: custom(provider as Parameters<typeof custom>[0]),
    });
  }

  const [account] = await walletClient.requestAddresses();
  if (!account) throw new Error("钱包没有返回可用账户");
  return { account, walletClient };
}

function errorMessage(error: unknown) {
  if (!(error instanceof Error)) return "操作失败，请重试";
  if (/rejected|denied/i.test(error.message)) return "你取消了钱包授权，链上没有发生变化";
  return error.message.split("\n")[0];
}

export function ConfidentialStrategyVault() {
  const configuredVaultAddress = getStrategyVaultAddress();
  const [deployedAddress, setDeployedAddress] = useState<Address>();
  const vaultAddress = deployedAddress ?? configuredVaultAddress;
  const [account, setAccount] = useState<Address>();
  const [form, setForm] = useState<StrategyValues>(defaultStrategy);
  const [revealed, setRevealed] = useState<StrategyValues>();
  const [encryptedHandle, setEncryptedHandle] = useState<Hex>();
  const [savedAt, setSavedAt] = useState<number>();
  const [transactionHash, setTransactionHash] = useState<Hex>();
  const [pending, setPending] = useState<PendingAction>();
  const [message, setMessage] = useState<string>();

  async function readSavedStrategy(owner: Address) {
    if (!vaultAddress) return;
    const [handle, updatedAt] = await publicClient.readContract({
      address: vaultAddress,
      abi: confidentialStrategyVaultAbi,
      functionName: "getStrategy",
      args: [owner],
    });
    setEncryptedHandle(handle === ZERO_HANDLE ? undefined : handle);
    setSavedAt(updatedAt > 0n ? Number(updatedAt) : undefined);
    setRevealed(undefined);
  }

  async function connect() {
    setPending("connect");
    setMessage(undefined);
    try {
      const wallet = await connectSepoliaWallet();
      setAccount(wallet.account);
      await readSavedStrategy(wallet.account);
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setPending(undefined);
    }
  }

  async function deployVault() {
    setPending("deploy");
    setMessage(undefined);
    try {
      const wallet = await connectSepoliaWallet();
      setAccount(wallet.account);
      const response = await fetch("/api/contracts/nox-strategy-vault");
      if (!response.ok) throw new Error("无法读取已审核的合约字节码");
      const payload = (await response.json()) as { bytecode?: Hex };
      if (!payload.bytecode?.startsWith("0x")) throw new Error("合约字节码无效");

      const hash = await wallet.walletClient.deployContract({
        abi: confidentialStrategyVaultAbi,
        bytecode: payload.bytecode,
        account: wallet.account,
        chain: sepolia,
      });
      setTransactionHash(hash);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (!receipt.contractAddress) throw new Error("交易已确认，但没有返回合约地址");
      setDeployedAddress(receipt.contractAddress);
      setMessage(`部署成功：${receipt.contractAddress}`);
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setPending(undefined);
    }
  }

  async function saveEncryptedStrategy() {
    if (!vaultAddress) return setMessage("合约尚未部署，当前不会触发任何钱包交易");
    const validationError = validateStrategy(form);
    if (validationError) return setMessage(validationError);

    setPending("save");
    setMessage(undefined);
    setRevealed(undefined);
    try {
      const wallet = await connectSepoliaWallet();
      setAccount(wallet.account);
      const handleClient = await createViemHandleClient(wallet.walletClient);
      const encrypted = await handleClient.encryptInput(
        packStrategy(form),
        "uint256",
        vaultAddress,
      );
      const hash = await wallet.walletClient.writeContract({
        address: vaultAddress,
        abi: confidentialStrategyVaultAbi,
        functionName: "setStrategy",
        args: [encrypted.handle, encrypted.handleProof],
        account: wallet.account,
        chain: sepolia,
      });
      setTransactionHash(hash);
      await publicClient.waitForTransactionReceipt({ hash });
      await readSavedStrategy(wallet.account);
      setMessage("加密策略已写入 Sepolia；公开页面只会显示句柄和时间");
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setPending(undefined);
    }
  }

  async function decryptStrategy() {
    if (!vaultAddress || !encryptedHandle) return;
    setPending("decrypt");
    setMessage(undefined);
    try {
      const wallet = await connectSepoliaWallet();
      if (account && wallet.account.toLowerCase() !== account.toLowerCase()) {
        throw new Error("请切回保存该策略的钱包账户");
      }
      const handleClient = await createViemHandleClient(wallet.walletClient);
      const decrypted = await handleClient.decrypt(encryptedHandle as Handle<"uint256">);
      setRevealed(unpackStrategy(decrypted.value));
      setMessage("解密仅在当前浏览器显示，不会把明文写回链上");
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setPending(undefined);
    }
  }

  function updateField(field: keyof StrategyValues, value: string) {
    setForm((current) => ({ ...current, [field]: Number(value) }));
  }

  return (
    <section className="strategy-vault" id="strategy-vault" aria-labelledby="vault-title">
      <div className="vault-intro">
        <div className="vault-icon"><LockKeyhole size={22} /></div>
        <div>
          <span className="eyebrow">WTF Hackathon / Nox Protocol</span>
          <h2 id="vault-title">隐私赏金策略金库</h2>
          <p>预算、投入时间和信心值先在浏览器打包加密，再把 Nox 句柄写入 Sepolia。</p>
        </div>
        <div className="vault-badges" aria-label="隐私能力">
          <span><ShieldCheck size={13} /> Owner-only decrypt</span>
          <span className={vaultAddress ? "is-live" : "is-pending"}>
            <i /> {vaultAddress ? "Sepolia ready" : "Deployment pending"}
          </span>
        </div>
      </div>

      <div className="vault-grid">
        <div className="vault-form" aria-label="加密策略输入">
          <label>
            <span>执行预算 <small>USD</small></span>
            <input
              aria-label="执行预算 USD"
              type="number"
              min="0"
              max="1000000000"
              step="1"
              value={form.budgetUsd}
              onChange={(event) => updateField("budgetUsd", event.target.value)}
            />
          </label>
          <label>
            <span>投入时间 <small>小时</small></span>
            <input
              aria-label="投入时间 小时"
              type="number"
              min="0"
              max="10000"
              step="1"
              value={form.effortHours}
              onChange={(event) => updateField("effortHours", event.target.value)}
            />
          </label>
          <label>
            <span>获奖信心 <small>0–100</small></span>
            <input
              aria-label="获奖信心 0 到 100"
              type="number"
              min="0"
              max="100"
              step="1"
              value={form.confidence}
              onChange={(event) => updateField("confidence", event.target.value)}
            />
          </label>
          <button
            type="button"
            className="vault-primary"
            onClick={() => void saveEncryptedStrategy()}
            disabled={!vaultAddress || Boolean(pending)}
          >
            {pending === "save" ? <LoaderCircle className="is-spinning" size={15} /> : <LockKeyhole size={15} />}
            {vaultAddress ? "加密并保存到 Sepolia" : "等待合约部署"}
          </button>
          {!vaultAddress ? (
            <button
              type="button"
              className="vault-deploy"
              onClick={() => void deployVault()}
              disabled={Boolean(pending)}
            >
              {pending === "deploy" ? <LoaderCircle className="is-spinning" size={14} /> : <ShieldCheck size={14} />}
              部署已审核合约（0 ETH）
            </button>
          ) : null}
        </div>

        <div className="vault-status" aria-live="polite">
          <div className="vault-status-heading">
            <div>
              <span className="eyebrow">Private record</span>
              <strong>{encryptedHandle ? "已发现加密策略" : "尚无链上策略"}</strong>
            </div>
            <button
              type="button"
              className="wallet-button"
              onClick={() => void connect()}
              disabled={Boolean(pending)}
            >
              {pending === "connect" ? <LoaderCircle className="is-spinning" size={14} /> : <Wallet size={14} />}
              {account ? shortenAddress(account) : "连接 MetaMask"}
            </button>
          </div>

          <dl className="vault-ledger">
            <div><dt>Network</dt><dd>Ethereum Sepolia</dd></div>
            <div><dt>Contract</dt><dd>{vaultAddress ? shortenAddress(vaultAddress) : "Not deployed"}</dd></div>
            <div><dt>Updated</dt><dd>{savedAt ? new Date(savedAt * 1000).toLocaleString("zh-CN") : "—"}</dd></div>
          </dl>

          {revealed ? (
            <div className="vault-revealed">
              <div><span>预算</span><strong>${revealed.budgetUsd.toLocaleString("zh-CN")}</strong></div>
              <div><span>时间</span><strong>{revealed.effortHours}h</strong></div>
              <div><span>信心</span><strong>{revealed.confidence}%</strong></div>
              <button type="button" onClick={() => setRevealed(undefined)}><EyeOff size={13} /> 隐藏明文</button>
            </div>
          ) : (
            <button
              type="button"
              className="vault-decrypt"
              onClick={() => void decryptStrategy()}
              disabled={!encryptedHandle || Boolean(pending)}
            >
              {pending === "decrypt" ? <LoaderCircle className="is-spinning" size={14} /> : <Eye size={14} />}
              钱包签名后本地解密
            </button>
          )}

          {message ? <p className="vault-message">{message}</p> : null}
          {transactionHash ? (
            <a
              className="vault-transaction"
              href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
              target="_blank"
              rel="noreferrer"
            >查看最近一笔 Sepolia 交易 ↗</a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
