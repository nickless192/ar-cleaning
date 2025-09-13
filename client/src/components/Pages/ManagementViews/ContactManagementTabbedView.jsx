// import React from 'react';
// import { Tabs, Tab, Container } from 'react-bootstrap';

// import AdminContactDashboard from "/src/components/Pages/Management/AdminContactDashboard"; // version in-dev for testing
// import QuickQuoteDashboard from "/src/components/Pages/Management/QuickQuoteDashboard";
// import LogDashboard from "/src/components/Pages/Management/LogDashboard";
// import BookingDashboard from '/src/components/Pages/Management/BookingDashboard';
// import {useTranslation} from "react-i18next";

// const ContactManagementTabbedView = () => {
//     const { t } = useTranslation();

//     return (
//         <Container className="mt-4">
//             <Tabs defaultActiveKey="dashboard" id="management-tabs" className="mb-3">
//                 <Tab eventKey="dashboard" title={t('navbar.admin.dashboard')}>
//                                     <LogDashboard />
//                                 </Tab>
//                 <Tab eventKey="contact-dashboard" title={t('navbar.admin.manage_contacts')}>
//                     <AdminContactDashboard />
//                 </Tab>
//                 <Tab eventKey="booking-dashboard" title={t('navbar.admin.booking_dashboard')}>
//                     <BookingDashboard />
//                 </Tab>
//                 <Tab eventKey="view-quotes" title={t('navbar.admin.view_quotes')}>
//                     <QuickQuoteDashboard />
//                 </Tab>
//             </Tabs>
//         </Container>
//     );
// };

// export default ContactManagementTabbedView;

import React from 'react';
import { Tabs, Tab, Container } from 'react-bootstrap';

import AdminContactDashboard from '/src/components/Pages/Management/AdminContactDashboard';
import QuickQuoteDashboard from '/src/components/Pages/Management/QuickQuoteDashboard';
import Customers from '/src/components/Pages/Management/Customers';
import ManageUser from '/src/components/Pages/Management/ManageUser';
import LogDashboard from '/src/components/Pages/Management/LogDashboard';
import BookingDashboard from '/src/components/Pages/Management/BookingDashboard';
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
                        eventKey="booking-dashboard"
                        title={<span className="px-3 py-2 text-sm sm:text-base">{t('navbar.admin.booking_dashboard')}</span>}
                    >
                        <div className="p-2 sm:p-4">
                            <BookingDashboard />
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
