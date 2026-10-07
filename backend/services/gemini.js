// Dynamic import for GoogleGenAI to avoid Vite import resolution errors
let GoogleGenAI = null;
import { languageName } from "./translator.js";

/**
 * Why Gemini instead of Claude here: Anthropic's API has no permanent
 * free tier — every request costs real money from the first token.
 * Google's Gemini API does have a genuine, ongoing free tier (not a
 * time-limited trial), which matters for a project meant to be run,
 * demoed, and re-tested by other people without anyone footing a bill.
 *
 * This is the ONE file plus translator.js that talks to an LLM for
 * generation. Swapping providers required no changes anywhere else —
 * routes, the eligibility matcher, and the RAG orchestration in
 * routes/chat.js are all provider-agnostic; they only see
 * generateAnswer() and analyzeEligibility(), same as before.
 *
 * Model choice: gemini-2.5-flash was Google's stable, GA flash-tier
 * model as of this writing, on a free tier around 1,500 requests/day —
 * comfortably enough for personal project traffic. Google's model
 * lineup and free-tier limits change often; if this model name 404s,
 * check https://ai.google.dev/gemini-api/docs/models for its current
 * replacement (usually a one-line string change, per Google's own
 * migration notes).
 */
const MODEL = "gemini-3.1-flash-lite";

let client = null;
async function getClient() {
  if (!client) {
    if (!GoogleGenAI) {
      const { GoogleGenAI: ImportedGenAI } = await import("@google/genai");
      GoogleGenAI = ImportedGenAI;
    }
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

/**
 * buildContext — RAG pipeline step 8. Concatenates exactly the fields
 * the doc specifies (name, description, benefits, eligibility) for each
 * retrieved scheme, so the model answers only from this and nothing
 * else. Exported so its formatting can be unit-tested without calling
 * any API — this function never changed across the Claude → Gemini
 * migration, which is exactly the point of keeping it provider-agnostic.
 */
export function buildContext(schemes) {
  return schemes
    .map(
      (s, i) => `
[Scheme ${i + 1}: ${s.name}]
Ministry: ${s.ministry}
Description: ${s.description}
Benefits: ${(s.benefits || []).join("; ")}
Eligibility: minAge=${s.eligibility?.minAge ?? "none"}, maxAge=${s.eligibility?.maxAge ?? "none"}, maxAnnualIncome=${s.eligibility?.maxAnnualIncome ?? "none"}, categories=${(s.eligibility?.categories || []).join(",") || "any"}, states=${(s.eligibility?.states || []).join(",") || "all-India"}
Documents required: ${(s.documentsRequired || []).join("; ")}
Official website: ${s.officialWebsite}
`.trim()
    )
    .join("\n\n");
}

/**
 * toGeminiHistory — Gemini's chat format uses role "model" where our
 * internal messages (and Claude's API) use "assistant", and wraps text
 * in a `parts` array rather than a plain string. This is the one real
 * shape difference the migration had to account for.
 */
function toGeminiHistory(conversationHistory) {
  return conversationHistory.slice(-6).map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));
}

/**
 * generateAnswer — RAG pipeline step 9. Answers strictly from the
 * retrieved scheme context, in the user's own language, and returns the
 * source list the route needs for citations (step 10).
 */
export async function generateAnswer({ question, schemes, language = "en", conversationHistory = [] }) {
  const langName = languageName(language);
  const context = schemes.length
    ? buildContext(schemes)
    : "No matching schemes were found in the database for this question.";

  const systemInstruction = `You are SarkariSetu, an assistant that helps Indian citizens understand government welfare schemes.

Rules:
- Answer ONLY using the scheme information provided below. Never invent scheme names, benefits, amounts, or eligibility rules that aren't in the context.
- If the context doesn't contain the answer, say so plainly and suggest the person browse schemes or rephrase their question. Do not guess.
- Reply entirely in ${langName}, in a warm, plain, non-bureaucratic tone — the way you'd explain it to a family member.
- Keep the answer focused and skimmable. Use short paragraphs.
- Do not mention that you were given "context" or "documents" — just answer naturally, as if you already knew this.

Available scheme information:
${context}`;

  const response = await (await getClient()).models.generateContent({
    model: MODEL,
    contents: [...toGeminiHistory(conversationHistory), { role: "user", parts: [{ text: question }] }],
    config: {
      systemInstruction,
      maxOutputTokens: 800,
    },
  });

  const answer = response.text?.trim() || "";

  const sources = schemes.map((s) => ({
    schemeId: s.schemeId,
    name: s.name,
    officialWebsite: s.officialWebsite,
  }));

  return { answer, sources };
}

/**
 * analyzeEligibility — used by POST /api/eligibility/check. Given the
 * user's profile and the schemes that already passed the MongoDB filter,
 * asks the model for a short, personalized written summary to sit above
 * the scheme grid on the results page. Skips the API call entirely when
 * there are no matches — that path is unit-tested without needing a key.
 */
export async function analyzeEligibility({ profile, schemes, language = "en" }) {
  const langName = languageName(language);

  if (schemes.length === 0) {
    return {
      en: "Based on what you've shared, we couldn't find an exact match right now. That doesn't mean nothing applies to you — try browsing all schemes, since eligibility rules vary by state and can change.",
    }[language] || "No exact matches were found for this profile.";
  }

  const schemeList = schemes
    .map((s) => `- ${s.name} (${s.category}): ${s.tagline}`)
    .join("\n");

  const response = await (await getClient()).models.generateContent({
    model: MODEL,
    contents: `Citizen profile: state=${profile.state}, category=${profile.category}, annualIncome=${profile.annualIncome}, age=${profile.age}, isStudent=${profile.isStudent}, isFarmer=${profile.isFarmer}, isWoman=${profile.isWoman}, isSeniorCitizen=${profile.isSeniorCitizen}, isDivyang=${profile.isDivyang}.\n\nMatching schemes:\n${schemeList}`,
    config: {
      systemInstruction: `You are SarkariSetu. Write a short (3-5 sentence), warm, plain-language summary in ${langName} for a citizen who just completed an eligibility check. Mention roughly how many schemes matched and the general kinds of support available, without listing every scheme by name (they'll see the full list below your summary). Do not invent details beyond what's given.`,
      maxOutputTokens: 400,
    },
  });

  return response.text?.trim() || "";
}
