// /controllers/financeController.js
const Booking = require('../models/Booking.js');
const Expense = require('../models/Expenses.js');

// --- Helper functions for native Date ---
function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function startOfMonth(date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfMonth(date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1, 0); // set to last day of current month
  d.setHours(23, 59, 59, 999);
  return d;
}

const getFinanceSummary = async (req, res) => {
  try {
    const {
      from,
      to,
      statuses,          // comma separated
      includeHidden = 'false'
    } = req.query;

    const now = new Date();
    const start = from ? startOfDay(new Date(from)) : startOfMonth(now);
    const end   = to   ? endOfDay(new Date(to))     : endOfMonth(now);
    console.log(start);
    console.log(end);

    const statusArr = statuses ? statuses.split(',') : undefined;

    const bookingMatch = {
      date: { $gte: start, $lte: end },
    };
    if (!JSON.parse(includeHidden)) bookingMatch.hidden = { $ne: true };
    if (statusArr && statusArr.length) bookingMatch.status = { $in: statusArr };

    const expenseMatch = {
      date: { $gte: start, $lte: end },
    };

    const [incomeAgg, expenseAgg] = await Promise.all([
      Booking.aggregate([
        { $match: bookingMatch },
        {
          $group: {
            _id: '$status',
            total: { $sum: { $ifNull: ['$income', 0] } },
            count: { $sum: 1 }
          }
        }
      ]),
      Expense.aggregate([
        { $match: expenseMatch },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const totalsByStatus = incomeAgg.reduce((acc, cur) => {
      acc[cur._id] = { total: cur.total, count: cur.count };
      return acc;
    }, {});

    const recognizedIncome = (totalsByStatus.completed?.total || 0);
    const projectedIncome  = (totalsByStatus.pending?.total || 0) + (totalsByStatus.confirmed?.total || 0);
    const cancelledIncome  = (totalsByStatus.cancelled?.total || 0);

    const totalExpenses = expenseAgg.reduce((s, e) => s + e.total, 0);

    res.json({
      period: { from: start, to: end },
      income: {
        recognized: recognizedIncome,
        projected: projectedIncome,
        cancelled: cancelledIncome,
        byStatus: totalsByStatus
      },
      expenses: {
        total: totalExpenses,
        byCategory: expenseAgg
      },
      netProfit: recognizedIncome - totalExpenses
    });
  } catch (err) {
    console.error('getFinanceSummary error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

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

module.exports = {
  getFinanceSummary,
  getMonthlySeries
};
