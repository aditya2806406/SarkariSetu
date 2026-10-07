import "dotenv/config";
import connectDB from "../config/db.js";
import Scheme from "../models/Scheme.js";

import agriculture from "./schemes/agriculture.js";
import health from "./schemes/health.js";
import education from "./schemes/education.js";
import housing from "./schemes/housing.js";
import employment from "./schemes/employment.js";
import women from "./schemes/women.js";
import finance from "./schemes/finance.js";
import socialSecurity from "./schemes/social-security.js";
import certificates from "./schemes/certificates.js";
import disability from "./schemes/disability.js";
import seniorCitizens from "./schemes/senior-citizens.js";
import rural from "./schemes/rural.js";
import urban from "./schemes/urban.js";
import startup from "./schemes/startup.js";

const ALL_SCHEMES = [
  ...agriculture,
  ...health,
  ...education,
  ...housing,
  ...employment,
  ...women,
  ...finance,
  ...socialSecurity,
  ...certificates,
  ...disability,
  ...seniorCitizens,
  ...rural,
  ...urban,
  ...startup,
];

/**
 * buildEmbeddingText — the text that actually gets embedded for RAG
 * retrieval (see jobs/embedSchemes.js). Concatenates the fields a
 * citizen's question is likely to semantically match against: name,
 * tagline, description-equivalent (built from tagline + benefits),
 * category, tags, and beneficiaries. We don't require every seed entry
 * to hand-write this — it's derived so it never drifts from the actual
 * content.
 */
function buildEmbeddingText(scheme) {
  return [
    scheme.name,
    scheme.tagline,
    scheme.description || scheme.tagline,
    `Category: ${scheme.category}`,
    `Beneficiaries: ${(scheme.beneficiaries || []).join(", ")}`,
    `Benefits: ${(scheme.benefits || []).join(". ")}`,
    `Tags: ${(scheme.tags || []).join(", ")}`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function seed() {
  await connectDB();

  console.log(`Seeding ${ALL_SCHEMES.length} schemes...`);

  let created = 0;
  let updated = 0;

  for (const raw of ALL_SCHEMES) {
    const scheme = {
      ...raw,
      description: raw.description || raw.tagline,
      embeddingText: raw.embeddingText || buildEmbeddingText(raw),
      isActive: raw.isActive !== false,
      isFeatured: !!raw.isFeatured,
    };

    const existing = await Scheme.findOne({ schemeId: scheme.schemeId });

    await Scheme.findOneAndUpdate(
      { schemeId: scheme.schemeId },
      scheme,
      { upsert: true, new: true, runValidators: true }
    );

    existing ? updated++ : created++;
  }

  console.log(`Done. ${created} created, ${updated} updated. Total in DB: ${await Scheme.countDocuments()}`);
  console.log("\nNext step: run 'npm run embed' to generate vector embeddings for RAG search.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
