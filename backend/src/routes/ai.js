const express      = require("express");
const { supabase } = require("../db/supabase");
const { callGemini }          = require("../services/gemini");
const { buildSimplifyPrompt } = require("../prompts/simplify");
const { buildDefinePrompt }   = require("../prompts/define");
const { buildQuizPrompt }     = require("../prompts/quiz");
const { buildAskPrompt }      = require("../prompts/ask");

const router = express.Router();

// POST /api/ai/simplify
// Body: { sentence, paragraphContext }
router.post("/simplify", async (req, res) => {
  try {
    const { sentence, paragraphContext } = req.body;
    if (!sentence) return res.status(400).json({ error: "sentence is required." });

    const simplified = await callGemini(buildSimplifyPrompt(sentence, paragraphContext || ""));
    res.json({ simplified });
  } catch {
    res.json({ fallback: true, error: "AI unavailable, try again." });
  }
});

// POST /api/ai/define
// Body: { word, sentence }
router.post("/define", async (req, res) => {
  try {
    const { word, sentence } = req.body;
    if (!word) return res.status(400).json({ error: "word is required." });

    // Check word cache first — avoids repeat Gemini calls
    const { data: cached } = await supabase
      .from("word_cache")
      .select("definition")
      .eq("word", word.toLowerCase())
      .maybeSingle();

    if (cached)
      return res.json({ definition: cached.definition, cached: true });

    const definition = await callGemini(buildDefinePrompt(word, sentence || ""));

    await supabase
      .from("word_cache")
      .insert({ word: word.toLowerCase(), definition });

    res.json({ definition, cached: false });
  } catch {
    res.json({ fallback: true, error: "AI unavailable, try again." });
  }
});

// POST /api/ai/quiz
// Body: { sectionText, sectionName }
router.post("/quiz", async (req, res) => {
  try {
    const { sectionText, sectionName } = req.body;
    if (!sectionText) return res.status(400).json({ error: "sectionText is required." });

    const raw       = await callGemini(buildQuizPrompt(sectionText, sectionName || "Section"));
    const questions = JSON.parse(raw);
    res.json({ questions });
  } catch {
    res.json({ fallback: true, error: "AI unavailable, try again." });
  }
});

// POST /api/ai/ask
// Body: { question, visiblePageText }
router.post("/ask", async (req, res) => {
  try {
    const { question, visiblePageText } = req.body;
    if (!question || !visiblePageText)
      return res.status(400).json({ error: "question and visiblePageText are required." });

    const answer = await callGemini(buildAskPrompt(question, visiblePageText));
    res.json({ answer });
  } catch {
    res.json({ fallback: true, error: "AI unavailable, try again." });
  }
});

module.exports = router;
