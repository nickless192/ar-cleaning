// import React, { useState, useEffect } from 'react';
// import { Container, Row, Col, Card, Table, Button, Form, Badge, Alert } from 'react-bootstrap';
// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// export default function BookingDashboard() {
//   const [bookings, setBookings] = useState([]);
//   const [selectedBooking, setSelectedBooking] = useState(null);
//   const [alerts, setAlerts] = useState([]);
//   const [filters, setFilters] = useState({ status: '', search: '' });

//   useEffect(() => {
//     fetch('/api/bookings')
//       .then(res => res.json())
//       .then(data => {
//         setBookings(data);
//         updateAlerts(data);
//       });
//   }, []);

//   const updateAlerts = (data) => {
//     const actionable = data.filter(b => b.status !== 'Paid' && b.status !== 'Completed');
//     setAlerts(actionable);
//   };

//   const handleSave = () => {
//     fetch(`/api/bookings/${selectedBooking._id}`, {
//       method: 'PATCH',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(selectedBooking)
//     }).then(() => {
//       const updated = bookings.map(b => b._id === selectedBooking._id ? selectedBooking : b);
//       setBookings(updated);
//       updateAlerts(updated);
//       setSelectedBooking(null);
//     });
//   };

//   const filteredBookings = bookings.filter(b => {
//     return (
//       (!filters.status || b.status === filters.status) &&
//       (!filters.search || b.customerName.toLowerCase().includes(filters.search.toLowerCase()))
//     );
//   });

//   const incomeByDay = bookings.reduce((acc, b) => {
//     const day = new Date(b.date).toLocaleDateString();
//     acc[day] = (acc[day] || 0) + b.income;
//     return acc;
//   }, {});
//   const chartData = Object.keys(incomeByDay).map(day => ({ day, income: incomeByDay[day] }));

//   return (
//     <Container fluid className="py-4">
//       {/* KPI Cards */}
//       <Row className="mb-4">
//         <Col md={4}><Card className="shadow-sm p-3"><h6>Upcoming Jobs</h6><h3>{bookings.filter(b => b.status === 'Scheduled').length}</h3></Card></Col>
//         <Col md={4}><Card className="shadow-sm p-3"><h6>Projected Income</h6><h3>${bookings.reduce((s, b) => s + b.income, 0)}</h3></Card></Col>
//         <Col md={4}><Card className="shadow-sm p-3"><h6>Follow-Ups Needed</h6><h3>{bookings.filter(b => b.status === 'Completed').length}</h3></Card></Col>
//       </Row>

//       {/* Alerts */}
//       {alerts.length > 0 && <Alert variant="warning">⚠️ {alerts.length} jobs need action (Scheduled/In Progress).</Alert>}

//       {/* Filters */}
//       <Row className="mb-3">
//         <Col md={3}>
//           <Form.Select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
//             <option value="">All Statuses</option>
//             <option value="Scheduled">Scheduled</option>
//             <option value="In Progress">In Progress</option>
//             <option value="Completed">Completed</option>
//             <option value="Paid">Paid</option>
//           </Form.Select>
//         </Col>
//         <Col md={4}>
//           <Form.Control type="text" placeholder="Search by customer" value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} />
//         </Col>
//       </Row>

//       {/* Bookings Table */}
//       <Row>
//         <Col lg={8}>
//           <Card className="shadow-sm">
//             <Card.Header><h5>Bookings</h5></Card.Header>
//             <Card.Body className="p-0">
//               <Table hover responsive className="mb-0">
//                 <thead>
//                   <tr>
//                     <th>Customer</th>
//                     <th>Service</th>
//                     <th>Date</th>
//                     <th>Income</th>
//                     <th>Status</th>
//                     <th></th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredBookings.map(b => (
//                     <tr key={b._id}>
//                       <td>{b.customerName}</td>
//                       <td>{b.serviceType}</td>
//                       <td>{new Date(b.date).toLocaleString()}</td>
//                       <td>${b.income}</td>
//                       <td><Badge bg={b.status === 'confirmed' ? 'info' : b.status === 'completed' ? 'success' : b.status === 'cancelled' ? 'danger' : 'secondary'}>{b.status}</Badge></td>
//                       <td><Button size="sm" variant="outline-primary" onClick={() => setSelectedBooking(b)}>Edit</Button></td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </Table>
//             </Card.Body>
//           </Card>
//         </Col>

//         {/* Quick Edit & Workflow Panel */}
//         <Col lg={4}>
//           {selectedBooking && (
//             <Card className="shadow-sm p-3">
//               <h5>Update Booking</h5>
//               <Form>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Service Type</Form.Label>
//                   <Form.Control type="text" value={selectedBooking.serviceType} onChange={e => setSelectedBooking({ ...selectedBooking, serviceType: e.target.value })} />
//                 </Form.Group>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Date/Time</Form.Label>
//                   <Form.Control type="datetime-local" value={new Date(selectedBooking.date).toISOString().slice(0, 16)} onChange={e => setSelectedBooking({ ...selectedBooking, date: e.target.value })} />
//                 </Form.Group>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Income (CAD)</Form.Label>
//                   <Form.Control type="number" value={selectedBooking.income} onChange={e => setSelectedBooking({ ...selectedBooking, income: Number(e.target.value) })} />
//                 </Form.Group>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Status</Form.Label>
//                   <Form.Select value={selectedBooking.status} onChange={e => setSelectedBooking({ ...selectedBooking, status: e.target.value })}>
//                     <option value="Scheduled">Scheduled</option>
//                     <option value="In Progress">In Progress</option>
//                     <option value="Completed">Completed</option>
//                     <option value="Paid">Paid</option>
//                   </Form.Select>
//                 </Form.Group>
//                 <div className="mb-3">
//                   <strong>Workflow Checklist:</strong>
//                   <ul>
//                     <li><Form.Check type="checkbox" label="Confirmed with client" /></li>
//                     <li><Form.Check type="checkbox" label="Service completed" /></li>
//                     <li><Form.Check type="checkbox" label="Invoice sent" /></li>
//                     <li><Form.Check type="checkbox" label="Payment received" /></li>
//                   </ul>
//                 </div>
//                 <div className="d-flex gap-2">
//                   <Button variant="success" onClick={handleSave}>Save</Button>
//                   <Button variant="secondary" onClick={() => setSelectedBooking(null)}>Cancel</Button>
//                 </div>
//               </Form>
//             </Card>
//           )}
//         </Col>
//       </Row>

//       {/* Chart Section */}
//       <Row className="mt-4">
//         <Col>
//           <Card className="shadow-sm p-3">
//             <h5>Income by Day</h5>
//             <ResponsiveContainer width="100%" height={250}>
//               <BarChart data={chartData}>
//                 <XAxis dataKey="day" />
//                 <YAxis />
//                 <Tooltip />
//                 <Bar dataKey="income" fill="#007bff" />
//               </BarChart>
//             </ResponsiveContainer>
//           </Card>
//         </Col>
//       </Row>
//     </Container>
//   );
// }

import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Badge,
  Alert
} from 'react-bootstrap';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export default function BookingDashboard() {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [filters, setFilters] = useState({ status: '', search: '' });

  useEffect(() => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        setBookings(data);
        computeAlerts(data);
      });
  }, []);

  const computeAlerts = data => {
    const now = new Date();
    const next48 = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const newAlerts = [];

    data.forEach(b => {
      const bd = new Date(b.date);
      if (bd >= now && bd <= next48) {
        newAlerts.push({
          id: `a-${b._id}-upcoming`,
          level: 'info',
          text: `Upcoming: ${b.customerName} (${b.serviceType}) — ${bd.toLocaleString()}`
        });
      }
      if (b.status === 'Completed' && !b.tasks?.paid) {
        newAlerts.push({
          id: `a-${b._id}-unpaid`,
          level: 'warning',
          text: `Completed but unpaid: ${b.customerName} — $${b.income}`
        });
      }
      if (bd < now && b.status === 'Scheduled') {
        newAlerts.push({
          id: `a-${b._id}-missed`,
          level: 'danger',
          text: `Missed: ${b.customerName} — ${bd.toLocaleString()}`
        });
      }
    });

    setAlerts(newAlerts);
  };

  const handleSave = () => {
    fetch(`/api/bookings/${selectedBooking._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selectedBooking)
    }).then(() => {
      const updated = bookings.map(b =>
        b._id === selectedBooking._id ? selectedBooking : b
      );
      setBookings(updated);
      computeAlerts(updated);
      setSelectedBooking(null);
    });
  };

  const toggleTask = (taskKey) => {
    setSelectedBooking(prev => {
      const updatedTasks = {
        ...prev.tasks,
        [taskKey]: !prev.tasks?.[taskKey]
      };
      let newStatus = prev.status;
      if (taskKey === 'onsite' && updatedTasks.onsite) newStatus = 'In Progress';
      if (taskKey === 'invoiced' && updatedTasks.invoiced) newStatus = 'Completed';
      if (taskKey === 'paid' && updatedTasks.paid) newStatus = 'Paid';

      return { ...prev, tasks: updatedTasks, status: newStatus };
    });
  };

  const filteredBookings = bookings
    .filter(b => (!filters.status || b.status === filters.status))
    .filter(b => (!filters.search || b.customerName.toLowerCase().includes(filters.search.toLowerCase())))
    .sort((a, z) => new Date(a.date) - new Date(z.date));

  const metrics = useMemo(() => {
    const now = new Date();
    const upcomingWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcoming = bookings.filter(b => new Date(b.date) >= now && new Date(b.date) <= upcomingWeek).length;
    const incomeWeek = bookings
      .filter(b => new Date(b.date) >= now && new Date(b.date) <= upcomingWeek)
      .reduce((s, b) => s + (b.income || 0), 0);
    const unpaid = bookings.filter(b => b.status === 'Completed' && !b.tasks?.paid).length;
    return { upcoming, incomeWeek, unpaid };
  }, [bookings]);

  const incomeByDay = bookings.reduce((acc, b) => {
    const day = new Date(b.date).toLocaleDateString();
    acc[day] = (acc[day] || 0) + (b.income || 0);
    return acc;
  }, {});
  const chartData = Object.keys(incomeByDay).map(day => ({ day, income: incomeByDay[day] }));

  return (
    <Container fluid className="py-4">
      {/* KPI Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="shadow-sm p-3">
            <h6>Upcoming (7d)</h6>
            <h3>{metrics.upcoming}</h3>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm p-3">
            <h6>Projected Income (7d)</h6>
            <h3>${metrics.incomeWeek}</h3>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm p-3">
            <h6>Unpaid Completed</h6>
            <h3>{metrics.unpaid}</h3>
          </Card>
        </Col>
      </Row>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Alert variant="warning">
          <strong>⚠️ {alerts.length} Alerts:</strong>
          <ul className="mb-0">
            {alerts.map(a => (
              <li key={a.id}>{a.text}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Filters */}
      <Row className="mb-3">
        <Col md={3}>
          <Form.Select
            value={filters.status}
            onChange={e => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="confirmed">Confirmed</option>
            <option value="paid">Paid</option>
          </Form.Select>
        </Col>
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Search by customer"
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
          />
        </Col>
      </Row>

      {/* Bookings Table */}
      <Row>
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Header><h5>Bookings</h5></Card.Header>
            <Card.Body className="p-0">
              <Table hover responsive className="mb-0">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Income</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map(b => (
                    <tr key={b._id}>
                      <td>{b.customerName}</td>
                      <td>{b.serviceType}</td>
                      <td>{new Date(b.date).toLocaleString()}</td>
                      <td>${b.income}</td>
                      <td>
                        <Badge bg={b.status === 'confirmed' ? 'info' : b.status === 'completed' ? 'success' : b.status === 'cancelled' ? 'danger' : 'secondary'}>{b.status}</Badge>
                      </td>
                      <td>
                        <Button size="sm" variant="outline-primary" onClick={() => setSelectedBooking(b)}>Edit</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Quick Edit & Workflow Panel */}
        <Col lg={4}>
          {selectedBooking && (
            <Card className="shadow-sm p-3">
              <h5>Edit Booking</h5>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Service Type</Form.Label>
                  <Form.Control type="text" value={selectedBooking.serviceType} onChange={e => setSelectedBooking({ ...selectedBooking, serviceType: e.target.value })} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Date/Time</Form.Label>
                  <Form.Control type="datetime-local" value={toLocalInputValue(selectedBooking.date)} onChange={e => setSelectedBooking({ ...selectedBooking, date: e.target.value })} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Income (CAD)</Form.Label>
                  <Form.Control type="number" value={selectedBooking.income} onChange={e => setSelectedBooking({ ...selectedBooking, income: Number(e.target.value) })} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select value={selectedBooking.status} onChange={e => setSelectedBooking({ ...selectedBooking, status: e.target.value })}>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="paid">Paid</option>
                  </Form.Select>
                </Form.Group>
                <div className="mb-3">
                  <strong>Workflow Checklist:</strong>
                  {['confirmed', 'onsite', 'invoiced', 'paid'].map(k => (
                    <Form.Check
                      key={k}
                      type="checkbox"
                      label={k.charAt(0).toUpperCase() + k.slice(1)}
                      checked={selectedBooking.tasks?.[k] || false}
                      onChange={() => toggleTask(k)}
                    />
                  ))}
                </div>
                <div className="d-flex gap-2">
                  <Button variant="success" onClick={handleSave}>Save</Button>
                  <Button variant="secondary" onClick={() => setSelectedBooking(null)}>Cancel</Button>
                </div>
              </Form>
            </Card>
          )}
        </Col>
      </Row>

      {/* Chart Section */}
      <Row className="mt-4">
        <Col>
          <Card className="shadow-sm p-3">
            <h5>Income by Day</h5>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="income" fill="#007bff" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

// Helper for datetime-local input formatting
function toLocalInputValue(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}
