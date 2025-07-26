// src/utils/buildSystemPromptWithPersonality.ts

import { fetchPersonalityScores } from "@DAL/server-requests/personality";
import { AgentType } from "@models/AppModels";

type PersonalityScores = {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
};

function invert(score: number): number {
  return 50 - score;
}

function buildPersonalityPrompt(
  personality: PersonalityScores,
  strategy: "mirroring" | "complementing",
  basePrompt: string
): string {
  const {
    openness,
    conscientiousness,
    extraversion,
    agreeableness,
    neuroticism,
  } = personality;

  const traitsText = `User personality scores (out of 50):
- Openness: ${openness}
- Conscientiousness: ${conscientiousness}
- Extraversion: ${extraversion}
- Agreeableness: ${agreeableness}
- Neuroticism: ${neuroticism}`;

  const instruction =
    strategy === "mirroring"
      ? "Your responses should reflect a similar personality to the user."
      : "Your responses should reflect a complementary personality to the user.";

  return `${basePrompt}\n\n${traitsText}\n\n${instruction}`;
}

export async function buildSystemPromptWithPersonality(
  agent: AgentType,
  userId: string
): Promise<string> {
  const strategy = agent.personalityStrategy;

  if (!strategy || strategy === "none" || strategy === "baseline") {
    return agent.systemStarterPrompt;
  }

  const scores = await fetchPersonalityScores(userId);
  if (!scores) {
    console.warn("⚠️ No personality scores found for user:", userId);
    return agent.systemStarterPrompt;
  }

  const transformedScores =
    strategy === "complementing"
      ? {
          openness: invert(scores.openness),
          conscientiousness: invert(scores.conscientiousness),
          extraversion: invert(scores.extraversion),
          agreeableness: invert(scores.agreeableness),
          neuroticism: invert(scores.neuroticism),
        }
      : scores;

  return buildPersonalityPrompt(
    transformedScores,
    strategy,
    agent.systemStarterPrompt
  );
}
