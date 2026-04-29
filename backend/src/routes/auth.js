const express        = require("express");
const bcrypt         = require("bcryptjs");
const jwt            = require("jsonwebtoken");
const { supabase }   = require("../db/supabase");

const router = express.Router();

// POST /api/auth/signup
router.post("/signup", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "name, email, and password are required." });

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing)
      return res.status(409).json({ error: "An account with this email already exists." });

    const passwordHash = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabase
      .from("users")
      .insert({ name, email, password_hash: passwordHash })
      .select("id, name, email")
      .single();

    if (error) throw error;

    const token = jwt.sign({ userId: user.id, email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "email and password are required." });

    const { data: user } = await supabase
      .from("users")
      .select("id, name, email, password_hash")
      .eq("email", email)
      .maybeSingle();

    if (!user)
      return res.status(401).json({ error: "Invalid email or password." });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ error: "Invalid email or password." });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me  (requires token)
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer "))
      return res.status(401).json({ error: "Missing token." });

    const decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);

    const { data: user } = await supabase
      .from("users")
      .select("id, name, email, created_at")
      .eq("id", decoded.userId)
      .maybeSingle();

    if (!user) return res.status(404).json({ error: "User not found." });
    res.json(user);
  } catch {
    res.status(401).json({ error: "Invalid or expired token." });
  }
});

module.exports = router;
