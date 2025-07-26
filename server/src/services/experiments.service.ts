import mongoose, { UpdateWriteOpResult } from "mongoose";
import { ExperimentsModel } from "../models/ExperimentsModel";
import {
  AgentsMode,
  DisplaySettings,
  ExperimentFeatures,
  IAgent,
  IExperiment,
  IExperimentLean,
} from "../types";
import { agentsService } from "./agents.service";

type BulkWriteResult = ReturnType<typeof ExperimentsModel.bulkWrite>;

class ExperimentsService {
  async createExperiment(experiment: IExperiment): Promise<IExperiment> {
    if (experiment.agentsMode === AgentsMode.MULTI) {
      const agents = experiment.multiAgents || [];

      if (agents.length < 2) {
        throw new Error("Multi-agent experiment must have at least two agents");
      }

      const total = agents.reduce((sum, a) => sum + a.dist, 0);
      if (total !== 100) {
        throw new Error(
          `Agent distribution must sum to 100. Current: ${total}`
        );
      }
    }

    return await ExperimentsModel.create(experiment);
  }

  async updateExperiment(
    experiment: IExperiment
  ): Promise<UpdateWriteOpResult> {
    if (experiment.agentsMode === AgentsMode.MULTI) {
      const agents = experiment.multiAgents || [];

      if (agents.length < 2) {
        throw new Error("Multi-agent experiment must have at least two agents");
      }

      const total = agents.reduce((sum, a) => sum + a.dist, 0);
      if (total !== 100) {
        throw new Error(
          `Agent distribution must sum to 100. Current: ${total}`
        );
      }
    }

    return await ExperimentsModel.updateOne(
      { _id: experiment._id },
      { $set: experiment }
    );
  }

  async getExperiment(experimentId: string): Promise<IExperiment> {
    return await ExperimentsModel.findOne({
      _id: new mongoose.Types.ObjectId(experimentId),
    });
  }

  async getExperiments(page: string, limit: string): Promise<IExperiment[]> {
    const startIndex = (Number(page) - 1) * Number(limit);
    return await ExperimentsModel.find({})
      .skip(startIndex)
      .limit(Number(limit))
      .exec();
  }

  async addParticipant(experimentId: string): Promise<IExperiment> {
    return await ExperimentsModel.findOneAndUpdate(
      { _id: experimentId },
      { $inc: { numberOfParticipants: 1 } },
      { new: true }
    );
  }

  async addSession(experimentId: string): Promise<IExperiment> {
    return await ExperimentsModel.findOneAndUpdate(
      { _id: experimentId },
      { $inc: { totalSessions: 1, openSessions: 1 } },
      { new: true }
    );
  }

  async closeSession(experimentId: string): Promise<IExperiment> {
    return await ExperimentsModel.findOneAndUpdate(
      { _id: experimentId },
      { $inc: { openSessions: -1 } },
      { new: true }
    );
  }

  async updateExperimentDisplaySettings(
    experimentId: string,
    displaySettings: DisplaySettings
  ): Promise<UpdateWriteOpResult> {
    return await ExperimentsModel.updateOne(
      { _id: new mongoose.Types.ObjectId(experimentId) },
      { $set: { displaySettings } }
    );
  }

  async updateExperimentsStatus(
    experimentsUpdates: any[]
  ): Promise<BulkWriteResult> {
    const bulkOperations = experimentsUpdates.map((update) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(update.id) },
        update: { $set: { isActive: update.isActive } },
      },
    }));
    return await ExperimentsModel.bulkWrite(bulkOperations);
  }

  async getActiveAgent(experimentId: string): Promise<IAgent> {
    const experiment = await this.getExperiment(experimentId);
    let agentId: string | undefined;

    if (experiment.agentsMode === AgentsMode.SINGLE) {
      agentId = experiment.activeAgent;
    } else if (experiment.agentsMode === AgentsMode.MULTI) {
      const agents = experiment.multiAgents;
      if (!agents || agents.length < 2) {
        throw new Error("Invalid multiAgents configuration");
      }

      const weights = agents.map((entry) => entry.dist);
      const agentIds = agents.map((entry) => entry.agent);
      const total = weights.reduce((sum, w) => sum + w, 0);
      const r = Math.random() * total;
      let acc = 0;
      for (let i = 0; i < weights.length; i++) {
        acc += weights[i];
        if (r <= acc) {
          agentId = agentIds[i];
          break;
        }
      }
    }

    if (!agentId) {
      throw new Error("No agent could be selected.");
    }

    return await agentsService.getAgent(agentId);
  }

  async getExperimentBoundries(experimentId: string): Promise<{
    maxMessages: number;
    maxConversations: number;
    maxParticipants: number;
  }> {
    const result = await ExperimentsModel.findOne(
      { _id: new mongoose.Types.ObjectId(experimentId) },
      { maxMessages: 1, maxConversations: 1, maxParticipants: 1 }
    );
    return {
      maxMessages: result?.maxMessages ?? 0,
      maxConversations: result?.maxConversations ?? 0,
      maxParticipants: result?.maxParticipants ?? 0,
    };
  }

  async getExperimentFeatures(experimentId: string): Promise<any> {
    const experiment = await ExperimentsModel.findById(experimentId).lean();

    if (!experiment) {
      throw new Error("Experiment not found");
    }

    const features: any = {
      userAnnotation: experiment.experimentFeatures?.userAnnotation ?? false,
      streamMessage: experiment.experimentFeatures?.streamMessage ?? false,
    };

    // Add baseline agent if SINGLE mode
    if (experiment.agentsMode === AgentsMode.SINGLE && experiment.activeAgent) {
      const baseAgent = await agentsService.getAgent(experiment.activeAgent);
      if (baseAgent) {
        features.baselineAgent = {
          ...baseAgent,
          personalityStrategy: "none", // explicitly mark as baseline
        };
      }
    }

    return features;
  }

  async getAllExperimentsByAgentId(
    agentId: string
  ): Promise<IExperimentLean[]> {
    return await ExperimentsModel.find(
      {
        $or: [{ activeAgent: agentId }, { "multiAgents.agent": agentId }],
      },
      { _id: 1, title: 1 }
    );
  }

  async deleteExperiment(experimentId: string): Promise<void> {
    await ExperimentsModel.deleteOne({ _id: experimentId });
  }

  async getExperimentById(experimentId: string): Promise<IExperimentLean> {
    return await ExperimentsModel.findById(experimentId).lean();
  }
}

export const experimentsService = new ExperimentsService();
