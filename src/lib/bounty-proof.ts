import { createHash } from "node:crypto";
import type { RankedOpportunity } from "./types";
import type { BountyProofPreview } from "./proof-types";

function sha256(value: string): `0x${string}` {
  return `0x${createHash("sha256").update(value, "utf8").digest("hex")}`;
}

export function createBountyProofPreview(
  opportunity: RankedOpportunity,
  generatedAt = new Date().toISOString(),
): BountyProofPreview {
  const officialEvidence = opportunity.evidence[0];
  const canonicalEvidence = JSON.stringify({
    modelVersion: "bounty-radar-v1",
    opportunityId: opportunity.id,
    officialUrl: officialEvidence.url,
    verifiedAt: officialEvidence.verifiedAt,
    score: opportunity.score,
    scoreBreakdown: opportunity.scoreBreakdown,
  });

  return {
    opportunityId: opportunity.id,
    opportunityKey: sha256(`bounty-radar:${opportunity.id}`),
    sourceHash: sha256(canonicalEvidence),
    score: opportunity.score,
    modelVersion: "bounty-radar-v1",
    generatedAt,
  };
}
