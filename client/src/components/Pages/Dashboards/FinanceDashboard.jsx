import React, { useEffect, useMemo, useState } from 'react';
import {
  Row, Col, Card, CardBody,
  Form, FormGroup, Label, Input, Button, Spinner, Table, Badge, Collapse
} from 'reactstrap';
import moment from 'moment';
import RechartMonthly from './RechartMonthly';

const FY_START_MONTH = 6; // June
const currency = (n) => `$${Number(n || 0).toFixed(2)}`;

const FinanceDashboard = () => {
  // Period selection
  const [mode, setMode] = useState('thisMonth'); // 'thisMonth' | 'fiscalYear' | 'custom'
  const [range, setRange] = useState({
    from: moment().startOf('month').format('YYYY-MM-DD'),
    to: moment().endOf('month').format('YYYY-MM-DD'),
  });
  const [fiscalYear, setFiscalYear] = useState(() => {
    const now = moment();
    return (now.month() + 1) >= FY_START_MONTH ? now.year() + 1 : now.year();
  });

  // Filters / knobs
  const [includeHidden, setIncludeHidden] = useState(false);
  const [customerField, setCustomerField] = useState('customerId');

  // Forecast knobs (advanced)
  const [forecastMonths, setForecastMonths] = useState(6);
  const [forecastLookbackMonths, setForecastLookbackMonths] = useState(6);
  const [weightConfirmed, setWeightConfirmed] = useState(1.0);
  const [weightPending, setWeightPending] = useState(0.6);
  const [weightInProgress, setWeightInProgress] = useState(0.8);

  // Display toggles
  const [seriesView, setSeriesView] = useState('earned'); // earned|cash|pipeline

  // UI state
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [accountingView, setAccountingView] = useState(
    () => localStorage.getItem('finance.accountingView') || 'accrual' // 'accrual' | 'cash'
  );

  useEffect(() => {
    localStorage.setItem('finance.accountingView', accountingView);
  }, [accountingView]);


  // const buildQuery = () => {
  //   const qs = new URLSearchParams();

  //   if (mode === 'custom') {
  //     qs.set('from', range.from);
  //     qs.set('to', range.to);
  //   } else if (mode === 'fiscalYear') {
  //     qs.set('fiscalYear', String(fiscalYear));
  //     qs.set('fyStartMonth', String(FY_START_MONTH));
  //   } else {
  //     qs.set('from', moment().startOf('month').format('YYYY-MM-DD'));
  //     qs.set('to', moment().endOf('month').format('YYYY-MM-DD'));
  //   }

  //   qs.set('includeHidden', String(includeHidden));
  //   qs.set('customerField', customerField);

  //   qs.set('forecastMonths', String(forecastMonths));
  //   qs.set('forecastLookbackMonths', String(forecastLookbackMonths));
  //   qs.set('weightConfirmed', String(weightConfirmed));
  //   qs.set('weightPending', String(weightPending));
  //   qs.set('weightInProgress', String(weightInProgress));

  //   return qs.toString();
  // };
  const buildQuery = () => {
    const qs = new URLSearchParams();

    // ✅ Only send from/to when in custom mode
    if (mode === 'custom') {
      qs.set('from', range.from);
      qs.set('to', range.to);
    } else if (mode === 'fiscalYear') {
      qs.set('fiscalYear', String(fiscalYear));
      qs.set('fyStartMonth', String(FY_START_MONTH));
    }
    // ✅ thisMonth: send NOTHING; let backend decide current month

    qs.set('includeHidden', String(includeHidden));
    qs.set('customerField', customerField);

    qs.set('forecastMonths', String(forecastMonths));
    qs.set('forecastLookbackMonths', String(forecastLookbackMonths));
    qs.set('weightConfirmed', String(weightConfirmed));
    qs.set('weightPending', String(weightPending));
    qs.set('weightInProgress', String(weightInProgress));

    return qs.toString();
  };

  const fetchSummary = async () => {
    setLoading(true);
    setErrMsg('');
    try {
      const qs = buildQuery();
      const res = await fetch(`/api/finance/summary?${qs}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to fetch finance summary');
      setSummary(json);
    } catch (e) {
      setErrMsg(e.message);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   fetchSummary();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);
  useEffect(() => {
    // ✅ Force correct defaults on first render
    setMode('thisMonth');
    setRange({
      from: moment().startOf('month').format('YYYY-MM-DD'),
      to: moment().endOf('month').format('YYYY-MM-DD'),
    });

    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const primaryKpi = accountingView === 'cash'
    ? summary?.income?.cashReceived
    : summary?.income?.earned;



  const handleSubmit = (e) => {
    e.preventDefault();
    fetchSummary();
    // optionally auto-close filters after apply (nice UX)
    setFiltersOpen(false);
  };

  // const chartData = useMemo(() => {
  //   const series = summary?.series?.[seriesView] || [];
  //   return series.map(x => ({ month: x.month, total: Number(x.total || 0) }));
  // }, [summary, seriesView]);
  const chartData = useMemo(() => {
    const key = accountingView === 'cash' ? 'cash' : 'earned';
    const series = summary?.series?.[key] || [];
    return series.map(x => ({ month: x.month, total: Number(x.total || 0) }));
  }, [summary, accountingView]);


  const forecastData = useMemo(() => {
    const items = summary?.forecast?.items || [];
    return items.map(x => ({ month: x.month, total: Number(x.forecastEarned || 0) }));
  }, [summary]);

  const periodLabel = useMemo(() => {
    if (!summary?.period?.from || !summary?.period?.to) return '';
    const from = moment(summary.period.from).format('MMM D, YYYY');
    const to = moment(summary.period.to).format('MMM D, YYYY');
    const modeTxt = summary.period.mode ? `(${summary.period.mode})` : '';
    return `${from} → ${to} ${modeTxt}`;
  }, [summary]);

  const quickModeLabel = useMemo(() => {
    if (mode === 'thisMonth') return 'This Month';
    if (mode === 'custom') return 'Custom';
    if (mode === 'fiscalYear') return `FY${fiscalYear} (Jun–May)`;
    return mode;
  }, [mode, fiscalYear]);

  return (
    <section className="py-4 px-1 mx-auto">
      {/* Top header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div>
          <h3 className="mb-1">Finance Dashboard</h3>
          <div className="small text-muted">
            {/* Viewing: <strong>{quickModeLabel}</strong> */}
            Viewing: <strong>{summary?.period?.mode ? summary.period.mode : quickModeLabel}</strong>

          </div>
        </div>
        <div className="btn-group" role="group" aria-label="Accounting view">
  <Button
    type="button"
    color={accountingView === 'accrual' ? 'primary' : 'secondary'}
    outline={accountingView !== 'accrual'}
    onClick={() => setAccountingView('accrual')}
  >
    Accrual
  </Button>
  <Button
    type="button"
    color={accountingView === 'cash' ? 'primary' : 'secondary'}
    outline={accountingView !== 'cash'}
    onClick={() => setAccountingView('cash')}
  >
    Cash
  </Button>
</div>


        <div className="d-flex align-items-center gap-2">
          {summary?.period && (
            <Badge color="light" className="text-dark border">
              {periodLabel}
            </Badge>
          )}

          <Button
            color="secondary"
            outline
            onClick={() => setFiltersOpen(v => !v)}
          >
            {filtersOpen ? 'Hide Filters' : 'Filters'}
          </Button>

          <Button
            color="primary"
            onClick={fetchSummary}
            disabled={loading}
            title="Refresh data"
          >
            {loading ? <Spinner size="sm" /> : 'Refresh'}
          </Button>
          {/* <div className="small text-muted">filtersOpen: {String(filtersOpen)}</div> */}

        </div>
      </div>

      {/* Errors */}
      {errMsg && (
        <Card className="mb-3 border border-danger">
          <CardBody className="text-danger">{errMsg}</CardBody>
        </Card>
      )}
      {/* Collapsible Filters (below the core insights) */}
      <Collapse isOpen={filtersOpen}>
        <Card className="mb-4">
          <CardBody>
            <Form onSubmit={handleSubmit}>
              <Row className="g-2 align-items-end">
                <Col md={3}>
                  <FormGroup>
                    <Label>Mode</Label>
                    <Input
                      type="select"
                      value={mode}
                      onChange={(e) => setMode(e.target.value)}
                    >
                      <option value="thisMonth">This Month</option>
                      <option value="fiscalYear">Fiscal Year (Jun–May)</option>
                      <option value="custom">Custom</option>
                    </Input>
                  </FormGroup>
                </Col>

                {mode === 'custom' && (
                  <>
                    <Col md={3}>
                      <FormGroup>
                        <Label>From</Label>
                        <Input
                          type="date"
                          value={range.from}
                          onChange={(e) => setRange(prev => ({ ...prev, from: e.target.value }))}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup>
                        <Label>To</Label>
                        <Input
                          type="date"
                          value={range.to}
                          onChange={(e) => setRange(prev => ({ ...prev, to: e.target.value }))}
                        />
                      </FormGroup>
                    </Col>
                  </>
                )}

                {mode === 'fiscalYear' && (
                  <Col md={3}>
                    <FormGroup>
                      <Label>Fiscal Year</Label>
                      <Input
                        type="number"
                        value={fiscalYear}
                        min={2000}
                        max={2100}
                        onChange={(e) => setFiscalYear(Number(e.target.value))}
                      />
                      <div className="small text-muted">
                        FY{fiscalYear}: Jun {fiscalYear - 1} → May {fiscalYear}
                      </div>
                    </FormGroup>
                  </Col>
                )}

                <Col md={3}>
                  <FormGroup>
                    <Label>Customer Field</Label>
                    <Input
                      type="select"
                      value={customerField}
                      onChange={(e) => setCustomerField(e.target.value)}
                    >
                      <option value="customerId">customerId</option>
                      <option value="customerEmail">customerEmail</option>
                      <option value="customerName">customerName</option>
                    </Input>
                  </FormGroup>
                </Col>

                <Col md={2}>
                  <FormGroup>
                    <Label className="d-block">&nbsp;</Label>
                    <div className="d-flex align-items-center gap-2">
                      <Input
                        type="checkbox"
                        checked={includeHidden}
                        onChange={(e) => setIncludeHidden(e.target.checked)}
                      />
                      <span className="small">Include hidden</span>
                    </div>
                  </FormGroup>
                </Col>

                <Col md={2} className="d-flex gap-2">
                  <Button color="primary" type="submit" disabled={loading} className="w-100">
                    {loading ? <Spinner size="sm" /> : 'Apply'}
                  </Button>
                  <Button
                    type="button"
                    color="secondary"
                    outline
                    className="w-100"
                    onClick={() => {
                      // quick reset back to sensible defaults
                      setMode('thisMonth');
                      setRange({
                        from: moment().startOf('month').format('YYYY-MM-DD'),
                        to: moment().endOf('month').format('YYYY-MM-DD'),
                      });
                      setIncludeHidden(false);
                      setCustomerField('customerId');
                      setAdvancedOpen(false);
                    }}
                  >
                    Reset
                  </Button>
                </Col>
              </Row>

              {/* Advanced toggle */}
              <div className="d-flex justify-content-between align-items-center mt-3">
                <Button
                  type="button"
                  color="link"
                  className="px-0"
                  onClick={() => setAdvancedOpen(v => !v)}
                >
                  {advancedOpen ? 'Hide Advanced' : 'Advanced'}
                </Button>

                <div className="small text-muted">
                  Weights affect pipeline only (confirmed/pending/in progress).
                </div>
              </div>

              <Collapse isOpen={advancedOpen}>
                <Row className="g-2 mt-1">
                  <Col md={2}>
                    <FormGroup>
                      <Label>Forecast Months</Label>
                      <Input
                        type="number"
                        min={1}
                        max={24}
                        value={forecastMonths}
                        onChange={(e) => setForecastMonths(Number(e.target.value))}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={2}>
                    <FormGroup>
                      <Label>Lookback Months</Label>
                      <Input
                        type="number"
                        min={1}
                        max={24}
                        value={forecastLookbackMonths}
                        onChange={(e) => setForecastLookbackMonths(Number(e.target.value))}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={2}>
                    <FormGroup>
                      <Label>W Confirmed</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min={0}
                        max={1}
                        value={weightConfirmed}
                        onChange={(e) => setWeightConfirmed(Number(e.target.value))}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={2}>
                    <FormGroup>
                      <Label>W Pending</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min={0}
                        max={1}
                        value={weightPending}
                        onChange={(e) => setWeightPending(Number(e.target.value))}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={2}>
                    <FormGroup>
                      <Label>W In Progress</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min={0}
                        max={1}
                        value={weightInProgress}
                        onChange={(e) => setWeightInProgress(Number(e.target.value))}
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </Collapse>
            </Form>
          </CardBody>
        </Card>
      </Collapse>

      {/* KPI Cards FIRST (above the fold) */}
      {summary && (
        <Row className="g-3 mb-4">

          {/* <Col md={3}><StatCard title="Earned (Completed/Done)" value={summary?.income?.earned} /></Col> */}
          <Col md={3}>
            <StatCard
              title={accountingView === 'cash' ? 'Cash (Paid)' : 'Earned (Completed/Done)'}
              value={primaryKpi}
            />
          </Col>

          <Col md={3}><StatCard title="Cash Received (Paid)" value={summary?.income?.cashReceived} /></Col>
          <Col md={3}><StatCard title="Pipeline (Weighted)" value={summary?.income?.pipelineWeighted} /></Col>
          <Col md={3}><StatCard title="Cancelled" value={summary?.income?.cancelled} /></Col>
        </Row>
      )}

      {/* Chart row next (still above the fold on desktop) */}
      <Row className="mb-4">
        <Col>
          <Card>
            <CardBody>
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                <h5 className="mb-0">Monthly Series</h5>
                <Input
                  type="select"
                  value={seriesView}
                  onChange={(e) => setSeriesView(e.target.value)}
                  style={{ maxWidth: 220 }}
                >
                  <option value="earned">Earned</option>
                  <option value="cash">Cash Received</option>
                  <option value="pipeline">Pipeline</option>
                </Input>
              </div>

              <RechartMonthly data={chartData} />
            </CardBody>
          </Card>
        </Col>
      </Row>



      {/* Forecast (still visible without opening filters) */}
      {summary?.forecast?.items?.length > 0 && (
        <Row className="mb-4">
          <Col>
            <Card>
              <CardBody>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Forecast (Avg Earned / Month)</h5>
                  <Badge color="light" className="text-dark border">
                    Avg: {currency(summary?.forecast?.avgEarnedPerMonth)}
                  </Badge>
                </div>

                <div className="mt-2">
                  <RechartMonthly data={forecastData} />
                </div>

                <Table striped size="sm" className="mt-3">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th className="text-end">Forecast Earned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.forecast.items.map((x) => (
                      <tr key={x.month}>
                        <td>{x.month}</td>
                        <td className="text-end">{currency(x.forecastEarned)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      {/* Breakdown tables */}
      {summary?.income?.byStatus && (
        <Row className="mb-4">
          <Col md={6}>
            <Card>
              <CardBody>
                <h5>Income by Status (raw)</h5>
                <Table striped size="sm">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th className="text-end">Total</th>
                      <th className="text-end">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(summary.income.byStatus).map(([status, obj]) => (
                      <tr key={status}>
                        <td>{status}</td>
                        <td className="text-end">{currency(obj?.total)}</td>
                        <td className="text-end">{obj?.count ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>

          <Col md={6}>
            <Card>
              <CardBody>
                <h5>Top Customers</h5>
                <Table striped size="sm">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th className="text-end">Earned</th>
                      <th className="text-end">Cash</th>
                      <th className="text-end">Pipeline (W)</th>
                      <th className="text-end">Bookings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(summary?.customers?.top || []).map((c, i) => (
                      <tr key={`${c.customer}-${i}`}>
                        <td className="text-truncate" style={{ maxWidth: 160 }}>
                          {String(c.customer)}
                        </td>
                        <td className="text-end">{currency(c.earned)}</td>
                        <td className="text-end">{currency(c.cash)}</td>
                        <td className="text-end">{currency(c.pipelineWeighted)}</td>
                        <td className="text-end">{c.bookings}</td>
                      </tr>
                    ))}
                    {(!summary?.customers?.top || summary.customers.top.length === 0) && (
                      <tr>
                        <td colSpan="5" className="text-muted">No customer data in this period.</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
                <div className="small text-muted">
                  Grouped by: <code>{summary?.customers?.field}</code>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}
    </section>
  );
};

const StatCard = ({ title, value }) => (
  <Card className="h-100">
    <CardBody>
      <div className="text-muted small">{title}</div>
      <h4 className="mb-0">{currency(value)}</h4>
    </CardBody>
  </Card>
);

export default FinanceDashboard;
