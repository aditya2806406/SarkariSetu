import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkUserId: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    preferredLanguage: {
      type: String,
      enum: ["en", "hi", "bn", "mr", "te", "ta", "gu", "ur", "kn", "or", "ml", "pa", "as", "mai"],
      default: "en",
    },
    savedSchemes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Scheme" }],
    profile: {
      state: { type: String, default: "" },
      category: {
        type: String,
        enum: ["general", "obc", "sc", "st", "ews"],
        default: "general",
      },
      annualIncome: { type: Number, default: null },
      isStudent: { type: Boolean, default: false },
      isFarmer: { type: Boolean, default: false },
      isWoman: { type: Boolean, default: false },
      isSeniorCitizen: { type: Boolean, default: false },
      isDivyang: { type: Boolean, default: false },
      age: { type: Number, default: null },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
