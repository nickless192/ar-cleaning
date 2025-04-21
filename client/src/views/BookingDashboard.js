import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Form, Button, Alert, Spinner } from 'react-bootstrap';
import moment from 'moment';
import BookingCalendar from './BookingCalendar';

const BookingDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    serviceType: '',
    date: ''
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
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
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
                <option value="Carpet Cleaning">Regular Maintenance Cleaning</option>
                <option value="Deep Cleaning">Carpet/Upholstery Cleaning</option>
                <option value="Move-out Cleaning">Deep Cleaning</option>
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
        {/* <Col>
          <h4>Booking Calendar</h4>
          <BookingCalendar bookings={bookings} />
        </Col> */}
      </Row>
    </Container>
  );
};

export default BookingDashboard;
