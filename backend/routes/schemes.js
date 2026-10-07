import { Router } from "express";
import Scheme from "../models/Scheme.js";
import { getTranslatedScheme, getTranslatedSchemes, isSupportedLanguage } from "../services/translator.js";

const router = Router();

function resolveLanguage(query) {
  const lang = (query.language || "en").toLowerCase();
  return isSupportedLanguage(lang) ? lang : "en";
}

/**
 * GET /api/schemes?category=&state=&search=&language=
 * Powers SchemesPage's filter sidebar. Category and state are exact
 * matches; search hits the text index on name/tagline/tags. `language`
 * triggers on-demand translation (cached after first request) via
 * services/translator.js — pass "en" or omit it to skip translation
 * entirely and avoid the extra lookup.
 */
router.get("/", async (req, res) => {
  try {
    const { category, state, search } = req.query;
    const language = resolveLanguage(req.query);

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (state) {
      // Empty eligibility.states array means "all-India" — always match.
      filter.$or = [{ "eligibility.states": state }, { "eligibility.states": { $size: 0 } }];
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const schemes = await Scheme.find(filter).sort({ isFeatured: -1, name: 1 }).lean();
    const localized = await getTranslatedSchemes(schemes, language);

    return res.json({ success: true, data: localized });
  } catch (err) {
    console.error("GET /api/schemes error:", err);
    return res.status(500).json({
      success: false,
      message: "Couldn't load schemes right now.",
    });
  }
});

/**
 * GET /api/schemes/:schemeId?language=
 * Powers SchemeDetail. schemeId is the human-readable slug (e.g.
 * "pm-kisan-samman-nidhi"), not the Mongo _id.
 */
router.get("/:schemeId", async (req, res) => {
  try {
    const language = resolveLanguage(req.query);
    const scheme = await Scheme.findOne({
      schemeId: req.params.schemeId.toLowerCase(),
      isActive: true,
    }).lean();

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: "That scheme couldn't be found.",
      });
    }

    const localized = await getTranslatedScheme(scheme, language);
    return res.json({ success: true, data: localized });
  } catch (err) {
    console.error("GET /api/schemes/:schemeId error:", err);
    return res.status(500).json({
      success: false,
      message: "Couldn't load this scheme right now.",
    });
  }
});

export default router;
