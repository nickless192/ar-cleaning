import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Badge,
  Table,
  Modal,
  Pagination,
  Accordion,
  Alert,
} from "react-bootstrap";
import Auth from "/src/utils/auth";
import QuoteRequest from "/src/components/Pages/UserJourney/QuoteRequest";
import BookingChangeModal from "/src/components/Pages/UserJourney/BookingChangeModal";
import ConsentModal from "/src/components/Pages/Landing/ConsentModal";
import { useTranslation } from "react-i18next";
import backgroundImage from "/src/assets/img/bg1.png";

function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // =========================
  // State
  // =========================
  const [isEditing, setIsEditing] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phonenumber: "",
    address: "",
    city: "",
    province: "",
    postalcode: "",
    howDidYouHearAboutUs: "",
    companyName: "",
    userId: "",
    username: "",
    termsConsent: false,
    consentReceivedDate: null,
  });

  const [bookings, setBookings] = useState({});
  const [quotes, setQuotes] = useState([]);

  // UX feedback (no alerts() in portal experience)
  const [uiMessage, setUiMessage] = useState({ type: "", text: "" });

  const bookingsArray = bookings?.bookings || [];

  // Quote edit modal
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);

  // Booking change modal
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  // New booking request modal
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);

  // Pagination (quotes)
  const [currentQuotePage, setCurrentQuotePage] = useState(1);
  const quotesPerPage = 10;

  const totalQuotePages = Math.max(1, Math.ceil(quotes.length / quotesPerPage));
  const indexOfLastQuote = currentQuotePage * quotesPerPage;
  const indexOfFirstQuote = indexOfLastQuote - quotesPerPage;
  const currentQuotes = quotes.slice(indexOfFirstQuote, indexOfLastQuote);

  // =========================
  // Helpers (dates/status)
  // =========================
  // Match BookingCalendar Bootstrap contextual colors
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

  const getUiStatus = (booking) => {
    const isInvoiced =
      booking?.invoiced || booking?.invoiceCreatedAt || booking?.invoiceSentAt;
    return isInvoiced ? "invoiced" : booking?.status || "pending";
  };

  const formatDate = (d) => {
    if (!d) return "—";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "—";
    return dt.toLocaleDateString();
  };

  // const formatTimeToronto = (d) => {
  //   if (!d) return "—";
  //   const dt = new Date(d);
  //   if (Number.isNaN(dt.getTime())) return "—";
  //   return dt.toLocaleTimeString("en-CA", {
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     timeZone: "America/Toronto",
  //   });
  // };
  const isMidnightToronto = (d) => {
    if (!d) return false;
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return false;

    // interpret in Toronto timezone (formatToParts avoids timezone math mistakes)
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Toronto",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(dt);

    const hh = Number(parts.find(p => p.type === "hour")?.value ?? NaN);
    const mm = Number(parts.find(p => p.type === "minute")?.value ?? NaN);
    return hh === 0 && mm === 0;
  };

  const formatTimeToronto = (d) => {
    if (!d) return "—";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "—";
    return dt.toLocaleTimeString("en-CA", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Toronto",
    });
  };

  // Only show time if it's a real scheduled time (not midnight)
  const getTimeLabel = (booking) => {
    if (!booking) return "";
    if (booking.date) {
      // scheduled date with time
      return isMidnightToronto(booking.date) ? "" : formatTimeToronto(booking.date);
    }
    // request date-only => time TBD
    if (booking.customerSuggestedBookingDate) return "Time TBD";
    return "";
  };

  const getScheduledOrRequestedDate = (booking) =>
    booking?.date || booking?.customerSuggestedBookingDate || null;

  const isRequestBooking = (booking) => !booking?.date && !!booking?.customerSuggestedBookingDate;

  const selectedBooking = useMemo(() => {
    return bookingsArray.find((b) => b._id === selectedBookingId) || null;
  }, [bookingsArray, selectedBookingId]);

  // Sort bookings for portal UX:
  // - Upcoming first (based on scheduled or suggested date)
  // - Requests are included in upcoming bucket
  const { upcomingBookings, pastBookings, nextBooking } = useMemo(() => {
    const now = new Date();

    const normalized = bookingsArray
      .map((b) => {
        const d = getScheduledOrRequestedDate(b);
        const dt = d ? new Date(d) : null;
        const time = dt && !Number.isNaN(dt.getTime()) ? dt.getTime() : null;
        const isPast = time !== null ? dt < now : false;
        return { b, time, isPast };
      })
      // ignore completely invalid rows but keep them visible in past bucket if needed
      .sort((a, c) => {
        const at = a.time ?? 0;
        const ct = c.time ?? 0;
        return at - ct;
      });

    const upcoming = normalized.filter((x) => !x.isPast).map((x) => x.b);
    const past = normalized
      .filter((x) => x.isPast)
      .sort((a, c) => (c.time ?? 0) - (a.time ?? 0)) // past: newest first
      .map((x) => x.b);

    const next = upcoming.length ? upcoming[0] : null;

    return {
      upcomingBookings: upcoming,
      pastBookings: past,
      nextBooking: next,
    };
  }, [bookingsArray]);

  // =========================
  // Data fetching
  // =========================
  const refreshBookings = async (userId) => {
    const bookingsResponse = await fetch(`/api/users/${userId}/bookings`);
    const bookingsData = await bookingsResponse.json();
    if (bookingsData) setBookings(bookingsData);
  };

  const getStatusStep = (booking) => {
    const uiStatus = getUiStatus(booking);
    const s = String(uiStatus || "").toLowerCase();

    // final
    if (s === "paid") return 4;

    // invoiced overrides
    if (s === "invoiced") return 3;

    // completed/done
    if (s === "completed" || s === "done") return 2;

    // confirmed / in progress
    if (s === "confirmed" || s === "in progress") return 1;

    // pending/cancelled/anything else
    return 0;
  };

  const getStatusLabel = (step) => {
    // Keep copy minimal/premium
    switch (step) {
      case 0:
        return "Requested";
      case 1:
        return "Confirmed";
      case 2:
        return "Completed";
      case 3:
        return "Invoiced";
      case 4:
        return "Paid";
      default:
        return "Requested";
    }
  };

  useEffect(() => {
    const userInfo = async () => {
      try {
        const data = await Auth.getProfile().data;

        const response = await fetch(`/api/quotes/user/${data._id}`);
        const quotesData = await response.json();
        setQuotes(quotesData);

        setFormData({
          name: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
          email: data.email || "",
          phonenumber: data.telephone || "",
          address: data.address || "",
          city: data.city || "",
          province: data.province || "",
          postalcode: data.postalcode || "",
          howDidYouHearAboutUs: data.howDidYouHearAboutUs || "",
          companyName: data.companyName || "",
          userId: data._id,
          username: data.username || "",
          termsConsent: data.termsConsent || false,
          consentReceivedDate: data.consentReceivedDate || null,
        });

        if (!data.termsConsent) setShowConsentModal(true);

        await refreshBookings(data._id);
      } catch (err) {
        console.error(err);
      }
    };

    userInfo();

    document.body.classList.add("profile-page", "sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    document.body.scrollTop = 0;

    return function cleanup() {
      document.body.classList.remove("profile-page", "sidebar-collapse");
    };
  }, [navigate, location]);

  // =========================
  // Actions
  // =========================
  const handleEditQuote = (quote) => {
    setSelectedQuote(quote);
    setShowQuoteModal(true);
  };

  const handleRequestDateChange = (bookingId) => {
    setSelectedBookingId(bookingId);
    setShowChangeModal(true);
  };

  const closeChangeModal = () => {
    setShowChangeModal(false);
    setSelectedBookingId(null);
  };

  const openNewBookingModal = () => setShowNewBookingModal(true);
  const closeNewBookingModal = () => setShowNewBookingModal(false);

  const handleModalSubmit = ({ newDate, comment, serviceType }) => {
    setUiMessage({ type: "", text: "" });

    fetch(`/api/bookings/${selectedBookingId}/request-change`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newDate, comment, serviceType }),
    })
      .then(async (response) => {
        if (response.ok) {
          await refreshBookings(formData.userId);
          setUiMessage({
            type: "success",
            text: t("profile.alerts.change_request_success", "Change request submitted."),
          });
        } else {
          setUiMessage({
            type: "danger",
            text: t("profile.alerts.change_request_error", "Error submitting change request."),
          });
        }
      })
      .catch(() => {
        setUiMessage({
          type: "danger",
          text: t("profile.alerts.change_request_error", "Error submitting change request."),
        });
      });
  };

  const handleNewBookingSubmit = ({ requestedDate, requestedServiceType, comment }) => {
    setUiMessage({ type: "", text: "" });

    fetch(`/api/bookings/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: formData.userId, // testing mode for now
        customerSuggestedBookingDate: requestedDate,
        customerSuggestedServiceType: requestedServiceType,
        customerSuggestedBookingComment: comment, // correct schema key
      }),
    })
      .then(async (response) => {
        if (response.ok) {
          await refreshBookings(formData.userId);
          closeNewBookingModal();
          setUiMessage({
            type: "success",
            text: t(
              "profile.alerts.new_booking_request_success",
              "Booking request submitted. We’ll confirm shortly."
            ),
          });
        } else {
          setUiMessage({
            type: "danger",
            text: t(
              "profile.alerts.new_booking_request_error",
              "Error submitting booking request."
            ),
          });
        }
      })
      .catch(() =>
        setUiMessage({
          type: "danger",
          text: t(
            "profile.alerts.new_booking_request_error",
            "Error submitting booking request."
          ),
        })
      );
  };

  const handleConsentAccept = async (consentGiven) => {
    if (!consentGiven) {
      setUiMessage({
        type: "danger",
        text: t("profile.alerts.terms_not_accepted", "You must accept to continue."),
      });
      return;
    }

    try {
      await fetch(`/api/users/${formData.userId}/consent`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          termsConsent: true,
          consentReceivedDate: new Date().toISOString(),
        }),
      });

      setFormData((prev) => ({
        ...prev,
        termsConsent: true,
        consentReceivedDate: new Date().toISOString(),
      }));

      setShowConsentModal(false);
      Auth.logout();
      navigate("/login-signup");
    } catch (error) {
      console.error("Failed to save consent:", error);
    }
  };

  const handleConsentReject = () => {
    setUiMessage({
      type: "danger",
      text: t("profile.alerts.terms_not_accepted", "You must accept to continue."),
    });
  };

  const handleInputChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = async (e) => {
    e.preventDefault();
    setUiMessage({ type: "", text: "" });
    setIsEditing(false);

    if (
      !formData.address ||
      !formData.city ||
      !formData.province ||
      !formData.postalcode ||
      !formData.phonenumber ||
      !formData.companyName
    ) {
      setUiMessage({ type: "danger", text: "Please fill out all fields." });
      return;
    }

    try {
      const updatedData = {
        firstName: formData.name.split(" ")[0] || "",
        lastName: formData.name.split(" ").slice(1).join(" ") || "",
        email: formData.email,
        telephone: formData.phonenumber,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        postalcode: formData.postalcode,
        howDidYouHearAboutUs: formData.howDidYouHearAboutUs,
        companyName: formData.companyName,
      };

      const res = await fetch(`/api/users/${formData.userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        setUiMessage({ type: "success", text: "Profile updated." });
      } else {
        setUiMessage({ type: "danger", text: res.statusText || "Update failed." });
      }
    } catch (err) {
      console.error(err);
      setUiMessage({ type: "danger", text: "Update failed." });
    }
  };

  const handleCancelClick = async (e) => {
    e.preventDefault();
    setIsEditing(false);
    setUiMessage({ type: "", text: "" });

    const data = await Auth.getProfile().data;
    setFormData((prev) => ({
      ...prev,
      name: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
      email: data.email || "",
      phonenumber: data.telephone || "",
      address: data.address || "",
      city: data.city || "",
      province: data.province || "",
      postalcode: data.postalcode || "",
      howDidYouHearAboutUs: data.howDidYouHearAboutUs || "",
      companyName: data.companyName || "",
      userId: data._id,
    }));
  };

  // =========================
  // Render helpers (Portal UI)
  // =========================
  const firstName = (formData.name || "").split(" ")[0] || "";
  const hasBookings = bookingsArray.length > 0;



  const BookingProgress = ({ booking }) => {
    const step = getStatusStep(booking);

    // You want Pending instead of Requested
    const items = ["Pending", "Confirmed", "Completed", "Invoiced", "Paid"];

    return (
      <div className="booking-progress">
        <div className="booking-progress-track" aria-hidden="true">
          <div
            className="booking-progress-fill"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <div className="booking-progress-labels">
          {items.map((label, idx) => {
            const active = idx <= step;
            return (
              <div
                key={label}
                className={`booking-progress-item ${active ? "active" : ""}`}
                title={label}
              >
                <span className="booking-progress-dot" />
                <span className="booking-progress-text">{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const NextServiceCard = ({ booking }) => {
    if (!booking) {
      return (
        <Card className="p-4 shadow-sm border-0">
          <div className="d-flex justify-content-between align-items-start gap-3">
            <div>
              <div className="text-muted small">
                {t("portal.next_service", "Next service")}
              </div>
              <h5 className="mb-1">{t("portal.none_scheduled", "No service scheduled")}</h5>
              <div className="text-muted">
                {t("portal.none_scheduled_sub", "Request a booking and we’ll confirm shortly.")}
              </div>
            </div>
            {/* <Button variant="primary" onClick={openNewBookingModal}>
              {t("portal.request_booking", "Request booking")}
            </Button> */}
          </div>
        </Card>
      );
    }

    const uiStatus = getUiStatus(booking);
    const statusColor = statusColors[uiStatus] || "secondary";

    const scheduled = booking?.date ? booking.date : null;
    const requested = booking?.customerSuggestedBookingDate || null;

    const headlineDate = scheduled || requested;

    const serviceType = booking?.serviceType || booking?.customerSuggestedServiceType || "—";

    const allowChange =
      !!booking?.date && new Date(booking.date) >= new Date() && uiStatus !== "completed";

    return (
      <Card className="p-4 shadow-sm border-0">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">

          <div className="next-service-wrapper">

            <div className="next-service-kicker">
              Next service
            </div>

            <div className="next-service-date">
              {formatDate(headlineDate)}
              {getTimeLabel(booking) && (
                <span className="next-service-time">
                  {" "}· {getTimeLabel(booking)}
                </span>
              )}
            </div>

            <div className="next-service-type">
              {serviceType}
            </div>

            <div className="next-service-status">
              <Badge bg={statusColor} className="text-capitalize">
                {uiStatus}
              </Badge>

              {uiStatus === "pending" && (
                <span className="next-service-note">
                  Awaiting confirmation
                </span>
              )}
            </div>
            <div className="next-service-progress">
              <BookingProgress booking={booking} />
            </div>
          </div>

          <div className="next-service-actions">
            {allowChange ? (
              <Button
                variant="outline-secondary"
                onClick={() => handleRequestDateChange(booking._id)}
              >
                Request change
              </Button>
            ) : (
              <Button variant="outline-secondary" disabled>
                Change unavailable
              </Button>
            )}
          </div>

        </div>
      </Card>
    );
  };

  const BookingCard = ({ booking }) => {
    const uiStatus = getUiStatus(booking);
    const statusColor = statusColors[uiStatus] || "secondary";

    const scheduled = booking?.date ? booking.date : null;
    const requested = booking?.customerSuggestedBookingDate || null;
    const primaryDate = scheduled || requested;

    const serviceType = booking?.serviceType || booking?.customerSuggestedServiceType || "—";

    const allowChange =
      !!booking?.date && new Date(booking.date) >= new Date() && uiStatus !== "completed";

    return (
      <Card className="border-0 shadow-sm h-100">
        <Card.Body className="p-3">
          <div className="d-flex justify-content-between align-items-start gap-2">
            <div>
              <div className="fw-semibold">{serviceType}</div>
              <div className="text-muted small">
                {formatDate(primaryDate)} · {formatTimeToronto(primaryDate)}
              </div>

              <div className="mt-2">
                <Badge bg={statusColor} className="text-capitalize">
                  {uiStatus}
                </Badge>

                {/* Optional: show requested date if there's a separate suggestion */}
                {scheduled && requested && (
                  <div className="text-muted small mt-2">
                    {t("portal.requested_date", "Requested date")}: {formatDate(requested)}
                    {booking.customerSuggestedBookingAcknowledged ? (
                      <Badge pill bg="success" className="ms-2">
                        {t("profile.bookings.acknowledged_badge", "Acknowledged")}
                      </Badge>
                    ) : (
                      <Badge pill bg="danger" className="ms-2">
                        {t("profile.bookings.not_acknowledged_badge", "Not acknowledged")}
                      </Badge>
                    )}
                  </div>
                )}

                {!scheduled && requested && (
                  <div className="text-muted small mt-2">
                    {t("portal.awaiting_confirmation", "Awaiting confirmation")}
                  </div>
                )}
              </div>
            </div>

            <div className="d-flex flex-column gap-2">
              {allowChange ? (
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => handleRequestDateChange(booking._id)}
                >
                  {t("profile.bookings.request_change", "Request change")}
                </Button>
              ) : (
                <Button variant="outline-secondary" size="sm" disabled>
                  {t("profile.bookings.not_available", "Not available")}
                </Button>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  };

  // =========================
  // Portal layout
  // =========================
  return (
    <>
      <div
        className="wrapper light-bg-color mb-0 cleanar-app-bg"
      // style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <Container className="py-5">
          {/* Portal Header / Hero */}
          <Row className="mb-4">
            <Col>
              {/* Portal Hero */}
              <div className="portal-hero">
                <Container className="portal-hero-inner">
                  <Row className="align-items-end g-3">
                    <Col lg={8}>
                      <div className="portal-hero-kicker">
                        {t("portal.welcome", "Welcome back")}
                      </div>

                      <h1 className="portal-hero-title">
                        {firstName ? `${firstName}, ` : ""}
                        {t("portal.headline", "your home is in good hands.")}
                      </h1>

                      <div className="portal-hero-sub">
                        {formData.city ? `${formData.city}, ${formData.province}` : "Toronto, ON"} ·{" "}
                        {t("portal.client_status", "Active client")}
                      </div>

                      <div className="portal-hero-actions">
                        <Button className="portal-primary-btn" onClick={openNewBookingModal}>
                          {t("portal.request_booking", "Request booking")}
                        </Button>

                        <Button
                          className="portal-secondary-btn"
                          onClick={() =>
                            document.getElementById("portal-account")?.scrollIntoView({ behavior: "smooth" })
                          }
                        >
                          {t("portal.manage_account", "Manage account")}
                        </Button>
                      </div>
                    </Col>


                  </Row>
                </Container>
              </div>
            </Col>
          </Row>

          {/* Inline portal feedback (success/errors) */}
          {uiMessage?.text ? (
            <Row className="mb-3">
              <Col>
                <Alert
                  variant={uiMessage.type || "info"}
                  onClose={() => setUiMessage({ type: "", text: "" })}
                  dismissible
                  className="mb-0"
                >
                  {uiMessage.text}
                </Alert>
              </Col>
            </Row>
          ) : null}

          {/* Next service */}
          <Row className="mb-4">
            <Col>
              <NextServiceCard booking={nextBooking} />
            </Col>
          </Row>

          {/* Quick actions */}
          <Row className="mb-4 g-4">
            <Col md={3}>
              <Card className="qa-card h-100 qa-card-primary">
                <Card.Body className="qa-body">
                  <div className="qa-top">
                    <div className="qa-icon">📅</div>
                    <div className="qa-kicker">Quick action</div>
                    <div className="qa-title">Request booking</div>
                  </div>

                  <div className="qa-sub">
                    Pick a date + service. We’ll confirm the time.
                  </div>

                  <div className="qa-footer">
                    <Button className="qa-primary" onClick={openNewBookingModal}>
                      Request booking
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3}>
              <Card className="qa-card h-100">
                <Card.Body className="qa-body">
                  <div className="qa-top">
                    <div className="qa-icon">👤</div>
                    <div className="qa-kicker">Profile</div>
                    <div className="qa-title">Update details</div>
                  </div>

                  <div className="qa-sub">
                    Address, phone, and access notes.
                  </div>

                  <div className="qa-footer">
                    <Button
                      className="qa-primary"
                      onClick={() => {
                        document.getElementById("portal-account")?.scrollIntoView({ behavior: "smooth" });
                        setIsEditing(true);
                      }}
                    >
                      Edit profile
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3}>
              <Card className="qa-card h-100">
                <Card.Body className="qa-body">
                  <div className="qa-top">
                    <div className="qa-icon">🧾</div>
                    <div className="qa-kicker">History</div>
                    <div className="qa-title">View past visits</div>
                  </div>

                  <div className="qa-sub">
                    Past visits and status updates.
                  </div>

                  <div className="qa-footer">
                    <Button
                      className="qa-primary"
                      onClick={() => {
                        document.getElementById("portal-history")?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      View history
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3}>
              <Card className="qa-card h-100">
                <Card.Body className="qa-body">
                  <div className="qa-top">
                    <div className="qa-icon">💬</div>
                    <div className="qa-kicker">Support</div>
                    <div className="qa-title">Contact CleanAR</div>
                  </div>

                  <div className="qa-sub">
                    Questions? We’re here for you.
                  </div>

                  <div className="qa-footer">
                    <Button className="qa-primary" onClick={() => navigate("/contact")}>
                      Contact
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Upcoming cleanings */}
          <Row className="mb-4">
            <Col>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h4 className="portal-section-title">{t("portal.upcoming", "Upcoming cleanings")}</h4>
                <div className="portal-section-sub">
                  {hasBookings
                    ? t("portal.upcoming_sub", "Your scheduled and pending visits.")
                    : t("portal.upcoming_empty_sub", "No upcoming visits yet.")}
                </div>
              </div>

              {upcomingBookings.length === 0 ? (
                <Card className="p-4 cleanar-card upcoming-card">
                  <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                    <div>
                      <div className="fw-semibold">
                        {t("portal.empty_upcoming_title", "Nothing scheduled yet")}
                      </div>
                      <div className="text-muted">
                        {t("portal.empty_upcoming_body", "Request a booking and we’ll confirm the best time.")}
                      </div>
                    </div>
                    <Button variant="primary" onClick={openNewBookingModal}>
                      {t("portal.request_booking", "Request booking")}
                    </Button>
                  </div>
                </Card>
              ) : (
                <Row className="g-3">
                  {upcomingBookings.map((b) => (
                    <Col md={6} lg={4} key={b._id}>
                      <BookingCard booking={b} />
                    </Col>
                  ))}
                </Row>
              )}
            </Col>
          </Row>

          {/* Past cleanings */}
          <Row className="mb-5" id="portal-history">
            <Col>
              <h4 className="mb-2">{t("portal.past", "Past cleanings")}</h4>
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                  <Accordion flush>
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>
                        {t("portal.past_toggle", "View past visits")}
                        <span className="ms-2 text-muted small">
                          ({pastBookings.length})
                        </span>
                      </Accordion.Header>
                      <Accordion.Body>
                        {pastBookings.length === 0 ? (
                          <div className="text-muted">
                            {t("portal.past_empty", "No past bookings yet.")}
                          </div>
                        ) : (
                          <div className="cleanar-card past-visit-card p-3">
                            {pastBookings.slice(0, 20).map((b) => {
                              const uiStatus = getUiStatus(b);
                              const statusColor = statusColors[uiStatus] || "secondary";
                              const d = getScheduledOrRequestedDate(b);
                              const serviceType = b?.serviceType || b?.customerSuggestedServiceType || "—";

                              return (
                                <div
                                  key={b._id}
                                  className="d-flex justify-content-between align-items-center border rounded p-2"
                                >
                                  <div>
                                    <div className="fw-semibold">{serviceType}</div>
                                    <div className="text-muted small">{formatDate(d)}</div>
                                  </div>
                                  <Badge bg={statusColor} className="text-capitalize">
                                    {uiStatus}
                                  </Badge>
                                </div>
                              );
                            })}
                            {pastBookings.length > 20 && (
                              <div className="text-muted small mt-2">
                                {t("portal.past_limit", "Showing 20 most recent.")}
                              </div>
                            )}
                          </div>
                        )}
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Quotes (keep simple for structure pass) */}
          <Row className="mb-5">
            <Col>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h4 className="mb-0">{t("portal.quotes", "Quote requests")}</h4>
                <div className="text-muted small">{t("portal.quotes_sub", "Your submitted quote requests.")}</div>
              </div>

              <Card className="border-0 shadow-sm">
                <Card.Body>
                  {quotes.length === 0 ? (
                    <div className="text-muted">{t("profile.quotes.no_quotes", "No quotes yet.")}</div>
                  ) : (
                    <>
                      <Table striped bordered hover responsive className="mb-3">
                        <thead>
                          <tr>
                            <th>{t("profile.quotes.service_info", "Service info")}</th>
                            <th>{t("profile.quotes.options", "Options")}</th>
                            <th>{t("profile.quotes.promo_code", "Promo code")}</th>
                            <th>{t("profile.quotes.submitted_at", "Submitted")}</th>
                            <th>{t("profile.quotes.acknowledged", "Acknowledged")}</th>
                            <th>{t("profile.quotes.actions", "Actions")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentQuotes.map((quote) => {
                            const submittedAt = new Date(quote.createdAt);
                            const services = quote?.services || [];

                            return (
                              <tr key={quote._id}>
                                <td>
                                  {services.map((srv, idx) => (
                                    <div key={idx}>
                                      {srv.type} - {srv.service}
                                    </div>
                                  ))}
                                </td>

                                <td>
                                  {services.map((srv, idx) => (
                                    <div key={idx}>
                                      {Object.entries(srv.customOptions || {}).map(([key, opt]) => (
                                        <div key={opt._id?.$oid || key}>
                                          <strong>{opt.label}:</strong>{" "}
                                          {typeof opt.service === "boolean"
                                            ? opt.service
                                              ? t("profile.quotes.yes", "Yes")
                                              : t("profile.quotes.no", "No")
                                            : opt.service}
                                        </div>
                                      ))}
                                    </div>
                                  ))}
                                </td>

                                <td>{quote.promoCode || t("profile.quotes.not_applicable", "N/A")}</td>
                                <td>{submittedAt.toLocaleDateString()}</td>
                                <td>{quote.acknowledgedByUser ? t("profile.quotes.yes", "Yes") : t("profile.quotes.not_yet", "Not yet")}</td>
                                <td>
                                  <Button
                                    size="sm"
                                    variant="outline-secondary"
                                    onClick={() => handleEditQuote(quote)}
                                  >
                                    {t("profile.quotes.edit_quote", "Edit")}
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>

                      <div className="d-flex justify-content-center">
                        <Pagination size="sm" className="mb-0">
                          <Pagination.Prev
                            disabled={currentQuotePage === 1}
                            onClick={() => setCurrentQuotePage((p) => Math.max(1, p - 1))}
                          />
                          <span className="mx-3 align-self-center">
                            {t("profile.pagination.page_of", "Page")} {currentQuotePage}{" "}
                            {t("profile.pagination.of", "of")} {totalQuotePages}
                          </span>
                          <Pagination.Next
                            disabled={currentQuotePage === totalQuotePages}
                            onClick={() => setCurrentQuotePage((p) => Math.min(totalQuotePages, p + 1))}
                          />
                        </Pagination>
                      </div>
                    </>
                  )}
                </Card.Body>
              </Card>

              <Modal show={showQuoteModal} onHide={() => setShowQuoteModal(false)} size="xl">
                <Modal.Header closeButton>
                  <Modal.Title>{t("profile.quotes.edit_quote", "Edit quote")}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {selectedQuote && (
                    <QuoteRequest
                      initialData={selectedQuote}
                      onSubmit={() => setShowQuoteModal(false)}
                    />
                  )}
                </Modal.Body>
              </Modal>
            </Col>
          </Row>

          {/* Account section (your existing profile editor, reorganized) */}
          <Row className="mb-5" id="portal-account">
            <Col>
              <div className="account-header">
                <div>
                  <h4 className="account-title">{t("portal.account", "Account & preferences")}</h4>
                  <div className="account-sub">
                    {t("portal.account_sub", "Keep your details up to date so we can serve you better.")}
                  </div>
                </div>

                <div className="account-actions">
                  {!isEditing ? (
                    <Button
                      className="qa-ghost"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsEditing(true);
                      }}
                    >
                      {t("profile.buttons.edit_profile", "Edit profile")}
                    </Button>
                  ) : (
                    <>
                      <Button className="qa-ghost" onClick={handleCancelClick}>
                        {t("profile.buttons.cancel", "Cancel")}
                      </Button>
                      <Button className="portal-primary-btn" type="submit" form="accountForm">
                        {t("profile.buttons.save_profile", "Save")}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <Card className="cleanar-card account-card">
                <Card.Body className="account-body">
                  <Form id="accountForm" onSubmit={handleSaveClick}>
                    {/* Address */}
                    <div className="account-section">
                      <div className="account-section-title">
                        {t("profile.address.title", "Address")}
                      </div>

                      {isEditing ? (
                        <>
                          <Form.Control
                            type="text"
                            name="address"
                            placeholder={t("profile.address.placeholder", "Address")}
                            className="form-input text-cleanar-color mb-3"
                            value={formData.address}
                            onChange={handleInputChange}
                          />

                          <Row className="g-3">
                            <Col md={5}>
                              <Form.Control
                                type="text"
                                name="city"
                                placeholder={t("profile.address.city_placeholder", "City")}
                                value={formData.city}
                                className="form-input text-cleanar-color"
                                onChange={handleInputChange}
                              />
                            </Col>

                            <Col md={3}>
                              <Form.Control
                                type="text"
                                name="province"
                                placeholder={t("profile.address.province_placeholder", "Province")}
                                value={formData.province}
                                className="form-input text-cleanar-color"
                                onChange={handleInputChange}
                              />
                            </Col>

                            <Col md={4}>
                              <Form.Control
                                type="text"
                                name="postalcode"
                                placeholder={t("profile.address.postal_code_placeholder", "Postal code")}
                                value={formData.postalcode}
                                className="form-input text-cleanar-color"
                                onChange={handleInputChange}
                              />
                            </Col>
                          </Row>
                        </>
                      ) : (
                        <div className="account-view">
                          <div className="account-view-label">{t("profile.address.title", "Address")}</div>
                          <div className="account-view-value">
                            {formData.address
                              ? `${formData.address}, ${formData.city}, ${String(formData.postalcode || "").toUpperCase()}, ${formData.province}`
                              : t("profile.address.add_address", "Add your address")}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="account-divider" />

                    {/* Contact */}
                    <div className="account-section">
                      <div className="account-section-title">
                        {t("profile.contact.title", "Contact")}
                      </div>

                      <Row className="g-3">
                        <Col md={6}>
                          <div className="account-field">
                            <div className="account-field-label">{t("profile.contact.phone_title", "Phone")}</div>
                            {isEditing ? (
                              <Form.Control
                                type="text"
                                name="phonenumber"
                                value={formData.phonenumber}
                                className="form-input text-cleanar-color"
                                onChange={handleInputChange}
                              />
                            ) : (
                              <div className="account-field-value">
                                {formData.phonenumber || t("profile.contact.add_phone", "Add your phone")}
                              </div>
                            )}
                          </div>
                        </Col>

                        <Col md={6}>
                          <div className="account-field">
                            <div className="account-field-label">{t("profile.contact.email_title", "Email")}</div>
                            <div className="account-field-value">
                              {formData.email || t("profile.contact.add_email", "Add your email")}
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </div>

                    <div className="account-divider" />

                    {/* Company */}
                    <div className="account-section">
                      <div className="account-section-title">
                        {t("profile.company.title", "Company")}
                      </div>

                      {isEditing ? (
                        <Form.Control
                          type="text"
                          name="companyName"
                          className="form-input text-cleanar-color"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          placeholder={t("profile.company.add_company", "Company name")}
                        />
                      ) : (
                        <div className="account-view">
                          <div className="account-view-label">{t("profile.company.title", "Company")}</div>
                          <div className="account-view-value">
                            {formData.companyName || t("profile.company.add_company", "Add company name")}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* If editing, keep bottom actions for mobile convenience */}
                    {isEditing && (
                      <div className="account-mobile-actions">
                        <Button className="portal-primary-btn w-100" type="submit">
                          {t("profile.buttons.save_profile", "Save")}
                        </Button>
                        <Button className="qa-ghost w-100 mt-2" onClick={handleCancelClick}>
                          {t("profile.buttons.cancel", "Cancel")}
                        </Button>
                      </div>
                    )}
                    {/* If not editing, show a Edit button */}
                    {!isEditing && (
                      <div className="account-mobile-actions">
                        <Button className="portal-primary-btn w-100" onClick={(e) => {
                        e.preventDefault();
                        setIsEditing(true);
                      }}>
                          {t("profile.buttons.edit_profile", "Edit")}
                        </Button>
                      </div>
                    )}
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Booking Modals (single instances) */}
          <BookingChangeModal
            show={showChangeModal}
            handleClose={closeChangeModal}
            handleSubmit={handleModalSubmit}
            mode="change"
            initialDate={selectedBooking?.date}
            initialServiceType={selectedBooking?.serviceType}
          />

          <BookingChangeModal
            show={showNewBookingModal}
            handleClose={closeNewBookingModal}
            handleSubmit={handleNewBookingSubmit}
            mode="new"
          />
        </Container>
      </div>

      <ConsentModal
        show={showConsentModal}
        onAccept={handleConsentAccept}
        onReject={handleConsentReject}
      />
    </>
  );
}

export default ProfilePage;