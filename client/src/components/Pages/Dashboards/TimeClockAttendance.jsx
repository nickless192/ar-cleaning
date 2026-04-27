import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Form, Row, Col, Table } from 'react-bootstrap';
import { authFetch } from '/src/utils/authFetch';

const formatToronto = (value) => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

const statusColor = {
  checked_in: 'primary',
  checked_out: 'secondary',
  approved: 'success',
  adjusted: 'warning',
  disputed: 'danger',
};

function TimeClockAttendance() {
  const [entries, setEntries] = useState([]);
  const [currentlyCheckedIn, setCurrentlyCheckedIn] = useState([]);
  const [payrollSummary, setPayrollSummary] = useState([]);
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', status: '' });
  const [error, setError] = useState('');

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    if (filters.status) params.set('status', filters.status);
    return params.toString();
  }, [filters]);

  const fetchEntries = useCallback(async () => {
    setError('');
    try {
      const url = `/api/admin/time-entries${queryString ? `?${queryString}` : ''}`;
      const res = await authFetch(url);
      if (!res.ok) throw new Error('Failed to load time entries');
      const payload = await res.json();
      setEntries(payload.entries || []);
      setCurrentlyCheckedIn(payload.currentlyCheckedIn || []);
      setPayrollSummary(payload.payrollSummary || []);
    } catch (err) {
      setError(err.message || 'Unable to load attendance data.');
    }
  }, [queryString]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const approveEntry = async (entryId) => {
    const res = await authFetch(`/api/admin/time-entries/${entryId}/approve`, { method: 'POST' });
    if (res.ok) fetchEntries();
  };

  const editEntry = async (entryId, entry) => {
    const reason = window.prompt('Required: reason for this correction');
    if (!reason) return;

    const checkInAt = window.prompt('Check-in UTC ISO (leave blank to keep)', entry.checkInAt ? new Date(entry.checkInAt).toISOString() : '');
    const checkOutAt = window.prompt('Check-out UTC ISO (leave blank to keep)', entry.checkOutAt ? new Date(entry.checkOutAt).toISOString() : '');

    const res = await authFetch(`/api/admin/time-entries/${entryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, checkInAt, checkOutAt }),
    });

    if (res.ok) {
      fetchEntries();
      return;
    }

    const payload = await res.json().catch(() => ({}));
    setError(payload.message || 'Failed to update time entry');
  };

  const exportCsv = async () => {
    try {
      const res = await authFetch('/api/admin/time-entries/export');
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'time-entries-approved.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'Export failed');
    }
  };

  return (
    <div>
      <Card className="mb-3">
        <Card.Body>
          <h5 className="mb-3">Time Clock / Attendance</h5>
          {error && <Alert variant="danger">{error}</Alert>}

          <Row className="g-2 mb-3">
            <Col md={3}><Form.Control type="date" value={filters.dateFrom} onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))} /></Col>
            <Col md={3}><Form.Control type="date" value={filters.dateTo} onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))} /></Col>
            <Col md={3}>
              <Form.Select value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
                <option value="">All statuses</option>
                <option value="checked_in">checked_in</option>
                <option value="checked_out">checked_out</option>
                <option value="adjusted">adjusted</option>
                <option value="approved">approved</option>
                <option value="disputed">disputed</option>
              </Form.Select>
            </Col>
            <Col md={3} className="d-flex gap-2">
              <Button onClick={fetchEntries}>Apply</Button>
              <Button variant="outline-secondary" onClick={exportCsv}>Export CSV</Button>
            </Col>
          </Row>

          <div className="mb-3">
            <div className="fw-semibold">Currently checked in</div>
            {currentlyCheckedIn.length === 0 ? (
              <div className="text-muted small">No one is currently checked in.</div>
            ) : (
              currentlyCheckedIn.map((entry) => (
                <div key={entry._id} className="small">
                  {(entry.employeeId?.firstName || 'Employee')} {(entry.employeeId?.lastName || '')} — since {formatToronto(entry.checkInAt)}
                </div>
              ))
            )}
          </div>

          <Table responsive hover size="sm">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Client</th>
                <th>Check In (Toronto)</th>
                <th>Check Out (Toronto)</th>
                <th>Minutes</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry._id}>
                  <td>{entry.employeeId?.firstName} {entry.employeeId?.lastName}</td>
                  <td>{entry.bookingId?.customerName}</td>
                  <td>{formatToronto(entry.checkInAt)}</td>
                  <td>{formatToronto(entry.checkOutAt)}</td>
                  <td>{entry.totalMinutes || 0}</td>
                  <td><Badge bg={statusColor[entry.status] || 'secondary'}>{entry.status}</Badge></td>
                  <td className="d-flex gap-1">
                    <Button size="sm" variant="outline-success" onClick={() => approveEntry(entry._id)} disabled={entry.status === 'approved'}>Approve</Button>
                    <Button size="sm" variant="outline-primary" onClick={() => editEntry(entry._id, entry)}>Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div>
            <div className="fw-semibold mb-2">Approved payroll totals</div>
            {payrollSummary.length === 0 ? (
              <div className="text-muted small">No approved entries in selected range.</div>
            ) : (
              payrollSummary.map((row) => (
                <div key={row.employeeId} className="small">
                  {row.employeeName || row.employeeId}: {row.totalHours} hours ({row.totalMinutes} minutes)
                </div>
              ))
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default TimeClockAttendance;
