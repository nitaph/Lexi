import { Schema } from "mongoose";
import { mongoDbProvider } from "../mongoDBProvider";
import { IExperiment } from "../types";

// Define the agent distribution schema used for Multi mode
const AgentDistributionSchema = new Schema(
  {
    agent: { type: String, required: true },
    dist: { type: Number, required: true },
  },
  { _id: false }
);

export const experimentsSchema = new Schema<IExperiment>(
  {
    // Agent mode: "Single" or "Multi"
    agentsMode: {
      type: String,
      enum: ["Single", "Multi"], // ✅ Removed "AB"
      required: true,
    },

    // Single-agent setup
    activeAgent: { type: String },

    // Multi-agent setup
    multiAgents: [AgentDistributionSchema],

    // Metadata
    title: { type: String, required: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    timestamp: { type: Number, default: () => Date.now() },

    // Session tracking
    numberOfParticipants: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },
    openSessions: { type: Number, default: 0 },

    // Limitations
    maxMessages: { type: Number },
    maxConversations: { type: Number },
    maxParticipants: { type: Number },

    // UI configuration
    displaySettings: {
      welcomeHeader: { type: String },
      welcomeContent: { type: String },
    },

    // Forms
    experimentForms: {
      registration: { type: String },
      preConversation: { type: String },
      postConversation: { type: String },
    },

    // Optional features
    experimentFeatures: {
      userAnnotation: { type: Boolean },
      streamMessage: { type: Boolean },
    },
  },
  { versionKey: false }
);

// Export the MongoDB model
export const ExperimentsModel = mongoDbProvider.getModel(
  "experiments",
  experimentsSchema
);
