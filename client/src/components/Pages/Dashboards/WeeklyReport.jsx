// src/components/Pages/Management/WeeklyReport.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Card, Row, Col, Spinner, Badge, Form } from "react-bootstrap";
import { formatDuration, pct } from "../../../utils/reportUtils";

const List = ({ title, items }) => (
  <Card className="h-100">
    <Card.Body>
      <Card.Title className="mb-3">{title}</Card.Title>
      {items?.length ? (
        <ul className="list-unstyled mb-0">
          {items.map((x) => (
            <li
              key={x._id ?? x.day}
              className="d-flex justify-content-between align-items-center mb-2"
            >
              <span className="text-truncate" style={{ maxWidth: "75%" }}>
                {String(x._id ?? x.day)}
              </span>
              <Badge bg="light" text="dark">
                {x.count ?? x.visits ?? x.qualified ?? "-"}
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

export default function WeeklyReport() {
  const [days, setDays] = useState(7);
  const [end, setEnd] = useState(new Date().toISOString().slice(0, 10));
  const [excludeBots, setExcludeBots] = useState(true);

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const qs = new URLSearchParams({
          days: String(days),
          end,
          excludeBots: String(excludeBots),
        });
        const res = await fetch(`/api/visitors/weekly-reporting?${qs.toString()}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch weekly report");
        setReport(await res.json());
      } catch (e) {
        console.error(e);
        setReport(null);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [days, end, excludeBots]);

  const headline = report?.headline;

  const engagementBuckets = useMemo(() => {
    const buckets = report?.engagementBuckets || [];
    return buckets.map((b) => ({
      label: typeof b._id === "number" ? String(b._id) : String(b._id),
      count: b.count || 0,
    }));
  }, [report]);

  // Always-visible top bar + conditional body
  let body = null;

  if (loading) {
    body = (
      <div className="d-flex justify-content-center align-items-center" style={{ height: 260 }}>
        <Spinner animation="border" />
      </div>
    );
  } else if (!report || !headline) {
    body = <div className="text-muted">No weekly report data.</div>;
  } else {
    body = (
      <>
        {/* Strategic headline KPIs */}
        <Row className="g-3 mb-3">
          <Col lg={3} md={6}>
            <Card className="h-100">
              <Card.Body className="text-center">
                <div className="text-muted small">Sessions</div>
                <h3 className="mb-0">{headline.totalSessions}</h3>
                <div className="small text-muted">
                  Humans: {headline.humanSessions} • Bots: {headline.botSessions}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6}>
            <Card className="h-100">
              <Card.Body className="text-center">
                <div className="text-muted small">Qualified</div>
                <h3 className="mb-0">{headline.qualifiedSessions}</h3>
                <div className="small text-muted">Rate: {pct(headline.qualifiedRate)}</div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6}>
            <Card className="h-100">
              <Card.Body className="text-center">
                <div className="text-muted small">Engagement</div>
                <h3 className="mb-0">{Number(headline.avgEngagementScore).toFixed(1)}</h3>
                <div className="small text-muted">
                  Avg scroll: {Number(headline.avgScrollDepth).toFixed(0)}%
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6}>
            <Card className="h-100">
              <Card.Body className="text-center">
                <div className="text-muted small">Retention & Bounce</div>
                <div className="d-flex justify-content-around mt-2">
                  <div>
                    <div className="small text-muted">New</div>
                    <h4 className="mb-0">{headline.newVisitors}</h4>
                  </div>
                  <div>
                    <div className="small text-muted">Returning</div>
                    <h4 className="mb-0">{headline.returningVisitors}</h4>
                  </div>
                </div>
                <div className="small text-muted mt-2">Bounce: {pct(headline.bounceRate)}</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Weekly strategic trend + distributions */}
        <Row className="g-3 mb-3">
          <Col lg={6}>
            <Card className="h-100">
              <Card.Body>
                <Card.Title>Daily Trend (within the week)</Card.Title>

                {report.dailyTrend?.length ? (
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {report.dailyTrend.map((d) => (
                      <span key={d.day} className="badge bg-light text-dark">
                        {d.day.slice(5)}: {d.visits} visits • {d.qualified} qualified •{" "}
                        {Number(d.avgEngagement).toFixed(1)} ES
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted">No trend data.</div>
                )}

                <hr />

                <div className="d-flex justify-content-between">
                  <div>
                    <div className="text-muted small">Avg Duration</div>
                    <b>{formatDuration(headline.avgSessionDuration)}</b>
                  </div>
                  <div>
                    <div className="text-muted small">Pages / Session</div>
                    <b>{Number(headline.avgPagesPerSession).toFixed(1)}</b>
                  </div>
                  <div>
                    <div className="text-muted small">Avg Interactions</div>
                    <b>{Number(headline.avgInteractions).toFixed(1)}</b>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6}>
            <Card className="h-100">
              <Card.Body>
                <Card.Title>Engagement Score Distribution</Card.Title>
                {engagementBuckets?.length ? (
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {engagementBuckets.map((b, i) => (
                      <span key={i} className="badge bg-light text-dark">
                        {String(b.label)}: {b.count}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted">No distribution data.</div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* UTM + Qualified effectiveness */}
        <Row className="g-3 mb-3">
          <Col lg={4} md={6}>
            <List title="Top UTM Campaigns (sessions)" items={report.topUtmCampaigns} />
          </Col>
          <Col lg={4} md={6}>
            <List title="Top Campaigns (qualified)" items={report.topCampaignsByQualified} />
          </Col>
          <Col lg={4} md={12}>
            <List title="Top Qualified Reasons" items={report.qualifiedReasons} />
          </Col>
        </Row>

        {/* Breakdown tables */}
        <Row className="g-3">
          <Col lg={4} md={6}>
            <List title="Top Countries" items={report.topCountries} />
          </Col>
          <Col lg={4} md={6}>
            <List title="Top Traffic Sources" items={report.topTrafficSources} />
          </Col>
          <Col lg={4} md={12}>
            <List title="Top Segments" items={report.topSegments} />
          </Col>

          <Col lg={4} md={6}>
            <List title="Top Pages" items={report.topPages} />
          </Col>
          <Col lg={4} md={6}>
            <List title="Top Exit Pages" items={report.topExitPages} />
          </Col>
          <Col lg={4} md={12}>
            <List title="Top Referrers" items={report.topReferrers} />
          </Col>
        </Row>
      </>
    );
  }

  return (
    <div className="pb-3">
      {/* Always visible filter bar */}
      <Card className="mb-3">
        <Card.Body className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <Card.Title className="mb-0">Weekly Report</Card.Title>
            <div className="text-muted small">
              {report?.range?.start?.slice(0, 10) ?? "—"} → {report?.range?.end?.slice(0, 10) ?? "—"} (
              {report?.days ?? days} days)
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2 align-items-end">
            <Form.Group>
              <Form.Label className="small mb-1">End</Form.Label>
              <Form.Control type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </Form.Group>

            <Form.Group>
              <Form.Label className="small mb-1">Days</Form.Label>
              <Form.Select value={days} onChange={(e) => setDays(Number(e.target.value))}>
                {[7, 14, 21, 28].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Check
              type="switch"
              id="excludeBotsWeekly"
              label="Exclude bots"
              checked={excludeBots}
              onChange={(e) => setExcludeBots(e.target.checked)}
            />
          </div>
        </Card.Body>
      </Card>

      {body}
    </div>
  );
}
