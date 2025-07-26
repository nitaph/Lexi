// if you want to keep using /api/personality in your front-end
import { Request, Response } from "express";
import { usersService } from "../services/users.service";
import { requestHandler } from "../utils/requestHandler";

export const submitPersonality = requestHandler(
  async (req: Request, res: Response) => {
    const { userId, scores } = req.body;
    await usersService.updateBigFiveScores(userId, scores);
    res.status(200).json({ message: "Scores saved successfully." });
  },
  (req, res, error) => {
    console.error("❌ submitPersonality error:", error);
    res.status(500).json({ message: "Failed to save personality scores." });
  }
);
