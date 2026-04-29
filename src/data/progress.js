export const RANGE_DATA = {
  week: [
    { date: "Feb 13", doc: "Attention Is All You Need", duration: "31 min", concepts: 5, score: 82 },
    { date: "Today",  doc: "YC Application Guide",     duration: "22 min", concepts: 3, score: 82 },
  ],
  month: [
    { date: "Jan 2",  doc: "Series A Term Sheet",       duration: "18 min", concepts: 4, score: 62 },
    { date: "Jan 9",  doc: "YC Application Guide",      duration: "25 min", concepts: 6, score: 68 },
    { date: "Jan 16", doc: "Attention Is All You Need", duration: "34 min", concepts: 7, score: 71 },
    { date: "Jan 23", doc: "Series A Term Sheet",       duration: "28 min", concepts: 5, score: 74 },
    { date: "Jan 30", doc: "YC Application Guide",      duration: "20 min", concepts: 4, score: 70 },
    { date: "Feb 6",  doc: "Attention Is All You Need", duration: "42 min", concepts: 8, score: 79 },
    { date: "Feb 13", doc: "Attention Is All You Need", duration: "31 min", concepts: 5, score: 82 },
    { date: "Feb 20", doc: "Series A Term Sheet",       duration: "38 min", concepts: 9, score: 85 },
    { date: "Today",  doc: "YC Application Guide",      duration: "22 min", concepts: 3, score: 82 },
  ],
  all: [
    { date: "Oct 5",  doc: "ML Basics",                 duration: "15 min", concepts: 3, score: 45 },
    { date: "Oct 19", doc: "ML Basics",                 duration: "22 min", concepts: 4, score: 52 },
    { date: "Nov 2",  doc: "Python Guide",              duration: "28 min", concepts: 5, score: 58 },
    { date: "Nov 16", doc: "Series A Term Sheet",       duration: "18 min", concepts: 4, score: 62 },
    { date: "Dec 3",  doc: "YC Application Guide",      duration: "25 min", concepts: 6, score: 68 },
    { date: "Dec 17", doc: "Attention Is All You Need", duration: "34 min", concepts: 7, score: 71 },
    { date: "Jan 2",  doc: "Series A Term Sheet",       duration: "28 min", concepts: 5, score: 74 },
    { date: "Jan 16", doc: "YC Application Guide",      duration: "20 min", concepts: 4, score: 70 },
    { date: "Jan 30", doc: "Attention Is All You Need", duration: "42 min", concepts: 8, score: 79 },
    { date: "Feb 6",  doc: "Attention Is All You Need", duration: "31 min", concepts: 5, score: 82 },
    { date: "Feb 20", doc: "Series A Term Sheet",       duration: "38 min", concepts: 9, score: 85 },
    { date: "Today",  doc: "YC Application Guide",      duration: "22 min", concepts: 3, score: 82 },
  ],
};

export const HEATMAP = [
  0,0,1,2,1,0,0,
  0,1,2,3,2,1,0,
  1,2,3,4,3,2,1,
  0,0,1,2,3,2,0,
  0,1,2,3,4,3,1,
  1,2,3,4,4,3,2,
  0,1,2,3,4,4,2,
  1,2,3,4,4,3,0,
];

export const HEAT_COLORS = [
  "bg-line",
  "bg-gold/20",
  "bg-gold/40",
  "bg-gold/65",
  "bg-gold",
];

export const GOAL_PRESETS = [
  { docs: 1, challenges: 5,  label: "Light"   },
  { docs: 3, challenges: 10, label: "Medium"  },
  { docs: 5, challenges: 20, label: "Intense" },
];

export const recentDocs = [
  { title: "Attention Is All You Need", score: "82%", challenges: "2/3", concepts: 8,  icon: "📄", done: false },
  { title: "YC Application Guide",      score: "91%", challenges: "5/5", concepts: 14, icon: "📋", done: true  },
  { title: "Series A Term Sheet",       score: "67%", challenges: "2/4", concepts: 6,  icon: "📑", done: false },
];
