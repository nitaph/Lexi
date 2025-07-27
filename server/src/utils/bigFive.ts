export type Trait =
  | "openness"
  | "conscientiousness"
  | "extraversion"
  | "agreeableness"
  | "neuroticism";

interface QuestionInfo {
  trait: Trait;
  reverse: boolean;
}

const mapping: QuestionInfo[] = [
  { trait: "extraversion", reverse: false },
  { trait: "agreeableness", reverse: true },
  { trait: "conscientiousness", reverse: false },
  { trait: "neuroticism", reverse: true },
  { trait: "openness", reverse: false },
  { trait: "extraversion", reverse: true },
  { trait: "agreeableness", reverse: false },
  { trait: "conscientiousness", reverse: true },
  { trait: "neuroticism", reverse: false },
  { trait: "openness", reverse: true },
  { trait: "extraversion", reverse: false },
  { trait: "agreeableness", reverse: true },
  { trait: "conscientiousness", reverse: false },
  { trait: "neuroticism", reverse: true },
  { trait: "openness", reverse: false },
  { trait: "extraversion", reverse: true },
  { trait: "agreeableness", reverse: false },
  { trait: "conscientiousness", reverse: true },
  { trait: "neuroticism", reverse: false },
  { trait: "openness", reverse: true },
  { trait: "extraversion", reverse: false },
  { trait: "agreeableness", reverse: true },
  { trait: "conscientiousness", reverse: false },
  { trait: "neuroticism", reverse: true },
  { trait: "openness", reverse: false },
  { trait: "extraversion", reverse: true },
  { trait: "agreeableness", reverse: false },
  { trait: "conscientiousness", reverse: true },
  { trait: "neuroticism", reverse: true },
  { trait: "openness", reverse: true },
  { trait: "extraversion", reverse: false },
  { trait: "agreeableness", reverse: true },
  { trait: "conscientiousness", reverse: false },
  { trait: "neuroticism", reverse: true },
  { trait: "openness", reverse: false },
  { trait: "extraversion", reverse: true },
  { trait: "agreeableness", reverse: false },
  { trait: "conscientiousness", reverse: true },
  { trait: "neuroticism", reverse: true },
  { trait: "openness", reverse: false },
  { trait: "extraversion", reverse: false },
  { trait: "agreeableness", reverse: false },
  { trait: "conscientiousness", reverse: false },
  { trait: "neuroticism", reverse: true },
  { trait: "openness", reverse: false },
  { trait: "extraversion", reverse: true },
  { trait: "agreeableness", reverse: false },
  { trait: "conscientiousness", reverse: false },
  { trait: "neuroticism", reverse: true },
  { trait: "openness", reverse: false },
];

import { BigFiveScores } from "../types";

export function computeBigFiveRawScores(
  responses: Record<string, number>
): BigFiveScores {
  const sums: Record<Trait, number> = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0,
  };

  for (let i = 0; i < mapping.length; i++) {
    const { trait, reverse } = mapping[i];
    const value = Number(responses[`field${i + 1}`] ?? 3); // fallback to neutral
    const score = reverse ? 6 - value : value;
    sums[trait] += score;
  }

  return sums; // raw scores out of 50
}

export function complementRawScores(rawScores: BigFiveScores): BigFiveScores {
  return {
    openness: 50 - rawScores.openness,
    conscientiousness: 50 - rawScores.conscientiousness,
    extraversion: 50 - rawScores.extraversion,
    agreeableness: 50 - rawScores.agreeableness,
    neuroticism: 50 - rawScores.neuroticism,
  };
}
