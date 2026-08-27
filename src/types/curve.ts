export type CurveAxis = 'U' | 'C';

export type CurveQuestionId =
  | 'U1' | 'U2' | 'U3' | 'U4' | 'U5'
  | 'C1' | 'C2' | 'C3' | 'C4' | 'C5'
  | 'C6';

export type CurveChoice = { score: 0 | 1 | 2 | 3; label: string };

export type CurveQuestion =
  | {
      id: CurveQuestionId;
      axis: CurveAxis;
      type: 'choice';
      prompt: string;
      options: CurveChoice[];
    }
  | {
      id: 'C6';
      axis: 'C';
      type: 'text';
      prompt: string;
      placeholder: string;
    };

export type CurveChoiceAnswer = { id: CurveQuestionId; type: 'choice'; score: 0 | 1 | 2 | 3 };
export type CurveTextAnswer = { id: 'C6'; type: 'text'; value: string };
export type CurveAnswer = CurveChoiceAnswer | CurveTextAnswer;
export type CurveAnswersMap = Partial<Record<CurveQuestionId, CurveAnswer>>;

export type CurveStageKey =
  | 'dread'
  | 'willing_stalled'
  | 'unconvinced'
  | 'experimenting'
  | 'fluent'
  | 'complying';

export type CurveStage = {
  key: CurveStageKey;
  name: string;
  paragraph: string;
};

export type CurveResult = {
  usageScore: number;      // 0..15
  confidenceScore: number; // 0..15
  stage: CurveStage;
  leadershipNote: string | null;
};

export type CurveResponseRow = {
  id: string;
  round_id: string | null;
  participant_hash: string | null;
  usage_score: number;
  confidence_score: number;
  stage: CurveStageKey;
  leadership_note: string | null;
  created_at: string;
  created_from: string | null;
  answers: Record<string, unknown>;
};

export type TeamRound = {
  id: string;
  round_number: number;
  label: string | null;
  opened_at: string;
  closed_at: string | null;
  response_count: number;
};

export type TeamView = {
  team: {
    id: string;
    code: string;
    name: string | null;
    created_at: string;
    is_demo?: boolean;
  };
  rounds: TeamRound[];
  responses: CurveResponseRow[];
};
