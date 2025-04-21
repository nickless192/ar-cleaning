import React from 'react';
import { Table } from 'react-bootstrap';

const LogTable = ({ logs }) => {
  return (
    <div className="table-responsive">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Page</th>
            <th>Date</th>
            <th>User Agent</th>
            <th>Visitor Hash</th>
          </tr>
        </thead>
        <tbody>
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <tr key={log._id || index}>
                <td>{index + 1}</td>
                <td>{log.page}</td>
                <td>{new Date(log.visitDate).toLocaleString()}</td>
                <td className="text-truncate" style={{ maxWidth: '250px' }}>{log.userAgent}</td>
                <td className="text-monospace" style={{ maxWidth: '250px', wordBreak: 'break-all' }}>{log.ip}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
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
