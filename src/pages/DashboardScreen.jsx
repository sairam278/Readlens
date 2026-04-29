import { useState, useEffect, useMemo } from "react";
import { docs, statusBadge, diffColor, diffDot, FILTERS, SORTS, STATS } from "../data/documents";

function Sparkline({ data, positive = true }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const W = 44, H = 16;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * H}`).join(" ");
  const color = positive ? "var(--emerald)" : "var(--danger)";
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="opacity-75 shrink-0">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SkeletonStatCard() {
  return (
    <div className="bg-card border border-line rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="skeleton h-8 w-14 rounded-md" />
        <div className="skeleton h-4 w-10 rounded" />
      </div>
      <div className="skeleton h-3 w-28 rounded mb-2" />
      <div className="skeleton h-2.5 w-16 rounded" />
    </div>
  );
}

function SkeletonDocCard() {
  return (
    <div className="bg-card border border-line rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3.5">
        <div className="skeleton w-11 h-11 rounded-xl" />
        <div className="skeleton h-4 w-14 rounded-full" />
      </div>
      <div className="skeleton h-3.5 w-full rounded mb-1.5" />
      <div className="skeleton h-3 w-3/4 rounded mb-4" />
      <div className="skeleton h-3 w-16 rounded-full mb-2" />
      <div className="skeleton h-[5px] w-full rounded-full" />
    </div>
  );
}

const TOUR_STEPS = [
  { emoji: "👋", title: "Welcome to ReadLens!", desc: "Your AI reading coach. Let's do a quick tour of the key features — takes about 30 seconds." },
  { emoji: "📊", title: "Progress at a Glance", desc: "Live stats — concepts mastered, challenges passed, comprehension rate, and your learning streak. All update as you read." },
  { emoji: "▶️", title: "Resume Instantly", desc: "This banner always shows your most recent document so you pick up exactly where you left off." },
  { emoji: "🔍", title: "Search, Filter & Sort", desc: "Find any document by title. Filter by status, sort by progress or score, or switch between grid and list view." },
  { emoji: "📤", title: "Upload Any Document", desc: "Drop any PDF and ReadLens breaks it into sections with plain-English AI explanations and active-recall challenges." },
  { emoji: "⌨️", title: "Keyboard Shortcuts", desc: "Press ? anywhere to see all shortcuts. In reading view: F = Focus, S = Simplify, N = Notes, C = Challenge." },
];

export default function DashboardScreen({ go }) {
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("All");
  const [sortBy, setSortBy]     = useState("recent");
  const [sortOpen, setSortOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [tourStep, setTourStep] = useState(-1);

  // Simulate API load
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1400);
    return () => clearTimeout(t);
  }, []);

  // First-visit onboarding tour
  useEffect(() => {
    if (!localStorage.getItem("rl-onboarding-done")) {
      setTourStep(0);
    }
  }, []);

  const dismissTour = () => {
    setTourStep(-1);
    localStorage.setItem("rl-onboarding-done", "1");
  };

  const advanceTour = () => {
    if (tourStep >= TOUR_STEPS.length - 1) { dismissTour(); return; }
    setTourStep(s => s + 1);
  };

  const filtered = useMemo(() => {
    let list = docs.filter(d => {
      const matchFilter = filter === "All" || d.status === filter;
      const matchSearch = d.title.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
    if (sortBy === "progress") list = [...list].sort((a, b) => b.progress - a.progress);
    if (sortBy === "score")    list = [...list].sort((a, b) => b.score - a.score);
    if (sortBy === "alpha")    list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [search, filter, sortBy]);

  const activeSortLabel = SORTS.find(s => s.key === sortBy)?.label ?? "Recent";

  return (
    <div className="px-8 py-8 max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-5 flex-wrap gap-4">
        <div>
          <p className="text-xs text-muted mb-1">Good morning, Sairam 👋</p>
          <h1 className="font-serif text-xl font-bold text-ink mb-1">Your Library</h1>
          <p className="text-muted text-sm">5 documents · 2 in progress · <span className="text-gold font-semibold">🔥 14-day streak</span></p>
        </div>
        <div className="relative">
          {tourStep === 4 && (
            <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-gold z-10">
              <span className="beacon-ring absolute inset-0 rounded-full bg-gold" />
            </span>
          )}
          <button
            onClick={() => go("docmap")}
            className="bg-gold text-bg px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gold-light hover:-translate-y-px hover:shadow-md transition-all cursor-pointer"
          >
            + Upload Document
          </button>
        </div>
      </div>

      {/* Zeigarnik resume banner */}
      <div className="relative flex items-center justify-between gap-4 bg-gold/[0.07] border border-line rounded-xl px-4 py-3 mb-5">
        {tourStep === 2 && (
          <span className="absolute -top-2 left-6 w-4 h-4 rounded-full bg-gold z-10">
            <span className="beacon-ring absolute inset-0 rounded-full bg-gold" />
          </span>
        )}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-gold/15 rounded-lg flex items-center justify-center text-base shrink-0">📄</div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-ink truncate">Pick up where you left off — "Attention Is All You Need"</div>
            <div className="text-xs text-muted mt-0.5">Section 3 of 7 · 3 challenges remaining</div>
          </div>
        </div>
        <button
          onClick={() => go("reading")}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-gold text-bg hover:bg-gold-light transition-all cursor-pointer shrink-0"
        >
          Resume →
        </button>
      </div>

      {/* ── Next action card ── */}
      <div className="bg-card border border-line rounded-xl px-4 py-4 mb-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-lg shrink-0">🧭</div>
          <div className="min-w-0">
            <div className="text-[10px] text-muted uppercase tracking-widest font-semibold mb-0.5">Your focus this session</div>
            <div className="text-sm font-semibold text-ink leading-snug">
              Revisit <span className="text-gold">Positional Encoding</span> in "Attention Is All You Need" — you scored low here last time
            </div>
          </div>
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => go("reading")}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-gold text-bg hover:bg-gold-light transition-all cursor-pointer"
          >
            Go to Section →
          </button>
          <button
            onClick={() => go("quiz")}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-surface text-muted border border-line hover:text-ink hover:border-muted transition-all cursor-pointer"
          >
            🎯 Retry Quiz
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {tourStep === 1 && (
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gold z-10">
            <span className="beacon-ring absolute inset-0 rounded-full bg-gold" />
          </span>
        )}
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
          : STATS.map(s => (
              <div key={s.label} className="bg-card border border-line rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <div className="font-serif text-3xl font-bold text-gold leading-none">{s.val}</div>
                  <Sparkline data={s.spark} />
                </div>
                <div className="text-xs text-muted mt-1">{s.label}</div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-emerald text-[10px]">↑</span>
                  <span className="text-[10px] text-emerald">{s.delta}</span>
                </div>
              </div>
            ))}
      </div>

      {/* ── Search + Filter + Sort bar ── */}
      <div className="relative flex flex-wrap items-center gap-3 mb-4">
        {tourStep === 3 && (
          <span className="absolute -top-2 left-4 w-4 h-4 rounded-full bg-gold z-10">
            <span className="beacon-ring absolute inset-0 rounded-full bg-gold" />
          </span>
        )}
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm pointer-events-none">🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search documents…"
            className="w-full bg-surface border border-line rounded-xl pl-9 pr-4 py-2.5 text-sm text-ink placeholder:text-muted outline-none focus:border-gold-dim transition-colors font-sans"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-surface border border-line rounded-xl p-1 shrink-0">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer
                ${filter === f
                  ? "bg-card text-gold border border-line shadow-sm"
                  : "text-muted hover:text-ink border border-transparent"}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setSortOpen(o => !o)}
            className="flex items-center gap-2 px-3 py-2.5 bg-surface border border-line rounded-xl text-xs font-medium text-muted hover:text-ink transition-colors cursor-pointer"
          >
            <span>↕</span>
            <span>{activeSortLabel}</span>
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-[calc(100%+6px)] bg-card border border-line rounded-xl shadow-xl z-20 min-w-[120px] py-1 animate-fade-in">
              {SORTS.map(s => (
                <button
                  key={s.key}
                  onClick={() => { setSortBy(s.key); setSortOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors cursor-pointer
                    ${sortBy === s.key ? "text-gold" : "text-muted hover:text-ink"}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View toggle */}
        <div className="flex bg-surface border border-line rounded-xl p-1 shrink-0">
          {[
            { mode: "grid", icon: <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor"><rect x="0" y="0" width="5.5" height="5.5" rx="1"/><rect x="7.5" y="0" width="5.5" height="5.5" rx="1"/><rect x="0" y="7.5" width="5.5" height="5.5" rx="1"/><rect x="7.5" y="7.5" width="5.5" height="5.5" rx="1"/></svg> },
            { mode: "list", icon: <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="0" y1="2.5" x2="13" y2="2.5"/><line x1="0" y1="6.5" x2="13" y2="6.5"/><line x1="0" y1="10.5" x2="13" y2="10.5"/></svg> },
          ].map(v => (
            <button
              key={v.mode}
              onClick={() => setViewMode(v.mode)}
              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all cursor-pointer
                ${viewMode === v.mode ? "bg-card text-gold border border-line shadow-sm" : "text-muted hover:text-ink"}`}
            >
              {v.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      <p className="text-xs text-muted mb-3">
        {filtered.length === docs.length
          ? `${docs.length} documents`
          : `${filtered.length} of ${docs.length} documents`}
        {search && <span> matching <span className="text-ink">"{search}"</span></span>}
      </p>

      {/* Doc grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonDocCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">📭</div>
          <div className="font-semibold text-ink mb-1">No documents found</div>
          <div className="text-sm text-muted mb-4">Try a different search term or filter</div>
          <button
            onClick={() => { setSearch(""); setFilter("All"); }}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-gold text-bg hover:bg-gold-light transition-all cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      ) : viewMode === "list" ? (
        <div className="flex flex-col gap-2">
          {filtered.map(d => {
            const notStarted = d.status === "Not Started";
            return (
              <div
                key={d.title}
                onClick={() => go("docmap")}
                className={`bg-card border border-line rounded-xl px-4 py-3 cursor-pointer transition-all flex items-center gap-4 group shadow-sm
                  ${notStarted ? "opacity-75" : "hover:border-gold-dim hover:-translate-y-px hover:shadow-md"}`}
              >
                <div className="w-9 h-9 bg-gold/10 rounded-lg flex items-center justify-center text-lg shrink-0">{d.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-sm font-semibold text-ink group-hover:text-gold transition-colors truncate">{d.title}</div>
                    {d.weak.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-danger/10 text-danger border border-danger/20 shrink-0">
                        ⚠ {d.weak.length} weak {d.weak.length === 1 ? "concept" : "concepts"}
                      </span>
                    )}
                    {d.order !== null && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-accent/10 text-accent border border-accent/20 shrink-0">
                        Read {d.order === 1 ? "first" : "next"}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted">{d.pages} pages</div>
                </div>
                <span className={`hidden sm:inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface border border-line shrink-0 ${diffColor[d.diff]}`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${diffDot[d.diff]}`} />
                  {d.diff}
                </span>
                <span className={`hidden sm:inline-flex items-center px-2.5 py-[3px] rounded-full text-xs font-semibold shrink-0 ${statusBadge[d.status]}`}>
                  {d.status}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-20 bg-line rounded-full h-[4px]">
                    <div className={`h-full rounded-full ${d.status === "Completed" ? "bg-emerald" : "bg-gold"}`} style={{ width: `${d.progress}%` }} />
                  </div>
                  <span className="text-xs text-muted w-8 text-right">{d.progress}%</span>
                </div>
              </div>
            );
          })}
          <div
            onClick={() => go("docmap")}
            className="border-[1.5px] border-dashed border-line rounded-xl px-4 py-3 flex items-center gap-4 cursor-pointer transition-all hover:border-gold-dim hover:bg-gold/[0.03]"
          >
            <div className="w-9 h-9 flex items-center justify-center text-lg">📂</div>
            <div>
              <div className="text-sm font-semibold text-ink">Upload a document</div>
              <div className="text-xs text-muted">PDF · Up to 100MB · AI explains everything</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(d => {
            const notStarted = d.status === "Not Started";
            return (
            <div
              key={d.title}
              onClick={() => go("docmap")}
              className={`bg-card border border-line rounded-2xl p-5 cursor-pointer transition-all group shadow-sm
                ${notStarted ? "opacity-75" : "hover:border-gold-dim hover:-translate-y-0.5 hover:shadow-md"}`}
            >
              <div className="flex items-start justify-between mb-3.5">
                <div className="w-11 h-11 bg-gold/10 rounded-xl flex items-center justify-center text-[22px]">{d.icon}</div>
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface border border-line ${diffColor[d.diff]}`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${diffDot[d.diff]}`} />
                  {d.diff}
                </span>
              </div>
              <div className="text-sm font-semibold mb-1.5 leading-snug text-ink group-hover:text-gold transition-colors">{d.title}</div>
              <div className="text-xs text-muted mb-4">{d.pages} pages</div>
              <span className={`inline-flex items-center px-2.5 py-[3px] rounded-full text-xs font-semibold mb-2 ${statusBadge[d.status]}`}>
                {d.status}
              </span>
              <div className="bg-line rounded-full h-[5px] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-[width] duration-500 ${d.status === "Completed" ? "bg-emerald" : "bg-gold"}`}
                  style={{ width: `${d.progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted">
                <span>{d.progress}% understood</span>
                {d.score > 0 && <span className="text-emerald font-semibold">{d.score}% score</span>}
                {d.challenges > 0 && <span>{d.challenges} challenges</span>}
              </div>
              {d.weak.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {d.weak.map(w => (
                    <span key={w} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-danger/10 text-danger border border-danger/20">
                      ⚠ {w}
                    </span>
                  ))}
                </div>
              )}
              {d.order !== null && (
                <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-muted">
                  <span className="w-4 h-4 rounded-full bg-accent/15 text-accent flex items-center justify-center font-bold text-[9px] shrink-0">{d.order}</span>
                  Read this {d.order === 1 ? "first" : "next"} — builds on completed docs
                </div>
              )}
            </div>
            );
          })}

          {/* Upload zone */}
          <div
            onClick={() => go("docmap")}
            className="border-[1.5px] border-dashed border-line rounded-2xl p-8 text-center cursor-pointer transition-all hover:border-gold-dim hover:bg-gold/[0.03]"
          >
            <div className="text-3xl mb-2.5">📂</div>
            <div className="font-semibold text-sm mb-1 text-ink">Upload a document</div>
            <div className="text-xs text-muted">PDF · Up to 100MB</div>
            <div className="text-xs text-gold mt-2">AI will explain it to anyone</div>
          </div>
        </div>
      )}

      {/* ── Onboarding Tour ── */}
      {tourStep >= 0 && (
        <>
          {/* Backdrop (step 0 only — full attention) */}
          {tourStep === 0 && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in" />
          )}

          {/* Tour card */}
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-fade-in">
            <div className="bg-card border border-line rounded-2xl shadow-xl p-5">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl shrink-0 mt-0.5">{TOUR_STEPS[tourStep].emoji}</span>
                <div>
                  <div className="font-serif text-sm font-bold text-ink mb-1">{TOUR_STEPS[tourStep].title}</div>
                  <div className="text-xs text-muted leading-[1.6]">{TOUR_STEPS[tourStep].desc}</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                {/* Step dots */}
                <div className="flex gap-1.5">
                  {TOUR_STEPS.map((_, i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${i === tourStep ? "bg-gold" : "bg-line"}`}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={dismissTour}
                    className="px-3 py-1.5 rounded-lg text-xs text-muted hover:text-ink border border-transparent hover:border-line transition-all cursor-pointer"
                  >
                    Skip
                  </button>
                  <button
                    onClick={advanceTour}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-gold text-bg hover:bg-gold-light transition-all cursor-pointer"
                  >
                    {tourStep === TOUR_STEPS.length - 1 ? "Done!" : "Next →"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
