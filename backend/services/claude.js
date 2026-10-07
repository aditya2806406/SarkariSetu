import { languageName } from "./translator.js";

let anthropic = null;
async function getClient() {
  if (!anthropic) {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropic;
}
const MODEL = "claude-sonnet-5";

/**
 * buildContext — RAG pipeline step 8. Concatenates exactly the fields
 * the doc specifies (name, description, benefits, eligibility) for each
 * retrieved scheme, so Claude answers only from this and nothing else.
 * Exported so its formatting can be unit-tested without calling the
 * Anthropic API.
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
 * generateAnswer — RAG pipeline step 9. Answers strictly from the
 * retrieved scheme context, in the user's own language, and returns the
 * source list the route needs for citations (step 10).
 */
export async function generateAnswer({ question, schemes, language = "en", conversationHistory = [] }) {
  const langName = languageName(language);
  const context = schemes.length
    ? buildContext(schemes)
    : "No matching schemes were found in the database for this question.";

  const historyBlock = conversationHistory
    .slice(-6) // keep the prompt small — recent turns only
    .map((m) => `${m.role === "user" ? "Citizen" : "SarkariSetu"}: ${m.content}`)
    .join("\n");

  const systemPrompt = `You are SarkariSetu, an assistant that helps Indian citizens understand government welfare schemes.

Rules:
- Answer ONLY using the scheme information provided below. Never invent scheme names, benefits, amounts, or eligibility rules that aren't in the context.
- If the context doesn't contain the answer, say so plainly and suggest the person browse schemes or rephrase their question. Do not guess.
- Reply entirely in ${langName}, in a warm, plain, non-bureaucratic tone — the way you'd explain it to a family member.
- Keep the answer focused and skimmable. Use short paragraphs.
- Do not mention that you were given "context" or "documents" — just answer naturally, as if you already knew this.

Available scheme information:
${context}`;

  const client = await getClient();
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 800,
    system: systemPrompt,
    messages: [
      ...(historyBlock ? [{ role: "user", content: `Earlier in this conversation:\n${historyBlock}` }] : []),
      { role: "user", content: question },
    ],
  });

  const answer = response.content[0]?.text?.trim() || "";

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
 * asks Claude for a short, personalized written summary to sit above the
 * scheme grid on the results page.
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

  const client = await getClient();
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 400,
    system: `You are SarkariSetu. Write a short (3-5 sentence), warm, plain-language summary in ${langName} for a citizen who just completed an eligibility check. Mention roughly how many schemes matched and the general kinds of support available, without listing every scheme by name (they'll see the full list below your summary). Do not invent details beyond what's given.`,
    messages: [
      {
        role: "user",
        content: `Citizen profile: state=${profile.state}, category=${profile.category}, annualIncome=${profile.annualIncome}, age=${profile.age}, isStudent=${profile.isStudent}, isFarmer=${profile.isFarmer}, isWoman=${profile.isWoman}, isSeniorCitizen=${profile.isSeniorCitizen}, isDivyang=${profile.isDivyang}.\n\nMatching schemes:\n${schemeList}`,
      },
    ],
  });

  return response.content[0]?.text?.trim() || "";
}
