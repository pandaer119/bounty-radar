import type { Address, Hex } from "viem";

export const SEPOLIA_CHAIN_ID = 11_155_111;
export const ZERO_HANDLE = `0x${"0".repeat(64)}` as Hex;

const CONFIDENCE_BITS = 8n;
const HOURS_BITS = 24n;
const HOURS_SHIFT = CONFIDENCE_BITS;
const BUDGET_SHIFT = CONFIDENCE_BITS + HOURS_BITS;

export const STRATEGY_LIMITS = {
  budgetUsd: 1_000_000_000,
  effortHours: 10_000,
  confidence: 100,
} as const;

export type StrategyValues = {
  budgetUsd: number;
  effortHours: number;
  confidence: number;
};

export const confidentialStrategyVaultAbi = [
  {
    type: "function",
    name: "setStrategy",
    stateMutability: "nonpayable",
    inputs: [
      { name: "encryptedPlan", type: "bytes32" },
      { name: "handleProof", type: "bytes" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getStrategy",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [
      { name: "encryptedPlanHandle", type: "bytes32" },
      { name: "updatedAt", type: "uint64" },
    ],
  },
  {
    type: "event",
    name: "StrategyUpdated",
    anonymous: false,
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "updatedAt", type: "uint64", indexed: false },
    ],
  },
] as const;

export function getStrategyVaultAddress(): Address | undefined {
  const value = process.env.NEXT_PUBLIC_NOX_STRATEGY_VAULT_ADDRESS;
  return /^0x[0-9a-fA-F]{40}$/.test(value ?? "") ? (value as Address) : undefined;
}

export function validateStrategy(values: StrategyValues): string | undefined {
  const entries = [
    ["预算", values.budgetUsd, STRATEGY_LIMITS.budgetUsd],
    ["投入时间", values.effortHours, STRATEGY_LIMITS.effortHours],
    ["信心值", values.confidence, STRATEGY_LIMITS.confidence],
  ] as const;

  for (const [label, value, maximum] of entries) {
    if (!Number.isSafeInteger(value) || value < 0 || value > maximum) {
      return `${label}必须是 0–${maximum.toLocaleString("zh-CN")} 的整数`;
    }
  }
}

export function packStrategy(values: StrategyValues): bigint {
  const error = validateStrategy(values);
  if (error) throw new RangeError(error);

  return (
    (BigInt(values.budgetUsd) << BUDGET_SHIFT) |
    (BigInt(values.effortHours) << HOURS_SHIFT) |
    BigInt(values.confidence)
  );
}

export function unpackStrategy(packed: bigint): StrategyValues {
  const confidenceMask = (1n << CONFIDENCE_BITS) - 1n;
  const hoursMask = (1n << HOURS_BITS) - 1n;

  return {
    budgetUsd: Number(packed >> BUDGET_SHIFT),
    effortHours: Number((packed >> HOURS_SHIFT) & hoursMask),
    confidence: Number(packed & confidenceMask),
  };
}

export function shortenAddress(address: Address) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
