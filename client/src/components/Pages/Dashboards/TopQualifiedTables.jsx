import React from 'react';
import { Row, Col, Card, Table, Badge } from 'react-bootstrap';

const pct = (n) => Number.isFinite(n) ? `${(n * 100).toFixed(1)}%` : '—';
const pctAlready = (n) => Number.isFinite(n) ? `${n.toFixed(1)}%` : '—';

const TopQualifiedTables = ({ report }) => {
  const topQualifiedPages = report?.topQualifiedPages || [];
  const sourceQuality = report?.sourceQuality || [];

  if (!topQualifiedPages.length && !sourceQuality.length) return null;

  return (
    <Row className="mb-4">
      <Col lg={6} className="mb-3">
        <Card className="h-100">
          <Card.Body>
            <Card.Title>Top Pages by Qualified Sessions</Card.Title>
            <Table responsive size="sm" className="mb-0">
              <thead>
                <tr>
                  <th>Page</th>
                  <th className="text-end">Qualified</th>
                  <th className="text-end">Rate</th>
                  <th className="text-end">Avg Score</th>
                </tr>
              </thead>
              <tbody>
                {topQualifiedPages.slice(0, 8).map((row) => (
                  <tr key={row._id}>
                    <td style={{ maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row._id || '(unknown)'}
                    </td>
                    <td className="text-end">{row.qualifiedSessions ?? 0}</td>
                    <td className="text-end">
                      <Badge bg="light" text="dark">
                        {row.qualifiedRate != null ? pctAlready(row.qualifiedRate * 100 ? row.qualifiedRate : row.qualifiedRate) : '—'}
                      </Badge>
                    </td>
                    <td className="text-end">{Math.round(row.avgScore ?? 0)}</td>
                  </tr>
                ))}
                {!topQualifiedPages.length && (
                  <tr><td colSpan={4} className="text-muted">No data yet.</td></tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Col>

      <Col lg={6} className="mb-3">
        <Card className="h-100">
          <Card.Body>
            <Card.Title>Traffic Sources by Qualified Rate</Card.Title>
            <Table responsive size="sm" className="mb-0">
              <thead>
                <tr>
                  <th>Source</th>
                  <th className="text-end">Sessions</th>
                  <th className="text-end">Qualified</th>
                  <th className="text-end">Rate</th>
                </tr>
              </thead>
              <tbody>
                {sourceQuality.slice(0, 10).map((row) => (
                  <tr key={row._id || 'unknown'}>
                    <td>{row._id || 'unknown'}</td>
                    <td className="text-end">{row.sessions ?? 0}</td>
                    <td className="text-end">{row.qualifiedSessions ?? 0}</td>
                    <td className="text-end">
                      <Badge bg="light" text="dark">
                        {row.qualifiedRate != null ? pct(row.qualifiedRate) : '—'}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {!sourceQuality.length && (
                  <tr><td colSpan={4} className="text-muted">No data yet.</td></tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

export default TopQualifiedTables;