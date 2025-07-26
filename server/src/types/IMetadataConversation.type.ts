// src/types/IMetadataConversation.ts
import { Document } from "mongoose";
import { IAgent } from "./agents.type";

export type SurveyAnswers = {
  [K in `field${
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15
    | 16
    | 17
    | 18
    | 19
    | 20
    | 21
    | 22
    | 23
    | 24
    | 25
    | 26
    | 27
    | 28
    | 29
    | 30
    | 31
    | 32
    | 33
    | 34
    | 35
    | 36
    | 37
    | 38
    | 39
    | 40
    | 41
    | 42
    | 43
    | 44
    | 45
    | 46
    | 47
    | 48
    | 49
    | 50}`]: number;
};

export interface IMetadataConversation extends Document {
  experimentId: string;
  messagesNumber: number;
  createdAt: Date;
  timestamp: number;
  lastMessageDate: Date;
  lastMessageTimestamp: number;
  preConversation?: Record<string, any>;
  /** Exactly the 50 numeric answers from the post‑conversation survey */
  postConversation?: SurveyAnswers;
  conversationNumber: number;
  userId: string;
  maxMessages?: number;
  isFinished: boolean;
  agent: IAgent;
}
