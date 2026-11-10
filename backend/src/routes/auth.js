const express        = require("express");
const bcrypt         = require("bcryptjs");
const jwt            = require("jsonwebtoken");
const { supabase }   = require("../db/supabase");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "readlens-super-secret-key-phase1-dev";

// Resilient in-memory user store for local / demo mode when Supabase is not configured
const localUsers = new Map();

// Seed a default demo user
(async () => {
  try {
    const demoHash = await bcrypt.hash("password123", 10);
    localUsers.set("sairamkandhagatla18@gmail.com", {
      id: "usr_local_demo_1",
      name: "Sairam",
      email: "sairamkandhagatla18@gmail.com",
      password_hash: demoHash,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Could not seed default local user:", err.message);
  }
})();

// POST /api/auth/signup
router.post("/signup", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }
    const cleanEmail = email.toLowerCase().trim();

    // 1. If Supabase is connected, try Supabase first
    if (supabase) {
      try {
        const { data: existing } = await supabase
          .from("users")
          .select("id")
          .eq("email", cleanEmail)
          .maybeSingle();

        if (existing) {
          return res.status(409).json({ error: "An account with this email already exists." });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const { data: user, error } = await supabase
          .from("users")
          .insert({ name: name.trim(), email: cleanEmail, password_hash: passwordHash })
          .select("id, name, email")
          .single();

        if (error) throw error;

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
        return res.status(201).json({ token, user });
      } catch (sbErr) {
        console.warn("Supabase signup failed, falling back to local store:", sbErr.message);
      }
    }

    // 2. Local fallback user store
    if (localUsers.has(cleanEmail)) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = "usr_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
    const user = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      password_hash: passwordHash,
      created_at: new Date().toISOString(),
    };
    localUsers.set(cleanEmail, user);

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    return res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    const cleanEmail = email.toLowerCase().trim();

    // 1. If Supabase is connected, try Supabase first
    if (supabase) {
      try {
        const { data: user } = await supabase
          .from("users")
          .select("id, name, email, password_hash")
          .eq("email", cleanEmail)
          .maybeSingle();

        if (user) {
          const valid = await bcrypt.compare(password, user.password_hash);
          if (!valid) {
            return res.status(401).json({ error: "Invalid email or password." });
          }
          const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
          return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
        }
      } catch (sbErr) {
        console.warn("Supabase login check failed, falling back to local store:", sbErr.message);
      }
    }

    // 2. Local fallback user store
    const user = localUsers.get(cleanEmail);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me (validates current session token)
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing authentication token." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // 1. If Supabase is connected
    if (supabase) {
      try {
        const { data: user } = await supabase
          .from("users")
          .select("id, name, email, created_at")
          .eq("id", decoded.userId)
          .maybeSingle();

        if (user) return res.json(user);
      } catch (sbErr) {
        console.warn("Supabase /me lookup failed:", sbErr.message);
      }
    }

    // 2. Local lookup by email
    const localUser = localUsers.get(decoded.email);
    if (localUser) {
      return res.json({
        id: localUser.id,
        name: localUser.name,
        email: localUser.email,
        created_at: localUser.created_at,
      });
    }

    // If decoded token is valid but local memory reset, return decoded token user info
    return res.json({
      id: decoded.userId,
      name: decoded.email.split("@")[0],
      email: decoded.email,
      created_at: new Date().toISOString(),
    });
  } catch {
    res.status(401).json({ error: "Invalid or expired token." });
  }
});

module.exports = router;
