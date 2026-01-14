import React, { useMemo, useState, useEffect } from 'react';
import {
  Row, Col, Card, CardBody, Form, FormGroup, Label, Input, Button,
  Spinner, Table, Progress, Badge
} from 'reactstrap';
import moment from 'moment';

const currency = (n) => `$${Number(n || 0).toFixed(2)}`;

const FY_START_MONTH = 6; // June (1-12)

const ExpenseDashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [periodMode, setPeriodMode] = useState('thisMonth');
  const [expenseMethod, setExpenseMethod] = useState(
    () => localStorage.getItem('expenses.method') || 'accrual'
  );
  useEffect(() => {
    localStorage.setItem('expenses.method', expenseMethod);
  }, [expenseMethod]);

  const dateKey = expenseMethod === 'cash' ? 'paidAt' : 'incurredAt';
    const [fiscalYear, setFiscalYear] = useState(() => {
    const now = moment();
    // FY label: FY2025 means Jun 2024 -> May 2025 when startMonth=6
    return (now.month() + 1) >= FY_START_MONTH ? now.year() + 1 : now.year();
  });
  
  const [filterFrom, setFilterFrom] = useState(moment().subtract(30, 'days').format('YYYY-MM-DD'));
  const [filterTo, setFilterTo] = useState(moment().format('YYYY-MM-DD'));

  const effectivePeriod = useMemo(() => {
    if (periodMode === 'thisMonth') {
      return {
        from: moment().startOf('month'),
        to: moment().endOf('month'),
        label: 'This Month',
      };
    }

    if (periodMode === 'fiscalYear') {
      const { start, end } = getFiscalYearRange(fiscalYear, FY_START_MONTH);
      return {
        from: start,
        to: end,
        label: `FY${fiscalYear} (Jun–May)`,
      };
    }

    // custom uses the date inputs
    const from = filterFrom ? moment(filterFrom, 'YYYY-MM-DD').startOf('day') : null;
    const to = filterTo ? moment(filterTo, 'YYYY-MM-DD').endOf('day') : null;
    return {
      from,
      to,
      label: 'Custom',
    };
  }, [periodMode, fiscalYear, filterFrom, filterTo]);

  const effectiveFromTo = useMemo(() => {
    const from = effectivePeriod?.from?.format('YYYY-MM-DD') || '';
    const to = effectivePeriod?.to?.format('YYYY-MM-DD') || '';
    return { from, to };
  }, [effectivePeriod]);

  // 'thisMonth' | 'fiscalYear' | 'custom'



  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    date: moment().format('YYYY-MM-DD'),
    description: '',
    receipt: null
  });

  const [editingId, setEditingId] = useState(null);
  const [editedExpense, setEditedExpense] = useState({});

  // OCR states (receipt only for now)
  const [ocrRunning, setOcrRunning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);

  // Client-side filters (no backend changes)
  const [q, setQ] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const expenseCategories = [
    // Marketing & Promotions
    'Advertising', 'Promotional', 'Car Wrapping', 'Meals & Entertainment',

    // Fees & Dues
    'Commissions & Fees', 'Bank Charges', 'Dues & Subscriptions', 'Disposal Fees', 'Miscellaneous',

    // Office & Admin
    'Office Expenses', 'Rent or Lease', 'Supplies', 'Stationary & Printing', 'Repair & Maintenance',
    'Cellphone', 'Utilities', 'Website Hosting',

    // Operations & Materials
    'Cost of Labor', 'Freight & Delivery', 'Supplies & Materials', 'Locker Room Rental',
    'Purchases', 'Job Materials',

    // Travel & Vehicles
    'Airfare', 'Hotels', 'Travel Meals', 'Transportation', 'Car Leasing', 'Entertainment', 'Parking',

    // Professional Services
    'Legal & Professional Fees',

    // Insurance
    'Insurance - Disability', 'Insurance - Liability', 'Insurance - Errors & Omissions', 'Insurance - Car',

    // Financial & Other
    'Penalties & Settlements', 'Bad Debts', 'Interest Expense', 'Taxes & Licenses'
  ];


  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        method: expenseMethod,
        ...(effectiveFromTo.from && effectiveFromTo.to ? effectiveFromTo : {}),
        // includeHidden: 'false', // add later if you want a toggle
      }).toString();

      const res = await fetch(`/api/expenses?${qs}`);
      if (!res.ok) throw new Error('Failed to fetch expenses');
      const json = await res.json();
      setExpenses(Array.isArray(json) ? json : []);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };




  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenseMethod, effectiveFromTo.from, effectiveFromTo.to]);


  const parseAmountFromText = (text) => {
    const matches = [...String(text).matchAll(/(\$?\s?)(\d+\.\d{2})/g)].map(m => parseFloat(m[2]));
    if (!matches.length) return null;
    return Math.max(...matches).toFixed(2);
  };

  const parseDateFromText = (text) => {
    const patterns = [
      /\b(\d{4})[-\/](\d{2})[-\/](\d{2})\b/, // YYYY-MM-DD
      /\b(\d{2})[-\/](\d{2})[-\/](\d{4})\b/, // MM/DD/YYYY or DD/MM/YYYY
    ];
    const s = String(text || '');
    for (const p of patterns) {
      const m = s.match(p);
      if (!m) continue;

      if (p === patterns[0]) {
        const [_, yyyy, mm, dd] = m;
        const iso = `${yyyy}-${mm}-${dd}`;
        if (moment(iso, 'YYYY-MM-DD', true).isValid()) return iso;
      } else {
        const [_, a, b, yyyy] = m;
        let candidate = `${yyyy}-${a}-${b}`;
        if (moment(candidate, 'YYYY-MM-DD', true).isValid()) return candidate;
        candidate = `${yyyy}-${b}-${a}`;
        if (moment(candidate, 'YYYY-MM-DD', true).isValid()) return candidate;
      }
    }
    return null;
  };

  const handleReceiptChange = async (file) => {
    if (!file) return;

    // store file in formData (for upload on submit)
    setFormData(prev => ({ ...prev, receipt: file }));

    setOcrRunning(true);
    setOcrProgress(10);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('receipt', file);

      const res = await fetch('/api/expenses/ocr-receipt', {
        method: 'POST',
        body: formDataToSend
      });

      setOcrProgress(70);

      const data = await res.json();
      const extracted = data?.text || '';

      const detectedAmount = parseAmountFromText(extracted);
      const detectedDate = parseDateFromText(extracted);

      setFormData(prev => ({
        ...prev,
        amount: detectedAmount ?? prev.amount,
        date: detectedDate ?? prev.date
      }));

      setOcrProgress(100);
    } catch (err) {
      console.error('OCR error', err);
      setOcrProgress(0);
    } finally {
      setTimeout(() => setOcrRunning(false), 250);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
         const body = new FormData();

    // map formData.date => incurredAt / paidAt
    const iso = moment(formData.date, 'YYYY-MM-DD').toISOString();
    body.append('incurredAt', iso);
    if (expenseMethod === 'cash') body.append('paidAt', iso);

    // amount/category/description/receipt
    body.append('amount', formData.amount);
    body.append('category', formData.category);
    body.append('description', formData.description || '');
    if (formData.receipt) body.append('receipt', formData.receipt);

    const res = await fetch('/api/expenses', { method: 'POST', body });
    if (!res.ok) throw new Error('Failed to add expense');

    await fetchExpenses();

      setFormData({
        amount: '',
        category: '',
        date: moment().format('YYYY-MM-DD'),
        description: '',
        receipt: null
      });

      setOcrRunning(false);
      setOcrProgress(0);
    } catch (err) {
      console.error(err);
      alert('Error adding expense.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete expense');
      fetchExpenses();
    } catch (err) {
      console.error(err);
      alert('Error deleting expense.');
    }
  };

const startEdit = (exp) => {
  const rawDate = exp?.[dateKey] || exp?.date;
  setEditingId(exp._id);
  setEditedExpense({
    amount: exp.amountTotal ?? exp.amount, // better default
    category: exp.category,
    date: rawDate ? moment(rawDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
    description: exp.description || ''
  });
};


  const cancelEdit = () => {
    setEditingId(null);
    setEditedExpense({});
  };

const handleSave = async (id) => {
  try {
    const updated = {
      ...editedExpense,
      amount: Number(editedExpense.amount),
    };

    // Map editedExpense.date -> correct model field
    const iso = editedExpense.date ? moment(editedExpense.date, 'YYYY-MM-DD').toISOString() : null;
    if (expenseMethod === 'cash') {
      updated.paidAt = iso;
    } else {
      updated.incurredAt = iso;
    }
    delete updated.date;

    const res = await fetch(`/api/expenses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    if (!res.ok) throw new Error('Failed to update');

    const updatedExp = await res.json();
    setExpenses(prev => prev.map(e => (e._id === id ? updatedExp : e)));
    cancelEdit();
  } catch (err) {
    console.error(err);
    alert('Update failed');
  }
};




  const filteredExpenses = useMemo(() => {
    const from = effectivePeriod.from;
    const to = effectivePeriod.to;
    const query = q.trim().toLowerCase();

    return expenses
      .filter((e) => {
        const rawDate = e?.[dateKey] || e?.date; // fallback for old docs
        const d = rawDate ? moment(rawDate) : null;
        if (!d || !d.isValid()) return false;

        if (from && d.isBefore(from, 'day')) return false;
        if (to && d.isAfter(to, 'day')) return false;
        if (filterCategory && e.category !== filterCategory) return false;

        if (query) {
          const hay = `${e.category || ''} ${e.description || ''} ${e.amountTotal ?? e.amount ?? ''}`.toLowerCase();
          if (!hay.includes(query)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const da = new Date(a?.[dateKey] || a?.date || 0);
        const db = new Date(b?.[dateKey] || b?.date || 0);
        return db - da;
      });
  }, [expenses, q, filterCategory, effectivePeriod, dateKey]);


const totals = useMemo(() => {
  const total = filteredExpenses.reduce(
    (sum, e) => sum + Number(e.amountTotal ?? e.amount ?? 0),
    0
  );
  return { total, count: filteredExpenses.length };
}, [filteredExpenses]);


  function getFiscalYearRange(fyLabel, fyStartMonth = 6) {
    // FY2025 => start Jun 1 2024, end May 31 2025
    const startYear = fyStartMonth === 1 ? fyLabel : fyLabel - 1;
    const start = moment({ year: startYear, month: fyStartMonth - 1, day: 1 }).startOf('day');
    const end = start.clone().add(1, 'year').subtract(1, 'day').endOf('day');
    return { start, end };
  }



  return (
    <section className="py-4 px-1 mx-auto">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h3 className="mb-0">Expenses</h3>
        <Badge color="light" className="text-dark border">
          Showing {totals.count} • Total {currency(totals.total)}
        </Badge>
      </div>

      <Row className="g-3 mb-4">
        {/* LEFT: Add */}
        <Col lg={5}>
          <Card className="h-100">
            <CardBody>
              <h5 className="mb-3">Add Expense</h5>

              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label>Amount (CAD)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    className="text-bold form-input text-cleanar-color"
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Category</Label>
                  <Input
                    type="select"
                    value={formData.category}
                    className="text-bold form-input text-cleanar-color"
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="">Select Category</option>
                    {expenseCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Input>
                </FormGroup>

                <Row className="g-2">
                  <Col md={6}>
                    <FormGroup>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={formData.date}
                        className="text-bold form-input text-cleanar-color"
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label>Receipt (optional)</Label>
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        className="text-cleanar-color form-input"
                        onChange={e => handleReceiptChange(e.target.files?.[0])}
                      />
                    </FormGroup>
                  </Col>
                </Row>

                {ocrRunning && (
                  <div className="mt-2">
                    <div className="small text-muted">Reading receipt (OCR)… {ocrProgress}%</div>
                    <Progress value={ocrProgress} />
                  </div>
                )}

                <FormGroup className="mt-2">
                  <Label>Description</Label>
                  <Input
                    type="text"
                    value={formData.description}
                    className="text-bold form-input text-cleanar-color"
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g., Home Depot supplies for job #123"
                  />
                </FormGroup>

                <div className="d-flex gap-2 mt-3">
                  <Button color="primary" type="submit" disabled={uploading} className="w-100">
                    {uploading ? <Spinner size="sm" /> : 'Add Expense'}
                  </Button>
                  <Button
                    type="button"
                    color="secondary"
                    outline
                    className="w-100"
                    onClick={() => setFormData({
                      amount: '',
                      category: '',
                      date: moment().format('YYYY-MM-DD'),
                      description: '',
                      receipt: null
                    })}
                  >
                    Clear
                  </Button>
                </div>

                <div className="small text-muted mt-3">
                  Tip: For taxes, keep receipts and add a clear description (“what/why”). We’ll map categories to tax lines later.
                </div>
              </Form>
            </CardBody>
          </Card>
        </Col>

        {/* RIGHT: Filters + Quick totals */}
        <Col lg={7}>
          <Card className="mb-3">
            <CardBody>
              <h5 className="mb-3">Find Expenses</h5>

              {/* <Row className="g-2">
                <Col md={4}>
                  <FormGroup>
                    <Label>Search</Label>
                    <Input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="category, description, amount…"
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label>Category</Label>
                    <Input
                      type="select"
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                    >
                      <option value="">All categories</option>
                      {expenseCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
                <Col md={2}>
                  <FormGroup>
                    <Label>From</Label>
                    <Input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} />
                  </FormGroup>
                </Col>
                <Col md={2}>
                  <FormGroup>
                    <Label>To</Label>
                    <Input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} />
                  </FormGroup>
                </Col>
              </Row> */}
              <Row className="g-2">
                <Col md={3}>
                  <FormGroup>
                    <Label>Period</Label>
                    <Input
                      type="select"
                      value={periodMode}
                      onChange={(e) => setPeriodMode(e.target.value)}
                    >
                      <option value="thisMonth">This Month</option>
                      <option value="fiscalYear">Fiscal Year (Jun–May)</option>
                      <option value="custom">Custom</option>
                    </Input>
                  </FormGroup>
                </Col>

                {periodMode === 'fiscalYear' && (
                  <Col md={3}>
                    <FormGroup>
                      <Label>Fiscal Year</Label>
                      <Input
                        type="number"
                        min={2000}
                        max={2100}
                        value={fiscalYear}
                        onChange={(e) => setFiscalYear(Number(e.target.value))}
                      />
                      <div className="small text-muted">
                        FY{fiscalYear}: Jun {fiscalYear - 1} → May {fiscalYear}
                      </div>
                    </FormGroup>
                  </Col>
                )}

                {periodMode === 'custom' && (
                  <>
                    <Col md={3}>
                      <FormGroup>
                        <Label>From</Label>
                        <Input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} />
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup>
                        <Label>To</Label>
                        <Input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} />
                      </FormGroup>
                    </Col>
                  </>
                )}

                <Col md={periodMode === 'custom' ? 3 : 3}>
                  <FormGroup>
                    <Label>Category</Label>
                    <Input
                      type="select"
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                    >
                      <option value="">All categories</option>
                      {expenseCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
              </Row>

              <Row className="g-2">
                <Col md={6}>
                  <FormGroup>
                    <Label>Search</Label>
                    <Input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="category, description, amount…"
                    />
                  </FormGroup>
                </Col>
                <Col md={6} className="d-flex align-items-end justify-content-end">
                  <Badge color="light" className="text-dark border">
                    {effectivePeriod.label}
                  </Badge>
                </Col>
              </Row>


              <div className="d-flex justify-content-between align-items-center mt-2">
                <div className="small text-muted">
                  Showing <strong>{totals.count}</strong> expenses in this filter.
                </div>
                <Button
                  size="sm"
                  color="secondary"
                  outline
                  // onClick={() => {
                  //   setQ('');
                  //   setFilterCategory('');
                  //   setFilterFrom(moment().subtract(30, 'days').format('YYYY-MM-DD'));
                  //   setFilterTo(moment().format('YYYY-MM-DD'));
                  // }}
                  onClick={() => {
                    setQ('');
                    setFilterCategory('');
                    setPeriodMode('thisMonth');
                    setFiscalYear((() => {
                      const now = moment();
                      return (now.month() + 1) >= FY_START_MONTH ? now.year() + 1 : now.year();
                    })());
                    setFilterFrom(moment().subtract(30, 'days').format('YYYY-MM-DD'));
                    setFilterTo(moment().format('YYYY-MM-DD'));
                  }}

                >
                  Reset filters
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">All Expenses</h5>
                <Button size="sm" color="primary" outline disabled={loading} onClick={fetchExpenses}>
                  {loading ? <Spinner size="sm" /> : 'Refresh'}
                </Button>
              </div>

              <div className="mt-3">
                {loading ? (
                  <Spinner />
                ) : (
                  <Table striped bordered responsive>
                    <thead>
                      <tr>
                        <th style={{ width: 110 }}>Date</th>
                        <th style={{ width: 170 }}>Category</th>
                        <th style={{ width: 120 }}>Amount</th>
                        <th>Description</th>
                        <th style={{ width: 80 }}>Receipt</th>
                        <th style={{ width: 160 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.map(exp => {
                        const isEditing = editingId === exp._id;

                        return (
                          <tr key={exp._id}>
                            <td>
                              {isEditing ? (
                                <Input
                                  type="date"
                                  value={editedExpense.date}
                                  onChange={(e) => setEditedExpense({ ...editedExpense, date: e.target.value })}
                                />
                              ) : (
                                moment(exp?.[dateKey] || exp?.date).format('YYYY-MM-DD')

                              )}
                            </td>

                            <td>
                              {isEditing ? (
                                <Input
                                  type="select"
                                  value={editedExpense.category}
                                  onChange={(e) => setEditedExpense({ ...editedExpense, category: e.target.value })}
                                >
                                  <option value="">Select Category</option>
                                  {expenseCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                  ))}
                                </Input>
                              ) : (
                                exp.category
                              )}
                            </td>

                            <td>
                              {isEditing ? (
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={editedExpense.amount}
                                  onChange={(e) => setEditedExpense({ ...editedExpense, amount: e.target.value })}
                                />
                              ) : (
                                currency(exp.amount)
                              )}
                            </td>

                            <td>
                              {isEditing ? (
                                <Input
                                  type="text"
                                  value={editedExpense.description}
                                  onChange={(e) => setEditedExpense({ ...editedExpense, description: e.target.value })}
                                />
                              ) : (
                                exp.description || '-'
                              )}
                            </td>

                            <td>
                              {exp.receiptUrl ? (
                                <a href={exp.receiptUrl} target="_blank" rel="noreferrer">View</a>
                              ) : '—'}
                            </td>

                            <td>
                              {isEditing ? (
                                <div className="d-flex gap-2">
                                  <Button size="sm" color="success" onClick={() => handleSave(exp._id)}>
                                    Save
                                  </Button>
                                  <Button size="sm" color="secondary" outline onClick={cancelEdit}>
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <div className="d-flex gap-2">
                                  <Button size="sm" color="primary" onClick={() => startEdit(exp)}>
                                    Edit
                                  </Button>
                                  <Button size="sm" color="danger" outline onClick={() => handleDelete(exp._id)}>
                                    Delete
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}

                      {filteredExpenses.length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-muted">
                            No expenses match your filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                )}
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </section>
  );
};

export default ExpenseDashboard;
