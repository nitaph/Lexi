// src/models/AgentsModel.ts
import { Schema } from "mongoose";
import { mongoDbProvider } from "../mongoDBProvider";
import { IAgent } from "../types";

export const agentsSchema = new Schema<IAgent>(
  {
    title: { type: String, required: true },
    summary: { type: String },
    systemStarterPrompt: { type: String },
    beforeUserSentencePrompt: { type: String },
    afterUserSentencePrompt: { type: String },
    firstChatSentence: { type: String, required: true },
    model: { type: String, required: true },
    temperature: { type: Number },
    maxTokens: { type: Number },
    topP: { type: Number },
    frequencyPenalty: { type: Number },
    presencePenalty: { type: Number },
    stopSequences: { type: [String] },

    // ✅ Personality traits (optional)
    openness: { type: Number },
    conscientiousness: { type: Number },
    extraversion: { type: Number },
    agreeableness: { type: Number },
    neuroticism: { type: Number },
    personalityStrategy: { type: String },

    createdAt: { type: Date, default: Date.now },
    timestamp: { type: Number, default: () => Date.now() },
  },
  { versionKey: false }
);

export const AgentsModel = mongoDbProvider.getModel<IAgent>(
  "agents",
  agentsSchema
);
