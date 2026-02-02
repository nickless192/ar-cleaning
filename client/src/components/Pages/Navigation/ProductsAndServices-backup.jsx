import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Container,
  Badge,
  Stack,
  Tabs,
  Tab,
  Accordion,
  Modal,
  Form,
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import VisitorCounter from "/src/components/Pages/Management/VisitorCounter.jsx";

import carpetCleaningBg from "/src/assets/img/carpet-cleaning.jpg";
import residentialCleaningBg from "/src/assets/img/residential-cleaning.jpg";
import commercialCleaningBg from "/src/assets/img/commercial-cleaning.jpg";
import pressureCleaningBg from "/src/assets/img/pressure-cleaning.jpg";
import windowCleaningBg from "/src/assets/img/window-cleaning.jpg";
import pageBg from "/src/assets/img/bg1.png";
import {
  FaHome,
  FaBuilding,
  FaHammer,
  FaWind,
  FaCouch,
  FaWater,
  FaLeaf, 
  FaToolbox
} from "react-icons/fa";


const CTA_LABEL_DEFAULT = "Get a Free Quote";

const ServiceCard = ({
  title,
  imgSrc,
  imgAlt,
  summary,
  bullets,
  quoteLink,
  quoteButtonText,
  category,
}) => {

  const iconByCategoryOrKey = {
  Residential: FaHome,
  Commercial: FaBuilding,
  Specialty: FaWind,
};

const iconByTitleHints = [
  { test: /post|construction/i, icon: FaHammer },
  { test: /window/i, icon: FaWind },
  { test: /carpet|upholstery/i, icon: FaCouch },
  { test: /pressure|power/i, icon: FaWater },
];

  const trackingKey = `clicked_add_to_quote_${title
    .replace(/\s+/g, "_")
    .toLowerCase()}`;

  return (
    <Card className="service-card h-100 shadow-sm bg-transparent overflow-hidden">
      <div className="service-card-media">
        {/* <Card.Img
          variant="top"
          src={imgSrc}
          alt={imgAlt}
          className="service-card-img"
          loading="lazy"
        /> */}
        <div className="service-card-media" aria-hidden="true" data-cat={category}>
  <div className="service-card-iconWrap">
    <div className="service-card-iconBubble">
      {(() => {
        const match = iconByTitleHints.find((x) => x.test.test(title));
        const Icon = match?.icon || iconByCategoryOrKey[category] || FaWind;
        return <Icon className="service-card-icon" />;
      })()}
    </div>
  </div>

  <Badge className="service-card-badge" bg="light" text="dark">
    {category}
  </Badge>
</div>

        <Badge className="service-card-badge" bg="light" text="dark">
          {category}
        </Badge>
      </div>

      <Card.Body className="d-flex flex-column">
        <Card.Title as="h3" className="mb-2 text-cleanar-color fw-bold">
          {title}
        </Card.Title>

        {summary ? (
          <Card.Text className="text-muted mb-3" style={{ minHeight: 44 }}>
            {summary}
          </Card.Text>
        ) : (
          <div className="mb-3" />
        )}

        {/* Progressive disclosure: avoid a wall of bullets */}
        <Accordion flush className="mb-3">
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              What’s included
            </Accordion.Header>
            <Accordion.Body className="pt-2">
              <ul className="ps-3 mb-0">
                {(bullets || []).slice(0, 4).map((item, idx) => (
                  <li key={idx} className="mb-2">
                    {item}
                  </li>
                ))}
              </ul>

              {/* If there are more than 4, hint that it’s customizable */}
              {(bullets || []).length > 4 && (
                <div className="text-muted small mt-2">
                  Plus add-ons and custom options available.
                </div>
              )}
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        <Stack direction="horizontal" gap={2} className="mt-auto">
          <Button
            href={quoteLink}
            data-track={trackingKey}
            className="btn-round secondary-bg-color flex-grow-1"
            aria-label={`${quoteButtonText || CTA_LABEL_DEFAULT} for ${title}`}
          >
            {quoteButtonText || CTA_LABEL_DEFAULT}
          </Button>

          {/* Optional secondary action (kept minimal to avoid CTA overload) */}
          <Button
            variant="outline-secondary"
            href="tel:+14374405514"
            className="btn-round"
            aria-label={`Call CleanAR Solutions about ${title}`}
          >
            Call
          </Button>
        </Stack>
      </Card.Body>
    </Card>
  );
};

const ProductTeaserCard = ({
  title,
  blurb,
  bullets = [],
  badgeLabel,
  catKey, // "supplies" | "merch" | "fresh"
  Icon,
  onNotify,
}) => {
  return (
    <Card className="service-card h-100 shadow-sm overflow-hidden">
      {/* Reuse the same visual language as your service cards */}
      <div className="service-card-media" data-cat={catKey} aria-hidden="true">
        <div className="service-card-iconWrap">
          <div className="service-card-iconBubble">
            <Icon className="service-card-icon" />
          </div>
        </div>

        {badgeLabel ? (
          <Badge className="service-card-badge" bg="light" text="dark">
            {badgeLabel}
          </Badge>
        ) : null}
      </div>

      <Card.Body className="d-flex flex-column">
        <Card.Title as="h3" className="mb-2 text-cleanar-color fw-bold">
          {title}
        </Card.Title>

        <Card.Text className="text-muted mb-3" style={{ minHeight: 44 }}>
          {blurb}
        </Card.Text>

        <ul className="ps-3 mb-4">
          {bullets.slice(0, 3).map((b, idx) => (
            <li key={idx} className="mb-2">
              {b}
            </li>
          ))}
        </ul>

        <Stack direction="horizontal" gap={2} className="mt-auto">
          <Button
            className="btn-round secondary-bg-color flex-grow-1"
            onClick={onNotify}
            aria-label={`Notify me about ${title}`}
          >
            Notify me
          </Button>

          <Button
            variant="outline-secondary"
            className="btn-round"
            href="/index?scrollToQuote=true"
            aria-label={`Get a quote from CleanAR Solutions`}
          >
            Get Quote
          </Button>
        </Stack>
      </Card.Body>
    </Card>
  );
};

const ProductsWaitlistCard = ({ onOpenSignup }) => {
  return (
    <Card className="shadow-sm border-0 mt-4">
      <Card.Body className="p-4">
        <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
          <div style={{ maxWidth: 620 }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <h3 className="mb-0 text-cleanar-color fw-bold">Be the first to get access</h3>
              <Badge bg="light" text="dark" className="px-2 py-1">
                Founding list
              </Badge>
            </div>

            <div className="text-muted">
              Join our list for early product launches, member-only bundles, and seasonal discounts.
              <span className="d-block small mt-1">No spam. 1–2 emails/month. Unsubscribe anytime.</span>
            </div>

            <div className="d-flex flex-wrap gap-2 mt-3">
              <Badge bg="light" text="dark" className="px-3 py-2">
                ✔ Early access drops
              </Badge>
              <Badge bg="light" text="dark" className="px-3 py-2">
                ✔ Bundles + refills
              </Badge>
              <Badge bg="light" text="dark" className="px-3 py-2">
                ✔ CleanAR merch kits
              </Badge>
            </div>
          </div>

          <div className="d-flex flex-column gap-2" style={{ minWidth: 260 }}>
            <Button className="btn-round secondary-bg-color" onClick={onOpenSignup}>
              Get launch alerts
            </Button>
            <Button
              variant="outline-secondary"
              className="btn-round"
              href="tel:+14374405514"
              aria-label="Call CleanAR Solutions"
            >
              Call (437) 440-5514
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

const WaitlistModal = ({ show, onHide, initialInterest = "both" }) => {
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState(initialInterest);
  const [submitted, setSubmitted] = useState(false);

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) return;

    // TODO: wire this to your backend or email platform (Mailchimp/Brevo/etc.)
    // Example:
    // await fetch("/api/waitlist", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ email, interest }) });

    setSubmitted(true);
  };

  const resetAndClose = () => {
    setEmail("");
    setInterest("both");
    setSubmitted(false);
    onHide();
  };

  return (
    <Modal show={show} onHide={resetAndClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="text-cleanar-color fw-bold">Get product launch alerts</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {submitted ? (
          <div className="p-2">
            <div className="fw-bold mb-1">You’re on the list ✅</div>
            <div className="text-muted">
              We’ll email you when CleanAR supplies & merch are ready. (No spam.)
            </div>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Email</Form.Label>
              <Form.Control
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                inputMode="email"
                autoComplete="email"
              />
              <Form.Text className="text-muted">1–2 emails per month. Unsubscribe anytime.</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Interested in</Form.Label>
              <Form.Select value={interest} onChange={(e) => setInterest(e.target.value)}>
                <option value="both">Cleaning supplies + merch</option>
                <option value="supplies">Cleaning supplies</option>
                <option value="merch">CleanAR merch kits</option>
                <option value="fresh">Freshness & odor care</option>
              </Form.Select>
            </Form.Group>

            <Button
              type="submit"
              className="btn-round secondary-bg-color w-100"
              disabled={!isValidEmail(email)}
            >
              Join waitlist
            </Button>
          </Form>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" className="btn-round" onClick={resetAndClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
export const ProductsSection = () => {
  const [showSignup, setShowSignup] = useState(false);
  const [interest, setInterest] = useState("both");

  const teasers = useMemo(
    () => [
      {
        key: "supplies",
        catKey: "supplies",
        badgeLabel: "Supplies",
        title: "Eco Cleaning Refills",
        blurb: "The products we actually use on jobs — now curated for your home.",
        bullets: ["Low-scent options", "Condo-friendly", "Great for kitchens & bathrooms"],
        Icon: FaLeaf,
        interestValue: "supplies",
      },
      {
        key: "merch",
        catKey: "merch",
        badgeLabel: "Merch",
        title: "CleanAR Microfiber Kits",
        blurb: "Pro-grade tools + CleanAR branding. Built for fast, streak-free results.",
        bullets: ["Color-coded cloth sets", "Detail brushes & scrub pads", "Bundle deals coming"],
        Icon: FaToolbox,
        interestValue: "merch",
      },
      {
        key: "fresh",
        catKey: "fresh",
        badgeLabel: "Supplies",
        title: "Freshness & Odor Care",
        blurb: "Keep your space feeling clean longer between visits.",
        bullets: ["Enzyme options", "Pet-friendly picks", "Closet & fridge fresheners"],
        Icon: FaWind,
        interestValue: "fresh",
      },
    ],
    []
  );

  const openSignup = (value = "both") => {
    setInterest(value);
    setShowSignup(true);
  };

  return (
    <div className="product-selector mt-5 pt-2">
      <div className="d-flex align-items-end justify-content-between flex-wrap gap-3 mb-3">
        <div>
          <h2 className="primary-color fw-bold mb-1">Products & Merch</h2>
          <p className="text-muted mb-0" style={{ maxWidth: 780 }}>
            Coming soon: CleanAR-approved supplies + branded kits. Join the list to get early access
            and member-only bundles.
          </p>
        </div>

        <Button className="btn-round secondary-bg-color" onClick={() => openSignup("both")}>
          Sign up
        </Button>
      </div>

      <Row className="g-4">
        {teasers.map((p) => (
          <Col key={p.key} xs={12} md={6} lg={4} className="d-flex">
            <ProductTeaserCard
              title={p.title}
              blurb={p.blurb}
              bullets={p.bullets}
              badgeLabel={p.badgeLabel}
              catKey={p.catKey}
              Icon={p.Icon}
              onNotify={() => openSignup(p.interestValue)}
            />
          </Col>
        ))}
      </Row>

      <ProductsWaitlistCard onOpenSignup={() => openSignup("both")} />

      <WaitlistModal
        show={showSignup}
        onHide={() => setShowSignup(false)}
        initialInterest={interest}
      />
    </div>
  );
};

const ProductsAndServices = () => {
  const { t, i18n } = useTranslation();
  const servicesRef = useRef(null);

  const [activeTab, setActiveTab] = useState("all");

  const scrollToServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Build service data with a category for filtering + short summary for scanability
  const servicesData = useMemo(
    () => [
      {
        key: "residential",
        category: "Residential",
        title: t("products_and_services.residential_cleaning_title"),
        imgSrc: residentialCleaningBg,
        imgAlt: "Cleaning technician mopping the floor - Designed by Freepik",
        summary: "Reliable recurring or one-time cleaning for homes and condos.",
        bullets: t("products_and_services.residential_cleaning_description", {
          returnObjects: true,
        }),
        quoteLink: "/index?service=Residential+Cleaning&scrollToQuote=true",
        quoteButtonText: t("products_and_services.residential_cleaning_button"),
      },
      {
        key: "postcon",
        category: "Specialty",
        title: t("products_and_services.post_construction_cleaning_title"),
        imgSrc: residentialCleaningBg, // replace when you have a dedicated image
        imgAlt: "Post-construction cleaning - Designed by Freepik",
        summary: "Dust, debris, and detail cleaning to make the space move-in ready.",
        bullets: t("products_and_services.post_construction_cleaning_description", {
          returnObjects: true,
        }),
        quoteLink: "/index?service=Post-Construction+Cleaning&scrollToQuote=true",
        quoteButtonText: t("products_and_services.post_construction_cleaning_button"),
      },
      {
        key: "commercial",
        category: "Commercial",
        title: t("products_and_services.commercial_cleaning_title"),
        imgSrc: commercialCleaningBg,
        imgAlt: "Cleaners cleaning office desks and floor - Designed by Freepik",
        summary: "After-hours or scheduled cleaning for offices and businesses.",
        bullets: t("products_and_services.commercial_cleaning_description", {
          returnObjects: true,
        }),
        quoteLink: "/index?service=Commercial+Cleaning&scrollToQuote=true",
        quoteButtonText: t("products_and_services.commercial_cleaning_button"),
      },
      {
        key: "windows",
        category: "Specialty",
        title: t("products_and_services.window_cleaning_title"),
        imgSrc: windowCleaningBg,
        imgAlt: "Window cleaning - Designed by Freepik",
        summary: "Streak-free interior windows and glass doors, detail-finished.",
        bullets: t("products_and_services.window_cleaning_description", {
          returnObjects: true,
        }),
        quoteLink: "/index?service=Window+Cleaning&scrollToQuote=true",
        quoteButtonText: t("products_and_services.window_cleaning_button"),
      },
      {
        key: "carpet",
        category: "Specialty",
        title: t("products_and_services.carpet_cleaning_title"),
        imgSrc: carpetCleaningBg,
        imgAlt: "Carpet cleaning vacuum on carpet - Designed by Freepik",
        summary: "Deep clean for carpets and upholstery — stains, allergens, freshness.",
        bullets: t("products_and_services.carpet_cleaning_description", {
          returnObjects: true,
        }),
        quoteLink: "/index?service=Carpet+And+Upholstery&scrollToQuote=true",
        quoteButtonText: t("products_and_services.carpet_and_upholstery_button"),
      },
      {
        key: "pressure",
        category: "Specialty",
        title: t("products_and_services.power_washing_title"),
        imgSrc: pressureCleaningBg,
        imgAlt: "Power washing - Designed by Freepik",
        summary: "Curb-appeal refresh for exterior surfaces and tough grime.",
        bullets: t("products_and_services.power_washing_description", {
          returnObjects: true,
        }),
        quoteLink: "/index?service=Power/Pressure+Washing&scrollToQuote=true",
        quoteButtonText: t("products_and_services.power_pressure_washing_button"),
      },
    ],
    [t]
  );
  

  const filteredServices = useMemo(() => {
    if (activeTab === "all") return servicesData;
    if (activeTab === "residential")
      return servicesData.filter((s) => s.category === "Residential");
    if (activeTab === "commercial")
      return servicesData.filter((s) => s.category === "Commercial");
    return servicesData.filter((s) => s.category === "Specialty");
  }, [activeTab, servicesData]);

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
    <>
      <section
        className="section-background"
        style={{ backgroundImage: `url(${pageBg})` }}
      >
        <VisitorCounter page={"products-and-services"} />

        <Container className="py-5">
          {/* HERO */}
          <div className="text-center mb-4">
            <h1 className="primary-color fw-bold mb-2">
              {t("products_and_services.products_services_title")}
            </h1>

            <p className="text-muted mx-auto" style={{ maxWidth: 780 }}>
              Choose a service, get a quote in under a minute, and we’ll tailor the
              plan to your space — residential or commercial across Toronto & the GTA.
            </p>

            <Stack
              direction="horizontal"
              gap={2}
              className="justify-content-center flex-wrap mt-3"
            >
              <Button className="btn-round secondary-bg-color" onClick={scrollToServices}>
                Get a Free Quote
              </Button>
              <Button
                variant="outline-secondary"
                className="btn-round"
                href="tel:+14374405514"
              >
                Call (437) 440-5514
              </Button>
            </Stack>

            {/* TRUST ROW */}
            <Stack
              direction="horizontal"
              gap={2}
              className="justify-content-center flex-wrap mt-4"
            >
              <Badge bg="light" text="dark" className="px-3 py-2">
                ✔ Insured & trained
              </Badge>
              <Badge bg="light" text="dark" className="px-3 py-2">
                ✔ Eco-friendly options
              </Badge>
              <Badge bg="light" text="dark" className="px-3 py-2">
                ✔ ISSA Canada member
              </Badge>
            </Stack>

            {/* ISSA line: keep it, but make it lighter + skimmable */}
            <p className="small text-muted mt-3 mb-0">
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
          </div>

          {/* SERVICES */}
          <div ref={servicesRef} className="service-selector mt-5">
            <div className="d-flex align-items-end justify-content-between flex-wrap gap-3 mb-3">
              <div>
                <h2 className="secondary-color fw-bold mb-1">
                  {t("products_and_services.our_services_title")}
                </h2>
                <p className="text-muted mb-0" style={{ maxWidth: 780 }}>
                  Pick a category to explore — each quote is customized based on your space,
                  frequency, and add-ons.
                </p>
              </div>
            </div>

            {/* FILTER TABS */}
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k || "all")}
              className="mb-4"
            >
              <Tab eventKey="all" title="All" />
              <Tab eventKey="residential" title="Residential" />
              <Tab eventKey="commercial" title="Commercial" />
              <Tab eventKey="specialty" title="Specialty" />
            </Tabs>

            <Row className="g-4">
              {filteredServices.map((service) => (
                <Col key={service.key} xs={12} md={6} lg={4} className="d-flex">
                  <ServiceCard
                    title={service.title}
                    imgSrc={service.imgSrc}
                    imgAlt={service.imgAlt}
                    summary={service.summary}
                    bullets={Array.isArray(service.bullets) ? service.bullets : [service.bullets]}
                    quoteLink={service.quoteLink}
                    quoteButtonText={service.quoteButtonText}
                    category={service.category}
                  />
                </Col>
              ))}
            </Row>
          </div>

          {/* PRODUCTS (DE-EMPHASIZED) */}
          {/* <div className="product-selector mt-5 pt-2">
            <h2 className="primary-color fw-bold mb-3">
              {t("products_and_services.our_products_title")}
            </h2>

            <Card className="shadow-sm">
              <Card.Body className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div>
                  <div className="fw-bold">{t("products_and_services.coming_soon")}</div>
                  <div className="text-muted small">
                    We’re building a curated product lineup — check back soon.
                  </div>
                </div>
                <Button className="btn-round secondary-bg-color" onClick={scrollToServices}>
                  Get a Free Quote
                </Button>
              </Card.Body>
            </Card>
          </div> */}
          <ProductsSection />

        </Container>

        {/* STICKY CTA (especially for mobile) */}
        <div className="sticky-cta-bar">
          <div className="sticky-cta-inner">
            <div className="sticky-cta-text">
              <div className="fw-bold">Get a quote in 60 seconds</div>
              <div className="small text-muted">Fast • Free • No commitment</div>
            </div>
            <div className="sticky-cta-actions">
              <Button className="btn-round secondary-bg-color" onClick={scrollToServices}>
                Get Quote
              </Button>
              <Button variant="outline-secondary" className="btn-round" href="tel:+14374405514">
                Call
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductsAndServices;
