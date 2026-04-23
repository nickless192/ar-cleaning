import React, { useEffect, useMemo, useState } from "react";
import { Container, Card, Form, Nav } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import BookingDashboard from "/src/components/Pages/Management/BookingDashboard";
import InvoiceList from "/src/components/Pages/Booking/InvoiceList";
import { useTranslation } from "react-i18next";

const DEFAULT_SECTION = "booking-dashboard-main";

const BookingTabbedView = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const sections = useMemo(
    () => [
      {
        key: "booking-dashboard-main",
        title: t("navbar.admin.booking_overview", "Booking Workflow Overview"),
        component: <BookingDashboard />,
      },
      {
        key: "invoices",
        title: t("navbar.admin.invoices"),
        component: <InvoiceList />,
      },
    ],
    [t]
  );

  const [activeSection, setActiveSection] = useState(DEFAULT_SECTION);

  useEffect(() => {
    const requestedSection = location.state?.activeTab;
    if (requestedSection && sections.some((section) => section.key === requestedSection)) {
      setActiveSection(requestedSection);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate, sections]);

  const currentSection = sections.find((section) => section.key === activeSection) || sections[0];

  return (
    <Container fluid className="p-2 p-sm-3 p-lg-4">
      <Card className="shadow-sm border-0">
        <Card.Body className="p-2 p-sm-3 p-lg-4">
          <div className="mb-3">
            <Form.Label htmlFor="booking-section-select" className="fw-semibold d-md-none">
              {t("navbar.admin.booking_management")}
            </Form.Label>
            <Form.Select
              id="booking-section-select"
              className="d-md-none"
              value={activeSection}
              onChange={(e) => setActiveSection(e.target.value)}
            >
              {sections.map((section) => (
                <option key={section.key} value={section.key}>
                  {section.title}
                </option>
              ))}
            </Form.Select>

            <Nav
              className="d-none d-md-flex gap-2 flex-wrap"
              variant="pills"
              activeKey={activeSection}
              onSelect={(key) => key && setActiveSection(key)}
            >
              {sections.map((section) => (
                <Nav.Item key={section.key}>
                  <Nav.Link eventKey={section.key}>{section.title}</Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          </div>

          <div>{currentSection.component}</div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default BookingTabbedView;
