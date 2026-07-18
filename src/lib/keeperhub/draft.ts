import "server-only";

import { encodeFunctionData, isAddress } from "viem";
import type { BountyProofPreview, KeeperHubDraft } from "../proof-types";

const opportunityRegistryAbi = [
  {
    type: "function",
    name: "record",
    stateMutability: "nonpayable",
    inputs: [
      { name: "opportunityKey", type: "bytes32" },
      { name: "sourceHash", type: "bytes32" },
      { name: "score", type: "uint8" },
    ],
    outputs: [{ name: "proofId", type: "bytes32" }],
  },
] as const;

export function createKeeperHubDraft(proof: BountyProofPreview): KeeperHubDraft {
  const configuredAddress = process.env.OPPORTUNITY_REGISTRY_ADDRESS;
  const contractAddress = configuredAddress && isAddress(configuredAddress) ? configuredAddress : null;
  const calldata = contractAddress
    ? encodeFunctionData({
        abi: opportunityRegistryAbi,
        functionName: "record",
        args: [proof.opportunityKey, proof.sourceHash, proof.score],
      })
    : null;

  return {
    mode: "dry-run",
    status: contractAddress ? "ready_for_human_approval" : "needs_contract_deployment",
    network: "sepolia",
    chainId: 11155111,
    contractAddress,
    functionName: "record",
    calldata,
    humanApprovalRequired: true,
    ...(!contractAddress
      ? { configurationIssue: "先在 Sepolia 部署 OpportunityRegistry，再由人工配置合约地址。" }
      : {}),
  };
}
