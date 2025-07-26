import mongoose from "mongoose";

export interface IAgent {
  _id?: string | mongoose.Types.ObjectId;
  title: string;
  summary?: string;
  systemStarterPrompt?: string;
  beforeUserSentencePrompt?: string;
  afterUserSentencePrompt?: string;
  firstChatSentence: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];

  // ✅ Optional Personality Conditioning Fields (used for mirroring/complementing)
  openness?: number;
  conscientiousness?: number;
  extraversion?: number;
  agreeableness?: number;
  neuroticism?: number;

  // ✅ Personality strategy (used to determine type of injection)
  personalityStrategy?: "mirroring" | "complementing" | "none" | "baseline";

  // Optional custom system prompt template (if used in injection logic)
  promptTemplate?: string;

  createdAt?: Date;
  timestamp?: number;
}

export interface IAgentLean {
  _id?: string | mongoose.Types.ObjectId;
  title: string;
}
