import React, { useState, useEffect } from 'react';
import '/src/assets/css/bookingcalendar.css';

const BookingCalendar = ({ bookings }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Get current year and month
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

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
    calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }

  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayBookings = bookingsByDay[day] || [];

    calendarDays.push(
      <div key={day} className="calendar-day">
        <div className="day-header">{day}</div>
        <div className="day-bookings">
          {dayBookings.map((booking, index) => (
            <div
              key={index}
              className="booking-item"
              onClick={() => setSelectedBooking(booking)}
            >
              <div className="booking-time">{formatTime(booking.date)}</div>
              <div className="booking-name">{booking.customerName}</div>
              <div className="booking-service">{booking.serviceType}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="booking-calendar-container">
      <div className="calendar-header">
        <button onClick={prevMonth} className="nav-button">←</button>
        <h2>{monthNames[currentMonth]} {currentYear}</h2>
        <button onClick={nextMonth} className="nav-button">→</button>
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
          {/* <div className="booking-detail" onClick={() => setSelectedBooking(null)}><span>Close</span></div> */}
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;