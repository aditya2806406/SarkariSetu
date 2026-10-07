import { describe, it, expect } from "vitest";
import { cosineSimilarity } from "../services/vectorSearch.js";

describe("cosineSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    const v = [1, 2, 3];
    expect(cosineSimilarity(v, v)).toBeCloseTo(1, 10);
  });

  it("returns 1 for parallel vectors of different magnitude", () => {
    // [2,4,6] is just [1,2,3] scaled — cosine similarity ignores magnitude
    expect(cosineSimilarity([1, 2, 3], [2, 4, 6])).toBeCloseTo(1, 10);
  });

  it("returns 0 for orthogonal (perpendicular) vectors", () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0, 10);
  });

  it("returns -1 for exactly opposite vectors", () => {
    expect(cosineSimilarity([1, 2, 3], [-1, -2, -3])).toBeCloseTo(-1, 10);
  });

  it("returns 0 when either vector is all zeros, instead of dividing by zero", () => {
    expect(cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0);
    expect(cosineSimilarity([1, 2, 3], [0, 0, 0])).toBe(0);
  });

  it("ranks a closer real-world-shaped vector higher than a distant one", () => {
    // Simulates picking the better of two embedding matches for a query
    const query = [1, 1, 0, 0];
    const closeMatch = [0.9, 1, 0.1, 0];
    const farMatch = [0, 0, 1, 1];

    const closeScore = cosineSimilarity(query, closeMatch);
    const farScore = cosineSimilarity(query, farMatch);

    expect(closeScore).toBeGreaterThan(farScore);
  });

  it("handles high-dimensional vectors (e.g. real 1536-dim embedding shape)", () => {
    const dim = 1536;
    const a = new Array(dim).fill(0).map((_, i) => Math.sin(i));
    const b = [...a]; // identical vector at real embedding scale
    expect(cosineSimilarity(a, b)).toBeCloseTo(1, 8);
  });
});
