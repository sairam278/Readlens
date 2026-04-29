import { useState, useEffect, useRef } from "react";
import LandingScreen   from "./pages/LandingScreen";
import DashboardScreen from "./pages/DashboardScreen";
import DocMapScreen    from "./pages/DocMapScreen";
import ReadingScreen   from "./pages/ReadingScreen";
import QuizScreen      from "./pages/QuizScreen";
import SummaryScreen   from "./pages/SummaryScreen";
import ProgressScreen  from "./pages/ProgressScreen";
import LoginScreen     from "./pages/LoginScreen";
import SignupScreen    from "./pages/SignupScreen";
import LogoMark        from "./components/LogoMark";
import ErrorBoundary   from "./components/ErrorBoundary";

const navItems = [
  { id: "landing",   label: "Home" },
  { id: "dashboard", label: "Dashboard" },
  { id: "docmap",    label: "Doc Map" },
  { id: "reading",   label: "Reading" },
  { id: "quiz",      label: "Challenge" },
  { id: "summary",   label: "Summary" },
  { id: "progress",  label: "Progress" },
];

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const SHORTCUTS = [
  { key: "F", desc: "Toggle Focus mode",    screen: "Reading" },
  { key: "S", desc: "Toggle Simplify All",  screen: "Reading" },
  { key: "N", desc: "Open Notes tab",        screen: "Reading" },
  { key: "C", desc: "Start Challenge",       screen: "Reading" },
  { key: "?", desc: "Show this help modal",  screen: "Anywhere" },
];

const VALID_SCREENS = ["landing","dashboard","docmap","reading","quiz","summary","progress","login","signup"];

function screenFromHash() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  return VALID_SCREENS.includes(hash) ? hash : "landing";
}

export default function App() {
  const [screen, setScreen] = useState(screenFromHash);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("rl-theme") || "dark");
  const [user, setUser] = useState(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [userProgress, setUserProgress] = useState({});
  const [lastConceptResults, setLastConceptResults] = useState({});

  const CURRENT_DOC = "Attention Is All You Need";

  const handleQuizComplete = (conceptResults) => {
    setLastConceptResults(conceptResults);
    setUserProgress(prev => {
      const existing = prev[CURRENT_DOC] || {};
      const updated = { ...existing };
      Object.entries(conceptResults).forEach(([concept, score]) => {
        updated[concept] = existing[concept] != null
          ? Math.round((existing[concept] + score) / 2)
          : score;
      });
      return { ...prev, [CURRENT_DOC]: updated };
    });
  };

  const weakConcepts = Object.entries(userProgress[CURRENT_DOC] || {})
    .filter(([, score]) => score < 60)
    .map(([concept]) => concept);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("rl-theme", theme);
  }, [theme]);

  useEffect(() => {
    const onHashChange = () => setScreen(screenFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // ? key → shortcut modal
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "?") setShowShortcuts(s => !s);
      if (e.key === "Escape") setShowShortcuts(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Prevent body scroll when reading screen is active
  useEffect(() => {
    document.documentElement.style.overflow = screen === "reading" ? "hidden" : "";
    return () => { document.documentElement.style.overflow = ""; };
  }, [screen]);

  // Scroll-to-top visibility
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!profileOpen) return;
    const close = (e) => { if (!e.target.closest("[data-profile-menu]")) setProfileOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [profileOpen]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");
  const navigate = (id) => {
    window.location.hash = "/" + id;
    setScreen(id);
    setMenuOpen(false);
    setProfileOpen(false);
  };
  const handleAuthGo = (id) => {
    if (id === "dashboard") setUser({ name: "Sairam", email: "sairamkandhagatla18@gmail.com" });
    navigate(id);
  };
  const logout = () => { setUser(null); navigate("landing"); };

  return (
    <div className="min-h-screen bg-bg">
      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 border-b border-line bg-bg/95 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 px-6 py-4">

          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => navigate("landing")}>
            <div className="w-8 h-8 bg-gold/10 border border-gold/30 rounded-lg flex items-center justify-center">
              <LogoMark />
            </div>
            <span className="font-serif text-xl font-bold text-ink">ReadLens</span>
          </div>

          {/* Desktop nav pill */}
          <div className="hidden md:flex gap-1 bg-surface rounded-xl p-1 border border-line">
            {navItems.map(n => (
              <button
                key={n.id}
                onClick={() => navigate(n.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all font-sans cursor-pointer
                  ${screen === n.id
                    ? "bg-card text-gold border border-line"
                    : "text-muted border border-transparent hover:text-ink"}`}
              >
                {n.label}
              </button>
            ))}
          </div>

          {/* Desktop right controls */}
          <div className="hidden md:flex gap-2 shrink-0 items-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-line text-xs font-semibold text-gold">
              <span>🔥</span>
              <span className="font-mono">14</span>
              <span className="text-muted font-normal">day streak</span>
            </div>
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface border border-line text-muted hover:text-gold hover:border-gold-dim transition-all cursor-pointer"
              aria-label="Toggle theme"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>

            {user ? (
              <div className="relative" data-profile-menu>
                <button
                  onClick={() => setProfileOpen(o => !o)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl bg-surface border border-line hover:border-gold-dim transition-all cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-[11px] font-bold text-gold">
                    {user.name[0]}
                  </div>
                  <span className="text-xs font-medium text-ink">{user.name}</span>
                  <span className="text-muted group-hover:text-gold transition-colors"><ChevronDown /></span>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-line rounded-xl shadow-xl overflow-hidden animate-fade-in z-50">
                    <div className="px-4 py-3 border-b border-line">
                      <div className="text-xs font-semibold text-ink">{user.name}</div>
                      <div className="text-[11px] text-muted truncate">{user.email}</div>
                    </div>
                    {[
                      { label: "Dashboard", id: "dashboard" },
                      { label: "Progress",  id: "progress"  },
                    ].map(item => (
                      <button key={item.id} onClick={() => navigate(item.id)}
                        className="w-full text-left px-4 py-2.5 text-xs text-muted hover:text-ink hover:bg-surface transition-all cursor-pointer">
                        {item.label}
                      </button>
                    ))}
                    <div className="border-t border-line" />
                    <button onClick={logout}
                      className="w-full text-left px-4 py-2.5 text-xs text-danger hover:bg-surface transition-all cursor-pointer">
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate("login")}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-surface text-muted border border-line hover:text-ink hover:border-muted transition-all cursor-pointer">
                  Log in
                </button>
                <button
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-gold text-bg hover:bg-gold-light transition-all cursor-pointer"
                  onClick={() => navigate("signup")}
                >
                  Sign up
                </button>
              </>
            )}
          </div>

          {/* Mobile right: streak + theme + hamburger */}
          <div className="flex md:hidden items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-line text-xs font-semibold text-gold">
              <span>🔥</span>
              <span className="font-mono">14</span>
            </div>
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface border border-line text-muted hover:text-gold transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface border border-line text-ink hover:text-gold transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t border-line bg-surface px-4 py-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-2 mb-4">
              {navItems.map(n => (
                <button
                  key={n.id}
                  onClick={() => navigate(n.id)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium text-left transition-all cursor-pointer
                    ${screen === n.id
                      ? "bg-card text-gold border border-line"
                      : "text-muted border border-transparent hover:text-ink hover:bg-card"}`}
                >
                  {n.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pt-3 border-t border-line">
              {user ? (
                <>
                  <button onClick={() => navigate("progress")}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-card text-muted border border-line hover:text-ink transition-all cursor-pointer">
                    Progress
                  </button>
                  <button onClick={logout}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-surface text-danger border border-line hover:bg-card transition-all cursor-pointer">
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate("login")}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-card text-muted border border-line hover:text-ink transition-all cursor-pointer">
                    Log in
                  </button>
                  <button
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gold text-bg hover:bg-gold-light transition-all cursor-pointer"
                    onClick={() => navigate("signup")}
                  >
                    Sign up
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {screen === "landing"   && <LandingScreen   go={setScreen} />}
      {screen === "dashboard" && <DashboardScreen go={setScreen} />}
      {screen === "docmap"    && <DocMapScreen    go={setScreen} />}
      {screen === "reading"   && <ErrorBoundary><ReadingScreen   go={setScreen} /></ErrorBoundary>}
      {screen === "quiz"      && <ErrorBoundary><QuizScreen      go={setScreen} weakConcepts={weakConcepts} onComplete={handleQuizComplete} /></ErrorBoundary>}
      {screen === "summary"   && <SummaryScreen   go={setScreen} weakConcepts={weakConcepts} conceptResults={lastConceptResults} />}
      {screen === "progress"  && <ProgressScreen  go={setScreen} />}
      {screen === "login"     && <LoginScreen     go={handleAuthGo} />}
      {screen === "signup"    && <SignupScreen     go={handleAuthGo} />}

      {/* ── Keyboard Shortcuts Modal ── */}
      {showShortcuts && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowShortcuts(false)}
        >
          <div
            className="bg-card border border-line rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-line">
              <div>
                <h2 className="font-serif text-base font-bold text-ink">Keyboard Shortcuts</h2>
                <p className="text-[11px] text-muted mt-0.5">Press <kbd className="px-1.5 py-0.5 rounded bg-surface border border-line text-xs font-mono">?</kbd> anytime to toggle</p>
              </div>
              <button
                onClick={() => setShowShortcuts(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-ink hover:bg-line transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-4 flex flex-col gap-1">
              {SHORTCUTS.map(s => (
                <div key={s.key} className="flex items-center justify-between py-2 border-b border-line/50 last:border-0">
                  <div>
                    <span className="text-sm text-ink">{s.desc}</span>
                    <span className="ml-2 text-[10px] text-muted bg-surface border border-line px-1.5 py-0.5 rounded-full">{s.screen}</span>
                  </div>
                  <kbd className="px-2.5 py-1 rounded-lg bg-surface border border-line text-xs font-mono font-bold text-gold shrink-0 ml-3">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Scroll to top ── */}
      {scrollY > 300 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-card border border-line shadow-sm text-muted hover:text-gold hover:border-gold-dim hover:shadow-md transition-all cursor-pointer animate-fade-in"
          aria-label="Scroll to top"
          title="Back to top"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="2 9 7 4 12 9"/>
          </svg>
        </button>
      )}
    </div>
  );
}
