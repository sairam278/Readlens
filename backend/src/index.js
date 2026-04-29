require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const authRouter      = require("./routes/auth");
const documentsRouter = require("./routes/documents");
const aiRouter        = require("./routes/ai");
const sessionsRouter  = require("./routes/sessions");
const usersRouter     = require("./routes/users");
const { authMiddleware } = require("./middleware/auth");
const { aiRateLimiter }  = require("./middleware/rateLimit");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

// ── Health check ────────────────────────────────────────────
app.get("/health", (req, res) => res.json({ status: "ok", stack: "MySQL + Gemini" }));

// ── Public routes (no token needed) ─────────────────────────
app.use("/api/auth", authRouter);

// ── Protected routes (valid JWT required) ───────────────────
app.use("/api/documents", authMiddleware, documentsRouter);
app.use("/api/ai",        authMiddleware, aiRateLimiter, aiRouter);
app.use("/api/sessions",  authMiddleware, sessionsRouter);
app.use("/api/users",     authMiddleware, usersRouter);

// ── Global error handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => console.log(`ReadLens API running on port ${PORT}`));
