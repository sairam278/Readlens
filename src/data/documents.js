export const docs = [
  { title: "Attention Is All You Need",          pages: 15, progress: 72,  score: 82,  status: "In Progress", diff: "Advanced", icon: "📄", challenges: 3, weak: ["Positional Encoding"],               order: null },
  { title: "Y Combinator Application Guide 2024",pages:  8, progress: 100, score: 91,  status: "Completed",   diff: "Medium",   icon: "📋", challenges: 5, weak: [],                                    order: null },
  { title: "The Lean Startup — Chapter 5–8",     pages: 44, progress: 18,  score: 0,   status: "Not Started", diff: "Easy",     icon: "📚", challenges: 0, weak: [],                                    order: 1    },
  { title: "Series A Term Sheet — Draft v3",     pages: 22, progress: 55,  score: 67,  status: "In Progress", diff: "Advanced", icon: "📑", challenges: 2, weak: ["Liquidation Preference", "Pro-rata"], order: null },
  { title: "IPCC Climate Report Summary",        pages: 36, progress:  0,  score: 0,   status: "Not Started", diff: "Advanced", icon: "🌍", challenges: 0, weak: [],                                    order: 2    },
];

export const statusBadge = {
  "Completed":   "bg-emerald/10 text-emerald border border-emerald/25",
  "In Progress": "bg-gold/15 text-gold border border-gold/30",
  "Not Started": "bg-accent/10 text-accent border border-accent/25",
};

export const diffColor = {
  "Easy":     "text-emerald",
  "Medium":   "text-gold",
  "Advanced": "text-accent",
};

export const diffDot = {
  "Easy":     "bg-emerald",
  "Medium":   "bg-gold",
  "Advanced": "bg-accent",
};

export const FILTERS = ["All", "In Progress", "Completed", "Not Started"];

export const SORTS = [
  { label: "Recent",   key: "recent" },
  { label: "Progress", key: "progress" },
  { label: "Score",    key: "score" },
  { label: "A–Z",      key: "alpha" },
];

export const STATS = [
  { val: "47",  label: "Concepts mastered",   delta: "+12 this week", spark: [20, 25, 28, 24, 33, 38, 47] },
  { val: "23",  label: "Challenges passed",   delta: "+5 this week",  spark: [12, 14, 13, 17, 20, 21, 23] },
  { val: "91%", label: "Avg comprehension",   delta: "+8% vs last",   spark: [75, 79, 77, 83, 86, 88, 91] },
  { val: "14",  label: "Day learning streak", delta: "personal best",  spark: [8, 9, 10, 11, 12, 13, 14] },
];
