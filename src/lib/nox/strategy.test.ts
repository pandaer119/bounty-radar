import { describe, expect, it } from "vitest";
import {
  packStrategy,
  unpackStrategy,
  validateStrategy,
  type StrategyValues,
} from "./strategy";

describe("confidential strategy packing", () => {
  it("round-trips a strategy without exposing individual values", () => {
    const strategy: StrategyValues = {
      budgetUsd: 8_500,
      effortHours: 72,
      confidence: 84,
    };

    expect(unpackStrategy(packStrategy(strategy))).toEqual(strategy);
  });

  it("keeps the maximum accepted values distinct", () => {
    const strategy: StrategyValues = {
      budgetUsd: 1_000_000_000,
      effortHours: 10_000,
      confidence: 100,
    };

    expect(unpackStrategy(packStrategy(strategy))).toEqual(strategy);
  });

  it("rejects unsafe or out-of-range values", () => {
    expect(validateStrategy({ budgetUsd: -1, effortHours: 10, confidence: 50 })).toContain("预算");
    expect(validateStrategy({ budgetUsd: 10, effortHours: 10.5, confidence: 50 })).toContain("投入时间");
    expect(validateStrategy({ budgetUsd: 10, effortHours: 10, confidence: 101 })).toContain("信心值");
  });
});
