import type {
  FluencyAnswersMap,
  FluencyDim,
  FluencyLevel,
  FluencyLevelKey,
  FluencyResult,
} from '@/types/fluency';
import { FLUENCY_QUESTIONS } from './fluency-questions';

export const FLUENCY_LEVELS: Record<FluencyLevelKey, FluencyLevel> = {
  unpracticed: {
    key: 'unpracticed',
    name: 'Unpracticed',
    paragraph:
      "You haven't built habits around this yet, which is a starting point rather than a verdict. The useful first move isn't a course. It's picking one real task you do every week and running it through once, with someone around to ask.",
  },
  developing: {
    key: 'developing',
    name: 'Developing',
    paragraph:
      "You're using it and the habits are still forming. The gap at this stage is usually consistency: it works when you remember to reach for it, and you don't always remember. Making one use repeatable does more than learning a new trick.",
  },
  practiced: {
    key: 'practiced',
    name: 'Practiced',
    paragraph:
      "You reach for it deliberately, you check what comes back, and you've made real decisions about what to hand over. The next step isn't personal, it's collective: make one of your habits legible enough that a teammate could adopt it.",
  },
  fluent: {
    key: 'fluent',
    name: 'Fluent',
    paragraph:
      "You have a working model of what this is good and bad at, you verify in the right places rather than everywhere, and you delegate on purpose. You're the person your team should be learning from, and the highest-leverage thing you can do is teach one habit to one person.",
  },
};

export function scoreFluency(answers: FluencyAnswersMap): {
  judgment: number;
  verification: number;
  delegation: number;
  total: number;
} {
  let judgment = 0;
  let verification = 0;
  let delegation = 0;
  for (const q of FLUENCY_QUESTIONS) {
    const a = answers[q.id];
    if (!a) continue;
    if (q.dim === 'J') judgment += a.score;
    else if (q.dim === 'V') verification += a.score;
    else delegation += a.score;
  }
  return { judgment, verification, delegation, total: judgment + verification + delegation };
}

/**
 * Levels over a 0..36 total. Deliberately NOT usage-based — there is no
 * question in this instrument about how often you use a tool.
 */
export function levelFor(total: number): FluencyLevel {
  if (total <= 11) return FLUENCY_LEVELS.unpracticed;
  if (total <= 19) return FLUENCY_LEVELS.developing;
  if (total <= 28) return FLUENCY_LEVELS.practiced;
  return FLUENCY_LEVELS.fluent;
}

export function computeFluencyResult(answers: FluencyAnswersMap): FluencyResult {
  const { judgment, verification, delegation, total } = scoreFluency(answers);
  const pairs: Array<[FluencyDim, number]> = [
    ['J', judgment],
    ['V', verification],
    ['D', delegation],
  ];
  pairs.sort((a, b) => a[1] - b[1]);
  return {
    judgment,
    verification,
    delegation,
    total,
    level: levelFor(total),
    weakest: pairs[0][0],
  };
}

export function fluencyAnswersToJson(answers: FluencyAnswersMap): Record<string, number> {
  const out: Record<string, number> = {};
  for (const key of Object.keys(answers)) {
    const a = answers[key as keyof FluencyAnswersMap];
    if (a) out[a.id] = a.score;
  }
  return out;
}

/** Same one-way hash the change curve uses, so retakes match without storing emails. */
export async function participantHash(identifier: string, teamSalt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${identifier.trim().toLowerCase()}::${teamSalt}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
