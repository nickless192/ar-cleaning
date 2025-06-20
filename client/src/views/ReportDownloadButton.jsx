import React from 'react';
import { Button } from 'react-bootstrap';

const ReportDownloadButton = () => {
  const handleDownload = async () => {
    try {
      const res = await fetch('/api/email/weekly-report', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/csv',
        },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch the report');
      }

      const data = await res.blob();

      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'visitor-report.csv');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <Button variant="info" onClick={handleDownload}>
      Download Weekly Report
    </Button>
  );
};

export default ReportDownloadButton;
