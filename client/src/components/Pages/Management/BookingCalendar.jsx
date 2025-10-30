import React, { useState, useEffect } from 'react';
import {

  FormGroup, Label, Input,

} from 'reactstrap';
import {
  Row, Col, Card, Modal, Button, Table, Badge,
  Form,
  Spinner,
  ButtonGroup
} from "react-bootstrap";
import '/src/assets/css/bookingcalendar.css';
import Auth from "/src/utils/auth";
import BookingForm from '../Booking/BookingForm';
import GenerateInvoiceModal from '../Booking/GenerateInvoiceModal';
import BookingActions from '../Booking/BookingActions';
import { FaEyeSlash, FaTrash } from "react-icons/fa";


const BookingCalendar = ({ bookings, fetchBookings, deleteBooking, onPend,
  completeBooking, cancelBooking, hideBooking, customers
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hoveredDay, setHoveredDay] = useState(null);   // NEW
  const [showAddModal, setShowAddModal] = useState(false); // NEW
  const [prefillDate, setPrefillDate] = useState(null);    // NEW
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [tempDate, setTempDate] = useState("");
  const [tempServiceType, setTempServiceType] = useState("");
  // const [tempDate, setTempDate] = useState(selectedBooking.date);
  const [tempIncome, setTempIncome] = useState(0);
  const [customerAcknowledged, setCustomerAcknowledged] = useState(false);

  useEffect(() => {
    if (selectedBooking?.date) {
      setTempDate(new Date(selectedBooking.date).toISOString().slice(0, 16));
      setTempServiceType(selectedBooking.serviceType);
      setTempIncome(selectedBooking.income);
    }
  }, [selectedBooking]);

  const handleSave = async () => {
    // await updateBookingDate();
    const updatedBooking = {
      ...selectedBooking,
      serviceType: tempServiceType,
      date: tempDate,
      income: tempIncome
    };
    try {
      const res = await fetch(`/api/bookings/${selectedBooking._id}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedBooking)
      });
      if (res.ok) {
        const data = await res.json();
        console.log('Booking updated:', data);
        fetchBookings();
      } else {
        console.error('Error updating booking:', res.statusText);
      }
    } catch (err) {
      console.error('Error updating booking:', err);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempDate(new Date(selectedBooking.date).toISOString().slice(0, 16));
    setIsEditing(false);
  };

  // Get current year and month
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Bootstrap contextual colors
  const statusColors = {
    pending: "warning",     // Yellow
    confirmed: "primary",   // Blue
    completed: "success",   // Green
    cancelled: "danger",     // Red
    invoiced: "info",       // Light Blue
    paid: "dark",           // Dark Grey
    "in progress": "secondary", // Grey
    done: "success"         // Green
  };

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get day of week for first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // Format date for display
  // const formatTime = (dateString) => {
  //   const date = new Date(dateString);
  //   return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  // };

  // Get month name
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Filter bookings for current month
  const currentMonthBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date);
    return bookingDate.getMonth() === currentMonth &&
      bookingDate.getFullYear() === currentYear;
  });

  // Group bookings by day
  const bookingsByDay = {};
  currentMonthBookings.forEach(booking => {
    const day = new Date(booking.date).getDate();
    if (!bookingsByDay[day]) {
      bookingsByDay[day] = [];
    }
    bookingsByDay[day].push(booking);
  });

  // Build calendar days
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
  const calendarDays = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    // calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    calendarDays.push({ empty: true });
  }

  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayBookings = bookingsByDay[day] || [];
    calendarDays.push({
      day,
      bookings: dayBookings,
      empty: false
    });
  }

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    const bookingId = selectedBooking._id;
    const payload = {
      scheduleConfirmation: selectedBooking.scheduleConfirmation,
      confirmationDate: selectedBooking.confirmationDate,
      reminderScheduled: selectedBooking.reminderScheduled,
      disableConfirmation: selectedBooking.disableConfirmation,
      customerSuggestedBookingAcknowledged: selectedBooking.customerSuggestedBookingAcknowledged,
      updatedBy: Auth.getProfile().data._id, // Assuming you have user authentication
      status: 'confirmed' // Set status to confirmed
    };
    // console.log('Submitting booking confirmation:', {
    //   bookingId,
    //   ...payload
    // });
    try {
      // console.log('url:', `/api/bookings/${bookingId}/confirm`);
      const res = await fetch(`/api/bookings/${bookingId}/confirm`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload) // Assuming you have user authentication

      });
      // console.log("Status:", res.status);
      // const text = await res.text();
      // console.log("Raw response:", text);
      if (!res.ok) throw new Error('Failed to confirm booking');
      // const data = await res.json();
      // fetchBookings();
      setSelectedBooking(null);
      setLoading(false);
      fetchBookings(); // Refresh bookings after confirmation
    } catch (err) {
      alert('Error confirming booking.');
    }

  }


  const handleChange = e => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setSelectedBooking(prev => ({
      ...prev,
      [e.target.name]: value
    }));
  };

  const handleDateChange = (newDateValue) => {
    setSelectedBooking((prev) => ({
      ...prev,
      date: new Date(newDateValue).toISOString()
    }));
  };

  const updateBookingDate = async () => {
    if (!selectedBooking?._id) return;

    if (selectedBooking.status === 'completed' || selectedBooking.status === 'cancelled') {
      alert("Cannot update date for completed or cancelled bookings.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`/api/bookings/${selectedBooking._id}/update-date`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: tempDate, updatedBy: Auth.getProfile().data._id, customerSuggestedBookingAcknowledged: selectedBooking.customerSuggestedBookingAcknowledged }) // Assuming you have user authentication
      });
      // const data = await res.json();
      //     console.log("Update response data:", data);
      if (res.ok) {
        alert("Service date updated successfully!");
        setSelectedBooking(null); // close modal or reset
        fetchBookings(); // Refresh bookings after update
      } else {
        const error = await res.json();
        alert(`Error: ${error.message || "Failed to update date"}`);
      }
    } catch (err) {
      console.error("Error updating date:", err);
      alert("Something went wrong while updating the date");
    } finally {
      setLoading(false);
    }
  };

  const formatForDatetimeLocal = (date) => {
    const d = new Date(date);
    const offset = d.getTimezoneOffset(); // minutes
    const localDate = new Date(d.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 16);
  };



 return (
  <div className="booking-calendar-container">
    <div className="calendar-header">
      <button onClick={prevMonth} className="nav-button" aria-label="Previous month">←</button>
      <h2 className="calendar-title">{monthNames[currentMonth]} {currentYear}</h2>
      <button onClick={nextMonth} className="nav-button" aria-label="Next month">→</button>
    </div>

    {/* Weekday Header (grid) */}
    <div className="weekday-header">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
        <div key={day} className="weekday-cell">
          {day}
        </div>
      ))}
    </div>

    {/* Calendar Grid (CSS Grid instead of Bootstrap Row/Col) */}
    <div className="calendar-grid" role="grid" aria-label="Booking calendar">
      {calendarDays.map((day, idx) => (
        <div
          key={idx}
          className={`calendar-cell ${day.empty ? "empty" : ""}`}
          onMouseEnter={() => !day.empty && setHoveredDay(day.day)}
          onMouseLeave={() => setHoveredDay(null)}
          role="gridcell"
          data-day={day.empty ? "" : day.day}
        >
          {!day.empty ? (
            <>
              <div className="cell-header">
                <div className="day-number" aria-hidden>{day.day}</div>

                {/* Add button - always present on touch, hover-only visually on desktop */}
                <button
                  className="add-btn"
                  title="Add booking"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPrefillDate(formatForDatetimeLocal(new Date(currentYear, currentMonth, day.day)));
                    setShowAddModal(true);
                  }}
                >
                  +
                </button>
              </div>

              <div className="bookings-list">
                {day.bookings && day.bookings.length > 0 ? (
                  day.bookings.map((booking, i) => (
                    <div
                      key={i}
                      className={`booking-card status-${booking.status}`}
                      onClick={() => setSelectedBooking(booking)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter') setSelectedBooking(booking); }}
                      aria-label={`${booking.serviceType} for ${booking.customerName}, status ${booking.status}`}
                    >
                      <div className="booking-line">
                        <div className="booking-customer">{booking.customerName}</div>
                        <div className="booking-status">{booking.status}</div>
                      </div>
                      <div className="booking-sub">{booking.serviceType}</div>
                    </div>
                  ))
                ) : (
                  <div className="no-bookings">—</div>
                )}
              </div>
            </>
          ) : (
            <div className="empty-cell" />
          )}
        </div>
      ))}
    </div>
    

    {/* === Modals (unchanged) === */}
    {/* Booking Details Modal */}
    <Modal
      show={!!selectedBooking}
      onHide={() => setSelectedBooking(null)}
      fullscreen={true}
    >
      {selectedBooking && (
        <>
          <Modal.Header closeButton>
            <Modal.Title>Booking Details</Modal.Title>
            <div className="d-flex gap-2">
              <FaEyeSlash
                className="text-secondary cursor-pointer"
                title="Hide Booking"
                onClick={() => {
                  hideBooking(selectedBooking._id, selectedBooking.status);
                  setSelectedBooking(null);
                  setLoading(false);
                }}
              />
              <FaTrash
                className="text-danger cursor-pointer"
                title="Delete Booking"
                onClick={() => {
                  deleteBooking(selectedBooking._id);
                  setSelectedBooking(null);
                  setLoading(false);
                }}
              />
            </div>
          </Modal.Header>
          <Modal.Body>
            <BookingActions
              selectedBooking={selectedBooking}
              setSelectedBooking={setSelectedBooking}
              setLoading={setLoading}
              onPend={onPend}
              cancelBooking={cancelBooking}
              completeBooking={completeBooking}
              hideBooking={hideBooking}
              deleteBooking={deleteBooking}
              setShowInvoiceModal={setShowInvoiceModal}
              handleSubmit={handleSubmit}
              handleChange={handleChange}
              loading={loading}
            />

            <Table bordered size="sm" className="booking-details-table">
              <tbody>
                {/* keep your same rows — unchanged */}
                <tr>
                  <th>Customer</th>
                  <td>{selectedBooking.customerName}</td>
                </tr>
                <tr>
                  <th>Email</th>
                  <td>{selectedBooking.customerEmail}</td>
                </tr>
                <tr>
                  <th>Service</th>
                  <td>
                    {isEditing ? (
                      <Form.Control
                        type="text"
                        value={tempServiceType}
                        className="text-cleanar-color form-input"
                        onChange={(e) => setTempServiceType(e.target.value)}
                        style={{ maxWidth: "250px" }}
                      />
                    ) : (
                      selectedBooking.serviceType
                    )}
                  </td>
                </tr>

                {/* Date/time, cost, status, etc. — copy the rest of your table rows exactly as they are */}
                {/* ... (leave rest unchanged) */}
              </tbody>
            </Table>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setSelectedBooking(null)}>
              Close
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>

    {/* Add Booking Modal (unchanged) */}
    <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add New Booking</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <BookingForm
          customers={customers}
          prefillDate={prefillDate}
          setShowAddModal={setShowAddModal}
          fetchBookings={fetchBookings}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowAddModal(false)}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>

    <GenerateInvoiceModal
      show={showInvoiceModal}
      onHide={() => { setShowInvoiceModal(false); fetchBookings(); }}
      booking={selectedBooking}
    />
  </div>
);

};

export default BookingCalendar;