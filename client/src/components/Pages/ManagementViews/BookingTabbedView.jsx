import React, { useEffect, useState } from "react";
import { Tabs, Tab, Container } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import BookingDashboard from "/src/components/Pages/Management/BookingDashboard";
import InvoiceList from "/src/components/Pages/Booking/InvoiceList";
import { useTranslation } from "react-i18next";

const DEFAULT_TAB = "booking-dashboard-main";

const BookingTabbedView = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeKey, setActiveKey] = useState(DEFAULT_TAB);

  // ✅ If we navigated here with state.activeTab, switch to it.
  useEffect(() => {
    const next = location.state?.activeTab;
    if (next) {
      setActiveKey(next);

      // ✅ clear state so refresh/back doesn't keep forcing tabs
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  return (
    <Container fluid className="py-3 sm:py-4">
      <div className="rounded-2xl shadow-md bg-white">
        <Tabs
          activeKey={activeKey}
          onSelect={(k) => setActiveKey(k || DEFAULT_TAB)}
          id="booking-tabs"
          className="flex flex-wrap gap-2 mb-3"
          mountOnEnter
          unmountOnExit
        >
          <Tab
            eventKey="booking-dashboard-main"
            title={
              <span className="py-2 text-sm sm:text-base">
                {t("navbar.admin.booking_overview", "Booking Workflow Overview")}
              </span>
            }
          >
            <div className="py-2 sm:py-4">
              <BookingDashboard />
            </div>
          </Tab>

          <Tab
            eventKey="invoices"
            title={
              <span className="py-2 text-sm sm:text-base">
                {t("navbar.admin.invoices")}
              </span>
            }
          >
            <div className="py-2 sm:py-4">
              <InvoiceList />
            </div>
          </Tab>
        </Tabs>
      </div>
    </Container>
  );
};

export default BookingTabbedView;
