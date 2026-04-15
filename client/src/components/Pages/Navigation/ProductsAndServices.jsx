import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, ListGroup, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import VisitorCounter from "/src/components/Pages/Management/VisitorCounter.jsx";

import carpetAvif from "/src/assets/img/optimized/carpet-cleaning.avif";
import carpetWebp from "/src/assets/img/optimized/carpet-cleaning.webp";
import carpetJpg from "/src/assets/img/carpet-cleaning.jpg";

import residentialAvif from "/src/assets/img/optimized/residential-cleaning.avif";
import residentialWebp from "/src/assets/img/optimized/residential-cleaning.webp";
import residentialJpg from "/src/assets/img/residential-cleaning.jpg";

import commercialAvif from "/src/assets/img/optimized/commercial-cleaning.avif";
import commercialWebp from "/src/assets/img/optimized/commercial-cleaning.webp";
import commercialJpg from "/src/assets/img/commercial-cleaning.jpg";

import pressureAvif from "/src/assets/img/optimized/pressure-cleaning.avif";
import pressureWebp from "/src/assets/img/optimized/pressure-cleaning.webp";
import pressureJpg from "/src/assets/img/pressure-cleaning.jpg";

import windowAvif from "/src/assets/img/optimized/window-cleaning.avif";
import windowWebp from "/src/assets/img/optimized/window-cleaning.webp";
import windowJpg from "/src/assets/img/window-cleaning.jpg";

import pageBg from "/src/assets/img/bg1.png";

const TORONTO_SERVICE_ROUTE_BY_SLUG = {
  "residential-cleaning": "/residential-cleaning-toronto",
  "commercial-cleaning": "/commercial-cleaning-toronto",
  "deep-cleaning": "/deep-cleaning-toronto",
  "move-in-move-out-cleaning": "/move-in-move-out-cleaning-toronto",
  "carpet-upholstery-cleaning": "/carpet-upholstery-cleaning-toronto",
};

const ServiceCard = ({
  title,
  avif,
  webp,
  fallback,
  imgAlt,
  width,
  height,
  description,
  quoteLink,
  quoteButtonText,
  serviceSlug
}) => {
    const servicePageLink = serviceSlug ? TORONTO_SERVICE_ROUTE_BY_SLUG[serviceSlug] : null;
  return (
    <Card className="h-90 shadow-sm bg-transparent">
      <picture>
        <source srcSet={avif} type="image/avif" />
        <source srcSet={webp} type="image/webp" />
        <img
          src={fallback}
          alt={imgAlt}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          className="service-card-img card-img-top"
          style={{ width: "100%", height: "auto" }}
          sizes="(max-width: 767px) 92vw, (max-width: 1200px) 30vw, 360px"
        />
      </picture>

      <Card.Body className="d-flex flex-column">
        <Card.Title as="h3" className="text-bold text-cleanar-color">
          {title}
        </Card.Title>

        <ListGroup className="flex-grow-1 mb-3">
          {Array.isArray(description) ? (
            description.map((item, index) => (
              <ListGroup.Item key={index} className="px-0 py-1 border-0 bg-transparent">
                {item}
              </ListGroup.Item>
            ))
          ) : (
            <ListGroup.Item className="px-0 py-1 border-0 bg-transparent">
              {description}
            </ListGroup.Item>
          )}
        </ListGroup>

        <div className="d-flex flex-column gap-2 mt-auto">
          {servicePageLink ? (
            <Button as={Link} to={servicePageLink} variant="outline-secondary" className="btn-round">
              Learn More
            </Button>
          ) : null}
          <Button
            href={quoteLink}
            data-track={`clicked_add_to_quote_${title.replace(/\s+/g, "_").toLowerCase()}`}
            className="btn-round secondary-bg-color"
          >
            {quoteButtonText}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

const ProductsAndServices = () => {
  const { t, i18n } = useTranslation();

  const servicesData = [
    {
      title: t("products_and_services.residential_cleaning_title"),
      avif: residentialAvif,
      webp: residentialWebp,
      fallback: residentialJpg,
      imgAlt: "Cleaning technician mopping the floor - Designed by Freepik",
      width: 5906,
      height: 3937,
      description: t("products_and_services.residential_cleaning_description", { returnObjects: true }),
      quoteLink: "/?service=Residential+Cleaning",
      quoteButtonText: t("products_and_services.residential_cleaning_button"),
      serviceSlug: "residential-cleaning"
    },
    {
      title: t("products_and_services.commercial_cleaning_title"),
      avif: commercialAvif,
      webp: commercialWebp,
      fallback: commercialJpg,
      imgAlt: "Cleaners on office cleaning desks and floor - Designed by Freepik",
      width: 4536,
      height: 3024,
      description: t("products_and_services.commercial_cleaning_description", { returnObjects: true }),
      quoteLink: "/?service=Commercial+Cleaning",
      quoteButtonText: t("products_and_services.commercial_cleaning_button"),
      serviceSlug: "commercial-cleaning"
    },
    {
      title: t("products_and_services.window_cleaning_title"),
      avif: windowAvif,
      webp: windowWebp,
      fallback: windowJpg,
      imgAlt: "Window cleaning - Designed by Freepik",
      width: 1024,
      height: 683,
      description: t("products_and_services.window_cleaning_description", { returnObjects: true }),
      quoteLink: "/?service=Window+Cleaning",
      quoteButtonText: t("products_and_services.window_cleaning_button"),
      serviceSlug: "window-cleaning"
    },
    {
      title: t("products_and_services.carpet_cleaning_title"),
      avif: carpetAvif,
      webp: carpetWebp,
      fallback: carpetJpg,
      imgAlt: "Carpet cleaning, vacuum cleaner on carpet - Designed by Freepik",
      width: 1024,
      height: 683,
      description: t("products_and_services.carpet_cleaning_description", { returnObjects: true }),
      quoteLink: "/?service=Carpet+And+Upholstery",
      quoteButtonText: t("products_and_services.carpet_and_upholstery_button"),
      serviceSlug: "carpet-upholstery-cleaning"
    },
    {
      title: t("products_and_services.power_washing_title"),
      avif: pressureAvif,
      webp: pressureWebp,
      fallback: pressureJpg,
      imgAlt: "Power washing - Designed by Freepik",
      width: 1024,
      height: 683,
      description: t("products_and_services.power_washing_description", { returnObjects: true }),
      quoteLink: "/?service=Power/Pressure+Washing",
      quoteButtonText: t("products_and_services.power_pressure_washing_button"),
      serviceSlug: "pressure-cleaning"
    }
  ];

  useEffect(() => {
    document.body.classList.add("products-services-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    window.scrollTo(0, 0);

    return function cleanup() {
      document.body.classList.remove("products-services-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, [i18n.language]);

  return (
    <section className="section-background" style={{ backgroundImage: `url(${pageBg})` }}>
      <VisitorCounter page={"products-and-services"} />

      <section>
        <h1 className="title primary-color text-center mb-4 pt-5 text-bold">
          {t("products_and_services.products_services_title")}
        </h1>

        <div className="service-selector mb-5">
          <h2 className="title secondary-color mb-4 text-bold">
            {t("products_and_services.our_services_title")}
          </h2>

          <p className="text-left mb-4 text-cleanar-color text-bold">
            {t("products_and_services.our_services_description")}
          </p>

          <p className="fs-6 text-cleanar-color mt-3">
            {t("issa.prefix")}{" "}
            <a
              href="https://issa-canada.com/en/issa-canada-en/about-issa-canada-en"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("issa.linkText")}
            </a>
            {t("issa.suffix")}
          </p>

          <Row className="justify-content-center">
            {servicesData.map((service, index) => (
              <Col xs={12} md={4} key={index} className="d-flex align-items-stretch mb-1 mt-1">
                <ServiceCard {...service} />
              </Col>
            ))}
          </Row>

          <div className="mt-4 text-cleanar-color">
            <h3 className="h5 text-bold">Toronto Service Pages</h3>
            <p className="mb-2">
              Browse our dedicated location pages to compare cleaning options by property type and project scope.
            </p>
            <ul className="mb-0">
              <li><Link to="/residential-cleaning-toronto">residential cleaning in Toronto</Link></li>
              <li><Link to="/commercial-cleaning-toronto">commercial cleaning in Toronto</Link></li>
              <li><Link to="/deep-cleaning-toronto">deep cleaning in Toronto</Link></li>
              <li><Link to="/move-in-move-out-cleaning-toronto">move-in and move-out cleaning in Toronto</Link></li>
              <li><Link to="/carpet-upholstery-cleaning-toronto">carpet and upholstery cleaning in Toronto</Link></li>
            </ul>
          </div>
        </div>

        <div className="product-selector">
          <h2 className="title primary-color mb-4 text-bold">
            {t("products_and_services.our_products_title")}
          </h2>

          <Row className="g-4 justify-content-center">
            <Col xs={12} md={4} className="d-flex align-items-stretch">
              <Card className="h-100 card-border shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <Card.Title as="h3" className="text-bold primary-color">
                    {t("products_and_services.coming_soon")}
                  </Card.Title>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </section>
    </section>
  );
};

export default ProductsAndServices;
