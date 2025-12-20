import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Row,
  Col,
  Nav,
  NavItem,
  NavLink,
  Card,
  CardBody,
  Badge,
} from "reactstrap";
import classnames from "classnames";

import QuickQuoteDashboard from "./QuickQuoteDashboard";
import AdminContactDashboard from "./AdminContactDashboard";

const CommunicationsHub = () => {
  const [activeTab, setActiveTab] = useState("quotes");

  // optional: persist last selected tab
  useEffect(() => {
    const saved = localStorage.getItem("communicationsHubTab");
    if (saved) setActiveTab(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem("communicationsHubTab", activeTab);
  }, [activeTab]);

  return (
    <Container fluid className="mt-3">
      {/* Header */}
      <Row className="align-items-center mb-3">
        <Col>
          <h3 className="mb-0">Communications Hub</h3>
          <div className="text-muted small">
            Quotes + messages in one place
          </div>
        </Col>

        {/* Optional: add quick stats later */}
        <Col className="text-end">
          {/* Example placeholders */}
          {/* <Badge color="primary" pill className="me-2">3 New Quotes</Badge>
          <Badge color="warning" pill>2 New Messages</Badge> */}
        </Col>
      </Row>

      {/* Tabs */}
      <Card className="mb-3">
        <CardBody className="py-2">
          <Nav pills>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "quotes" })}
                style={{ cursor: "pointer" }}
                onClick={() => setActiveTab("quotes")}
              >
                Quotes
              </NavLink>
            </NavItem>

            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "messages" })}
                style={{ cursor: "pointer" }}
                onClick={() => setActiveTab("messages")}
              >
                Messages
              </NavLink>
            </NavItem>

            {/* Optional future */}
            {/* <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "all" })}
                style={{ cursor: "pointer" }}
                onClick={() => setActiveTab("all")}
              >
                All Inbox
              </NavLink>
            </NavItem> */}
          </Nav>
        </CardBody>
      </Card>

      {/* Views */}
      <div>
        {activeTab === "quotes" && <QuickQuoteDashboard />}
        {activeTab === "messages" && <AdminContactDashboard />}
      </div>
    </Container>
  );
};

export default CommunicationsHub;
