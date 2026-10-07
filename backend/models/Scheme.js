import mongoose from "mongoose";

const CATEGORIES = [
  "agriculture",
  "health",
  "education",
  "housing",
  "employment",
  "social-security",
  "women",
  "certificates",
  "disability",
  "senior-citizens",
  "finance",
  "rural",
  "urban",
  "startup",
];

const eligibilitySchema = new mongoose.Schema(
  {
    minAge: { type: Number, default: null },
    maxAge: { type: Number, default: null },
    gender: { type: String, enum: ["male", "female", "any"], default: "any" },
    categories: { type: [String], default: [] }, // general | obc | sc | st | ews
    maxAnnualIncome: { type: Number, default: null },
    states: { type: [String], default: [] }, // empty = all-India
    flags: {
      requiresStudent: { type: Boolean, default: false },
      requiresFarmer: { type: Boolean, default: false },
      requiresWoman: { type: Boolean, default: false },
      requiresSeniorCitizen: { type: Boolean, default: false },
      requiresDivyang: { type: Boolean, default: false },
    },
  },
  { _id: false }
);

const schemeSchema = new mongoose.Schema(
  {
    schemeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    tagline: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    ministry: { type: String, required: true },
    category: { type: String, enum: CATEGORIES, required: true, index: true },
    beneficiaries: { type: [String], default: [] },
    eligibility: { type: eligibilitySchema, default: () => ({}) },
    benefits: { type: [String], default: [] },
    documentsRequired: { type: [String], default: [] },
    howToApply: { type: [String], default: [] },
    officialWebsite: { type: String, default: "" },
    helpline: { type: String, default: "" },
    tags: { type: [String], default: [], index: true },
    embeddingText: { type: String, required: true },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Supports the SchemeFilter keyword search (name, tagline, tags)
schemeSchema.index({ name: "text", tagline: "text", tags: "text" });

export const SCHEME_CATEGORIES = CATEGORIES;
export default mongoose.model("Scheme", schemeSchema);
