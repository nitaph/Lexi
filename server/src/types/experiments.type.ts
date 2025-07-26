import mongoose from "mongoose";

/**
 * Defines a single agent entry with a distribution percentage.
 */
export interface AgentDistributionEntry {
  agent: string; // Agent ID (reference to AgentModel._id)
  dist: number; // Percentage of users assigned (0–100)
}

/**
 * UI-related display settings per experiment.
 */
export interface DisplaySettings {
  welcomeContent: string;
  welcomeHeader: string;
}

/**
 * Form links or references used throughout the experiment flow.
 */
export interface ExperimentForms {
  registration?: string;
  preConversation?: string;
  postConversation?: string;
}

/**
 * Optional feature toggles for experiments.
 */
export interface ExperimentFeatures {
  userAnnotation: boolean;
  streamMessage: boolean;
}

/**
 * Minimal experiment info used for listing or referencing.
 */
export interface IExperimentLean {
  _id: mongoose.Types.ObjectId | string;
  title: string;
  multiAgents?: AgentDistributionEntry[]; // Used in Multi mode
}

/**
 * Full experiment interface for the backend.
 */
export interface IExperiment {
  _id?: mongoose.Types.ObjectId;
  agentsMode: "Single" | "Multi"; // 'AB' fully removed ✅

  // Agent configuration
  activeAgent?: string; // For Single mode
  multiAgents?: AgentDistributionEntry[]; // For Multi mode

  // Metadata
  isActive: boolean;
  title: string;
  description?: string;
  createdAt?: Date;
  timestamp?: number;

  // Session tracking
  numberOfParticipants?: number;
  totalSessions?: number;
  openSessions?: number;

  // Limitations
  maxMessages?: number;
  maxConversations?: number;
  maxParticipants?: number;

  // Forms and UI
  displaySettings?: DisplaySettings;
  experimentForms?: ExperimentForms;
  experimentFeatures?: ExperimentFeatures;
}
