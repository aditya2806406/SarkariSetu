import mongoose from "mongoose";

const embeddingSchema = new mongoose.Schema(
  {
    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scheme",
      required: true,
      unique: true,
    },
    schemeStringId: { type: String, required: true, index: true },
    vector: {
      type: [Number],
      required: true,
      validate: {
        validator: (v) => v.length === 384,
        message: "vector must be a 384-dimension array (multilingual-e5-small).",
      },
    },
    textHash: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Embedding", embeddingSchema);
