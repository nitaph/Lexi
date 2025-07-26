import { Schema } from "mongoose";
import { mongoDbProvider } from "../mongoDBProvider";
import {
  IMetadataConversation,
  SurveyAnswers,
} from "src/types/IMetadataConversation.type";

// 1) Build survey schema with required fields
const surveyFields: Record<keyof SurveyAnswers, any> = {} as any;
for (let i = 1; i <= 50; i++) {
  const key = `field${i}` as keyof SurveyAnswers;
  surveyFields[key] = {
    type: Number,
    required: true, // enforce on update
  };
}
const surveySchema = new Schema<SurveyAnswers>(surveyFields, {
  _id: false,
});

// 2) Main metadata schema
const metadataConversationSchema = new Schema<IMetadataConversation>(
  {
    experimentId: { type: String, required: true },
    messagesNumber: { type: Number, default: 0 },
    createdAt: { type: Date, default: () => new Date() },
    timestamp: { type: Number, default: () => Date.now() },
    lastMessageDate: { type: Date, default: () => new Date() },
    lastMessageTimestamp: { type: Number, default: () => Date.now() },

    preConversation: { type: Schema.Types.Mixed, default: {} },

    // **no default here** so on create it's undefined and won't be validated
    postConversation: { type: surveySchema },

    conversationNumber: { type: Number, required: true },
    userId: { type: String, required: true },
    maxMessages: { type: Number },
    isFinished: { type: Boolean, default: false },

    agent: { type: Schema.Types.Mixed, required: true },
  },
  { versionKey: false }
);

export const MetadataConversationsModel =
  mongoDbProvider.getModel<IMetadataConversation>(
    "MetadataConversation",
    metadataConversationSchema
  );
