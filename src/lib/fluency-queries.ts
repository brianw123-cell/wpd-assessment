import { supabase } from './supabase';
import { fluencyAnswersToJson } from './fluency-scoring';
import type { FluencyAnswersMap, FluencyResult, FluencyTeamView } from '@/types/fluency';

export type PriorCommitment = {
  commitment: string;
  commitment_due: string | null;
  created_at: string;
};

export async function getPriorCommitment(args: {
  teamCode: string;
  participantHash: string;
}): Promise<PriorCommitment | null> {
  const { data, error } = await supabase.rpc('get_prior_commitment', {
    p_team_code: args.teamCode,
    p_participant_hash: args.participantHash,
  });
  if (error || !data) return null;
  return data as PriorCommitment;
}

export async function submitFluencyResponse(args: {
  teamCode: string | null;
  participantHash: string | null;
  answers: FluencyAnswersMap;
  result: FluencyResult;
  commitment: string | null;
  commitmentDue: string | null;
  priorOutcome: string | null;
  createdFrom?: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const { data, error } = await supabase.rpc('submit_fluency_response', {
    p_team_code: args.teamCode,
    p_participant_hash: args.participantHash,
    p_judgment: args.result.judgment,
    p_verification: args.result.verification,
    p_delegation: args.result.delegation,
    p_total: args.result.total,
    p_level: args.result.level.key,
    p_answers: fluencyAnswersToJson(args.answers),
    p_commitment: args.commitment,
    p_commitment_due: args.commitmentDue,
    p_prior_outcome: args.priorOutcome,
    p_created_from: args.createdFrom ?? 'individual',
  });
  if (error) return { ok: false, error: error.message };
  if (data && typeof data === 'object' && 'error' in data) {
    return { ok: false, error: String((data as { error: string }).error) };
  }
  return { ok: true, id: (data as { id: string }).id };
}

export async function getFluencyTeamView(args: {
  code: string;
  passphrase: string;
}): Promise<{ ok: true; view: FluencyTeamView } | { ok: false; error: string }> {
  const { data, error } = await supabase.rpc('get_fluency_team_view', {
    p_code: args.code,
    p_passphrase: args.passphrase,
  });
  if (error) return { ok: false, error: error.message };
  if (data && typeof data === 'object' && 'error' in data) {
    return { ok: false, error: String((data as { error: string }).error) };
  }
  return { ok: true, view: data as FluencyTeamView };
}
