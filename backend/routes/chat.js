import { Router } from "express";
import { optionalAuth } from "../middleware/auth.js";
import { vectorSearch } from "../services/vectorSearch.js";
import { generateAnswer } from "../services/gemini.js";
import { detectLanguage, translateToEnglish } from "../services/translator.js";

const router = Router();

/**
 * POST /api/chat
 * Full RAG pipeline (doc section 6.1): detect language → translate to
 * English for retrieval → vector search top 5 → generate answer in the
 * user's original language → return with citations.
 *
 * Body: { question, language?, conversationHistory? }
 * If `language` isn't provided, it's detected from the question itself.
 */
router.post("/", optionalAuth, async (req, res) => {
  try {
    const { question, language, conversationHistory = [] } = req.body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "A question is required.",
      });
    }

    const detectedLanguage = language || (await detectLanguage(question));
    const englishQuery = await translateToEnglish(question, detectedLanguage);

    const schemes = await vectorSearch(englishQuery, 5);

    const { answer, sources } = await generateAnswer({
      question,
      schemes,
      language: detectedLanguage,
      conversationHistory,
    });

    return res.json({
      success: true,
      data: { answer, sources, language: detectedLanguage },
    });
  } catch (err) {
    console.error("POST /api/chat error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong answering that. Please try again.",
    });
  }
});

/**
 * POST /api/chat/search
 * Semantic search only — no AI-generated answer. Used for the "did you
 * mean" style scheme lookup without paying for a Claude completion.
 *
 * Body: { query }
 */
router.post("/search", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: "A search query is required.",
      });
    }

    const schemes = await vectorSearch(query, 8);

    return res.json({ success: true, data: schemes });
  } catch (err) {
    console.error("POST /api/chat/search error:", err);
    return res.status(500).json({
      success: false,
      message: "Search failed. Please try again.",
    });
  }
});

export default router;
