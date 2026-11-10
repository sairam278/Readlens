const express      = require("express");
const { supabase } = require("../db/supabase");
const { callGemini, cleanJson, streamGemini } = require("../services/gemini");
const { buildSimplifyPrompt }   = require("../prompts/simplify");
const { buildDefinePrompt }     = require("../prompts/define");
const { buildQuizPrompt }       = require("../prompts/quiz");
const { buildAskPrompt }        = require("../prompts/ask");

const router = express.Router();

// POST /api/ai/simplify
// Body: { sentence, paragraphContext }
router.post("/simplify", async (req, res) => {
  try {
    const { sentence, paragraphContext } = req.body;
    if (!sentence) return res.status(400).json({ error: "sentence is required." });

    const simplified = await callGemini(buildSimplifyPrompt(sentence, paragraphContext || ""));
    res.json({ simplified });
  } catch (err) {
    console.error("AI simplify error:", err);
    res.json({
      simplified: "In simple terms: this component breaks down complex sequences into key relationships, letting the model connect related ideas without reading step-by-step.",
      fallback: true
    });
  }
});

// POST /api/ai/analogy
// Body: { concept, context }
router.post("/analogy", async (req, res) => {
  try {
    const { concept, context } = req.body;
    const prompt = `Explain the following concept using an intuitive, vivid real-world analogy (ELI5 style). Keep it within 2-3 sentences.
Concept: ${concept || "Self-Attention"}
Context: ${context || ""}`;
    const analogy = await callGemini(prompt);
    res.json({ analogy });
  } catch (err) {
    console.error("AI analogy error:", err);
    res.json({
      analogy: "Imagine an index in a library book: instead of flipping through all 500 pages one by one, you jump directly to the cross-referenced terms that matter most.",
      fallback: true
    });
  }
});

// POST /api/ai/define
// Body: { word, sentence }
router.post("/define", async (req, res) => {
  try {
    const { word, sentence } = req.body;
    if (!word) return res.status(400).json({ error: "word is required." });

    // Attempt cache check if Supabase is connected
    try {
      if (supabase) {
        const { data: cached } = await supabase
          .from("word_cache")
          .select("definition")
          .eq("word", word.toLowerCase())
          .maybeSingle();

        if (cached) return res.json({ definition: cached.definition, cached: true });
      }
    } catch {
      // Supabase cache bypassed if not configured
    }

    const definition = await callGemini(buildDefinePrompt(word, sentence || ""));

    try {
      if (supabase) {
        await supabase
          .from("word_cache")
          .insert({ word: word.toLowerCase(), definition });
      }
    } catch {
      // ignore cache write failures
    }

    res.json({ definition, cached: false });
  } catch (err) {
    console.error("AI define error:", err);
    res.json({
      definition: `A core technical component or method used to process representations in the model.`,
      fallback: true
    });
  }
});

// POST /api/ai/quiz
// Body: { sectionText, sectionName }
router.post("/quiz", async (req, res) => {
  try {
    const { sectionText, sectionName } = req.body;
    if (!sectionText) return res.status(400).json({ error: "sectionText is required." });

    const raw = await callGemini(buildQuizPrompt(sectionText, sectionName || "Section"), { json: true });
    let questions;
    try {
      questions = JSON.parse(cleanJson(raw));
    } catch (parseErr) {
      console.warn("JSON parse retry for quiz:", parseErr.message);
      questions = JSON.parse(cleanJson(raw));
    }
    res.json({ questions: Array.isArray(questions) ? questions : [questions] });
  } catch (err) {
    console.error("AI quiz error:", err);
    res.json({
      questions: [
        {
          id: 1,
          question: "What is the key advantage of self-attention mechanisms?",
          options: [
            "Constant path length between any two sequence positions",
            "Linear time complexity with infinite sequence lengths",
            "Elimination of all feed-forward computations",
            "Zero memory usage during inference"
          ],
          answer: 0,
          explanation: "Self-attention connects all positions with a constant number of sequentially executed operations.",
          concept: "Self-Attention"
        }
      ],
      fallback: true
    });
  }
});

// POST /api/ai/ask
// Body: { question, visiblePageText, mode }
router.post("/ask", async (req, res) => {
  try {
    const { question, visiblePageText, mode } = req.body;
    if (!question)
      return res.status(400).json({ error: "question is required." });

    let prompt;
    if (mode === "analogy") {
      prompt = `Provide a friendly, memorable real-world analogy for: "${question}". Context: ${visiblePageText || ""}`;
    } else if (mode === "deepdive") {
      prompt = `Provide a mathematically and conceptually precise technical explanation for: "${question}". Context: ${visiblePageText || ""}`;
    } else {
      prompt = buildAskPrompt(question, visiblePageText || "");
    }

    const answer = await callGemini(prompt);
    res.json({ answer });
  } catch (err) {
    console.error("AI ask error:", err);
    res.json({
      answer: "In this architecture, queries and keys are compared using scaled dot-products to determine how much attention each token should place on every other token.",
      fallback: true
    });
  }
});

// GET /api/ai/stream
// Query params: question, visiblePageText, mode
router.get("/stream", async (req, res) => {
  const { question, visiblePageText, mode } = req.query;
  if (!question) {
    return res.status(400).json({ error: "question query parameter is required." });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  let prompt;
  if (mode === "analogy") {
    prompt = `Provide a friendly, memorable real-world analogy for: "${question}". Context: ${visiblePageText || ""}`;
  } else if (mode === "deepdive") {
    prompt = `Provide a mathematically and conceptually precise technical explanation for: "${question}". Context: ${visiblePageText || ""}`;
  } else if (mode === "simplify") {
    prompt = `Rewrite and simplify this in crystal clear plain English: "${question}". Context: ${visiblePageText || ""}`;
  } else {
    prompt = buildAskPrompt(question, visiblePageText || "");
  }

  try {
    await streamGemini(prompt, (chunk) => {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    });
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (streamErr) {
    console.error("SSE stream error:", streamErr);
    res.write(`data: ${JSON.stringify({ chunk: " An error occurred during response streaming." })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  }
});

module.exports = router;
