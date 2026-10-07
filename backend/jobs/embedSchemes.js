import "dotenv/config";
import connectDB from "../config/db.js";
import Scheme from "../models/Scheme.js";
import Embedding from "../models/Embedding.js";
import { generateEmbedding, hashText } from "../services/embeddings.js";

/**
 * embedSchemes — walks every Scheme in MongoDB and makes sure it has an
 * up-to-date embedding. Skips schemes whose embeddingText hasn't changed
 * since the last run (compares textHash) so re-runs after a small data
 * edit don't re-embed the whole catalog.
 *
 * Run with: npm run embed (after npm run seed).
 */
async function embedSchemes() {
  await connectDB();

  const schemes = await Scheme.find({ isActive: true });
  console.log(`Found ${schemes.length} active schemes.`);

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const scheme of schemes) {
    const currentHash = hashText(scheme.embeddingText);
    const existing = await Embedding.findOne({ schemeId: scheme._id });

    if (existing && existing.textHash === currentHash) {
      skipped++;
      continue;
    }

    try {
      const vector = await generateEmbedding(scheme.embeddingText, "passage");

      await Embedding.findOneAndUpdate(
        { schemeId: scheme._id },
        {
          schemeId: scheme._id,
          schemeStringId: scheme.schemeId,
          vector,
          textHash: currentHash,
        },
        { upsert: true, new: true }
      );

      created++;
      console.log(`  ✓ Embedded: ${scheme.name}`);
    } catch (err) {
      failed++;
      console.error(`  ✗ Failed: ${scheme.name} — ${err.message}`);
    }
  }

  console.log(`\nDone. ${created} embedded, ${skipped} unchanged (skipped), ${failed} failed.`);
  process.exit(failed > 0 ? 1 : 0);
}

embedSchemes().catch((err) => {
  console.error("Embedding job crashed:", err);
  process.exit(1);
});
