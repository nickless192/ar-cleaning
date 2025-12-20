import React, { useEffect, useState } from 'react';
import { Row, Col, Card, CardBody, Form, FormGroup, Label, Input, Button, Spinner, Table } from 'reactstrap';
import moment from 'moment';
import RechartMonthly from './RechartMonthly'; // your Recharts component

const FinanceDashboard = () => {
  const [range, setRange] = useState({
    from: moment().startOf('month').format('YYYY-MM-DD'),
    to: moment().endOf('month').format('YYYY-MM-DD')
  });
  const [statuses, setStatuses] = useState(['completed']); // default recognized
  const [summary, setSummary] = useState(null);
  const [monthlySeries, setMonthlySeries] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    const qs = new URLSearchParams({
      from: range.from,
      to: range.to,
      statuses: statuses.join(',')
    }).toString();

    // const res = await fetch(`/api/finance/summary?${qs}`);
    const res = await fetch(`/api/finance/overview?${qs}`);
    const json = await res.json();
    setSummary(json);
    setLoading(false);
  };

  const fetchMonthly = async (year = moment(range.from).year()) => {
    const res = await fetch(`/api/finance/monthly-series?year=${year}`);
    const json = await res.json();
    setMonthlySeries(json);
  };

  useEffect(() => {
    fetchSummary();
    fetchMonthly();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchSummary();
    fetchMonthly(moment(range.from).year());
  };

  return (
    <section className="py-4 px-1 mx-auto">
      <h3>Finance Dashboard</h3>

      <Form onSubmit={handleSubmit} className="mb-3">
        <Row>
          <Col md={3}>
            <FormGroup>
              <Label>From</Label>
              <Input type="date" value={range.from}
              className='text-bold form-input text-cleanar-color'
                onChange={e => setRange(prev => ({ ...prev, from: e.target.value }))}/>
            </FormGroup>
          </Col>
          <Col md={3}>
          <FormGroup>
            <Label>To</Label>
            <Input type="date" value={range.to}
            className='text-bold form-input text-cleanar-color'
              onChange={e => setRange(prev => ({ ...prev, to: e.target.value }))}/>
          </FormGroup>
          </Col>
          <Col md={4}>
            <FormGroup>
              <Label>Status</Label>
              <Input type="select" multiple
                value={statuses}
                onChange={e => setStatuses(Array.from(e.target.selectedOptions, o => o.value))}>
                <option value="pending">pending</option>
                <option value="confirmed">confirmed</option>
                <option value="completed">completed</option>
                <option value="cancelled">cancelled</option>
              </Input>
            </FormGroup>
          </Col>
          <Col md={2} className="d-flex align-items-end">
            <Button color="primary" type="submit" disabled={loading}>
              {loading ? <Spinner size="sm"/> : 'Apply'}
            </Button>
          </Col>
        </Row>
      </Form>

         <Row>
        <Col>
          <Card>
            <CardBody>
              <h5>Monthly Series ({moment(range.from).year()})</h5>
              <RechartMonthly data={monthlySeries} />
            </CardBody>
          </Card>
        </Col>
      </Row>

      <section className='container'>
      <h2>Breakdown</h2>
         {summary && (
           <Row className="g-3 mb-4">
          <Col md={3}><StatCard title="Recognized Income" value={summary.totals.totalIncome} /></Col>
          <Col md={3}><StatCard title="Expenses" value={summary.totals.totalExpenses} /></Col>
          <Col md={3}><StatCard title="Net Profit" value={summary.totals.netProfit} /></Col>
          <Col md={3}><StatCard title="Avg. Income/Booking" value={summary.totals.avgIncomePerBooking} /></Col>
        </Row>
      )}
          {/* Breakdown: Income by Status & Service */}
      {summary && (
        <Row className="mb-4">
          <Col md={6}>
            <Card>
              <CardBody>
                <h5>Income by Status</h5>
                <Table striped size="sm">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(summary.income.byStatus || {}).map(([status, val]) => (
                      <tr key={status}>
                        <td>{status}</td>
                        <td>${Number(val).toFixed(2)}</td>
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
                <h5>Income by Service</h5>
                <Table striped size="sm">
                  <thead>
                    <tr>
                      <th>Service Type</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(summary.income.byService || {}).map(([service, val]) => (
                      <tr key={service}>
                        <td>{service}</td>
                        <td>${Number(val).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}
      {/* Top Customers */}
      {summary && summary.income.topCustomers && summary.income.topCustomers.length > 0 && (
        <Row className="mb-4">
          <Col>
            <Card>
              <CardBody>
                <h5>Top Customers</h5>
                <Table striped size="sm">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Total Income</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.income.topCustomers.map((c, i) => (
                      <tr key={i}>
                        <td>{c.name}</td>
                        <td>${Number(c.total).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}
      {/* Expense Breakdown */}
      {summary && summary.expenses && summary.expenses.byCategory && (
        <Row className="mb-4">
          <Col>
            <Card>
              <CardBody>
                <h5>Expenses by Category</h5>
                <Table striped size="sm">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(summary.expenses.byCategory).map(([cat, val]) => (
                      <tr key={cat}>
                        <td>{cat}</td>
                        <td>${Number(val).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}
      </section>   
    </section>
  );
};

const StatCard = ({ title, value }) => (
  <Card>
    <CardBody>
      <div className="text-muted small">{title}</div>
      <h4>${Number(value || 0).toFixed(2)}</h4>
    </CardBody>
  </Card>
);

export default FinanceDashboard;
