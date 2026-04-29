const express      = require("express");
const { supabase } = require("../db/supabase");

const router = express.Router();

// GET /api/users/stats
router.get("/stats", async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const { data: sessions, error } = await supabase
      .from("reading_sessions")
      .select("avg_wpm, comprehension_score, pages_read, started_at, document_id")
      .eq("user_id", userId)
      .not("ended_at", "is", null)
      .order("started_at", { ascending: true });

    if (error) throw error;

    const totalDocs        = new Set(sessions.map((s) => s.document_id)).size;
    const wpms             = sessions.map((s) => s.avg_wpm).filter(Boolean);
    const scores           = sessions.map((s) => s.comprehension_score).filter(Boolean);
    const avgWpm           = wpms.length   ? Math.round(wpms.reduce((a, b) => a + b, 0) / wpms.length)   : 0;
    const avgComprehension = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const bestWpm          = wpms.length   ? Math.max(...wpms)   : 0;
    const bestScore        = scores.length ? Math.max(...scores) : 0;

    const comprehensionTrend = sessions.slice(-10).map((s) => ({
      date:  s.started_at,
      score: s.comprehension_score,
      wpm:   s.avg_wpm,
    }));

    res.json({
      totalDocs,
      avgWpm,
      avgComprehension,
      personalBests: { wpm: bestWpm, comprehensionScore: bestScore },
      comprehensionTrend,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
