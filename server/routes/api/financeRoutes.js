// /routes/finance.js
const router = require('express').Router();
const { getFinanceSummary, getMonthlySeries, getFinanceOverview } = require('../../controllers/financeControllers.js');

router.get('/summary', getFinanceSummary);       // cards/totals for a range
router.get('/monthly-series', getMonthlySeries); // chart (monthly buckets)
router.get('/overview', getFinanceOverview);

module.exports = router;
