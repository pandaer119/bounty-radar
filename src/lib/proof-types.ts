export type BountyProofPreview = {
  opportunityId: string;
  opportunityKey: `0x${string}`;
  sourceHash: `0x${string}`;
  score: number;
  modelVersion: "bounty-radar-v1";
  generatedAt: string;
};

export type KeeperHubDraft = {
  mode: "dry-run";
  status: "needs_contract_deployment" | "ready_for_human_approval";
  network: "sepolia";
  chainId: 11155111;
  contractAddress: `0x${string}` | null;
  functionName: "record";
  calldata: `0x${string}` | null;
  humanApprovalRequired: true;
  configurationIssue?: string;
};

export type ProofPreviewResponse = {
  proof: BountyProofPreview;
  keeperHubDraft: KeeperHubDraft;
};

export type KeeperHubReadinessResponse = {
  status: "configuration_required" | "human_approval_required" | "ready_for_simulation";
  configured: boolean;
  apiKeyConfigured: boolean;
  registryConfigured: boolean;
  simulationEnabled: boolean;
  simulationOnly: true;
  broadcastEnabled: false;
};

export type KeeperHubSimulationResponse = ProofPreviewResponse & {
  simulation: {
    provider: "keeperhub";
    mode: "simulate";
    broadcast: false;
    chainId: 11155111;
    requestId?: string;
    data: unknown;
  };
  humanApprovalRequired: true;
};
