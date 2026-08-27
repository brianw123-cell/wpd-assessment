import { supabase, getOrCreateSessionId, getRowId, setRowId } from './supabase';
import type { AnswersMap, Result } from '@/types/assessment';

// Convert AnswersMap into the flat JSON we store in `answers`:
// { A1: 2, A2: 0, ..., E2: "unstuck admin" }
function answersToJson(answers: AnswersMap): Record<string, number | string> {
  const out: Record<string, number | string> = {};
  for (const key of Object.keys(answers)) {
    const a = answers[key as keyof AnswersMap];
    if (!a) continue;
    if (a.type === 'text') out[a.id] = a.value;
    else out[a.id] = a.score;
  }
  return out;
}

/**
 * Called the first time the user hits Next on question 1 (or if we want to
 * pre-create the row on landing). Persists the session so a page reload resumes.
 *
 * We generate the row's UUID on the client so the insert doesn't need to
 * SELECT the row back afterwards. Anon has no SELECT policy on `assessments`
 * (protects lead data), and chaining `.select()` on an insert triggers a
 * re-read anon can't do — Postgres reports that as an RLS violation on the
 * insert itself, which is what silently killed every submission until this fix.
 */
export async function startAssessment(
  answers: AnswersMap,
  meta: { source?: string; user_agent?: string } = {}
): Promise<string | null> {
  const sessionId = getOrCreateSessionId();
  if (!sessionId) return null;

  const existingRowId = getRowId();
  if (existingRowId) return existingRowId;

  const rowId = crypto.randomUUID();

  const { error } = await supabase.from('assessments').insert({
    id: rowId,
    session_id: sessionId,
    answers: answersToJson(answers),
    source: meta.source ?? null,
    user_agent: meta.user_agent ?? null,
  });

  if (error) {
    console.error('startAssessment failed:', error);
    return null;
  }
  setRowId(rowId);
  return rowId;
}

/**
 * Save progress on the current row without submitting lead info.
 * Uses a SECURITY DEFINER RPC because anon has no SELECT on assessments
 * (protects lead data), and PostgREST needs SELECT to locate rows for
 * update — a bare `.update()` silently affects zero rows.
 */
export async function saveProgress(answers: AnswersMap): Promise<void> {
  const rowId = getRowId();
  if (!rowId) return;
  const { error } = await supabase.rpc('save_readiness_progress', {
    p_row_id: rowId,
    p_answers: answersToJson(answers),
  });
  if (error) console.error('saveProgress failed:', error);
}

/**
 * Called when the user completes the email gate + gets their result.
 * Writes: lead fields, computed scores, profile, completed_at.
 * Uses a SECURITY DEFINER RPC for the same reason saveProgress does.
 */
export async function submitAssessment(args: {
  answers: AnswersMap;
  lead: { name: string; email: string; company: string; role: string };
  result: Result;
}): Promise<boolean> {
  const rowId = getRowId();
  if (!rowId) return false;

  const { lead, result, answers } = args;
  const { data, error } = await supabase.rpc('submit_readiness_assessment', {
    p_row_id: rowId,
    p_name: lead.name,
    p_email: lead.email,
    p_company: lead.company,
    p_role: lead.role,
    p_total_score: result.totalScore,
    p_profile: result.profile.key,
    p_dim_a: result.subscores.A,
    p_dim_b: result.subscores.B,
    p_dim_c: result.subscores.C,
    p_dim_d: result.subscores.D,
    p_dim_e: result.subscores.E,
    p_handoff_task: result.handoffTask,
    p_answers: answersToJson(answers),
  });

  if (error) {
    console.error('submitAssessment failed:', error);
    return false;
  }
  const matched = (data as { matched: number } | null)?.matched ?? 0;
  if (matched === 0) {
    console.warn('submitAssessment matched 0 rows for id', rowId);
    return false;
  }
  return true;
}

/** Admin-only: load all submissions ordered by created_at desc. */
export async function listSubmissions() {
  const { data, error } = await supabase
    .from('assessments')
    .select(
      'id, session_id, created_at, completed_at, name, email, company, role, total_score, profile, dim_a, dim_b, dim_c, dim_d, dim_e, handoff_task, answers, source'
    )
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
