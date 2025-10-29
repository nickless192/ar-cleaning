// import React from 'react';
// import { Tabs, Tab, Container } from 'react-bootstrap';

// import Customers from "/src/components/Pages/Management/Customers";
// import ManageUser from "/src/components/Pages/Management/ManageUser";
// import ManageService from "/src/components/Pages/Management/ManageService";
// import ManageProduct from "/src/components/Pages/Management/ManageProduct";
// import ManageGiftCard from "/src/components/Pages/Management/ManageGiftCard.jsx";
// import ManageCategories from "/src/components/Pages/Management/ManageCategories.jsx";
// import {useTranslation} from "react-i18next";

// const InventoryManagementTabbedView = () => {
//     const { t } = useTranslation();

//     return (
//         <Container className="mt-4">
//             <Tabs defaultActiveKey="customers" id="management-tabs" className="mb-3">                
//                 <Tab eventKey="customers" title={t('navbar.admin.manage_customers')}>
//                     <Customers />
//                 </Tab>
//                 <Tab eventKey="manage-user" title={t('navbar.admin.manage_users')}>
//                     <ManageUser />
//                 </Tab>
//                 <Tab eventKey="manage-service" title={t('navbar.admin.manage_services')}>
//                     <ManageService />
//                 </Tab>
//                 <Tab eventKey="manage-categories" title={t('navbar.admin.manage_categories')}>
//                     <ManageCategories />
//                 </Tab>
//                 <Tab eventKey="manage-product" title={t('navbar.admin.manage_products')}>
//                     <ManageProduct />
//                 </Tab>
//                 <Tab eventKey="manage-giftcard" title={t('navbar.admin.manage_gift_cards')}>
//                     <ManageGiftCard />
//                 </Tab>
//             </Tabs>
//         </Container>
//     );
// };

// export default InventoryManagementTabbedView;

import React from 'react';
import { Tabs, Tab, Container } from 'react-bootstrap';


import ManageService from '/src/components/Pages/Management/ManageService';
import ManageProduct from '/src/components/Pages/Management/ManageProduct';
import ManageGiftCard from '/src/components/Pages/Management/ManageGiftCard.jsx';
import ManageCategories from '/src/components/Pages/Management/ManageCategories.jsx';
import { useTranslation } from 'react-i18next';

const InventoryManagementTabbedView = () => {
  const { t } = useTranslation();

  return (
    <Container fluid className="p-3 sm:p-4">
      <div className="rounded-2xl shadow-md bg-white">
        {/* <div classN
        ame="overflow-x-auto hide-scrollbar"> */}
          <Tabs
            defaultActiveKey="manage-service"
            id="management-tabs"
            className="flex flex-wrap gap-2 mb-3"
            mountOnEnter
            unmountOnExit
          >

            <Tab eventKey="manage-service" title={<span className="px-3 py-2 text-sm sm:text-base">{t('navbar.admin.manage_services')}</span>}>
              <div className=""><ManageService /></div>
            </Tab>

            <Tab eventKey="manage-categories" title={<span className="px-3 py-2 text-sm sm:text-base">{t('navbar.admin.manage_categories')}</span>}>
              <div className="p-2 sm:p-4"><ManageCategories /></div>
            </Tab>

            <Tab eventKey="manage-product" title={<span className="px-3 py-2 text-sm sm:text-base">{t('navbar.admin.manage_products')}</span>}>
              <div className="p-2 sm:p-4"><ManageProduct /></div>
            </Tab>

            <Tab eventKey="manage-giftcard" title={<span className="px-3 py-2 text-sm sm:text-base">{t('navbar.admin.manage_gift_cards')}</span>}>
              <div className="p-2 sm:p-4"><ManageGiftCard /></div>
            </Tab>
          </Tabs>
        {/* </div> */}
      </div>

    </Container>
  );
};

export default InventoryManagementTabbedView;
