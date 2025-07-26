import mongoose from "mongoose";

const PersonalityScoresSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    experimentId: { type: String }, // optional
    openness: { type: Number, required: true },
    conscientiousness: { type: Number, required: true },
    extraversion: { type: Number, required: true },
    agreeableness: { type: Number, required: true },
    neuroticism: { type: Number, required: true },
  },
  { timestamps: true }
);
// ✅ Enforce uniqueness per user per experiment
PersonalityScoresSchema.index({ userId: 1, experimentId: 1 }, { unique: true });

export default mongoose.model("PersonalityScores", PersonalityScoresSchema);
