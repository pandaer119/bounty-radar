import type {
  Opportunity,
  OpportunityStatus,
  Priority,
  RankedOpportunity,
  ScoreBreakdown,
} from "./types";

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

export function getDaysRemaining(deadlineAt: string, now = new Date()): number {
  const milliseconds = new Date(deadlineAt).getTime() - now.getTime();
  return Math.ceil(milliseconds / 86_400_000);
}

export function getEffectiveStatus(opportunity: Opportunity, now = new Date()): OpportunityStatus {
  if (opportunity.status === "excluded") return "excluded";
  if (now.getTime() > new Date(opportunity.deadlineAt).getTime()) return "closed";
  if (now.getTime() < new Date(opportunity.startAt).getTime()) return "upcoming";
  return opportunity.status === "monitor" ? "monitor" : "open";
}

function scoreRunway(daysRemaining: number): number {
  if (daysRemaining < 0) return 0;
  if (daysRemaining <= 3) return 20;
  if (daysRemaining <= 7) return 50;
  if (daysRemaining <= 14) return 75;
  if (daysRemaining <= 30) return 100;
  return 85;
}

function scoreWinSurface(prizeSlots: number | null): number {
  if (prizeSlots === null) return 45;
  if (prizeSlots >= 4) return 90;
  if (prizeSlots === 3) return 80;
  if (prizeSlots === 2) return 65;
  return 45;
}

function scoreRiskPenalty(opportunity: Opportunity): number {
  const financial = opportunity.financialRisk === "high" ? 100 : opportunity.financialRisk === "low" ? 30 : 0;
  const eligibilityUnknown = opportunity.soloEligibility === "unconfirmed" ? 10 : 0;
  const incompleteRules = opportunity.scoringInputs.rulesCompleteness < 55 ? 12 : 0;
  return clamp(financial + eligibilityUnknown + incompleteRules);
}

function getPriority(score: number, status: OpportunityStatus, risk: Opportunity["financialRisk"]): Priority {
  if (status === "excluded" || status === "closed" || risk === "high") return "avoid";
  if (score >= 78) return "primary";
  if (score >= 64) return "shortlist";
  return "monitor";
}

export function rankOpportunity(opportunity: Opportunity, now = new Date()): RankedOpportunity {
  const daysRemaining = getDaysRemaining(opportunity.deadlineAt, now);
  const effectiveStatus = getEffectiveStatus(opportunity, now);
  const scoreBreakdown: ScoreBreakdown = {
    thematicFit: opportunity.scoringInputs.thematicFit,
    payoutCertainty: opportunity.scoringInputs.payoutCertainty,
    runway: scoreRunway(daysRemaining),
    winSurface: scoreWinSurface(opportunity.prizeSlots),
    executionReadiness: opportunity.scoringInputs.executionReadiness,
    rulesCompleteness: opportunity.scoringInputs.rulesCompleteness,
    riskPenalty: scoreRiskPenalty(opportunity),
  };

  const weighted =
    scoreBreakdown.thematicFit * 0.24 +
    scoreBreakdown.payoutCertainty * 0.18 +
    scoreBreakdown.runway * 0.18 +
    scoreBreakdown.winSurface * 0.14 +
    scoreBreakdown.executionReadiness * 0.16 +
    scoreBreakdown.rulesCompleteness * 0.1 -
    scoreBreakdown.riskPenalty * 0.35;

  const score = effectiveStatus === "closed" ? 0 : Math.round(clamp(weighted));

  return {
    ...opportunity,
    score,
    priority: getPriority(score, effectiveStatus, opportunity.financialRisk),
    scoreBreakdown,
    daysRemaining,
    effectiveStatus,
  };
}

export function rankOpportunities(opportunities: Opportunity[], now = new Date()): RankedOpportunity[] {
  return opportunities.map((opportunity) => rankOpportunity(opportunity, now)).sort((a, b) => b.score - a.score);
}
