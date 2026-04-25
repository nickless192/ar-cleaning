import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import VisitorCounter from "/src/components/Pages/Management/VisitorCounter.jsx";
import pageBg from "/src/assets/img/bg1.png";

const categoryAnchors = [
  { key: 'core', target: 'core-services' },
  { key: 'packages', target: 'cleaning-packages' },
  { key: 'addons', target: 'add-ons' },
  { key: 'carpetUpholstery', target: 'carpet-upholstery' },
  { key: 'specialty', target: 'specialty-services' }
];

const CORE_SERVICE_QUERY = {
  residentialRegular: 'Residential+Cleaning',
  residentialDeep: 'Deep+Cleaning',
  moveInOut: 'Move+In+Move+Out+Cleaning',
  commercialRegular: 'Commercial+Cleaning',
  commercialDeep: 'Commercial+Cleaning',
  carpetCleaning: 'Carpet+And+Upholstery',
  upholsteryCleaning: 'Carpet+And+Upholstery'
};

const SPECIALTY_QUERY = {
  postConstruction: 'Post-Construction+Cleaning',
  fullUnitCleanOut: 'Deep+Cleaning',
  monthlyBuilding: 'Commercial+Cleaning'
};

const ProductsAndServices = () => {
  const { t, i18n } = useTranslation();

  const jumpToSection = (targetId) => {
    const section = document.getElementById(targetId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const quoteLink = (serviceQuery) => (serviceQuery
    ? `/?service=${serviceQuery}&scrollToQuote=true`
    : '/?scrollToQuote=true');

  useEffect(() => {
    document.body.classList.add('products-services-page');
    document.body.classList.add('sidebar-collapse');
    document.documentElement.classList.remove('nav-open');
    window.scrollTo(0, 0);

    return function cleanup() {
      document.body.classList.remove('products-services-page');
      document.body.classList.remove('sidebar-collapse');
    };
  }, [i18n.language]);

  return (
    <section className="section-background services-revamp" style={{ backgroundImage: `url(${pageBg})` }}>
      <VisitorCounter page={'products-and-services'} />

      <section className="service-selector pb-5">
        <div className="services-hero pt-5 mb-4">
          <h1 className="title primary-color text-bold mb-3">
            {t('products_and_services.revamp.hero.title')}
          </h1>
          <p className="text-cleanar-color mb-4 services-hero-subtitle">
            {t('products_and_services.revamp.hero.subtitle')}
          </p>

          <div className="d-flex flex-wrap gap-2 mb-4" aria-label={t('products_and_services.revamp.hero.trustLabel')}>
            {t('products_and_services.revamp.hero.trustChips', { returnObjects: true }).map((chip) => (
              <span key={chip} className="services-trust-chip">{chip}</span>
            ))}
          </div>

          <div className="d-flex flex-wrap gap-2">
            <Button as={Link} to={quoteLink()} className="btn-round secondary-bg-color">
              {t('products_and_services.revamp.hero.primaryCta')}
            </Button>
            <Button variant="outline-secondary" className="btn-round" onClick={() => jumpToSection('services')}>
              {t('products_and_services.revamp.hero.secondaryCta')}
            </Button>
          </div>
        </div>

        <nav className="services-category-nav mb-4" aria-label={t('products_and_services.revamp.categoryNav.ariaLabel')}>
          {categoryAnchors.map((item) => (
            <button
              key={item.key}
              type="button"
              className="services-category-chip"
              onClick={() => jumpToSection(item.target)}
            >
              {t(`products_and_services.revamp.categoryNav.${item.key}`)}
            </button>
          ))}
        </nav>

        <section id="services" className="mb-5">
          <h2 id="core-services" className="title secondary-color text-bold mb-3">
            {t('products_and_services.revamp.core.title')}
          </h2>
          <Row className="g-3">
            {Object.entries(t('products_and_services.revamp.core.items', { returnObjects: true })).map(([key, service]) => (
              <Col xs={12} md={6} lg={4} key={key} id={key === 'residentialRegular' ? 'residential' : key === 'commercialRegular' ? 'commercial' : key === 'carpetCleaning' ? 'carpet' : undefined}>
                <Card className="h-100 shadow-sm bg-transparent service-revamp-card">
                  <Card.Body className="d-flex flex-column">
                    <Card.Title as="h3" className="h5 text-cleanar-color text-bold mb-2">{service.name}</Card.Title>
                    <Card.Text className="mb-2 text-muted">{service.description}</Card.Text>
                    <p className="small mb-3 text-cleanar-color"><strong>{t('products_and_services.revamp.core.bestForLabel')}</strong> {service.bestFor}</p>
                    <Button as={Link} to={quoteLink(CORE_SERVICE_QUERY[key])} className="btn-round secondary-bg-color mt-auto">
                      {t('products_and_services.revamp.core.cta')}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        <section id="cleaning-packages" className="mb-5">
          <h2 className="title secondary-color text-bold mb-2">{t('products_and_services.revamp.packages.title')}</h2>
          <p className="text-muted mb-3">{t('products_and_services.revamp.packages.description')}</p>
          <Row className="g-3">
            {t('products_and_services.revamp.packages.items', { returnObjects: true }).map((pkg) => (
              <Col xs={12} md={4} key={pkg.name}>
                <Card className="h-100 shadow-sm bg-transparent service-revamp-card">
                  <Card.Body>
                    <Card.Title as="h3" className="h5 text-cleanar-color text-bold">{pkg.name}</Card.Title>
                    <p className="text-muted mb-2">{pkg.pricing}</p>
                    <p className="small mb-0">{pkg.note}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        <section id="add-ons" className="mb-5">
          <h2 className="title secondary-color text-bold mb-2">{t('products_and_services.revamp.addons.title')}</h2>
          <p className="text-muted mb-3">{t('products_and_services.revamp.addons.description')}</p>
          <Row className="g-3">
            {Object.values(t('products_and_services.revamp.addons.groups', { returnObjects: true })).map((group) => (
              <Col xs={12} md={6} key={group.title}>
                <Card className="h-100 shadow-sm bg-transparent service-revamp-card">
                  <Card.Body>
                    <Card.Title as="h3" className="h6 text-cleanar-color text-bold">{group.title}</Card.Title>
                    <ul className="mb-0 services-compact-list">
                      {group.items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        <section id="carpet-upholstery" className="mb-5">
          <h2 className="title secondary-color text-bold mb-2">{t('products_and_services.revamp.carpetUpholstery.title')}</h2>
          <p className="text-muted mb-3">{t('products_and_services.revamp.carpetUpholstery.description')}</p>
          <Row className="g-3">
            {Object.values(t('products_and_services.revamp.carpetUpholstery.columns', { returnObjects: true })).map((column) => (
              <Col xs={12} md={6} key={column.title}>
                <Card className="h-100 shadow-sm bg-transparent service-revamp-card">
                  <Card.Body>
                    <Card.Title as="h3" className="h5 text-cleanar-color text-bold">{column.title}</Card.Title>
                    <ul className="mb-0 services-compact-list">
                      {column.items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        <section id="specialty-services" className="mb-5">
          <h2 className="title secondary-color text-bold mb-3">{t('products_and_services.revamp.specialty.title')}</h2>
          <Row className="g-3">
            {Object.entries(t('products_and_services.revamp.specialty.items', { returnObjects: true })).map(([key, item]) => (
              <Col xs={12} md={4} key={key}>
                <Card className="h-100 shadow premium-service-card">
                  <Card.Body className="d-flex flex-column">
                    <Card.Title as="h3" className="h5 text-bold">{item.name}</Card.Title>
                    <Card.Text className="text-muted mb-3">{item.description}</Card.Text>
                    <Button as={Link} to={quoteLink(SPECIALTY_QUERY[key])} className="btn-round secondary-bg-color mt-auto">
                      {t('products_and_services.revamp.specialty.cta')}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        <section className="mb-5">
          <h2 className="title secondary-color text-bold mb-3">{t('products_and_services.revamp.howItWorks.title')}</h2>
          <ol className="services-steps-list">
            {t('products_and_services.revamp.howItWorks.steps', { returnObjects: true }).map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="services-final-cta">
          <h2 className="title secondary-color text-bold mb-2">{t('products_and_services.revamp.finalCta.title')}</h2>
          <p className="mb-3 text-cleanar-color">{t('products_and_services.revamp.finalCta.description')}</p>
          <Button as={Link} to={quoteLink()} className="btn-round secondary-bg-color">
            {t('products_and_services.revamp.finalCta.button')}
          </Button>
        </section>
      </section>
    </section>
  );
};

export default ProductsAndServices;
