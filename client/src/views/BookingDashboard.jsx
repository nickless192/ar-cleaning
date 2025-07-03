import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container, Row, Col,
  Form, FormGroup, Label, Input,
  Button, Alert, Spinner,
  Table
} from 'reactstrap';
import moment from 'moment';
import BookingCalendar from './BookingCalendar';
import { FaTrash } from 'react-icons/fa';

const BookingDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    serviceType: '',
    date: '',
    scheduleConfirmation: false,
    confirmationDate: '',
    reminderScheduled: false,
    disableConfirmation: false,
    income: 0
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      fetchBookings();
      const searchParams = new URLSearchParams(location.search);
      const customerName = searchParams.get('name');
      const customerEmail = searchParams.get('email');
      const serviceType = searchParams.get('serviceType');
      setFormData(prev => ({
        ...prev,
        customerName: customerName || prev.customerName,
        customerEmail: customerEmail || prev.customerEmail,
        serviceType: serviceType || prev.serviceType
      }));
    }
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      // filter out data that is hidden
      const visibleData = data.filter(b => !b.hidden);
      setBookings(visibleData);
      // Calculate monthly income
      const thisMonth = moment().month();
      const thisYear = moment().year();
      const total = data.reduce((sum, b) => {
        const date = moment(b.date);
        const amount = parseFloat(b.income || 0);
        return date.month() === thisMonth && date.year() === thisYear ? sum + amount : sum;
      }, 0);
      setMonthlyIncome(total);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  };

  const handleChange = e => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      fetchBookings();
    } catch (err) {
      alert('Error deleting booking.');
    }
  };

  const handleComplete = async (bookingId) => {
    if (!window.confirm('Are you sure you want to mark this booking as completed?')) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });
      if (!res.ok) throw new Error('Failed to mark as completed');
      fetchBookings();
    } catch (err) {
      alert('Error marking booking as completed.');
    }
  };

  const handleHide = async (bookingId) => {
    if (!window.confirm('Are you sure you want to hide this booking?')) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}/hide`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hidden: true })
      });
      if (!res.ok) throw new Error('Failed to hide booking');
      fetchBookings();
    } catch (err) {
      alert('Error hiding booking.');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    if (!formData.customerName || !formData.customerEmail || !formData.serviceType || !formData.date) {
      setMessage({ type: 'danger', text: 'Please fill in all required fields.' });
      setLoading(false);
      return;
    }
    // Validate date
    if (formData.income < 0) {
      setMessage({ type: 'danger', text: 'Income cannot be negative.' });
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to submit booking');

      setMessage({ type: 'success', text: 'Booking submitted successfully!' });
      setFormData({
        customerName: '',
        customerEmail: '',
        serviceType: '',
        date: '',
        scheduleConfirmation: false,
        confirmationDate: '',
        reminderScheduled: false,
        disableConfirmation: false,
        income: 0
      });
      fetchBookings();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Error submitting booking.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Row>
        <Col md={5}>
          <h4>Create Booking</h4>
          {message && (
            <Alert color={message.type}>
              {message.text}
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label for="customerName">Customer Name</Label>
              <Input
                type="text"
                name="customerName"
                className="text-cleanar-color text-bold form-input"
                id="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label for="customerEmail">Customer Email</Label>
              <Input
                type="email"
                name="customerEmail"
                className="text-cleanar-color text-bold form-input"
                id="customerEmail"
                value={formData.customerEmail}
                onChange={handleChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label for="serviceType">Service Type</Label>
              <Input
                type="text"
                name="serviceType"
                className="text-cleanar-color text-bold form-input"
                id="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label for="date">Service Date</Label>
              <Input
                type="datetime-local"
                name="date"
                id="date"
                className="text-cleanar-color text-bold form-input"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label for="income">Approximate Income (CAD)</Label>
              <Input
                type="number"
                step="0.01"
                name="income"
                className="text-cleanar-color text-bold form-input"
                id="income"
                value={formData.income || ''}
                onChange={handleChange}
              />
            </FormGroup>

            <p className="text-muted mb-2 d-block">
              A confirmation email will be sent upon saving unless you override it below.
            </p>

            <FormGroup check className="mb-3">
              <Label check>
                <Input
                  type="checkbox"
                  name="scheduleConfirmation"
                  checked={formData.scheduleConfirmation}
                  onChange={handleChange}
                /><span className="form-check-sign"></span>
                {' '}
                Schedule Confirmation Email
              </Label>
            </FormGroup>
            <FormGroup>
              <Label for="confirmationDate">Confirmation Email Date (optional)</Label>
              <Input
                type="datetime-local"
                name="confirmationDate"
                className="text-cleanar-color text-bold form-input"
                id="confirmationDate"
                value={formData.confirmationDate}
                onChange={handleChange}
                disabled={!formData.scheduleConfirmation}
              />
            </FormGroup>

            <FormGroup check className="mb-3">
              <Label check>
                <Input
                  type="checkbox"
                  name="disableConfirmation"
                  checked={formData.disableConfirmation}
                  onChange={handleChange}
                /><span className="form-check-sign"></span>
                {' '}
                Disable Confirmation Email
              </Label>
            </FormGroup>


            <FormGroup check className="mb-3">
              <Label check>
                <Input
                  type="checkbox"
                  name="reminderScheduled"
                  checked={formData.reminderScheduled}
                  onChange={handleChange}
                />
                {' '}
                <span className="form-check-sign"></span>
                Send 24-hour reminder email
              </Label>
            </FormGroup>

            <Button type="submit" color="primary" disabled={loading}>
              {loading ? <Spinner size="sm" /> : 'Submit Booking'}
            </Button>
          </Form>
        </Col>

        <Col md={7}>
          <h4 className="mb-3">All Bookings</h4>
          {bookings.length > 0 ? (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Service</th>
                  <th>Service Date</th>
                  <th>Confirmation</th>
                  <th>Reminder Scheduled</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, index) => (
                  <tr key={b._id}>
                    <td>{index + 1}</td>
                    <td>{b.customerName}</td>
                    <td>{b.customerEmail}</td>
                    <td>{b.serviceType}</td>
                    <td>{moment(b.date).format('YYYY-MM-DD HH:mm')}</td>
                    <td>
                      {/* {b.scheduleConfirmation ? 'Scheduled' : 'Sent'} */}
                      {/* <br /> */}
                      {b.confirmationDate && ` @ ${moment(b.confirmationDate).format('MM-DD HH:mm')}`}
                      <br />
                      {b.confirmationSent ? '✅Sent' : b.scheduleConfirmation ? 'Scheduled' : 'Sent'}
                    </td>
                    <td>
                      {b.reminderScheduled ? (
                        <>
                          {'✅Reminder Scheduled'}
                          {b.reminderDate && ` @ ${moment(b.reminderDate).format('MM-DD HH:mm')}`}
                          <br />
                          {b.reminderSent ? 'Sent' : 'Send Pending'}
                        </>
                      ) : (
                        '❌Reminder Not Scheduled'
                      )}
                    </td>
                    <td>{moment(b.createdAt).format('YYYY-MM-DD')}</td>
                    <td>{b.status}</td>
                    <td>
                      {/* button to update status based on a dropdown of statuses */}
                      <div className="d-flex justify-content-between">
                        <Button
                          color="info"
                          size="sm"
                          onClick={() => handleComplete(b._id)}
                        >
                          Mark Completed
                        </Button>
                        <Button
                          color="warning"
                          size="sm"
                          onClick={() => handleHide(b._id)}
                        >
                          Hide
                        </Button>
                      </div>
                      <Button color="danger" size="sm" onClick={() => handleDelete(b._id)}>
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No bookings yet.</p>
          )}
        </Col>
      </Row>
      <Row className="">
        <Col>
          <h4>Booking Calendar</h4>
          <BookingCalendar bookings={bookings} />
          <div className="mt-3">
            <h5>Projected Income for {moment().format('MMMM YYYY')}: <strong>${monthlyIncome.toFixed(2)}</strong></h5>
          </div>

        </Col>
      </Row>
    </Container>
  );
};

export default BookingDashboard;
