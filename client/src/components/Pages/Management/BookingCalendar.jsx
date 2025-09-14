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

const BookingCalendar = ({ bookings, fetchBookings, deleteBooking, onPend,
  completeBooking, cancelBooking, hideBooking, customers
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hoveredDay, setHoveredDay] = useState(null);   // NEW
  const [showAddModal, setShowAddModal] = useState(false); // NEW
  const [prefillDate, setPrefillDate] = useState(null);    // NEW

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
        <button onClick={prevMonth} className="nav-button">←</button>
        <h2>{monthNames[currentMonth]} {currentYear}</h2>
        <button onClick={nextMonth} className="nav-button">→</button>
      </div>
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
            // xs={12 / 7} // 7 columns
            className="border p-2 bg-white position-relative"
            style={{
              minHeight: "100px",
              flex: "1 0 14.2857%"
            }}
            onMouseEnter={() => !day.empty && setHoveredDay(day.day)}
            onMouseLeave={() => setHoveredDay(null)}
          >
            {!day.empty && (
              <>
                <div className="d-flex justify-content-between align-items-start">


                  <div className="fw-bold">{day.day}</div>
                  {/* Show Add Booking button only on hover */}
                  {hoveredDay === day.day && (
                    <Button
                      size="sm"
                      variant="outline-success"
                      className="rounded-pill ms-1 py-0 px-2"
                      onClick={() => {
                        setPrefillDate(formatForDatetimeLocal(new Date(currentYear, currentMonth, day.day)));
                        setShowAddModal(true);
                      }}
                    >
                      + Add
                    </Button>
                  )}
                </div>
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

                  <tr>
                    <th>Date/Time</th>
                    <td>
                      {isEditing ? (
                        <>
                          <Row className="align-items-center g-2">
                            <Col xs={12} sm="auto">
                              <Form.Control
                                type="datetime-local"
                                value={tempDate}
                                className="text-cleanar-color form-input"
                                onChange={(e) => setTempDate(e.target.value)}
                                style={{ maxWidth: "250px" }}
                              />
                            </Col>
                            <Col xs={12} sm="auto">
                              <FormGroup check>
                                <Label check>
                                  <Input
                                    type="checkbox"
                                    name="customerSuggestedBookingAcknowledged"
                                    checked={customerAcknowledged}
                                    onChange={e => setCustomerAcknowledged(e.target.checked)}
                                  />
                                  <span className="form-check-sign"></span>{' '}
                                  Acknowledge Changes to Date/Service
                                </Label>
                              </FormGroup>
                            </Col>
                          </Row>
                        </>
                      ) : (
                        <div className="d-flex align-items-center gap-2">
                          {new Date(selectedBooking.date).toLocaleString()}
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            className="rounded-pill"
                          >
                            Edit
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>

                  <tr>
                    <th>Income</th>
                    <td>
                      {isEditing ? (
                        <Form.Control
                          type="number"
                          step="1"
                          min="0"
                          value={tempIncome}
                          className="text-cleanar-color form-input"
                          onChange={(e) => setTempIncome(e.target.value)}
                          style={{ maxWidth: "150px" }}
                        />
                      ) : (
                        `$${selectedBooking.income} CAD`
                      )}
                    </td>
                  </tr>

                  {isEditing && (
                    <tr>
                      <td colSpan={2}>
                        <Row className="align-items-center">
                          <Col xs={6} sm="auto">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={handleSave}
                              className="rounded-pill"
                            >
                              Save
                            </Button>
                          </Col>
                          <Col xs={6} sm="auto">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={handleCancel}
                              className="rounded-pill"
                            >
                              Cancel
                            </Button>
                          </Col>
                        </Row>
                      </td>
                    </tr>
                  )}

                  {/* <tr>
                    <th>Service</th>
                    <td>{selectedBooking.serviceType}</td>
                  </tr>
                  <tr>
                    <th>Date/Time</th>
                    <td>
                      {isEditing ? (
                        <>
                        <Row className="align-items-center g-2">
                          <Col xs={12} sm="auto">
                          <Form.Control
                            type="datetime-local"
                            value={tempDate}
                            className="text-cleanar-color form-input"
                            onChange={(e) => setTempDate(e.target.value)}
                            style={{ maxWidth: "250px" }}
                          />
                          </Col>
                          <Col xs={12} sm="auto">
                              {/* add a checkbox */}
                  {/* <FormGroup check>
                            <Label check>
                              <Input
                                type="checkbox"
                                name="customerSuggestedBookingAcknowledged"
                                checked={selectedBooking.customerSuggestedBookingAcknowledged}
                                onChange={handleChange}
                              />
                              <span className="form-check-sign"></span>
                              {' '}
                              Acknowledge Suggested Date
                            </Label>
                          </FormGroup>
                          </Col>
                          </Row>
                          <Row className="align-items-center">
                          <Col xs={6} sm="auto">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={handleSave}
                            className="rounded-pill"
                          >
                            Save
                          </Button>
                          </Col>
                          <Col xs={6} sm="auto">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleCancel}
                            className="rounded-pill"
                          >
                            Cancel
                          </Button>
                          </Col>
                        </Row>
                        </>
                      ) : (
                        <div className="d-flex align-items-center gap-2">
                          {new Date(selectedBooking.date).toLocaleString()}
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            className="rounded-pill"
                          >
                            Edit
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>Income</th>
                    <td>${selectedBooking.income} CAD</td>
                  </tr> */}
                  {/* <tr>
                    <th>Confirmation Email</th>
                    <td>
                      {selectedBooking.scheduleConfirmation
                        ? `Scheduled for ${new Date(
                          selectedBooking.confirmationDate
                        ).toLocaleString()}`
                        : "Not scheduled"}
                    </td>
                  </tr> */}
                  <tr>
                    <th>24hr Reminder</th>
                    <td>{selectedBooking.reminderScheduled ? "Yes" : "No"}</td>
                  </tr>
                  <tr>
                    <th>Status</th>
                    <td>
                      <Badge bg={statusColors[selectedBooking.status] || "secondary"}>
                        {selectedBooking.status}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <th>New Date Requested</th>
                    <td>
                      {selectedBooking.customerSuggestedBookingDate ? new Date(selectedBooking.customerSuggestedBookingDate).toLocaleDateString() : "N/A"}
                      {selectedBooking.customerSuggestedBookingComment && (<p>{selectedBooking.customerSuggestedBookingComment}</p>)}

                    </td>
                  </tr>
                  <tr>
                    <th>Confirm Booking</th>
                    <td>
                      {selectedBooking.status === 'confirmed' ? (
                        <p className="text-success">Booking information:
                          <br />
                          Confirmation Email Disabled? {selectedBooking.disableConfirmation ? 'Yes' : 'No'}
                          <br />
                          Scheduled Confirmation? {selectedBooking.scheduleConfirmation ? 'Yes' : 'No'}
                          <br />
                          Confirmation Date: {selectedBooking.confirmationDate ? new Date(selectedBooking.confirmationDate).toLocaleString() : 'N/A'}
                          <br />
                          Confirmation Email Sent Date: {selectedBooking.scheduledConfirmationDate ? new Date(selectedBooking.scheduledConfirmationDate).toLocaleString() : 'N/A'}
                          <br />
                          24-hour Reminder Scheduled? {selectedBooking.reminderScheduled ? 'Yes' : 'No'}
                          <br />
                          24-hour Reminder Sent Date: {selectedBooking.scheduledReminderDate ? new Date(selectedBooking.scheduledReminderDate).toLocaleString() : 'N/A'}
                        </p>
                      ) : selectedBooking.status === 'pending' ? (
                        <>
                          <p className="text-muted mb-2 d-block">
                            A confirmation email will be sent upon saving unless you override it below.
                          </p>
                          <Form onSubmit={handleSubmit}>
                            <FormGroup check className="mb-3">
                              <Label check>
                                <Input
                                  type="checkbox"
                                  name="scheduleConfirmation"
                                  checked={selectedBooking.scheduleConfirmation}
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
                                value={selectedBooking.confirmationDate}
                                onChange={handleChange}
                                disabled={!selectedBooking.scheduleConfirmation}
                              />
                            </FormGroup>
                            <FormGroup check className="mb-3">
                              <Label check>
                                <Input
                                  type="checkbox"
                                  name="disableConfirmation"
                                  checked={selectedBooking.disableConfirmation}
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
                                  checked={selectedBooking.reminderScheduled}
                                  onChange={handleChange}
                                />
                                {' '}
                                <span className="form-check-sign"></span>
                                Send 24-hour reminder email
                              </Label>
                            </FormGroup>
                            <Button type="submit" color="primary" disabled={loading}>
                              {loading ? <Spinner size="sm" /> : 'Confirm Booking'}
                            </Button>
                          </Form>
                        </>
                      ) : (
                        <p className="text-danger">Booking is not active anymore.</p>
                      )}

                    </td>
                  </tr>
                  <tr>
                    <th>Actions</th>
                    <td>
                      <ButtonGroup className="d-flex justify-content-center gap-2 mt-3">
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => {
                            onPend(selectedBooking._id, selectedBooking.status);
                            setSelectedBooking(null);
                            setLoading(false);
                          }}
                        >
                          Pend
                        </Button>

                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            cancelBooking(selectedBooking._id, selectedBooking.status);
                            setSelectedBooking(null);
                            setLoading(false);
                          }}
                        >
                          Cancel
                        </Button>

                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => {
                            completeBooking(selectedBooking._id, selectedBooking.status);
                            setSelectedBooking(null);
                            setLoading(false);
                          }}
                        >
                          Complete
                        </Button>

                        <Button
                          variant="info"
                          size="sm"
                          onClick={() => {
                            hideBooking(selectedBooking._id, selectedBooking.status);
                            setSelectedBooking(null);
                            setLoading(false);
                          }}
                        >
                          Hide
                        </Button>

                        <Button
                          variant="danger"
                          onClick={() => {
                            deleteBooking(selectedBooking._id);
                            setSelectedBooking(null);
                            setLoading(false);
                          }}
                        >
                          Delete
                        </Button>
                      </ButtonGroup>
                    </td>
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

      {/* New Add Booking Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Here you’ll embed BookingList form later */}
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
          {/* <Button variant="primary">Save Booking</Button> */}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BookingCalendar;