// src/utils/aggregateBigFiveScores.ts

const fieldTraitMap = {
  1: { trait: "extraversion", reverse: false },
  2: { trait: "agreeableness", reverse: true },
  3: { trait: "conscientiousness", reverse: false },
  4: { trait: "neuroticism", reverse: false },
  5: { trait: "openness", reverse: false },
  6: { trait: "agreeableness", reverse: false },
  7: { trait: "conscientiousness", reverse: true },
  8: { trait: "extraversion", reverse: true },
  9: { trait: "neuroticism", reverse: true },
  10: { trait: "openness", reverse: true },
  11: { trait: "agreeableness", reverse: true },
  12: { trait: "conscientiousness", reverse: false },
  13: { trait: "extraversion", reverse: false },
  14: { trait: "neuroticism", reverse: false },
  15: { trait: "openness", reverse: false },
  16: { trait: "agreeableness", reverse: false },
  17: { trait: "conscientiousness", reverse: true },
  18: { trait: "extraversion", reverse: true },
  19: { trait: "neuroticism", reverse: true },
  20: { trait: "openness", reverse: true },
  21: { trait: "agreeableness", reverse: true },
  22: { trait: "conscientiousness", reverse: false },
  23: { trait: "extraversion", reverse: false },
  24: { trait: "neuroticism", reverse: false },
  25: { trait: "openness", reverse: false },
  26: { trait: "agreeableness", reverse: false },
  27: { trait: "conscientiousness", reverse: true },
  28: { trait: "extraversion", reverse: true },
  29: { trait: "neuroticism", reverse: true },
  30: { trait: "openness", reverse: true },
  31: { trait: "agreeableness", reverse: true },
  32: { trait: "conscientiousness", reverse: false },
  33: { trait: "extraversion", reverse: false },
  34: { trait: "neuroticism", reverse: false },
  35: { trait: "openness", reverse: false },
  36: { trait: "agreeableness", reverse: false },
  37: { trait: "conscientiousness", reverse: true },
  38: { trait: "extraversion", reverse: true },
  39: { trait: "neuroticism", reverse: true },
  40: { trait: "openness", reverse: true },
  41: { trait: "agreeableness", reverse: true },
  42: { trait: "conscientiousness", reverse: false },
  43: { trait: "extraversion", reverse: false },
  44: { trait: "neuroticism", reverse: false },
  45: { trait: "openness", reverse: false },
  46: { trait: "agreeableness", reverse: false },
  47: { trait: "conscientiousness", reverse: true },
  48: { trait: "extraversion", reverse: true },
  49: { trait: "neuroticism", reverse: true },
  50: { trait: "openness", reverse: true },
};

function avg(arr: number[]): number {
  return Math.round(arr.reduce((a, b) => a + b, 0));
}

export function aggregateBigFiveScores(formData: Record<string, number>) {
  const traits: Record<string, number[]> = {
    openness: [],
    conscientiousness: [],
    extraversion: [],
    agreeableness: [],
    neuroticism: [],
  };

  for (let i = 1; i <= 50; i++) {
    const { trait, reverse } = fieldTraitMap[i];
    const val = Number(formData[`field${i}`]);

    const score = reverse ? 6 - val : val;
    traits[trait].push(score);
  }

  return {
    openness: avg(traits.openness),
    conscientiousness: avg(traits.conscientiousness),
    extraversion: avg(traits.extraversion),
    agreeableness: avg(traits.agreeableness),
    neuroticism: avg(traits.neuroticism),
  };
}
