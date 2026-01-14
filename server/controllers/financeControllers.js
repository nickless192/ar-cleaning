// /controllers/financeController.js
const Booking = require('../models/Booking.js');
const Expense = require('../models/Expenses.js');
const { startOfDay, endOfDay, startOfMonth, endOfMonth, addMonths } = require('date-fns');
// const { addMonths } = require('date-fns');

// --- Helper functions for native Date ---
// function startOfDay(date) {
//   const d = new Date(date);
//   d.setHours(0, 0, 0, 0);
//   return d;
// }

// function endOfDay(date) {
//   const d = new Date(date);
//   d.setHours(23, 59, 59, 999);
//   return d;
// }

// function startOfMonth(date) {
//   const d = new Date(date);
//   d.setDate(1);
//   d.setHours(0, 0, 0, 0);
//   return d;
// }

// function endOfMonth(date) {
//   const d = new Date(date);
//   d.setMonth(d.getMonth() + 1, 0); // set to last day of current month
//   d.setHours(23, 59, 59, 999);
//   return d;
// }

const STATUS = {
  EARNED: ['completed', 'done'],
  CASH: ['paid'],
  PIPELINE: ['pending', 'confirmed', 'in progress'],
  CANCELLED: ['cancelled'],
};

function toInt(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function safeBool(v, fallback = false) {
  if (v === undefined || v === null) return fallback;
  if (typeof v === 'boolean') return v;
  return String(v).toLowerCase() === 'true';
}
function parseCsv(str) {
  if (!str) return null;
  return String(str).split(',').map(s => s.trim()).filter(Boolean);
}
function monthKeyUTC(date) {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  return `${y}-${String(m).padStart(2, '0')}`;
}
function addMonthsUTC(date, months) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0));
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

// Fiscal helpers (optional, keep if you want FY support)
function fiscalYearRange(fiscalYear, fyStartMonth = 6) {
  const fy = toInt(fiscalYear, null);
  const sm = toInt(fyStartMonth, 1);
  if (!fy || sm < 1 || sm > 12) return null;
  const startYear = sm === 1 ? fy : fy - 1;
  const start = new Date(Date.UTC(startYear, sm - 1, 1, 0, 0, 0));
  const endExclusive = new Date(Date.UTC(startYear + 1, sm - 1, 1, 0, 0, 0));
  return { start, endExclusive };
}

// function getPeriodFromQuery(q) {
//   const now = new Date();
//   const fyStartMonth = toInt(q.fyStartMonth, 6);

//   if (q.from && q.to) {
//     return {
//       start: startOfDay(new Date(q.from)),
//       end: endOfDay(new Date(q.to)),
//       mode: 'custom',
//       fyStartMonth,
//     };
//   }

//   if (q.fiscalYear) {
//     const fy = fiscalYearRange(q.fiscalYear, fyStartMonth);
//     if (!fy) throw new Error('Invalid fiscalYear or fyStartMonth');
//     return {
//       start: startOfDay(fy.start),
//       end: endOfDay(new Date(fy.endExclusive.getTime() - 1)),
//       mode: 'fiscalYear',
//       fiscalYear: toInt(q.fiscalYear),
//       fyStartMonth,
//     };
//   }

//   // default: this month
//   return {
//     start: startOfDay(startOfMonth(now)),
//     end: endOfDay(endOfMonth(now)),
//     mode: 'thisMonth',
//     fyStartMonth,
//   };
// }
function parseDateOnlyLocal(dateStr, endOfDayFlag = false) {
  // dateStr like "2025-12-01"
  // Force local-time parsing (not UTC) so it doesn't shift a day.
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T00:00:00`);
  if (endOfDayFlag) return endOfDay(d);
  return startOfDay(d);
}

function getPeriodFromQuery(q) {
  const now = new Date();
  const fyStartMonth = toInt(q.fyStartMonth, 6);

  // ✅ Only treat as "custom" if BOTH from and to are present
  if (q.from && q.to) {
    const start = parseDateOnlyLocal(q.from, false);
    const end = parseDateOnlyLocal(q.to, true);
    return {
      start,
      end,
      mode: 'custom',
      fyStartMonth,
    };
  }

  if (q.fiscalYear) {
    const fy = fiscalYearRange(q.fiscalYear, fyStartMonth);
    if (!fy) throw new Error('Invalid fiscalYear or fyStartMonth');
    return {
      start: startOfDay(fy.start),
      end: endOfDay(new Date(fy.endExclusive.getTime() - 1)),
      mode: 'fiscalYear',
      fiscalYear: toInt(q.fiscalYear),
      fyStartMonth,
    };
  }

  // ✅ default: current month (backend decides)
  return {
    start: startOfDay(startOfMonth(now)),
    end: endOfDay(endOfMonth(now)),
    mode: 'thisMonth',
    fyStartMonth,
  };
}


/**
 * GET /api/finance/summary
 * Query:
 *  - from,to OR fiscalYear (+fyStartMonth)
 *  - includeHidden=false
 *  - customerField=customerId|customerEmail|customerName (default customerId)
 *  - forecastMonths=6
 *  - forecastLookbackMonths=6
 *  - weightConfirmed=1.0
 *  - weightPending=0.6
 *  - weightInProgress=0.8
 */
const getFinanceSummary = async (req, res) => {
  try {
    const period = getPeriodFromQuery(req.query);

    const includeHidden = safeBool(req.query.includeHidden, false);
    const customerField = req.query.customerField || 'customerId';

    const forecastMonths = Math.max(1, toInt(req.query.forecastMonths, 3));
    const lookbackMonths = Math.max(1, toInt(req.query.forecastLookbackMonths, 6));

    const wConfirmed = Number(req.query.weightConfirmed ?? 1.0);
    const wPending = Number(req.query.weightPending ?? 0.6);
    const wInProgress = Number(req.query.weightInProgress ?? 0.8);

    // Base match for the reporting window uses Booking.date (scheduled service date).
    const baseMatch = {
      date: { $gte: period.start, $lte: period.end },
      ...(includeHidden ? {} : { hidden: { $ne: true } }),
    };

    // 1) Totals by status (raw)
    const byStatusAgg = await Booking.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: '$status',
          total: { $sum: { $ifNull: ['$income', 0] } },
          count: { $sum: 1 },
        },
      },
    ]);

    const byStatus = byStatusAgg.reduce((acc, cur) => {
      acc[cur._id] = { total: cur.total, count: cur.count };
      return acc;
    }, {});

    // 2) Bucket totals (earned/cash/pipeline/cancelled)
    const earnedTotal =
      (byStatus.completed?.total || 0) + (byStatus.done?.total || 0);

    const cashTotal =
      (byStatus.paid?.total || 0); // you can also calculate by paidAt if you prefer

    const pipelineTotalRaw =
      (byStatus.confirmed?.total || 0) +
      (byStatus.pending?.total || 0) +
      (byStatus['in progress']?.total || 0);

    const pipelineWeighted =
      (byStatus.confirmed?.total || 0) * (Number.isFinite(wConfirmed) ? wConfirmed : 1.0) +
      (byStatus.pending?.total || 0) * (Number.isFinite(wPending) ? wPending : 0.6) +
      (byStatus['in progress']?.total || 0) * (Number.isFinite(wInProgress) ? wInProgress : 0.8);

    const cancelledTotal = (byStatus.cancelled?.total || 0);

    // 3) Monthly series:
    // - Earned should ideally use completedAt when present, else fallback to date.
    // - Cash should use paidAt when present, else fallback to date.
    const monthlyAgg = await Booking.aggregate([
      { $match: baseMatch },
      {
        $addFields: {
          earnedDate: { $ifNull: ['$completedAt', '$date'] },
          cashDate: { $ifNull: ['$paidAt', '$date'] },
        },
      },
      {
        $project: {
          status: 1,
          income: { $ifNull: ['$income', 0] },
          earnedMonth: { $dateToString: { format: '%Y-%m', date: '$earnedDate' } },
          cashMonth: { $dateToString: { format: '%Y-%m', date: '$cashDate' } },
        },
      },
      {
        $facet: {
          earned: [
            { $match: { status: { $in: STATUS.EARNED } } },
            {
              $group: {
                _id: '$earnedMonth',
                total: { $sum: '$income' },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
          cash: [
            { $match: { status: { $in: STATUS.CASH } } },
            {
              $group: {
                _id: '$cashMonth',
                total: { $sum: '$income' },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
          pipeline: [
            { $match: { status: { $in: STATUS.PIPELINE } } },
            {
              $group: {
                _id: '$earnedMonth',
                total: { $sum: '$income' },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ]);

    const earnedSeries = (monthlyAgg?.[0]?.earned || []).map(x => ({ month: x._id, total: x.total, count: x.count }));
    const cashSeries = (monthlyAgg?.[0]?.cash || []).map(x => ({ month: x._id, total: x.total, count: x.count }));
    const pipelineSeries = (monthlyAgg?.[0]?.pipeline || []).map(x => ({ month: x._id, total: x.total, count: x.count }));

    // 4) By customer (Top 50)
    const customerAgg = await Booking.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: `$${customerField}`,
          earned: {
            $sum: {
              $cond: [{ $in: ['$status', STATUS.EARNED] }, { $ifNull: ['$income', 0] }, 0],
            },
          },
          cash: {
            $sum: {
              $cond: [{ $in: ['$status', STATUS.CASH] }, { $ifNull: ['$income', 0] }, 0],
            },
          },
          confirmed: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, { $ifNull: ['$income', 0] }, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, { $ifNull: ['$income', 0] }, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in progress'] }, { $ifNull: ['$income', 0] }, 0] },
          },
          count: { $sum: 1 },
        },
      },
      {
        $addFields: {
          pipelineWeighted: {
            $add: [
              { $multiply: ['$confirmed', Number.isFinite(wConfirmed) ? wConfirmed : 1.0] },
              { $multiply: ['$pending', Number.isFinite(wPending) ? wPending : 0.6] },
              { $multiply: ['$inProgress', Number.isFinite(wInProgress) ? wInProgress : 0.8] },
            ],
          },
        },
      },
      { $sort: { earned: -1 } },
      { $limit: 50 },
    ]);

    const byCustomer = customerAgg.map(r => ({
      customer: r._id ?? 'Unknown',
      earned: r.earned,
      cash: r.cash,
      pipelineWeighted: r.pipelineWeighted,
      bookings: r.count,
    }));

    // 5) Forecast: avg earned/month over last X months (service completion-based)
    const forecastStart = period.end; // or new Date() if you want “from now”
    const lookbackStart = addMonths(forecastStart, -lookbackMonths);

    const historyAgg = await Booking.aggregate([
      {
        $match: {
          ...(includeHidden ? {} : { hidden: { $ne: true } }),
          status: { $in: STATUS.EARNED },
          // Use completedAt if you want more accurate earned history; fallback to date in $addFields.
          date: { $lte: forecastStart }, // coarse filter
        },
      },
      {
        $addFields: {
          earnedDate: { $ifNull: ['$completedAt', '$date'] },
        },
      },
      {
        $match: {
          earnedDate: { $gte: lookbackStart, $lte: forecastStart },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$earnedDate' } },
          total: { $sum: { $ifNull: ['$income', 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const historyMap = new Map(historyAgg.map(x => [x._id, x.total]));
    const historyTotals = [];
    for (let i = lookbackMonths - 1; i >= 0; i--) {
      const d = addMonths(forecastStart, -i);
      historyTotals.push(historyMap.get(monthKeyUTC(d)) || 0);
    }

    const avgEarnedPerMonth =
      historyTotals.reduce((a, b) => a + b, 0) / Math.max(1, historyTotals.length);

    const forecast = [];
    for (let i = 1; i <= forecastMonths; i++) {
      const d = addMonths(forecastStart, i);
      forecast.push({
        month: monthKeyUTC(d),
        forecastEarned: avgEarnedPerMonth,
      });
    }

    res.json({
      period: {
        from: period.start,
        to: period.end,
        mode: period.mode,
        fiscalYear: period.fiscalYear,
        fyStartMonth: period.fyStartMonth,
      },
      income: {
        earned: earnedTotal,
        cashReceived: cashTotal,
        pipelineRaw: pipelineTotalRaw,
        pipelineWeighted,
        cancelled: cancelledTotal,
        byStatus,
      },
      series: {
        earned: earnedSeries,
        cash: cashSeries,
        pipeline: pipelineSeries,
      },
      customers: {
        field: customerField,
        top: byCustomer,
      },
      forecast: {
        months: forecastMonths,
        lookbackMonths,
        avgEarnedPerMonth,
        items: forecast,
        weights: { confirmed: wConfirmed, pending: wPending, inProgress: wInProgress },
      },
    });
  } catch (err) {
    console.error('getFinanceSummary error', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
};

// const getFinanceSummary = async (req, res) => {
//   try {
//     const {
//       from,
//       to,
//       statuses,          // comma separated
//       includeHidden = 'false'
//     } = req.query;

//     const now = new Date();
//     const start = from ? startOfDay(new Date(from)) : startOfMonth(now);
//     const end   = to   ? endOfDay(new Date(to))     : endOfMonth(now);
//     console.log(start);
//     console.log(end);

//     const statusArr = statuses ? statuses.split(',') : undefined;

//     const bookingMatch = {
//       date: { $gte: start, $lte: end },
//     };
//     if (!JSON.parse(includeHidden)) bookingMatch.hidden = { $ne: true };
//     if (statusArr && statusArr.length) bookingMatch.status = { $in: statusArr };

//     const expenseMatch = {
//       date: { $gte: start, $lte: end },
//     };

//     const [incomeAgg, expenseAgg] = await Promise.all([
//       Booking.aggregate([
//         { $match: bookingMatch },
//         {
//           $group: {
//             _id: '$status',
//             total: { $sum: { $ifNull: ['$income', 0] } },
//             count: { $sum: 1 }
//           }
//         }
//       ]),
//       Expense.aggregate([
//         { $match: expenseMatch },
//         {
//           $group: {
//             _id: '$category',
//             total: { $sum: '$amount' },
//             count: { $sum: 1 }
//           }
//         }
//       ])
//     ]);

//     const totalsByStatus = incomeAgg.reduce((acc, cur) => {
//       acc[cur._id] = { total: cur.total, count: cur.count };
//       return acc;
//     }, {});

//     const recognizedIncome = (totalsByStatus.completed?.total || 0);
//     const projectedIncome  = (totalsByStatus.pending?.total || 0) + (totalsByStatus.confirmed?.total || 0);
//     const cancelledIncome  = (totalsByStatus.cancelled?.total || 0);

//     const totalExpenses = expenseAgg.reduce((s, e) => s + e.total, 0);

//     res.json({
//       period: { from: start, to: end },
//       income: {
//         recognized: recognizedIncome,
//         projected: projectedIncome,
//         cancelled: cancelledIncome,
//         byStatus: totalsByStatus
//       },
//       expenses: {
//         total: totalExpenses,
//         byCategory: expenseAgg
//       },
//       netProfit: recognizedIncome - totalExpenses
//     });
//   } catch (err) {
//     console.error('getFinanceSummary error', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

const getMonthlySeries = async (req, res) => {
  try {
    const { year } = req.query; // default: this year
    const y = parseInt(year || new Date().getFullYear(), 10);
    const start = new Date(y, 0, 1);
    const end   = new Date(y, 11, 31, 23, 59, 59, 999);

    const [incomeSeries, expenseSeries] = await Promise.all([
      Booking.aggregate([
        { $match: { date: { $gte: start, $lte: end }, hidden: { $ne: true } } },
        {
          $group: {
            _id: { m: { $month: '$date' }, status: '$status' },
            total: { $sum: { $ifNull: ['$income', 0] } }
          }
        }
      ]),
      Expense.aggregate([
        { $match: { date: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: { m: { $month: '$date' } },
            total: { $sum: '$amount' }
          }
        }
      ])
    ]);

    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const result = months.map(m => {
      const recognized = incomeSeries
        .filter(i => i._id.m === m && i._id.status === 'completed')
        .reduce((s, i) => s + i.total, 0);
      const projected = incomeSeries
        .filter(i => i._id.m === m && (i._id.status === 'pending' || i._id.status === 'confirmed'))
        .reduce((s, i) => s + i.total, 0);
      const expenses = expenseSeries.find(e => e._id.m === m)?.total || 0;
      return { month: m, recognized, projected, expenses, net: recognized - expenses };
    });

    res.json(result);
  } catch (err) {
    console.error('getMonthlySeries error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getFinanceOverview = async (req, res) => {
  try {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    // Fetch data
    const bookings = await Booking.find({ date: { $gte: start, $lte: end }, hidden: { $ne: true } });
    const expenses = await Expense.find({ date: { $gte: start, $lte: end } });

    // Income breakdown
    const incomeByStatus = bookings.reduce((acc, b) => {
      const key = b.status || 'unknown';
      acc[key] = (acc[key] || 0) + (b.income || 0);
      return acc;
    }, {});

    const incomeByService = bookings.reduce((acc, b) => {
      const key = b.serviceType || 'Other';
      acc[key] = (acc[key] || 0) + (b.income || 0);
      return acc;
    }, {});

    const topCustomers = bookings.reduce((acc, b) => {
      const key = b.customerName || 'Unknown';
      acc[key] = (acc[key] || 0) + (b.income || 0);
      return acc;
    }, {});
    const topCustomersArray = Object.entries(topCustomers)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Expense breakdown
    const expenseByCategory = expenses.reduce((acc, e) => {
      const key = e.category || 'Uncategorized';
      acc[key] = (acc[key] || 0) + (e.amount || 0);
      return acc;
    }, {});

    const totalIncome = Object.values(incomeByStatus).reduce((sum, v) => sum + v, 0);
    const totalExpenses = Object.values(expenseByCategory).reduce((sum, v) => sum + v, 0);
    const netProfit = totalIncome - totalExpenses;
    const avgIncomePerBooking = bookings.length > 0 ? totalIncome / bookings.length : 0;

    res.json({
      period: { start, end },
      totals: { totalIncome, totalExpenses, netProfit, avgIncomePerBooking },
      income: { byStatus: incomeByStatus, byService: incomeByService, topCustomers: topCustomersArray },
      expenses: { byCategory: expenseByCategory }
    });
  } catch (err) {
    console.error('getFinanceOverview error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

async function getMonthlyProfitSeries(req, res) {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: 'from and to are required (YYYY-MM-DD)' });
    }

    const incomeMethod = String(req.query.incomeMethod || 'accrual'); // 'accrual'|'cash'
    const includeHidden = String(req.query.includeHidden || 'false').toLowerCase() === 'true';

    const start = parseDateOnlyLocal(from, false);
    const end = parseDateOnlyLocal(to, true);

    // Build months list inclusive (used to fill 0s)
    const months = [];
    const startMonth = new Date(Date.UTC(start.getFullYear(), start.getMonth(), 1, 0, 0, 0));
    const endMonth = new Date(Date.UTC(end.getFullYear(), end.getMonth(), 1, 0, 0, 0));
    let cur = startMonth;
    while (cur <= endMonth) {
      months.push(monthKeyUTC(cur));
      cur = addMonthsUTC(cur, 1);
    }

    const bookingMatch = {
      ...(includeHidden ? {} : { hidden: { $ne: true } }),
      date: { $lte: end }, // coarse filter
    };

    // Accrual groups by completedAt||date with earned statuses
    // Cash groups by paidAt||date with paid status
    const incomeAggPipeline =
      incomeMethod === 'cash'
        ? [
            { $match: { ...bookingMatch, status: { $in: STATUS.CASH } } },
            { $addFields: { basisDate: { $ifNull: ['$paidAt', '$date'] } } },
            { $match: { basisDate: { $gte: start, $lte: end } } },
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$basisDate' } },
                total: { $sum: { $ifNull: ['$income', 0] } },
              },
            },
            { $sort: { _id: 1 } },
          ]
        : [
            { $match: { ...bookingMatch, status: { $in: STATUS.EARNED } } },
            { $addFields: { basisDate: { $ifNull: ['$completedAt', '$date'] } } },
            { $match: { basisDate: { $gte: start, $lte: end } } },
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$basisDate' } },
                total: { $sum: { $ifNull: ['$income', 0] } },
              },
            },
            { $sort: { _id: 1 } },
          ];

    const expenseAggPipeline = [
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          total: { $sum: { $ifNull: ['$amount', 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const [incomeAgg, expenseAgg] = await Promise.all([
      Booking.aggregate(incomeAggPipeline),
      Expense.aggregate(expenseAggPipeline),
    ]);

    const incomeMap = new Map(incomeAgg.map(x => [x._id, x.total]));
    const expenseMap = new Map(expenseAgg.map(x => [x._id, x.total]));

    const series = months.map(m => {
      const income = Number(incomeMap.get(m) || 0);
      const expenses = Number(expenseMap.get(m) || 0);
      return { month: m, income, expenses, net: income - expenses };
    });

    res.json({
      period: { from: start, to: end },
      incomeMethod,
      items: series,
    });
  } catch (err) {
    console.error('getMonthlyProfitSeries error', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}


module.exports = {
  getFinanceSummary,
  getMonthlySeries,
  getFinanceOverview,
  getMonthlyProfitSeries,
};
