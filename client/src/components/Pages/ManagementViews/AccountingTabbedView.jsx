// import React from 'react';
// import { Tabs, Tab, Container } from 'react-bootstrap';
// import {useTranslation} from "react-i18next";

// import ExpenseDashboard from "/src/components/Pages/Management/ExpenseDashboard";
// import FinanceDashboard from "/src/components/Pages/Management/FinanceDashboard";

// const AccountingTabbedView = () => {
//     const { t } = useTranslation();

//     return (
//         <Container className="mt-4">
//             <Tabs defaultActiveKey="expense-dashboard" id="management-tabs" className="mb-3">
//                 <Tab eventKey="expense-dashboard" title={t('navbar.admin.manage_finance')}>
//                     <ExpenseDashboard />
//                 </Tab>
//                 <Tab eventKey="finance-dashboard" title={t('navbar.admin.manage_expenses')}>
//                     <FinanceDashboard />
//                 </Tab>
//             </Tabs>
//         </Container>
//     );
// };

// export default AccountingTabbedView;

import React from 'react';
import { Tabs, Tab, Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import ExpenseDashboard from '/src/components/Pages/Management/ExpenseDashboard';
import FinanceDashboard from '/src/components/Pages/Management/FinanceDashboard';

const AccountingTabbedView = () => {
    const { t } = useTranslation();

    return (
        <Container fluid className="overflow-x-auto">
            {/* <div className="rounded-2xl shadow-md bg-white p-2 overflow-x-auto"> */}
                <Tabs
                    defaultActiveKey="finance-dashboard"
                    id="management-tabs"
                    className="flex flex-wrap gap-2 mb-3"
                    mountOnEnter
                    unmountOnExit
                >
                    

                    <Tab
                        eventKey="finance-dashboard"
                        title={
                            <span className="px-3 py-2 text-sm sm:text-base font-medium">
                                {t('navbar.admin.manage_finance')}
                            </span>
                        }
                    >
                        <div className="p-2 sm:p-4">
                            <FinanceDashboard />
                        </div>
                    </Tab>
                    <Tab
                        eventKey="expense-dashboard"
                        title={
                            <span className="px-3 py-2 text-sm sm:text-base font-medium">
                                {t('navbar.admin.manage_expenses')}
                            </span>
                        }
                    >
                        <div className="p-2 sm:p-4">
                            <ExpenseDashboard />
                        </div>
                    </Tab>
                </Tabs>
            {/* </div> */}

        </Container>
    );
};

export default AccountingTabbedView;
