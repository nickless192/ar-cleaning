import React, { useState, useEffect } from "react";
import { FormGroup, Label, Input } from "reactstrap";
import {
  Row,
  Col,
  Card,
  Modal,
  Button,
  Table,
  Badge,
  Form,
  Spinner,
  ButtonGroup,
} from "react-bootstrap";
import "/src/assets/css/bookingcalendar.css";
import Auth from "/src/utils/auth";
import BookingForm from "../Booking/BookingForm";
import GenerateInvoiceModal from "../Booking/GenerateInvoiceModal";
import BookingActions from "../Booking/BookingActions";
import { FaEyeSlash, FaTrash } from "react-icons/fa";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { DateTime } from "luxon";

const DRAFT_KEY = "booking.draft";

const toDatetimeLocalToronto = (isoOrDate) =>
  DateTime.fromISO(new Date(isoOrDate).toISOString(), { zone: "utc" })
    .setZone("America/Toronto")
    .toFormat("yyyy-LL-dd'T'HH:mm");

const torontoToUtcISO = (dtLocalStr) =>
  DateTime.fromFormat(dtLocalStr, "yyyy-LL-dd'T'HH:mm", { zone: "America/Toronto" })
    .toUTC()
    .toISO();


const BookingCalendar = ({
  bookings,
  fetchBookings,
  // deleteBooking,
  // onPend,
  // completeBooking,
  // cancelBooking,
  // hideBooking,
  customers,
  setCustomers,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [prefillDate, setPrefillDate] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceInfo, setInvoiceInfo] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceErr, setInvoiceErr] = useState("");


  const [isEditing, setIsEditing] = useState(false);
  const [isEditingServices, setIsEditingServices] = useState(false);
  const [editableServices, setEditableServices] = useState([]);

  const [tempDate, setTempDate] = useState("");
  // const [tempServiceType, setTempServiceType] = useState("");
  // const [tempIncome, setTempIncome] = useState(0);
  const [customerAcknowledged, setCustomerAcknowledged] = useState(false);

  // ---- Manual Admin Digest Trigger ----
  const [digestDays, setDigestDays] = useState(7);
  const [digestSending, setDigestSending] = useState(false);
  const [digestMsg, setDigestMsg] = useState("");
  const [digestErr, setDigestErr] = useState("");

  const isAdmin = !!Auth.getProfile()?.data?.adminFlag;

  const sendUpcomingDigest = async () => {
    try {
      setDigestSending(true);
      setDigestMsg("");
      setDigestErr("");

      // const res = await fetch("/api/email/admin-upcoming-bookings-digest", {
      const res = await fetch("/api/email/upcoming-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: Number(digestDays) || 7 }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to send digest");

      setDigestMsg(data.message || "Digest sent!");
    } catch (e) {
      setDigestErr(e.message || "Something went wrong.");
    } finally {
      setDigestSending(false);
    }
  };
  useEffect(() => {
    const incomingBookingId =
      location.state?.highlightBookingId ||
      location.state?.bookingId;

    if (!incomingBookingId) return;

    // Try find it from the bookings you already have
    const found = bookings.find((b) => String(b._id) === String(incomingBookingId));

    const openBooking = async () => {
      try {
        let bookingToOpen = found;

        // If not in current list (e.g. different month / filtered),
        // fetch directly by id so we can still open the modal.
        if (!bookingToOpen) {
          const res = await fetch(`/api/bookings/${incomingBookingId}`);
          if (res.ok) bookingToOpen = await res.json();
        }

        if (!bookingToOpen) return;

        // Jump calendar to that booking’s month so user sees context
        if (bookingToOpen.date) {
          setCurrentDate(new Date(bookingToOpen.date));
        }

        // Open the booking details modal
        setSelectedBooking(bookingToOpen);

        // Clear navigation state so refresh/back doesn’t keep reopening
        navigate(location.pathname, { replace: true, state: {} });
      } catch (e) {
        console.error("Failed to reopen booking from invoice:", e);
        // Still clear state to avoid loops
        navigate(location.pathname, { replace: true, state: {} });
      }
    };

    openBooking();
    // Important: include bookings so when they load async, this can find the booking
  }, [location.state, bookings, navigate, location.pathname]);


  useEffect(() => {
    if (selectedBooking?.date) {
      // setTempDate(new Date(selectedBooking.date).toISOString().slice(0, 16));
      // setTempDate(formatForDatetimeLocal(selectedBooking.date));
      setTempDate(toDatetimeLocalToronto(selectedBooking.date));
      // setTempServiceType(selectedBooking.serviceType);
      // setTempIncome(selectedBooking.income);
      setCustomerAcknowledged(
        !!selectedBooking.customerSuggestedBookingAcknowledged
      );
    }
    if (selectedBooking) {
      // If booking already has services[], hydrate from it
      if (selectedBooking.services && selectedBooking.services.length > 0) {
        setEditableServices(
          selectedBooking.services.map((s) => ({
            serviceType: s.serviceType || "",
            description: s.description || "",
            billingType: s.billingType || "quantity",
            hours: s.hours || 0,
            quantity: s.quantity || 1,
            price: s.price || 0,
            amount: s.amount || 0,
          }))
        );
      } else {
        // Fallback: synthesize one line from legacy serviceType + income
        setEditableServices([
          {
            serviceType: selectedBooking.serviceType || "",
            description: selectedBooking.serviceType || "",
            billingType: "quantity",
            hours: 0,
            quantity: 1,
            price: selectedBooking.income || 0,
            amount: selectedBooking.income || 0,
          },
        ]);
      }
      setIsEditingServices(false);
    } else {
      setEditableServices([]);
      setIsEditingServices(false);
    }
  }, [selectedBooking]);

  useEffect(() => {
    const loadInvoice = async () => {
      setInvoiceInfo(null);
      setInvoiceErr("");

      if (!selectedBooking?._id) return;

      // Quick heuristic: only fetch if booking looks invoiced,
      // OR fetch always (safe) if you prefer.
      const looksInvoiced =
        selectedBooking.invoiced ||
        !!selectedBooking.invoiceCreatedAt ||
        !!selectedBooking.invoiceSentAt;

      // If you want to always fetch (recommended for accuracy), remove this if:
      // if (!looksInvoiced) return;

      if (!looksInvoiced) return;

      setInvoiceLoading(true);
      try {
        // ✅ Endpoint you should add (or already have):
        // GET /api/invoices/by-booking/:bookingId
        const res = await fetch(`/api/invoices/by-booking/${selectedBooking._id}`);
        if (!res.ok) {
          setInvoiceInfo(null);
          return;
        }
        const data = await res.json();
        setInvoiceInfo(data);
      } catch (e) {
        setInvoiceErr("Could not load invoice info.");
        setInvoiceInfo(null);
      } finally {
        setInvoiceLoading(false);
      }
    };

    loadInvoice();
  }, [selectedBooking?._id]);


  // useEffect(() => {
  //   console.log("BookingForm location.state:", location.state);
  //   const shouldReopen = location.state?.reopenBookingModal;
  //   const prefillDate = location.state?.prefillDate;

  //   if (shouldReopen) {
  //     // ✅ restore draft
  //     console.log("Restoring booking draft from sessionStorage...");
  //     // const raw = sessionStorage.getItem(DRAFT_KEY);
  //     // if (raw) {
  //     //   try {
  //     //     const draft = JSON.parse(raw);
  //     //     if (draft?.formData) setFormData(draft.formData);
  //     //     if (draft?.selectedCustomerId) setSelectedCustomerId(draft.selectedCustomerId);
  //     //   } catch { }
  //     // }

  //     // // ✅ apply newly created customer (if present)
  //     // const newCustomer = location.state?.newCustomer;
  //     // if (newCustomer?._id) {
  //     //   setSelectedCustomerId(newCustomer._id);
  //     //   applySelectedCustomerToForm(newCustomer);
  //     // }
  //     // console.log("Reopening booking modal with new customer:", newCustomer);

  //     // ✅ reopen booking modal
  //     // setIsBookingModalOpen(true);
  //     if (prefillDate) setPrefillDate(prefillDate);
  //     setShowAddModal(true);


  //     // ✅ clear state so it doesn't reopen forever
  //     navigate(location.pathname, { replace: true, state: {} });
  //   }
  // }, [location.state, navigate, location.pathname]);

  // const handleSave = async () => {
  //   const updatedBooking = {
  //     ...selectedBooking,
  //     serviceType: tempServiceType,
  //     date: tempDate,
  //     income: tempIncome,
  //     customerSuggestedBookingAcknowledged: customerAcknowledged,
  //   };

  //   try {
  //     const res = await fetch(
  //       `/api/bookings/${selectedBooking._id}/update`,
  //       {
  //         method: "PUT",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(updatedBooking),
  //       }
  //     );
  //     if (res.ok) {
  //       await res.json();
  //       fetchBookings();
  //     } else {
  //       console.error("Error updating booking:", res.statusText);
  //     }
  //   } catch (err) {
  //     console.error("Error updating booking:", err);
  //   }
  //   setIsEditing(false);
  // };

  const handleServiceCellChange = (index, field, rawValue) => {
    setEditableServices((prev) => {
      const updated = [...prev];
      const svc = { ...updated[index] };

      let value = rawValue;
      if (field === "hours" || field === "quantity" || field === "price") {
        value = Number(rawValue) || 0;
      }

      svc[field] = value;

      const billingType = field === "billingType"
        ? (rawValue === "hours" ? "hours" : "quantity")
        : (svc.billingType === "hours" ? "hours" : "quantity");

      svc.billingType = billingType;

      const hours = Number(svc.hours) || 0;
      const quantity = Number(svc.quantity) || 0;
      const price = Number(svc.price) || 0;

      if (
        field === "hours" ||
        field === "quantity" ||
        field === "price" ||
        field === "billingType"
      ) {
        svc.amount =
          billingType === "hours" ? hours * price : quantity * price;
      }

      updated[index] = svc;
      return updated;
    });
  };

  const addServiceRowInModal = () => {
    setEditableServices((prev) => [
      ...prev,
      {
        serviceType: "",
        description: "",
        billingType: "quantity",
        hours: 0,
        quantity: 1,
        price: 0,
        amount: 0,
      },
    ]);
  };

  const removeServiceRowInModal = (index) => {
    setEditableServices((prev) => prev.filter((_, i) => i !== index));
  };

  const saveServices = async () => {
    if (!selectedBooking?._id) return;

    // Normalize & recompute amounts on the client (backend should still re-check)
    const normalized = editableServices.map((s) => {
      const billingType = s.billingType === "hours" ? "hours" : "quantity";
      const hours = Number(s.hours) || 0;
      const quantity = Number(s.quantity) || 0;
      const price = Number(s.price) || 0;
      const amount =
        billingType === "hours" ? hours * price : quantity * price;

      return {
        serviceType: s.serviceType || "",
        description: s.description || "",
        billingType,
        hours,
        quantity,
        price,
        amount,
      };
    });

    const incomeFromServices = normalized.reduce(
      (sum, s) => sum + (s.amount || 0),
      0
    );

    try {
      setLoading(true);
      const res = await fetch(
        `/api/bookings/${selectedBooking._id}/update`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            services: normalized,
            income: incomeFromServices,
            serviceType:
              normalized[0]?.serviceType ||
              selectedBooking.serviceType ||
              "Service(s)",
            updatedBy: Auth.getProfile().data._id,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to update services");
      const updated = await res.json();

      // reflect changes locally and refresh list
      setSelectedBooking(updated);
      setEditableServices(updated.services || normalized);
      setIsEditingServices(false);
      fetchBookings();
    } catch (err) {
      console.error("Error updating services:", err);
      alert("Error updating services.");
    } finally {
      setLoading(false);
    }
  };
  const servicesTotal = editableServices.reduce(
    (sum, s) => sum + (s.amount || 0),
    0
  );


  const handleCancelEdit = () => {
    if (selectedBooking?.date) {
      // setTempDate(new Date(selectedBooking.date).toISOString().slice(0, 16));
      setTempDate(toDatetimeLocalToronto(selectedBooking.date));
    }
    // setTempServiceType(selectedBooking?.serviceType || "");
    // setTempIncome(selectedBooking?.income || 0);
    setCustomerAcknowledged(
      !!selectedBooking?.customerSuggestedBookingAcknowledged
    );
    setIsEditing(false);
  };

  // Get current year and month
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Bootstrap contextual colors
  const statusColors = {
    pending: "warning",
    confirmed: "primary",
    completed: "success",
    cancelled: "danger",
    invoiced: "info",
    paid: "dark",
    "in progress": "secondary",
    done: "success",
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();

  const getFirstDayOfMonth = (year, month) =>
    new Date(year, month, 1).getDay();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Filter bookings for current month
  const currentMonthBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.date);
    const bookingToronto = DateTime.fromISO(booking.date, { zone: "utc" }).setZone("America/Toronto");
    return (
      bookingToronto.month === currentMonth + 1 &&
      bookingToronto.year === currentYear
    );
  });

  // Group bookings by day
  const bookingsByDay = {};
  currentMonthBookings.forEach((booking) => {
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

  // empty cells before first day
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push({ empty: true });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayBookings = bookingsByDay[day] || [];
    calendarDays.push({
      day,
      bookings: dayBookings,
      empty: false,
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setLoading(true);

    const bookingId = selectedBooking._id;
    const payload = {
      scheduleConfirmation: selectedBooking.scheduleConfirmation,
      confirmationDate: selectedBooking.confirmationDate,
      reminderScheduled: selectedBooking.reminderScheduled,
      disableConfirmation: selectedBooking.disableConfirmation,
      customerSuggestedBookingAcknowledged:
        selectedBooking.customerSuggestedBookingAcknowledged,
      updatedBy: Auth.getProfile().data._id,
      status: "confirmed",
    };

    try {
      const res = await fetch(`/api/bookings/${bookingId}/confirm`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to confirm booking");
      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      alert("Error confirming booking.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setSelectedBooking((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  const updateBookingDate = async () => {
    if (!selectedBooking?._id) return;

    if (
      selectedBooking.status === "completed" ||
      selectedBooking.status === "cancelled"
    ) {
      alert("Cannot update date for completed or cancelled bookings.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `/api/bookings/${selectedBooking._id}/update-date`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // date: tempDate,
            date: torontoToUtcISO(tempDate),
            updatedBy: Auth.getProfile().data._id,
            customerSuggestedBookingAcknowledged: customerAcknowledged,
          }),
        }
      );

      if (res.ok) {
        alert("Service date updated successfully!");
        setSelectedBooking(null);
        fetchBookings();
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
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 16);
  };

  // const fetchBookings = async () => {
  //   try {
  //     const res = await fetch('/api/bookings');
  //     if (!res.ok) throw new Error('Failed to fetch bookings');
  //     const data = await res.json();
  //     // filter out data that is hidden
  //     const visibleData = data.filter(b => !b.hidden);
  //     setBookings(visibleData);
  //   } catch (err) {
  //     console.error('Failed to fetch bookings:', err);
  //   }
  // };

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

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  // const today = new Date();
  const todayToronto = DateTime.now().setZone("America/Toronto").toJSDate();


  return (
    <div className="booking-calendar-container">
      {/* Header */}
      {/* <div className="calendar-header">
        <button
          onClick={prevMonth}
          className="nav-button"
          aria-label="Previous month"
        >
          ←
        </button>
        <h2 className="calendar-title">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        <button
          onClick={nextMonth}
          className="nav-button"
          aria-label="Next month"
        >
          →
        </button>
      </div> */}
      <div className="calendar-header">
        <button
          onClick={prevMonth}
          className="nav-button"
          aria-label="Previous month"
        >
          ←
        </button>

        <div className="d-flex align-items-center gap-3">
          <h2 className="calendar-title mb-0">
            {monthNames[currentMonth]} {currentYear}
          </h2>

          {isAdmin && (
            <div className="d-flex align-items-center gap-2">
              <Form.Control
                type="number"
                min={1}
                className="form-input text-cleanar-color"
                max={31}
                value={digestDays}
                onChange={(e) => setDigestDays(e.target.value)}
                style={{ width: 90 }}
                size="sm"
                title="Days ahead"
              />

              <Button
                variant="outline-primary"
                size="sm"
                onClick={sendUpcomingDigest}
                disabled={digestSending}
              >
                {digestSending ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Sending...
                  </>
                ) : (
                  "Send Digest"
                )}
              </Button>
            </div>
          )}
        </div>

        <button
          onClick={nextMonth}
          className="nav-button"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      {isAdmin && (digestMsg || digestErr) && (
        <div className="mt-2">
          {digestMsg ? (
            <div className="alert alert-success py-2 mb-2">{digestMsg}</div>
          ) : null}
          {digestErr ? (
            <div className="alert alert-danger py-2 mb-0">{digestErr}</div>
          ) : null}
        </div>
      )}


      {/* Weekday Header */}
      <div className="weekday-header">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="weekday-cell">
            {day}
          </div>
        ))}
      </div>

      {/* Scroll wrapper so we keep a proper month grid even on small screens */}
      <div className="calendar-scroll">
        <div
          className="calendar-grid"
          role="grid"
          aria-label="Booking calendar"
        >
          {calendarDays.map((day, idx) => {
            // <div
            //   key={idx}
            //   className={`calendar-cell ${day.empty ? "empty" : ""}`}
            //   role="gridcell"
            //   data-day={day.empty ? "" : day.day}
            // >
            const cellDate = !day.empty
  ? new Date(currentYear, currentMonth, day.day)
  : null;
return (
<div
  key={idx}
  className={[
    "calendar-cell",
    day.empty ? "empty" : "",
    !day.empty && isSameDay(cellDate, todayToronto) ? "today" : "",
  ].join(" ")}
  role="gridcell"
  data-day={day.empty ? "" : day.day}
>

              {!day.empty ? (
                <>
                  <div className="cell-header">
                    <div className="day-number" aria-hidden>
                      {day.day}
                    </div>

                    {/* Add booking */}
                    <button
                      className="add-btn"
                      title="Add booking"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPrefillDate(
                          formatForDatetimeLocal(
                            new Date(currentYear, currentMonth, day.day)
                          )
                        );
                        setShowAddModal(true);
                      }}
                    >
                      +
                    </button>
                  </div>

                  <div className="bookings-list">
                    {day.bookings && day.bookings.length > 0 ? (
                      // day.bookings.map((booking, i) => (
                      //   <div
                      //     key={i}
                      //     className={`booking-card status-${booking.status}`}
                      //     onClick={() => setSelectedBooking(booking)}
                      //     role="button"
                      //     tabIndex={0}
                      //     onKeyDown={(e) => {
                      //       if (e.key === "Enter") setSelectedBooking(booking);
                      //     }}
                      //     aria-label={`${booking.serviceType} for ${booking.customerName}, status ${booking.status}`}
                      //   >
                      //     <div className="booking-line">
                      //       <div className="booking-customer">
                      //         {booking.customerName}
                      //       </div>
                      //       <div className="booking-status">
                      //         {booking.status}
                      //       </div>
                      //     </div>
                      //     <div className="booking-sub">
                      //       {booking.serviceType}
                      //     </div>
                      //   </div>
                      // ))
                      day.bookings.map((booking, i) => {
                        const isInvoiced =
                          booking.invoiced || booking.invoiceCreatedAt || booking.invoiceSentAt;

                        const uiStatus = isInvoiced ? "invoiced" : booking.status;

                        return (
                          <div
                            key={i}
                            className={`booking-card status-${uiStatus}`}
                            onClick={() => setSelectedBooking(booking)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") setSelectedBooking(booking);
                            }}
                            aria-label={`${booking.serviceType} for ${booking.customerName}, status ${uiStatus}`}
                          >
                            <div className="booking-line">
                              <div className="booking-customer">{booking.customerName}</div>
                              <div className="booking-status">{uiStatus}</div>
                            </div>
                            <div className="booking-sub">{booking.serviceType} @ {' '}
                              {DateTime.fromISO(booking.date, { zone: "utc" })
                                .setZone("America/Toronto")
                                .toFormat("hh:mm a")}
                                </div>
                          </div>
                        );
                      })

                    ) : (
                      <div className="no-bookings">—</div>
                    )}
                  </div>
                </>
              ) : (
                <div className="empty-cell" />
              )}
            </div>
)})}
        </div>
      </div>

      {/* Booking Details Modal */}
      <Modal
        show={!!selectedBooking}
        onHide={() => setSelectedBooking(null)}
        // fullscreen={true}
        size="lg"
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
                    handleHide(selectedBooking._id, selectedBooking.status);
                    setSelectedBooking(null);
                    setLoading(false);
                  }}
                />
                <FaTrash
                  className="text-danger cursor-pointer"
                  title="Delete Booking"
                  onClick={() => {
                    handleDelete(selectedBooking._id);
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
                onPend={handlePend}
                cancelBooking={handleCancel}
                completeBooking={handleComplete}
                hideBooking={handleHide}
                deleteBooking={handleDelete}
                setShowInvoiceModal={setShowInvoiceModal}
                handleSubmit={handleSubmit}
                handleChange={handleChange}
                loading={loading}
              />

              <Table bordered size="sm" className="booking-details-table">
                <tbody>
                  <tr>
                    <th>Customer</th>
                    <td>{selectedBooking.customerName}</td>
                  </tr>
                  <tr>
                    <th>Email</th>
                    <td>{selectedBooking.customerEmail}</td>
                  </tr>
                  {/* <tr>
                    <th>Service</th>
                    <td>
                      {isEditing ? (
                        <Form.Control
                          type="text"
                          value={tempServiceType}
                          className="text-cleanar-color form-input"
                          onChange={(e) =>
                            setTempServiceType(e.target.value)
                          }
                          style={{ maxWidth: "250px" }}
                        />
                      ) : (
                        selectedBooking.serviceType
                      )}
                    </td>
                  </tr> */}
                  <tr>
                    <th>Service</th>
                    <td>{selectedBooking.serviceType}</td>
                  </tr>
                  {/* <tr>
  <th>Services (Line Items)</th>
  <td>
    {selectedBooking.services && selectedBooking.services.length > 0 ? (
      <Table
        bordered
        size="sm"
        className="mb-0"
        responsive
      >
        <thead>
          <tr>
            <th>Type</th>
            <th>Description</th>
            <th>Billing</th>
            <th>Hours</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {selectedBooking.services.map((s, idx) => (
            <tr key={idx}>
              <td>{s.serviceType}</td>
              <td>{s.description}</td>
              <td>{s.billingType}</td>
              <td>{s.billingType === "hours" ? s.hours : "-"}</td>
              <td>{s.billingType === "quantity" ? s.quantity : "-"}</td>
              <td>{s.price != null ? `$${s.price}` : "-"}</td>
              <td>{s.amount != null ? `$${s.amount.toFixed(2)}` : "-"}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    ) : (
      <span>No detailed services captured.</span>
    )}
  </td>
</tr> */}
                  <tr>
                    <th>Services (Line Items)</th>
                    <td>
                      {isEditingServices ? (
                        <>
                          <Table bordered size="sm" className="mb-2" responsive>
                            <thead>
                              <tr>
                                <th>Type</th>
                                <th>Description</th>
                                <th>Billing</th>
                                <th>Hours</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Amount</th>
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                              {editableServices.map((s, idx) => (
                                <tr key={idx}>
                                  <td>
                                    <Form.Control
                                      value={s.serviceType}
                                      className="text-cleanar-color form-input"
                                      onChange={(e) =>
                                        handleServiceCellChange(
                                          idx,
                                          "serviceType",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>
                                  <td>
                                    <Form.Control
                                      value={s.description}
                                      className="text-cleanar-color form-input"
                                      onChange={(e) =>
                                        handleServiceCellChange(
                                          idx,
                                          "description",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>
                                  <td>
                                    <Form.Select
                                      value={s.billingType}
                                      className="text-cleanar-color form-input"
                                      onChange={(e) =>
                                        handleServiceCellChange(
                                          idx,
                                          "billingType",
                                          e.target.value
                                        )
                                      }
                                    >
                                      <option value="hours">Hours</option>
                                      <option value="quantity">Quantity</option>
                                    </Form.Select>
                                  </td>
                                  <td>
                                    <Form.Control
                                      type="number"
                                      value={s.hours}
                                      className="text-cleanar-color form-input"
                                      onChange={(e) =>
                                        handleServiceCellChange(
                                          idx,
                                          "hours",
                                          e.target.value
                                        )
                                      }
                                      disabled={s.billingType !== "hours"}
                                    />
                                  </td>
                                  <td>
                                    <Form.Control
                                      type="number"
                                      value={s.quantity}
                                      className="text-cleanar-color form-input"
                                      onChange={(e) =>
                                        handleServiceCellChange(
                                          idx,
                                          "quantity",
                                          e.target.value
                                        )
                                      }
                                      disabled={s.billingType !== "quantity"}
                                    />
                                  </td>
                                  <td>
                                    <Form.Control
                                      type="number"
                                      value={s.price}
                                      className="text-cleanar-color form-input"
                                      onChange={(e) =>
                                        handleServiceCellChange(
                                          idx,
                                          "price",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </td>
                                  <td>{`$${(s.amount || 0).toFixed(2)}`}</td>
                                  <td>
                                    {idx > 0 && (
                                      <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => removeServiceRowInModal(idx)}
                                      >
                                        X
                                      </Button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                          <div className="d-flex justify-content-between align-items-center">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={addServiceRowInModal}
                            >
                              + Add Service
                            </Button>
                            <div className="d-flex gap-2">
                              <Button
                                variant="success"
                                size="sm"
                                onClick={saveServices}
                              >
                                Save Services
                              </Button>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => {
                                  // reset editor from current booking
                                  if (selectedBooking.services && selectedBooking.services.length > 0) {
                                    setEditableServices(selectedBooking.services);
                                  }
                                  setIsEditingServices(false);
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          {selectedBooking.services && selectedBooking.services.length > 0 ? (
                            <Table bordered size="sm" className="mb-2" responsive>
                              <thead>
                                <tr>
                                  <th>Type</th>
                                  <th>Description</th>
                                  <th>Billing</th>
                                  <th>Hours</th>
                                  <th>Qty</th>
                                  <th>Price</th>
                                  <th>Amount</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedBooking.services.map((s, idx) => (
                                  <tr key={idx}>
                                    <td>{s.serviceType}</td>
                                    <td>{s.description}</td>
                                    <td>{s.billingType}</td>
                                    <td>{s.billingType === "hours" ? s.hours : "-"}</td>
                                    <td>{s.billingType === "quantity" ? s.quantity : "-"}</td>
                                    <td>{s.price != null ? `$${s.price}` : "-"}</td>
                                    <td>
                                      {s.amount != null ? `$${s.amount.toFixed(2)}` : "-"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          ) : (
                            <span>No detailed services captured.</span>
                          )}
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="mt-2"
                            onClick={() => setIsEditingServices(true)}
                          >
                            Edit Services
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>



                  {/* <tr>
                    <th>Date/Time</th>
                    <td>
                      {isEditing ? (
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
                                  onChange={(e) =>
                                    setCustomerAcknowledged(e.target.checked)
                                  }
                                />
                                <span className="form-check-sign"></span>{" "}
                                Acknowledge Changes to Date/Service
                              </Label>
                            </FormGroup>
                          </Col>
                        </Row>
                      ) : (
                        <div className="d-flex align-items-center gap-2">
                          {new Date(
                            selectedBooking.date
                          ).toLocaleString()}
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
                  </tr> */}
                  <tr>
                    <th>Date/Time</th>
                    <td>
                      {isEditing ? (
                        <>
                          <Row className="align-items-center g-2 mb-2">
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
                                    onChange={(e) =>
                                      setCustomerAcknowledged(e.target.checked)
                                    }
                                  />
                                  <span className="form-check-sign"></span>{" "}
                                  Acknowledge Changes to Date/Service
                                </Label>
                              </FormGroup>
                            </Col>
                          </Row>
                          <Row className="align-items-center g-2">
                            <Col xs={6} sm="auto">
                              <Button
                                variant="success"
                                size="sm"
                                onClick={async () => {
                                  await updateBookingDate();
                                  setIsEditing(false);
                                }}
                                className="rounded-pill"
                              >
                                Save
                              </Button>
                            </Col>
                            <Col xs={6} sm="auto">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleCancelEdit}
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


                  {/* <tr>
                    <th>Cost</th>
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
                  </tr> */}
                  <tr>
                    <th>Income</th>
                    <td>{`$${(
                      isEditingServices ? servicesTotal : selectedBooking.income || 0
                    ).toFixed(2)} CAD`}</td>
                  </tr>



                  {/* {isEditing && (
                    <tr>
                      <th>Save Changes</th>
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
                              onClick={handleCancelEdit}
                              className="rounded-pill"
                            >
                              Cancel
                            </Button>
                          </Col>
                        </Row>
                      </td>
                    </tr>
                  )} */}

                  <tr>
                    <th>24hr Reminder</th>
                    <td>
                      {selectedBooking.reminderScheduled ? "Yes" : "No"}
                    </td>
                  </tr>
                  {/* <tr>
                    <th>Status</th>
                    <td>
                      <Badge
                        bg={
                          statusColors[selectedBooking.status] ||
                          "secondary"
                        }
                      >
                        {selectedBooking.status}
                      </Badge>
                    </td>
                  </tr> */}
                  <tr>
                    <th>Invoice</th>
                    <td>
                      {invoiceLoading ? (
                        <div className="d-flex align-items-center gap-2">
                          <Spinner animation="border" size="sm" />
                          <span className="text-muted">Checking invoice…</span>
                        </div>
                      ) : invoiceInfo ? (
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <Badge bg="success">Invoiced ✅</Badge>

                          {/* Use Link or a Button that navigates */}
                          <Link to={`/invoices/${invoiceInfo._id}`}>
                            Open invoice #{invoiceInfo.invoiceNumber}
                          </Link>

                          {/* Optional: show created date */}
                          {invoiceInfo.createdAt ? (
                            <span className="text-muted" style={{ fontSize: 12 }}>
                              (created {new Date(invoiceInfo.createdAt).toLocaleString()})
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <div className="d-flex align-items-center gap-2">
                          <Badge bg="secondary">Not invoiced</Badge>
                          {invoiceErr ? (
                            <span className="text-danger">{invoiceErr}</span>
                          ) : (
                            <span className="text-muted">No invoice found for this booking.</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>

                  <tr>
                    <th>New Date Requested</th>
                    <td>
                      {selectedBooking.customerSuggestedBookingDate
                        ? new Date(
                          selectedBooking.customerSuggestedBookingDate
                        ).toLocaleDateString()
                        : "N/A"}{" "}
                      <br />
                    </td>
                  </tr>
                  <tr>
                    <th>New Service Requested</th>
                    <td>
                      {selectedBooking.customerSuggestedServiceType
                        ? `${selectedBooking.customerSuggestedServiceType}`
                        : ""}
                      <br />
                      Comments:{" "}
                      {selectedBooking.customerSuggestedBookingComment && (
                        <p>{selectedBooking.customerSuggestedBookingComment}</p>
                      )}
                    </td>
                  </tr>

                  {selectedBooking.status === "confirmed" ? (
                    <tr>
                      <th>Confirm Booking</th>
                      <td>
                        <p className="text-success">
                          Confirmation Email Disabled?{" "}
                          {selectedBooking.disableConfirmation
                            ? "Yes"
                            : "No"}
                          <br />
                          Scheduled Confirmation?{" "}
                          {selectedBooking.scheduleConfirmation
                            ? "Yes"
                            : "No"}
                          <br />
                          Confirmation Date:{" "}
                          {selectedBooking.confirmationDate
                            ? new Date(
                              selectedBooking.confirmationDate
                            ).toLocaleString()
                            : "N/A"}
                          <br />
                          Confirmation Email Sent Date:{" "}
                          {selectedBooking.scheduledConfirmationDate
                            ? new Date(
                              selectedBooking.scheduledConfirmationDate
                            ).toLocaleString()
                            : "N/A"}
                          <br />
                          24-hour Reminder Scheduled?{" "}
                          {selectedBooking.reminderScheduled
                            ? "Yes"
                            : "No"}
                          <br />
                          24-hour Reminder Sent Date:{" "}
                          {selectedBooking.scheduledReminderDate
                            ? new Date(
                              selectedBooking.scheduledReminderDate
                            ).toLocaleString()
                            : "N/A"}
                        </p>
                      </td>
                    </tr>
                  ) : selectedBooking.status === "pending" ? null : null}
                </tbody>
              </Table>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setSelectedBooking(null)}
              >
                Close
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>

      {/* Add Booking Modal */}
      <Modal
        show={showAddModal}
        onHide={() => {
          sessionStorage.removeItem(DRAFT_KEY);
          setShowAddModal(false);
        }}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <BookingForm
            customers={customers}
            setCustomers={setCustomers}
            prefillDate={prefillDate}
            setShowAddModal={setShowAddModal}
            fetchBookings={fetchBookings}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAddModal(false)}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      <GenerateInvoiceModal
        show={showInvoiceModal}
        onHide={() => {
          setShowInvoiceModal(false);
          fetchBookings();
        }}
        booking={selectedBooking}
      />
    </div>
  );
};

export default BookingCalendar;
