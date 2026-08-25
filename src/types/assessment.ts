export type DimensionKey = 'A' | 'B' | 'C' | 'D' | 'E';

export type QuestionId =
  | 'A1' | 'A2' | 'A3'
  | 'B1' | 'B2' | 'B3'
  | 'C1' | 'C2' | 'C3'
  | 'D1' | 'D2' | 'D3'
  | 'E1' | 'E2' | 'E3';

export type AnswerOption = {
  score: 0 | 1 | 2 | 3;
  label: string;
};

export type Question =
  | {
      id: QuestionId;
      dimension: DimensionKey;
      type: 'choice';
      prompt: string;
      options: AnswerOption[];
    }
  | {
      id: 'E2';
      dimension: 'E';
      type: 'text';
      prompt: string;
      placeholder: string;
    };

export type ChoiceAnswer = { id: QuestionId; type: 'choice'; score: 0 | 1 | 2 | 3 };
export type TextAnswer = { id: 'E2'; type: 'text'; value: string };
export type Answer = ChoiceAnswer | TextAnswer;

export type AnswersMap = Partial<Record<QuestionId, Answer>>;

export type DimensionSubscores = {
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
};

export type ProfileKey = 'running_on_memory' | 'patchwork' | 'connected_but_manual' | 'ready_to_automate';

export type Profile = {
  key: ProfileKey;
  name: string;
  summary: string;
  firstProject: string;
  scoreMin: number;
  scoreMax: number;
};

export type Result = {
  totalScore: number;
  subscores: DimensionSubscores;
  profile: Profile;
  weakest: Array<{ dimension: DimensionKey; label: string; oneLiner: string }>;
  handoffTask: string | null;
};

export type Submission = {
  id: string;
  session_id: string;
  created_at: string;
  completed_at: string | null;
  name: string | null;
  email: string | null;
  company: string | null;
  role: string | null;
  total_score: number | null;
  profile: string | null;
  dim_a: number | null;
  dim_b: number | null;
  dim_c: number | null;
  dim_d: number | null;
  dim_e: number | null;
  handoff_task: string | null;
  answers: Record<string, unknown>;
  source: string | null;
  user_agent: string | null;
};
