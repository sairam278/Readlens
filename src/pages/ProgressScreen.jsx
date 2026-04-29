import { useState } from "react";
import { RANGE_DATA, HEATMAP, HEAT_COLORS, GOAL_PRESETS, recentDocs } from "../data/progress";

function CircleRing({ progress, size = 96, stroke = 8 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(1, progress));
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="var(--gold)"
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
    </svg>
  );
}

export default function ProgressScreen({ go }) {
  const [range, setRange]               = useState("month");
  const [selectedIdx, setSelectedIdx]   = useState(null);
  const [goalPreset, setGoalPreset]     = useState(1);
  const [showGoalPicker, setShowGoalPicker] = useState(false);

  const sessions = RANGE_DATA[range];
  const goal     = GOAL_PRESETS[goalPreset];

  const weekDocs        = 1;
  const weekChallenges  = 4;
  const docsProgress    = weekDocs / goal.docs;
  const chalProgress    = weekChallenges / goal.challenges;
  const overallProgress = (docsProgress + chalProgress) / 2;

  const selectedSession = selectedIdx !== null ? sessions[selectedIdx] : null;

  function handleBar(i) {
    setSelectedIdx(prev => (prev === i ? null : i));
  }

  return (
    <div className="px-8 py-8 max-w-[1000px] mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-xl font-bold text-ink mb-1">Learning Progress</h1>
        <p className="text-muted text-sm">Your understanding over time</p>
      </div>

      {/* ── Comprehension Chart ── */}
      <div className="bg-card border border-line rounded-2xl p-6 mb-5">
        {/* Header + range toggle */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h2 className="text-sm font-semibold text-ink">Comprehension Score</h2>
          <div className="flex gap-1 bg-surface border border-line rounded-lg p-1">
            {(["week", "month", "all"] ).map(r => (
              <button
                key={r}
                onClick={() => { setRange(r); setSelectedIdx(null); }}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  range === r ? "bg-gold text-[#1a1200]" : "text-muted hover:text-ink"
                }`}
              >
                {r === "week" ? "Week" : r === "month" ? "Month" : "All time"}
              </button>
            ))}
          </div>
        </div>

        {/* Bars */}
        <div className="flex items-end gap-2 h-[120px]">
          {sessions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleBar(i)}
              className={`flex-1 rounded-t-[5px] min-h-[8px] transition-all duration-300 ${
                selectedIdx !== null && selectedIdx !== i ? "opacity-35" : "opacity-100"
              } ${
                i === sessions.length - 1
                  ? "bg-[linear-gradient(to_top,#8A6A2A,#F0C97A)]"
                  : s.score >= 80
                  ? "bg-[linear-gradient(to_top,#1a6641,#3DD68C)]"
                  : "bg-[linear-gradient(to_top,#8A6A2A,#D4A853)]"
              }`}
              style={{ height: `${(s.score / 100) * 100}%` }}
              aria-label={`${s.date}: ${s.score}%`}
            />
          ))}
        </div>

        {/* Labels */}
        <div className="flex gap-2 mt-2">
          {sessions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleBar(i)}
              className={`flex-1 text-center text-[10px] transition-colors ${
                selectedIdx === i ? "text-gold font-semibold" : "text-muted"
              }`}
            >
              {s.date}
            </button>
          ))}
        </div>

        {/* Session detail card */}
        {selectedSession && (
          <div className="mt-4 p-4 bg-surface border border-gold/30 rounded-xl animate-fade-in">
            <div className="flex flex-wrap gap-4 items-start">
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-semibold text-gold mb-1 uppercase tracking-wider">
                  {selectedSession.date}
                </div>
                <div className="text-sm font-semibold text-ink truncate">{selectedSession.doc}</div>
              </div>
              <div className="flex gap-5 text-xs text-center shrink-0">
                <div>
                  <div className={`font-mono font-bold text-lg ${selectedSession.score >= 80 ? "text-emerald" : "text-gold"}`}>
                    {selectedSession.score}%
                  </div>
                  <div className="text-muted">Score</div>
                </div>
                <div>
                  <div className="font-mono font-bold text-lg text-ink">{selectedSession.duration}</div>
                  <div className="text-muted">Duration</div>
                </div>
                <div>
                  <div className="font-mono font-bold text-lg text-ink">{selectedSession.concepts}</div>
                  <div className="text-muted">Concepts</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legend + summary */}
        <div className="flex items-center gap-3 mt-3 text-xs text-muted flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-emerald/60" /> ≥80% Great
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-gold/60" /> Below 80% — Review
          </div>
          <div className="ml-auto text-[10px] italic opacity-60">Click a bar for details</div>
        </div>
        <div className="flex gap-6 mt-4 pt-4 border-t border-line flex-wrap">
          <div>
            <div className="font-mono font-bold text-xl text-gold">82%</div>
            <div className="text-xs text-muted">Current score</div>
          </div>
          <div>
            <div className="font-mono font-bold text-xl text-emerald">+20pt</div>
            <div className="text-xs text-muted">Growth this period</div>
          </div>
          <div>
            <div className="font-mono font-bold text-xl text-ink">91%</div>
            <div className="text-xs text-muted">Personal best</div>
          </div>
        </div>
      </div>

      {/* ── Streak heatmap + Weekly Goal ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">

        {/* Streak heatmap */}
        <div className="bg-card border border-line rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-ink">Daily Activity</h3>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold/10 border border-gold/25">
              <span className="text-sm">🔥</span>
              <span className="text-xs font-bold text-gold font-mono">14</span>
              <span className="text-xs text-muted">day streak</span>
            </div>
          </div>

          {/* 8 columns (weeks) × 7 rows (days) */}
          <div className="overflow-x-auto -mx-1 px-1">
          <div className="flex gap-[3px] min-w-[180px]">
            {Array.from({ length: 8 }, (_, week) => (
              <div key={week} className="flex flex-col gap-[3px] flex-1">
                {Array.from({ length: 7 }, (_, day) => {
                  const level = HEATMAP[week * 7 + day] ?? 0;
                  return (
                    <div
                      key={day}
                      className={`h-3 rounded-[2px] ${HEAT_COLORS[level]}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          </div>

          <div className="flex items-center gap-1.5 mt-3 text-[10px] text-muted">
            <span>Less</span>
            {HEAT_COLORS.map((c, i) => (
              <div key={i} className={`w-3 h-3 rounded-[2px] ${c}`} />
            ))}
            <span>More</span>
          </div>
          <div className="mt-2.5 text-xs text-muted">
            <span className="text-ink font-semibold">23</span> active days this month
          </div>
        </div>

        {/* Weekly Goal */}
        <div className="bg-card border border-line rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-ink">Weekly Goal</h3>
            <button
              onClick={() => setShowGoalPicker(v => !v)}
              className="text-xs text-gold hover:underline"
            >
              {showGoalPicker ? "Done" : "Change"}
            </button>
          </div>

          {showGoalPicker && (
            <div className="flex gap-2 mb-4 flex-wrap">
              {GOAL_PRESETS.map((g, i) => (
                <button
                  key={i}
                  onClick={() => { setGoalPreset(i); setShowGoalPicker(false); }}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all text-left ${
                    goalPreset === i
                      ? "bg-gold/15 border-gold text-gold"
                      : "border-line text-muted hover:border-gold/40"
                  }`}
                >
                  <div>{g.label}</div>
                  <div className="font-normal mt-0.5">{g.docs} docs · {g.challenges} challenges</div>
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-5">
            {/* Ring */}
            <div className="relative shrink-0">
              <CircleRing progress={overallProgress} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono font-bold text-gold text-sm">
                  {Math.round(overallProgress * 100)}%
                </span>
              </div>
            </div>

            {/* Progress bars */}
            <div className="flex flex-col gap-3 flex-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">Docs read</span>
                  <span className="font-semibold text-ink">{weekDocs}/{goal.docs}</span>
                </div>
                <div className="h-1.5 bg-line rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, docsProgress * 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">Challenges</span>
                  <span className="font-semibold text-ink">{weekChallenges}/{goal.challenges}</span>
                </div>
                <div className="h-1.5 bg-line rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, chalProgress * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-muted">
            Resets <span className="text-ink font-medium">Sunday</span>
            {" · "}<span className="text-ink font-medium">{goal.label}</span> goal
          </div>
        </div>
      </div>

      {/* ── Sub charts ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="bg-card border border-line rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-5 text-ink">Challenges Passed</h3>
          <div className="flex gap-2 items-end h-[80px]">
            {[3,4,2,5,4,6,5,7,5].map((v, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-[4px] min-h-[8px] bg-gold/50"
                style={{ height: `${(v / 7) * 100}%` }}
                title={`${v} passed`}
              />
            ))}
          </div>
          <div className="text-xs text-muted mt-2">
            Total: <span className="text-ink font-semibold">41 challenges passed</span>
          </div>
        </div>
        <div className="bg-card border border-line rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-5 text-ink">Concepts Mastered</h3>
          <div className="font-serif text-5xl text-gold font-extrabold leading-none">47</div>
          <div className="text-sm text-muted mt-2">concepts this month</div>
          <div className="mt-3.5">
            <span className="inline-flex items-center px-2.5 py-[3px] rounded-full text-xs font-semibold bg-emerald/10 text-emerald border border-emerald/25">
              +18 vs last month
            </span>
          </div>
        </div>
      </div>

      {/* ── Personal bests ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { icon: "🏆", val: "91%",     label: "Best comprehension score" },
          { icon: "🎯", val: "7/7",     label: "Perfect challenge score"  },
          { icon: "🔥", val: "14 days", label: "Learning streak"          },
        ].map(p => (
          <div key={p.label} className="bg-card border border-line rounded-xl p-4">
            <div className="text-2xl mb-2">{p.icon}</div>
            <div className="font-serif text-2xl font-bold text-gold">{p.val}</div>
            <div className="text-xs text-muted mt-0.5">{p.label}</div>
          </div>
        ))}
      </div>

      {/* ── Your next move ── */}
      <div className="bg-card border border-line rounded-2xl p-6 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base">🧭</span>
          <h2 className="text-sm font-semibold text-ink">Your next move</h2>
          <span className="ml-auto text-[10px] text-muted bg-surface border border-line rounded-full px-2 py-0.5">Based on your data</span>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-danger/[0.05] border border-danger/20">
            <span className="text-base shrink-0">⚠</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-ink mb-0.5">Revisit Positional Encoding</div>
              <div className="text-xs text-muted leading-[1.5]">You scored 45% on this concept in "Attention Is All You Need." Re-read Section 2 then retry the challenge.</div>
            </div>
            <button
              onClick={() => go("reading")}
              className="shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-gold text-bg hover:bg-gold-light transition-all cursor-pointer"
            >
              Go →
            </button>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-line">
            <span className="text-base shrink-0">📚</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-ink mb-0.5">Start "The Lean Startup"</div>
              <div className="text-xs text-muted leading-[1.5]">You've completed all Medium docs. This is an Easy read — good to balance your week before tackling harder material.</div>
            </div>
            <button
              onClick={() => go("docmap")}
              className="shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-surface text-muted border border-line hover:text-ink hover:border-muted transition-all cursor-pointer"
            >
              Start →
            </button>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-line">
            <span className="text-base shrink-0">🎯</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-ink mb-0.5">Finish this week's challenges</div>
              <div className="text-xs text-muted leading-[1.5]">4 of 10 challenges done. You need 6 more to hit your Medium goal — that's one doc read-through.</div>
            </div>
            <button
              onClick={() => go("quiz")}
              className="shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-surface text-muted border border-line hover:text-ink hover:border-muted transition-all cursor-pointer"
            >
              Quiz →
            </button>
          </div>
        </div>
      </div>

      {/* ── Recent docs ── */}
      <div>
        <h2 className="font-semibold text-sm mb-4 text-ink">Recent Documents</h2>
        <div className="flex flex-col gap-2">
          {recentDocs.map(d => (
            <div
              key={d.title}
              onClick={() => go("docmap")}
              className="flex items-center gap-4 bg-card border border-line rounded-xl p-4 cursor-pointer hover:border-gold/40 transition-all"
            >
              <div className="w-10 h-12 bg-gold/10 rounded-lg flex items-center justify-center text-xl shrink-0">{d.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold mb-1 text-ink truncate">{d.title}</div>
                <div className="text-xs text-muted">{d.concepts} concepts · {d.challenges} challenges passed</div>
              </div>
              <div className="shrink-0 text-right">
                <div className={`text-sm font-bold font-mono ${parseInt(d.score) >= 80 ? "text-emerald" : "text-gold"}`}>{d.score}</div>
                <div className="text-xs text-muted mt-0.5">{d.done ? "Complete" : "In progress"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
