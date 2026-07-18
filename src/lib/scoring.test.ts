import { describe, expect, it } from "vitest";
import { opportunities } from "@/data/opportunities";
import { getDaysRemaining, rankOpportunities, rankOpportunity } from "./scoring";

const referenceNow = new Date("2026-07-18T12:00:00Z");

describe("opportunity scoring", () => {
  it("ranks KeeperHub first after official eligibility and prize verification", () => {
    const ranked = rankOpportunities(opportunities, referenceNow);
    expect(ranked[0].id).toBe("keeperhub-agents-onchain-2026");
    expect(ranked[0].priority).toBe("primary");
  });

  it("blocks the live-trading competition regardless of headline prize", () => {
    const trading = opportunities.find((item) => item.id === "weex-ai-wars-2-2026");
    expect(trading).toBeDefined();
    const ranked = rankOpportunity(trading!, referenceNow);
    expect(ranked.priority).toBe("avoid");
    expect(ranked.scoreBreakdown.riskPenalty).toBe(100);
  });

  it("calculates deadline runway in whole days", () => {
    expect(getDaysRemaining("2026-07-20T12:00:00Z", referenceNow)).toBe(2);
    expect(getDaysRemaining("2026-07-18T12:00:01Z", referenceNow)).toBe(1);
  });
});
