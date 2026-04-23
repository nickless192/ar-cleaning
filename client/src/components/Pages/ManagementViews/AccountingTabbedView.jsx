import React, { useMemo, useState } from "react";
import { Container, Card, Nav, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import AccountingOverview from "/src/components/Pages/Dashboards/AccountingOverview";
import ExpenseDashboard from "/src/components/Pages/Dashboards/ExpenseDashboard";
import FinanceDashboard from "/src/components/Pages/Dashboards/FinanceDashboard";
import MonthlyProfitCompare from "/src/components/Pages/Dashboards/MonthlyProfitCompare";

const AccountingTabbedView = () => {
  const { t } = useTranslation();

  const sections = useMemo(
    () => [
      {
        key: "overview",
        title: t("navbar.admin.accounting_overview", "Overview"),
        component: <AccountingOverview />,
      },
      {
        key: "finance",
        title: t("navbar.admin.finance_overview", "Income & Finance Overview"),
        component: <FinanceDashboard />,
      },
      {
        key: "expenses",
        title: t("navbar.admin.expense_management", "Expense Management"),
        component: <ExpenseDashboard />,
      },
      {
        key: "reports",
        title: t("navbar.admin.financial_reports", "Financial Reports"),
        component: <MonthlyProfitCompare />,
      },
    ],
    [t]
  );

  const [activeSection, setActiveSection] = useState("overview");
  const currentSection = sections.find((section) => section.key === activeSection) || sections[0];

  return (
    <Container fluid className="p-2 p-sm-3 p-lg-4">
      <Card className="shadow-sm border-0">
        <Card.Body className="p-2 p-sm-3 p-lg-4">
          <div className="mb-3">
            <Form.Label htmlFor="accounting-section-select" className="fw-semibold d-md-none">
              {t("navbar.admin.accounting_management", "Accounting Management")}
            </Form.Label>
            <Form.Select
              id="accounting-section-select"
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

          <Card className="mb-3 bg-light border">
            <Card.Body className="py-2 px-3 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
              <div>
                <h6 className="mb-1">{t("navbar.admin.inventory_management", "Inventory Management")}</h6>
                <small className="text-muted">
                  {t(
                    "navbar.admin.inventory_management_note",
                    "Services, products, categories, and gift cards are now grouped in a dedicated inventory section."
                  )}
                </small>
              </div>
              <Link className="btn btn-outline-primary btn-sm" to="/admin/inventory">
                {t("navbar.admin.go_inventory", "Open Inventory")}
              </Link>
            </Card.Body>
          </Card>

          <div>{currentSection.component}</div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AccountingTabbedView;
