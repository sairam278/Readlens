import { useState, useEffect, useRef } from "react";
import VisualizationPanel from "../components/VisualizationPanel";
import { DELAYS } from "../constants";
import { SECTIONS, SECTION_OBJECTIVES, GOAL_PRESETS, SIDEBAR_CONCEPTS, KEY_SENTENCE, SECTIONS_DATA } from "../data/reading";

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
  const [notes, setNotes]                   = useState("");
  const [savedNotesList, setSavedNotesList] = useState(() => {
    try {
      const stored = localStorage.getItem("rl-notes-list-attention");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [
      {
        id: 1,
        text: "The Transformer relies entirely on parallel multi-head self-attention without recurrence, vastly increasing training throughput.",
        section: "3. Model Architecture",
        time: "1:15 PM"
      }
    ];
  });
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
  const [selToolbar, setSelToolbar]         = useState(null);
  const [mobilePanel, setMobilePanel]       = useState(null);
  const [readingTourStep, setReadingTourStep] = useState(-1);
  const [vizPanel, setVizPanel]               = useState(null);
  const [aiQuery, setAiQuery]               = useState("");
  const [bionicMode, setBionicMode]         = useState(false);
  const [readingFont, setReadingFont]       = useState("serif"); // "serif", "sans", "mono"
  const [aiLoading, setAiLoading]           = useState(false);
  const [aiResponse, setAiResponse]         = useState(null);
  const [aiMode, setAiMode]                 = useState("ask");
  const [activeMarginNote, setActiveMarginNote] = useState(null);

  const timerRef       = useRef(null);
  const goalPickerRef  = useRef(null);
  const readingAreaRef = useRef(null);
  const selToolbarRef  = useRef(null);

  // Bionic reading helper: bolds initial fixation letters (40-50% of word)
  const renderBionicText = (text) => {
    if (!bionicMode || !text || typeof text !== "string") return text;
    return text.split(/(\s+)/).map((segment, idx) => {
      if (/^\s+$/.test(segment)) return segment;
      const match = segment.match(/^([a-zA-Z0-9\u00C0-\u024F]+)(.*)$/);
      if (!match) return segment;
      const [, word, punct] = match;
      const fixLen = word.length <= 3 ? 1 : Math.ceil(word.length * 0.45);
      return (
        <span key={idx} className="bionic-word">
          <strong className="bionic-bold">{word.slice(0, fixLen)}</strong>
          <span className="opacity-90">{word.slice(fixLen)}</span>
          {punct}
        </span>
      );
    });
  };

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
    if (!notes.trim()) return;
    const newNote = {
      id: Date.now(),
      text: notes.trim(),
      section: SECTIONS[currentSec],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updated = [newNote, ...savedNotesList];
    setSavedNotesList(updated);
    try {
      localStorage.setItem("rl-notes-list-attention", JSON.stringify(updated));
    } catch (e) {
      console.warn("Storage error:", e);
    }
    setNotes("");
    setNoteSaved(true);
    setToastFading(false);
    setTimeout(() => setToastFading(true), DELAYS.TOAST_FADE);
    setTimeout(() => setNoteSaved(false), DELAYS.TOAST_HIDE);
  };

  const addNoteToList = (text, customSection) => {
    if (!text || !text.trim()) return;
    const newNote = {
      id: Date.now(),
      text: text.trim(),
      section: customSection || SECTIONS[currentSec],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updated = [newNote, ...savedNotesList];
    setSavedNotesList(updated);
    try {
      localStorage.setItem("rl-notes-list-attention", JSON.stringify(updated));
    } catch (e) {
      console.warn("Storage error:", e);
    }
    setActiveTab("notes");
    setMobilePanel("notes");
    setNoteSaved(true);
    setToastFading(false);
    setTimeout(() => setToastFading(true), DELAYS.TOAST_FADE);
    setTimeout(() => setNoteSaved(false), DELAYS.TOAST_HIDE);
  };

  const deleteNote = (id) => {
    const updated = savedNotesList.filter(n => n.id !== id);
    setSavedNotesList(updated);
    try {
      localStorage.setItem("rl-notes-list-attention", JSON.stringify(updated));
    } catch (e) {
      console.warn("Storage error:", e);
    }
  };

  const getSectionLabel = (idx) => {
    if (idx < 0 || idx >= SECTIONS.length || !SECTIONS[idx]) return "";
    const name = SECTIONS[idx];
    return name.includes(". ") ? name.split(". ")[1] : name;
  };

  // Navigate to a section, reset active margin note, and scroll reading pane to top
  const goToSection = (i) => {
    const nextIdx = Math.max(0, Math.min(SECTIONS.length - 1, i));
    setCurrentSec(nextIdx);
    setActiveMarginNote(null);
    setMobilePanel(null);
    if (readingAreaRef.current) {
      readingAreaRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const currentSectionData = (SECTIONS_DATA && SECTIONS_DATA[currentSec]) || SECTIONS_DATA[0] || { paragraphs: [] };

  // Keyboard shortcuts: F = focus, S = simplify, N = notes, C = challenge, ←/→ = prev/next section
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "f" || e.key === "F") setFocusMode(v => !v);
      if (e.key === "s" || e.key === "S") setSimplify(v => !v);
      if (e.key === "n" || e.key === "N") { setActiveTab("notes"); setMobilePanel("notes"); }
      if (e.key === "c" || e.key === "C") go("quiz");
      if (e.key === "ArrowLeft") goToSection(currentSec - 1);
      if (e.key === "ArrowRight") goToSection(currentSec + 1);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [go, currentSec]);

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

  // Live AI SSE Streaming handler with graceful fallback
  const handleAiSubmit = async (queryText, mode = "ask") => {
    const query = (queryText || aiQuery || "").trim();
    if (!query) return;
    setAiLoading(true);
    setAiMode(mode);
    setActiveTab("ask");
    setMobilePanel("ask");

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAiResponse({
      query,
      mode,
      answer: "",
      time,
      streaming: true,
    });

    try {
      const streamUrl = `http://localhost:5000/api/ai/stream?question=${encodeURIComponent(query)}&mode=${mode}&visiblePageText=${encodeURIComponent("Model Architecture: Attention Is All You Need. Encoder-decoder structure, stacked self-attention, and scaled dot-product attention.")}`;
      const res = await fetch(streamUrl);
      if (!res.ok) throw new Error("Stream error " + res.status);

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const payload = line.slice(6).trim();
            if (payload === "[DONE]") break;
            try {
              const data = JSON.parse(payload);
              if (data.chunk) {
                fullText += data.chunk;
                setAiResponse(prev => prev ? { ...prev, answer: fullText } : null);
              }
            } catch {
              // Ignore partial JSON frame parsing
            }
          }
        }
      }
      setAiResponse(prev => prev ? { ...prev, streaming: false } : null);
    } catch {
      const fallbackMap = {
        analogy: "Think of it like a search engine: queries are search terms, keys are article headlines, and values are the articles. The model weighs which articles matter most to give you the exact insight.",
        simplify: "In plain English: Instead of processing words sequentially, this system connects all relevant words simultaneously to grasp the whole picture.",
        deepdive: "The scaled dot-product computes (Q K^T) / √d_k. The division prevents softmax saturation when d_k is large, preserving healthy gradient flow during backpropagation.",
        ask: "In this architecture, representations are transformed via self-attention layers that compute similarity weights across all token pairs."
      };
      setAiResponse({
        query,
        mode,
        answer: fallbackMap[mode] || fallbackMap.ask,
        time,
        streaming: false,
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Open AI tab with selected text pre-filled
  const askAiAbout = (text, mode = "ask") => {
    setAiQuery(text);
    handleAiSubmit(text, mode);
    setSelToolbar(null);
  };

  // Derived display classes
  const fontClass     = {
    serif: "font-reading-serif tracking-[0.01em]",
    sans:  "font-reading-sans",
    mono:  "font-reading-mono text-[0.93em]",
  }[readingFont];
  const fontSizeClass = { sm: "text-sm", base: "text-base", lg: "text-lg" }[fontSize];
  const leadingClass  = { compact: "leading-[1.6]", comfortable: "leading-[1.9]", spacious: "leading-[2.4]" }[spacing];
  const maxWidthClass = {
    narrow: "max-w-[820px]",
    medium: "max-w-[1040px]",
    wide:   "max-w-[1280px]",
  }[readWidth];

  // Mobile controls panel content
  const renderMobileControls = () => (
    <div className="px-5 py-4 flex flex-col gap-4">
      <div>
        <div className="text-[10px] text-muted uppercase tracking-widest mb-2.5 font-semibold">Typography & Reading</div>
        <div className="flex flex-wrap gap-2 mb-2">
          {/* Font picker */}
          <div className="flex items-center bg-card border border-line rounded-lg overflow-hidden">
            <button
              onClick={() => setReadingFont("serif")}
              className={`px-3 py-1.5 text-xs font-serif transition-colors cursor-pointer ${readingFont === "serif" ? "bg-gold text-bg font-bold" : "text-muted hover:text-ink"}`}
            >Serif</button>
            <div className="w-px h-5 bg-line" />
            <button
              onClick={() => setReadingFont("sans")}
              className={`px-3 py-1.5 text-xs font-sans transition-colors cursor-pointer ${readingFont === "sans" ? "bg-gold text-bg font-bold" : "text-muted hover:text-ink"}`}
            >Sans</button>
            <div className="w-px h-5 bg-line" />
            <button
              onClick={() => setReadingFont("mono")}
              className={`px-3 py-1.5 text-xs font-mono transition-colors cursor-pointer ${readingFont === "mono" ? "bg-gold text-bg font-bold" : "text-muted hover:text-ink"}`}
            >Mono</button>
          </div>

          {/* Bionic reading toggle */}
          <button
            onClick={() => setBionicMode(b => !b)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              bionicMode ? "bg-emerald text-bg font-bold" : "bg-card border border-line text-muted hover:text-ink"
            }`}
          >
            <span>👁️</span>
            <span>Bionic: {bionicMode ? "ON" : "OFF"}</span>
          </button>
        </div>

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
          <button
            onClick={() => setReadWidth(w => WIDTHS[(WIDTHS.indexOf(w) + 1) % WIDTHS.length])}
            className="px-3 py-2 bg-card border border-line rounded-lg text-xs text-muted hover:text-ink transition-all cursor-pointer"
          >↔ {readWidth.charAt(0).toUpperCase() + readWidth.slice(1)}</button>
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
              Section {currentSec + 1} of {SECTIONS.length} — {getSectionLabel(currentSec)}
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
            <div className="bg-card border border-line rounded-xl overflow-hidden focus-within:border-gold-dim transition-colors shadow-sm">
              <textarea
                className="w-full bg-transparent border-none px-4 py-3 text-ink text-sm outline-none placeholder:text-muted font-sans resize-none leading-[1.6]"
                rows={3}
                placeholder="Ask a question or select text to analyze..."
                value={aiQuery}
                onChange={e => setAiQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAiSubmit(aiQuery, "ask");
                  }
                }}
              />
              <div className="flex gap-1.5 px-3 py-2 border-t border-line flex-wrap bg-surface/50">
                <button
                  disabled={aiLoading || !aiQuery.trim()}
                  onClick={() => handleAiSubmit(aiQuery, "ask")}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gold text-bg hover:bg-gold-light transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {aiLoading && aiMode === "ask" ? "Thinking…" : "💬 Ask"}
                </button>
                <button
                  disabled={aiLoading || !aiQuery.trim()}
                  onClick={() => handleAiSubmit(aiQuery, "simplify")}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-surface text-muted border border-line hover:text-gold hover:border-gold-dim transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ✦ Simplify
                </button>
                <button
                  disabled={aiLoading || !aiQuery.trim()}
                  onClick={() => handleAiSubmit(aiQuery, "analogy")}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-surface text-muted border border-line hover:text-accent hover:border-accent/40 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  💡 Analogy
                </button>
                <button
                  disabled={aiLoading || !aiQuery.trim()}
                  onClick={() => handleAiSubmit(aiQuery, "deepdive")}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-surface text-muted border border-line hover:text-emerald hover:border-emerald/40 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  🔬 Deep Dive
                </button>
              </div>
            </div>

            {/* AI Active Response Card */}
            {aiLoading && (
              <div className="bg-card border border-gold/30 rounded-xl p-4 animate-fade-in flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-gold border-t-transparent animate-spin shrink-0" />
                <div className="text-xs text-muted">
                  Gemini is analyzing the context and synthesizing an explanation…
                </div>
              </div>
            )}

            {aiResponse && !aiLoading && (
              <div className="bg-card border border-gold/30 rounded-xl p-4 animate-fade-in shadow-md">
                <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-line">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">
                      {aiResponse.mode === "analogy" ? "💡" : aiResponse.mode === "simplify" ? "✦" : aiResponse.mode === "deepdive" ? "🔬" : "🤖"}
                    </span>
                    <span className="text-[11px] font-semibold text-gold uppercase tracking-wider">
                      {aiResponse.mode === "analogy" ? "ELI5 Analogy" : aiResponse.mode === "simplify" ? "Plain English" : aiResponse.mode === "deepdive" ? "Technical Depth" : "AI Answer"}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted font-mono">{aiResponse.time}</span>
                </div>

                <div className="text-xs text-ink leading-[1.7] whitespace-pre-line mb-3 font-sans">
                  {aiResponse.answer}
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-line/60">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(aiResponse.answer);
                      setToastFading(false);
                      setNoteSaved(true);
                      setTimeout(() => setToastFading(true), DELAYS.TOAST_FADE);
                      setTimeout(() => setNoteSaved(false), DELAYS.TOAST_HIDE);
                    }}
                    className="px-2.5 py-1 rounded-md text-[11px] text-muted hover:text-ink hover:bg-surface transition-colors cursor-pointer"
                  >
                    📋 Copy
                  </button>
                  <button
                    onClick={() => {
                      addNoteToList(`[${aiResponse.mode.toUpperCase()}] ${aiResponse.query}\n${aiResponse.answer}`);
                    }}
                    className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-gold bg-gold/10 border border-gold/20 hover:bg-gold/20 transition-colors cursor-pointer"
                  >
                    📝 + Notes
                  </button>
                  <button
                    onClick={() => setAiResponse(null)}
                    className="px-2 py-1 rounded-md text-[11px] text-muted hover:text-danger hover:bg-surface transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Quick Prompt Ideas */}
            {!aiResponse && !aiLoading && (
              <div className="bg-surface/50 border border-line rounded-xl p-3.5">
                <span className="text-[10px] text-muted uppercase tracking-widest font-semibold block mb-2">Try asking</span>
                <div className="flex flex-col gap-1.5">
                  {[
                    "Why scale dot products by 1/√d_k?",
                    "How does multi-head attention differ from single head?",
                    "Give me a real-world analogy for keys and queries"
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setAiQuery(preset);
                        handleAiSubmit(preset, preset.includes("analogy") ? "analogy" : "ask");
                      }}
                      className="text-left text-xs text-muted hover:text-ink hover:bg-card px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer truncate"
                    >
                      → {preset}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                onClick={() => setVizPanel({ concept: getSectionLabel(currentSec), diagramKey: currentSec === 3 ? "attention" : "default" })}
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

      case "concepts": {
        const activeConcepts = currentSectionData.concepts || SIDEBAR_CONCEPTS;
        const activeKeySentence = currentSectionData.keySentence || KEY_SENTENCE;
        return (
          <div className="px-5 py-4 flex flex-col gap-3">
            {activeConcepts.map(c => (
              <div key={c.term} className="bg-card border border-line rounded-lg px-3 py-2.5">
                <div className="text-xs font-semibold text-gold mb-1">{c.term}</div>
                <div className="text-xs text-muted leading-[1.5]">{c.def}</div>
              </div>
            ))}
            <div className="mt-1">
              <div className="text-[10px] text-muted uppercase tracking-widest mb-2 font-semibold">Key Sentence</div>
              <div className="text-xs text-muted leading-[1.7] border-l-2 border-gold-dim pl-3">
                {activeKeySentence}
              </div>
            </div>
          </div>
        );
      }

      case "notes":
        return (
          <div className="px-5 py-4 flex flex-col gap-4">
            {/* Input Box */}
            <div className="bg-card border border-line rounded-xl p-3 shadow-xs focus-within:border-gold-dim transition-colors">
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Jot down a quick thought, question, or key idea for this section…"
                rows={3}
                className="w-full bg-transparent border-none text-xs text-ink placeholder:text-muted outline-none font-sans resize-none leading-[1.6]"
              />
              <div className="flex items-center justify-between pt-2 border-t border-line/60">
                <span className="text-[10px] text-muted">{notes.length} chars</span>
                <button
                  disabled={!notes.trim()}
                  onClick={saveNote}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gold text-bg hover:bg-gold-light transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Save Note
                </button>
              </div>
            </div>

            {/* Saved Notes Section Header */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                Saved Notes ({savedNotesList.length})
              </span>
              {savedNotesList.length > 0 && (
                <span className="text-[10px] text-muted">{getSectionLabel(currentSec)}</span>
              )}
            </div>

            {/* List of Saved Notes below text box */}
            <div className="flex flex-col gap-2.5">
              {savedNotesList.length === 0 ? (
                <div className="border border-dashed border-line rounded-xl p-5 text-center bg-card/30">
                  <span className="text-xl block mb-1">📝</span>
                  <p className="text-xs text-muted font-medium mb-1">No notes saved yet</p>
                  <p className="text-[10px] text-muted/80 leading-normal">
                    Write in the box above, or click "+ Notes" on any AI response or highlighted text to save it here.
                  </p>
                </div>
              ) : (
                savedNotesList.map(item => (
                  <div
                    key={item.id}
                    className="bg-card border border-line rounded-xl p-3.5 shadow-xs flex flex-col gap-2 group hover:border-gold-dim transition-colors animate-fade-in"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold text-gold bg-gold/10 px-2 py-0.5 rounded-md truncate max-w-[170px]">
                        {item.section || "General"}
                      </span>
                      <span className="text-[10px] text-muted font-mono shrink-0">{item.time}</span>
                    </div>

                    <p className="text-xs text-ink/90 leading-[1.65] font-sans whitespace-pre-wrap">
                      {item.text}
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-line/50 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.text);
                          setToastFading(false);
                          setNoteSaved(true);
                          setTimeout(() => setToastFading(true), DELAYS.TOAST_FADE);
                          setTimeout(() => setNoteSaved(false), DELAYS.TOAST_HIDE);
                        }}
                        className="text-[10px] text-muted hover:text-ink flex items-center gap-1 cursor-pointer transition-colors"
                        title="Copy note"
                      >
                        📋 Copy
                      </button>
                      <button
                        onClick={() => deleteNote(item.id)}
                        className="text-[10px] text-muted hover:text-danger flex items-center gap-1 cursor-pointer transition-colors"
                        title="Delete note"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const SidebarTabBar = () => (
    <div className="h-14 flex items-center px-3 gap-1 border-b border-line bg-surface shrink-0">
      {SIDEBAR_TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs transition-all cursor-pointer ${
            activeTab === tab.id
              ? "bg-card text-gold border border-line shadow-xs font-semibold"
              : "text-muted hover:text-ink hover:bg-card/40 font-normal"
          }`}
        >
          <span className="text-sm leading-none">{tab.emoji}</span>
          <span className="text-[11px] truncate">{tab.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className={`grid h-[calc(100vh-65px)] transition-all duration-300 ${focusMode ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-[1fr_340px]"}`}>

      {/* ── Main reading area ── */}
      <div className="flex flex-col lg:border-r border-line overflow-hidden">

        {/* ── Unified Desktop Reading Toolbar (h-14, matching SidebarTabBar) ── */}
        <div className={`hidden lg:flex items-center justify-between gap-3 px-5 h-14 border-b border-line bg-surface shrink-0 transition-opacity duration-300 ${focusMode ? "opacity-60 hover:opacity-100" : ""}`}>

          {/* Left: Reading controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Font Family */}
            <div className="flex items-center bg-card border border-line rounded-lg overflow-hidden shrink-0">
              <button
                onClick={() => setReadingFont("serif")}
                title="Editorial Serif (Newsreader)"
                className={`px-2.5 py-1 text-xs font-serif transition-colors cursor-pointer ${
                  readingFont === "serif" ? "bg-gold text-bg font-bold" : "text-muted hover:text-ink hover:bg-line"
                }`}
              >
                Serif
              </button>
              <div className="w-px h-4 bg-line" />
              <button
                onClick={() => setReadingFont("sans")}
                title="Modern Sans (DM Sans)"
                className={`px-2.5 py-1 text-xs font-sans transition-colors cursor-pointer ${
                  readingFont === "sans" ? "bg-gold text-bg font-bold" : "text-muted hover:text-ink hover:bg-line"
                }`}
              >
                Sans
              </button>
              <div className="w-px h-4 bg-line" />
              <button
                onClick={() => setReadingFont("mono")}
                title="Technical Mono (DM Mono)"
                className={`px-2.5 py-1 text-xs font-mono transition-colors cursor-pointer ${
                  readingFont === "mono" ? "bg-gold text-bg font-bold" : "text-muted hover:text-ink hover:bg-line"
                }`}
              >
                Mono
              </button>
            </div>

            {/* Font Size A− / A+ */}
            <div className="flex items-center bg-card border border-line rounded-lg overflow-hidden shrink-0">
              <button
                onClick={() => setFontSize(f => FONT_SIZES[Math.max(0, FONT_SIZES.indexOf(f) - 1)])}
                disabled={fontSize === "sm"}
                title="Decrease font size"
                className="px-2 py-1 text-xs text-muted hover:text-ink hover:bg-line transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
              >
                A−
              </button>
              <div className="w-px h-4 bg-line" />
              <button
                onClick={() => setFontSize(f => FONT_SIZES[Math.min(FONT_SIZES.length - 1, FONT_SIZES.indexOf(f) + 1)])}
                disabled={fontSize === "lg"}
                title="Increase font size"
                className="px-2 py-1 text-xs text-muted hover:text-ink hover:bg-line transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
              >
                A+
              </button>
            </div>

            {/* Bionic Reading */}
            <button
              onClick={() => setBionicMode(b => !b)}
              title="Toggle Bionic Reading: highlights fixation letters"
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                bionicMode
                  ? "bg-emerald text-bg font-bold shadow-xs"
                  : "bg-card text-muted border border-line hover:text-ink hover:border-gold-dim"
              }`}
            >
              <span>👁️</span>
              <span>Bionic</span>
            </button>
          </div>

          {/* Right: Metrics & actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Current Section Label */}
            <span className="hidden xl:inline text-xs font-medium text-muted truncate max-w-[140px]">
              {getSectionLabel(currentSec)}
            </span>

            {/* Comprehension */}
            <div className="flex items-center gap-1.5 bg-card border border-line rounded-lg px-2.5 py-1 shrink-0">
              <span className="text-[10px] text-muted">Comp.</span>
              <span className="font-mono text-xs font-bold text-emerald">78%</span>
            </div>

            {/* Timer & Goal Picker */}
            <div className="relative flex items-center gap-1.5 bg-card border border-line rounded-lg px-2 py-1 shrink-0" ref={goalPickerRef}>
              <button
                onClick={() => { setTimerRunning(r => !r); setGoalDone(false); }}
                title={timerRunning ? "Pause timer" : "Resume timer"}
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-line transition-colors cursor-pointer text-muted hover:text-ink shrink-0"
              >
                {timerRunning ? (
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor">
                    <rect x="1.5" y="1" width="2.5" height="8" rx="1"/>
                    <rect x="6" y="1" width="2.5" height="8" rx="1"/>
                  </svg>
                ) : (
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor">
                    <path d="M2 1.5 L9 5 L2 8.5 Z"/>
                  </svg>
                )}
              </button>
              <span className={`font-mono text-xs font-bold ${
                goalDone ? "text-emerald" :
                nearEnd   ? "text-danger" :
                goalMinutes ? "text-gold" : "text-accent"
              }`}>
                {goalMinutes ? fmtTime(goalRemaining) : fmtTime(seconds)}
              </span>
              <button
                onClick={() => setShowGoalPicker(o => !o)}
                title="Set reading goal"
                className={`w-5 h-5 flex items-center justify-center rounded text-[10px] transition-colors cursor-pointer shrink-0 ${
                  showGoalPicker ? "bg-gold/20 text-gold" : "text-muted hover:text-gold"
                }`}
              >
                ⏱
              </button>
              {showGoalPicker && (
                <div className="absolute top-[calc(100%+8px)] right-0 bg-card border border-line rounded-xl shadow-xl z-30 p-3 min-w-[200px] animate-fade-in">
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

            {/* Quiz & Done buttons */}
            <button
              onClick={() => go("quiz")}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-card border border-line text-muted hover:text-ink hover:border-muted transition-all cursor-pointer shrink-0"
            >
              🎯 Quiz
            </button>
            <button
              onClick={() => go("summary")}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-card text-ink border border-line hover:border-gold hover:text-gold transition-all cursor-pointer shrink-0"
            >
              ✓ Done
            </button>
          </div>
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

          {/* Section name */}
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <span className="text-[10px] text-muted truncate leading-none">{SECTIONS[currentSec]}</span>
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

        {/* Reading content */}
        <div
          ref={readingAreaRef}
          className="flex-1 overflow-y-auto px-3 py-4 lg:px-10 lg:py-8 bg-bg"
          onMouseUp={handleMouseUp}
        >
          <div className={`mx-auto bg-surface border border-line rounded-xl px-5 py-5 lg:px-10 lg:py-8 transition-all duration-300 ${maxWidthClass} ${fontClass}`}>
            <div className="flex justify-between text-xs text-muted mb-5">
              <span>Attention Is All You Need — Vaswani et al.</span>
              <span>{currentSectionData.page || `Page ${currentSec + 1} of 15`}</span>
            </div>
            {/* Section learning objective */}
            <div className="flex items-start gap-2.5 bg-accent/[0.06] border border-accent/20 rounded-xl px-4 py-3 mb-5">
              <span className="text-sm shrink-0 mt-px">🎯</span>
              <div>
                <span className="text-[10px] text-accent font-semibold uppercase tracking-widest block mb-0.5">After this section you'll understand</span>
                <span className="text-xs text-muted leading-[1.6]">{currentSectionData.objective || SECTION_OBJECTIVES[currentSec]}</span>
              </div>
            </div>
            <h2 className="font-serif text-xl mb-5 text-ink">{currentSectionData.title || SECTIONS[currentSec]}</h2>

            {/* Reading Grid with Edward Tufte Lateral Margin */}
            <div className="flex flex-col xl:flex-row gap-6 items-start">
              
              {/* Primary Reading Spine */}
              <div className="flex-1 min-w-0">
                {currentSectionData.paragraphs && currentSectionData.paragraphs.length > 0 ? (
                  currentSectionData.paragraphs.map((p, pIdx) => {
                    const pObj = typeof p === "string" ? { text: p } : (p || { text: "" });
                    const text = pObj.text || "";
                    const highlightText = pObj.highlightText || "";
                    const hasHighlight = Boolean(highlightText && text.includes(highlightText));
                    const beforeText = hasHighlight ? text.slice(0, text.indexOf(highlightText)) : text;
                    const afterText = hasHighlight ? text.slice(text.indexOf(highlightText) + highlightText.length) : "";

                    return (
                      <div key={pIdx} className="group mb-5">
                        <p className={`${fontSizeClass} ${leadingClass} text-ink`}>
                          {hasHighlight ? (
                            <>
                              {renderBionicText(beforeText)}
                              <span
                                className="rl-highlight cursor-pointer hover:underline"
                                onClick={() => setActiveMarginNote({
                                  type: pObj.highlightType || "simplify",
                                  title: pObj.marginTitle || "Key Concept",
                                  content: pObj.marginContent || pObj.highlightText
                                })}
                              >
                                {renderBionicText(highlightText)}
                              </span>
                              {renderBionicText(afterText)}
                            </>
                          ) : (
                            renderBionicText(text)
                          )}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-muted">No content available for this section.</div>
                )}

                {/* Section Navigation Footer (Prev & Next Section) */}
                <div className="flex items-center justify-between gap-3 pt-6 mt-8 border-t border-line">
                  <button
                    disabled={currentSec === 0}
                    onClick={() => goToSection(currentSec - 1)}
                    className="px-4 py-2 rounded-xl text-xs font-medium border border-line bg-surface text-muted hover:text-ink hover:border-gold-dim transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span>←</span>
                    <span>Previous: {currentSec > 0 ? getSectionLabel(currentSec - 1) : "Start"}</span>
                  </button>

                  <span className="text-[11px] font-mono text-muted">
                    Section {currentSec + 1} of {SECTIONS.length}
                  </span>

                  <button
                    disabled={currentSec === SECTIONS.length - 1}
                    onClick={() => goToSection(currentSec + 1)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-gold text-bg hover:bg-gold-light transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span>Next: {currentSec < SECTIONS.length - 1 ? getSectionLabel(currentSec + 1) : "Done"}</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              {/* Lateral Margin Gutter (Edward Tufte Marginalia) */}
              <div className="w-full xl:w-[240px] shrink-0 sticky top-4 self-start">
                {activeMarginNote ? (
                  <div className="bg-card border border-gold/40 rounded-xl p-3.5 shadow-lg animate-fade-in">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-line">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">{activeMarginNote.type === "analogy" ? "💡" : activeMarginNote.type === "deepdive" ? "🔬" : "✦"}</span>
                        <span className="text-[10px] font-bold text-gold uppercase tracking-wider">{activeMarginNote.title}</span>
                      </div>
                      <button
                        onClick={() => setActiveMarginNote(null)}
                        className="w-5 h-5 flex items-center justify-center rounded text-muted hover:text-ink text-xs hover:bg-surface cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-xs text-ink/90 leading-[1.65] font-sans">
                      {activeMarginNote.content}
                    </p>
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-line text-[10px] text-muted">
                      <span className="text-[9px]">Zero layout shift</span>
                      <button
                        onClick={() => {
                          addNoteToList(`[${activeMarginNote.title}] ${activeMarginNote.content}`);
                        }}
                        className="text-gold hover:underline cursor-pointer font-medium"
                      >
                        + Pin to Notes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="hidden xl:block border border-dashed border-line/60 rounded-xl p-3.5 text-center text-muted/60 bg-surface/20">
                    <span className="text-sm block mb-1">📜</span>
                    <span className="text-[10px] font-semibold block text-muted/80 mb-0.5 uppercase tracking-wider">Tufte Marginalia</span>
                    <span className="text-[10px] block leading-snug">Click highlighted terms or sentences to pin notes here alongside the text.</span>
                  </div>
                )}
              </div>
            </div>
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
              onClick={() => askAiAbout(selToolbar.text, "simplify")}
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-gold hover:bg-gold/10 transition-colors cursor-pointer whitespace-nowrap"
            >
              ✦ Simplify
            </button>
            <div className="w-px h-4 bg-line mx-0.5" />
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => askAiAbout(selToolbar.text, "analogy")}
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-emerald hover:bg-emerald/10 transition-colors cursor-pointer whitespace-nowrap"
            >
              💡 Analogy
            </button>
            <div className="w-px h-4 bg-line mx-0.5" />
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => askAiAbout(selToolbar.text, "ask")}
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-accent hover:bg-accent/10 transition-colors cursor-pointer whitespace-nowrap"
            >
              🤖 Ask AI
            </button>
            <div className="w-px h-4 bg-line mx-0.5" />
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => {
                addNoteToList(selToolbar.text);
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
