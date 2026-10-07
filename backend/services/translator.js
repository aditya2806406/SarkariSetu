import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import TranslationCache from "../models/TranslationCache.js";

let client = null;
function getClient() {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

// Two model tiers, chosen deliberately by stakes and repetition, not by
// default: detectLanguage and translateToEnglish run on every single
// chat message and are never cached, so they use Google's lightest,
// cheapest tier — neither task needs strong reasoning (one is a
// language classification, the other feeds an embedding, not a
// citizen's screen). Scheme translation, by contrast, is cached after
// the first request and is what a citizen actually reads, so it keeps
// the stronger model.
//
// NOTE on model naming: Google's flash-tier model names change more
// often than Anthropic's. As of this writing, gemini-2.5-flash is GA
// but scheduled for shutdown on 16 October 2026; gemini-3.1-flash-lite
// is the current stable, no-shutdown-date option. If either model
// 404s, check https://ai.google.dev/gemini-api/docs/models — Google's
// own migration notes say it's almost always a one-line string swap.
const MODEL_FAST = "gemini-3.1-flash-lite";
const MODEL_QUALITY = "gemini-3.1-flash-lite";

/**
 * The 14 languages supported across SarkariSetu: English plus the 13
 * Indian languages with the largest number of speakers (2011 census,
 * 10M+ speakers each). This is deliberately wider than "official
 * language of a state" — the goal is speaker reach, not administrative
 * boundaries.
 */
export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
  { code: "ur", name: "Urdu", native: "اردو" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "or", name: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "as", name: "Assamese", native: "অসমীয়া" },
  { code: "mai", name: "Maithili", native: "मैथिली" },
];

const LANGUAGE_CODES = SUPPORTED_LANGUAGES.map((l) => l.code);
const LANGUAGE_NAME_BY_CODE = Object.fromEntries(
  SUPPORTED_LANGUAGES.map((l) => [l.code, l.name])
);

export function isSupportedLanguage(code) {
  return LANGUAGE_CODES.includes(code);
}

export function languageName(code) {
  return LANGUAGE_NAME_BY_CODE[code] || "English";
}

/**
 * detectLanguage — RAG pipeline step 2. Asks the model to classify the
 * question into one of the supported language codes. Falls back to
 * "en" on any parsing failure so the pipeline never breaks on this step.
 */
export async function detectLanguage(text) {
  const response = await getClient().models.generateContent({
    model: MODEL_FAST,
    contents: `Identify the language of this text. Reply with ONLY the language code, nothing else. Valid codes: ${LANGUAGE_CODES.join(", ")}.\n\nText: "${text}"`,
    config: { maxOutputTokens: 10 },
  });

  const code = response.text?.trim().toLowerCase();
  return isSupportedLanguage(code) ? code : "en";
}

/**
 * translateToEnglish — RAG pipeline step 3. Only called when the
 * detected language isn't English; the translation exists purely to
 * produce a clean embedding input, not to show the user anything.
 */
export async function translateToEnglish(text, sourceLanguage) {
  if (sourceLanguage === "en") return text;

  const response = await getClient().models.generateContent({
    model: MODEL_FAST,
    contents: `Translate the following text to English. Reply with ONLY the translation, no explanation.\n\nText: "${text}"`,
    config: { maxOutputTokens: 500 },
  });

  return response.text?.trim() || text;
}

function hashSourceFields(scheme) {
  const raw = JSON.stringify({
    name: scheme.name,
    tagline: scheme.tagline,
    description: scheme.description,
    benefits: scheme.benefits,
    documentsRequired: scheme.documentsRequired,
    howToApply: scheme.howToApply,
  });
  return crypto.createHash("md5").update(raw).digest("hex");
}

/**
 * translateSchemeFields — the one model call that actually translates a
 * scheme's display content. Sends the fields as JSON and asks for JSON
 * back, so the response maps 1:1 onto the TranslationCache.translated
 * shape with no fragile string-splitting.
 */
async function translateSchemeFields(scheme, targetLanguage) {
  const name = languageName(targetLanguage);

  const sourcePayload = {
    name: scheme.name,
    tagline: scheme.tagline,
    description: scheme.description,
    benefits: scheme.benefits || [],
    documentsRequired: scheme.documentsRequired || [],
    howToApply: scheme.howToApply || [],
  };

  const response = await getClient().models.generateContent({
    model: MODEL_QUALITY,
    contents: JSON.stringify(sourcePayload),
    config: {
      systemInstruction: `You translate Indian government scheme information into ${name} for citizens who may not read English well. Keep proper nouns (scheme names, ministry names, portal names) recognizable — you may transliterate rather than translate them if that's what's actually used in ${name}. Keep the tone plain and warm, not bureaucratic. Reply with ONLY a JSON object matching the exact shape you were given — same keys, same array lengths, no extra commentary, no markdown code fences.`,
      maxOutputTokens: 1500,
    },
  });

  const raw = response.text?.trim() || "{}";
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "");

  try {
    return JSON.parse(cleaned);
  } catch {
    // If the model's output isn't valid JSON for some reason, fail soft
    // — the caller falls back to English rather than showing garbage.
    return null;
  }
}

/**
 * getTranslatedScheme — on-demand + cached translation. Returns the
 * scheme with its display fields swapped for translated ones. English
 * always skips translation entirely. Every other language:
 *   1. Look for a cache entry keyed on (schemeId, language).
 *   2. If found AND its sourceTextHash matches the scheme's current
 *      content, serve it — no API call.
 *   3. Otherwise translate fresh, upsert the cache, serve it.
 *
 * This means the first person to ask for a scheme in, say, Maithili
 * pays one API call; everyone after gets it from MongoDB for free.
 */
export async function getTranslatedScheme(scheme, targetLanguage) {
  if (!targetLanguage || targetLanguage === "en" || !isSupportedLanguage(targetLanguage)) {
    return scheme;
  }

  const currentHash = hashSourceFields(scheme);
  const cached = await TranslationCache.findOne({
    schemeId: scheme._id,
    language: targetLanguage,
  }).lean();

  if (cached && cached.sourceTextHash === currentHash) {
    return { ...scheme, ...cached.translated, _translationLanguage: targetLanguage };
  }

  const translated = await translateSchemeFields(scheme, targetLanguage);
  if (!translated) {
    // Translation failed — serve English rather than a broken page.
    return scheme;
  }

  await TranslationCache.findOneAndUpdate(
    { schemeId: scheme._id, language: targetLanguage },
    {
      schemeId: scheme._id,
      schemeStringId: scheme.schemeId,
      language: targetLanguage,
      sourceTextHash: currentHash,
      translated,
    },
    { upsert: true }
  );

  return { ...scheme, ...translated, _translationLanguage: targetLanguage };
}

/**
 * getTranslatedSchemes — batch helper for list endpoints (GET
 * /api/schemes). Translates each scheme independently so a cache hit on
 * one doesn't block a cache miss on another; runs them concurrently.
 */
export async function getTranslatedSchemes(schemes, targetLanguage) {
  if (!targetLanguage || targetLanguage === "en") return schemes;
  return Promise.all(schemes.map((s) => getTranslatedScheme(s, targetLanguage)));
}
