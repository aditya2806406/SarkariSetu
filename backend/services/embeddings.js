import crypto from "crypto";

/**
 * Why a local model instead of OpenAI: OpenAI's embedding API has no
 * free tier — every call costs money from the first request. Running
 * embeddings locally via a small ONNX sentence-transformer model
 * removes that dependency entirely: no API key, no per-call cost, no
 * quota to run out of, and no network dependency at request time.
 *
 * Trade-off, stated plainly: the model downloads (~120MB) from Hugging
 * Face the first time it's used, so that one-time step does need
 * internet access. After that first download, it's cached locally
 * (transformers.js's default cache directory) and every embedding call
 * runs fully offline. This is a genuinely different reliability
 * profile than a cloud API — no rate limiting, no outage risk, no
 * per-request latency variance from network conditions — at the cost
 * of using your own CPU for inference. At the seeded scale (100
 * schemes, single-digit questions per evaluation run), that trade is
 * an easy one.
 *
 * Model: intfloat/multilingual-e5-small (via its Xenova ONNX port),
 * chosen specifically because it's trained across 100+ languages and
 * multilingual-e5 models are a well-established, competitive choice
 * for cross-lingual retrieval — relevant here since a citizen's
 * question may arrive in any of our 14 supported languages, even
 * though the question itself is translated to English before
 * embedding (see services/translator.js#translateToEnglish). Honest
 * caveat: a general multilingual model's quality on lower-resource
 * languages (e.g. Maithili) is weaker than on high-resource ones like
 * Hindi — not a solved problem, just an accepted trade-off for a free,
 * local option.
 *
 * E5 models are trained with a specific instruction-prefix convention:
 * queries get "query: " and documents get "passage: " prepended. This
 * measurably improves retrieval quality over embedding raw text, so
 * generateEmbedding takes a `type` argument specifically to apply it
 * correctly rather than skip it for simplicity.
 */
const MODEL_ID = "Xenova/multilingual-e5-small";
export const EMBEDDING_DIMENSIONS = 384;

let extractorPromise = null;
function getExtractor() {
  if (!extractorPromise) {
    // Lazy import: pulls in transformers.js only when an embedding is
    // actually requested, not at module load — same reasoning as the
    // lazy client pattern used for the Gemini client, and it means
    // code that never calls generateEmbedding (like most unit tests)
    // never pays the cost of loading this dependency at all.
    extractorPromise = import("@huggingface/transformers").then(({ pipeline }) =>
      pipeline("feature-extraction", MODEL_ID)
    );
  }
  return extractorPromise;
}

/**
 * generateEmbedding — turns a text blob into a 384-dim vector using a
 * local multilingual sentence-transformer model. `type` controls the
 * E5 instruction prefix: "passage" for scheme content being indexed
 * (jobs/embedSchemes.js), "query" for an incoming citizen question
 * (services/vectorSearch.js).
 */
export async function generateEmbedding(text, type = "passage") {
  const prefix = type === "query" ? "query: " : "passage: ";
  const extractor = await getExtractor();
  const output = await extractor(prefix + text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}

/**
 * hashText — MD5 hash of embeddingText, stored alongside each vector so
 * jobs/embedSchemes.js can skip re-embedding schemes that haven't
 * changed since the last run.
 */
export function hashText(text) {
  return crypto.createHash("md5").update(text).digest("hex");
}
