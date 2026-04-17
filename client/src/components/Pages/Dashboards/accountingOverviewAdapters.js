import moment from 'moment';

/**
 * Normalize /api/finance/monthly-profit payload into a chart-friendly series.
 * API shape today: { items: [{ month: 'YYYY-MM', income, expenses, net }] }
 */
export function adaptMonthlyProfitToTrend(items = []) {
  const list = Array.isArray(items) ? items : [];

  return list
    .filter((row) => row?.month)
    .map((row) => {
      const month = String(row.month);
      const income = Number(row.income || 0);
      const expenses = Number(row.expenses || 0);
      const net = Number.isFinite(Number(row.net))
        ? Number(row.net)
        : income - expenses;

      return {
        month,
        monthLabel: moment(month, 'YYYY-MM').format('MMM YY'),
        income,
        expenses,
        profit: net,
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function getCurrentMonthMetrics(trendRows = []) {
  const currentMonth = moment().format('YYYY-MM');
  const current = trendRows.find((r) => r.month === currentMonth);

  return {
    month: currentMonth,
    income: Number(current?.income || 0),
    expenses: Number(current?.expenses || 0),
    profit: Number(current?.profit || 0),
  };
}

export function computeUnpaidInvoiceTotals(invoices = []) {
  const list = Array.isArray(invoices) ? invoices : [];

  const unpaid = list.filter((inv) => (inv?.status || 'unpaid') !== 'paid');
  const unpaidTotal = unpaid.reduce((sum, inv) => sum + Number(inv?.totalCost || 0), 0);

  return {
    unpaid,
    unpaidCount: unpaid.length,
    unpaidTotal,
  };
}

export function buildActionQueue({ invoices = [], bookings = [] } = {}) {
  const unpaidInvoices = (Array.isArray(invoices) ? invoices : [])
    .filter((inv) => (inv?.status || 'unpaid') !== 'paid')
    .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0));

  const completedUninvoicedJobs = (Array.isArray(bookings) ? bookings : [])
    .filter((b) => !b?.hidden)
    .filter((b) => ['completed', 'done'].includes(String(b?.status || '').toLowerCase()))
    .filter((b) => !b?.invoiced)
    .sort((a, b) => new Date(b?.date || 0) - new Date(a?.date || 0));

  const HIGH_VALUE = 1000;

  const highValueWatchlist = [
    ...unpaidInvoices
      .filter((inv) => Number(inv?.totalCost || 0) >= HIGH_VALUE)
      .map((inv) => ({
        type: 'invoice',
        id: inv?._id,
        label: `Unpaid invoice #${inv?.invoiceNumber || '—'}`,
        customer: inv?.customerName || 'Unknown',
        amount: Number(inv?.totalCost || 0),
        when: inv?.createdAt,
      })),
    ...completedUninvoicedJobs
      .filter((b) => Number(b?.income || 0) >= HIGH_VALUE)
      .map((b) => ({
        type: 'booking',
        id: b?._id,
        label: 'Completed job pending invoice',
        customer: b?.customerName || 'Unknown',
        amount: Number(b?.income || 0),
        when: b?.date,
      })),
  ].sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0));

  return {
    unpaidInvoices,
    completedUninvoicedJobs,
    highValueWatchlist,
    highValueThreshold: HIGH_VALUE,
  };
}
