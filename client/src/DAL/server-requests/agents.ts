// src/DAL/server-requests/agents.ts

import axiosInstance from "./AxiosInstance";
import { AgentType, AgentLeanType } from "@models/AppModels";

export const saveAgent = async (agent: AgentType): Promise<AgentType> => {
  try {
    const response = await axiosInstance.post(`/agents`, agent);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateAgent = async (agent: AgentType): Promise<void> => {
  try {
    await axiosInstance.put(`/agents`, { agent });
  } catch (error) {
    throw error;
  }
};

export const getAgents = async (): Promise<AgentType[]> => {
  try {
    const response = await axiosInstance.get(`/agents`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAgentLean = async (agentId: string): Promise<AgentLeanType> => {
  try {
    const response = await axiosInstance.get(`/agents/${agentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch the full Agent object by ID.
 */
export const getAgentById = async (agentId: string): Promise<AgentType> => {
  try {
    const response = await axiosInstance.get(`/agents/${agentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteAgent = async (agentId: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/agents/${agentId}`);
  } catch (error) {
    throw error;
  }
};
