const rateLimit = require("express-rate-limit");

// 50 AI calls per hour per user (keyed by user ID set by authMiddleware)
const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  keyGenerator: (req) => req.user?.id || req.ip,
  handler: (req, res) => {
    res.status(429).json({
      error: "AI limit reached. You can make 50 AI requests per hour. Try again later.",
    });
  },
});

module.exports = { aiRateLimiter };
