import React from 'react';
import { Tabs, Tab, Container } from 'react-bootstrap';

import AdminContactDashboard from '/src/components/Pages/Management/AdminContactDashboard';
import QuickQuoteDashboard from '/src/components/Pages/Management/QuickQuoteDashboard';
import Customers from '/src/components/Pages/Management/Customers';
import ManageUser from '/src/components/Pages/Management/ManageUser';
import LogDashboard from '/src/components/Pages/Management/LogDashboard';
import BookingDashboard from '/src/components/Pages/Management/BookingDashboard';
import BookingList from '/src/components/Pages/Management/BookingList';
import InvoiceList from '/src/components/Pages/Booking/InvoiceList';
import { useTranslation } from 'react-i18next';

const ContactManagementTabbedView = () => {
    const { t } = useTranslation();

    return (
        <Container fluid className="p-3 sm:p-4">
            <div className="rounded-2xl shadow-md bg-white p-2">
                <Tabs
                    defaultActiveKey="dashboard"
                    id="management-tabs"
                    className="flex flex-wrap gap-2 mb-3"
                    mountOnEnter
                    unmountOnExit
                >
                    <Tab
                        eventKey="dashboard"
                        title={<span className="px-3 py-2 text-sm sm:text-base">{t('navbar.admin.visitor_dashboard')}</span>}
                    >
                        <div className="p-2 sm:p-4">
                            <LogDashboard />
                        </div>
                    </Tab>
                    <Tab
                        eventKey="booking-dashboard-main"
                        title={<span className="px-3 py-2 text-sm sm:text-base">{t('navbar.admin.booking_overview', "Booking Workflow Overview")}</span>}
                    >
                        <div className="p-2 sm:p-4">
                            <BookingDashboard />
                        </div>
                    </Tab>
                     <Tab
                        eventKey="booking-dashboard"
                        title={<span className="px-3 py-2 text-sm sm:text-base">{t('navbar.admin.booking_dashboard')}</span>}
                    >
                        <div className="p-2 sm:p-4">
                            <BookingList />
                        </div>
                    </Tab>
                   <Tab
                        eventKey="invoices"
                        title={<span className="px-3 py-2 text-sm sm:text-base">{t('navbar.admin.invoices')}</span>}
                    >
                        <div className="p-2 sm:p-4">
                            <InvoiceList />
                        </div>
                    </Tab>
                    <Tab
                        eventKey="contact-dashboard"
                        title={<span className="px-3 py-2 text-sm sm:text-base">{t('navbar.admin.manage_customers_contact')}</span>}
                    >
                        <div className="p-2 sm:p-4">
                            <AdminContactDashboard />
                        </div>
                    </Tab>
                   

                    <Tab
                        eventKey="view-quotes"
                        title={<span className="px-3 py-2 text-sm sm:text-base">{t('navbar.admin.view_quotes')}</span>}
                    >
                        <div className="p-2 sm:p-4">
                            <QuickQuoteDashboard />
                        </div>
                    </Tab>
                     <Tab eventKey="customers" title={<span className="px-3 py-2 text-sm sm:text-base">{t('navbar.admin.manage_customers')}</span>}>
                        <div className="p-2 sm:p-4"><Customers /></div>
                    </Tab>

                    <Tab eventKey="manage-user" title={<span className="px-3 py-2 text-sm sm:text-base">{t('navbar.admin.manage_users')}</span>}>
                        <div className="p-2 sm:p-4"><ManageUser /></div>
                    </Tab>
                </Tabs>
            </div>

        </Container>
    );
};

export default ContactManagementTabbedView;
