const express      = require("express");
const { supabase } = require("../db/supabase");

const router = express.Router();

// POST /api/sessions/start
// Body: { documentId }
router.post("/start", async (req, res, next) => {
  try {
    const { documentId } = req.body;
    if (!documentId) return res.status(400).json({ error: "documentId is required." });

    const { data, error } = await supabase
      .from("reading_sessions")
      .insert({ user_id: req.user.userId, document_id: documentId })
      .select("id")
      .single();

    if (error) throw error;
    res.status(201).json({ id: data.id });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/sessions/:id/progress
// Body: { pagesRead, avgWpm }
router.patch("/:id/progress", async (req, res, next) => {
  try {
    const { pagesRead, avgWpm } = req.body;
    const { error } = await supabase
      .from("reading_sessions")
      .update({ pages_read: pagesRead, avg_wpm: avgWpm })
      .eq("id", req.params.id)
      .eq("user_id", req.user.userId);

    if (error) throw error;
    res.json({ message: "Progress saved." });
  } catch (err) {
    next(err);
  }
});

// POST /api/sessions/:id/complete
// Body: { pagesRead, avgWpm, comprehensionScore }
router.post("/:id/complete", async (req, res, next) => {
  try {
    const { pagesRead, avgWpm, comprehensionScore } = req.body;
    const { error } = await supabase
      .from("reading_sessions")
      .update({
        ended_at:            new Date().toISOString(),
        pages_read:          pagesRead,
        avg_wpm:             avgWpm,
        comprehension_score: comprehensionScore,
      })
      .eq("id", req.params.id)
      .eq("user_id", req.user.userId);

    if (error) throw error;

    const { data } = await supabase
      .from("reading_sessions")
      .select("*")
      .eq("id", req.params.id)
      .single();

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/sessions/:id/section
// Body: { sectionName, timeSpentSeconds, wpm }
router.post("/:id/section", async (req, res, next) => {
  try {
    const { sectionName, timeSpentSeconds, wpm } = req.body;
    const { data, error } = await supabase
      .from("section_progress")
      .insert({
        session_id:         req.params.id,
        section_name:       sectionName,
        time_spent_seconds: timeSpentSeconds,
        wpm,
      })
      .select("id")
      .single();

    if (error) throw error;
    res.status(201).json({ id: data.id });
  } catch (err) {
    next(err);
  }
});

// POST /api/sessions/:id/quiz-attempt
// Body: { sectionName, question, correctAnswer, userAnswer, isCorrect }
router.post("/:id/quiz-attempt", async (req, res, next) => {
  try {
    const { sectionName, question, correctAnswer, userAnswer, isCorrect } = req.body;
    const { data, error } = await supabase
      .from("quiz_attempts")
      .insert({
        session_id:     req.params.id,
        section_name:   sectionName,
        question,
        correct_answer: correctAnswer,
        user_answer:    userAnswer,
        is_correct:     isCorrect,
      })
      .select("id")
      .single();

    if (error) throw error;
    res.status(201).json({ id: data.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
