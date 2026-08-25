import type {
  AnswersMap,
  DimensionKey,
  DimensionSubscores,
  Profile,
  ProfileKey,
  Result,
} from '@/types/assessment';
import { DIMENSIONS, QUESTIONS } from './questions';

/**
 * Scoring model
 *
 * - Each scored question is 0..3.
 * - Dimensions A, B, C, D each have three scored questions → subscore 0..9.
 * - Dimension E has two scored questions (E1, E3) plus one free-text (E2, unscored).
 *   Its raw sum is 0..6; we normalize to 0..9 so all five dimensions weigh equally
 *   in the total (0..45). See the spec's footnote in Dimension E for why.
 * - Total score = sum of five 0..9 subscores → 0..45.
 * - Profile is a function of total score alone.
 */

export function scoreAnswers(answers: AnswersMap): {
  totalScore: number;
  subscores: DimensionSubscores;
} {
  const dimRawTotals: Record<DimensionKey, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  const dimScoredCount: Record<DimensionKey, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };

  for (const q of QUESTIONS) {
    if (q.type !== 'choice') continue;
    const a = answers[q.id];
    if (!a || a.type !== 'choice') continue;
    dimRawTotals[q.dimension] += a.score;
    dimScoredCount[q.dimension] += 1;
  }

  // Normalize each dimension's raw total to a 0..9 range so every dimension
  // contributes equally to the 0..45 total, regardless of how many scored
  // questions it has.
  const normalize = (dim: DimensionKey): number => {
    const count = dimScoredCount[dim];
    if (count === 0) return 0;
    const maxRaw = count * 3; // each scored question is 0..3
    if (maxRaw === 9) return dimRawTotals[dim]; // already in target range
    return Math.round((dimRawTotals[dim] / maxRaw) * 9);
  };

  const subscores: DimensionSubscores = {
    A: normalize('A'),
    B: normalize('B'),
    C: normalize('C'),
    D: normalize('D'),
    E: normalize('E'),
  };

  const totalScore = subscores.A + subscores.B + subscores.C + subscores.D + subscores.E;
  return { totalScore, subscores };
}

export const PROFILES: Record<ProfileKey, Profile> = {
  running_on_memory: {
    key: 'running_on_memory',
    name: 'Running on memory',
    scoreMin: 0,
    scoreMax: 13,
    summary:
      'The business works because you hold it together personally. That is not a criticism — some of the most profitable contractors in the country are here. But AI is not the first move. The first move is getting the basics of the business out of your head and into one place.',
    firstProject:
      'Pick one workflow and write it down, then put job records in a single system. Everything else stacks on top of that.',
  },
  patchwork: {
    key: 'patchwork',
    name: 'Patchwork',
    scoreMin: 14,
    scoreMax: 24,
    summary:
      'You have software, but it does not talk to itself. People end up retyping the same information between systems, and that is where errors and missed follow-ups live.',
    firstProject:
      'Connect the two systems that cause the most double entry. Usually a one-week build. It pays for itself in retyping alone.',
  },
  connected_but_manual: {
    key: 'connected_but_manual',
    name: 'Connected but manual',
    scoreMin: 25,
    scoreMax: 34,
    summary:
      'Your information is largely in one place and reasonably current. The bottleneck now is that people still do the moving and the deciding — even when the rules are consistent enough that a system could do it.',
    firstProject:
      'Automate one repeating decision or handoff. Pick the one that happens most often, not the flashiest one.',
  },
  ready_to_automate: {
    key: 'ready_to_automate',
    name: 'Ready to automate',
    scoreMin: 35,
    scoreMax: 45,
    summary:
      'Clean data, repeatable process, a team that adopts new tools. This is the point where AI stops being a productivity aid and starts being an operator that can run a workflow end to end.',
    firstProject:
      'An agent that does one full job end to end, not a tool that assists a person. Pick a workflow you fully understand — you will be reviewing what it does at first.',
  },
};

export function profileFor(totalScore: number): Profile {
  const clamped = Math.max(0, Math.min(45, totalScore));
  if (clamped <= 13) return PROFILES.running_on_memory;
  if (clamped <= 24) return PROFILES.patchwork;
  if (clamped <= 34) return PROFILES.connected_but_manual;
  return PROFILES.ready_to_automate;
}

export function weakestDimensions(subscores: DimensionSubscores): Result['weakest'] {
  const entries = (Object.keys(subscores) as DimensionKey[]).map((dim) => ({
    dimension: dim,
    score: subscores[dim],
    label: DIMENSIONS[dim].short,
    oneLiner: DIMENSIONS[dim].oneLiner,
  }));
  // Sort ascending (lowest score = weakest). Stable enough for a UI.
  entries.sort((a, b) => a.score - b.score);
  return entries.slice(0, 2).map(({ dimension, label, oneLiner }) => ({
    dimension,
    label,
    oneLiner,
  }));
}

export function computeResult(answers: AnswersMap): Result {
  const { totalScore, subscores } = scoreAnswers(answers);
  const profile = profileFor(totalScore);
  const weakest = weakestDimensions(subscores);
  const e2 = answers.E2;
  const handoffTask = e2 && e2.type === 'text' ? e2.value.trim() || null : null;
  return { totalScore, subscores, profile, weakest, handoffTask };
}
