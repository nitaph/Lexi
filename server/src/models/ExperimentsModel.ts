import { Schema } from 'mongoose';
import { mongoDbProvider } from '../mongoDBProvider';
import { ABAgents, IExperiment, MultiAgent } from '../types';

const AbAgentsSchema = new Schema<ABAgents>({
    distA: { type: Number, required: true },
    agentA: { type: String, required: true },
    distB: { type: Number, required: true },
    agentB: { type: String, required: true },
});

const MultiAgentSchema = new Schema<MultiAgent>(
    {
        agent: { type: String, required: true },
        dist: { type: Number, required: true },
    },
    { _id: false },
);

export const experimentsSchema = new Schema<IExperiment>(
    {
        agentsMode: { type: String, required: true },
        activeAgent: { type: String },
        abAgents: { type: AbAgentsSchema },
        multiAgents: { type: [MultiAgentSchema] },
        createdAt: { type: Date, default: Date.now },
        timestamp: { type: Number, default: () => Date.now() },
        displaySettings: { type: Object },
        isActive: { type: Boolean },
        title: { type: String },
        description: { type: String },
        numberOfParticipants: { type: Number, default: () => 0 },
        experimentForms: {
            registration: { type: String },
            preConversation: { type: String },
            postConversation: { type: String },
        },
        maxMessages: { type: Number },
        maxConversations: { type: Number },
        maxParticipants: { type: Number },
        totalSessions: { type: Number, default: () => 0 },
        openSessions: { type: Number, default: () => 0 },
        experimentFeatures: {
            userAnnotation: { type: Boolean },
            streamMessage: { type: Boolean },
            conversationStrategy: { type: String, default: 'none' },
        },
    },
    { versionKey: false },
);

export const ExperimentsModel = mongoDbProvider.getModel('experiments', experimentsSchema);
