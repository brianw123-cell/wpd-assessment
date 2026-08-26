import type {
  CurveAnswersMap,
  CurveResult,
  CurveStage,
  CurveStageKey,
} from '@/types/curve';
import { CURVE_QUESTIONS } from './curve-questions';

export const CURVE_STAGES: Record<CurveStageKey, CurveStage> = {
  dread: {
    key: 'dread',
    name: 'Dread',
    paragraph:
      "You're not using AI, and it doesn't feel good to think about. That's a common place to be right now, and it's not a character flaw. The next move isn't a tool or a workshop. It's a person you trust telling you honestly what it can and can't do, and what that means for you specifically.",
  },
  willing_stalled: {
    key: 'willing_stalled',
    name: 'Willing but stalled',
    paragraph:
      "You're open to it and you haven't started. Almost always this is a permission problem or a time problem, not a skills problem. One hour of protected time and one specific task to try it on is usually enough to break the log-jam.",
  },
  unconvinced: {
    key: 'unconvinced',
    name: 'Unconvinced',
    paragraph:
      "You've used AI enough to have an opinion, and the opinion is that it's overhyped. That's fair. The interesting question is whether you've tried it on a task you actually care about and know well — that's usually where the shift happens, or doesn't.",
  },
  experimenting: {
    key: 'experimenting',
    name: 'Experimenting',
    paragraph:
      "You're using AI, you feel fine about it, and you're figuring out what it's good and bad at as you go. This is exactly the right place to be a year in. The next step is to make one of your uses repeatable enough that a teammate could pick it up.",
  },
  fluent: {
    key: 'fluent',
    name: 'Fluent',
    paragraph:
      "You use AI regularly, you trust the output when you check it, and it's changed how you think about tasks. You're the person on your team who can teach one thing to one other person — and if you haven't yet, that's your highest-leverage move.",
  },
  complying: {
    key: 'complying',
    name: 'Complying',
    paragraph:
      "You use AI often, and you're not comfortable with it. You're doing what was asked of you and you don't fully trust it. That's not a personal problem — it's a management problem your leadership doesn't know they have. The safest thing you can do is name what specifically bothers you, out loud, to someone who'll listen.",
  },
};

export function scoreCurve(answers: CurveAnswersMap): {
  usageScore: number;
  confidenceScore: number;
} {
  let usage = 0;
  let confidence = 0;
  for (const q of CURVE_QUESTIONS) {
    if (q.type !== 'choice') continue;
    const a = answers[q.id];
    if (!a || a.type !== 'choice') continue;
    if (q.axis === 'U') usage += a.score;
    else confidence += a.score;
  }
  return { usageScore: usage, confidenceScore: confidence };
}

/**
 * Stage assignment per spec §3. Two-axis grid:
 *
 * Usage 0..4 + Confidence 0..5   → Dread
 * Usage 0..4 + Confidence 6..15  → Willing but stalled
 * Usage 5..9 + Confidence 0..7   → Unconvinced
 * Usage 5..9 + Confidence 8..15  → Experimenting
 * Usage 10..15 + Confidence 8..15 → Fluent
 * Usage 10..15 + Confidence 0..7  → Complying
 */
export function stageFor(usage: number, confidence: number): CurveStage {
  const u = clamp(usage, 0, 15);
  const c = clamp(confidence, 0, 15);
  if (u <= 4) {
    return c <= 5 ? CURVE_STAGES.dread : CURVE_STAGES.willing_stalled;
  }
  if (u <= 9) {
    return c <= 7 ? CURVE_STAGES.unconvinced : CURVE_STAGES.experimenting;
  }
  return c <= 7 ? CURVE_STAGES.complying : CURVE_STAGES.fluent;
}

export function computeCurveResult(answers: CurveAnswersMap): CurveResult {
  const { usageScore, confidenceScore } = scoreCurve(answers);
  const stage = stageFor(usageScore, confidenceScore);
  const c6 = answers.C6;
  const leadershipNote = c6 && c6.type === 'text' ? c6.value.trim() || null : null;
  return { usageScore, confidenceScore, stage, leadershipNote };
}

export function answersToJson(answers: CurveAnswersMap): Record<string, number | string> {
  const out: Record<string, number | string> = {};
  for (const key of Object.keys(answers)) {
    const a = answers[key as keyof CurveAnswersMap];
    if (!a) continue;
    if (a.type === 'text') out[a.id] = a.value;
    else out[a.id] = a.score;
  }
  return out;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

/**
 * SHA-256 hash of a lowercased+trimmed identifier (email or name) plus a team salt,
 * so retakes can match a participant across rounds without ever storing raw contact info.
 * Runs in the browser using SubtleCrypto.
 */
export async function participantHash(identifier: string, teamSalt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${identifier.trim().toLowerCase()}::${teamSalt}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
