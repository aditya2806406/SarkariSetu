import Embedding from "../models/Embedding.js";
import Scheme from "../models/Scheme.js";
import { generateEmbedding } from "./embeddings.js";

/**
 * cosineSimilarity — standard cosine similarity between two equal-length
 * vectors. Returns a value in [-1, 1]; higher means more similar.
 * Exported (not just used internally) so it can be unit-tested directly
 * with known vectors, without needing a live OpenAI key or a database.
 */
export function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * vectorSearch — the retrieval step of the RAG pipeline (doc section 6.1,
 * steps 4-7):
 *   1. Embed the (English) query text.
 *   2. Load every stored scheme embedding from MongoDB.
 *   3. Score each against the query vector with cosine similarity.
 *   4. Return the full Scheme documents for the top `limit` matches.
 *
 * No external vector DB — this runs in-memory, which is fine at the
 * seeded scale (50-200 schemes) described in the blueprint.
 */
export async function vectorSearch(queryText, limit = 5) {
  const queryVector = await generateEmbedding(queryText, "query");

  const allEmbeddings = await Embedding.find({}).lean();
  if (allEmbeddings.length === 0) {
    return [];
  }

  const scored = allEmbeddings
    .map((e) => ({
      schemeId: e.schemeId,
      schemeStringId: e.schemeStringId,
      score: cosineSimilarity(queryVector, e.vector),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const schemeDocs = await Scheme.find({
    _id: { $in: scored.map((s) => s.schemeId) },
    isActive: true,
  }).lean();

  // Preserve similarity-ranked order — Mongo's $in doesn't guarantee it.
  const byId = new Map(schemeDocs.map((doc) => [String(doc._id), doc]));
  return scored
    .map((s) => {
      const doc = byId.get(String(s.schemeId));
      return doc ? { ...doc, relevanceScore: s.score } : null;
    })
    .filter(Boolean);
}
