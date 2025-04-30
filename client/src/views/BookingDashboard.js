import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Form, Button, Alert, Spinner } from 'react-bootstrap';
import moment from 'moment';
import {
  Input,
  Label
} from 'reactstrap';
import BookingCalendar from './BookingCalendar';
import QuickQuoteDashboard from './QuickQuoteDashboard';

const BookingDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    serviceType: '',
    date: '',
    confirmationSent: false,
    reminderScheduled: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Fetch all bookings on mount
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      if (!res.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  };

  const handleChange = e => {
    let value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        throw new Error('Failed to submit booking');
      }

      setMessage({ type: 'success', text: 'Booking submitted successfully!' });
      setFormData({ customerName: '', customerEmail: '', serviceType: '', date: '' });
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
          {message && <Alert variant={message.type}>{message.text}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="customerName" className="mb-3">
              <Form.Label>Customer Name</Form.Label>
              <Form.Control
                type="text"
                name="customerName"
                className="text-cleanar-color text-bold form-input"
                value={formData.customerName}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="customerEmail" className="mb-3">
              <Form.Label>Customer Email</Form.Label>
              <Form.Control
                type="email"
                name="customerEmail"
                className="text-cleanar-color text-bold form-input"
                value={formData.customerEmail}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="serviceType" className="mb-3">
              <Form.Label>Service Type</Form.Label>
              <Form.Control
                as="select"
                name="serviceType"
                className="text-cleanar-color text-bold form-input"
                value={formData.serviceType}
                onChange={handleChange}
                required
              >
                <option value="">Select a service</option>
                <option value="Regular Maintenance Cleaning">Regular Maintenance Cleaning</option>
                <option value="Carpet Cleaning">Carpet/Upholstery Cleaning</option>
                <option value="Deep Cleaning">Deep Cleaning</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="date" className="mb-3">
              <Form.Label>Booking Date</Form.Label>
              <Form.Control
                type="datetime-local"
                name="date"
                className="text-cleanar-color text-bold form-input"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </Form.Group>
            {/* i want to add 2 options: 1 to disable sending the confirmation, and 2 to disable sending the reminder  */}
            <Form.Group controlId="confirmationSent" className="mb-3">
              {/* <Form.Label>Confirmation Sent</Form.Label>
              <Form.Check
                type="checkbox" 
                id="confirmationSent"
                name="confirmationSent"
                className="text-cleanar-color text-bold form-input"
                checked={formData.confirmationSent}
                onChange={handleChange}
                label="Disable send confirmation email"
              /> */}
              <Label check className="text-cleanar-color text-bold form-input">
                <Input
                  type="checkbox"
                  id="confirmationSent"
                  name="confirmationSent"
                  className="text-cleanar-color text-bold form-input"
                  checked={formData.confirmationSent}
                  onChange={handleChange}
                />
                <span className="form-check-sign"></span>
                Disable send confirmation email
              </Label>
            </Form.Group>
            <Form.Group controlId="reminderScheduled" className="mb-3">
              <Label check className="text-cleanar-color text-bold form-input">
                <Input
                  type="checkbox"
                  id="reminderScheduled"
                  name="reminderScheduled"
                  className="text-cleanar-color text-bold form-input"
                  checked={formData.reminderScheduled}
                  onChange={handleChange}
                />
                <span className="form-check-sign"></span>
                Disable send reminder email
              </Label>
              {/* <Form.Label>Reminder Scheduled</Form.Label>
              <Form.Check
                type="checkbox"
                id="reminderScheduled"
                name="reminderScheduled"
                className="text-cleanar-color text-bold form-input"
                checked={formData.reminderScheduled}
                onChange={handleChange}
                label="Disable send reminder email"
              /> */}
            </Form.Group>

            <Button type="submit" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Submit Booking'}
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
                  <th>Reminder Sent</th>
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
                    <td>{b.reminderSent ? '✅' : '❌'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No bookings yet.</p>
          )}
        </Col>

      </Row>
      <Row className="mt-4">
          <h4>Booking Calendar</h4>
          <BookingCalendar bookings={bookings} />
      </Row>
    </Container>
  );
};

export default BookingDashboard;
