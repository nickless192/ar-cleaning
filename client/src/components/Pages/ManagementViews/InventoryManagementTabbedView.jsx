import React, { useEffect, useMemo, useState } from "react";
import { Container, Card, Nav } from "react-bootstrap";
import { useTranslation } from "react-i18next";

import ManageService from "/src/components/Pages/Management/ManageService";
import ManageProduct from "/src/components/Pages/Management/ManageProduct";
import ManageGiftCard from "/src/components/Pages/Management/ManageGiftCard.jsx";
import ManageCategories from "/src/components/Pages/Management/ManageCategories.jsx";

const LS_KEY = "inventoryHubActiveTab";

const InventoryManagementTabbedView = () => {
  const { t } = useTranslation();

  const tabs = useMemo(
    () => [
      { key: "services", title: t("navbar.admin.manage_services"), component: <ManageService /> },
      { key: "categories", title: t("navbar.admin.manage_categories"), component: <ManageCategories /> },
      { key: "products", title: t("navbar.admin.manage_products"), component: <ManageProduct /> },
      { key: "giftcards", title: t("navbar.admin.manage_gift_cards"), component: <ManageGiftCard /> },
    ],
    [t]
  );

  const [activeTab, setActiveTab] = useState("services");

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved && tabs.some((x) => x.key === saved)) setActiveTab(saved);
  }, [tabs]);

  useEffect(() => {
    localStorage.setItem(LS_KEY, activeTab);
  }, [activeTab]);

  const active = tabs.find((x) => x.key === activeTab) || tabs[0];

  return (
    <Container fluid className="p-3 p-sm-4">
      {/* Header */}
      <div className="mb-3">
        <h3 className="mb-0">Inventory Management</h3>
        <div className="text-muted small">
          Services, categories, products, and gift cards — all in one place.
        </div>
      </div>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          {/* Tabs row (matches Communications Hub vibe) */}
          <div className="p-2 border-bottom">
            <Nav
              variant="pills"
              activeKey={activeTab}
              onSelect={(k) => k && setActiveTab(k)}
              className="gap-2 flex-wrap"
            >
              {tabs.map((tab) => (
                <Nav.Item key={tab.key}>
                  <Nav.Link
                    eventKey={tab.key}
                    style={{ whiteSpace: "nowrap" }}
                  >
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

export default InventoryManagementTabbedView;
