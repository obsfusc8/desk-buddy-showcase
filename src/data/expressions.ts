import { ExpressionId, ExpressionMeta } from '../types';

export const EXPRESSIONS: Record<ExpressionId, ExpressionMeta> = {
  0: {
    id: 0,
    name: 'Default',
    description: 'Alert and attentive round eyes with neutral gentle gaze',
    moodCategory: 'neutral',
    color: '#38bdf8', // sky-400
  },
  1: {
    id: 1,
    name: 'Happy',
    description: 'Upward curved joyful crescents with sparkle particles',
    moodCategory: 'happy',
    color: '#4ade80', // green-400
  },
  2: {
    id: 2,
    name: 'Love',
    description: 'Beaming heart-shaped glowing eyes triggered when fully pet',
    moodCategory: 'happy',
    color: '#f43f5e', // rose-500
  },
  3: {
    id: 3,
    name: 'Star',
    description: 'Dazzling 4-point star eyes for excited achievements',
    moodCategory: 'happy',
    color: '#facc15', // yellow-400
  },
  4: {
    id: 4,
    name: 'Wink',
    description: 'Playful single-eye wink with cheerful eyebrow twitch',
    moodCategory: 'playful',
    color: '#a78bfa', // purple-400
  },
  5: {
    id: 5,
    name: 'Dizzy',
    description: 'Spiral spinning eyes when spun around or over-tapped',
    moodCategory: 'dramatic',
    color: '#fb923c', // orange-400
  },
  6: {
    id: 6,
    name: 'Angry',
    description: 'Sharply angled downward brows with intense focused stare',
    moodCategory: 'dramatic',
    color: '#ef4444', // red-500
  },
  7: {
    id: 7,
    name: 'Sad',
    description: 'Drooping downturned eyes when hungry or low affection',
    moodCategory: 'dramatic',
    color: '#60a5fa', // blue-400
  },
  8: {
    id: 8,
    name: 'Sleepy',
    description: 'Half-closed heavy eyelids drooping in low-energy state',
    moodCategory: 'resting',
    color: '#94a3b8', // slate-400
  },
  9: {
    id: 9,
    name: 'Surprised',
    description: 'Wide enlarged ovals with tiny dilated pupils',
    moodCategory: 'dramatic',
    color: '#2dd4bf', // teal-400
  },
  10: {
    id: 10,
    name: 'Smug',
    description: 'Half-lidded knowing smirk with raised eyebrow',
    moodCategory: 'playful',
    color: '#e879f9', // fuchsia-400
  },
  11: {
    id: 11,
    name: 'Nervous',
    description: 'Wobbly jittering pupils with a tiny sweat droplet',
    moodCategory: 'dramatic',
    color: '#38bdf8', // sky-400
  },
  12: {
    id: 12,
    name: 'Cat',
    description: 'Slitted cat pupils with triangular cute ear tufts',
    moodCategory: 'playful',
    color: '#fbbf24', // amber-400
  },
  13: {
    id: 13,
    name: 'Sleeping',
    description: 'Flat horizontal resting lines with floating zZZ particles',
    moodCategory: 'resting',
    color: '#64748b', // slate-500
  },
  14: {
    id: 14,
    name: 'Cute',
    description: 'Huge glossy anime pupils with triple highlight reflections',
    moodCategory: 'happy',
    color: '#f472b6', // pink-400
  },
};

export const BUILT_IN_QUOTES = [
  "Small steps every day lead to giant leaps.",
  "Focus on being productive instead of busy.",
  "Your time is limited, don't waste it.",
  "Code is poetry written with logic.",
  "Done is better than perfect.",
  "Stay curious. Keep building.",
  "Simplicity is the soul of efficiency.",
  "Make it work, make it right, make it fast.",
  "Deep focus turns ambition into reality.",
  "Hardware is hard. That's why it's fun.",
  "One good Pomodoro changes your whole day.",
  "Clear desk, clear mind, sharp code.",
  "Breathe. Hydrate. Then conquer the bug.",
  "Great things never come from comfort zones.",
  "Design is how it works, not just how it looks.",
  "The best way to predict the future is to invent it."
];
