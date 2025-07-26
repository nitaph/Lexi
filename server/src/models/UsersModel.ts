// src/models/UsersModel.ts

import { Schema } from "mongoose";
import { mongoDbProvider } from "../mongoDBProvider";
import { IUser } from "../types";
import { agentsSchema } from "./AgentsModel";

export const userSchema = new Schema<IUser>(
  {
    experimentId: {
      type: String,
      required() {
        return !this.isAdmin;
      },
    },
    username: { type: String, required: true, unique: true },
    age: { type: Number },
    gender: { type: String },
    biologicalSex: { type: String },
    maritalStatus: { type: String },
    childrenNumber: { type: Number },
    nativeEnglishSpeaker: { type: Boolean },
    createdAt: { type: Date, default: Date.now },
    timestamp: { type: Number, default: () => Date.now() },
    isAdmin: { type: Boolean, default: () => false },
    password: { type: String },

    // Big-Five on the user (pre-conversation)
    openness: { type: Number, default: null },
    conscientiousness: { type: Number, default: null },
    extraversion: { type: Number, default: null },
    agreeableness: { type: Number, default: null },
    neuroticism: { type: Number, default: null },

    // **New**: persist LLM post-conversation traits here
    metadata: {
      postConversation: {
        llmPersonality: {
          strategy: { type: String },
          openness: { type: Number },
          conscientiousness: { type: Number },
          extraversion: { type: Number },
          agreeableness: { type: Number },
          neuroticism: { type: Number },
        },
      },
    },

    numberOfConversations: { type: Number, default: () => 0 },
    agent: {
      type: agentsSchema,
      required() {
        return !this.isAdmin;
      },
    },
  },
  { versionKey: false }
);

export const UsersModel = mongoDbProvider.getModel<IUser>("users", userSchema);
