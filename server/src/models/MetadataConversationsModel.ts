import { Schema } from 'mongoose';
import { mongoDbProvider } from '../mongoDBProvider';
import { IMetadataConversation } from '../types';
import { agentsSchema } from './AgentsModel';

export const metadataConversationSchema = new Schema<IMetadataConversation>(
    {
        experimentId: { type: String, required: true },
        messagesNumber: { type: Number, default: () => 0 },
        createdAt: { type: Date, default: Date.now },
        timestamp: { type: Number, default: () => Date.now() },
        lastMessageDate: { type: Date, default: Date.now },
        lastMessageTimestamp: { type: Number, default: () => Date.now() },
        preConversation: { type: Object },
        postConversation: { type: Object },
        conversationNumber: { type: Number },
        userId: { type: String, required: true },
        conversationStrategy: { type: String, default: 'none' },
        humanPersonality: { type: Object },
        llmPersonality: { type: Object },
        llmSystemPrompt: { type: String },
        maxMessages: { type: Number },
        isFinished: { type: Boolean, default: () => false },
        agent: { type: agentsSchema, required: true },
    },
    { versionKey: false },
);

export const MetadataConversationsModel = mongoDbProvider.getModel(
    'metadata_conversations',
    metadataConversationSchema,
);
