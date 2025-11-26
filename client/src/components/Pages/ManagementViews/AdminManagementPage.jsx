import React from 'react';
import { Tabs, Tab, Container } from 'react-bootstrap';
import AccountingTabbedView from './AccountingTabbedView';
import ContactManagementTabbedView from './ContactManagementTabbedView';
import InventoryManagementTabbedView from './InventoryManagementTabbedView';
import BookingTabbedView from './BookingTabbedView';
import '/src/assets/css/management.css';
import { useTranslation } from 'react-i18next';

const AdminManagementPage = () => {
  const { t } = useTranslation();

  return (
    <Container fluid className="py-5 sm:py-5">
      <Tabs defaultActiveKey="accounting" id="admin-management-tabs" className="mb-3">
        <Tab eventKey="accounting" title={t('navbar.admin.accounting_management')}>
          <AccountingTabbedView />
        </Tab>
        <Tab eventKey="booking" title={t('navbar.admin.booking_management')}>
          <BookingTabbedView />
        </Tab>
        <Tab eventKey="customer" title={t('navbar.admin.customer_management')}>
          <ContactManagementTabbedView />
        </Tab>

        <Tab eventKey="inventory" title={t('navbar.admin.inventory_management')}>
          <InventoryManagementTabbedView />
        </Tab>
      </Tabs>
    </Container>
  );
};

export default AdminManagementPage;
