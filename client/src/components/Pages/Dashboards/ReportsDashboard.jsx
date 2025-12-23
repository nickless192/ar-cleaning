// src/components/Pages/Management/ReportsDashboard.jsx
import React, { useState } from "react";
import { Tabs, Tab, Container } from "react-bootstrap";
import DailyReport from "./DailyReport.jsx";
import WeeklyReport from "./WeeklyReport.jsx";

export default function ReportsDashboard() {
  const [key, setKey] = useState("weekly");

  return (
    <Container fluid className="p-3">
      <h2 className="mb-2">Visitor Reports</h2>
      <div className="text-muted mb-3">Daily is operational. Weekly is strategic.</div>

      <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3" mountOnEnter unmountOnExit>
        <Tab eventKey="weekly" title="Weekly Report">
          <WeeklyReport />
        </Tab>
        <Tab eventKey="daily" title="Daily Report">
          <DailyReport />
        </Tab>
      </Tabs>
    </Container>
  );
}
