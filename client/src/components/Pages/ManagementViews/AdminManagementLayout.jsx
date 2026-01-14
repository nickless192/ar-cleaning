// src/pages/admin/AdminManagementLayout.jsx
import React, { useState } from 'react';
import { Nav, Offcanvas, Button } from 'react-bootstrap';
import { Outlet, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaBars } from 'react-icons/fa';
import '/src/assets/css/AdminManagementLayout.css';

const AdminManagementLayout = () => {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const navLinks = [
    { to: '/admin/booking', label: t('navbar.admin.booking_management') },
    { to: '/admin/accounting', label: t('navbar.admin.accounting_management') },
    { to: '/admin/customer', label: t('navbar.admin.customer_management') },
    // { to: '/admin/inventory', label: t('navbar.admin.inventory_management') },
  ];

  // Shared nav link renderer for DRY principle
  const renderNavLinks = (isMobile = false) => (
    <>
      {navLinks.map((link) => (
        <Nav.Item key={link.to}>
          <NavLink
            to={link.to}
            onClick={isMobile ? handleClose : undefined}
            className={({ isActive }) =>
              `nav-link rounded mb-2 px-3 py-2 admin-nav-link ${
                isActive 
                  ? 'active fw-bold text-primary bg-primary bg-opacity-10 border-start border-primary border-3' 
                  : 'text-dark'
              }`
            }
          >
            {link.label}
          </NavLink>
        </Nav.Item>
      ))}
    </>
  );

  return (
    <div className="d-flex flex-column flex-md-row admin-layout">
      {/* ===== Mobile Header (Toggle Button) ===== */}
      <div className="d-md-none bg-light border-bottom py-3 d-flex justify-content-between align-items-center sticky-top shadow-sm admin-mobile-header">
        <Button 
          variant="outline-primary" 
          onClick={handleShow}
          aria-label={t('navbar.admin.toggle_menu') || 'Toggle navigation menu'}
          aria-expanded={show}
          aria-controls="admin-offcanvas"
          className="admin-toggle-btn"
        >
          <FaBars size={18} />
        </Button>
        {/* <h6 className="mb-0 text-uppercase fw-bold flex-grow-1 text-center">
          {t('navbar.admin.admin_management') || 'Admin'} 
        </h6>
        <div className="admin-header-spacer"></div> */}
      </div>

      {/* ===== Desktop Sidebar ===== */}
      <aside className="d-none d-md-flex flex-column py-3 bg-light border-end admin-sidebar">
        {/* <h5 className="mb-4 text-center text-uppercase fw-bold pb-3 border-bottom">
          {t('navbar.admin.admin_management') || 'Admin'}
        </h5> */}
        <Nav className="flex-column" role="navigation" aria-label="Admin navigation">
          {renderNavLinks(false)}
        </Nav>
      </aside>

      {/* ===== Offcanvas (Mobile Sidebar) ===== */}
      <Offcanvas 
        show={show} 
        onHide={handleClose} 
        placement="start"
        id="admin-offcanvas"
        aria-labelledby="admin-offcanvas-title"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title id="admin-offcanvas-title" className="text-uppercase fw-bold">
            {t('navbar.admin.admin_management') || 'Admin'}
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column" role="navigation" aria-label="Admin navigation">
            {renderNavLinks(true)}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      {/* ===== Main Content Area ===== */}
      <main className="flex-grow-1 py-3 py-md-4 admin-main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminManagementLayout;