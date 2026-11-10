const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ error: "Missing authorization header." });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "readlens-dev-secret-key-12345");
    req.user = decoded; // { userId, email }
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token." });
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET || "readlens-dev-secret-key-12345");
    } catch {
      // ignore token error in optional mode
    }
  }
  next();
}

module.exports = { authMiddleware, optionalAuth };
