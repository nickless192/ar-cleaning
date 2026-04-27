import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { authFetch } from '/src/utils/authFetch';

const TORONTO_TZ = 'America/Toronto';

const formatTorontoDateTime = (value) => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TORONTO_TZ,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

const statusVariant = {
  not_started: 'secondary',
  checked_in: 'primary',
  checked_out: 'success',
  needs_review: 'warning',
};

function EmployeeAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingId, setPendingId] = useState('');
  const [notesByBooking, setNotesByBooking] = useState({});

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [todayRes, allRes] = await Promise.all([
        authFetch('/api/employee/appointments/today'),
        authFetch('/api/employee/appointments'),
      ]);

      if (!todayRes.ok || !allRes.ok) {
        throw new Error('Could not load appointments. Please retry.');
      }

      const todayPayload = await todayRes.json();
      const allPayload = await allRes.json();

      const map = new Map();
      for (const item of todayPayload.appointments || []) {
        map.set(item._id, item);
      }
      for (const item of allPayload.appointments || []) {
        if (!map.has(item._id)) map.set(item._id, item);
      }

      setAppointments(Array.from(map.values()));
    } catch (err) {
      setError(err.message || 'Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const getLocation = () =>
    new Promise((resolve) => {
      if (!navigator?.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        () => resolve(null),
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 0 }
      );
    });

  const submitCheckIn = async (bookingId) => {
    const confirmed = window.confirm('Confirm you are checking in for this appointment?');
    if (!confirmed) return;

    setPendingId(bookingId);
    setError('');

    try {
      const location = await getLocation();
      const res = await authFetch(`/api/bookings/${bookingId}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, source: 'mobile', devicePlatform: navigator?.platform || '' }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.message || 'Check-in failed. Please retry.');
      }

      await fetchAppointments();
    } catch (err) {
      setError(err.message || 'Check-in failed.');
    } finally {
      setPendingId('');
    }
  };

  const submitCheckOut = async (bookingId) => {
    setPendingId(bookingId);
    setError('');

    try {
      const location = await getLocation();
      const res = await authFetch(`/api/bookings/${bookingId}/check-out`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location,
          source: 'mobile',
          devicePlatform: navigator?.platform || '',
          employeeNotes: notesByBooking[bookingId] || {},
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.message || 'Check-out failed. Please retry.');
      }

      await fetchAppointments();
    } catch (err) {
      setError(err.message || 'Check-out failed.');
    } finally {
      setPendingId('');
    }
  };

  const emptyState = useMemo(
    () => !loading && appointments.length === 0,
    [loading, appointments.length]
  );

  return (
    <Container className="py-3">
      <h3 className="mb-3">My Appointments</h3>
      <p className="text-muted small mb-3">
        Location is only captured when you check in or check out, if permission is granted.
      </p>

      {error && <Alert variant="danger">{error}</Alert>}
      {!navigator.onLine && <Alert variant="warning">You appear to be offline. Please reconnect and retry.</Alert>}

      {loading ? (
        <div className="text-center py-4"><Spinner animation="border" /></div>
      ) : null}

      {emptyState ? <Alert variant="info">No assigned appointments found.</Alert> : null}

      <Row className="g-3">
        {appointments.map((appointment) => {
          const status = appointment?.timeEntry?.status || 'not_started';
          const canCheckIn = status === 'not_started';
          const canCheckOut = status === 'checked_in';

          return (
            <Col xs={12} key={appointment._id}>
              <Card className="shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div className="fw-bold">{appointment.customerName || 'Client'}</div>
                      <div className="text-muted small">{appointment.serviceAddress || 'Address pending'}</div>
                    </div>
                    <Badge bg={statusVariant[status] || 'secondary'}>{status.replace('_', ' ')}</Badge>
                  </div>

                  <div className="small mb-2">Date/Time (Toronto): {formatTorontoDateTime(appointment.date)}</div>
                  <div className="small mb-2">Service: {appointment.serviceSummary || 'Service'}</div>

                  <Form.Group className="mb-2">
                    <Form.Label className="small mb-1">Notes (optional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Work completed, issues, supplies, access, extra time…"
                      value={notesByBooking[appointment._id]?.general || ''}
                      onChange={(e) =>
                        setNotesByBooking((prev) => ({
                          ...prev,
                          [appointment._id]: {
                            ...prev[appointment._id],
                            general: e.target.value,
                          },
                        }))
                      }
                    />
                  </Form.Group>

                  <div className="d-flex gap-2">
                    <Button
                      variant="primary"
                      disabled={!canCheckIn || pendingId === appointment._id}
                      onClick={() => submitCheckIn(appointment._id)}
                    >
                      {pendingId === appointment._id ? 'Saving…' : 'Check In'}
                    </Button>
                    <Button
                      variant="success"
                      disabled={!canCheckOut || pendingId === appointment._id}
                      onClick={() => submitCheckOut(appointment._id)}
                    >
                      {pendingId === appointment._id ? 'Saving…' : 'Check Out'}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
}

export default EmployeeAppointmentsPage;
