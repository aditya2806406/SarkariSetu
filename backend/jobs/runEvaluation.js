import "dotenv/config";
import connectDB from "../config/db.js";
import { vectorSearch } from "../services/vectorSearch.js";
import { evaluateRetrieval } from "../services/retrievalMetrics.js";
import goldenSet from "../data/eval/goldenSet.js";
import fs from "fs";
import path from "path";

const K = 5;

/**
 * runEvaluation — runs every question in the golden set through the
 * real vectorSearch() pipeline (a local embedding model, real MongoDB
 * lookup against whatever's currently seeded and embedded), scores the
 * results with services/retrievalMetrics.js, prints a report, and saves
 * a timestamped JSON report to data/eval/reports/ so results can be
 * compared across runs as the scheme dataset changes.
 *
 * Requires: npm run seed && npm run embed already completed. Since
 * embeddings now run on a local model rather than a paid API (see
 * services/embeddings.js), this script needs no API key at all — only
 * a MongoDB connection with seeded, embedded schemes. That's a genuine
 * improvement over the original design: retrieval evaluation is now
 * completely free to run, repeatedly, with no quota to worry about.
 *
 * Run with: npm run eval
 */
async function runEvaluation() {
  await connectDB();

  console.log(`Running evaluation on ${goldenSet.length} questions (k=${K})...\n`);

  const results = [];

  for (const { question, relevantSchemeIds } of goldenSet) {
    try {
      const retrieved = await vectorSearch(question, K);
      const retrievedIds = retrieved.map((s) => s.schemeId);
      results.push({ query: question, retrievedIds, relevantIds: relevantSchemeIds });
    } catch (err) {
      console.error(`  ✗ Failed on "${question}": ${err.message}`);
      results.push({ query: question, retrievedIds: [], relevantIds: relevantSchemeIds });
    }
  }

  const report = evaluateRetrieval(results, K);

  console.log("=== Retrieval Evaluation Report ===\n");
  console.log(`Total questions:        ${report.totalQueries}`);
  console.log(`Hit rate @${K}:            ${(report.hitRateAtK * 100).toFixed(1)}%`);
  console.log(`Mean precision @${K}:      ${(report.meanPrecisionAtK * 100).toFixed(1)}%`);
  console.log(`Mean recall @${K}:         ${(report.meanRecallAtK * 100).toFixed(1)}%`);
  console.log(`Mean reciprocal rank:   ${report.meanReciprocalRank.toFixed(3)}`);

  const worst = [...report.perQuery].sort((a, b) => a.reciprocalRank - b.reciprocalRank).slice(0, 5);
  console.log("\n--- Lowest-scoring questions (worth investigating) ---");
  worst.forEach((r) => {
    console.log(`  [MRR ${r.reciprocalRank.toFixed(2)}] "${r.query}"`);
  });

  const reportsDir = path.join(process.cwd(), "data", "eval", "reports");
  fs.mkdirSync(reportsDir, { recursive: true });
  const filename = `eval-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  fs.writeFileSync(path.join(reportsDir, filename), JSON.stringify(report, null, 2));
  console.log(`\nFull report saved to data/eval/reports/${filename}`);

  process.exit(0);
}

runEvaluation().catch((err) => {
  console.error("Evaluation run failed:", err);
  process.exit(1);
});
