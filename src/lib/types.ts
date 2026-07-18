export type OpportunityStatus = "open" | "upcoming" | "monitor" | "excluded" | "closed";
export type RiskLevel = "low" | "medium" | "high";
export type SoloEligibility = "confirmed" | "likely" | "unconfirmed" | "not-applicable";
export type RewardKind = "cash" | "stablecoin" | "mixed" | "variable";
export type Priority = "primary" | "shortlist" | "monitor" | "avoid";

export type SourceEvidence = {
  label: string;
  url: string;
  verifiedAt: string;
  note: string;
};

export type Opportunity = {
  id: string;
  title: string;
  organizer: string;
  platform: string;
  summary: string;
  startAt: string;
  deadlineAt: string;
  status: OpportunityStatus;
  prizePoolUsd: number;
  prizeSlots: number | null;
  rewardKind: RewardKind;
  online: boolean;
  soloEligibility: SoloEligibility;
  existingProjectsAllowed: boolean | null;
  riskLevel: RiskLevel;
  financialRisk: "none" | "low" | "high";
  tags: string[];
  requirements: string[];
  humanGates: string[];
  nextActions: string[];
  evidence: SourceEvidence[];
  scoringInputs: {
    thematicFit: number;
    payoutCertainty: number;
    executionReadiness: number;
    rulesCompleteness: number;
  };
};

export type ScoreBreakdown = {
  thematicFit: number;
  payoutCertainty: number;
  runway: number;
  winSurface: number;
  executionReadiness: number;
  rulesCompleteness: number;
  riskPenalty: number;
};

export type RankedOpportunity = Opportunity & {
  score: number;
  priority: Priority;
  scoreBreakdown: ScoreBreakdown;
  daysRemaining: number;
  effectiveStatus: OpportunityStatus;
};

export type OpportunitiesResponse = {
  data: RankedOpportunity[];
  meta: {
    generatedAt: string;
    verifiedAt: string;
    count: number;
    sourceMode: "official-verified-seed";
    stale: boolean;
  };
};

export type AppError = {
  code: string;
  message: string;
  status?: number;
  retryable: boolean;
  requestId?: string;
  details?: unknown;
};
