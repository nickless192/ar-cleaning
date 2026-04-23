import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Card, Form, Nav } from 'react-bootstrap';

import CommunicationsHub from '/src/components/Pages/Dashboards/CommunicationsHub';
import Customers from '/src/components/Pages/Management/Customers';
import ManageUser from '/src/components/Pages/Management/ManageUser';
import LogDashboard from '/src/components/Pages/Management/LogDashboard';
import EventsDashboard from '/src/components/Pages/Management/EventsDashboard';
import ReportsDashboard from '/src/components/Pages/Dashboards/ReportsDashboard';
import NotificationAdminPage from '/src/components/Pages/UserJourney/NotificationAdminPage';
import { useTranslation } from 'react-i18next';

const ContactManagementTabbedView = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const sections = useMemo(
    () => [
      {
        key: 'dashboard',
        group: 'operations',
        title: t('navbar.admin.visitor_dashboard'),
        component: <LogDashboard />,
      },
      {
        key: 'events',
        group: 'operations',
        title: t('navbar.admin.events_dashboard'),
        component: <EventsDashboard />,
      },
      {
        key: 'reports',
        group: 'operations',
        title: t('navbar.admin.reports_dashboard'),
        component: <ReportsDashboard />,
      },
      {
        key: 'contact-dashboard',
        group: 'operations',
        title: t('navbar.admin.manage_customers_contact'),
        component: <CommunicationsHub />,
      },
      {
        key: 'notifications',
        group: 'operations',
        title: t('navbar.admin.notifications'),
        component: <NotificationAdminPage />,
      },
      {
        key: 'customers',
        group: 'users',
        title: t('navbar.admin.manage_customers'),
        component: <Customers />,
      },
      {
        key: 'manage-user',
        group: 'users',
        title: t('navbar.admin.manage_users'),
        component: <ManageUser />,
      },
    ],
    [t]
  );

  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    const requestedSection = searchParams.get('tab');
    if (requestedSection && sections.some((section) => section.key === requestedSection)) {
      setActiveSection(requestedSection);
    }
  }, [searchParams, sections]);

  const currentSection = sections.find((section) => section.key === activeSection) || sections[0];
  const operationsSections = sections.filter((section) => section.group === 'operations');
  const userSections = sections.filter((section) => section.group === 'users');

  return (
    <Container fluid className="p-2 p-sm-3 p-lg-4">
      <Card className="shadow-sm border-0">
        <Card.Body className="p-2 p-sm-3 p-lg-4">
          <div className="d-lg-none mb-3">
            <Form.Label htmlFor="customer-admin-section-select" className="fw-semibold">
              {t('navbar.admin.customer_management')}
            </Form.Label>
            <Form.Select
              id="customer-admin-section-select"
              value={activeSection}
              onChange={(e) => setActiveSection(e.target.value)}
            >
              <optgroup label={t('navbar.admin.operations', 'Operations')}>
                {operationsSections.map((section) => (
                  <option key={section.key} value={section.key}>
                    {section.title}
                  </option>
                ))}
              </optgroup>
              <optgroup label={t('navbar.admin.users', 'Customers & Users')}>
                {userSections.map((section) => (
                  <option key={section.key} value={section.key}>
                    {section.title}
                  </option>
                ))}
              </optgroup>
            </Form.Select>
          </div>

          <div className="d-none d-lg-flex gap-3 align-items-start">
            <Card className="border" style={{ minWidth: '290px' }}>
              <Card.Body className="p-2">
                <div className="small text-uppercase text-muted fw-semibold px-2 mb-2">
                  {t('navbar.admin.operations', 'Operations')}
                </div>
                <Nav className="flex-column mb-3" variant="pills" activeKey={activeSection} onSelect={(key) => key && setActiveSection(key)}>
                  {operationsSections.map((section) => (
                    <Nav.Item key={section.key}>
                      <Nav.Link eventKey={section.key}>{section.title}</Nav.Link>
                    </Nav.Item>
                  ))}
                </Nav>

                <div className="small text-uppercase text-muted fw-semibold px-2 mb-2">
                  {t('navbar.admin.users', 'Customers & Users')}
                </div>
                <Nav className="flex-column" variant="pills" activeKey={activeSection} onSelect={(key) => key && setActiveSection(key)}>
                  {userSections.map((section) => (
                    <Nav.Item key={section.key}>
                      <Nav.Link eventKey={section.key}>{section.title}</Nav.Link>
                    </Nav.Item>
                  ))}
                </Nav>
              </Card.Body>
            </Card>

            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              {currentSection.component}
            </div>
          </div>

          <div className="d-lg-none">{currentSection.component}</div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ContactManagementTabbedView;
