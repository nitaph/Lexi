import { UpdateWriteOpResult } from "mongoose";
import { AgentsModel } from "../models/AgentsModel";
import { IAgent, IAgentLean } from "src/types";

class AgentsService {
  saveAgent = async (agentData: IAgent): Promise<IAgent> => {
    console.log("💾 Saving agent data:", {
      title: agentData.title,
      openness: agentData.openness,
      conscientiousness: agentData.conscientiousness,
      extraversion: agentData.extraversion,
      agreeableness: agentData.agreeableness,
      neuroticism: agentData.neuroticism,
    });
    if (!agentData) {
      throw new Error("saveAgent was called with undefined or null agentData.");
    }

    const { _id, ...agentToCreate } = agentData;
    const response = await AgentsModel.create(agentToCreate);
    return response.toObject();
  };

  getAllAgents = async (): Promise<IAgent[]> => {
    return AgentsModel.find({});
  };

  getAgent = async (agentId: string): Promise<IAgent> => {
    return AgentsModel.findOne({ _id: agentId });
  };

  getAgentLean = async (agentId: string): Promise<IAgentLean> => {
    return AgentsModel.findOne({ _id: agentId }, { _id: 1, title: 1 });
  };

  updateAgents = async (agent: IAgent): Promise<UpdateWriteOpResult> => {
    return AgentsModel.updateOne({ _id: agent._id }, { $set: agent });
  };

  deleteAgent = async (agentId: string): Promise<void> => {
    await AgentsModel.deleteOne({ _id: agentId });
  };
}

export const agentsService = new AgentsService();
