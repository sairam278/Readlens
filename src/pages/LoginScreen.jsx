import { useState } from "react";
import LogoMark from "../components/LogoMark";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen({ go, onLogin }) {
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPass, setShowPass]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [forgotToast, setForgotToast] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (!EMAIL_RE.test(email)) { setError("Please enter a valid email address."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed. Please check your credentials.");
      }

      if (data.token) {
        localStorage.setItem("rl-token", data.token);
      }
      if (data.user) {
        localStorage.setItem("rl-user", JSON.stringify(data.user));
        onLogin?.(data.user);
      }

      go("dashboard");
    } catch (err) {
      setError(err.message || "Unable to connect to authentication service.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail("sairamkandhagatla18@gmail.com");
    setPassword("password123");
    setError("");
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
              disabled={loading}
              className="w-full bg-gold text-bg py-3 rounded-xl font-semibold text-sm hover:bg-gold-light hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(212,168,83,0.3)] transition-all cursor-pointer mt-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" />}
              <span>{loading ? "Signing in…" : "Log in"}</span>
            </button>
          </form>

          {/* Quick Demo Fill */}
          <div className="mt-4 pt-4 border-t border-line text-center">
            <button
              type="button"
              onClick={fillDemo}
              className="text-xs text-muted hover:text-gold transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>⚡</span>
              <span>Fill demo account (sairam@... / password123)</span>
            </button>
          </div>
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
