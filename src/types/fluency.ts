export type FluencyDim = 'J' | 'V' | 'D';

export type FluencyQuestionId =
  | 'J1' | 'J2' | 'J3' | 'J4'
  | 'V1' | 'V2' | 'V3' | 'V4'
  | 'D1' | 'D2' | 'D3' | 'D4';

export type FluencyChoice = { score: 0 | 1 | 2 | 3; label: string };

export type FluencyQuestion = {
  id: FluencyQuestionId;
  dim: FluencyDim;
  prompt: string;
  options: FluencyChoice[];
};

export type FluencyAnswer = { id: FluencyQuestionId; score: 0 | 1 | 2 | 3 };
export type FluencyAnswersMap = Partial<Record<FluencyQuestionId, FluencyAnswer>>;

export type FluencyLevelKey = 'unpracticed' | 'developing' | 'practiced' | 'fluent';

export type FluencyLevel = {
  key: FluencyLevelKey;
  name: string;
  paragraph: string;
};

export type FluencyResult = {
  judgment: number;      // 0..12
  verification: number;  // 0..12
  delegation: number;    // 0..12
  total: number;         // 0..36
  level: FluencyLevel;
  weakest: FluencyDim;
};

export type FluencyResponseRow = {
  id: string;
  round_id: string | null;
  participant_hash: string | null;
  judgment_score: number;
  verification_score: number;
  delegation_score: number;
  total_score: number;
  level: FluencyLevelKey;
  commitment: string | null;
  commitment_due: string | null;
  prior_commitment_outcome: string | null;
  created_at: string;
  created_from: string | null;
  answers: Record<string, unknown>;
};

export type FluencyRound = {
  id: string;
  round_number: number;
  label: string | null;
  opened_at: string;
  closed_at: string | null;
  response_count: number;
};

export type FluencyTeamView = {
  team: {
    id: string;
    code: string;
    name: string | null;
    created_at: string;
    is_demo?: boolean;
    fluency_definition?: string | null;
  };
  rounds: FluencyRound[];
  responses: FluencyResponseRow[];
};
