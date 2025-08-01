import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Modal, Button, Table, Badge } from "react-bootstrap";
import '/src/assets/css/bookingcalendar.css';

const BookingCalendar = ({ bookings }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Get current year and month
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Bootstrap contextual colors
const statusColors = {
  pending: "warning",     // Yellow
  confirmed: "primary",   // Blue
  completed: "success",   // Green
  cancelled: "danger"     // Red
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
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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

  return (
    <div className="booking-calendar-container">
      <div className="calendar-header">
        <button onClick={prevMonth} className="nav-button">←</button>
        <h2>{monthNames[currentMonth]} {currentYear}</h2>
        <button onClick={nextMonth} className="nav-button">→</button>
      </div>
      {/* <div className="calendar-header">
        <button onClick={prevMonth} className="nav-button">&larr;</button>
        <h2 className="month-title mb-0">{monthNames[currentMonth]} {currentYear}</h2>
        <button onClick={nextMonth} className="nav-button">&rarr;</button>
      </div>
      <div className="weekday-header">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      <div className="calendar-grid">
        {calendarDays}
      </div>

      {selectedBooking && (
        <div className="booking-details-modal">
          <div className="modal-content">
            <button
              className="close-button"
              onClick={() => setSelectedBooking(null)}
            >
              ×
            </button>
            <h3 className="modal-title pl-1">Booking Details</h3>
            <div className="booking-detail">
              <strong>Customer:</strong> {selectedBooking.customerName}
            </div>
            <div className="booking-detail">
              <strong>Email:</strong> {selectedBooking.customerEmail}
            </div>
            <div className="booking-detail">
              <strong>Service:</strong> {selectedBooking.serviceType}
            </div>
            <div className="booking-detail">
              <strong>Date/Time:</strong> {new Date(selectedBooking.date).toLocaleString()}
            </div>
            <div className="booking-detail">
              <strong>Income:</strong> ${selectedBooking.income} CAD
            </div>
            <div className="booking-detail">
              <strong>Confirmation Email:</strong> {selectedBooking.scheduleConfirmation ? 'Scheduled' : 'Not scheduled'}
              {selectedBooking.scheduleConfirmation && selectedBooking.confirmationDate &&
                ` for ${new Date(selectedBooking.confirmationDate).toLocaleString()}`}
            </div>
            <div className="booking-detail">
              <strong>24hr Reminder:</strong> {selectedBooking.reminderScheduled ? 'Yes' : 'No'}
            </div>
          </div>          
        </div>
      )} */}
      <Row className="weekday-header text-center fw-bold bg-primary text-white mb-2 rounded">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <Col key={day} className="py-2 border-end border-light">
            {day}
          </Col>
        ))}
      </Row>

      {/* Calendar Grid */}
      <Row className="calendar-grid g-0">
        {calendarDays.map((day, idx) => (
          <Col
            key={idx}
            xs={12 / 7} // 7 columns
            className="border p-2 bg-white"
            style={{ minHeight: "100px" }}
          >
            {!day.empty && (
              <>
                <div className="fw-bold">{day.day}</div>
                {day.bookings.map((booking, i) => (
                  <Card
                    key={i}
                    className="mt-1 shadow-sm border-0"
                    bg={statusColors[booking.status] || "secondary"}
                    text="white"
                    onClick={() => setSelectedBooking(booking)}
                    style={{ cursor: "pointer", fontSize: "0.8rem" }}
                  >
                    <Card.Body className="p-1">
                      {booking.customerName}{" - "}{booking.serviceType}{" "}
                      <Badge bg="light" text="dark">
                        {booking.status}
                      </Badge>
                    </Card.Body>
                  </Card>
                ))}
              </>
            )}

          </Col>
        ))}
      </Row>

      {/* Booking Details Modal */}
      <Modal
        show={!!selectedBooking}
        onHide={() => setSelectedBooking(null)}
        centered
      >
        {selectedBooking && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Booking Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Table bordered size="sm">
                <tbody>
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
                    <td>{selectedBooking.serviceType}</td>
                  </tr>
                  <tr>
                    <th>Date/Time</th>
                    <td>{new Date(selectedBooking.date).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <th>Income</th>
                    <td>${selectedBooking.income} CAD</td>
                  </tr>
                  <tr>
                    <th>Confirmation Email</th>
                    <td>
                      {selectedBooking.scheduleConfirmation
                        ? `Scheduled for ${new Date(
                          selectedBooking.confirmationDate
                        ).toLocaleString()}`
                        : "Not scheduled"}
                    </td>
                  </tr>
                  <tr>
                    <th>24hr Reminder</th>
                    <td>{selectedBooking.reminderScheduled ? "Yes" : "No"}</td>
                  </tr>
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
    </div>
  );
};

export default BookingCalendar;