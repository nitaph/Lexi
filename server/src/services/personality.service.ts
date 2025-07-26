import PersonalityScoresModel from "../models/PersonalityScores";
import { PersonalityScores } from "../types/PersonalityScores.type";

/**
 * Retrieves the personality scores for a given experiment.
 * Currently returns the **first** matching score for that experiment.
 * You can adapt this to fetch all scores if needed.
 */
export const getScoresForExperiment = async (
  experimentId: string
): Promise<PersonalityScores | null> => {
  const score = await PersonalityScoresModel.findOne({ experimentId });
  if (!score) return null;

  return {
    openness: score.openness,
    conscientiousness: score.conscientiousness,
    extraversion: score.extraversion,
    agreeableness: score.agreeableness,
    neuroticism: score.neuroticism,
  };
};
