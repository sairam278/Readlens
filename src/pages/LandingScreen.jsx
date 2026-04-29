function ProductMockup() {
  return (
    <div className="rounded-2xl overflow-hidden border border-line shadow-[0_32px_80px_rgba(0,0,0,0.6)] bg-surface shrink-0 w-full">
      {/* Chrome */}
      <div className="bg-card border-b border-line px-3.5 py-2.5 flex items-center gap-2.5">
        <div className="flex gap-1.5">
          <div className="w-[9px] h-[9px] rounded-full bg-[#FF5F57]" />
          <div className="w-[9px] h-[9px] rounded-full bg-[#FFBD2E]" />
          <div className="w-[9px] h-[9px] rounded-full bg-[#28C840]" />
        </div>
        <div className="flex-1 bg-surface border border-line rounded px-2.5 py-1 text-[11px] text-muted font-mono">
          readlens.app/reading
        </div>
      </div>
      {/* HUD */}
      <div className="bg-surface border-b border-line px-3.5 py-1.5 flex items-center gap-2.5">
        <div className="bg-card border border-line rounded-full px-2.5 py-0.5 text-[10px] flex gap-1 items-center">
          <span className="text-muted">Understood</span>
          <span className="font-bold font-mono text-emerald">78%</span>
        </div>
        <div className="bg-card border border-line rounded-full px-2.5 py-0.5 text-[10px] flex gap-1 items-center">
          <span className="text-muted">Concepts</span>
          <span className="font-bold font-mono text-gold">12</span>
        </div>
        <div className="flex-1 bg-line rounded-full h-[3px] overflow-hidden">
          <div className="h-full w-[38%] bg-gold rounded-full" />
        </div>
        <span className="text-[9px] text-muted whitespace-nowrap">38% done</span>
      </div>
      {/* Body */}
      <div className="grid grid-cols-[1fr_140px]">
        <div className="p-4 bg-bg">
          <div className="text-[9px] text-muted mb-2.5 flex justify-between">
            <span>Attention Is All You Need</span><span>Page 3 of 15</span>
          </div>
          <div className="font-serif text-[13px] font-bold mb-2 text-ink">3. Model Architecture</div>
          <p className="text-[10px] leading-[1.8] text-muted mb-2">
            Most competitive models have an{" "}
            <span className="bg-gold/20 rounded-sm px-0.5 text-gold-light">encoder-decoder structure</span>.{" "}
            The encoder maps input representations to continuous vectors.
          </p>
          <div className="bg-gold/[0.06] border border-gold/20 rounded-md p-2.5 text-[10px] text-muted leading-[1.6] mb-2">
            <div className="text-[9px] text-gold font-semibold mb-1">✦ Simplified</div>
            Think of it like a search engine — it finds the most relevant parts.
          </div>
          <p className="text-[10px] leading-[1.8] text-muted">
            <span className="border-b border-dashed border-gold text-gold-light">Scaled Dot-Product Attention</span>{" "}
            uses queries and keys of dimension dₖ.
          </p>
        </div>
        <div className="bg-surface border-l border-line p-3">
          <div className="text-[8px] uppercase tracking-widest text-muted mb-1.5 font-semibold">Ask AI</div>
          <div className="bg-card border border-line rounded-md p-2 text-[9px] text-muted mb-2.5">
            What does this mean?
            <div className="bg-gold text-bg rounded px-1.5 py-0.5 text-[8px] font-semibold mt-1 inline-block">Ask</div>
          </div>
          <div className="text-[8px] uppercase tracking-widest text-muted mb-1.5 font-semibold">Challenge</div>
          {["What is the key idea?", "Explain in your words", "Why does this matter?"].map(q => (
            <div key={q} className="text-[9px] text-muted py-[5px] border-b border-line leading-[1.4] hover:text-gold transition-colors cursor-pointer">{q}</div>
          ))}
          <div className="text-[9px] text-muted leading-[1.6] border-l-2 border-gold-dim pl-1.5 mt-2">
            Multi-Head Attention attends to different subspaces simultaneously.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingScreen({ go }) {
  return (
    <div>
      {/* ── HERO ── */}
      <div className="relative overflow-hidden flex items-start px-8 pt-8 pb-10 landing-grid">
        <div className="absolute inset-0 pointer-events-none" style={{background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(212,168,83,0.18) 0%, transparent 65%), radial-gradient(ellipse 45% 40% at 100% 100%, rgba(99,102,241,0.12) 0%, transparent 60%)"}} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center max-w-[1100px] w-full mx-auto relative z-10">
          {/* Left */}
          <div className="pt-6">
            <p className="text-xs tracking-[0.15em] text-gold uppercase mb-4 font-semibold">Your AI Learning Coach</p>
            <h1 className="font-serif text-[clamp(36px,5vw,62px)] font-extrabold leading-[1.08] mb-4 text-ink">
              Any document.<br /><em className="italic text-gold">Any complexity.</em><br />Understood.
            </h1>
            <p className="text-muted text-base max-w-[420px] leading-[1.6] mb-6">
              ReadLens breaks down any PDF — papers, contracts, textbooks — into concepts you can grasp, then locks it in through smart challenges.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => go("dashboard")}
                className="bg-gold text-bg px-8 py-4 rounded-xl font-semibold text-sm transition-all hover:bg-gold-light hover:-translate-y-0.5 shadow-[0_4px_16px_rgba(212,168,83,0.35)] hover:shadow-[0_12px_32px_rgba(212,168,83,0.5)] cursor-pointer"
              >
                Start Learning Free
              </button>
              <button
                onClick={() => go("reading")}
                className="bg-transparent text-ink px-8 py-4 rounded-xl font-medium text-sm border border-line transition-all hover:border-gold hover:text-gold cursor-pointer"
              >
                See it in action →
              </button>
            </div>

            <div className="flex gap-6 mt-8 pt-6 border-t border-line flex-wrap">
              {[
                { val: "94%",  label: "Comprehension improvement" },
                { val: "3×",   label: "Better retention" },
                { val: "50k+", label: "Concepts explained" },
              ].map(s => (
                <div key={s.label}>
                  <div className="font-serif text-xl font-bold text-gold">{s.val}</div>
                  <div className="text-xs text-muted mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: product mockup — visible from md up */}
          <div className="hidden md:block">
            <ProductMockup />
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div className="px-8 py-12 max-w-[900px] mx-auto">
        <p className="text-center text-xs uppercase tracking-[0.12em] text-muted mb-2 font-semibold">How it works</p>
        <h2 className="font-serif text-2xl font-bold text-center mb-8 text-ink">From confusion to clarity in 3 steps</h2>
        <div className="how-steps grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
          {[
            { n: "1", title: "Upload any document",       desc: "Drop in any PDF. ReadLens maps every concept and gives you a plain-English overview before you read a word." },
            { n: "2", title: "AI breaks it down for you", desc: "Tap any sentence to simplify it instantly. Every concept explained in plain language, from first principles." },
            { n: "3", title: "Lock it in with challenges",desc: "Active recall challenges after each section test what you understood — not just what you read." },
          ].map(s => (
            <div key={s.n} className="text-center relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 text-gold font-serif text-xl font-bold flex items-center justify-center mx-auto mb-4">
                {s.n}
              </div>
              <h3 className="text-sm font-semibold mb-1.5 text-ink">{s.title}</h3>
              <p className="text-sm text-muted leading-[1.55]">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div className="px-8 pb-12 max-w-[900px] mx-auto">
        <h2 className="font-serif text-xl font-bold text-center mb-6 text-ink">Used by students, researchers &amp; founders</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { initials: "AK", bg: "bg-accent/25", border: "border-accent/40", text: "text-accent",   name: "Anya K.",   role: "PhD student, MIT",      quote: "I finally understood the Transformer architecture in one sitting." },
            { initials: "MR", bg: "bg-emerald/25", border: "border-emerald/40", text: "text-emerald", name: "Marcus R.", role: "Startup founder",        quote: "The challenges force me to actually understand what I just read — not just nod along." },
            { initials: "PS", bg: "bg-gold/25", border: "border-gold/40", text: "text-gold",       name: "Priya S.",  role: "Pre-med, Stanford",     quote: "It's like having a tutor inside every document." },
          ].map(t => (
            <div key={t.name} className="bg-card border border-line rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border-2 shadow-sm ${t.bg} ${t.border} ${t.text}`}>{t.initials}</div>
                <div>
                  <div className="text-sm font-semibold text-ink">{t.name}</div>
                  <div className="text-xs text-muted">{t.role}</div>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="10" height="10" viewBox="0 0 10 10" fill="#D4A853"><path d="M5 0l1.12 3.45H9.5L6.69 5.59l1.07 3.41L5 7l-2.76 2 1.07-3.41L.5 3.45H3.88z"/></svg>
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted leading-[1.55] italic">"{t.quote}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div className="px-8 pb-16 max-w-[900px] mx-auto">
        <h2 className="font-serif text-xl font-bold text-center mb-6 text-ink">Everything you need to truly learn</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5Z"/>
                  <path d="M19 14l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z"/>
                  <path d="M5 18l.5 1.5 1.5.5-1.5.5L5 22l-.5-1.5L3 20l1.5-.5Z"/>
                </svg>
              ),
              title: "Instant Simplification", desc: "One tap — any sentence in plain English, no jargon.",
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21h6M12 3a6 6 0 0 1 4.24 10.24C15.42 14.07 15 15 15 16H9c0-1-.42-1.93-1.24-2.76A6 6 0 0 1 12 3Z"/>
                  <line x1="9" y1="19" x2="15" y2="19"/>
                </svg>
              ),
              title: "Concept Explainer", desc: "Hover any term for an instant definition. AI explains from first principles.",
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="5"/>
                  <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>
                </svg>
              ),
              title: "Challenge Mode", desc: "Active recall after every section. Proven to triple retention vs. re-reading.",
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="14" width="4" height="7" rx="1"/>
                  <rect x="9" y="9" width="4" height="12" rx="1"/>
                  <rect x="16" y="4" width="4" height="17" rx="1"/>
                  <line x1="2" y1="22" x2="22" y2="22"/>
                </svg>
              ),
              title: "Understanding Tracker", desc: "Track concepts mastered and comprehension scores across every document.",
            },
          ].map(f => (
            <div key={f.title} className="relative overflow-hidden bg-card border border-line rounded-2xl p-5 text-left before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-[linear-gradient(90deg,transparent,#D4A853,transparent)] before:opacity-40">
              <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/25 flex items-center justify-center text-gold mb-3">
                {f.icon}
              </div>
              <h3 className="text-sm font-semibold mb-1 text-ink">{f.title}</h3>
              <p className="text-xs text-muted leading-[1.6]">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <button
            onClick={() => go("dashboard")}
            className="bg-gold text-bg px-9 py-3.5 rounded-xl font-semibold text-sm transition-all hover:bg-gold-light hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(212,168,83,0.3)] cursor-pointer"
          >
            Start learning for free
          </button>
          <p className="text-xs text-muted mt-3">No credit card required · Works on any PDF</p>
        </div>
      </div>
    </div>
  );
}
