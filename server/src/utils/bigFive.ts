export type Trait = 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism';

interface QuestionInfo { trait: Trait; reverse: boolean; }

const mapping: QuestionInfo[] = [
  { trait: 'extraversion', reverse: false },
  { trait: 'agreeableness', reverse: true },
  { trait: 'conscientiousness', reverse: false },
  { trait: 'neuroticism', reverse: true },
  { trait: 'openness', reverse: false },
  { trait: 'extraversion', reverse: true },
  { trait: 'agreeableness', reverse: false },
  { trait: 'conscientiousness', reverse: true },
  { trait: 'neuroticism', reverse: false },
  { trait: 'openness', reverse: true },
  { trait: 'extraversion', reverse: false },
  { trait: 'agreeableness', reverse: true },
  { trait: 'conscientiousness', reverse: false },
  { trait: 'neuroticism', reverse: true },
  { trait: 'openness', reverse: false },
  { trait: 'extraversion', reverse: true },
  { trait: 'agreeableness', reverse: false },
  { trait: 'conscientiousness', reverse: true },
  { trait: 'neuroticism', reverse: false },
  { trait: 'openness', reverse: true },
  { trait: 'extraversion', reverse: false },
  { trait: 'agreeableness', reverse: true },
  { trait: 'conscientiousness', reverse: false },
  { trait: 'neuroticism', reverse: true },
  { trait: 'openness', reverse: false },
  { trait: 'extraversion', reverse: true },
  { trait: 'agreeableness', reverse: false },
  { trait: 'conscientiousness', reverse: true },
  { trait: 'neuroticism', reverse: true },
  { trait: 'openness', reverse: true },
  { trait: 'extraversion', reverse: false },
  { trait: 'agreeableness', reverse: true },
  { trait: 'conscientiousness', reverse: false },
  { trait: 'neuroticism', reverse: true },
  { trait: 'openness', reverse: false },
  { trait: 'extraversion', reverse: true },
  { trait: 'agreeableness', reverse: false },
  { trait: 'conscientiousness', reverse: true },
  { trait: 'neuroticism', reverse: true },
  { trait: 'openness', reverse: false },
  { trait: 'extraversion', reverse: false },
  { trait: 'agreeableness', reverse: false },
  { trait: 'conscientiousness', reverse: false },
  { trait: 'neuroticism', reverse: true },
  { trait: 'openness', reverse: false },
  { trait: 'extraversion', reverse: true },
  { trait: 'agreeableness', reverse: false },
  { trait: 'conscientiousness', reverse: false },
  { trait: 'neuroticism', reverse: true },
  { trait: 'openness', reverse: false },
];

import { BigFiveScores } from '../types';

export function computeBigFiveScores(responses: Record<string, number>): BigFiveScores {
    const sums: Record<Trait, number> = {
        openness: 0,
        conscientiousness: 0,
        extraversion: 0,
        agreeableness: 0,
        neuroticism: 0,
    };

    for (let i = 0; i < mapping.length; i++) {
        const q = mapping[i];
        const value = Number(responses[`field${i + 1}`]);
        if (!isNaN(value)) {
            const score = q.reverse ? 6 - value : value;
            sums[q.trait] += score;
        }
    }

    return {
        openness: sums.openness / 10,
        conscientiousness: sums.conscientiousness / 10,
        extraversion: sums.extraversion / 10,
        agreeableness: sums.agreeableness / 10,
        neuroticism: sums.neuroticism / 10,
    };
}

export function complementScores(scores: BigFiveScores): BigFiveScores {
    return {
        openness: 6 - scores.openness,
        conscientiousness: 6 - scores.conscientiousness,
        extraversion: 6 - scores.extraversion,
        agreeableness: 6 - scores.agreeableness,
        neuroticism: 6 - scores.neuroticism,
    };
}
