import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import BookingForm from '../Booking/BookingForm.jsx';
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
import BookingTable from "../Booking/BookingTable.jsx";


const BookingList = () => {
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
    <section className="py-4 px-5 mx-auto">
      <Row>
        <Col>
          <h4>Booking Calendar</h4>
          <BookingCalendar bookings={bookings}
            fetchBookings={fetchBookings}
            deleteBooking={handleDelete}
            onPend={handlePend}
            completeBooking={handleComplete}
            cancelBooking={handleCancel}
            hideBooking={handleHide}
            customers={customers}
          />

        </Col>
      </Row>
      <Row className="">
          {/* <Col>
          <BookingTable bookings={bookings} />
        </Col> */}
      </Row>
    </section>
  );
};

export default BookingList;
