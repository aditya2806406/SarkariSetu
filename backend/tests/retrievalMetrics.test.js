import { describe, it, expect } from "vitest";
import {
  hitAtK,
  precisionAtK,
  recallAtK,
  reciprocalRank,
  evaluateRetrieval,
} from "../services/retrievalMetrics.js";

describe("hitAtK", () => {
  it("is true when a relevant scheme is anywhere in the top K", () => {
    expect(hitAtK(["a", "b", "c"], ["c"], 5)).toBe(true);
  });

  it("is false when no relevant scheme appears in the top K", () => {
    expect(hitAtK(["a", "b", "c"], ["z"], 5)).toBe(false);
  });

  it("respects the K cutoff — a relevant result beyond K doesn't count", () => {
    expect(hitAtK(["a", "b", "c", "d", "e"], ["e"], 2)).toBe(false);
  });

  it("is true with multiple relevant IDs if at least one appears", () => {
    expect(hitAtK(["a", "b"], ["z", "b"], 5)).toBe(true);
  });
});

describe("precisionAtK", () => {
  it("is 1.0 when every top-K result is relevant", () => {
    expect(precisionAtK(["a", "b"], ["a", "b"], 2)).toBe(1);
  });

  it("is 0 when none of the top-K results are relevant", () => {
    expect(precisionAtK(["a", "b"], ["z"], 2)).toBe(0);
  });

  it("is 0.5 when exactly half the top-K results are relevant", () => {
    expect(precisionAtK(["a", "b"], ["a"], 2)).toBe(0.5);
  });

  it("returns 0 for an empty retrieved list instead of dividing by zero", () => {
    expect(precisionAtK([], ["a"], 5)).toBe(0);
  });
});

describe("recallAtK", () => {
  it("is 1.0 when every relevant scheme was found", () => {
    expect(recallAtK(["a", "b", "c"], ["a", "b"], 5)).toBe(1);
  });

  it("is 0.5 when only half the relevant schemes were found", () => {
    expect(recallAtK(["a"], ["a", "b"], 5)).toBe(0.5);
  });

  it("is 1.0 when there was nothing relevant to find — nothing was missed", () => {
    expect(recallAtK(["a", "b"], [], 5)).toBe(1);
  });

  it("respects the K cutoff when counting what was found", () => {
    expect(recallAtK(["a", "b", "c"], ["c"], 2)).toBe(0);
  });
});

describe("reciprocalRank", () => {
  it("is 1 when the first relevant result is ranked first", () => {
    expect(reciprocalRank(["a", "b", "c"], ["a"])).toBe(1);
  });

  it("is 0.5 when the first relevant result is ranked second", () => {
    expect(reciprocalRank(["a", "b", "c"], ["b"])).toBe(0.5);
  });

  it("is 0 when no relevant result appears at all", () => {
    expect(reciprocalRank(["a", "b", "c"], ["z"])).toBe(0);
  });

  it("scores based on the earliest relevant match when multiple are relevant", () => {
    expect(reciprocalRank(["a", "b", "c"], ["c", "b"])).toBe(0.5); // b is earliest at index 1
  });
});

describe("evaluateRetrieval — aggregation across a full evaluation set", () => {
  it("returns zeroed-out metrics for an empty result set rather than NaN", () => {
    const report = evaluateRetrieval([]);
    expect(report.totalQueries).toBe(0);
    expect(report.hitRateAtK).toBe(0);
    expect(report.meanPrecisionAtK).toBe(0);
    expect(Number.isNaN(report.meanReciprocalRank)).toBe(false);
  });

  it("computes a perfect 1.0 across all metrics when every query hits first place", () => {
    const results = [
      { query: "q1", retrievedIds: ["a", "x", "y"], relevantIds: ["a"] },
      { query: "q2", retrievedIds: ["b", "x", "y"], relevantIds: ["b"] },
    ];
    const report = evaluateRetrieval(results, 5);

    expect(report.hitRateAtK).toBe(1);
    expect(report.meanReciprocalRank).toBe(1);
  });

  it("computes a realistic mixed scenario correctly", () => {
    const results = [
      // Perfect hit, ranked first
      { query: "q1", retrievedIds: ["a", "x"], relevantIds: ["a"] },
      // Hit, but ranked second
      { query: "q2", retrievedIds: ["x", "b"], relevantIds: ["b"] },
      // Complete miss
      { query: "q3", retrievedIds: ["x", "y"], relevantIds: ["z"] },
    ];
    const report = evaluateRetrieval(results, 5);

    expect(report.totalQueries).toBe(3);
    expect(report.hitRateAtK).toBeCloseTo(2 / 3, 5);
    // reciprocal ranks: 1, 0.5, 0 → mean = 0.5
    expect(report.meanReciprocalRank).toBeCloseTo(0.5, 5);
  });

  it("includes per-query breakdowns so the worst-performing questions can be identified", () => {
    const results = [
      { query: "good question", retrievedIds: ["a"], relevantIds: ["a"] },
      { query: "bad question", retrievedIds: ["x"], relevantIds: ["a"] },
    ];
    const report = evaluateRetrieval(results, 5);

    expect(report.perQuery).toHaveLength(2);
    const bad = report.perQuery.find((r) => r.query === "bad question");
    expect(bad.hit).toBe(false);
    expect(bad.reciprocalRank).toBe(0);
  });
});
