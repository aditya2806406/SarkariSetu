import { describe, it, expect } from "vitest";
import { SUPPORTED_LANGUAGES, isSupportedLanguage, languageName } from "../services/translator.js";

describe("SUPPORTED_LANGUAGES", () => {
  it("has exactly 14 languages (English + the 13 widest-reach Indian languages)", () => {
    expect(SUPPORTED_LANGUAGES).toHaveLength(14);
  });

  it("includes English as one of the languages", () => {
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(codes).toContain("en");
  });

  it("has a unique code for every language — no accidental duplicates", () => {
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("gives every language both a name and a native-script label", () => {
    SUPPORTED_LANGUAGES.forEach((lang) => {
      expect(lang.name).toBeTruthy();
      expect(lang.native).toBeTruthy();
    });
  });
});

describe("isSupportedLanguage", () => {
  it("accepts every code in the supported list", () => {
    SUPPORTED_LANGUAGES.forEach((lang) => {
      expect(isSupportedLanguage(lang.code)).toBe(true);
    });
  });

  it("rejects a code not in the supported list", () => {
    expect(isSupportedLanguage("fr")).toBe(false);
    expect(isSupportedLanguage("xx")).toBe(false);
  });

  it("rejects undefined/empty input rather than throwing", () => {
    expect(isSupportedLanguage(undefined)).toBe(false);
    expect(isSupportedLanguage("")).toBe(false);
  });
});

describe("languageName", () => {
  it("returns the correct English name for a known code", () => {
    expect(languageName("hi")).toBe("Hindi");
    expect(languageName("ta")).toBe("Tamil");
    expect(languageName("mai")).toBe("Maithili");
  });

  it("falls back to English for an unknown code rather than returning undefined", () => {
    expect(languageName("xx")).toBe("English");
  });
});
