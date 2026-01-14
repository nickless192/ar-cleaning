// /routes/finance.js
const router = require('express').Router();
const { getFinanceSummary, getMonthlySeries, getFinanceOverview, 
    getMonthlyProfitSeries
 } = require('../../controllers/financeControllers.js');

router.get('/summary', getFinanceSummary);       // cards/totals for a range
router.get('/monthly-series', getMonthlySeries); // chart (monthly buckets)
router.get('/overview', getFinanceOverview);
router.get('/monthly-profit', getMonthlyProfitSeries);

module.exports = router;
