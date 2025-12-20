import React from 'react';
import { Row, Col, Card, Badge } from 'react-bootstrap';

const fmtPct = (n) => (Number.isFinite(n) ? `${n.toFixed(1)}%` : '—');
const fmtNum = (n) => (Number.isFinite(n) ? n : '—');

const fmtDuration = (seconds) => {
  const s = Math.round(Number(seconds) || 0);
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (!m) return `${r}s`;
  return `${m}m ${r}s`;
};

const WeeklyQualityCards = ({ report }) => {
  const q = report?.quality || null;

  if (!q) return null;

  return (
    <Row className="mb-4">
      <Col lg={3} md={6} className="mb-3">
        <Card className="h-100">
          <Card.Body>
            <Card.Title>Qualified Sessions</Card.Title>
            <div className="d-flex align-items-baseline gap-2">
              <h2 className="mb-0">{fmtNum(q.qualifiedSessions)}</h2>
              <Badge bg="light" text="dark">{fmtPct(q.qualifiedRate)}</Badge>
            </div>
            <div className="text-muted small mt-2">
              Humans tracked: {fmtNum(q.sessions)}
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col lg={3} md={6} className="mb-3">
        <Card className="h-100">
          <Card.Body>
            <Card.Title>Avg Engagement Score</Card.Title>
            <h2 className="mb-0">{fmtNum(q.avgScore)}</h2>
            <div className="text-muted small mt-2">
              Avg pages/session: {Number.isFinite(q.avgPages) ? q.avgPages.toFixed(1) : '—'}
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col lg={3} md={6} className="mb-3">
        <Card className="h-100">
          <Card.Body>
            <Card.Title>Bounce Rate</Card.Title>
            <h2 className="mb-0">{fmtPct(q.bounceRate)}</h2>
            <div className="text-muted small mt-2">
              Avg scroll: {Number.isFinite(q.avgScroll) ? `${Math.round(q.avgScroll)}%` : '—'}
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col lg={3} md={6} className="mb-3">
        <Card className="h-100">
          <Card.Body>
            <Card.Title>Avg Session Duration</Card.Title>
            <h2 className="mb-0">{fmtDuration(q.avgDuration)}</h2>
            <div className="text-muted small mt-2">
              Range: {report?.summaryRange?.from} → {report?.summaryRange?.to}
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

export default WeeklyQualityCards;