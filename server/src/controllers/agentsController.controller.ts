import { Request, Response } from "express";
import { agentsService } from "../services/agents.service";
import { experimentsService } from "../services/experiments.service";
import { requestHandler } from "../utils/requestHandler";

class AgentsController {
  getAgents = requestHandler(async (req: Request, res: Response) => {
    const agents = await agentsService.getAllAgents();
    res.status(200).send(agents);
  });

  getAgentLean = requestHandler(async (req: Request, res: Response) => {
    const agentId = req.params.id as string;
    const agent = await agentsService.getAgentLean(agentId);
    res.status(200).send(agent);
  });

  saveAgent = requestHandler(async (req: Request, res: Response) => {
    try {
      console.log("Received agent data to save:", req.body);
      const agent = req.body;
      const savedAgent = await agentsService.saveAgent(agent);
      res.status(200).send(savedAgent);
    } catch (err) {
      console.error("❌ Agent save failed:", err);
      res.status(500).send({ error: "Agent save failed", details: err });
    }
  });

  getAgentFull = requestHandler(async (req: Request, res: Response) => {
    const agentId = req.params.id as string;
    const agent = await agentsService.getAgent(agentId); // full object
    res.status(200).send(agent);
  });

  updateAgent = requestHandler(async (req: Request, res: Response) => {
    const { agent } = req.body;
    const response = await agentsService.updateAgents(agent);
    res.status(200).send(response);
  });

  deleteAgent = requestHandler(async (req: Request, res: Response) => {
    const agentId = req.params.id as string;
    const experiments =
      await experimentsService.getAllExperimentsByAgentId(agentId);
    if (experiments.length) {
      res.status(409).send(experiments);
    }
    await agentsService.deleteAgent(agentId);
    res.status(200).send();
  });
}

export const agentsController = new AgentsController();
