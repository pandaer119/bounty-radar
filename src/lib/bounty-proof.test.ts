import { describe, expect, it } from "vitest";
import { opportunities } from "@/data/opportunities";
import { rankOpportunity } from "./scoring";
import { createBountyProofPreview } from "./bounty-proof";

describe("BountyProof preview", () => {
  const keeperHub = opportunities.find((item) => item.id === "keeperhub-agents-onchain-2026")!;
  const ranked = rankOpportunity(keeperHub, new Date("2026-07-18T12:00:00Z"));

  it("creates deterministic bytes32 identifiers from official evidence", () => {
    const first = createBountyProofPreview(ranked, "2026-07-18T13:00:00Z");
    const second = createBountyProofPreview(ranked, "2026-07-18T14:00:00Z");

    expect(first.opportunityKey).toMatch(/^0x[0-9a-f]{64}$/);
    expect(first.sourceHash).toMatch(/^0x[0-9a-f]{64}$/);
    expect(first.opportunityKey).toBe(second.opportunityKey);
    expect(first.sourceHash).toBe(second.sourceHash);
  });

  it("keeps generation time outside the evidence hash", () => {
    const proof = createBountyProofPreview(ranked, "2026-07-18T13:00:00Z");
    expect(proof.generatedAt).toBe("2026-07-18T13:00:00Z");
    expect(proof.score).toBe(ranked.score);
  });
});
