/**
 * retrievalMetrics — standard information-retrieval metrics for judging
 * whether the RAG pipeline's vector search actually surfaces the right
 * scheme(s), not just *a* scheme. Every function here is pure: it takes
 * plain arrays of scheme IDs and returns a number, with no database,
 * no embeddings, no API calls. That's deliberate — it's what lets these
 * be unit-tested with hand-written fixtures, and lets
 * jobs/runEvaluation.js reuse the exact same scoring logic against real
 * pipeline output.
 *
 * Vocabulary:
 *   retrievedIds — the ordered list of schemeIds vectorSearch() returned
 *   relevantIds  — the schemeId(s) a human says are actually correct
 *                  for that question (the "gold" answer)
 */

/**
 * hitAtK — did at least one relevant scheme appear anywhere in the top
 * K retrieved results? This is the most forgiving metric: it only asks
 * "did the right answer make the cut," not "was it ranked first."
 */
export function hitAtK(retrievedIds, relevantIds, k) {
  const topK = retrievedIds.slice(0, k);
  return topK.some((id) => relevantIds.includes(id));
}

/**
 * precisionAtK — of the top K results returned, what fraction were
 * actually relevant? Penalizes a retriever that buries the right answer
 * under irrelevant ones, even if it did technically include it.
 */
export function precisionAtK(retrievedIds, relevantIds, k) {
  const topK = retrievedIds.slice(0, k);
  if (topK.length === 0) return 0;
  const relevantCount = topK.filter((id) => relevantIds.includes(id)).length;
  return relevantCount / topK.length;
}

/**
 * recallAtK — of all the schemes that *should* have been found, what
 * fraction actually showed up in the top K? Matters most when a
 * question genuinely has multiple correct schemes (e.g. "how do I get
 * financial help as a farmer" — both PM-KISAN and KCC are valid).
 */
export function recallAtK(retrievedIds, relevantIds, k) {
  if (relevantIds.length === 0) return 1; // nothing to find — nothing missed
  const topK = retrievedIds.slice(0, k);
  const foundCount = relevantIds.filter((id) => topK.includes(id)).length;
  return foundCount / relevantIds.length;
}

/**
 * reciprocalRank — 1 / (position of the first relevant result), or 0 if
 * none appear at all. Rewards ranking the right answer near the top,
 * not just including it somewhere in a long list.
 */
export function reciprocalRank(retrievedIds, relevantIds) {
  for (let i = 0; i < retrievedIds.length; i++) {
    if (relevantIds.includes(retrievedIds[i])) {
      return 1 / (i + 1);
    }
  }
  return 0;
}

/**
 * evaluateRetrieval — aggregates the metrics above across an entire
 * evaluation set. `results` is an array of
 * { query, retrievedIds, relevantIds } — one entry per test question.
 * Returns the mean of each metric plus the raw per-question scores, so
 * a caller can both report a headline number and drill into which
 * specific questions performed worst.
 */
export function evaluateRetrieval(results, k = 5) {
  if (results.length === 0) {
    return {
      totalQueries: 0,
      hitRateAtK: 0,
      meanPrecisionAtK: 0,
      meanRecallAtK: 0,
      meanReciprocalRank: 0,
      perQuery: [],
    };
  }

  const perQuery = results.map(({ query, retrievedIds, relevantIds }) => ({
    query,
    hit: hitAtK(retrievedIds, relevantIds, k),
    precision: precisionAtK(retrievedIds, relevantIds, k),
    recall: recallAtK(retrievedIds, relevantIds, k),
    reciprocalRank: reciprocalRank(retrievedIds, relevantIds),
  }));

  const mean = (key) => perQuery.reduce((sum, r) => sum + r[key], 0) / perQuery.length;

  return {
    totalQueries: results.length,
    hitRateAtK: perQuery.filter((r) => r.hit).length / perQuery.length,
    meanPrecisionAtK: mean("precision"),
    meanRecallAtK: mean("recall"),
    meanReciprocalRank: mean("reciprocalRank"),
    perQuery,
  };
}
