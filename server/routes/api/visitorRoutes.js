const router = require('express').Router();
const {logVisit, getDailyVisitors, migrateData, getVisits, generateWeeklyReport, logInteraction, updateScrollDepth, updateSessionDuration,
    sessionHeartbeat, sessionExit,
    getWeeklyReport, getDailyReport
 } = require('../../controllers/visitorController');

// router.route('/').get(getVisitorCount).post(incrementVisitorCount);
// router.get('/', getVisitorCount);
// router.post('/increment', incrementVisitorCount);

router.route('/logs')
.get(getVisits) // Get all logs
.post(logVisit);
// router.post('/log', logVisit); // Log each visit
router.route('/daily')
.get(getDailyVisitors);

router.route('/migrate')
.post(migrateData);

// router.route('/weekly-report')
// .get(generateWeeklyReport); // Generate weekly report

router.get('/daily-report', getDailyReport);
router.get('/weekly-reporting', getWeeklyReport);

router.post('/session-duration', updateSessionDuration);
router.post('/scroll-depth', updateScrollDepth);
router.post('/interaction', logInteraction);
router.post('/session-heartbeat', sessionHeartbeat);
router.post('/session-exit', sessionExit);


// router.get('/daily', getDailyVisitors); // Get daily visitors
// router.post('/migrate', migrateData); // Migrate data


module.exports = router;
