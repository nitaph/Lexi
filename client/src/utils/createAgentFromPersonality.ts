import { AgentType } from "@models/AppModels";
import { saveAgent } from "@DAL/server-requests/agents";

// Define the expected structure for personality scores
export type PersonalityScores = {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
};

export type PersonalityStrategy = "mirroring" | "complementing" | "none";

/**
 * Build a customized system prompt based on the user's personality and strategy.
 */
const buildSystemPrompt = (
  basePrompt: string,
  scores: PersonalityScores,
  strategy: PersonalityStrategy
): string => {
  const transformedScores =
    strategy === "complementing"
      ? {
          openness: 50 - scores.openness,
          conscientiousness: 50 - scores.conscientiousness,
          extraversion: 50 - scores.extraversion,
          agreeableness: 50 - scores.agreeableness,
          neuroticism: 50 - scores.neuroticism,
        }
      : scores;

  const traitsText = `User personality scores (out of 50):
- Openness: ${transformedScores.openness}
- Conscientiousness: ${transformedScores.conscientiousness}
- Extraversion: ${transformedScores.extraversion}
- Agreeableness: ${transformedScores.agreeableness}
- Neuroticism: ${transformedScores.neuroticism}`;

  const instruction =
    strategy === "mirroring"
      ? "Your responses should reflect a similar personality to the user."
      : "Your responses should reflect a complementary personality to the user.";

  return `${basePrompt}\n\n${traitsText}\n\n${instruction}`;
};

/**
 * Create a new personalized agent from the base agent and Big Five scores.
 */
export async function createAgentFromPersonality(
  baseAgent: AgentType,
  scores: PersonalityScores,
  strategy: PersonalityStrategy
): Promise<AgentType> {
  console.log("🧠 Base agent received for personalization:", baseAgent);
  if (!baseAgent || typeof baseAgent !== "object") {
    throw new Error("Invalid baseAgent provided to createAgentFromPersonality");
  }

  if (!baseAgent.systemStarterPrompt) {
    console.warn("⚠️ baseAgent.systemStarterPrompt is missing or undefined!");
  }
  // Log incoming scores for debug
  console.log("🧠 Creating personalized agent with system prompt:");
  console.log("Personality Strategy:", strategy);
  console.log("⚙️ createAgentFromPersonality received scores:", scores);

  // Validate presence of all traits explicitly
  for (const trait of [
    "openness",
    "conscientiousness",
    "extraversion",
    "agreeableness",
    "neuroticism",
  ]) {
    if (scores[trait] === undefined || scores[trait] === null) {
      throw new Error(`Missing personality score for ${trait}`);
    }
  }

  const newPrompt = buildSystemPrompt(
    baseAgent.systemStarterPrompt,
    scores,
    strategy
  );

  console.log(newPrompt);

  for (const trait of [
    "openness",
    "conscientiousness",
    "extraversion",
    "agreeableness",
    "neuroticism",
  ]) {
    if (scores[trait] === undefined || scores[trait] === null) {
      throw new Error(`Missing personality score for ${trait}`);
    }
  }

  const personalizedAgent: AgentType = {
    ...baseAgent,
    _id: undefined,
    systemStarterPrompt: newPrompt,
    personalityStrategy: strategy,
    ...(strategy !== "none" ? scores : {}),
  };

  console.log("🧠 Saving agent:", {
    title: personalizedAgent.title,
    strategy: personalizedAgent.personalityStrategy,
    openness: personalizedAgent.openness,
    conscientiousness: personalizedAgent.conscientiousness,
    extraversion: personalizedAgent.extraversion,
    agreeableness: personalizedAgent.agreeableness,
    neuroticism: personalizedAgent.neuroticism,
  });

  const savedAgent = await saveAgent(personalizedAgent);
  return savedAgent;
}
