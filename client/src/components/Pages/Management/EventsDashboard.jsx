import React, { useEffect, useMemo, useState } from "react";
import { Row, Col, Card, Spinner, Badge, Button, Form, Collapse, Table } from "react-bootstrap";
import { FaBolt, FaCalendarDay, FaMousePointer, FaPaperPlane } from "react-icons/fa";

/**
 * EventsDashboard.jsx
 * Focused view for log.events (name/label/page/ts), separate from the long analytics dashboard.
 *
 * Backend expectations:
 * - GET /api/visitors/logs?start=YYYY-MM-DD&end=YYYY-MM-DD&excludeBots=true&limit=200&pageNum=1&sort=desc
 *   Returns: { items: [...], total, totalPages }
 *
 * - POST /api/admin-reports/send-daily-events  (manual send test)
 */

const clampNum = (n, fallback = 0) => {
  const x = Number(n);
  return Number.isFinite(x) ? x : fallback;
};

const safeArr = (x) => (Array.isArray(x) ? x : []);

const uniq = (arr) => [...new Set((arr || []).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));

const getDayKey = (dateLike) => {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "invalid";
  return d.toISOString().slice(0, 10);
};

const topN = (mapObj, n = 10, keyName = "key") =>
  Object.entries(mapObj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k, v]) => ({ [keyName]: k, count: v }));

const buildCountMap = (items, getter) => {
  const m = {};
  items.forEach((it) => {
    const v = getter(it);
    if (!v) return;
    m[v] = (m[v] || 0) + 1;
  });
  return m;
};

// Simple inline bar chart (no libs)
const MiniBars = ({ values }) => {
  const max = Math.max(...values, 1);
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 110 }}>
      {values.map((v, i) => (
        <div
          key={i}
          title={String(v)}
          style={{
            width: 14,
            height: `${(v / max) * 100}%`,
            background: "rgba(13,110,253,0.75)",
            borderRadius: 6,
          }}
        />
      ))}
    </div>
  );
}

const ListWithBadges = ({ title, items, keyField, labelField }) => {
  const safe = safeArr(items);

  return (
    <Card className="h-100">
      <Card.Body>
        <Card.Title className="mb-3">{title}</Card.Title>
        {safe.length ? (
          <ul className="list-unstyled mb-0">
            {safe.map((it, idx) => (
              <li
                key={it[keyField] ?? it[labelField] ?? idx}
                className="d-flex justify-content-between align-items-center mb-2"
              >
                <span className="text-truncate" style={{ maxWidth: "75%" }}>
                  {String(it[labelField] ?? "unknown")}
                </span>
                <Badge bg="light" text="dark">
                  {it.count ?? 0}
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-muted">No data</div>
        )}
      </Card.Body>
    </Card>
  );
}

const EventsTable = ({ events }) => {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <div className="table-responsive">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Event</th>
            <th>Label</th>
            <th>Page</th>
            <th>When</th>
            <th>Session</th>
            <th>Visitor</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {events.length ? (
            events.map((e, idx) => (
              <React.Fragment key={`${e._eventId || idx}`}>
                <tr>
                  <td>{idx + 1}</td>
                  <td>
                    <Badge bg="primary">{e.name || "unknown"}</Badge>
                  </td>
                  <td>{e.label ? <Badge bg="secondary">{e.label}</Badge> : <span className="text-muted">—</span>}</td>
                  <td className="text-truncate" style={{ maxWidth: 220 }}>
                    {e.page || <span className="text-muted">—</span>}
                  </td>
                  <td>{e.ts ? new Date(e.ts).toLocaleString() : <span className="text-muted">—</span>}</td>
                  <td className="text-truncate" style={{ maxWidth: 170 }}>
                    {e.sessionId || <span className="text-muted">—</span>}
                  </td>
                  <td className="text-truncate" style={{ maxWidth: 170 }}>
                    {e.visitorId || <span className="text-muted">—</span>}
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-info"
                      onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                      aria-expanded={openIdx === idx}
                    >
                      {openIdx === idx ? "Hide" : "View"}
                    </Button>
                  </td>
                </tr>

                <tr>
                  <td colSpan={8} className="p-0">
                    <Collapse in={openIdx === idx}>
                      <div className="p-3 bg-light">
                        <Row className="g-3">
                          <Col md={6}>
                            <h6 className="mb-2">Session Context</h6>
                            <div><b>Exit page:</b> {e.exitPage || "—"}</div>
                            <div><b>Duration:</b> {clampNum(e.sessionDuration, 0)}s</div>
                            <div><b>Scroll depth:</b> {clampNum(e.scrollDepth, 0)}%</div>
                            <div><b>Qualified:</b> {e.qualified ? "Yes" : "No"}</div>
                            {safeArr(e.qualifiedReason).length ? (
                              <div className="mt-2">
                                <b>Qualified reason(s):</b>
                                <ul className="mb-0">
                                  {e.qualifiedReason.map((r, i) => <li key={i}>{r}</li>)}
                                </ul>
                              </div>
                            ) : null}
                          </Col>

                          <Col md={6}>
                            <h6 className="mb-2">Device & Geo</h6>
                            <div><b>Device:</b> {e.deviceType || "—"}</div>
                            <div><b>Browser / OS:</b> {e.browser || "—"} / {e.os || "—"}</div>
                            <div>
                              <b>Geo:</b>{" "}
                              {e.geo?.city || "Unknown"}, {e.geo?.region || "Unknown"}, {e.geo?.country || "Unknown"}
                            </div>
                            <div className="mt-2">
                              <b>Referrer:</b>{" "}
                              {e.referrer ? (
                                <a href={e.referrer} target="_blank" rel="noreferrer noopener">
                                  {e.referrer}
                                </a>
                              ) : (
                                <span className="text-muted">Direct</span>
                              )}
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </Collapse>
                  </td>
                </tr>
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="text-center text-muted">
                No events found for this date range / filters.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}

const EventsDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // filters
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [excludeBots, setExcludeBots] = useState(true);
  const [pageFilter, setPageFilter] = useState("");
  const [eventNameFilter, setEventNameFilter] = useState("");
  const [labelFilter, setLabelFilter] = useState("");

  // manual send
  const [sendingReport, setSendingReport] = useState(false);
  const [reportStatus, setReportStatus] = useState(null);

  const pages = useMemo(() => uniq(logs.map((l) => l.page)), [logs]);

  // flatten events from logs
  const allEvents = useMemo(() => {
    const out = [];
    logs.forEach((l) => {
      safeArr(l.events).forEach((ev) => {
        out.push({
          _eventId: ev?._id || `${l.sessionId}-${ev?.name}-${ev?.ts}`,
          name: ev?.name,
          label: ev?.label,
          page: ev?.page || l.page,
          ts: ev?.ts,
          // session context fields
          sessionId: l.sessionId,
          visitorId: l.visitorId,
          exitPage: l.exitPage,
          sessionDuration: l.sessionDuration,
          scrollDepth: l.scrollDepth,
          qualified: l.qualified,
          qualifiedReason: l.qualifiedReason,
          deviceType: l.deviceType,
          browser: l.browser,
          os: l.os,
          geo: l.geo,
          referrer: l.referrer,
          isBot: l.isBot,
        });
      });
    });
    // newest first
    out.sort((a, b) => new Date(b.ts || 0) - new Date(a.ts || 0));
    return out;
  }, [logs]);

  // apply event-level filters
  const filteredEvents = useMemo(() => {
    let evs = [...allEvents];

    if (excludeBots) evs = evs.filter((e) => !e.isBot);

    if (pageFilter) evs = evs.filter((e) => (e.page || "") === pageFilter);
    if (eventNameFilter) evs = evs.filter((e) => (e.name || "") === eventNameFilter);
    if (labelFilter) evs = evs.filter((e) => (e.label || "") === labelFilter);

    return evs;
  }, [allEvents, excludeBots, pageFilter, eventNameFilter, labelFilter]);

  const eventNames = useMemo(() => uniq(allEvents.map((e) => e.name)), [allEvents]);
  const labels = useMemo(() => uniq(allEvents.map((e) => e.label)), [allEvents]);

  // top lists
  const topEventNames = useMemo(() => topN(buildCountMap(filteredEvents, (e) => e.name), 10, "name"), [filteredEvents]);
  const topPages = useMemo(() => topN(buildCountMap(filteredEvents, (e) => e.page), 10, "page"), [filteredEvents]);
  const topLabels = useMemo(() => topN(buildCountMap(filteredEvents, (e) => e.label), 10, "label"), [filteredEvents]);

  // trend by day
  const trend = useMemo(() => {
    const map = {};
    filteredEvents.forEach((e) => {
      const day = getDayKey(e.ts);
      if (day === "invalid") return;
      map[day] = (map[day] || 0) + 1;
    });

    const days = Object.keys(map).sort();
    const labels = days.map((d) => d.slice(5)); // MM-DD
    const values = days.map((d) => map[d]);

    return { labels, values };
  }, [filteredEvents]);

  const sendTestEventsReport = async () => {
    setSendingReport(true);
    setReportStatus(null);

    try {
      const res = await fetch("/api/admin-reports/send-daily-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data?.error || "Failed to send report");

      setReportStatus({ type: "success", message: `Report sent successfully (${data.date})` });
    } catch (err) {
      setReportStatus({ type: "error", message: err.message || "Error sending report" });
    } finally {
      setSendingReport(false);
    }
  };

  // init default date range (last 7 days)
  useEffect(() => {
    const now = new Date();
    const end = now.toISOString().slice(0, 10);
    const start = new Date(now.getTime() - 6 * 86400000).toISOString().slice(0, 10);
    setDateRange({ start, end });
  }, []);

  // fetch logs for date range (limit 200)
  useEffect(() => {
    if (!dateRange.start || !dateRange.end) return;

    let cancelled = false;

    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("start", dateRange.start);
        params.set("end", dateRange.end);
        params.set("limit", "200");
        params.set("pageNum", "1");
        params.set("sort", "desc");
        // IMPORTANT: include bots in raw fetch; we filter at event-level
        params.set("excludeBots", "false");

        const res = await fetch(`/api/visitors/logs?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch logs");

        const data = await res.json();
        if (cancelled) return;

        setLogs(safeArr(data.items));
      } catch (e) {
        if (!cancelled) console.error(e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchLogs();
    return () => {
      cancelled = true;
    };
  }, [dateRange.start, dateRange.end]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: 320 }}>
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h2 className="mb-0 d-flex align-items-center gap-2">
            <FaBolt /> Events Dashboard
          </h2>
          <div className="text-muted small">
            Showing <b>{filteredEvents.length}</b> events from <b>{safeArr(logs).length}</b> sessions.
          </div>
        </div>

        <div className="d-flex gap-2 align-items-center flex-wrap">
          <Button
            variant="outline-primary"
            size="sm"
            disabled={sendingReport}
            onClick={sendTestEventsReport}
          >
            <FaPaperPlane className="me-2" />
            {sendingReport ? "Sending…" : "Send Daily Events Report"}
          </Button>
        </div>
      </div>

      {reportStatus ? (
        <div className={`mb-3 small ${reportStatus.type === "success" ? "text-success" : "text-danger"}`}>
          {reportStatus.message}
        </div>
      ) : null}

      {/* Filters */}
      <Card className="mb-3">
        <Card.Body>
          <Card.Title className="mb-3">Filters</Card.Title>
          <Row className="g-3">
            <Col lg={3} md={6}>
              <Form.Label>Start date</Form.Label>
              <Form.Control
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange((p) => ({ ...p, start: e.target.value }))}
              />
            </Col>

            <Col lg={3} md={6}>
              <Form.Label>End date</Form.Label>
              <Form.Control
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange((p) => ({ ...p, end: e.target.value }))}
              />
            </Col>

            <Col lg={3} md={6} className="d-flex align-items-end">
              <div className="w-100">
                <Form.Check
                  type="switch"
                  id="excludeBots"
                  label="Exclude bots"
                  checked={excludeBots}
                  onChange={(e) => setExcludeBots(e.target.checked)}
                />
              </div>
            </Col>

            <Col lg={3} md={6}>
              <Form.Label>Page</Form.Label>
              <Form.Select value={pageFilter} onChange={(e) => setPageFilter(e.target.value)}>
                <option value="">All</option>
                {pages.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col lg={4} md={6}>
              <Form.Label>Event name</Form.Label>
              <Form.Select value={eventNameFilter} onChange={(e) => setEventNameFilter(e.target.value)}>
                <option value="">All</option>
                {eventNames.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col lg={4} md={6}>
              <Form.Label>Label</Form.Label>
              <Form.Select value={labelFilter} onChange={(e) => setLabelFilter(e.target.value)}>
                <option value="">All</option>
                {labels.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col lg={4} md={12} className="d-flex align-items-end">
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={() => {
                  setPageFilter("");
                  setEventNameFilter("");
                  setLabelFilter("");
                }}
              >
                Reset event filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Top lists + Trend */}
      <Row className="g-3 mb-3">
        <Col lg={4} md={6}>
          <ListWithBadges title="Top Event Names" items={topEventNames} keyField="name" labelField="name" />
        </Col>
        <Col lg={4} md={6}>
          <ListWithBadges title="Top Pages" items={topPages} keyField="page" labelField="page" />
        </Col>
        <Col lg={4} md={12}>
          <ListWithBadges title="Top Labels" items={topLabels} keyField="label" labelField="label" />
        </Col>
      </Row>

      <Card className="mb-3">
        <Card.Body className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <Card.Title className="mb-0 d-flex align-items-center gap-2">
              <FaCalendarDay /> Events trend
            </Card.Title>
            <div className="text-muted small">Events per day for the selected range & filters.</div>
          </div>
          <div className="text-muted small">
            Total events: <b>{filteredEvents.length}</b>
          </div>
        </Card.Body>
        <Card.Body>
          {trend.values.length ? (
            <>
              <MiniBars values={trend.values} />
              <div className="d-flex flex-wrap gap-2 mt-3">
                {trend.labels.map((l, i) => (
                  <span key={i} className="badge bg-light text-dark">
                    {l}: {trend.values[i]}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="text-muted">No trend data.</div>
          )}
        </Card.Body>
      </Card>

      {/* Events table */}
      <Card className="mb-3">
        <Card.Body>
          <Card.Title className="mb-3 d-flex align-items-center gap-2">
            <FaMousePointer /> Events
          </Card.Title>
          <EventsTable events={filteredEvents} />
        </Card.Body>
      </Card>
    </div>
  );
}

export default EventsDashboard;
