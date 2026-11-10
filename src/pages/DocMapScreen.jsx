const sections = [
  { name: "Abstract & Introduction", desc: "Overview of the transformer architecture and motivation for removing recurrence" },
  { name: "Background",              desc: "Prior work in sequence-to-sequence models, attention mechanisms" },
  { name: "Model Architecture",      desc: "Multi-head attention, positional encoding, encoder/decoder stacks" },
  { name: "Why Self-Attention",      desc: "Comparison of self-attention vs recurrent and convolutional layers" },
  { name: "Training",                desc: "Dataset details, hardware, hyperparameter choices" },
  { name: "Results",                 desc: "BLEU scores on WMT tasks, comparison to state-of-the-art" },
  { name: "Conclusion",              desc: "Summary and future work directions" },
];

export default function DocMapScreen({ go }) {
  return (
    <div className="px-8 py-8 max-w-[900px] mx-auto">
      <button
        onClick={() => go("dashboard")}
        className="mb-6 px-4 py-2 rounded-lg text-xs font-medium bg-surface text-muted border border-line hover:text-ink hover:border-muted transition-all cursor-pointer"
      >
        ← Back
      </button>

      {/* Header */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6 items-start mb-7">
        <div>
          <div className="flex gap-2 flex-wrap mb-3">
            <span className="inline-flex items-center px-2.5 py-[3px] rounded-full text-[11px] font-semibold bg-gold/15 text-gold border border-gold/30">Advanced</span>
            <span className="inline-flex items-center px-2.5 py-[3px] rounded-full text-[11px] font-semibold bg-accent/10 text-accent border border-accent/25">15 pages</span>
            <span className="inline-flex items-center px-2.5 py-[3px] rounded-full text-[11px] font-semibold bg-emerald/10 text-emerald border border-emerald/25">~22 min at your pace</span>
          </div>
          <h1 className="font-serif text-xl font-bold text-ink mb-1">Attention Is All You Need</h1>
          <p className="text-muted text-sm">Vaswani et al. · Google Brain · 2017</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted mb-2">Flesch-Kincaid</div>
          <div className="font-mono text-2xl text-gold font-bold">16.4</div>
          <div className="text-xs text-muted">Graduate level</div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-card border border-line rounded-2xl p-6 mb-5">
        <h2 className="text-xs uppercase tracking-[0.1em] text-muted font-semibold mb-3">AI Summary</h2>
        <p className="text-sm leading-[1.8] text-muted">
          This paper introduces the <strong className="text-gold-light">Transformer</strong>, a novel neural network architecture that relies entirely on self-attention mechanisms — abandoning recurrence and convolutions. The authors demonstrate it achieves superior performance on machine translation benchmarks while being significantly more parallelizable, enabling faster training on modern hardware.
        </p>
      </div>

      {/* Core concepts */}
      <div className="mb-5">
        <h2 className="text-xs uppercase tracking-[0.1em] text-muted font-semibold mb-3">Core Concepts</h2>
        <div className="flex flex-wrap gap-2">
          {["Self-Attention","Multi-Head Attention","Positional Encoding","Encoder-Decoder","BLEU Score","Residual Connections","Layer Normalization","Parallelization"].map(t => (
            <div
              key={t}
              className="px-3 py-[5px] rounded-full text-xs font-medium bg-surface border border-line text-muted hover:text-gold hover:border-gold-dim transition-all cursor-pointer"
            >
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Section breakdown */}
      <div className="mb-6">
        <h2 className="text-xs uppercase tracking-[0.1em] text-muted font-semibold mb-3">Section Breakdown</h2>
        <div className="flex flex-col gap-2">
          {sections.map((s, i) => (
            <div
              key={s.name}
              onClick={() => go("reading")}
              className="flex items-center gap-4 bg-card border border-line rounded-xl px-4 py-4 hover:border-gold-dim transition-all cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-gold/10 text-gold flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold mb-0.5 text-ink">{s.name}</h3>
                <div className="text-xs text-muted truncate">{s.desc}</div>
              </div>
              <div className="text-xs text-muted shrink-0">~{2 + i} min</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky footer CTA */}
      <div className="sticky bottom-0 bg-gradient-to-t from-bg via-bg/90 to-transparent pt-5 pb-2">
        <div className="flex gap-3">
          <button
            onClick={() => go("reading")}
            className="flex-1 bg-gold text-bg py-3 rounded-xl font-semibold text-sm hover:bg-gold-light hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(212,168,83,0.3)] transition-all cursor-pointer"
          >
            Start Reading
          </button>
          <button
            onClick={() => go("dashboard")}
            className="bg-transparent text-ink px-6 py-3 rounded-xl font-medium text-sm border border-line hover:border-gold hover:text-gold transition-all cursor-pointer"
          >
            Back to Library
          </button>
        </div>
      </div>
    </div>
  );
}
