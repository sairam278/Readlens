import { useState, useEffect, useRef } from "react";
import VisualizationPanel from "../components/VisualizationPanel";
import { DELAYS } from "../constants";
import { SECTIONS, SECTION_OBJECTIVES, GOAL_PRESETS, SIDEBAR_CONCEPTS, KEY_SENTENCE } from "../data/reading";

const NOTES_KEY = "rl-notes-attention";

const READING_TOUR_STEPS = [
  { emoji: "📖", title: "Reading Mode", desc: "Scroll through the text, then use the toolbar controls to adjust font size, line spacing, and reading width." },
  { emoji: "✦", title: "AI Simplify", desc: "Press S or click \"Simplify All\" to rewrite every paragraph in plain English. Tap any sentence to simplify just that one." },
  { emoji: "⌨️", title: "Shortcuts", desc: "F = Focus mode · S = Simplify · N = Notes tab · C = Challenge. Press ? anytime for the full list." },
];

const SIDEBAR_TABS = [
  { id: "toc",      emoji: "📋", label: "Contents" },
  { id: "ask",      emoji: "🤖", label: "AI"       },
  { id: "concepts", emoji: "💡", label: "Concepts" },
  { id: "notes",    emoji: "📝", label: "Notes"    },
];

const MOBILE_TABS = [
  { id: "toc",      emoji: "📋", label: "Contents" },
  { id: "ask",      emoji: "🤖", label: "AI"       },
  { id: "concepts", emoji: "💡", label: "Concepts" },
  { id: "notes",    emoji: "📝", label: "Notes"    },
  { id: "controls", emoji: "⚙️", label: "Controls" },
];

const FONT_SIZES = ["sm", "base", "lg"];
const SPACINGS   = ["compact", "comfortable", "spacious"];
const WIDTHS     = ["narrow", "medium", "wide"];

export default function ReadingScreen({ go }) {
  const [tooltip, setTooltip]               = useState(false);
  const [simplify, setSimplify]             = useState(false);
  const [focusMode, setFocusMode]           = useState(false);
  const [currentSec, setCurrentSec]         = useState(2);
  const [notes, setNotes]                   = useState(() => localStorage.getItem(NOTES_KEY) || "");
  const [noteSaved, setNoteSaved]           = useState(false);
  const [toastFading, setToastFading]       = useState(false);
  const [seconds, setSeconds]               = useState(0);
  const [timerRunning, setTimerRunning]     = useState(true);
  const [goalMinutes, setGoalMinutes]       = useState(null);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [customInput, setCustomInput]       = useState("");
  const [goalDone, setGoalDone]             = useState(false);
  const [activeTab, setActiveTab]           = useState("ask");
  const [fontSize, setFontSize]             = useState("base");
  const [spacing, setSpacing]               = useState("comfortable");
  const [readWidth, setReadWidth]           = useState("medium");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selToolbar, setSelToolbar]         = useState(null);
  const [mobilePanel, setMobilePanel]       = useState(null);
  const [readingTourStep, setReadingTourStep] = useState(-1);
  const [vizPanel, setVizPanel]               = useState(null);
  const [aiQuery, setAiQuery]               = useState("");

  const timerRef       = useRef(null);
  const goalPickerRef  = useRef(null);
  const readingAreaRef = useRef(null);
  const selToolbarRef  = useRef(null);

  // Timer tick
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  // Goal completion check
  useEffect(() => {
    if (goalMinutes && seconds >= goalMinutes * 60 && !goalDone) {
      setGoalDone(true);
      setTimerRunning(false);
    }
  }, [seconds, goalMinutes, goalDone]);

  // Close goal picker on outside click
  useEffect(() => {
    const handler = (e) => {
      if (goalPickerRef.current && !goalPickerRef.current.contains(e.target)) {
        setShowGoalPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close selection toolbar on outside click
  useEffect(() => {
    const handler = (e) => {
      if (selToolbarRef.current?.contains(e.target)) return;
      setSelToolbar(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Scroll progress
  useEffect(() => {
    const el = readingAreaRef.current;
    if (!el) return;
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const max = scrollHeight - clientHeight;
      setScrollProgress(max > 0 ? scrollTop / max : 0);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const fmtTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const applyGoal = (min) => {
    setGoalMinutes(min);
    setGoalDone(false);
    setShowGoalPicker(false);
    setCustomInput("");
    if (!timerRunning) { setTimerRunning(true); setSeconds(0); }
  };

  const clearGoal = () => {
    setGoalMinutes(null);
    setGoalDone(false);
    setShowGoalPicker(false);
  };

  const goalTotalSecs = goalMinutes ? goalMinutes * 60 : 0;
  const goalRemaining = goalMinutes ? Math.max(0, goalTotalSecs - seconds) : 0;
  const goalProgress  = goalMinutes ? Math.min(1, seconds / goalTotalSecs) : 0;
  const nearEnd       = goalMinutes && goalRemaining <= 60 && !goalDone;

  const saveNote = () => {
    localStorage.setItem(NOTES_KEY, notes);
    setNoteSaved(true);
    setToastFading(false);
    setTimeout(() => setToastFading(true), DELAYS.TOAST_FADE);
    setTimeout(() => setNoteSaved(false), DELAYS.TOAST_HIDE);
  };

  // Keyboard shortcuts: F = focus, S = simplify, N = notes, C = challenge
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "f" || e.key === "F") setFocusMode(v => !v);
      if (e.key === "s" || e.key === "S") setSimplify(v => !v);
      if (e.key === "n" || e.key === "N") { setActiveTab("notes"); setMobilePanel("notes"); }
      if (e.key === "c" || e.key === "C") go("quiz");
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [go]);

  // Reading screen first-visit mini-tour
  useEffect(() => {
    if (!localStorage.getItem("rl-reading-tour-done")) setReadingTourStep(0);
  }, []);

  const dismissReadingTour = () => {
    setReadingTourStep(-1);
    localStorage.setItem("rl-reading-tour-done", "1");
  };
  const advanceReadingTour = () => {
    if (readingTourStep >= READING_TOUR_STEPS.length - 1) { dismissReadingTour(); return; }
    setReadingTourStep(s => s + 1);
  };

  const handleMouseUp = () => {
    setTimeout(() => {
      const sel = window.getSelection();
      const text = sel?.toString().trim();
      if (text && text.length > 2) {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelToolbar({ x: rect.left + rect.width / 2, y: rect.top, text });
      }
    }, 10);
  };

  // Open AI tab with selected text pre-filled
  const askAiAbout = (text) => {
    setAiQuery(text);
    setActiveTab("ask");
    setMobilePanel("ask");
    setSelToolbar(null);
  };

  // Navigate to a section and close the mobile panel
  const goToSection = (i) => {
    setCurrentSec(i);
    setMobilePanel(null);
  };

  // Derived display classes
  const fontSizeClass = { sm: "text-sm", base: "text-base", lg: "text-lg" }[fontSize];
  const leadingClass  = { compact: "leading-[1.6]", comfortable: "leading-[1.9]", spacious: "leading-[2.4]" }[spacing];
  const maxWidthClass = {
    narrow: "max-w-[520px]",
    medium: focusMode ? "max-w-[780px]" : "max-w-[680px]",
    wide:   focusMode ? "max-w-[960px]" : "max-w-[840px]",
  }[readWidth];

  // Mobile controls panel content
  const renderMobileControls = () => (
    <div className="px-5 py-4 flex flex-col gap-4">
      <div>
        <div className="text-[10px] text-muted uppercase tracking-widest mb-2.5 font-semibold">Display</div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center bg-card border border-line rounded-lg overflow-hidden">
            <button
              onClick={() => setFontSize(f => FONT_SIZES[Math.max(0, FONT_SIZES.indexOf(f) - 1)])}
              disabled={fontSize === "sm"}
              className="px-3 py-2 text-xs text-muted hover:text-ink hover:bg-line transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
            >A−</button>
            <div className="w-px h-5 bg-line" />
            <button
              onClick={() => setFontSize(f => FONT_SIZES[Math.min(FONT_SIZES.length - 1, FONT_SIZES.indexOf(f) + 1)])}
              disabled={fontSize === "lg"}
              className="px-3 py-2 text-xs text-muted hover:text-ink hover:bg-line transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
            >A+</button>
          </div>
          <button
            onClick={() => setSpacing(s => SPACINGS[(SPACINGS.indexOf(s) + 1) % SPACINGS.length])}
            className="px-3 py-2 bg-card border border-line rounded-lg text-xs text-muted hover:text-ink transition-all cursor-pointer"
          >≡ {spacing.charAt(0).toUpperCase() + spacing.slice(1)}</button>
        </div>
      </div>

      <div>
        <div className="text-[10px] text-muted uppercase tracking-widest mb-2.5 font-semibold">Reading Goal</div>
        <div className="grid grid-cols-3 gap-2">
          {GOAL_PRESETS.map(min => (
            <button
              key={min}
              onClick={() => applyGoal(min)}
              className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer
                ${goalMinutes === min ? "bg-gold text-bg" : "bg-surface border border-line text-muted hover:text-gold hover:border-gold-dim"}`}
            >{min}m</button>
          ))}
        </div>
        {goalMinutes && (
          <button
            onClick={clearGoal}
            className="w-full mt-2 py-1.5 rounded-lg text-xs text-muted hover:text-danger border border-transparent hover:border-danger/30 transition-all cursor-pointer"
          >Remove goal</button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={() => setSimplify(s => !s)}
          className={`py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${simplify ? "bg-gold text-bg" : "bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20"}`}
        >✦ {simplify ? "Simplify On — tap to disable" : "Simplify All"}</button>
        <button
          onClick={() => setFocusMode(f => !f)}
          className={`py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${focusMode ? "bg-accent/20 text-accent border border-accent/30" : "bg-surface text-muted border border-line hover:text-ink"}`}
        >⊙ {focusMode ? "Focus On" : "Focus Mode"}</button>
        <button onClick={() => go("quiz")} className="w-full py-2.5 rounded-xl text-sm font-medium bg-surface text-muted border border-line hover:text-ink cursor-pointer transition-all">🎯 Challenge</button>
      </div>
    </div>
  );

  // Sidebar tab content
  const renderTab = (tab) => {
    if (tab === "controls") return renderMobileControls();

    switch (tab) {
      case "toc":
        return (
          <div className="px-5 py-4">
            <div className="text-xs text-muted mb-1">
              Section {currentSec + 1} of {SECTIONS.length} — {SECTIONS[currentSec].slice(3)}
            </div>
            <div className="bg-line rounded-full h-[5px] overflow-hidden mb-1">
              <div className="h-full w-[60%] bg-gold rounded-full" />
            </div>
            <div className="flex justify-between text-[10px] text-muted mb-3">
              <span>60% through this section</span>
              <span className="text-gold font-mono">~8 min left</span>
            </div>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => goToSection(Math.max(0, currentSec - 1))}
                disabled={currentSec === 0}
                className="flex-1 py-1.5 rounded-lg text-xs font-medium border border-line text-muted hover:text-ink hover:border-muted transition-all cursor-pointer disabled:opacity-30 disabled:cursor-default"
              >
                ← Prev
              </button>
              <button
                onClick={() => goToSection(Math.min(SECTIONS.length - 1, currentSec + 1))}
                disabled={currentSec === SECTIONS.length - 1}
                className="flex-1 py-1.5 rounded-lg text-xs font-medium border border-line text-muted hover:text-ink hover:border-muted transition-all cursor-pointer disabled:opacity-30 disabled:cursor-default"
              >
                Next →
              </button>
            </div>
            <button
              onClick={() => go("quiz")}
              className="w-full bg-gold text-bg py-2 rounded-lg text-xs font-semibold hover:bg-gold-light transition-all cursor-pointer mb-4"
            >
              🎯 Take Section Challenge
            </button>
            <div className="flex flex-col gap-0.5">
              {SECTIONS.map((s, i) => (
                <button
                  key={s}
                  onClick={() => goToSection(i)}
                  className={`text-left px-3 py-2 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-2
                    ${i === currentSec
                      ? "bg-gold/10 text-gold font-semibold"
                      : i < currentSec
                        ? "text-muted hover:text-ink"
                        : "text-muted/60 hover:text-muted"}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${i < currentSec ? "bg-emerald" : i === currentSec ? "bg-gold" : "bg-line"}`} />
                  {s}
                </button>
              ))}
            </div>
          </div>
        );

      case "ask":
        return (
          <div className="px-5 py-4 flex flex-col gap-4">
            <div className="bg-card border border-line rounded-xl overflow-hidden">
              <input
                className="w-full bg-transparent border-none px-4 py-3 text-ink text-sm outline-none placeholder:text-muted font-sans"
                placeholder="What does this mean?"
                value={aiQuery}
                onChange={e => setAiQuery(e.target.value)}
              />
              <div className="flex gap-2 px-4 py-2 border-t border-line flex-wrap">
                <button className="px-4 py-2 rounded-lg text-xs font-semibold bg-gold text-bg hover:bg-gold-light transition-all cursor-pointer">Ask</button>
                <button className="px-4 py-2 rounded-lg text-xs font-medium bg-surface text-muted border border-line hover:text-ink transition-all cursor-pointer">Explain</button>
                <button className="px-4 py-2 rounded-lg text-xs font-medium bg-surface text-muted border border-line hover:text-ink transition-all cursor-pointer">Simplify</button>
              </div>
            </div>

            {/* Visualize section */}
            <div className="bg-card border border-line rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-base leading-none">🎨</span>
                <span className="text-xs font-semibold text-ink">Visualize</span>
                <span className="ml-auto text-[10px] text-muted bg-surface border border-line rounded-full px-2 py-0.5">AI</span>
              </div>
              <p className="text-xs text-muted leading-[1.6] mb-3">
                Generate a concept diagram for the current section to see how ideas connect visually.
              </p>
              <button
                onClick={() => setVizPanel({ concept: SECTIONS[currentSec].slice(3), diagramKey: currentSec === 3 ? "attention" : "default" })}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="1" width="4" height="3" rx="1" />
                  <rect x="8" y="1" width="4" height="3" rx="1" />
                  <rect x="4.5" y="9" width="4" height="3" rx="1" />
                  <line x1="3" y1="4" x2="6.5" y2="9" />
                  <line x1="10" y1="4" x2="6.5" y2="9" />
                </svg>
                Visualize This Section
              </button>
            </div>
          </div>
        );

      case "concepts":
        return (
          <div className="px-5 py-4 flex flex-col gap-3">
            {SIDEBAR_CONCEPTS.map(c => (
              <div key={c.term} className="bg-card border border-line rounded-lg px-3 py-2.5">
                <div className="text-xs font-semibold text-gold mb-1">{c.term}</div>
                <div className="text-xs text-muted leading-[1.5]">{c.def}</div>
              </div>
            ))}
            <div className="mt-1">
              <div className="text-[10px] text-muted uppercase tracking-widest mb-2 font-semibold">Key Sentence</div>
              <div className="text-xs text-muted leading-[1.7] border-l-2 border-gold-dim pl-3">
                {KEY_SENTENCE}
              </div>
            </div>
          </div>
        );

      case "notes":
        return (
          <div className="px-5 py-4">
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Jot down your thoughts, questions, or connections…"
              rows={6}
              className="w-full bg-card border border-line rounded-xl px-4 py-3 text-xs text-ink placeholder:text-muted outline-none focus:border-gold-dim transition-colors font-sans resize-none leading-[1.7]"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-muted">{notes.length} chars</span>
              <button
                onClick={saveNote}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-gold text-bg hover:bg-gold-light transition-all cursor-pointer"
              >
                Save Note
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const SidebarTabBar = () => (
    <div className="flex border-b border-line shrink-0">
      {SIDEBAR_TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-[10px] font-semibold transition-colors cursor-pointer border-b-2 ${
            activeTab === tab.id
              ? "text-gold border-gold"
              : "text-muted border-transparent hover:text-ink hover:border-line"
          }`}
        >
          <span className="text-base leading-none">{tab.emoji}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className={`grid h-[calc(100vh-57px)] transition-all duration-300 ${focusMode ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-[1fr_340px]"}`}>

      {/* ── Main reading area ── */}
      <div className="flex flex-col lg:border-r border-line overflow-hidden">

        {/* HUD Row 1: Metrics — desktop only */}
        <div className={`hidden lg:flex items-center gap-3 px-5 py-2.5 border-b border-line bg-surface flex-wrap transition-opacity duration-300 ${focusMode ? "opacity-60 hover:opacity-100" : ""}`}>

          {/* Comprehension */}
          <div className="flex flex-col gap-0.5 bg-card border border-line rounded-full px-4 py-1.5">
            <span className="text-[10px] text-muted leading-none">Comprehension</span>
            <span className="font-mono font-extrabold text-emerald text-base leading-none">78%</span>
          </div>

          {/* Concepts */}
          <div className="flex flex-col gap-0.5 bg-card border border-line rounded-full px-4 py-1.5">
            <span className="text-[10px] text-muted leading-none">Concepts</span>
            <span className="font-mono font-extrabold text-gold text-base leading-none">12 <span className="text-[10px] font-normal text-muted">unlocked</span></span>
          </div>

          {/* Timer + goal */}
          <div className="relative flex items-center gap-1.5 bg-card border border-line rounded-full px-3 py-1.5" ref={goalPickerRef}>
            <button
              onClick={() => { setTimerRunning(r => !r); setGoalDone(false); }}
              title={timerRunning ? "Pause timer" : "Resume timer"}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-line transition-colors cursor-pointer text-muted hover:text-ink shrink-0"
            >
              {timerRunning ? (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                  <rect x="1.5" y="1" width="2.5" height="8" rx="1"/>
                  <rect x="6" y="1" width="2.5" height="8" rx="1"/>
                </svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                  <path d="M2 1.5 L9 5 L2 8.5 Z"/>
                </svg>
              )}
            </button>
            <div className="flex flex-col gap-0 min-w-[52px]">
              <span className="text-[10px] text-muted leading-none">
                {goalMinutes ? (goalDone ? "Goal reached!" : "Remaining") : "Session"}
              </span>
              <span className={`font-mono font-extrabold text-base leading-tight ${
                goalDone ? "text-emerald" :
                nearEnd   ? "text-danger" :
                goalMinutes ? "text-gold" : "text-accent"
              }`}>
                {goalMinutes ? fmtTime(goalRemaining) : fmtTime(seconds)}
              </span>
              {goalMinutes && (
                <span className="text-[9px] text-muted leading-none">{fmtTime(seconds)} elapsed</span>
              )}
            </div>
            {goalMinutes && (
              <svg width="28" height="28" viewBox="0 0 28 28" className="shrink-0 -rotate-90">
                <circle cx="14" cy="14" r="11" fill="none" stroke="var(--line)" strokeWidth="2.5"/>
                <circle
                  cx="14" cy="14" r="11" fill="none"
                  stroke={goalDone ? "var(--emerald)" : nearEnd ? "var(--danger)" : "var(--gold)"}
                  strokeWidth="2.5"
                  strokeDasharray={`${2 * Math.PI * 11}`}
                  strokeDashoffset={`${2 * Math.PI * 11 * (1 - goalProgress)}`}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 1s linear" }}
                />
              </svg>
            )}
            <button
              onClick={() => setShowGoalPicker(o => !o)}
              title="Set reading goal"
              className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors cursor-pointer shrink-0 text-xs
                ${showGoalPicker ? "bg-gold/20 text-gold" : "text-muted hover:text-gold hover:bg-gold/10"}`}
            >
              ⏱
            </button>
            {showGoalPicker && (
              <div className="absolute top-[calc(100%+8px)] left-0 bg-card border border-line rounded-xl shadow-xl z-30 p-3 min-w-[200px] animate-fade-in">
                <div className="text-[10px] text-muted uppercase tracking-widest mb-2 font-semibold">Set reading goal</div>
                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  {GOAL_PRESETS.map(min => (
                    <button
                      key={min}
                      onClick={() => applyGoal(min)}
                      className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer
                        ${goalMinutes === min ? "bg-gold text-bg" : "bg-surface border border-line text-muted hover:text-gold hover:border-gold-dim"}`}
                    >
                      {min}m
                    </button>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="number" min="1" max="240"
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                    placeholder="Custom min"
                    className="flex-1 bg-surface border border-line rounded-lg px-2.5 py-1.5 text-xs text-ink placeholder:text-muted outline-none focus:border-gold-dim font-mono"
                  />
                  <button
                    onClick={() => { const v = parseInt(customInput); if (v > 0) applyGoal(v); }}
                    className="px-3 py-1.5 bg-gold text-bg rounded-lg text-xs font-semibold hover:bg-gold-light transition-all cursor-pointer"
                  >
                    Set
                  </button>
                </div>
                {goalMinutes && (
                  <button
                    onClick={clearGoal}
                    className="w-full mt-2 py-1.5 rounded-lg text-xs text-muted hover:text-danger border border-transparent hover:border-danger/30 transition-all cursor-pointer"
                  >
                    Remove goal
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Section progress bar */}
          <div className="flex-1 min-w-[120px] flex flex-col gap-1">
            <div className="flex justify-between text-[10px] text-muted">
              <span>Section progress</span>
              <span className="text-gold font-mono font-bold">38%</span>
            </div>
            <div className="bg-line rounded-full h-[7px] overflow-hidden">
              <div className="h-full w-[38%] bg-gold rounded-full transition-[width] duration-500" />
            </div>
          </div>
        </div>

        {/* HUD Row 2: Display controls + Actions — desktop only */}
        <div className={`hidden lg:flex items-center gap-2 px-5 py-2 border-b border-line bg-bg flex-wrap transition-opacity duration-300 ${focusMode ? "opacity-60 hover:opacity-100" : ""}`}>

          {/* Font size A− / A+ */}
          <div className="flex items-center bg-card border border-line rounded-lg overflow-hidden">
            <button
              onClick={() => setFontSize(f => FONT_SIZES[Math.max(0, FONT_SIZES.indexOf(f) - 1)])}
              disabled={fontSize === "sm"}
              title="Decrease font size"
              className="px-2.5 py-1.5 text-xs text-muted hover:text-ink hover:bg-line transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
            >
              A−
            </button>
            <div className="w-px h-4 bg-line" />
            <button
              onClick={() => setFontSize(f => FONT_SIZES[Math.min(FONT_SIZES.length - 1, FONT_SIZES.indexOf(f) + 1)])}
              disabled={fontSize === "lg"}
              title="Increase font size"
              className="px-2.5 py-1.5 text-xs text-muted hover:text-ink hover:bg-line transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
            >
              A+
            </button>
          </div>

          {/* Spacing toggle */}
          <button
            onClick={() => setSpacing(s => SPACINGS[(SPACINGS.indexOf(s) + 1) % SPACINGS.length])}
            title={`Line spacing: ${spacing}`}
            className="px-2.5 py-1.5 bg-card border border-line rounded-lg text-xs text-muted hover:text-ink hover:border-muted transition-all cursor-pointer"
          >
            ≡ {spacing.charAt(0).toUpperCase() + spacing.slice(1)}
          </button>

          {/* Width toggle */}
          <button
            onClick={() => setReadWidth(w => WIDTHS[(WIDTHS.indexOf(w) + 1) % WIDTHS.length])}
            title={`Reading width: ${readWidth}`}
            className="px-2.5 py-1.5 bg-card border border-line rounded-lg text-xs text-muted hover:text-ink hover:border-muted transition-all cursor-pointer"
          >
            ↔ {readWidth.charAt(0).toUpperCase() + readWidth.slice(1)}
          </button>

          <div className="flex-1" />

          {/* Action buttons */}
          <button
            onClick={() => setSimplify(s => !s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${simplify ? "bg-gold text-bg" : "bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20"}`}
          >
            ✦ Simplify All
          </button>
          <button
            onClick={() => setFocusMode(f => !f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${focusMode ? "bg-accent/20 text-accent border border-accent/30" : "bg-surface text-muted border border-line hover:text-ink"}`}
          >
            {focusMode ? "⊙ Focus On" : "⊙ Focus"}
          </button>
          <button
            onClick={() => go("quiz")}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface text-muted border border-line hover:text-ink hover:border-muted transition-all cursor-pointer"
          >
            🎯 Challenge
          </button>
          <button
            onClick={() => go("summary")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-card text-ink border border-line hover:border-gold hover:text-gold transition-all cursor-pointer"
          >
            ✓ Done
          </button>
        </div>

        {/* ── Mobile Compact HUD ── */}
        <div className={`flex lg:hidden items-center gap-2.5 px-4 py-2.5 border-b border-line bg-surface shrink-0 transition-opacity duration-300 ${focusMode ? "opacity-60" : ""}`}>
          {/* Timer — tap to pause/resume */}
          <button
            onClick={() => { setTimerRunning(r => !r); setGoalDone(false); }}
            className="flex flex-col items-start shrink-0"
          >
            <span className="text-[9px] text-muted leading-none mb-0.5">{goalMinutes ? (goalDone ? "Done!" : "Left") : "Time"}</span>
            <span className={`font-mono text-sm font-bold leading-none ${goalDone ? "text-emerald" : nearEnd ? "text-danger" : goalMinutes ? "text-gold" : "text-accent"}`}>
              {goalMinutes ? fmtTime(goalRemaining) : fmtTime(seconds)}
            </span>
          </button>

          <div className="w-px h-7 bg-line shrink-0" />

          {/* Section name + scroll progress */}
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <span className="text-[10px] text-muted truncate leading-none">{SECTIONS[currentSec]}</span>
            <div className="flex items-center gap-1.5">
              <div className="flex-1 bg-line rounded-full h-1 overflow-hidden">
                <div
                  className="h-full bg-gold rounded-full transition-[width] duration-150"
                  style={{ width: `${Math.round(scrollProgress * 100)}%` }}
                />
              </div>
              <span className="text-[9px] text-gold font-mono font-bold shrink-0">
                {Math.round(scrollProgress * 100)}%
              </span>
            </div>
          </div>

          <div className="w-px h-7 bg-line shrink-0" />

          {/* Comprehension stat */}
          <div className="flex flex-col items-end shrink-0">
            <span className="text-[9px] text-muted leading-none mb-0.5">Comp.</span>
            <span className="font-mono text-sm font-bold leading-none text-emerald">78%</span>
          </div>

          <div className="w-px h-7 bg-line shrink-0" />

          {/* Done button */}
          <button
            onClick={() => go("summary")}
            className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-card text-ink border border-line hover:border-gold hover:text-gold transition-all cursor-pointer"
          >✓ Done</button>
        </div>

        {/* Scroll progress indicator */}
        <div className="h-[3px] bg-line/40 shrink-0">
          <div
            className="h-full bg-gold rounded-r-full transition-[width] duration-150"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>

        {/* Reading content */}
        <div
          ref={readingAreaRef}
          className="flex-1 overflow-y-auto px-3 py-4 lg:px-10 lg:py-8 bg-bg"
          onMouseUp={handleMouseUp}
        >
          <div className={`mx-auto bg-surface border border-line rounded-xl px-5 py-5 lg:px-12 lg:py-10 transition-all duration-300 ${maxWidthClass}`}>
            <div className="flex justify-between text-xs text-muted mb-5">
              <span>Attention Is All You Need — Vaswani et al.</span>
              <span>Page 3 of 15</span>
            </div>
            {/* Section learning objective */}
            <div className="flex items-start gap-2.5 bg-accent/[0.06] border border-accent/20 rounded-xl px-4 py-3 mb-5">
              <span className="text-sm shrink-0 mt-px">🎯</span>
              <div>
                <span className="text-[10px] text-accent font-semibold uppercase tracking-widest block mb-0.5">After this section you'll understand</span>
                <span className="text-xs text-muted leading-[1.6]">{SECTION_OBJECTIVES[currentSec]}</span>
              </div>
            </div>
            <h2 className="font-serif text-xl mb-5 text-ink">3. Model Architecture</h2>

            <div className="group mb-4">
              <p className={`${fontSizeClass} ${leadingClass} text-ink`}>
                Most competitive neural sequence transduction models have an{" "}
                <span className="rl-highlight">encoder-decoder structure</span>.
                Here, the encoder maps an input sequence of symbol representations (x₁, ..., xₙ) to a sequence of
                continuous representations z = (z₁, ..., zₙ). Given z, the decoder then generates an output sequence
                (y₁, ..., yₘ) of symbols one element at a time.
              </p>
              {simplify && (
                <div className="bg-gold/[0.06] border border-gold/20 rounded-xl px-4 py-3.5 mt-3 text-sm leading-[1.7] text-muted animate-fade-in">
                  <span className="text-xs text-gold font-semibold block mb-1.5">✦ Plain English</span>
                  Think of it like a translation machine. The encoder reads and understands the input (e.g. French). The decoder writes the output (e.g. English) one word at a time, using what the encoder understood.
                </div>
              )}
            </div>

            <div className="group mb-4">
              <p className={`${fontSizeClass} ${leadingClass} text-ink`}>
                The Transformer follows this overall architecture using{" "}
                <span className="rl-highlight">stacked self-attention and point-wise, fully connected layers</span>{" "}
                for both the encoder and decoder, shown in the left and right halves of Figure 1, respectively.
              </p>
              {simplify && (
                <div className="bg-gold/[0.06] border border-gold/20 rounded-xl px-4 py-3.5 mt-3 text-sm leading-[1.7] text-muted animate-fade-in">
                  <span className="text-xs text-gold font-semibold block mb-1.5">✦ Plain English</span>
                  Instead of reading words one by one (like older models), the Transformer looks at all words at once and figures out which ones relate to each other. This is what "self-attention" means.
                </div>
              )}
            </div>

            <div className="group mb-4">
              <p className={`${fontSizeClass} ${leadingClass} text-ink`}>
                <span
                  className="cursor-pointer hover:bg-gold/[0.08] rounded transition-colors"
                  onClick={() => setSimplify(!simplify)}
                >
                  An attention function can be described as mapping a query and a set of key-value pairs to an output,
                  where the query, keys, values, and output are all vectors. The output is computed as a weighted sum
                  of the values, where the weight assigned to each value is computed by a compatibility function of
                  the query with the corresponding key.{" "}
                </span>
                <span className="rl-highlight-text text-xs ml-1 cursor-pointer transition-colors" onClick={() => setSimplify(!simplify)}>
                  [tap to simplify]
                </span>
              </p>
              {simplify && (
                <div className="bg-gold/[0.06] border border-gold/20 rounded-xl px-4 py-3.5 mt-3 text-sm leading-[1.7] text-muted animate-fade-in">
                  <span className="text-xs text-gold font-semibold block mb-1.5">✦ Plain English</span>
                  Imagine you're searching Google. Your search (query) gets compared to every web page title (keys). The most relevant pages get matched (weighted sum), and you get the actual content (values). That's exactly what attention does.
                </div>
              )}
            </div>

            <div className="mb-4">
              <p className={`${fontSizeClass} ${leadingClass} text-ink`}>
                We call our particular attention mechanism{" "}
                <span className="relative inline">
                  <span
                    className="rl-highlight-text border-b border-dashed border-gold cursor-help"
                    onMouseEnter={() => setTooltip(true)}
                    onMouseLeave={() => setTooltip(false)}
                  >
                    Scaled Dot-Product Attention
                  </span>
                  {tooltip && (
                    <span className="absolute bottom-[calc(100%+8px)] left-0 bg-card border border-line rounded-lg px-3.5 py-2.5 text-xs w-[220px] z-10 leading-[1.5] shadow-xl animate-fade-in">
                      <strong className="text-gold block mb-0.5">What this means</strong>
                      Queries and keys are multiplied (dot product), then divided by √dₖ to keep values from getting too large, then softmax turns them into probabilities — so the model knows which parts to "pay attention" to.
                    </span>
                  )}
                </span>
                . The input consists of queries and keys of dimension dₖ, and values of dimension dᵥ.
              </p>
            </div>

            <p className={`${fontSizeClass} ${leadingClass} text-ink mb-4`}>
              <span className="rl-highlight">
                Multi-Head Attention allows the model to jointly attend to information from different representation
                subspaces at different positions.
              </span>{" "}
              With a single attention head, averaging inhibits this. With multiple heads, each head can learn
              different relationships — one head might capture syntactic structure while another captures semantic meaning.
            </p>
          </div>
        </div>

        {/* ── Mobile bottom tab bar ── */}
        <div className="lg:hidden shrink-0 border-t border-line bg-surface">
          {/* Slide-up panel */}
          {mobilePanel && (
            <div className="border-b border-line overflow-y-auto" style={{ maxHeight: "42vh" }}>
              {renderTab(mobilePanel)}
            </div>
          )}
          {/* Tab icons row */}
          <div className="flex">
            {MOBILE_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setMobilePanel(p => p === tab.id ? null : tab.id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors cursor-pointer border-t-2 ${
                  mobilePanel === tab.id
                    ? "text-gold border-gold"
                    : "text-muted border-transparent hover:text-ink"
                }`}
              >
                <span className="text-base leading-none">{tab.emoji}</span>
                <span className="text-[9px] font-medium mt-0.5">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ── Sidebar (desktop) ── */}
      {!focusMode && (
        <div className="hidden lg:flex flex-col bg-surface animate-fade-in overflow-hidden">
          <SidebarTabBar />
          <div className="flex-1 overflow-y-auto">
            {renderTab(activeTab)}
          </div>
        </div>
      )}

      {/* Reading screen first-visit mini-tour */}
      {readingTourStep >= 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-fade-in">
          <div className="bg-card border border-line rounded-2xl shadow-xl p-5">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl shrink-0 mt-0.5">{READING_TOUR_STEPS[readingTourStep].emoji}</span>
              <div>
                <div className="font-serif text-sm font-bold text-ink mb-1">{READING_TOUR_STEPS[readingTourStep].title}</div>
                <div className="text-xs text-muted leading-[1.6]">{READING_TOUR_STEPS[readingTourStep].desc}</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {READING_TOUR_STEPS.map((_, i) => (
                  <span key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === readingTourStep ? "bg-gold" : "bg-line"}`} />
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={dismissReadingTour} className="px-3 py-1.5 rounded-lg text-xs text-muted hover:text-ink border border-transparent hover:border-line transition-all cursor-pointer">Skip</button>
                <button onClick={advanceReadingTour} className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-gold text-bg hover:bg-gold-light transition-all cursor-pointer">
                  {readingTourStep === READING_TOUR_STEPS.length - 1 ? "Got it!" : "Next →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visualization panel */}
      {vizPanel && (
        <VisualizationPanel
          concept={vizPanel.concept}
          diagramKey={vizPanel.diagramKey}
          onClose={() => setVizPanel(null)}
        />
      )}

      {/* Note saved toast */}
      {noteSaved && (
        <div className={`fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 px-4 py-3 bg-card border border-emerald/30 rounded-xl shadow-xl pointer-events-none ${toastFading ? "animate-toast-out" : "animate-toast-in"}`}>
          <span className="w-5 h-5 flex items-center justify-center rounded-full bg-emerald/20 text-emerald text-xs font-bold shrink-0">✓</span>
          <span className="text-sm font-medium text-ink">Note saved</span>
        </div>
      )}

      {/* Text selection mini toolbar */}
      {selToolbar && (
        <div
          ref={selToolbarRef}
          className="fixed z-50 animate-fade-in pointer-events-auto"
          style={{
            left: selToolbar.x,
            top: selToolbar.y - 8,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="flex items-center gap-0.5 bg-card border border-line rounded-lg px-1.5 py-1.5 shadow-xl">
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => { setSimplify(true); setSelToolbar(null); }}
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-gold hover:bg-gold/10 transition-colors cursor-pointer whitespace-nowrap"
            >
              ✦ Simplify
            </button>
            <div className="w-px h-4 bg-line mx-0.5" />
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => askAiAbout(selToolbar.text)}
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-accent hover:bg-accent/10 transition-colors cursor-pointer whitespace-nowrap"
            >
              🤖 Ask AI
            </button>
            <div className="w-px h-4 bg-line mx-0.5" />
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => {
                const snippet = selToolbar.text;
                setNotes(n => n ? `${n}\n\n${snippet}` : snippet);
                setActiveTab("notes");
                setMobilePanel("notes");
                setSelToolbar(null);
              }}
              className="px-2.5 py-1 rounded-md text-[11px] text-muted hover:text-ink hover:bg-line transition-colors cursor-pointer whitespace-nowrap"
            >
              📝 Note
            </button>
            <div className="w-px h-4 bg-line mx-0.5" />
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => {
                setVizPanel({ concept: selToolbar.text.slice(0, 60), diagramKey: "attention" });
                setSelToolbar(null);
              }}
              className="px-2.5 py-1 rounded-md text-[11px] text-muted hover:text-ink hover:bg-line transition-colors cursor-pointer whitespace-nowrap"
            >
              🎨 Visualize
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
