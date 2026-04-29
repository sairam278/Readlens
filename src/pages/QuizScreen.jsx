import { useState, useEffect } from "react";
import { CONFETTI_COLORS, DELAYS } from "../constants";
import { ALL_CHALLENGES } from "../data/challenges";

function ProgressCircle({ index, currentIdx, results }) {
  const done = results[index] !== undefined;
  const active = index === currentIdx;
  if (done) {
    return (
      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${results[index] ? "bg-emerald" : "bg-danger"}`}>
        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
          {results[index]
            ? <path d="M1.5 5l3 3 6-6" stroke="var(--bg)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            : <path d="M2 2l8 8M10 2l-8 8" stroke="var(--bg)" strokeWidth="1.8" strokeLinecap="round" />
          }
        </svg>
      </div>
    );
  }
  if (active) {
    return (
      <div className="w-7 h-7 rounded-full bg-gold flex items-center justify-center text-bg text-xs font-bold shadow-[0_0_12px_rgba(212,168,83,0.4)]">
        {index + 1}
      </div>
    );
  }
  return (
    <div className="w-7 h-7 rounded-full border border-line flex items-center justify-center text-muted text-xs font-medium">
      {index + 1}
    </div>
  );
}

export default function QuizScreen({ go, weakConcepts = [], onComplete }) {
  // Weak concept questions come first
  const challenges = [...ALL_CHALLENGES].sort((a, b) => {
    const aWeak = weakConcepts.includes(a.concept) ? 0 : 1;
    const bWeak = weakConcepts.includes(b.concept) ? 0 : 1;
    return aWeak - bWeak;
  });

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [shake, setShake] = useState(false);
  const [confetti, setConfetti] = useState([]);
  const [results, setResults] = useState({});

  const current = challenges[currentIdx];
  const isLast = currentIdx === challenges.length - 1;

  const handleSubmit = () => {
    if (selected === null || answered) return;
    const isCorrect = selected === current.correct;
    setAnswered(true);
    setResults(prev => ({ ...prev, [currentIdx]: isCorrect }));
    if (isCorrect) {
      const pieces = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        left: `${4 + (i * 4.8) % 92}%`,
        delay: `${(i * 0.07) % 0.65}s`,
        size: `${6 + (i % 3) * 2}px`,
        round: i % 3 === 0,
      }));
      setConfetti(pieces);
      setTimeout(() => setConfetti([]), DELAYS.CONFETTI);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), DELAYS.SHAKE);
    }
  };

  const handleNext = () => {
    if (isLast) {
      const conceptResults = {};
      challenges.forEach((ch, i) => {
        conceptResults[ch.concept] = results[i] ? 100 : 0;
      });
      onComplete?.(conceptResults);
      go("summary");
    } else {
      setCurrentIdx(i => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (answered) {
        if (e.key === "Enter") handleNext();
        return;
      }
      if (e.key === "1") setSelected(0);
      else if (e.key === "2") setSelected(1);
      else if (e.key === "3") setSelected(2);
      else if (e.key === "4") setSelected(3);
      else if (e.key === "Enter") handleSubmit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answered, selected, currentIdx]);

  const optionClass = (i) => {
    const base = "p-4 rounded-xl border text-sm cursor-pointer transition-all bg-card flex gap-3 items-start select-none";
    if (answered && i === current.correct)
      return `${base} border-emerald bg-emerald/[0.08] text-emerald`;
    if (answered && i === selected && i !== current.correct)
      return `${base} border-danger bg-danger/[0.08] text-danger ${shake ? "animate-shake" : ""}`;
    if (!answered && i === selected)
      return `${base} border-gold bg-gold/[0.08] text-gold`;
    return `${base} border-line text-ink hover:border-gold-dim hover:bg-gold/[0.04]`;
  };

  return (
    <div className="px-5 py-8 flex flex-col items-center min-h-[60vh] bg-bg">

      {confetti.length > 0 && (
        <div className="fixed top-0 left-0 right-0 h-48 pointer-events-none overflow-hidden z-50">
          {confetti.map((p) => (
            <div
              key={p.id}
              className="confetti-piece absolute"
              style={{
                left: p.left,
                top: "-10px",
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                animationDelay: p.delay,
                borderRadius: p.round ? "50%" : "2px",
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-[680px] w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.1em] text-gold font-semibold">
              {weakConcepts.length > 0 ? "Focus Session" : "Challenge · Section 3"}
            </div>
            <div className="text-sm text-muted mt-0.5">{current.concept} · Attention Is All You Need</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted">Question {currentIdx + 1} of {challenges.length}</div>
            <div className="flex gap-1.5">
              {challenges.map((_, i) => (
                <ProgressCircle key={i} index={i} currentIdx={currentIdx} results={results} />
              ))}
            </div>
          </div>
        </div>

        {/* Context banner */}
        {weakConcepts.length > 0 ? (
          <div className="bg-gold/[0.06] border border-gold/20 rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
            <span className="text-lg shrink-0">🎯</span>
            <p className="text-xs text-muted leading-relaxed">
              <span className="text-ink font-semibold">Focus session.</span>{" "}
              Prioritizing your weak areas: <span className="text-gold font-medium">{weakConcepts.join(", ")}</span>.
            </p>
          </div>
        ) : (
          <div className="bg-accent/[0.06] border border-accent/20 rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
            <span className="text-lg shrink-0">🧠</span>
            <p className="text-xs text-muted leading-relaxed">
              <span className="text-ink font-semibold">Active recall, not a grade.</span>{" "}
              Retrieving information from memory triples long-term retention compared to re-reading.
            </p>
          </div>
        )}

        {/* Question card */}
        <div className="bg-card border border-line rounded-2xl p-6 mb-4">
          <div className="text-xs text-muted mb-3 uppercase tracking-[0.08em]">Recall · {current.concept}</div>
          <p className="text-base font-semibold leading-[1.6] mb-6 text-ink">{current.question}</p>
          <div className="flex flex-col gap-3">
            {current.options.map((o, i) => (
              <div
                key={i}
                className={optionClass(i)}
                onClick={() => { if (!answered) setSelected(i); }}
              >
                <div className="w-7 h-7 rounded-lg bg-line flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {["A", "B", "C", "D"][i]}
                </div>
                <span className="leading-[1.5]">{o}</span>
              </div>
            ))}
          </div>

          {answered && selected === current.correct && (
            <div className="bg-emerald/[0.08] border border-emerald/25 rounded-xl p-4 mt-5 animate-fade-in">
              <div className="font-semibold text-emerald text-sm mb-2 flex items-center gap-2">
                <span>✓</span> Correct — you understood it.
              </div>
              <p className="text-sm text-ink leading-[1.6] mb-3">{current.explanation}</p>
              <div className="bg-emerald/[0.06] border border-emerald/15 rounded-lg px-3 py-2 text-xs text-muted italic leading-relaxed">
                {current.passage}
              </div>
            </div>
          )}

          {answered && selected !== current.correct && (
            <div className="bg-gold/[0.06] border border-gold/20 rounded-xl p-4 mt-5 animate-fade-in">
              <div className="font-semibold text-gold text-sm mb-2">Not quite — here's what the passage says:</div>
              <p className="text-sm text-muted leading-[1.6] mb-3">{current.explanation}</p>
              <div className="bg-gold/[0.06] border border-gold/15 rounded-lg px-3 py-2 text-xs text-muted italic leading-relaxed">
                {current.passage}
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted mb-3">
          Press <kbd className="px-1 py-0.5 rounded bg-line text-ink font-mono text-[10px]">1–4</kbd> to select
          {" · "}
          <kbd className="px-1 py-0.5 rounded bg-line text-ink font-mono text-[10px]">Enter</kbd> to {answered ? "continue" : "submit"}
        </p>

        <div className="flex flex-col items-center gap-3">
          {!answered && (
            <button
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                selected !== null
                  ? "bg-gold text-bg hover:bg-gold-light hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(212,168,83,0.3)]"
                  : "bg-card text-muted border border-line cursor-not-allowed"
              }`}
              onClick={handleSubmit}
            >
              Submit Answer
            </button>
          )}
          {answered && (
            <button
              className="w-full bg-gold text-bg py-3 rounded-xl font-semibold text-sm hover:bg-gold-light hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(212,168,83,0.3)] transition-all cursor-pointer"
              onClick={handleNext}
            >
              {isLast ? "See Results →" : "Next Challenge →"}
            </button>
          )}
          {!answered && (
            <button
              className="text-muted text-xs hover:text-ink transition-colors cursor-pointer"
              onClick={() => go("reading")}
            >
              Come back to this later
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
