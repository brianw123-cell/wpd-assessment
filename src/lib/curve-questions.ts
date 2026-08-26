import type { CurveQuestion } from '@/types/curve';

export const CURVE_QUESTIONS: CurveQuestion[] = [
  // Usage axis
  {
    id: 'U1',
    axis: 'U',
    type: 'choice',
    prompt: 'In the last week, how many times did you use an AI tool for actual work?',
    options: [
      { score: 3, label: 'Most days' },
      { score: 2, label: 'A few times' },
      { score: 1, label: 'Once' },
      { score: 0, label: 'Not at all' },
    ],
  },
  {
    id: 'U2',
    axis: 'U',
    type: 'choice',
    prompt: "What's the most involved thing you've used it for?",
    options: [
      { score: 3, label: "Something I'd have needed hours or another person to do" },
      { score: 2, label: 'A real piece of work, like a first draft or analysis' },
      { score: 1, label: 'Small stuff, rewording or summarizing' },
      { score: 0, label: "I haven't used it for work" },
    ],
  },
  {
    id: 'U3',
    axis: 'U',
    type: 'choice',
    prompt: 'Is AI part of any task you do on a repeating basis?',
    options: [
      { score: 3, label: 'Yes, several' },
      { score: 2, label: 'Yes, one' },
      { score: 1, label: 'Not yet, but I can name one it would fit' },
      { score: 0, label: 'No' },
    ],
  },
  {
    id: 'U4',
    axis: 'U',
    type: 'choice',
    prompt: 'Have you shown anyone else on your team something you figured out?',
    options: [
      { score: 3, label: 'Yes, more than once' },
      { score: 2, label: 'Once' },
      { score: 1, label: 'No, but I would if asked' },
      { score: 0, label: 'No' },
    ],
  },
  {
    id: 'U5',
    axis: 'U',
    type: 'choice',
    prompt: 'When a new task shows up, does AI come to mind as an option?',
    options: [
      { score: 3, label: "Usually, it's my first thought" },
      { score: 2, label: 'Sometimes' },
      { score: 1, label: "Rarely, only when I'm stuck" },
      { score: 0, label: 'Never' },
    ],
  },

  // Confidence axis
  {
    id: 'C1',
    axis: 'C',
    type: 'choice',
    prompt: 'How do you feel when AI comes up in a work conversation?',
    options: [
      { score: 3, label: 'Interested' },
      { score: 2, label: 'Neutral' },
      { score: 1, label: 'Uneasy' },
      { score: 0, label: "I'd rather it didn't" },
    ],
  },
  {
    id: 'C2',
    axis: 'C',
    type: 'choice',
    prompt: 'How worried are you about what AI means for your job specifically?',
    options: [
      { score: 3, label: 'Not worried' },
      { score: 2, label: 'A little, but it feels manageable' },
      { score: 1, label: 'Fairly worried' },
      { score: 0, label: 'Very worried' },
    ],
  },
  {
    id: 'C3',
    axis: 'C',
    type: 'choice',
    prompt: 'Do you trust the output enough to put your name on it?',
    options: [
      { score: 3, label: 'Yes, after I check it' },
      { score: 2, label: 'For low-stakes work only' },
      { score: 1, label: 'Not really' },
      { score: 0, label: 'No' },
    ],
  },
  {
    id: 'C4',
    axis: 'C',
    type: 'choice',
    prompt: 'If you spent an hour of work time learning an AI tool, how would that feel?',
    options: [
      { score: 3, label: "Fine, that's clearly part of the job now" },
      { score: 2, label: "A bit guilty but I'd do it" },
      { score: 1, label: "I couldn't justify it" },
      { score: 0, label: "I'd be worried how it looked" },
    ],
  },
  {
    id: 'C5',
    axis: 'C',
    type: 'choice',
    prompt: 'Could you say out loud at work that AI makes you uncomfortable?',
    options: [
      { score: 3, label: 'Yes, easily' },
      { score: 2, label: 'To my manager, privately' },
      { score: 1, label: 'Probably not' },
      { score: 0, label: 'Definitely not' },
    ],
  },

  // Free-text, unscored
  {
    id: 'C6',
    axis: 'C',
    type: 'text',
    prompt: "What's the one thing about AI at work you'd want leadership to understand?",
    placeholder: 'A sentence or two. Anonymous. Free form.',
  },
];

export const CURVE_TOTAL_QUESTIONS = CURVE_QUESTIONS.length; // 11
export const CURVE_SCORED_QUESTIONS = CURVE_QUESTIONS.filter(q => q.type === 'choice').length; // 10
