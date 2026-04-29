import { CONFETTI_COLORS } from "../constants";
import { CONCEPT_HINTS } from "../data/challenges";

function Confetti() {
  const LEFTS   = ["8%","18%","30%","45%","58%","72%","85%","93%"];
  const DELAYS  = ["0s","0.25s","0.1s","0.4s","0.15s","0.35s","0.05s","0.5s"];
  const SIZES   = [7,5,6,8,5,7,6,5];
  const pieces  = LEFTS.map((left, i) => ({
    left, delay: DELAYS[i], size: SIZES[i],
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  }));
  return (
    <div className="absolute top-0 left-0 right-0 h-36 overflow-hidden pointer-events-none">
      {pieces.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-sm confetti-piece"
          style={{ left: p.left, animationDelay: p.delay, background: p.color, width: p.size, height: p.size }}
        />
      ))}
    </div>
  );
}

export default function SummaryScreen({ go, weakConcepts = [], conceptResults = {} }) {
  const concepts = Object.keys(conceptResults);
  const passed = concepts.filter(c => conceptResults[c] >= 60).length;
  const total = concepts.length;
  const score = total > 0 ? Math.round((passed / total) * 100) : 82;

  // Build challenge result rows from conceptResults, or fall back to static demo
  const challengeRows = total > 0
    ? concepts.map(concept => ({
        q: `${concept}: ${
          concept === "Self-Attention" ? "What is the core idea behind the Transformer?" :
          concept === "Multi-Head Attention" ? "Why does the Transformer use multi-head attention?" :
          "What problem does positional encoding solve?"
        }`,
        correct: conceptResults[concept] >= 60,
        hint: conceptResults[concept] < 60 ? CONCEPT_HINTS[concept] : null,
      }))
    : [
        { q: "What is the core idea behind the Transformer?",     correct: true  },
        { q: "Why does attention allow more parallelism than RNNs?", correct: true  },
        { q: "What is the role of positional encoding?",            correct: false,
          hint: CONCEPT_HINTS["Positional Encoding"] },
      ];

  return (
    <div className="px-8 py-10 max-w-[700px] mx-auto">

      {/* Score hero */}
      <div className="relative text-center mb-10">
        {score >= 80 && <Confetti />}
        <div className="text-sm text-muted mb-4">Session Complete · Attention Is All You Need</div>
        <div className={`font-serif text-[72px] font-extrabold text-gold leading-none ${score >= 80 ? "animate-celebrate" : ""}`}>
          {score}%
        </div>
        {score >= 80 ? (
          <>
            <div className="text-base text-emerald font-semibold mt-2">Excellent — you genuinely understood this</div>
            <div className="text-sm text-muted mt-1">Top 15% comprehension score on Advanced material</div>
          </>
        ) : (
          <div className="text-base text-muted mt-2">Good effort — review the focus areas below and retry</div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { val: String(total || 8),            label: "Concepts tested" },
          { val: `${passed || 2} of ${total || 3}`, label: "Challenges passed" },
          { val: weakConcepts.length > 0 ? String(weakConcepts.length) : "0", label: "Focus areas identified" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-line rounded-xl p-5 text-center">
            <div className="font-serif text-3xl font-bold text-ink">{s.val}</div>
            <div className="text-xs text-muted mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Focus Areas panel — only shown when there are weak concepts */}
      {weakConcepts.length > 0 && (
        <div className="bg-gold/[0.07] border border-gold/30 rounded-2xl p-6 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">🎯</span>
            <h2 className="font-semibold text-sm text-ink">Focus on These Before Next Session</h2>
          </div>
          <div className="flex flex-col gap-2">
            {weakConcepts.map(concept => (
              <div key={concept} className="flex items-start gap-3 py-2.5 border-b border-gold/15 last:border-0">
                <div className="w-2 h-2 rounded-full bg-gold mt-1.5 shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-ink">{concept}</div>
                  <div className="text-xs text-muted mt-0.5">{CONCEPT_HINTS[concept]}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gold/15 text-xs text-muted">
            Your next Challenge session will prioritize these topics.
          </div>
        </div>
      )}

      {/* Challenge results */}
      <div className="bg-card border border-line rounded-2xl p-6 mb-5">
        <h2 className="font-semibold text-sm mb-3 text-ink">Challenge Results</h2>
        {challengeRows.map(q => (
          <div key={q.q} className="py-3 border-b border-line last:border-0">
            <div className="flex gap-2.5 items-start">
              <span className="text-base shrink-0">{q.correct ? "✅" : "❌"}</span>
              <div>
                <span className={`text-sm ${q.correct ? "text-ink" : "text-muted"}`}>{q.q}</span>
                {!q.correct && q.hint && (
                  <p className="text-xs text-gold mt-1 leading-relaxed">{q.hint}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Forward hook */}
      <div className="bg-gold/[0.07] border border-gold/25 rounded-xl px-4 py-3.5 mb-5 flex items-center gap-3">
        <span className="text-xl shrink-0">🔥</span>
        <div>
          <div className="text-sm font-semibold text-ink">Keep the momentum going</div>
          <div className="text-xs text-muted mt-0.5">
            {weakConcepts.length > 0
              ? `Retry the challenge to master ${weakConcepts.join(" and ")} before moving on.`
              : "Section 4 unlocks the \"Why Self-Attention\" chapter — the most important part of this paper."}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        {weakConcepts.length > 0 ? (
          <button
            onClick={() => go("quiz")}
            className="flex-1 bg-gold text-bg py-3 rounded-xl font-semibold text-sm hover:bg-gold-light hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(212,168,83,0.3)] transition-all cursor-pointer"
          >
            Retry Focus Areas →
          </button>
        ) : (
          <button
            onClick={() => go("reading")}
            className="flex-1 bg-gold text-bg py-3 rounded-xl font-semibold text-sm hover:bg-gold-light hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(212,168,83,0.3)] transition-all cursor-pointer"
          >
            Continue to Section 4
          </button>
        )}
        <button
          onClick={() => go("progress")}
          className="bg-transparent text-ink px-6 py-3 rounded-xl font-medium text-sm border border-line hover:border-gold hover:text-gold transition-all cursor-pointer"
        >
          View Progress
        </button>
        <button
          onClick={() => go("dashboard")}
          className="bg-transparent text-ink px-6 py-3 rounded-xl font-medium text-sm border border-line hover:border-gold hover:text-gold transition-all cursor-pointer"
        >
          Library
        </button>
      </div>
    </div>
  );
}
