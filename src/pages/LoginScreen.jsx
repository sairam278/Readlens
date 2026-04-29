import { useState } from "react";
import LogoMark from "../components/LogoMark";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen({ go }) {
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPass, setShowPass]       = useState(false);
  const [error, setError]             = useState("");
  const [forgotToast, setForgotToast] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (!EMAIL_RE.test(email)) { setError("Please enter a valid email address."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    go("dashboard");
  };

  const handleForgotPassword = () => {
    setForgotToast(true);
    setTimeout(() => setForgotToast(false), 3000);
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center px-6 py-12 landing-grid relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(212,168,83,0.06)_0%,transparent_70%)]" />

      <div className="w-full max-w-sm relative z-10 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gold/10 border border-gold/30 rounded-xl flex items-center justify-center mx-auto mb-4">
            <LogoMark size={22} />
          </div>
          <h1 className="font-serif text-2xl font-bold text-ink mb-1">Welcome back</h1>
          <p className="text-sm text-muted">Sign in to continue your reading streak</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-line rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="text-xs font-semibold text-muted uppercase tracking-[0.08em] block mb-1.5">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full bg-surface border border-line rounded-xl px-4 py-3 text-sm text-ink placeholder:text-muted outline-none focus:border-gold-dim transition-colors font-sans"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="login-password" className="text-xs font-semibold text-muted uppercase tracking-[0.08em]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-gold hover:text-gold-light transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-surface border border-line rounded-xl px-4 py-3 pr-11 text-sm text-ink placeholder:text-muted outline-none focus:border-gold-dim transition-colors font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors cursor-pointer text-xs"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-danger animate-fade-in" role="alert">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-gold text-bg py-3 rounded-xl font-semibold text-sm hover:bg-gold-light hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(212,168,83,0.3)] transition-all cursor-pointer mt-1"
            >
              Log in
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-line" />
            <span className="text-xs text-muted">or</span>
            <div className="flex-1 h-px bg-line" />
          </div>

          {/* Social */}
          <button className="w-full flex items-center justify-center gap-2.5 bg-surface border border-line rounded-xl py-3 text-sm text-muted hover:text-ink hover:border-muted transition-all cursor-pointer font-medium">
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted mt-6">
          Don't have an account?{" "}
          <button
            onClick={() => go("signup")}
            className="text-gold hover:text-gold-light transition-colors cursor-pointer font-semibold"
          >
            Sign up free
          </button>
        </p>

        {/* Streak nudge */}
        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted">
          <span>🔥</span>
          <span>12,000+ readers improving their speed this week</span>
        </div>
      </div>

      {/* Forgot password toast */}
      {forgotToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 bg-card border border-line rounded-xl shadow-xl animate-fade-in pointer-events-none whitespace-nowrap">
          <span className="text-base">📧</span>
          <span className="text-sm text-ink font-medium">Password reset coming soon — contact support for now</span>
        </div>
      )}
    </div>
  );
}
