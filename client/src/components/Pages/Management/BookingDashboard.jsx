import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Badge,
} from 'react-bootstrap';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import BookingCalendar from '/src/components/Pages/Management/BookingCalendar';

function normalizeStatus(status) {
  return (status || '').toLowerCase();
}

export default function BookingDashboard() {
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [showOnlyAlerted, setShowOnlyAlerted] = useState(false);
  const [highlightBookingId, setHighlightBookingId] = useState(null);
  const [showActionCenter, setShowActionCenter] = useState(false);
  const [alertPage, setAlertPage] = useState(1);
  const alertsPerPage = 5;

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      // filter out data that is hidden

      const visibleData = data.filter(b => !b.hidden);
      setBookings(visibleData);
      // setBookings(data);
      computeAlerts(visibleData);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  };

  // useEffect(() => {
  //   const fetchCustomers = async () => {
  //     try {
  //       const res = await fetch('/api/customers');
  //       if (!res.ok) throw new Error('Failed to fetch customers');
  //       const data = await res.json();
  //       setCustomers(data);
  //     } catch (err) {
  //       console.error('Error fetching customers:', err);
  //     }
  //   };
  //   if (isInitialLoad) {
  //     setIsInitialLoad(false);
  //     fetchCustomers();
  //   }
  //   fetchBookings();
  //   computeAlerts(bookings);
  // }, []);
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
    fetchCustomers();
  }

  fetchBookings();
}, []); // no computeAlerts(bookings) here


  useEffect(() => {
    setAlertPage(1);
  }, [alerts.length]);


  const formatDateTime = (date) => {
    const d = new Date(date);
    const day = d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
    const time = d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${day} ${time}`;
  };

  const shortId = (id = '') => (id ? id.slice(-4).toUpperCase() : '');

  const bookingSummary = (b, bd) => {
    const pieces = [];

    pieces.push(formatDateTime(bd)); // date/time

    if (b.customerName) pieces.push(b.customerName);
    if (b.serviceType) pieces.push(b.serviceType);

    const location =
      b.locationName ||
      b.propertyName ||
      b.addressLine1 ||
      b.city ||
      b.neighbourhood;

    if (location) pieces.push(location);

    if (b._id) pieces.push(`#${shortId(b._id)}`);

    return pieces.join(' • ');
  };

  const computeAlerts = (data) => {
    const now = new Date();
    const next48 = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const groupedAlerts = [];

    data.forEach((b) => {
      const bd = new Date(b.date);
      const status = normalizeStatus(b.status);
      const tasks = b.tasks || {};
      const issues = [];

      // Upcoming within 48h
      if (bd >= now && bd <= next48) {
        issues.push({
          type: 'upcoming',
          level: 'info',
          text: 'Upcoming within 48h',
        });
      }

      // Completed but unpaid
      if (status === 'completed' && !tasks.paid) {
        issues.push({
          type: 'unpaid',
          level: 'warning',
          text: `Completed but unpaid ($${b.income || 0})`,
        });
      }

      // Needs invoice
      if ((status === 'completed' || status === 'confirmed') && !tasks.invoiced && bd < now) {
        issues.push({
          type: 'needsInvoice',
          level: 'warning',
          text: `Needs invoice ($${b.income || 0})`,
        });
      }

      // Missed job (time in past, still confirmed)
      if (bd < now && status === 'confirmed') {
        issues.push({
          type: 'missed',
          level: 'danger',
          text: 'Missed booking (time passed, still confirmed)',
        });
      }

      // Customer suggestion not acknowledged
      if (
        (b.customerSuggestedBookingDate || b.customerSuggestedServiceType) &&
        !b.customerSuggestedBookingAcknowledged
      ) {
        const suggestedDate = b.customerSuggestedBookingDate
          ? new Date(b.customerSuggestedBookingDate).toLocaleDateString()
          : null;

        issues.push({
          type: 'customerRequest',
          level: 'info',
          text: `Customer request: ${b.customerSuggestedServiceType || 'updated service'
            }${suggestedDate ? ` on ${suggestedDate}` : ''}`,
        });
      }

      if (issues.length > 0) {
        groupedAlerts.push({
          bookingId: b._id,
          summary: bookingSummary(b, bd),
          issues,
        });
      }
    });

    setAlerts(groupedAlerts);
  };


  // const computeAlerts = (data) => {
  //   const now = new Date();
  //   const next48 = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  //   const newAlerts = [];

  //   data.forEach((b) => {
  //     const bd = new Date(b.date);
  //     const status = normalizeStatus(b.status);
  //     const tasks = b.tasks || {};

  //     // Upcoming within 48h
  //     if (bd >= now && bd <= next48) {
  //       newAlerts.push({
  //         id: `a-${b._id}-upcoming`,
  //         type: 'upcoming',
  //         level: 'info',
  //         bookingId: b._id,
  //         text: `Upcoming: ${b.customerName} (${b.serviceType}) — ${bd.toLocaleString()}`,
  //       });
  //     }

  //     // Completed but unpaid
  //     if (status === 'completed' && !tasks.paid) {
  //       newAlerts.push({
  //         id: `a-${b._id}-unpaid`,
  //         type: 'unpaid',
  //         level: 'warning',
  //         bookingId: b._id,
  //         text: `Completed but unpaid: ${b.customerName} — $${b.income || 0}`,
  //       });
  //     }

  //     // Needs invoice
  //     if ((status === 'completed' || status === 'confirmed') && !tasks.invoiced && bd < now) {
  //       newAlerts.push({
  //         id: `a-${b._id}-invoice`,
  //         type: 'needsInvoice',
  //         level: 'warning',
  //         bookingId: b._id,
  //         text: `Needs invoice: ${b.customerName} — $${b.income || 0}`,
  //       });
  //     }

  //     // Missed job (time in past, still confirmed)
  //     if (bd < now && status === 'confirmed') {
  //       newAlerts.push({
  //         id: `a-${b._id}-missed`,
  //         type: 'missed',
  //         level: 'danger',
  //         bookingId: b._id,
  //         text: `Missed booking: ${b.customerName} — ${bd.toLocaleString()}`,
  //       });
  //     }

  //     // Customer suggestion not acknowledged
  //     if (
  //       (b.customerSuggestedBookingDate || b.customerSuggestedServiceType) &&
  //       !b.customerSuggestedBookingAcknowledged
  //     ) {
  //       newAlerts.push({
  //         id: `a-${b._id}-customer_request`,
  //         type: 'customerRequest',
  //         level: 'info',
  //         bookingId: b._id,
  //         text: `Customer request: ${b.customerName} — ${
  //           b.customerSuggestedServiceType || ''
  //         } ${
  //           b.customerSuggestedBookingDate
  //             ? `on ${new Date(b.customerSuggestedBookingDate).toLocaleDateString()}`
  //             : ''
  //         }`,
  //       });
  //     }
  //   });

  //   setAlerts(newAlerts);
  // };

  // Generic updater used by alert actions + table actions
  const updateBooking = async (bookingId, patch) => {
    const current = bookings.find((b) => b._id === bookingId);
    if (!current) return;

    const merged = {
      ...current,
      ...patch,
      tasks: { ...(current.tasks || {}), ...(patch.tasks || {}) },
    };

    // Optional: normalize status in patch to lower-case
    if (merged.status) {
      merged.status = normalizeStatus(merged.status);
    }

    await fetch(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(merged),
    });

    const updatedList = bookings.map((b) =>
      b._id === bookingId ? merged : b
    );
    setBookings(updatedList);
    computeAlerts(updatedList);
  };

  // Alert-specific quick actions
  const handleAlertAction = (alert) => {
    switch (alert.type) {
      case 'unpaid':
        return updateBooking(alert.bookingId, {
          status: 'paid',
          tasks: { paid: true },
        });
      case 'needsInvoice':
        return updateBooking(alert.bookingId, {
          status: 'invoiced',
          tasks: { invoiced: true },
        });
      case 'customerRequest':
        return updateBooking(alert.bookingId, {
          customerSuggestedBookingAcknowledged: true,
        });
      case 'missed':
        // Example: mark as "done" to clear from queue
        return updateBooking(alert.bookingId, {
          status: 'done',
        });
      case 'upcoming':
        // Example: confirm job if not already confirmed
        return updateBooking(alert.bookingId, {
          status: 'confirmed',
          tasks: { confirmed: true },
        });
      default:
        return;
    }
  };

  // const alertBookingIds = useMemo(
  //   () => new Set(alerts.map((a) => a.bookingId)),
  //   [alerts]
  // );
  const alertBookingIds = useMemo(
    () => new Set(alerts.map((g) => g.bookingId)),
    [alerts]
  );

  const metrics = useMemo(() => {
    const now = new Date();
    const upcomingWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcoming = bookings.filter((b) => {
      const d = new Date(b.date);
      return d >= now && d <= upcomingWeek;
    }).length;

    const incomeWeek = bookings
      .filter((b) => {
        const d = new Date(b.date);
        return d >= now && d <= upcomingWeek;
      })
      .reduce((s, b) => s + (b.income || 0), 0);

    const unpaid = bookings.filter(
      (b) =>
        normalizeStatus(b.status) === 'completed' && !(b.tasks || {}).paid
    ).length;

    return { upcoming, incomeWeek, unpaid };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings
      .filter((b) => {
        const status = normalizeStatus(b.status);
        return !filters.status || status === filters.status;
      })
      .filter((b) => {
        if (!filters.search) return true;
        return b.customerName
          ?.toLowerCase()
          .includes(filters.search.toLowerCase());
      })
      .filter((b) => !showOnlyAlerted || alertBookingIds.has(b._id))
      .sort((a, z) => new Date(a.date) - new Date(z.date));
  }, [bookings, filters, showOnlyAlerted, alertBookingIds]);

  const incomeByDay = useMemo(() => {
    const agg = bookings.reduce((acc, b) => {
      const day = new Date(b.date).toLocaleDateString();
      acc[day] = (acc[day] || 0) + (b.income || 0);
      return acc;
    }, {});
    return Object.keys(agg).map((day) => ({ day, income: agg[day] }));
  }, [bookings]);

  const alertCountsByType = useMemo(() => {
    return alerts.reduce(
      (acc, a) => {
        acc[a.type] = (acc[a.type] || 0) + 1;
        return acc;
      },
      /** @type {Record<string, number>} */({})
    );
  }, [alerts]);

  const totalAlertPages = Math.ceil(alerts.length / alertsPerPage) || 1;
  const startIndex = (alertPage - 1) * alertsPerPage;
  const endIndex = startIndex + alertsPerPage;
  const pagedAlerts = alerts.slice(startIndex, endIndex);


  const statusBadgeVariant = (status) => {
    const s = normalizeStatus(status);
    if (s === 'confirmed' || s === 'in progress') return 'info';
    if (s === 'completed' || s === 'done') return 'success';
    if (s === 'paid') return 'success';
    if (s === 'cancelled') return 'danger';
    if (s === 'invoiced') return 'warning';
    return 'secondary';
  };

  const capitalize = (str = '') =>
    str.charAt(0).toUpperCase() + str.slice(1);

  const handleIssueAction = (bookingId, issueType) => {
    switch (issueType) {
      case 'unpaid':
        return updateBooking(bookingId, {
          status: 'paid',
          tasks: { paid: true },
        });
      case 'needsInvoice':
        return updateBooking(bookingId, {
          status: 'invoiced',
          tasks: { invoiced: true },
        });
      case 'customerRequest':
        return updateBooking(bookingId, {
          customerSuggestedBookingAcknowledged: true,
        });
      case 'missed':
        return updateBooking(bookingId, { status: 'done' });
      case 'upcoming':
        return updateBooking(bookingId, {
          status: 'confirmed',
          tasks: { confirmed: true },
        });
      default:
        return;
    }
  };

  const resolveAllIssuesForBooking = (group) => {
    // naive: run them sequentially; you can improve later if you want
    group.issues.forEach((issue) =>
      handleIssueAction(group.bookingId, issue.type)
    );
  };


  return (
    <Container fluid className="py-4">
      {/* KPI Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="shadow-sm p-3">
            <h6>Upcoming (7d)</h6>
            <h3>{metrics.upcoming}</h3>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm p-3">
            <h6>Projected Income (7d)</h6>
            <h3>${metrics.incomeWeek}</h3>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm p-3">
            <h6>Completed but Unpaid</h6>
            <h3>{metrics.unpaid}</h3>
          </Card>
        </Col>
      </Row>

      {alerts.length > 0 && (
        <Card className="shadow-sm mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <div>
              <strong>⚡ Action Center</strong> — {alerts.length} booking
              {alerts.length > 1 ? 's' : ''} need attention
            </div>
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={() => setShowActionCenter((open) => !open)}
            >
              {showActionCenter ? 'Hide' : 'Show'}
            </Button>
          </Card.Header>
          {showActionCenter && (
            <Card.Body>
              {pagedAlerts.map((group) => {
                const levelsRank = { danger: 3, warning: 2, info: 1 };
                const worstIssue =
                  group.issues.reduce(
                    (worst, issue) =>
                      !worst || levelsRank[issue.level] > levelsRank[worst.level]
                        ? issue
                        : worst,
                    null
                  ) || group.issues[0];

                return (
                  <div
                    key={group.bookingId}
                    className="py-2 border-bottom small d-flex flex-column flex-md-row justify-content-between"
                  >
                    <button
                      type="button"
                      onClick={() => setHighlightBookingId(group.bookingId)}
                      className="btn btn-link p-0 text-start flex-grow-1"
                      style={{ textDecoration: 'none' }}
                    >
                      <Badge
                        bg={
                          worstIssue.level === 'danger'
                            ? 'danger'
                            : worstIssue.level === 'warning'
                              ? 'warning'
                              : 'info'
                        }
                        className="me-2"
                      >
                        {group.issues.length} issue
                        {group.issues.length > 1 ? 's' : ''}
                      </Badge>
                      {group.summary}
                      <div className="mt-1">
                        {group.issues.map((issue) => (
                          <Badge
                            key={issue.type}
                            bg="light"
                            text="dark"
                            className="me-1 mt-1"
                          >
                            {issue.text}
                          </Badge>
                        ))}
                      </div>
                    </button>

                    <div className="d-flex gap-1 mt-2 mt-md-0 ms-md-3">
                      <Button
                        size="sm"
                        variant="outline-success"
                        onClick={() => resolveAllIssuesForBooking(group)}
                      >
                        Resolve All
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => setHighlightBookingId(group.bookingId)}
                      >
                        Focus
                      </Button>
                    </div>
                  </div>
                );
              })}

              {/* Pagination controls */}
              {alerts.length > alertsPerPage && (
                <div className="d-flex justify-content-between align-items-center pt-2 mt-2 border-top">
                  <small className="text-muted">
                    Showing {startIndex + 1}–{Math.min(endIndex, alerts.length)} of {alerts.length}{' '}
                    bookings with alerts
                  </small>
                  <div className="d-flex gap-2">
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      disabled={alertPage === 1}
                      onClick={() => setAlertPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      disabled={alertPage === totalAlertPages}
                      onClick={() =>
                        setAlertPage((p) => Math.min(totalAlertPages, p + 1))
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          )}

          {/* {showActionCenter && (
            <Card.Body>
              {alerts.map((group) => {
                const levelsRank = { danger: 3, warning: 2, info: 1 };
                const worstIssue =
                  group.issues.reduce(
                    (worst, issue) =>
                      !worst || levelsRank[issue.level] > levelsRank[worst.level]
                        ? issue
                        : worst,
                    null
                  ) || group.issues[0];

                return (
                  <div
                    key={group.bookingId}
                    className="py-2 border-bottom small d-flex flex-column flex-md-row justify-content-between"
                  >
                    <button
                      type="button"
                      onClick={() => setHighlightBookingId(group.bookingId)}
                      className="btn btn-link p-0 text-start flex-grow-1"
                      style={{ textDecoration: 'none' }}
                    >
                      <Badge
                        bg={
                          worstIssue.level === 'danger'
                            ? 'danger'
                            : worstIssue.level === 'warning'
                              ? 'warning'
                              : 'info'
                        }
                        className="me-2"
                      >
                        {group.issues.length} issue
                        {group.issues.length > 1 ? 's' : ''}
                      </Badge>
                      {group.summary}
                      <div className="mt-1">
                        {group.issues.map((issue) => (
                          <Badge
                            key={issue.type}
                            bg="light"
                            text="dark"
                            className="me-1 mt-1"
                          >
                            {issue.text}
                          </Badge>
                        ))}
                      </div>
                    </button>

                    <div className="d-flex gap-1 mt-2 mt-md-0 ms-md-3">
                      <Button
                        size="sm"
                        variant="outline-success"
                        onClick={() => resolveAllIssuesForBooking(group)}
                      >
                        Resolve All
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => setHighlightBookingId(group.bookingId)}
                      >
                        Focus
                      </Button>
                    </div>
                  </div>
                );
              })}
            </Card.Body>
          )} */}
        </Card>
      )}

      <Row>
        <Col>
          <h4>Booking Calendar</h4>
          <BookingCalendar
            bookings={bookings}
            customers={customers}
            fetchBookings={fetchBookings}
          />
        </Col>
      </Row>


      {/* Filters */}
      <Row className="mb-3 align-items-center">
        <Col md={3}>
          <Form.Select
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value })
            }
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="invoiced">Invoiced</option>
            <option value="paid">Paid</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </Form.Select>
        </Col>
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Search by customer"
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value })
            }
          />
        </Col>
        <Col md={3} className="mt-2 mt-md-0">
          <Form.Check
            type="switch"
            id="show-only-alerted"
            label="Only show bookings with alerts"
            checked={showOnlyAlerted}
            onChange={(e) => setShowOnlyAlerted(e.target.checked)}
          />
        </Col>
      </Row>

      {/* Bookings Table as an action queue */}
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Bookings Action Queue</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover responsive className="mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Income</th>
                    <th>Status</th>
                    <th>Flags</th>
                    <th>Quick Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b) => {
                    const status = normalizeStatus(b.status);
                    const tasks = b.tasks || {};
                    const hasAlert = alertBookingIds.has(b._id);
                    const isHighlighted = b._id === highlightBookingId;

                    return (
                      <tr
                        key={b._id}
                        className={
                          (hasAlert ? 'table-warning ' : '') +
                          (isHighlighted ? 'table-primary' : '')
                        }
                      >
                        <td>#{shortId(b._id)}</td>
                        <td>{b.customerName}</td>
                        <td>{b.serviceType}</td>
                        <td>{new Date(b.date).toLocaleString()}</td>
                        <td>${b.income || 0}</td>
                        <td>
                          <Badge bg={statusBadgeVariant(status)}>
                            {capitalize(status)}
                          </Badge>
                        </td>
                        <td className="small">
                          {tasks.invoiced ? (
                            <Badge bg="warning" className="me-1">
                              Invoiced
                            </Badge>
                          ) : (
                            <Badge bg="light" text="dark" className="me-1">
                              No Invoice
                            </Badge>
                          )}
                          {tasks.paid ? (
                            <Badge bg="success" className="me-1">
                              Paid
                            </Badge>
                          ) : (
                            <Badge bg="light" text="dark" className="me-1">
                              Unpaid
                            </Badge>
                          )}
                          {(b.customerSuggestedBookingDate ||
                            b.customerSuggestedServiceType) &&
                            !b.customerSuggestedBookingAcknowledged && (
                              <Badge bg="info" className="me-1">
                                Customer Request
                              </Badge>
                            )}
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {!tasks.invoiced && (
                              <Button
                                size="sm"
                                variant="outline-warning"
                                onClick={() =>
                                  updateBooking(b._id, {
                                    status: 'invoiced',
                                    tasks: { invoiced: true },
                                  })
                                }
                              >
                                Mark Invoiced
                              </Button>
                            )}
                            {!tasks.paid && status === 'completed' && (
                              <Button
                                size="sm"
                                variant="outline-success"
                                onClick={() =>
                                  updateBooking(b._id, {
                                    status: 'paid',
                                    tasks: { paid: true },
                                  })
                                }
                              >
                                Mark Paid
                              </Button>
                            )}
                            {(b.customerSuggestedBookingDate ||
                              b.customerSuggestedServiceType) &&
                              !b.customerSuggestedBookingAcknowledged && (
                                <Button
                                  size="sm"
                                  variant="outline-info"
                                  onClick={() =>
                                    updateBooking(b._id, {
                                      customerSuggestedBookingAcknowledged: true,
                                    })
                                  }
                                >
                                  Ack Request
                                </Button>
                              )}
                            {status === 'confirmed' &&
                              new Date(b.date) < new Date() && (
                                <Button
                                  size="sm"
                                  variant="outline-secondary"
                                  onClick={() =>
                                    updateBooking(b._id, { status: 'done' })
                                  }
                                >
                                  Mark Done
                                </Button>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredBookings.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-4">
                        No bookings found with current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Chart Section */}
      <Row className="mt-4">
        <Col>
          <Card className="shadow-sm p-3">
            <h5>Income by Day</h5>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={incomeByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="income" fill="#007bff" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
