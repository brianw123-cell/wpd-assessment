import type { FluencyQuestion, FluencyDim } from '@/types/fluency';

export const DIMENSIONS: Record<FluencyDim, { key: FluencyDim; name: string; blurb: string }> = {
  J: {
    key: 'J',
    name: 'Judgment',
    blurb: 'Knowing when this is the right tool for the job, and when it plainly is not.',
  },
  V: {
    key: 'V',
    name: 'Verification',
    blurb: 'Checking the output before you put your name on it, and knowing how to check it.',
  },
  D: {
    key: 'D',
    name: 'Delegation',
    blurb: 'Deciding on purpose what you hand over and what stays yours.',
  },
};

// Behavior questions, not usage counts. Nothing here asks how many tools you use,
// how often you use them, or how many tokens you spent. That is the whole point:
// a company that defines fluency as behavior needs an instrument that measures
// behavior, and a usage dashboard cannot do it.
export const FLUENCY_QUESTIONS: FluencyQuestion[] = [
  // Judgment
  {
    id: 'J1',
    dim: 'J',
    prompt: 'When a new task lands on you, how do you decide whether to use AI on it?',
    options: [
      { score: 3, label: "I have a rough sense of what it's good and bad at, and I use that" },
      { score: 2, label: 'I try it and back out if the result is poor' },
      { score: 1, label: 'I use it when I feel stuck' },
      { score: 0, label: "I don't really weigh it either way" },
    ],
  },
  {
    id: 'J2',
    dim: 'J',
    prompt: 'Can you name a task in your job where you deliberately do NOT use AI?',
    options: [
      { score: 3, label: 'Yes, and I could tell you exactly why' },
      { score: 2, label: 'Yes, roughly' },
      { score: 1, label: "I haven't thought about it that way" },
      { score: 0, label: "I don't use it enough for that question to apply" },
    ],
  },
  {
    id: 'J3',
    dim: 'J',
    prompt: 'When the output is confidently wrong, what usually happens?',
    options: [
      { score: 3, label: 'I catch it, because I know where it tends to go wrong' },
      { score: 2, label: 'I catch it, because I check everything' },
      { score: 1, label: "I've been caught out by it before" },
      { score: 0, label: "I wouldn't necessarily know" },
    ],
  },
  {
    id: 'J4',
    dim: 'J',
    prompt: 'How would you describe what these tools are actually doing?',
    options: [
      { score: 3, label: "I can explain roughly why they're good at some things and bad at others" },
      { score: 2, label: 'I have a working mental model that holds up most of the time' },
      { score: 1, label: 'Honestly, it feels like magic' },
      { score: 0, label: "I've never thought about it" },
    ],
  },

  // Verification
  {
    id: 'V1',
    dim: 'V',
    prompt: 'Before you send on something AI helped produce, what do you do?',
    options: [
      { score: 3, label: 'I check the specific parts most likely to be wrong' },
      { score: 2, label: 'I read the whole thing carefully' },
      { score: 1, label: 'I skim it' },
      { score: 0, label: 'I usually send it as-is' },
    ],
  },
  {
    id: 'V2',
    dim: 'V',
    prompt: 'When it gives you a fact, a number, or a source, do you check it?',
    options: [
      { score: 3, label: 'Always, and I know which claims need checking hardest' },
      { score: 2, label: 'Usually' },
      { score: 1, label: 'When it matters a lot' },
      { score: 0, label: 'Rarely' },
    ],
  },
  {
    id: 'V3',
    dim: 'V',
    prompt: 'Would you put your name on AI-assisted work as your own?',
    options: [
      { score: 3, label: "Yes, once I've checked it. It's my work either way" },
      { score: 2, label: 'Yes for low-stakes work' },
      { score: 1, label: 'It makes me uneasy' },
      { score: 0, label: 'No' },
    ],
  },
  {
    id: 'V4',
    dim: 'V',
    prompt: 'Do you know what your organization considers off-limits to put into an AI tool?',
    options: [
      { score: 3, label: 'Yes, clearly, and I follow it' },
      { score: 2, label: 'Roughly' },
      { score: 1, label: "I've guessed at it" },
      { score: 0, label: "I don't think we've said" },
    ],
  },

  // Delegation
  {
    id: 'D1',
    dim: 'D',
    prompt: 'Have you moved a recurring part of your job over to AI on purpose?',
    options: [
      { score: 3, label: 'Yes, more than one, and they run that way now' },
      { score: 2, label: 'Yes, one' },
      { score: 1, label: 'Not yet, but I can name one that would fit' },
      { score: 0, label: 'No' },
    ],
  },
  {
    id: 'D2',
    dim: 'D',
    prompt: 'Is there work you keep for yourself specifically because it should stay human?',
    options: [
      { score: 3, label: "Yes, and I've decided that deliberately" },
      { score: 2, label: 'Yes, though more by instinct' },
      { score: 1, label: "I haven't drawn that line" },
      { score: 0, label: "The question doesn't really come up for me" },
    ],
  },
  {
    id: 'D3',
    dim: 'D',
    prompt: 'When you hand something over, how do you set it up?',
    options: [
      { score: 3, label: 'I give it real context and examples, and reuse that setup' },
      { score: 2, label: 'I write a careful prompt each time' },
      { score: 1, label: 'I type a sentence and see what happens' },
      { score: 0, label: "I haven't handed anything over" },
    ],
  },
  {
    id: 'D4',
    dim: 'D',
    prompt: 'Has anyone else picked up something you worked out?',
    options: [
      { score: 3, label: "Yes, I've shown someone and they use it" },
      { score: 2, label: "I've shared it, not sure if it stuck" },
      { score: 1, label: 'No, but I would if asked' },
      { score: 0, label: 'No' },
    ],
  },
];
