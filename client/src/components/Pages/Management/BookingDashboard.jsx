import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Container, Row, Col,
  Form, FormGroup, Label, Input,
  Button, Alert, Spinner,
  Table
} from 'reactstrap';
import moment from 'moment';
import BookingCalendar from './BookingCalendar';
import { FaTrash } from 'react-icons/fa';
import Auth from "/src/utils/auth";


const BookingDashboard = () => {
  // const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const location = useLocation();
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [formData, setFormData] = useState({
    customerId: '',
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

    const fetchCustomers = async () => {
      try {
        const res = await fetch('/api/customers');
        if (!res.ok) throw new Error('Failed to fetch customers');
        const data = await res.json();
        setCustomers(data);
      } catch (err) {
        console.error('Error fetching customers:', err);
      }
    };
    if (isInitialLoad) {
      setIsInitialLoad(false);
      fetchBookings();
      fetchCustomers();
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

  const handleComplete = async (bookingId, status) => {
    if (status === 'completed') {
      alert('This booking is already marked as completed.');
      return;
    }
    if (status === 'cancelled') {
      alert('You cannot mark a cancelled booking as completed.');
      return;
    }
    if (!window.confirm('Are you sure you want to mark this booking as completed?')) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed', updatedBy: Auth.getProfile().data._id }) // Assuming you have user authentication
      });
      if (!res.ok) throw new Error('Failed to mark as completed');
      fetchBookings();
    } catch (err) {
      alert('Error marking booking as completed.');
    }
  };

  const handleHide = async (bookingId, status) => {
    if (status === 'pending' || status === 'confirmed') {
      alert('You can only hide completed or cancelled bookings.');
      return;
    }
    if (!window.confirm('Are you sure you want to hide this booking?')) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}/hide`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hidden: true, updatedBy: Auth.getProfile().data._id }) // Assuming you have user authentication
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
      const body = {
        ...formData,
        userId: Auth.getProfile().data._id // Assuming you have user authentication
      };
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
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
      setSelectedCustomerId('');
      fetchBookings();

    } catch (err) {
      setMessage({ type: 'danger', text: 'Error submitting booking.' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmed = async (bookingId, status) => {
    if (status !== 'pending') {
      alert('You can only confirm bookings that are pending.');
      return;
    }
    if (!window.confirm('Are you sure you want to confirm this booking?')) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}/confirm`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmed', updatedBy: Auth.getProfile().data._id }) // Assuming you have user authentication
      });
      if (!res.ok) throw new Error('Failed to confirm booking');
      fetchBookings();
    } catch (err) {
      alert('Error confirming booking.');
    }
  };

  const handleCancel = async (bookingId, status) => {
    if (status === 'completed' || status === 'cancelled') {
      alert('You cannot cancel a completed or already cancelled booking.');
      return;
    }
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    // return async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled', updatedBy: Auth.getProfile().data._id }) // Assuming you have user authentication
      });
      if (!res.ok) throw new Error('Failed to cancel booking');
      fetchBookings();
    } catch (err) {
      alert('Error cancelling booking.');
    }
    // };
  };

  const handlePend = async (bookingId, status) => {
    if (status !== 'confirmed' && status !== 'cancelled') {
      alert('You can only pend bookings that are confirmed or cancelled.');
      return;
    }
    if (!window.confirm('Are you sure you want to pend this booking?')) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}/pending`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending', updatedBy: Auth.getProfile().data._id }) // Assuming you have user authentication
      });
      if (!res.ok) throw new Error('Failed to pend booking');
      fetchBookings();
    } catch (err) {
      alert('Error pending booking.');
    }
  };

  return (
    <section className="py-4 px-1 mx-auto">
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
              <Label for="customerSelect">Select Saved Customer</Label>
              <Input
                type="select"
                id="customerSelect"
                value={selectedCustomerId}
                onChange={e => {
                  const selectedId = e.target.value;
                  setSelectedCustomerId(selectedId);
                  const selectedCustomer = customers.find(c => c._id === selectedId);
                  if (selectedCustomer) {
                    setFormData(prev => ({
                      ...prev,
                      customerId: selectedCustomer._id,
                      customerName: selectedCustomer.firstName + ' ' + selectedCustomer.lastName,
                      customerEmail: selectedCustomer.email
                    }));
                  } else {
                    // If cleared selection
                    setFormData(prev => ({
                      ...prev,
                      customerId: '',
                      customerName: '',
                      customerEmail: ''
                    }));
                  }
                }}
              >
                <option value="">-- Select a customer --</option>
                {customers.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.firstName} {c.lastName} ({c.email})
                  </option>
                ))}
              </Input>
            </FormGroup>

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
                readOnly={!!formData.customerId}
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
                readOnly={!!formData.customerId}
              />
            </FormGroup>
            {formData.customerId && (
              <FormGroup>
                <Label for="customerId">Customer ID</Label>
                <Input
                  type="text"
                  id="customerId"
                  className="text-cleanar-color text-bold form-input"
                  value={formData.customerId}
                  readOnly
                />
              </FormGroup>
            )}

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
                  <th>Customer Name and Email</th>
                  {/* <th>Email</th> */}
                  <th>Service</th>
                  <th>Income</th>
                  <th>Service Date</th>
                  <th>Confirmation/Reminder Scheduled</th>
                  {/* <th>Reminder Scheduled</th> */}
                  <th>Booking By</th>
                  <th>Status</th>
                  {/* <th>Actions</th> */}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, index) => (
                  <tr key={b._id}>
                    <td className="align-top">
                      <div className="d-flex flex-column align-items-start">
                        <div>{index + 1}</div>
                        <div className="d-flex flex-wrap gap-1 mt-1">
                          {(b.status === 'confirmed' || b.status === 'cancelled') && (
                            <Button
                              onClick={() => handlePend(b._id, b.status)}
                              color="primary"
                              size="sm"
                              title="Revert to Pending"
                            >
                              ⏪
                            </Button>
                          )}
                          {b.status === 'pending' && (
                            <Button
                              onClick={() => handleConfirmed(b._id, b.status)}
                              color="success"
                              size="sm"
                              title="Confirm"
                            >
                              ✅
                            </Button>
                          )}
                          <Button
                            color="info"
                            size="sm"
                            onClick={() => handleComplete(b._id, b.status)}
                            title="Mark Completed"
                          >
                            ✔️
                          </Button>
                          <Button
                            color="secondary"
                            size="sm"
                            onClick={() => handleCancel(b._id, b.status)}
                            title="Cancel"
                          >
                            ❌
                          </Button>
                          <Button
                            color="warning"
                            size="sm"
                            onClick={() => handleHide(b._id, b.status)}
                            title="Hide"
                          >
                            🙈
                          </Button>
                          <Button
                            color="danger"
                            size="sm"
                            onClick={() => handleDelete(b._id)}
                            title="Delete"
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="fw-bold">{b.customerName}</div>
                      <div className="text-muted small">{b.customerEmail}</div>
                    </td>

                    <td>{b.serviceType}</td>
                    <td>{b.income ? `$${parseFloat(b.income).toFixed(2)}` : 'N/A'}</td>
                    <td>{moment(b.date).format('YYYY-MM-DD HH:mm')}</td>
                    <td>
                      <div className="mb-1">
                        <strong>Confirmation:</strong>{' '}
                        {b.disableConfirmation
                          ? 'Disabled'
                          : b.confirmationSent
                            ? '✅ Sent'
                            : b.scheduleConfirmation
                              ? 'Scheduled'
                              : 'Not Scheduled'}
                        {b.confirmationDate && (
                          <div className="text-muted small">
                            @ {moment(b.confirmationDate).format('MM-DD HH:mm')}
                          </div>
                        )}
                      </div>

                      <div>
                        <strong>Reminder:</strong>{' '}
                        {b.reminderScheduled ? '✅ Scheduled' : '❌ Not Scheduled'}
                        {b.reminderDate && (
                          <div className="text-muted small">
                            @ {moment(b.reminderDate).format('MM-DD HH:mm')}
                          </div>
                        )}
                        <div className="text-muted small">
                          {b.reminderScheduled && (b.reminderSent ? 'Sent' : 'Send Pending')}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="fw-bold mb-1">
                        {b.createdBy ? `${b.createdBy.firstName} ${b.createdBy.lastName}` : 'N/A'}
                      </div>
                      <div className="fw-bold">
                        {moment(b.createdAt).format('YYYY-MM-DD')} @ {moment(b.createdAt).format('HH:mm')}
                      </div>
                      <div className="small">
                        <div className="fw-semibold">Last Updated By:</div>
                        {b.updatedBy?.firstName ? (
                          <>
                            <div>{b.updatedBy.firstName} {b.updatedBy.lastName}</div>
                            <div className="text-muted">{b.updatedBy.email}</div>
                          </>
                        ) : (
                          <div className="text-muted">Unknown</div>
                        )}
                      </div>
                    </td>

                    <td>{b.status}</td>
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
          </div>

        </Col>
      </Row>
    </section>
  );
};

export default BookingDashboard;
