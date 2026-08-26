import { supabase } from './supabase';
import { answersToJson } from './curve-scoring';
import type { CurveAnswersMap, CurveResult, TeamView } from '@/types/curve';

export async function createTeam(args: {
  code: string;
  passphrase: string;
  name?: string;
}): Promise<{ ok: true; teamId: string; roundId: string; code: string } | { ok: false; error: string }> {
  const { data, error } = await supabase.rpc('create_team', {
    p_code: args.code,
    p_passphrase: args.passphrase,
    p_name: args.name ?? null,
  });
  if (error) return { ok: false, error: error.message };
  if (data && typeof data === 'object' && 'error' in data) {
    return { ok: false, error: String((data as { error: string }).error) };
  }
  const d = data as { team_id: string; round_id: string; code: string };
  return { ok: true, teamId: d.team_id, roundId: d.round_id, code: d.code };
}

export async function openNewRound(args: {
  code: string;
  passphrase: string;
  label?: string;
}): Promise<{ ok: true; roundId: string; roundNumber: number } | { ok: false; error: string }> {
  const { data, error } = await supabase.rpc('open_new_round', {
    p_code: args.code,
    p_passphrase: args.passphrase,
    p_label: args.label ?? null,
  });
  if (error) return { ok: false, error: error.message };
  if (data && typeof data === 'object' && 'error' in data) {
    return { ok: false, error: String((data as { error: string }).error) };
  }
  const d = data as { round_id: string; round_number: number };
  return { ok: true, roundId: d.round_id, roundNumber: d.round_number };
}

export async function submitCurveResponse(args: {
  teamCode: string | null;
  participantHash: string | null;
  answers: CurveAnswersMap;
  result: CurveResult;
  createdFrom?: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const { data, error } = await supabase.rpc('submit_curve_response', {
    p_team_code: args.teamCode,
    p_participant_hash: args.participantHash,
    p_usage: args.result.usageScore,
    p_confidence: args.result.confidenceScore,
    p_stage: args.result.stage.key,
    p_answers: answersToJson(args.answers),
    p_leadership_note: args.result.leadershipNote,
    p_created_from: args.createdFrom ?? 'individual',
  });
  if (error) return { ok: false, error: error.message };
  if (data && typeof data === 'object' && 'error' in data) {
    return { ok: false, error: String((data as { error: string }).error) };
  }
  const d = data as { id: string };
  return { ok: true, id: d.id };
}

export async function getTeamView(args: {
  code: string;
  passphrase: string;
}): Promise<{ ok: true; view: TeamView } | { ok: false; error: string }> {
  const { data, error } = await supabase.rpc('get_team_view', {
    p_code: args.code,
    p_passphrase: args.passphrase,
  });
  if (error) return { ok: false, error: error.message };
  if (data && typeof data === 'object' && 'error' in data) {
    return { ok: false, error: String((data as { error: string }).error) };
  }
  return { ok: true, view: data as TeamView };
}

export async function getBenchmarkDistribution(): Promise<{
  total: number;
  stages: Record<string, number>;
}> {
  const { data, error } = await supabase.rpc('get_benchmark_distribution');
  if (error) return { total: 0, stages: {} };
  const d = data as { total: number; stages: Record<string, number> } | null;
  return d ?? { total: 0, stages: {} };
}

export type AdminTeamRow = {
  id: string;
  code: string;
  name: string | null;
  created_at: string;
  rounds: number;
  total_responses: number;
};

/** Admin-only: list all teams with a round count and response count. */
export async function listTeamsForAdmin(): Promise<AdminTeamRow[]> {
  // teams and team_rounds are readable by authenticated (Brian) via RLS.
  // Curve responses are also readable, so we count client-side.
  const [teamsRes, roundsRes, responsesRes] = await Promise.all([
    supabase.from('teams').select('id, code, name, created_at').order('created_at', { ascending: false }),
    supabase.from('team_rounds').select('id, team_id'),
    supabase.from('curve_responses').select('id, team_id'),
  ]);
  if (teamsRes.error) throw teamsRes.error;
  const roundsByTeam = new Map<string, number>();
  (roundsRes.data ?? []).forEach((r: { team_id: string | null }) => {
    if (!r.team_id) return;
    roundsByTeam.set(r.team_id, (roundsByTeam.get(r.team_id) ?? 0) + 1);
  });
  const responsesByTeam = new Map<string, number>();
  (responsesRes.data ?? []).forEach((r: { team_id: string | null }) => {
    if (!r.team_id) return;
    responsesByTeam.set(r.team_id, (responsesByTeam.get(r.team_id) ?? 0) + 1);
  });
  return (teamsRes.data ?? []).map((t) => ({
    id: t.id,
    code: t.code,
    name: t.name,
    created_at: t.created_at,
    rounds: roundsByTeam.get(t.id) ?? 0,
    total_responses: responsesByTeam.get(t.id) ?? 0,
  }));
}
