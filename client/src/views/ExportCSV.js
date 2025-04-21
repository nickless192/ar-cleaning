import React from 'react';
import { CSVLink } from 'react-csv';
import { Button } from 'react-bootstrap';

const ExportCSV = ({ logs }) => {
  const headers = [
    { label: 'Page', key: 'page' },
    { label: 'Visit Date', key: 'visitDate' },
    { label: 'User Agent', key: 'userAgent' },
    { label: 'IP Address', key: 'ip' },
  ];

  return (
    <CSVLink
      data={logs}
      headers={headers}
      filename={`visitor-logs-${Date.now()}.csv`}
    >
      <Button variant="outline-primary">Export CSV</Button>
    </CSVLink>
  );
};

export default ExportCSV;
