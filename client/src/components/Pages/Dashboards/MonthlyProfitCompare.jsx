import React, { useMemo, useState, useEffect } from 'react';
import { Row, Col, Card, CardBody, Button, Badge, Table, Input, Collapse } from 'reactstrap';
import moment from 'moment';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Line
} from 'recharts';

const FY_START_MONTH = 6; // June

function uniqSortedMonths(months) {
    const set = new Set(months);
    return Array.from(set).sort(); // YYYY-MM sorts lexicographically correctly
}
function monthRange(months) {
    if (!months.length) return null;
    const min = months[0];
    const max = months[months.length - 1];
    return { min, max };
}
function monthStartEnd(monthYYYYMM) {
    const m = moment(monthYYYYMM, 'YYYY-MM');
    return {
        from: m.startOf('month').format('YYYY-MM-DD'),
        to: m.endOf('month').format('YYYY-MM-DD'),
    };
}

function fiscalHalfMonths(now = moment()) {
    // FY halves: H1 = Jun-Nov, H2 = Dec-May
    const m = now.month() + 1; // 1-12
    const isH1 = m >= 6 && m <= 11;
    const start = isH1 ? moment({ year: now.year(), month: 5, day: 1 }) : moment({ year: now.year(), month: 11, day: 1 });
    const months = [];
    for (let i = 0; i < 6; i++) months.push(start.clone().add(i, 'month').format('YYYY-MM'));
    return months;
}

function previousFiscalHalfMonths(now = moment()) {
    const cur = fiscalHalfMonths(now);
    const start = moment(cur[0], 'YYYY-MM').subtract(6, 'months');
    const months = [];
    for (let i = 0; i < 6; i++) months.push(start.clone().add(i, 'month').format('YYYY-MM'));
    return months;
}

function quarterMonths(now = moment()) {
    const q = now.quarter();
    const startMonth = (q - 1) * 3; // 0,3,6,9
    const start = moment({ year: now.year(), month: startMonth, day: 1 });
    return [0, 1, 2].map(i => start.clone().add(i, 'month').format('YYYY-MM'));
}

function previousQuarterMonths(now = moment()) {
    const start = moment().quarter(now.quarter()).startOf('quarter').subtract(3, 'months');
    return [0, 1, 2].map(i => start.clone().add(i, 'month').format('YYYY-MM'));
}

function lastNMonths(n, now = moment()) {
    const start = now.clone().startOf('month').subtract(n - 1, 'months');
    return Array.from({ length: n }, (_, i) => start.clone().add(i, 'month').format('YYYY-MM'));
}

const currency = (n) => `$${Number(n || 0).toFixed(2)}`;

const MonthlyProfitCompare = () => {
    const [monthPicker, setMonthPicker] = useState(moment().format('YYYY-MM'));
    const [filtersOpen, setFiltersOpen] = useState(false); // default collapsed

    const [selectedMonths, setSelectedMonths] = useState(() => {
        // default: current month only
        return [moment().format('YYYY-MM')];
    });


    // Income method toggle (same as finance dashboard)
    const [incomeMethod, setIncomeMethod] = useState(
        () => localStorage.getItem('finance.incomeMethod') || 'accrual' // 'accrual'|'cash'
    );
    useEffect(() => {
        localStorage.setItem('finance.incomeMethod', incomeMethod);
    }, [incomeMethod]);

    const [data, setData] = useState([]); // fetched range results
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState('');

    const selectedSorted = useMemo(() => uniqSortedMonths(selectedMonths), [selectedMonths]);

    const range = useMemo(() => {
        const r = monthRange(selectedSorted);
        if (!r) return null;
        const from = moment(r.min, 'YYYY-MM').startOf('month').format('YYYY-MM-DD');
        const to = moment(r.max, 'YYYY-MM').endOf('month').format('YYYY-MM-DD');
        return { from, to };
    }, [selectedSorted]);

    const addMonths = (monthsToAdd) => {
        setSelectedMonths(prev => uniqSortedMonths([...prev, ...monthsToAdd]));
        // setFiltersOpen(false); // auto-close after adding
    };

    const removeMonth = (m) => setSelectedMonths(prev => prev.filter(x => x !== m));
    const clearAll = () => setSelectedMonths([]);

    const fetchRange = async () => {
        if (!range) {
            setData([]);
            return;
        }
        setLoading(true);
        setErrMsg('');
        try {
            const qs = new URLSearchParams({
                from: range.from,
                to: range.to,
                incomeMethod,
            }).toString();

            const res = await fetch(`/api/finance/monthly-profit?${qs}`);
            const json = await res.json();
            if (!res.ok) throw new Error(json?.error || 'Failed to load monthly profit');
            setData(json?.items || []);
        } catch (e) {
            setErrMsg(e.message);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRange();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [range?.from, range?.to, incomeMethod]);

    const chartRows = useMemo(() => {
        // only show selected months (not continuous months)
        const keep = new Set(selectedSorted);
        return (data || []).filter(r => keep.has(r.month));
    }, [data, selectedSorted]);

    const totals = useMemo(() => {
        const income = chartRows.reduce((s, r) => s + Number(r.income || 0), 0);
        const expenses = chartRows.reduce((s, r) => s + Number(r.expenses || 0), 0);
        return { income, expenses, net: income - expenses };
    }, [chartRows]);
    const selectionLabel = useMemo(() => {
        if (!selectedSorted.length) return 'No months selected';

        if (selectedSorted.length === 1) {
            return moment(selectedSorted[0], 'YYYY-MM').format('MMM YYYY');
        }

        const first = moment(selectedSorted[0], 'YYYY-MM').format('MMM YYYY');
        const last = moment(selectedSorted[selectedSorted.length - 1], 'YYYY-MM').format('MMM YYYY');
        return `${first} → ${last} (${selectedSorted.length} months)`;
    }, [selectedSorted]);


    return (
        <section className="py-4 px-1 mx-auto">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                <div>
                    <h3 className="mb-1">Monthly Income vs Expenses</h3>
                    <div className="small text-muted">
                        Income method: <strong>{incomeMethod === 'cash' ? 'Cash' : 'Accrual'}</strong>
                    </div>
                </div>

                {/* <div className="d-flex flex-wrap align-items-center gap-2">
                    <div className="btn-group" role="group" aria-label="Income method">
                        <Button
                            type="button"
                            color={incomeMethod === 'accrual' ? 'primary' : 'secondary'}
                            outline={incomeMethod !== 'accrual'}
                            onClick={() => setIncomeMethod('accrual')}
                        >
                            Accrual
                        </Button>
                        <Button
                            type="button"
                            color={incomeMethod === 'cash' ? 'primary' : 'secondary'}
                            outline={incomeMethod !== 'cash'}
                            onClick={() => setIncomeMethod('cash')}
                        >
                            Cash
                        </Button>
                    </div>
                    <Button
                        color="secondary"
                        outline
                        onClick={() => setFiltersOpen(v => !v)}
                    >
                        {filtersOpen ? 'Hide Filters' : 'Filters'}
                    </Button>


                    <Button color="primary" outline disabled={loading} onClick={fetchRange}>
                        {loading ? 'Loading…' : 'Refresh'}
                    </Button>
                </div> */}
                <div className="w-100 w-md-auto d-flex flex-column flex-md-row align-items-stretch align-items-md-center gap-2">
                    {/* Selection badge ALWAYS visible */}
                    <Badge color="light" className="text-dark border align-self-start align-self-md-center">
                        Viewing: <strong>{selectionLabel}</strong>
                    </Badge>

                    {/* Controls */}
                    <div className="d-flex flex-wrap align-items-center gap-2 justify-content-start justify-content-md-end">
                        <div className="btn-group" role="group" aria-label="Income method">
                            <Button
                                type="button"
                                color={incomeMethod === 'accrual' ? 'primary' : 'secondary'}
                                outline={incomeMethod !== 'accrual'}
                                onClick={() => setIncomeMethod('accrual')}
                            >
                                Accrual
                            </Button>
                            <Button
                                type="button"
                                color={incomeMethod === 'cash' ? 'primary' : 'secondary'}
                                outline={incomeMethod !== 'cash'}
                                onClick={() => setIncomeMethod('cash')}
                            >
                                Cash
                            </Button>
                        </div>

                        <Button
                            color="secondary"
                            outline
                            onClick={() => setFiltersOpen(v => !v)}
                        >
                            {filtersOpen ? 'Hide Filters' : 'Filters'}
                            {selectedSorted.length ? (
                                <span className="ms-2 small text-muted">({selectedSorted.length})</span>
                            ) : null}
                        </Button>

                        <Button color="primary" outline disabled={loading} onClick={fetchRange}>
                            {loading ? 'Loading…' : 'Refresh'}
                        </Button>
                    </div>
                </div>


            </div>

            {/* Quick Add Controls */}
            <Card className="mb-3">
                <Collapse isOpen={filtersOpen}>
                    <Card className="mb-3">
                        <CardBody>
                            {/* Quick Add Controls */}
                            {/* <Row className="g-2 align-items-end">
                                <Col md={3}>
                                    <label className="small text-muted">Pick a month</label>
                                    <Input type="month" value={monthPicker} onChange={(e) => setMonthPicker(e.target.value)} />
                                </Col>
                                <Col md={2}>
                                    <Button
                                        color="primary"
                                        className="w-100"
                                        onClick={() => addMonths([monthPicker])}
                                    >
                                        Add month
                                    </Button>
                                </Col>

                                <Col md={7}>
                                    <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                                        <Button size="sm" color="secondary" outline onClick={() => addMonths(lastNMonths(6))}>
                                            Add last 6 months
                                        </Button>
                                        <Button size="sm" color="secondary" outline onClick={() => addMonths(quarterMonths(moment()))}>
                                            Add current quarter
                                        </Button>
                                        <Button size="sm" color="secondary" outline onClick={() => addMonths(previousQuarterMonths(moment()))}>
                                            Add previous quarter
                                        </Button>
                                        <Button size="sm" color="secondary" outline onClick={() => addMonths(fiscalHalfMonths(moment()))}>
                                            Add current fiscal half
                                        </Button>
                                        <Button size="sm" color="secondary" outline onClick={() => addMonths(previousFiscalHalfMonths(moment()))}>
                                            Add previous fiscal half
                                        </Button>
                                        <Button size="sm" color="danger" outline onClick={clearAll}>
                                            Clear
                                        </Button>
                                    </div>
                                </Col>
                            </Row> */}
                            <Row className="g-2">
                                {/* Month picker */}
                                <Col xs={12} md={4} lg={3}>
                                    <label className="small text-muted">Pick a month</label>
                                    <Input
                                        type="month"
                                        className="form-input text-cleanar-color"
                                        value={monthPicker}
                                        onChange={(e) => setMonthPicker(e.target.value)}
                                    />
                                </Col>

                                {/* Add month */}
                                <Col xs={12} md={4} lg={2} className="d-flex align-items-end">
                                    <Button
                                        color="primary"
                                        // className="w-100"
                                        onClick={() => addMonths([monthPicker])}
                                    >
                                        Add month
                                    </Button>
                                </Col>

                                {/* Quick actions */}
                                <Col xs={12} md={12} lg={7}>
                                    <div className="d-grid gap-2" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                                        <Button size="sm" color="secondary" outline onClick={() => addMonths(lastNMonths(6))}>
                                            Add last 6 months
                                        </Button>
                                        <Button size="sm" color="secondary" outline onClick={() => addMonths(quarterMonths(moment()))}>
                                            Add current quarter
                                        </Button>
                                        <Button size="sm" color="secondary" outline onClick={() => addMonths(previousQuarterMonths(moment()))}>
                                            Add previous quarter
                                        </Button>
                                        <Button size="sm" color="secondary" outline onClick={() => addMonths(fiscalHalfMonths(moment()))}>
                                            Add current fiscal half
                                        </Button>
                                        <Button size="sm" color="secondary" outline onClick={() => addMonths(previousFiscalHalfMonths(moment()))}>
                                            Add previous fiscal half
                                        </Button>
                                        <Button size="sm" color="danger" outline onClick={clearAll}>
                                            Clear
                                        </Button>
                                    </div>

                                    {/* Make the grid 1-column on small screens */}
                                    <style>{`
      @media (max-width: 575.98px) {
        .d-grid { grid-template-columns: 1fr !important; }
      }
    `}</style>
                                </Col>
                            </Row>


                            {/* Month chips */}
                            <div className="mt-3 d-flex flex-wrap gap-2">
                                {selectedSorted.length === 0 && (
                                    <span className="text-muted small">No months selected. Add one above.</span>
                                )}
                                {selectedSorted.map(m => (
                                    <Badge
                                        key={m}
                                        color="light"
                                        className="text-dark border d-inline-flex align-items-center gap-2"
                                        style={{ cursor: 'default' }}
                                    >
                                        {moment(m, 'YYYY-MM').format('MMM YYYY')}
                                        <Button close aria-label="Remove" onClick={() => removeMonth(m)} />
                                    </Badge>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                </Collapse>

            </Card>

            {errMsg && (
                <Card className="mb-3 border border-danger">
                    <CardBody className="text-danger">{errMsg}</CardBody>
                </Card>
            )}

            {/* Totals */}
            <Row className="g-3 mb-3">
                <Col md={4}>
                    <Card className="h-100">
                        <CardBody>
                            <div className="small text-muted">Total Income</div>
                            <h4 className="mb-0">{currency(totals.income)}</h4>
                        </CardBody>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="h-100">
                        <CardBody>
                            <div className="small text-muted">Total Expenses</div>
                            <h4 className="mb-0">{currency(totals.expenses)}</h4>
                        </CardBody>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="h-100">
                        <CardBody>
                            <div className="small text-muted">Net</div>
                            <h4 className="mb-0">{currency(totals.net)}</h4>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* Chart */}
            <Card className="mb-3">
                <CardBody>
                    <h5 className="mb-3">Selected months</h5>
                    <div style={{ width: '100%', height: 320 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartRows}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value) => currency(value)} />
                                <Legend />
                                <Bar dataKey="income" name="Income" />
                                <Bar dataKey="expenses" name="Expenses" />
                                <Line type="monotone" dataKey="net" name="Net" dot={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardBody>
            </Card>

            {/* Table */}
            <Card>
                <CardBody>
                    <h5 className="mb-3">Monthly totals</h5>
                    <Table responsive striped>
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th className="text-end">Income</th>
                                <th className="text-end">Expenses</th>
                                <th className="text-end">Net</th>
                            </tr>
                        </thead>
                        <tbody>
                            {chartRows.map(r => (
                                <tr key={r.month}>
                                    <td>{moment(r.month, 'YYYY-MM').format('MMM YYYY')}</td>
                                    <td className="text-end">{currency(r.income)}</td>
                                    <td className="text-end">{currency(r.expenses)}</td>
                                    <td className="text-end">{currency(r.net)}</td>
                                </tr>
                            ))}
                            {chartRows.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-muted">No data for the selected months.</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </CardBody>
            </Card>
        </section>
    );
}

export default MonthlyProfitCompare;