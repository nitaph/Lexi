import express from "express";

import PersonalityScores from "../models/PersonalityScores";
import { getScoresForExperiment } from "../services/personality.service";
import { experimentsService } from "../services/experiments.service";
import { agentsService } from "../services/agents.service";
import { usersService } from "../services/users.service";

const router = express.Router();

/**
 * GET /api/personality/user/:userId
 * Returns one user's saved Big-Five scores.
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const scores = await PersonalityScores.findOne({ userId });
    if (!scores) {
      return res.status(404).json({ error: "Scores not found" });
    }
    res.json(scores);
  } catch (err) {
    console.error("❌ Error fetching user scores:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /api/personality
 * ⬤ Upsert the user's Big-Five
 * ⬤ Pick mirror/complement & baseline agents
 * ⬤ Write the assigned agent into the user's `agent` field
 * ⬤ Return both agents
 */
router.post("/", async (req, res) => {
  const {
    userId,
    experimentId,
    openness,
    conscientiousness,
    extraversion,
    agreeableness,
    neuroticism,
  } = req.body;

  // 1) Validate
  const allScores = [
    openness,
    conscientiousness,
    extraversion,
    agreeableness,
    neuroticism,
  ];
  if (
    !userId ||
    !experimentId ||
    allScores.some((v) => typeof v !== "number" || v < 0 || v > 50)
  ) {
    return res.status(400).json({ error: "Invalid or incomplete data" });
  }

  try {
    // 2) Upsert into PersonalityScores
    const existing = await PersonalityScores.findOne({ userId, experimentId });
    if (existing) {
      await PersonalityScores.updateOne(
        { userId, experimentId },
        { $set: req.body }
      );
    } else {
      await PersonalityScores.create({
        userId,
        experimentId,
        openness,
        conscientiousness,
        extraversion,
        agreeableness,
        neuroticism,
      });
    }

    // 3) Load experiment & its multiAgents array
    const experiment = await experimentsService.getExperimentById(experimentId);
    if (!experiment?.multiAgents?.length) {
      return res.status(400).json({ error: "No agents found in experiment." });
    }

    // 4) Fetch each agent doc
    const agentDocs = await Promise.all(
      experiment.multiAgents.map((m) => agentsService.getAgent(m.agent))
    );

    // 5) Pick assigned & baseline
    const assignedAgent = agentDocs.find((a) =>
      ["mirroring", "complementing"].includes(a.personalityStrategy)
    );
    const baselineAgent = agentDocs.find(
      (a) => a.personalityStrategy === "none"
    );

    if (!assignedAgent || !baselineAgent) {
      return res
        .status(500)
        .json({ error: "Could not select assigned/baseline agents" });
    }

    // 6) Persist the assigned agent into the user record
    await usersService.updateSingleUserAgent(userId, assignedAgent);

    // 7) Return both agents
    return res.status(200).json({
      message: "Scores saved successfully.",
      assignedAgent,
      baselineAgent,
    });
  } catch (err) {
    console.error("❌ Error saving personality scores:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /api/personality/:experimentId
 * Returns all saved Big-Five scores for this experiment.
 */
router.get("/:experimentId", async (req, res) => {
  try {
    const { experimentId } = req.params;
    const scores = await getScoresForExperiment(experimentId);
    if (!scores) {
      return res.status(404).json({ error: "No personality scores found." });
    }
    res.json(scores);
  } catch (error) {
    console.error("❌ Error fetching personality scores:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
