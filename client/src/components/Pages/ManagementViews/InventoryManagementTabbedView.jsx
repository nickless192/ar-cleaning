import React, { useMemo, useState } from "react";
import { Container, Card, Nav, Form, Accordion } from "react-bootstrap";
import { useTranslation } from "react-i18next";

import ManageService from "/src/components/Pages/Management/ManageService";
import ManageProduct from "/src/components/Pages/Management/ManageProduct";
import ManageGiftCard from "/src/components/Pages/Management/ManageGiftCard.jsx";
import ManageCategories from "/src/components/Pages/Management/ManageCategories.jsx";

const InventoryManagementTabbedView = () => {
  const { t } = useTranslation();

  const sections = useMemo(
    () => [
      { key: "services", title: t("navbar.admin.manage_services"), component: <ManageService /> },
      { key: "categories", title: t("navbar.admin.manage_categories"), component: <ManageCategories /> },
      { key: "products", title: t("navbar.admin.manage_products"), component: <ManageProduct /> },
      { key: "giftcards", title: t("navbar.admin.manage_gift_cards"), component: <ManageGiftCard /> },
    ],
    [t]
  );

  const [activeSection, setActiveSection] = useState("services");
  const currentSection = sections.find((section) => section.key === activeSection) || sections[0];

  return (
    <Container fluid className="p-2 p-sm-3 p-lg-4">
      <Card className="shadow-sm border-0">
        <Card.Body className="p-2 p-sm-3 p-lg-4">
          <div className="mb-3">
            <h3 className="h5 mb-1">{t("navbar.admin.inventory_management", "Inventory Management")}</h3>
            <div className="text-muted small">
              {t(
                "navbar.admin.inventory_summary",
                "Services, categories, products, and gift cards in one dedicated section."
              )}
            </div>
          </div>

          <div className="d-md-none">
            <Accordion activeKey={activeSection} onSelect={(key) => key && setActiveSection(key)} alwaysOpen={false}>
              {sections.map((section) => (
                <Accordion.Item key={section.key} eventKey={section.key}>
                  <Accordion.Header>{section.title}</Accordion.Header>
                  <Accordion.Body className="px-1">{section.component}</Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </div>

          <div className="d-none d-md-block">
            <div className="mb-3">
              <Form.Label htmlFor="inventory-section-select" className="fw-semibold d-lg-none">
                {t("navbar.admin.inventory_management", "Inventory Management")}
              </Form.Label>
              <Form.Select
                id="inventory-section-select"
                className="d-lg-none"
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
                variant="pills"
                className="gap-2 flex-wrap d-none d-lg-flex"
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
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default InventoryManagementTabbedView;
