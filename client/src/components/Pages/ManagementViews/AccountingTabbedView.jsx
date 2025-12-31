import React, { useEffect, useMemo, useState } from "react";
import { Container, Card, Nav } from "react-bootstrap";
import { useTranslation } from "react-i18next";

import ExpenseDashboard from "/src/components/Pages/Dashboards/ExpenseDashboard";
import FinanceDashboard from "/src/components/Pages/Dashboards/FinanceDashboard";
import InventoryManagementTabbedView from "/src/components/Pages/ManagementViews/InventoryManagementTabbedView"; // adjust path if needed

const LS_KEY = "accountingHubActiveTab";

const AccountingTabbedView = () => {
  const { t } = useTranslation();

  const tabs = useMemo(
    () => [
      {
        key: "finance",
        title: "Income & Finance Overview",
        component: <FinanceDashboard />,
      },
      {
        key: "expenses",
        title: "Expense Management",
        component: <ExpenseDashboard />,
      },
      {
        key: "inventory",
        title: "Services & Products Configuration",
        component: <InventoryManagementTabbedView />, // see embedded note below
      },
    ],
    [t]
  );

  const [activeTab, setActiveTab] = useState("finance");

  // restore last selected tab
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved && tabs.some((x) => x.key === saved)) setActiveTab(saved);
  }, [tabs]);

  // persist tab selection
  useEffect(() => {
    localStorage.setItem(LS_KEY, activeTab);
  }, [activeTab]);

  const active = tabs.find((x) => x.key === activeTab) || tabs[0];

  return (
    <Container fluid className="p-3 p-sm-4">
      {/* Header */}
      {/* <div className="mb-3">
        <h3 className="mb-0">Accounting</h3>
        <div className="text-muted small">
          Finance, expenses, and inventory configuration in one place.
        </div>
      </div> */}

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          {/* Primary tabs */}
          <div className="p-2 border-bottom">
            <Nav
              variant="pills"
              activeKey={activeTab}
              onSelect={(k) => k && setActiveTab(k)}
              className="gap-2 flex-wrap"
            >
              {tabs.map((tab) => (
                <Nav.Item key={tab.key}>
                  <Nav.Link eventKey={tab.key} style={{ whiteSpace: "nowrap" }}>
                    {tab.title}
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          </div>

          {/* Content */}
          <div className="p-2 p-sm-4">{active.component}</div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AccountingTabbedView;
