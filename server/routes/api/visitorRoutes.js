const router = require("express").Router();
const { authMiddleware } = require('../../utils/auth');
const requireAdminFlag = require('../../middleware/requireAdminFlag');
const { adminRouteLimiter } = require('../../middleware/rateLimiters');

const {
  logVisit,
  getDailyVisitors,
  migrateData,
  getVisits,

  // reports
  getWeeklyReport,
  getDailyReport,

  // session tracking
  logInteraction,
  logEvent,
  updateScrollDepth,
  updateSessionDuration,
  sessionHeartbeat,
  sessionExit,
} = require("../../controllers/visitorController");

// ---- Logging ----
// GET /api/visitors/logs  (recent logs)
// POST /api/visitors/logs (create/update session log)
router.route("/logs")
  .get(adminRouteLimiter, authMiddleware, requireAdminFlag, getVisits)
  .post(logVisit);

// ---- Basic daily counts (legacy/simple) ----
// GET /api/visitors/daily
router.get("/daily", adminRouteLimiter, authMiddleware, requireAdminFlag, getDailyVisitors);

// ---- Migration ----
// POST /api/visitors/migrate
router.post("/migrate", adminRouteLimiter, authMiddleware, requireAdminFlag, migrateData);

// ---- Reports (recommended) ----
// GET /api/visitors/daily-report?date=YYYY-MM-DD&excludeBots=true
router.get("/daily-report", adminRouteLimiter, authMiddleware, requireAdminFlag, getDailyReport);

// GET /api/visitors/weekly-report?end=YYYY-MM-DD&days=7&excludeBots=true
router.get("/weekly-report", adminRouteLimiter, authMiddleware, requireAdminFlag, getWeeklyReport);

// Keep your old path alive if your frontend already uses it:
router.get("/weekly-reporting", adminRouteLimiter, authMiddleware, requireAdminFlag, getWeeklyReport);

// ---- Legacy endpoints (still supported) ----
router.post("/session-duration", updateSessionDuration);
router.post("/scroll-depth", updateScrollDepth);
router.post("/interaction", logInteraction);

// ---- Events (NEW) ----
// Recommended canonical:
router.post("/event", logEvent);

// Backward-compatible with your existing frontend:
router.post("/log-event", logEvent);

// ---- Session lifecycle ----
router.post("/session-heartbeat", sessionHeartbeat);
router.post("/session-exit", sessionExit);

module.exports = router;
