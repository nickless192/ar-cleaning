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

const BookingTabbedView = () => {
    const { t } = useTranslation();

    return (
        <Container fluid className="py-3 sm:py-4">
            <div className="rounded-2xl shadow-md bg-white">
                <Tabs
                    defaultActiveKey="booking-dashboard-main"
                    id="booking-tabs"
                    className="flex flex-wrap gap-2 mb-3"
                    mountOnEnter
                    unmountOnExit
                >
                    <Tab
                        eventKey="booking-dashboard-main"
                        title={<span className="py-2 text-sm sm:text-base">{t('navbar.admin.booking_overview', "Booking Workflow Overview")}</span>}
                    >
                        <div className="py-2 sm:py-4">
                            <BookingDashboard />
                        </div>
                    </Tab>
                     <Tab
                        eventKey="booking-dashboard"
                        title={<span className="py-2 text-sm sm:text-base">{t('navbar.admin.booking_dashboard')}</span>}
                    >
                        <div className="py-2 sm:py-4">
                            <BookingList />
                        </div>
                    </Tab>
                   <Tab
                        eventKey="invoices"
                        title={<span className="py-2 text-sm sm:text-base">{t('navbar.admin.invoices')}</span>}
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
