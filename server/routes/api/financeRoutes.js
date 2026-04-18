// /routes/finance.js
const router = require('express').Router();
const { getFinanceSummary, getMonthlySeries, getFinanceOverview, 
    getMonthlyProfitSeries
 } = require('../../controllers/financeControllers.js');
const { adminRouteLimiter } = require('../../middleware/rateLimiters');
const { authMiddleware } = require('../../utils/auth');
const requireAdminFlag = require('../../middleware/requireAdminFlag');

router.use(adminRouteLimiter);
router.use(authMiddleware);
router.use(requireAdminFlag);

router.get('/summary', getFinanceSummary);       // cards/totals for a range
router.get('/monthly-series', getMonthlySeries); // chart (monthly buckets)
router.get('/overview', getFinanceOverview);
router.get('/monthly-profit', getMonthlyProfitSeries);

module.exports = router;
