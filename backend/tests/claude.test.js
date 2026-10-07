import { describe, it, expect } from "vitest";
import { buildContext, analyzeEligibility } from "../services/claude.js";

describe("buildContext", () => {
  const sampleScheme = {
    name: "PM-KISAN Samman Nidhi",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    description: "Income support for farmer families.",
    benefits: ["₹6,000 per year", "Direct bank transfer"],
    eligibility: {
      minAge: 18,
      maxAge: null,
      maxAnnualIncome: null,
      categories: [],
      states: [],
    },
    documentsRequired: ["Aadhaar card", "Land records"],
    officialWebsite: "https://pmkisan.gov.in",
  };

  it("includes the scheme name and ministry in the formatted output", () => {
    const context = buildContext([sampleScheme]);
    expect(context).toContain("PM-KISAN Samman Nidhi");
    expect(context).toContain("Ministry of Agriculture & Farmers Welfare");
  });

  it("joins benefits and documents into readable lists", () => {
    const context = buildContext([sampleScheme]);
    expect(context).toContain("₹6,000 per year; Direct bank transfer");
  });

  it("renders unset eligibility bounds as 'none' rather than 'null' or 'undefined'", () => {
    const context = buildContext([sampleScheme]);
    expect(context).toContain("maxAge=none");
    expect(context).toContain("maxAnnualIncome=none");
    expect(context).not.toContain("undefined");
    expect(context).not.toContain("null");
  });

  it("renders an empty states array as 'all-India' rather than an empty string", () => {
    const context = buildContext([sampleScheme]);
    expect(context).toContain("states=all-India");
  });

  it("numbers multiple schemes in order", () => {
    const second = { ...sampleScheme, name: "Ayushman Bharat PM-JAY" };
    const context = buildContext([sampleScheme, second]);
    expect(context).toContain("[Scheme 1: PM-KISAN Samman Nidhi]");
    expect(context).toContain("[Scheme 2: Ayushman Bharat PM-JAY]");
  });

  it("returns an empty string for an empty scheme list, never throws", () => {
    expect(() => buildContext([])).not.toThrow();
    expect(buildContext([])).toBe("");
  });
});

describe("analyzeEligibility — no-match fallback (skips the Claude API call)", () => {
  it("returns a canned English message when no schemes matched, without calling the API", async () => {
    const result = await analyzeEligibility({
      profile: { state: "Kerala" },
      schemes: [],
      language: "en",
    });

    expect(result).toContain("couldn't find an exact match");
  });

  // Only "en" has a canned fallback string in the current implementation;
  // this test documents that behavior so a future language addition to
  // the fallback map doesn't regress silently.
  it("falls back to a generic message for a language without a canned string", async () => {
    const result = await analyzeEligibility({
      profile: { state: "Kerala" },
      schemes: [],
      language: "mai",
    });

    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});
