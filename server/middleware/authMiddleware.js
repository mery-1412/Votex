const jwt = require("jsonwebtoken");

const sessionStore = require("../sessionStore");


exports.authMiddleware = (req, res, next) => {
  console.log("Cookies received:", req.cookies); // Debug log

  const sessionId = req.cookies.sessionId;
  if (!sessionId) {
    console.log("❌ No sessionId found in cookies");
    return res.status(401).json({ error: "Unauthorized: No session found" });
  }

  const token = sessionStore.get(sessionId);
  console.log("Session ID:", sessionId);
  console.log("Retrieved Token:", token); // Check if token exists

  if (!token) {
    console.log("❌ Invalid sessionId:", sessionId);
    return res.status(401).json({ error: "Unauthorized: Invalid session" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ JWT Decoded:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("❌ JWT Verification Failed:", error.message);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};
