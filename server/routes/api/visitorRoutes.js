const router = require('express').Router();
const {incrementVisitorCount, getVisitorCount, logVisit, getDailyVisitors, migrateData, getVisits } = require('../../controllers/visitorController');

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

// router.get('/daily', getDailyVisitors); // Get daily visitors
// router.post('/migrate', migrateData); // Migrate data


module.exports = router;
