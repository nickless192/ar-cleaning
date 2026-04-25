import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Button, Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import VisitorCounter from "/src/components/Pages/Management/VisitorCounter.jsx";
import pageBg from "/src/assets/img/bg1.png";

const MOBILE_MAX_WIDTH = 767;

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

const SERVICE_ROUTE_BY_KEY = {
  residentialRegular: '/services/residential-cleaning',
  residentialDeep: '/services/deep-cleaning',
  moveInOut: '/services/move-in-move-out-cleaning',
  commercialRegular: '/services/commercial-cleaning',
  commercialDeep: '/services/commercial-deep-cleaning',
  carpetCleaning: '/services/carpet-cleaning',
  upholsteryCleaning: '/services/upholstery-cleaning',
  postConstruction: '/services/post-construction-cleaning',
  fullUnitCleanOut: '/services/full-unit-clean-out',
  monthlyBuilding: '/services/monthly-building-amenities-cleaning'
};

const ProductsAndServices = () => {
  const { t, i18n } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('core');
  const [isMobile, setIsMobile] = useState(false);
  const [headerOffset, setHeaderOffset] = useState(120);
  const [openSections, setOpenSections] = useState({
    core: true,
    packages: false,
    addons: false,
    carpetUpholstery: false,
    specialty: false,
    howItWorks: false
  });

  const coreItems = t('products_and_services.revamp.core.items', { returnObjects: true });
  const packageItems = t('products_and_services.revamp.packages.items', { returnObjects: true });
  const addonGroups = t('products_and_services.revamp.addons.groups', { returnObjects: true });
  const carpetColumns = t('products_and_services.revamp.carpetUpholstery.columns', { returnObjects: true });
  const specialtyItems = t('products_and_services.revamp.specialty.items', { returnObjects: true });
  const howItWorksSteps = t('products_and_services.revamp.howItWorks.steps', { returnObjects: true });
  const howItWorksDescriptions = t('products_and_services.revamp.howItWorks.stepDescriptions', { returnObjects: true });

  const howItWorksItems = useMemo(
    () => howItWorksSteps.map((title, index) => ({ title, description: howItWorksDescriptions[index] || '' })),
    [howItWorksDescriptions, howItWorksSteps]
  );

  const sectionMeta = useMemo(() => {
    const addonsCount = Object.values(addonGroups).reduce((total, group) => total + group.items.length, 0);
    const carpetCount = Object.values(carpetColumns).reduce((total, column) => total + column.items.length, 0);

    return {
      core: {
        summary: t('products_and_services.revamp.mobileSectionDescriptions.core'),
        count: Object.keys(coreItems).length
      },
      packages: {
        summary: t('products_and_services.revamp.mobileSectionDescriptions.packages'),
        count: packageItems.length
      },
      addons: {
        summary: t('products_and_services.revamp.mobileSectionDescriptions.addons'),
        count: addonsCount
      },
      carpetUpholstery: {
        summary: t('products_and_services.revamp.mobileSectionDescriptions.carpetUpholstery'),
        count: carpetCount
      },
      specialty: {
        summary: t('products_and_services.revamp.mobileSectionDescriptions.specialty'),
        count: Object.keys(specialtyItems).length
      },
      howItWorks: {
        summary: t('products_and_services.revamp.mobileSectionDescriptions.howItWorks'),
        count: howItWorksItems.length
      }
    };
  }, [addonGroups, carpetColumns, coreItems, howItWorksItems.length, packageItems.length, specialtyItems, t]);

  const getHeaderHeight = () => {
    const header = document.querySelector('.fixed-top-container') || document.querySelector('.navbar');
    return header ? header.getBoundingClientRect().height : 90;
  };

  const scrollToSection = (targetId) => {
    const section = document.getElementById(targetId);
    if (section) {
      const y = section.getBoundingClientRect().top + window.pageYOffset - getHeaderHeight() - 16;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const quoteLink = (serviceQuery) => (serviceQuery
    ? `/?service=${serviceQuery}&scrollToQuote=true`
    : '/?scrollToQuote=true');

  const getDisplayListItem = (item) => (item.includes('–') ? item.split('–')[1].trim() : item);

  const toggleSection = (sectionKey) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const isSectionVisible = (sectionKey) => !isMobile || !!openSections[sectionKey];

  const openAndScrollToSection = (sectionKey, targetId) => {
    if (isMobile) {
      setOpenSections((prev) => ({
        ...prev,
        [sectionKey]: true
      }));
      window.setTimeout(() => scrollToSection(targetId), 80);
    } else {
      scrollToSection(targetId);
    }
  };

  useEffect(() => {
    const updateViewport = () => {
      setIsMobile(window.innerWidth <= MOBILE_MAX_WIDTH);
      setHeaderOffset(getHeaderHeight() + 16);
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

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

  useEffect(() => {
    if (!window.location.hash) {
      return;
    }
    const hashId = window.location.hash.replace('#', '');
    window.setTimeout(() => scrollToSection(hashId), 80);
  }, []);

  return (
    <section
      className="section-background services-revamp"
      style={{
        backgroundImage: `url(${pageBg})`,
        '--services-scroll-offset': `${headerOffset}px`
      }}
    >
      <VisitorCounter page={'products-and-services'} />

      <Container className="services-page-shell">
        <section className="service-selector pb-5">
          <div id="services-top" className="services-hero pt-5 mb-4">
            <h1 className="title primary-color text-bold mb-3">
              {t('products_and_services.revamp.hero.title')}
            </h1>
            <p className="text-cleanar-color mb-4 services-hero-subtitle">
              {t('products_and_services.revamp.hero.subtitle')}
            </p>

            <div className="d-flex flex-wrap gap-2 mb-4 services-trust-grid" aria-label={t('products_and_services.revamp.hero.trustLabel')}>
              {t('products_and_services.revamp.hero.trustChips', { returnObjects: true }).map((chip) => (
                <span key={chip} className="services-trust-chip">{chip}</span>
              ))}
            </div>

            <div className="d-flex flex-wrap gap-2 services-hero-cta-wrap">
              <Button as={Link} to={quoteLink()} className="btn-round secondary-bg-color services-hero-primary-cta">
                {t('products_and_services.revamp.hero.primaryCta')}
              </Button>
              <Button variant="outline-secondary" className="btn-round services-hero-secondary-cta" onClick={() => scrollToSection('services')}>
                {t('products_and_services.revamp.hero.secondaryCta')}
              </Button>
            </div>
          </div>

          <nav className="services-category-nav mb-4" aria-label={t('products_and_services.revamp.categoryNav.ariaLabel')}>
            {categoryAnchors.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`services-category-chip ${activeCategory === item.key ? 'is-active' : ''}`}
                onClick={() => {
                  setActiveCategory(item.key);
                  openAndScrollToSection(item.key, item.target);
                }}
              >
                {t(`products_and_services.revamp.categoryNav.${item.key}`)}
              </button>
            ))}
          </nav>

          <section id="services" className="mb-5 services-section-panel">
            <div className="services-section-head">
              <h2 id="core-services" className="title secondary-color text-bold mb-3">
                {t('products_and_services.revamp.core.title')}
              </h2>
              <button type="button" className="services-back-to-top" onClick={() => scrollToSection('services-top')}>
                {t('products_and_services.revamp.backToTop')}
              </button>
            </div>
            {isMobile ? (
              <button
                type="button"
                className="services-mobile-section-toggle"
                aria-expanded={isSectionVisible('core')}
                aria-controls="services-section-core"
                onClick={() => toggleSection('core')}
              >
                <span className="services-mobile-toggle-copy">
                  <span>{sectionMeta.core.summary}</span>
                  <small>{t('products_and_services.revamp.mobileSummaryCount', { count: sectionMeta.core.count })}</small>
                </span>
                <span>{isSectionVisible('core') ? '−' : '+'}</span>
              </button>
            ) : null}
            <div id="services-section-core" hidden={isMobile && !openSections.core} className="services-collapsible-content">
              <Row className="g-3">
                {Object.entries(coreItems).map(([key, service]) => (
                  <Col xs={12} md={6} lg={4} key={key} id={key === 'residentialRegular' ? 'residential' : key === 'commercialRegular' ? 'commercial' : key === 'carpetCleaning' ? 'carpet' : undefined}>
                    <Card className="h-100 service-revamp-card">
                      <Card.Body className="d-flex flex-column">
                        <span className="service-card-kicker">{t('products_and_services.revamp.categoryNav.core')}</span>
                        <Card.Title as="h3" className="h5 text-cleanar-color text-bold mb-2">{service.name}</Card.Title>
                        <Card.Text className="mb-2 text-muted services-card-description">{service.description}</Card.Text>
                        <p className="small mb-3 text-cleanar-color"><strong>{t('products_and_services.revamp.core.bestForLabel')}</strong> {service.bestFor}</p>
                        <div className="services-card-actions mt-auto">
                          {SERVICE_ROUTE_BY_KEY[key] ? (
                            <Link to={SERVICE_ROUTE_BY_KEY[key]} className="services-inline-link text-cleanar-color text-bold">
                              {t('products_and_services.revamp.learnMore')}
                            </Link>
                          ) : null}
                          <Button as={Link} to={quoteLink(CORE_SERVICE_QUERY[key])} className="btn-round secondary-bg-color">
                            {t('products_and_services.revamp.core.cta')}
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </section>

          <section id="cleaning-packages" className="mb-5 services-section-panel">
            <div className="services-section-head">
              <h2 className="title secondary-color text-bold mb-2">{t('products_and_services.revamp.packages.title')}</h2>
              <button type="button" className="services-back-to-top" onClick={() => scrollToSection('services-top')}>
                {t('products_and_services.revamp.backToTop')}
              </button>
            </div>
            {isMobile ? (
              <button
                type="button"
                className="services-mobile-section-toggle"
                aria-expanded={isSectionVisible('packages')}
                aria-controls="services-section-packages"
                onClick={() => toggleSection('packages')}
              >
                <span className="services-mobile-toggle-copy">
                  <span>{sectionMeta.packages.summary}</span>
                  <small>{t('products_and_services.revamp.mobileSummaryCount', { count: sectionMeta.packages.count })}</small>
                </span>
                <span>{isSectionVisible('packages') ? '−' : '+'}</span>
              </button>
            ) : null}
            <div id="services-section-packages" hidden={isMobile && !openSections.packages} className="services-collapsible-content">
              <p className="text-muted mb-3">{t('products_and_services.revamp.packages.description')}</p>
              <p className="services-subtle-note">{t('products_and_services.revamp.packages.customizedNote')}</p>
              <Row className="g-3">
                {packageItems.map((pkg) => (
                  <Col xs={12} md={4} key={pkg.name}>
                    <Card className="h-100 service-revamp-card service-package-card">
                      <Card.Body>
                        <span className="service-card-kicker">{t('products_and_services.revamp.categoryNav.packages')}</span>
                        <Card.Title as="h3" className="h5 text-cleanar-color text-bold">{pkg.name}</Card.Title>
                        <p className="text-muted mb-2">{pkg.pricing}</p>
                        <p className="small mb-0">{pkg.note}</p>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </section>

          <section id="add-ons" className="mb-5 services-section-panel">
            <div className="services-section-head">
              <h2 className="title secondary-color text-bold mb-2">{t('products_and_services.revamp.addons.title')}</h2>
              <button type="button" className="services-back-to-top" onClick={() => scrollToSection('services-top')}>
                {t('products_and_services.revamp.backToTop')}
              </button>
            </div>
            {isMobile ? (
              <button
                type="button"
                className="services-mobile-section-toggle"
                aria-expanded={isSectionVisible('addons')}
                aria-controls="services-section-addons"
                onClick={() => toggleSection('addons')}
              >
                <span className="services-mobile-toggle-copy">
                  <span>{sectionMeta.addons.summary}</span>
                  <small>{t('products_and_services.revamp.mobileSummaryCount', { count: sectionMeta.addons.count })}</small>
                </span>
                <span>{isSectionVisible('addons') ? '−' : '+'}</span>
              </button>
            ) : null}
            <div id="services-section-addons" hidden={isMobile && !openSections.addons} className="services-collapsible-content">
              <p className="text-muted mb-3">{t('products_and_services.revamp.addons.description')}</p>
              <Row className="g-3">
                {Object.values(addonGroups).map((group) => (
                  <Col xs={12} md={6} key={group.title}>
                    <Card className="h-100 service-revamp-card">
                      <Card.Body>
                        <Card.Title as="h3" className="h6 text-cleanar-color text-bold">{group.title}</Card.Title>
                        <div className="services-pills-list">
                          {group.items.map((item) => <span key={item} className="services-item-pill">{item}</span>)}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </section>

          <section id="carpet-upholstery" className="mb-5 services-section-panel">
            <div className="services-section-head">
              <h2 className="title secondary-color text-bold mb-2">{t('products_and_services.revamp.carpetUpholstery.title')}</h2>
              <button type="button" className="services-back-to-top" onClick={() => scrollToSection('services-top')}>
                {t('products_and_services.revamp.backToTop')}
              </button>
            </div>
            {isMobile ? (
              <button
                type="button"
                className="services-mobile-section-toggle"
                aria-expanded={isSectionVisible('carpetUpholstery')}
                aria-controls="services-section-carpet-upholstery"
                onClick={() => toggleSection('carpetUpholstery')}
              >
                <span className="services-mobile-toggle-copy">
                  <span>{sectionMeta.carpetUpholstery.summary}</span>
                  <small>{t('products_and_services.revamp.mobileSummaryCount', { count: sectionMeta.carpetUpholstery.count })}</small>
                </span>
                <span>{isSectionVisible('carpetUpholstery') ? '−' : '+'}</span>
              </button>
            ) : null}
            <div id="services-section-carpet-upholstery" hidden={isMobile && !openSections.carpetUpholstery} className="services-collapsible-content">
              <p className="text-muted mb-3">{t('products_and_services.revamp.carpetUpholstery.description')}</p>
              <Row className="g-3">
                {Object.entries(carpetColumns).map(([key, column]) => (
                  <Col xs={12} md={6} key={column.title}>
                    <Card className="h-100 service-revamp-card service-split-card">
                      <Card.Body>
                        <span className="service-card-kicker">{t('products_and_services.revamp.categoryNav.carpetUpholstery')}</span>
                        <Card.Title as="h3" className="h5 text-cleanar-color text-bold">{column.title}</Card.Title>
                        {SERVICE_ROUTE_BY_KEY[`${key}Cleaning`] ? (
                          <Link to={SERVICE_ROUTE_BY_KEY[`${key}Cleaning`]} className="services-inline-link text-cleanar-color text-bold">
                            {t('products_and_services.revamp.learnMore')}
                          </Link>
                        ) : null}
                        <div className="services-pills-list">
                          {column.items.map((item) => <span key={item} className="services-item-pill">{getDisplayListItem(item)}</span>)}
                        </div>
                        <Button as={Link} to={quoteLink(key === 'carpet' ? CORE_SERVICE_QUERY.carpetCleaning : CORE_SERVICE_QUERY.upholsteryCleaning)} className="btn-round secondary-bg-color mt-3">
                          {t('products_and_services.revamp.core.cta')}
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </section>

          <section id="specialty-services" className="mb-5 services-section-panel services-section-panel-premium">
            <div className="services-section-head">
              <h2 className="title secondary-color text-bold mb-3">{t('products_and_services.revamp.specialty.title')}</h2>
              <button type="button" className="services-back-to-top" onClick={() => scrollToSection('services-top')}>
                {t('products_and_services.revamp.backToTop')}
              </button>
            </div>
            {isMobile ? (
              <button
                type="button"
                className="services-mobile-section-toggle"
                aria-expanded={isSectionVisible('specialty')}
                aria-controls="services-section-specialty"
                onClick={() => toggleSection('specialty')}
              >
                <span className="services-mobile-toggle-copy">
                  <span>{sectionMeta.specialty.summary}</span>
                  <small>{t('products_and_services.revamp.mobileSummaryCount', { count: sectionMeta.specialty.count })}</small>
                </span>
                <span>{isSectionVisible('specialty') ? '−' : '+'}</span>
              </button>
            ) : null}
            <div id="services-section-specialty" hidden={isMobile && !openSections.specialty} className="services-collapsible-content">
              <Row className="g-3">
                {Object.entries(specialtyItems).map(([key, item]) => (
                  <Col xs={12} md={4} key={key}>
                    <Card className="h-100 premium-service-card">
                      <Card.Body className="d-flex flex-column">
                        <span className="service-card-kicker">{t('products_and_services.revamp.categoryNav.specialty')}</span>
                        <Card.Title as="h3" className="h5 text-bold">{item.name}</Card.Title>
                        <Card.Text className="text-muted mb-3 services-card-description">{item.description}</Card.Text>
                        <div className="services-card-actions mt-auto">
                          {SERVICE_ROUTE_BY_KEY[key] ? (
                            <Link to={SERVICE_ROUTE_BY_KEY[key]} className="services-inline-link text-cleanar-color text-bold">
                              {t('products_and_services.revamp.learnMore')}
                            </Link>
                          ) : null}
                          <Button as={Link} to={quoteLink(SPECIALTY_QUERY[key])} className="btn-round secondary-bg-color">
                            {t('products_and_services.revamp.specialty.cta')}
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </section>

          <section id="how-it-works" className="mb-4 services-section-panel services-how-compact">
            <div className="services-section-head">
              <h2 className="title secondary-color text-bold mb-3">{t('products_and_services.revamp.howItWorks.title')}</h2>
              <button type="button" className="services-back-to-top" onClick={() => scrollToSection('services-top')}>
                {t('products_and_services.revamp.backToTop')}
              </button>
            </div>
            {isMobile ? (
              <button
                type="button"
                className="services-mobile-section-toggle"
                aria-expanded={isSectionVisible('howItWorks')}
                aria-controls="services-section-how-it-works"
                onClick={() => toggleSection('howItWorks')}
              >
                <span className="services-mobile-toggle-copy">
                  <span>{sectionMeta.howItWorks.summary}</span>
                  <small>{t('products_and_services.revamp.mobileSummaryCount', { count: sectionMeta.howItWorks.count })}</small>
                </span>
                <span>{isSectionVisible('howItWorks') ? '−' : '+'}</span>
              </button>
            ) : null}
            <div id="services-section-how-it-works" hidden={isMobile && !openSections.howItWorks} className="services-collapsible-content">
              <Row className="g-2 g-md-3">
                {howItWorksItems.map((step, index) => (
                  <Col xs={6} md={6} lg={3} key={step.title}>
                    <article className="services-process-card h-100">
                      <span className="services-process-number">{index + 1}</span>
                      <h3 className="h6 text-cleanar-color text-bold mt-2 mb-1">{step.title}</h3>
                      <p className="mb-0 text-muted small">{step.description}</p>
                    </article>
                  </Col>
                ))}
              </Row>
            </div>
          </section>

          <section className="services-final-cta">
            <div className="services-section-head">
              <h2 className="title secondary-color text-bold mb-2">{t('products_and_services.revamp.finalCta.title')}</h2>
              <button type="button" className="services-back-to-top" onClick={() => scrollToSection('services-top')}>
                {t('products_and_services.revamp.backToTop')}
              </button>
            </div>
            <p className="mb-2 text-cleanar-color">{t('products_and_services.revamp.finalCta.description')}</p>
            <p className="services-final-cta-support text-muted mb-3">{t('products_and_services.revamp.finalCta.supportText')}</p>
            <Button as={Link} to={quoteLink()} className="btn-round secondary-bg-color services-final-cta-button">
              {t('products_and_services.revamp.finalCta.button')}
            </Button>
          </section>
        </section>
      </Container>
    </section>
  );
};

export default ProductsAndServices;
