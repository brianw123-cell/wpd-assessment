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
 */
export async function startAssessment(
  answers: AnswersMap,
  meta: { source?: string; user_agent?: string } = {}
): Promise<string | null> {
  const sessionId = getOrCreateSessionId();
  if (!sessionId) return null;

  const existingRowId = getRowId();
  if (existingRowId) return existingRowId;

  const { data, error } = await supabase
    .from('assessments')
    .insert({
      session_id: sessionId,
      answers: answersToJson(answers),
      source: meta.source ?? null,
      user_agent: meta.user_agent ?? null,
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('startAssessment failed:', error);
    return null;
  }
  setRowId(data.id);
  return data.id;
}

/**
 * Save progress on the current row without submitting lead info.
 * Called after each choice so an abandon still leaves useful data.
 */
export async function saveProgress(answers: AnswersMap): Promise<void> {
  const rowId = getRowId();
  if (!rowId) return;
  const { error } = await supabase
    .from('assessments')
    .update({ answers: answersToJson(answers) })
    .eq('id', rowId);
  if (error) console.error('saveProgress failed:', error);
}

/**
 * Called when the user completes the email gate + gets their result.
 * Writes: lead fields, computed scores, profile, completed_at.
 */
export async function submitAssessment(args: {
  answers: AnswersMap;
  lead: { name: string; email: string; company: string; role: string };
  result: Result;
}): Promise<boolean> {
  const rowId = getRowId();
  if (!rowId) return false;

  const { lead, result, answers } = args;
  const { error } = await supabase
    .from('assessments')
    .update({
      completed_at: new Date().toISOString(),
      name: lead.name,
      email: lead.email,
      company: lead.company,
      role: lead.role,
      total_score: result.totalScore,
      profile: result.profile.key,
      dim_a: result.subscores.A,
      dim_b: result.subscores.B,
      dim_c: result.subscores.C,
      dim_d: result.subscores.D,
      dim_e: result.subscores.E,
      handoff_task: result.handoffTask,
      answers: answersToJson(answers),
    })
    .eq('id', rowId);

  if (error) {
    console.error('submitAssessment failed:', error);
    return false;
  }
  return true;
}

/** Admin-only: load all submissions ordered by created_at desc. */
export async function listSubmissions() {
  const { data, error } = await supabase
    .from('assessments')
    .select(
      'id, session_id, created_at, completed_at, name, email, company, role, total_score, profile, dim_a, dim_b, dim_c, dim_d, dim_e, handoff_task'
    )
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
