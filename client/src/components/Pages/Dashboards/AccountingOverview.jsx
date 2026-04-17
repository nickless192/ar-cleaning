import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Row,
  Spinner,
  Table,
} from 'react-bootstrap';
import {
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  ComposedChart,
} from 'recharts';
import moment from 'moment';

import {
  adaptMonthlyProfitToTrend,
  buildActionQueue,
  computeUnpaidInvoiceTotals,
  getCurrentMonthMetrics,
} from './accountingOverviewAdapters';

const currency = (n) => `$${Number(n || 0).toFixed(2)}`;

function StatCard({ title, value, subtitle }) {
  return (
    <Card className="h-100 shadow-sm border-0">
      <Card.Body>
        <div className="text-muted small mb-1">{title}</div>
        <h4 className="mb-1">{currency(value)}</h4>
        {subtitle ? <div className="small text-muted">{subtitle}</div> : null}
      </Card.Body>
    </Card>
  );
}

function SectionHeader({ title, subtitle, right }) {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
      <div>
        <h5 className="mb-1">{title}</h5>
        {subtitle ? <div className="small text-muted">{subtitle}</div> : null}
      </div>
      {right}
    </div>
  );
}

export default function AccountingOverview() {
  const [basis, setBasis] = useState(() => localStorage.getItem('finance.accountingView') || 'accrual');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [summary, setSummary] = useState(null);
  const [trendItems, setTrendItems] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    localStorage.setItem('finance.accountingView', basis);
  }, [basis]);

  const fetchOverview = async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      const from = moment().subtract(11, 'months').startOf('month').format('YYYY-MM-DD');
      const to = moment().endOf('month').format('YYYY-MM-DD');

      const qsSummary = new URLSearchParams({ customerField: 'customerName' }).toString();
      const qsTrend = new URLSearchParams({ from, to, incomeMethod: basis }).toString();

      const [summaryRes, trendRes, invoicesRes, bookingsRes] = await Promise.all([
        fetch(`/api/finance/summary?${qsSummary}`),
        fetch(`/api/finance/monthly-profit?${qsTrend}`),
        fetch('/api/invoices'),
        fetch('/api/bookings'),
      ]);

      const [summaryJson, trendJson, invoicesJson, bookingsJson] = await Promise.all([
        summaryRes.json(),
        trendRes.json(),
        invoicesRes.json(),
        bookingsRes.json(),
      ]);

      if (!summaryRes.ok) throw new Error(summaryJson?.error || 'Failed to load finance summary');
      if (!trendRes.ok) throw new Error(trendJson?.error || 'Failed to load monthly trend');
      if (!invoicesRes.ok) throw new Error(invoicesJson?.error || 'Failed to load invoices');
      if (!bookingsRes.ok) throw new Error(bookingsJson?.error || 'Failed to load bookings');

      setSummary(summaryJson || null);
      setTrendItems(Array.isArray(trendJson?.items) ? trendJson.items : []);
      setInvoices(Array.isArray(invoicesJson) ? invoicesJson : []);
      setBookings(Array.isArray(bookingsJson) ? bookingsJson : []);
    } catch (err) {
      setError(err.message || 'Failed to load accounting overview');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basis]);

  const trendRows = useMemo(() => adaptMonthlyProfitToTrend(trendItems), [trendItems]);

  const monthMetrics = useMemo(() => getCurrentMonthMetrics(trendRows), [trendRows]);

  const revenueMtd = useMemo(() => {
    if (!summary?.income) return monthMetrics.income;
    return basis === 'cash'
      ? Number(summary?.income?.cashReceived || 0)
      : Number(summary?.income?.earned || 0);
  }, [summary, basis, monthMetrics.income]);

  const expensesMtd = Number(monthMetrics.expenses || 0);
  const profitMtd = revenueMtd - expensesMtd;

  const unpaidMeta = useMemo(() => computeUnpaidInvoiceTotals(invoices), [invoices]);

  const actions = useMemo(
    () => buildActionQueue({ invoices: unpaidMeta.unpaid, bookings }),
    [unpaidMeta.unpaid, bookings]
  );

  const topClients = summary?.customers?.top || [];

  const basisLabel = basis === 'cash' ? 'Cash basis' : 'Accrual basis';

  if (loading) {
    return (
      <Container fluid className="py-5 text-center">
        <Spinner animation="border" />
        <div className="text-muted mt-2">Loading accounting overview…</div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-3 px-1">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div>
          <h3 className="mb-1">Accounting Overview</h3>
          <div className="small text-muted">Executive cockpit for this month. All KPI labels reflect {basisLabel.toLowerCase()} for revenue.</div>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2">
          <div className="btn-group" role="group" aria-label="Accounting basis">
            <Button
              type="button"
              variant={basis === 'accrual' ? 'primary' : 'outline-secondary'}
              onClick={() => setBasis('accrual')}
            >
              Accrual basis
            </Button>
            <Button
              type="button"
              variant={basis === 'cash' ? 'primary' : 'outline-secondary'}
              onClick={() => setBasis('cash')}
            >
              Cash basis
            </Button>
          </div>

          <Button variant="outline-primary" onClick={() => fetchOverview({ silent: true })} disabled={refreshing}>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </Button>
        </div>
      </div>

      {error ? <Alert variant="danger">{error}</Alert> : null}

      {/* Headline KPI cards */}
      <Row className="g-3 mb-4">
        <Col md={3} sm={6}>
          <StatCard
            title="Revenue MTD"
            value={revenueMtd}
            subtitle={`${basisLabel} · ${moment(monthMetrics.month, 'YYYY-MM').format('MMMM YYYY')}`}
          />
        </Col>
        <Col md={3} sm={6}>
          <StatCard
            title="Expenses MTD"
            value={expensesMtd}
            subtitle={`Current month · ${moment(monthMetrics.month, 'YYYY-MM').format('MMMM YYYY')}`}
          />
        </Col>
        <Col md={3} sm={6}>
          <StatCard
            title="Profit MTD"
            value={profitMtd}
            subtitle={`Revenue - Expenses · ${moment(monthMetrics.month, 'YYYY-MM').format('MMMM YYYY')}`}
          />
        </Col>
        <Col md={3} sm={6}>
          <StatCard
            title="Unpaid Total"
            value={unpaidMeta.unpaidTotal}
            subtitle={`${unpaidMeta.unpaidCount} open invoice(s)`}
          />
        </Col>
      </Row>

      <Row className="g-3">
        {/* Trend */}
        <Col lg={8}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <SectionHeader
                title="Monthly Trend"
                subtitle={`Revenue, expenses, and profit over the last 12 months (${basisLabel.toLowerCase()} for revenue).`}
              />

              {trendRows.length === 0 ? (
                <Alert variant="light" className="mb-0">No trend data available for the selected basis.</Alert>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <ComposedChart data={trendRows}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="monthLabel" />
                    <YAxis />
                    <Tooltip formatter={(value) => currency(value)} />
                    <Legend />
                    <Bar dataKey="income" name="Revenue" fill="#198754" />
                    <Bar dataKey="expenses" name="Expenses" fill="#dc3545" />
                    <Line type="monotone" dataKey="profit" name="Profit" stroke="#0d6efd" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Top Clients */}
        <Col lg={4}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <SectionHeader
                title="Top Clients"
                subtitle={`Current period (${summary?.period?.mode || 'this month'})`}
                right={<Badge bg="light" text="dark">{basisLabel}</Badge>}
              />

              {topClients.length === 0 ? (
                <Alert variant="light" className="mb-0">No client revenue data available.</Alert>
              ) : (
                <Table striped hover size="sm" responsive className="mb-0 align-middle">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th className="text-end">Revenue</th>
                      <th className="text-end">Bookings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topClients.slice(0, 8).map((c, idx) => {
                      const revenue = basis === 'cash' ? Number(c?.cash || 0) : Number(c?.earned || 0);
                      return (
                        <tr key={`${c?.customer || 'client'}-${idx}`}>
                          <td style={{ maxWidth: 180 }} className="text-truncate">
                            {String(c?.customer || 'Unknown')}
                          </td>
                          <td className="text-end">{currency(revenue)}</td>
                          <td className="text-end">{Number(c?.bookings || 0)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Action queue */}
      <Row className="g-3 mt-1">
        <Col lg={4}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <SectionHeader
                title="Action Queue · Unpaid Invoices"
                subtitle="Invoices that still require payment follow-up."
              />

              {actions.unpaidInvoices.length === 0 ? (
                <Alert variant="light" className="mb-0">No unpaid invoices 🎉</Alert>
              ) : (
                <Table size="sm" hover responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>Client</th>
                      <th className="text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actions.unpaidInvoices.slice(0, 6).map((inv) => (
                      <tr key={inv?._id || inv?.invoiceNumber}>
                        <td>#{inv?.invoiceNumber || '—'}</td>
                        <td className="text-truncate" style={{ maxWidth: 160 }}>{inv?.customerName || 'Unknown'}</td>
                        <td className="text-end">{currency(inv?.totalCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <SectionHeader
                title="Action Queue · Completed Uninvoiced"
                subtitle="Completed work that still needs an invoice."
              />

              {actions.completedUninvoicedJobs.length === 0 ? (
                <Alert variant="light" className="mb-0">No completed uninvoiced jobs.</Alert>
              ) : (
                <Table size="sm" hover responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Client</th>
                      <th className="text-end">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actions.completedUninvoicedJobs.slice(0, 6).map((b) => (
                      <tr key={b?._id}>
                        <td>{b?.date ? moment(b.date).format('MMM D') : '—'}</td>
                        <td className="text-truncate" style={{ maxWidth: 160 }}>{b?.customerName || 'Unknown'}</td>
                        <td className="text-end">{currency(b?.income)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <SectionHeader
                title="High-Value Finance Watchlist"
                subtitle={`Items at or above $${actions.highValueThreshold.toLocaleString()}.`}
              />

              {actions.highValueWatchlist.length === 0 ? (
                <Alert variant="light" className="mb-0">No high-value items need attention right now.</Alert>
              ) : (
                <Table size="sm" hover responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Client</th>
                      <th className="text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actions.highValueWatchlist.slice(0, 6).map((item) => (
                      <tr key={`${item.type}-${item.id}`}>
                        <td>{item.label}</td>
                        <td className="text-truncate" style={{ maxWidth: 140 }}>{item.customer}</td>
                        <td className="text-end">{currency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
