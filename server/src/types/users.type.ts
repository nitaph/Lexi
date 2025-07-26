import mongoose from "mongoose";
import { IAgent } from "./agents.type";

export interface IUser {
  _id?: mongoose.Types.ObjectId;
  experimentId: string;
  username: string;
  age: number;
  gender: "male" | "female" | "other";
  biologicalSex: string;
  maritalStatus: string;
  childrenNumber: number;
  nativeEnglishSpeaker: boolean;
  createdAt: Date;
  timestamp: number;
  isAdmin: boolean;
  password?: string;
  numberOfConversations: number;
  agent: IAgent;

  openness?: number;
  conscientiousness?: number;
  extraversion?: number;
  agreeableness?: number;
  neuroticism?: number;

  // ✅ Add these fields:
  metadata?: {
    postConversation?: {
      llmPersonality?: {
        strategy: string;
        openness: number;
        conscientiousness: number;
        extraversion: number;
        agreeableness: number;
        neuroticism: number;
      };
    };
  };

  save?: () => Promise<void>; // Needed to allow save() on user
}
