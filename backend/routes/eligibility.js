import { Router } from "express";
import Scheme from "../models/Scheme.js";
import { matchEligibleSchemes } from "../services/eligibilityMatcher.js";
import { analyzeEligibility } from "../services/gemini.js";
import { getTranslatedSchemes, isSupportedLanguage } from "../services/translator.js";

const router = Router();

/**
 * POST /api/eligibility/check
 * Body: { state, category, annualIncome, age, isStudent, isFarmer,
 *         isWoman, isSeniorCitizen, isDivyang, gender?, language? }
 *
 * Loads every active scheme, filters via the pure matcher in
 * services/eligibilityMatcher.js, then asks Claude for a short written
 * summary (services/gemini.js#analyzeEligibility) to sit above the
 * results grid. Matching itself never touches the network — only the
 * summary generation does.
 */
router.post("/check", async (req, res) => {
  try {
    const profile = req.body || {};
    const language = isSupportedLanguage(profile.language) ? profile.language : "en";

    const allSchemes = await Scheme.find({ isActive: true })
      .sort({ isFeatured: -1, name: 1 })
      .lean();

    const matched = matchEligibleSchemes(allSchemes, profile);

    let analysis = "";
    try {
      analysis = await analyzeEligibility({ profile, schemes: matched, language });
    } catch (apiErr) {
      console.warn("AI analysis failed, using fallback:", apiErr.message);
      analysis = "Here are the government schemes you may be eligible for based on your profile parameters.";
    }
    const localizedSchemes = await getTranslatedSchemes(matched, language);

    return res.json({
      success: true,
      data: { analysis, schemes: localizedSchemes },
    });
  } catch (err) {
    console.error("POST /api/eligibility/check error:", err);
    return res.status(500).json({
      success: false,
      message: "Couldn't check eligibility right now. Please try again.",
    });
  }
});

export default router;
