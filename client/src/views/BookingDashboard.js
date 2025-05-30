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

const BookingDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    serviceType: '',
    date: '',
    scheduleConfirmation: false,
    confirmationDate: '',
    reminderScheduled: false
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
      setBookings(data);
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

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
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
        reminderScheduled: false
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
                  <th>Date</th>
                  <th>Confirmation</th>
                  <th>Reminder</th>
                  <th>Created</th>
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
                      {b.scheduleConfirmation ? '✅' : '❌'}
                      {b.confirmationDate && ` @ ${moment(b.confirmationDate).format('MM-DD HH:mm')}`}
                    </td>
                    <td>{b.reminderScheduled ? '✅' : '❌'}</td>
                    <td>{moment(b.createdAt).format('YYYY-MM-DD')}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No bookings yet.</p>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default BookingDashboard;
