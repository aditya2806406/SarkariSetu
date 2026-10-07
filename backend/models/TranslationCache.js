import mongoose from "mongoose";

/**
 * TranslationCache — the on-demand translation layer. Instead of storing
 * 13 pre-translated copies of every scheme (unmaintainable, and wasted
 * spend on schemes nobody reads in that language), we translate a
 * scheme's display fields into a language the first time someone asks
 * for it, then serve that cached copy to everyone after.
 *
 * `sourceTextHash` is an MD5 of the English fields we translated from.
 * If a scheme gets edited later, the hash changes and the cache entry
 * is treated as stale — see services/translator.js.
 */
const translationCacheSchema = new mongoose.Schema(
  {
    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scheme",
      required: true,
    },
    schemeStringId: { type: String, required: true, index: true },
    language: { type: String, required: true, index: true },
    sourceTextHash: { type: String, required: true },
    translated: {
      name: String,
      tagline: String,
      description: String,
      benefits: [String],
      documentsRequired: [String],
      howToApply: [String],
    },
  },
  { timestamps: true }
);

translationCacheSchema.index({ schemeId: 1, language: 1 }, { unique: true });

export default mongoose.model("TranslationCache", translationCacheSchema);
