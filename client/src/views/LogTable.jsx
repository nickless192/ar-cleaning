import React, { useState } from 'react';
import { Table, Badge, Button, Collapse } from 'react-bootstrap';
import { FaDesktop, FaMobile, FaTablet, FaGlobe, FaUserClock } from 'react-icons/fa';

const LogTable = ({ logs }) => {
  const [expandedRow, setExpandedRow] = useState(null);

  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const getDeviceIcon = (deviceType) => {
    switch(deviceType?.toLowerCase()) {
      case 'desktop': return <FaDesktop className="text-blue-500" />;
      case 'mobile': return <FaMobile className="text-green-500" />;
      case 'tablet': return <FaTablet className="text-purple-500" />;
      default: return <FaGlobe className="text-gray-500" />;
    }
  };

  return (
    <div className="table-responsive">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Page</th>
            <th>Date</th>
            <th>Device</th>
            <th>Browser / OS</th>
            <th>Location</th>
            <th>Referrer</th>
            <th>Visitor Type</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <React.Fragment key={log._id || index}>
                <tr>
                  <td>{index + 1}</td>
                  <td>{log.page}</td>
                  <td>{new Date(log.visitDate).toLocaleString()}</td>
                  <td>
                    {getDeviceIcon(log.deviceType)} {log.deviceType}
                  </td>
                  <td>
                    {log.browser} / {log.os}
                  </td>
                  <td>
                    {log.geo?.country ? (
                      <>
                        {log.geo.city}, {log.geo.region}, {log.geo.country}
                      </>
                    ) : (
                      <span className="text-muted">Unknown</span>
                    )}
                  </td>
                  <td>
                    {log.referrer ? (
                      <a href={log.referrer} target="_blank" rel="noopener noreferrer" className="text-truncate d-inline-block" style={{ maxWidth: '150px' }}>
                        {new URL(log.referrer).hostname}
                      </a>
                    ) : (
                      <span className="text-muted">Direct</span>
                    )}
                  </td>
                  <td>
                    {log.isReturningVisitor ? (
                      <Badge bg="success">Returning</Badge>
                    ) : (
                      <Badge bg="primary">New</Badge>
                    )}
                  </td>
                  <td>
                    <Button 
                      variant="outline-info" 
                      size="sm"
                      onClick={() => toggleRow(index)}
                      aria-expanded={expandedRow === index}
                    >
                      {expandedRow === index ? 'Hide' : 'View'}
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td colSpan="9" className="p-0">
                    <Collapse in={expandedRow === index}>
                      <div className="p-3 bg-light">
                        <div className="row">
                          <div className="col-md-6">
                            <h6>Session Information</h6>
                            <p><strong>Session ID:</strong> {log.sessionId || 'N/A'}</p>
                            <p><strong>Visitor ID:</strong> {log.visitorId || 'N/A'}</p>
                            <p><strong>IP:</strong> {log.ip || 'Not stored'}</p>
                            <p><strong>User Agent:</strong> <span className="text-muted small">{log.userAgent}</span></p>
                          </div>
                          <div className="col-md-6">
                            <h6>Visit History</h6>
                            <p><strong>First seen:</strong> {log.firstSeenAt ? new Date(log.firstSeenAt).toLocaleString() : 'N/A'}</p>
                            <p><strong>Last seen:</strong> {log.lastSeenAt ? new Date(log.lastSeenAt).toLocaleString() : 'N/A'}</p>
                            <h6 className="mt-3">UTM Parameters</h6>
                            <p><strong>Source:</strong> {log.utm?.source || 'N/A'}</p>
                            <p><strong>Medium:</strong> {log.utm?.medium || 'N/A'}</p>
                            <p><strong>Campaign:</strong> {log.utm?.campaign || 'N/A'}</p>
                          </div>
                        </div>
                        {log.pathsVisited && log.pathsVisited.length > 0 && (
                          <div className="mt-3">
                            <h6>Pages Visited (This Session)</h6>
                            <ul className="list-group">
                              {log.pathsVisited.map((path, i) => (
                                <li key={i} className="list-group-item">{path}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </Collapse>
                  </td>
                </tr>
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="text-center">
                No logs found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default LogTable;