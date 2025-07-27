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

    const res = await fetch(`/api/finance/summary?${qs}`);
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

      {summary && (
        <Row className="g-3 mb-4">
          <Col md={3}><StatCard title="Recognized Income" value={summary.income.recognized} /></Col>
          <Col md={3}><StatCard title="Projected Income"  value={summary.income.projected} /></Col>
          <Col md={3}><StatCard title="Expenses"          value={summary.expenses.total} /></Col>
          <Col md={3}><StatCard title="Net Profit"        value={summary.netProfit} /></Col>
        </Row>
      )}

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

      {/* Add Income & Expenses tables with CSV export if you want */}

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
