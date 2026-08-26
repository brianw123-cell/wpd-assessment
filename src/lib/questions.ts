import type { Question, DimensionKey } from '@/types/assessment';

export const DIMENSIONS: Record<DimensionKey, { label: string; short: string; oneLiner: string }> = {
  A: {
    label: 'Where your information lives',
    short: 'Data foundation',
    oneLiner: "Getting the basics out of people's heads and into one place is the first move here.",
  },
  B: {
    label: 'How repeatable your work is',
    short: 'Process',
    oneLiner: 'The same job needs to move through the same steps before automation has anything to grab onto.',
  },
  C: {
    label: 'What software you already run',
    short: 'Tools',
    oneLiner: 'Connecting the systems you already pay for usually beats adding another one.',
  },
  D: {
    label: 'Your team',
    short: 'Adoption',
    oneLiner: 'The best tool goes nowhere if the people using it never adopt it. That is a fixable problem, but it is the problem.',
  },
  E: {
    label: 'Where your own time goes',
    short: 'Owner capacity',
    oneLiner: 'The hours you spend on the same tasks every week are the clearest signal of where automation would matter.',
  },
};

export const QUESTIONS: Question[] = [
  // Dimension A — Data foundation
  {
    id: 'A1',
    dimension: 'A',
    type: 'choice',
    prompt: 'If I asked you right now for a list of every deal or project you closed last month with the final dollar amount, how long would that take?',
    options: [
      { score: 3, label: "Under a minute, I'd pull it up" },
      { score: 2, label: 'Ten or fifteen minutes in a spreadsheet' },
      { score: 1, label: "An hour or so, I'd have to piece it together" },
      { score: 0, label: "I'd have to go through paperwork or ask someone" },
    ],
  },
  {
    id: 'A2',
    dimension: 'A',
    type: 'choice',
    prompt: 'Where do your customer records actually live?',
    options: [
      { score: 3, label: "One system everyone uses, and it's current" },
      { score: 2, label: 'One system, but people also keep their own spreadsheets' },
      { score: 1, label: "Spread across a few tools that don't talk to each other" },
      { score: 0, label: "Email, text messages, and people's heads" },
    ],
  },
  {
    id: 'A3',
    dimension: 'A',
    type: 'choice',
    prompt: 'When a project or customer situation goes sideways, can you reconstruct what happened from records?',
    options: [
      { score: 3, label: 'Yes, notes, messages, and timestamps are all in one place' },
      { score: 2, label: "Mostly, I'd have to dig through a couple of places" },
      { score: 1, label: 'Partially, a lot of it was verbal' },
      { score: 0, label: "No, we'd be going off memory" },
    ],
  },

  // Dimension B — Process
  {
    id: 'B1',
    dimension: 'B',
    type: 'choice',
    prompt: 'If your most experienced team member or manager quit tomorrow, how much of what they do is written down?',
    options: [
      { score: 3, label: 'Most of it, someone could pick it up from documentation' },
      { score: 2, label: "Some of it, we'd struggle for a few weeks" },
      { score: 1, label: "Very little, it's mostly in their head" },
      { score: 0, label: 'None of it, that would be a genuine crisis' },
    ],
  },
  {
    id: 'B2',
    dimension: 'B',
    type: 'choice',
    prompt: 'Does work move through the same steps every time, from first contact to final invoice?',
    options: [
      { score: 3, label: 'Yes, same steps, same order, every time' },
      { score: 2, label: 'Mostly, with exceptions we handle case by case' },
      { score: 1, label: "Loosely, it depends who's running it" },
      { score: 0, label: 'Every project is its own thing' },
    ],
  },
  {
    id: 'B3',
    dimension: 'B',
    type: 'choice',
    prompt: 'How much of your week goes to answering the same questions over and over?',
    options: [
      { score: 3, label: 'Almost none, people find their own answers' },
      { score: 2, label: 'An hour or two' },
      { score: 1, label: 'Several hours' },
      { score: 0, label: "That's most of what I do" },
    ],
  },

  // Dimension C — Tools
  {
    id: 'C1',
    dimension: 'C',
    type: 'choice',
    prompt: 'How many separate pieces of software does the business pay for?',
    options: [
      { score: 3, label: 'A handful, and I know what each one does' },
      { score: 2, label: 'Quite a few, some overlap' },
      { score: 1, label: "I'm not entirely sure" },
      { score: 0, label: 'Almost none, we run on paper and spreadsheets' },
    ],
  },
  {
    id: 'C2',
    dimension: 'C',
    type: 'choice',
    prompt: 'Do any of your systems pass information to each other automatically?',
    options: [
      { score: 3, label: 'Yes, several are connected' },
      { score: 2, label: 'One or two are connected' },
      { score: 1, label: 'No, we retype information between them' },
      { score: 0, label: "There's nothing to connect" },
    ],
  },
  {
    id: 'C3',
    dimension: 'C',
    type: 'choice',
    prompt: 'How does information get from wherever the work happens back to the people who need it?',
    options: [
      { score: 3, label: 'Through an app or system, automatically' },
      { score: 2, label: 'Photos, texts, or emails that someone enters later' },
      { score: 1, label: 'Paperwork or notes that come in at the end of the week' },
      { score: 0, label: 'Verbally, whenever we catch each other' },
    ],
  },

  // Dimension D — Adoption
  {
    id: 'D1',
    dimension: 'D',
    type: 'choice',
    prompt: "When you've rolled out new software before, how did it go?",
    options: [
      { score: 3, label: 'Went fine, people use it' },
      { score: 2, label: 'Rocky at first, but it stuck' },
      { score: 1, label: 'Some people use it, some never did' },
      { score: 0, label: "It didn't stick, we went back to the old way" },
    ],
  },
  {
    id: 'D2',
    dimension: 'D',
    type: 'choice',
    prompt: 'Has anyone on your team used an AI tool for work, even once?',
    options: [
      { score: 3, label: 'Several people use one regularly' },
      { score: 2, label: 'One or two people have tried it' },
      { score: 1, label: "I've tried it, nobody else has" },
      { score: 0, label: 'Not that I know of' },
    ],
  },
  {
    id: 'D3',
    dimension: 'D',
    type: 'choice',
    prompt: 'If a new tool required thirty minutes of training per person, could you make that happen?',
    options: [
      { score: 3, label: 'Yes, we have a way to train people' },
      { score: 2, label: 'Probably, it would take some scheduling' },
      { score: 1, label: "It would be hard, everyone's on jobs" },
      { score: 0, label: "No, there's no time for that" },
    ],
  },

  // Dimension E — Owner capacity
  {
    id: 'E1',
    dimension: 'E',
    type: 'choice',
    prompt: 'How many hours a week do you personally spend on paperwork, scheduling, or chasing information?',
    options: [
      { score: 3, label: 'Under five' },
      { score: 2, label: 'Five to fifteen' },
      { score: 1, label: 'Fifteen to thirty' },
      { score: 0, label: "More than thirty, it's most of my job" },
    ],
  },
  {
    id: 'E2',
    dimension: 'E',
    type: 'text',
    prompt: "What's the one task you'd hand off tomorrow if you could?",
    placeholder: 'A sentence or two. Free form.',
  },
  {
    id: 'E3',
    dimension: 'E',
    type: 'choice',
    prompt: "What's driving you to look at this right now?",
    options: [
      { score: 3, label: "We're growing and the current way won't scale" },
      { score: 2, label: "Something specific broke and I'm fixing it" },
      { score: 1, label: 'Curious, no urgency' },
      { score: 0, label: 'Someone told me I should look into AI' },
    ],
  },
];

export const TOTAL_QUESTIONS = QUESTIONS.length;
export const MAX_SCORE = 45; // 15 scored questions × 3 max (E2 is unscored)
