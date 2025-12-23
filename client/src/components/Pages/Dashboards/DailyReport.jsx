// src/components/Pages/Management/DailyReport.jsx
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
              key={x._id}
              className="d-flex justify-content-between align-items-center mb-2"
            >
              <span className="text-truncate" style={{ maxWidth: "75%" }}>
                {String(x._id)}
              </span>
              <Badge bg="light" text="dark">
                {x.count}
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

export default function DailyReport() {
  const torontoToday = () =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Toronto",
    }).format(new Date());

  const [date, setDate] = useState(torontoToday());
  const [excludeBots, setExcludeBots] = useState(true);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const qs = new URLSearchParams({
          date,
          excludeBots: String(excludeBots),
        });
        const res = await fetch(`/api/visitors/daily-report?${qs.toString()}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch daily report");
        setReport(await res.json());
      } catch (e) {
        console.error(e);
        setReport(null);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [date, excludeBots]);

  const headline = report?.headline;

  const hourlyNormalized = useMemo(() => {
    const base = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      visits: 0,
      humans: 0,
      qualified: 0,
    }));
    (report?.hourly || []).forEach((x) => {
      const h = Number(x._id);
      if (Number.isFinite(h) && h >= 0 && h <= 23) {
        base[h] = {
          hour: h,
          visits: x.visits || 0,
          humans: x.humans || 0,
          qualified: x.qualified || 0,
        };
      }
    });
    return base;
  }, [report]);

  // Decide what to show under the always-visible filter bar
  let body = null;

  if (loading) {
    body = (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: 260 }}
      >
        <Spinner animation="border" />
      </div>
    );
  } else if (!report || !headline) {
    body = <div className="text-muted">No daily report data.</div>;
  } else {
    const peakHour = hourlyNormalized.reduce(
      (best, cur) => (cur.visits > best.visits ? cur : best),
      { hour: 0, visits: 0 }
    );

    body = (
      <>
        {/* Operational KPIs */}
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
                <div className="small text-muted">
                  Rate: {pct(headline.qualifiedRate)}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6}>
            <Card className="h-100">
              <Card.Body className="text-center">
                <div className="text-muted small">Bounce</div>
                <h3 className="mb-0">{pct(headline.bounceRate)}</h3>
                <div className="small text-muted">
                  Avg Duration: {formatDuration(headline.avgSessionDuration)}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6}>
            <Card className="h-100">
              <Card.Body className="text-center">
                <div className="text-muted small">Engagement</div>
                <h3 className="mb-0">
                  {Number(headline.avgEngagementScore).toFixed(1)}
                </h3>
                <div className="small text-muted">
                  Avg Scroll: {Number(headline.avgScrollDepth).toFixed(0)}%
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Intraday trend */}
        <Row className="g-3 mb-3">
          <Col lg={8}>
            <Card className="h-100">
              <Card.Body>
                <Card.Title>Hourly Traffic</Card.Title>
                <div className="text-muted small mb-2">
                  Peak hour: {String(peakHour.hour).padStart(2, "0")}:00 with{" "}
                  {peakHour.visits} visits
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {hourlyNormalized.map((h) => (
                    <span key={h.hour} className="badge bg-light text-dark">
                      {String(h.hour).padStart(2, "0")}: {h.visits} • Q:
                      {h.qualified}
                    </span>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <List
              title="Qualified Reasons (today)"
              items={report.qualifiedReasons}
            />
          </Col>
        </Row>

        {/* Breakdown tables */}
        <Row className="g-3">
          <Col lg={4} md={6}>
            <List title="Top Referrers (today)" items={report.topReferrers} />
          </Col>
          <Col lg={4} md={6}>
            <List title="Top Pages (today)" items={report.topPages} />
          </Col>
          <Col lg={4} md={12}>
            <List title="Top Exit Pages (today)" items={report.topExitPages} />
          </Col>

          <Col lg={4} md={6}>
            <List
              title="Top Traffic Sources (today)"
              items={report.topTrafficSources}
            />
          </Col>
          <Col lg={4} md={6}>
            <List
              title="Top UTM Campaigns (today)"
              items={report.topUtmCampaigns}
            />
          </Col>
          <Col lg={4} md={12}>
            <List title="Top Countries (today)" items={report.topCountries} />
          </Col>

          <Col lg={6} md={12}>
            <List title="Top Segments (today)" items={report.topSegments} />
          </Col>
          <Col lg={6} md={12}>
            <List title="UTM Sources (today)" items={report.topUtmSources} />
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
            <Card.Title className="mb-0">Daily Report</Card.Title>
            <div className="text-muted small">
              Date: {report?.date ?? date}
            </div>
          </div>

          <div className="d-flex gap-3 align-items-end flex-wrap">
            <Form.Group>
              <Form.Label className="small mb-1">Date</Form.Label>
              <Form.Control
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Form.Group>

            <Form.Check
              type="switch"
              id="excludeBotsDaily"
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
