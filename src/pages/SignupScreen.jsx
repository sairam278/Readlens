import { useState } from "react";
import LogoMark from "../components/LogoMark";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HAS_NUMBER  = /\d/;
const HAS_SPECIAL = /[!@#$%^&*(),.?":{}|<>]/;

function calcStrength(pw) {
  if (pw.length === 0) return 0;
  if (pw.length < 6) return 1;
  const hasNum = HAS_NUMBER.test(pw);
  const hasSpec = HAS_SPECIAL.test(pw);
  if (pw.length >= 10 && (hasNum || hasSpec)) return 4;
  if (pw.length >= 8 && (hasNum || hasSpec)) return 3;
  if (pw.length >= 8) return 2;
  return 1;
}

const STRENGTH_LABEL = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLOR = ["", "bg-danger", "bg-gold/60", "bg-gold", "bg-emerald"];

export default function SignupScreen({ go, onLogin }) {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const strength = calcStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError("Please enter your full name."); return; }
    if (!email) { setError("Please enter your email."); return; }
    if (!EMAIL_RE.test(email)) { setError("Please enter a valid email address."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Signup failed. Please try a different email.");
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
      setError(err.message || "Unable to complete registration.");
    } finally {
      setLoading(false);
    }
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
          <h1 className="font-serif text-2xl font-bold text-ink mb-1">Create your account</h1>
          <p className="text-sm text-muted">Free forever · No credit card required</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-line rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Name */}
            <div>
              <label htmlFor="signup-name" className="text-xs font-semibold text-muted uppercase tracking-[0.08em] block mb-1.5">
                Full name
              </label>
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setError(""); }}
                placeholder="Ada Lovelace"
                autoComplete="name"
                className="w-full bg-surface border border-line rounded-xl px-4 py-3 text-sm text-ink placeholder:text-muted outline-none focus:border-gold-dim transition-colors font-sans"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" className="text-xs font-semibold text-muted uppercase tracking-[0.08em] block mb-1.5">
                Email
              </label>
              <input
                id="signup-email"
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
              <label htmlFor="signup-password" className="text-xs font-semibold text-muted uppercase tracking-[0.08em] block mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
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

              {/* Password strength */}
              {password.length > 0 && (
                <div className="mt-2 animate-fade-in">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? STRENGTH_COLOR[strength] : "bg-line"}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted">
                    {STRENGTH_LABEL[strength]}
                    {strength <= 2 && password.length >= 6 && (
                      <span className="ml-1 opacity-70">— add numbers or symbols to strengthen</span>
                    )}
                  </p>
                </div>
              )}
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
              <span>{loading ? "Creating account…" : "Create account"}</span>
            </button>

            <p className="text-xs text-muted text-center leading-relaxed">
              By signing up you agree to our{" "}
              <span className="text-gold hover:text-gold-light cursor-pointer transition-colors">Terms</span>
              {" "}and{" "}
              <span className="text-gold hover:text-gold-light cursor-pointer transition-colors">Privacy Policy</span>.
            </p>
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
          Already have an account?{" "}
          <button
            onClick={() => go("login")}
            className="text-gold hover:text-gold-light transition-colors cursor-pointer font-semibold"
          >
            Log in
          </button>
        </p>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-line">
          {[
            { val: "3.2×", label: "WPM improvement" },
            { val: "12k+", label: "Active readers" },
            { val: "Free", label: "Forever plan" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="font-serif text-base font-bold text-gold">{s.val}</div>
              <div className="text-xs text-muted mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
