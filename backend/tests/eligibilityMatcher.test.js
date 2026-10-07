import { describe, it, expect } from "vitest";
import { schemeMatchesProfile, matchEligibleSchemes } from "../services/eligibilityMatcher.js";

/**
 * Minimal scheme fixture builder — only sets the eligibility fields a
 * given test cares about, everything else defaults to "no restriction"
 * so tests stay focused on the one rule being exercised.
 */
function scheme(eligibilityOverrides = {}, extra = {}) {
  return {
    schemeId: "test-scheme",
    name: "Test Scheme",
    eligibility: {
      minAge: null,
      maxAge: null,
      gender: "any",
      categories: [],
      maxAnnualIncome: null,
      states: [],
      flags: {},
      ...eligibilityOverrides,
    },
    ...extra,
  };
}

describe("schemeMatchesProfile — age rules", () => {
  it("matches when profile has no age and scheme has an age range", () => {
    const s = scheme({ minAge: 18, maxAge: 60 });
    expect(schemeMatchesProfile(s, {})).toBe(true);
  });

  it("rejects a profile younger than minAge", () => {
    const s = scheme({ minAge: 18 });
    expect(schemeMatchesProfile(s, { age: 16 })).toBe(false);
  });

  it("accepts a profile exactly at minAge (inclusive boundary)", () => {
    const s = scheme({ minAge: 18 });
    expect(schemeMatchesProfile(s, { age: 18 })).toBe(true);
  });

  it("rejects a profile older than maxAge", () => {
    const s = scheme({ maxAge: 40 });
    expect(schemeMatchesProfile(s, { age: 41 })).toBe(false);
  });

  it("accepts a profile exactly at maxAge (inclusive boundary)", () => {
    const s = scheme({ maxAge: 40 });
    expect(schemeMatchesProfile(s, { age: 40 })).toBe(true);
  });

  it("treats an unparseable age as non-restrictive rather than crashing", () => {
    const s = scheme({ minAge: 18 });
    expect(schemeMatchesProfile(s, { age: "not-a-number" })).toBe(true);
  });
});

describe("schemeMatchesProfile — income rules", () => {
  it("matches any income when the scheme has no income cap", () => {
    const s = scheme({ maxAnnualIncome: null });
    expect(schemeMatchesProfile(s, { annualIncome: 5000000 })).toBe(true);
  });

  it("rejects income above the cap", () => {
    const s = scheme({ maxAnnualIncome: 250000 });
    expect(schemeMatchesProfile(s, { annualIncome: 300000 })).toBe(false);
  });

  it("accepts income exactly at the cap (inclusive boundary)", () => {
    const s = scheme({ maxAnnualIncome: 250000 });
    expect(schemeMatchesProfile(s, { annualIncome: 250000 })).toBe(true);
  });

  it("does not exclude a profile that omitted income", () => {
    const s = scheme({ maxAnnualIncome: 250000 });
    expect(schemeMatchesProfile(s, {})).toBe(true);
  });
});

describe("schemeMatchesProfile — category rules", () => {
  it("matches any category when the scheme has no category restriction", () => {
    const s = scheme({ categories: [] });
    expect(schemeMatchesProfile(s, { category: "general" })).toBe(true);
  });

  it("rejects a category not in the scheme's allowed list", () => {
    const s = scheme({ categories: ["sc", "st"] });
    expect(schemeMatchesProfile(s, { category: "general" })).toBe(false);
  });

  it("accepts a category that is in the scheme's allowed list", () => {
    const s = scheme({ categories: ["sc", "st"] });
    expect(schemeMatchesProfile(s, { category: "sc" })).toBe(true);
  });
});

describe("schemeMatchesProfile — state rules", () => {
  it("treats an empty states array as all-India (matches any state)", () => {
    const s = scheme({ states: [] });
    expect(schemeMatchesProfile(s, { state: "Kerala" })).toBe(true);
  });

  it("rejects a state not in the scheme's list", () => {
    const s = scheme({ states: ["Punjab", "Haryana"] });
    expect(schemeMatchesProfile(s, { state: "Kerala" })).toBe(false);
  });

  it("accepts a state that is in the scheme's list", () => {
    const s = scheme({ states: ["Punjab", "Haryana"] });
    expect(schemeMatchesProfile(s, { state: "Punjab" })).toBe(true);
  });
});

describe("schemeMatchesProfile — flag rules (requiresFarmer, requiresWoman, etc.)", () => {
  it("does not require any flag when the scheme sets none", () => {
    const s = scheme({ flags: {} });
    expect(schemeMatchesProfile(s, {})).toBe(true);
  });

  it("rejects a non-farmer for a farmer-only scheme", () => {
    const s = scheme({ flags: { requiresFarmer: true } });
    expect(schemeMatchesProfile(s, { isFarmer: false })).toBe(false);
  });

  it("accepts a farmer for a farmer-only scheme", () => {
    const s = scheme({ flags: { requiresFarmer: true } });
    expect(schemeMatchesProfile(s, { isFarmer: true })).toBe(true);
  });

  it("requires ALL set flags to be true — passing one but not another fails", () => {
    const s = scheme({ flags: { requiresWoman: true, requiresSeniorCitizen: true } });
    expect(schemeMatchesProfile(s, { isWoman: true, isSeniorCitizen: false })).toBe(false);
  });

  it("passes when every required flag is true", () => {
    const s = scheme({ flags: { requiresWoman: true, requiresSeniorCitizen: true } });
    expect(schemeMatchesProfile(s, { isWoman: true, isSeniorCitizen: true })).toBe(true);
  });

  it("ignores unrelated profile flags that the scheme doesn't require", () => {
    const s = scheme({ flags: { requiresFarmer: true } });
    // isDivyang: false is irrelevant since the scheme never asked about it
    expect(schemeMatchesProfile(s, { isFarmer: true, isDivyang: false })).toBe(true);
  });
});

describe("schemeMatchesProfile — combined real-world scenarios", () => {
  it("matches a scheme resembling PM-KISAN for an eligible farmer", () => {
    const pmKisan = scheme({ minAge: 18, flags: { requiresFarmer: true } });
    expect(schemeMatchesProfile(pmKisan, { age: 35, isFarmer: true })).toBe(true);
  });

  it("rejects a scheme resembling PM-KISAN for a non-farmer", () => {
    const pmKisan = scheme({ minAge: 18, flags: { requiresFarmer: true } });
    expect(schemeMatchesProfile(pmKisan, { age: 35, isFarmer: false })).toBe(false);
  });

  it("rejects an income-capped scholarship for a high-income applicant even if all other fields match", () => {
    const scholarship = scheme({
      categories: ["sc", "st"],
      maxAnnualIncome: 250000,
      flags: { requiresStudent: true },
    });
    const profile = { category: "sc", annualIncome: 900000, isStudent: true };
    expect(schemeMatchesProfile(scholarship, profile)).toBe(false);
  });
});

describe("matchEligibleSchemes — batch filtering", () => {
  it("returns only the schemes that match, preserving relative order", () => {
    const schemes = [
      scheme({ flags: { requiresFarmer: true } }, { schemeId: "farmer-scheme" }),
      scheme({ flags: { requiresWoman: true } }, { schemeId: "women-scheme" }),
      scheme({}, { schemeId: "open-scheme" }),
    ];
    const profile = { isFarmer: true, isWoman: false };

    const result = matchEligibleSchemes(schemes, profile);
    const ids = result.map((s) => s.schemeId);

    expect(ids).toEqual(["farmer-scheme", "open-scheme"]);
  });

  it("returns an empty array when nothing matches, rather than throwing", () => {
    const schemes = [scheme({ flags: { requiresFarmer: true } })];
    const result = matchEligibleSchemes(schemes, { isFarmer: false });
    expect(result).toEqual([]);
  });

  it("returns every scheme when the profile is empty and schemes have no restrictions", () => {
    const schemes = [scheme({}, { schemeId: "a" }), scheme({}, { schemeId: "b" })];
    const result = matchEligibleSchemes(schemes, {});
    expect(result).toHaveLength(2);
  });
});
