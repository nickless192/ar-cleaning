import React, { useEffect, useMemo, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import VisitorCounter from "/src/components/Pages/Management/VisitorCounter.jsx";
import ContactUs from "../components/Pages/Landing/ContactUs";
import { Card, ListGroupItem, Row, Col } from "reactstrap";
import MetaTags from "/src/components/Pages/Management/MetaTags.jsx";
import QuoteRequest from "../components/Pages/UserJourney/QuoteRequest";
import BusinessHoursSidebar from "/src/components/Pages/UserJourney/BusinessHourSidebar";
import WhyChooseUs from "/src/components/Pages/Landing/WhyChooseUs";
import FeaturedServices from "/src/components/Pages/Landing/FeaturedServices";
import ReviewsCarousel from "/src/components/Pages/Landing/ReviewsCarousel";
import FAQAccordion from "/src/components/Pages/Landing/FAQAccordion";
import StickyButtons from "/src/components/Pages/Landing/StickyButtons.jsx";
import ISSAMembershipBadge from "/src/components/Pages/Certifications/ISSAMembershipBadge.jsx";
import CQCCCertificationBadge from "/src/components/Pages/Certifications/CQCCCertificationBadge";
import { useTranslation } from "react-i18next";
import {
  FaFileInvoiceDollar,
  FaBroom,
  FaStar,
  FaPhoneAlt,
  FaSms
} from "react-icons/fa";


function Index() {
  const [availabilityStatus, setAvailabilityStatus] = useState("");
  const [responseTimeMessage, setResponseTimeMessage] = useState("");
  // const [showProof, setShowProof] = useState(false);
  const [showProof, setShowProof] = useState(() => window.innerWidth >= 992);


  const location = useLocation();
  const { t, i18n } = useTranslation();

  const goToQuote = () => {
    const nameInput = document.getElementById("floatingName");
    if (nameInput) nameInput.focus({ preventScroll: false });
    document.getElementById("quote-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const quickLinks = useMemo(
    () => [
      {
        title: t("index.cta_text") || "Get a Free Quote",
        subtitle: t("index.ctaNote") || "Takes ~60 seconds",
        onClick: goToQuote,
        variant: "primary",
        Icon: FaFileInvoiceDollar,
        track: "hero-cta-quote",
      },
      {
        title: t("index.contact_services") || "Services",
        subtitle: t("index.services_description") || "See options & pricing",
        to: "/products-and-services",
        variant: "secondary",
        Icon: FaBroom,
        track: "hero-cta-services",
      },
      {
        title: t("index.reviews") || "Reviews",
        subtitle: t("index.feedback_additional") || "See what clients say",
        href: "https://g.page/r/Cek9dkmHVuBKEAE/review",
        variant: "secondary",
        Icon: FaStar,
        track: "hero-cta-reviews",
      },
      {
        title: t("index.cta.call") || "Call",
        subtitle: t("index.cta.callNote") || "Fastest response",
        href: "tel:+14374405514",
        variant: "secondary",
        Icon: FaPhoneAlt,
        track: "hero-cta-call",
      },
      {
        title: t("index.cta.text") || "Text",
        subtitle: t("index.cta.textNote") || "Quick SMS quote",
        href: "sms:+14374405514?&body=Hi%20CleanAR%20Solutions!%20I%E2%80%99d%20like%20a%20quote%20for...",
        variant: "secondary",
        Icon: FaSms,
        track: "hero-cta-text",
      }
    ],
    [t, i18n.language]
  );

  const contactItems = useMemo(
    () => [
      {
        icon: "now-ui-icons tech_mobile",
        link: "business-hours",
        text: t("index.contact_business_hours"),
        description: availabilityStatus,
        additionalInfo: responseTimeMessage,
        color: "text-primary",
      },
      {
        icon: "now-ui-icons ui-1_email-85",
        link:
          "mailto:info@cleanARsolutions.ca?subject=Cleaning%20Service%20Request&body=Hi%20CleanAR%20Solutions%2C%0A%0AI'd%20like%20to%20request%20information%20for...",
        text: t("index.contact_email_support"),
        description: t("index.email_description"),
        additionalInfo: t("index.email_additional"),
        color: "text-success",
      },
      {
        icon: "now-ui-icons business_bulb-63",
        link: "https://g.page/r/Cek9dkmHVuBKEAE/review",
        text: t("index.contact_feedback"),
        description: t("index.feedback_description"),
        additionalInfo: t("index.feedback_additional"),
        color: "text-warning",
      },
      {
        icon: "now-ui-icons business_badge",
        link: "/products-and-services",
        text: t("index.contact_services"),
        description: t("index.services_description"),
        additionalInfo: t("index.services_additional"),
        color: "text-info",
      },
    ],
    [t, availabilityStatus, responseTimeMessage]
  );

  // Optional: simple “popular services” chips to push internal traffic
  const popularServices = useMemo(
    () => [
      { label: t("index.popular.deep") || "Deep Clean", to: "/products-and-services" },
      { label: t("index.popular.move") || "Move In/Out", to: "/products-and-services" },
      { label: t("index.popular.office") || "Office Cleaning", to: "/products-and-services" },
      { label: t("index.popular.carpet") || "Carpet/Upholstery", to: "/products-and-services" },
    ],
    [t]
  );

  useEffect(() => {
    const currentTime = new Date();
    const currentDay = currentTime.getDay();
    const currentHour = currentTime.getHours();

    const isBusinessHours =
      (currentDay >= 1 && currentDay <= 5 && currentHour >= 8 && currentHour < 19) ||
      (currentDay === 6 && currentHour >= 8 && currentHour < 13);

    if (isBusinessHours) {
      setAvailabilityStatus(t("index.status_online"));
      setResponseTimeMessage(t("index.response_now"));
    } else {
      setAvailabilityStatus(t("index.status_offline"));
      setResponseTimeMessage(t("index.response_later"));
    }

    document.body.classList.add("index-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");

    return function cleanup() {
      document.body.classList.remove("index-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, [location.search, location.state, i18n.language, t]);

  return (
    <>
      <MetaTags />
      <VisitorCounter />

      {/* HERO (interaction-first) */}
      <section className="container pt-4 pt-md-5 pb-2">
        <Row className="g-4 align-items-start">
          {/* Left: message + actions */}
          <Col xs="12" lg="7" className="text-center text-lg-start">
            <motion.h1
              className="secondary-color montserrat-bold m-0"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              style={{ fontSize: "clamp(2.1rem, 4vw, 3.2rem)", lineHeight: 1.05 }}
            >
              {t("index.companyName")}
            </motion.h1>

            <motion.h2
              className="text-secondary m-0 pt-2 text-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.12 }}
              style={{ fontSize: "clamp(1.05rem, 1.7vw, 1.35rem)" }}
            >
              {t("index.tagline")}
            </motion.h2>

            {/* Status line near CTA to increase trust */}
            <motion.div
              className="mt-3 d-flex flex-wrap gap-2 justify-content-center justify-content-lg-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.16 }}
            >
              <span className="badge bg-light text-dark border">
                {availabilityStatus || t("index.status_offline")}
              </span>
              <span className="badge bg-light text-dark border">
                {responseTimeMessage || t("index.response_later")}
              </span>
              <span className="badge bg-light text-dark border">
                Toronto & GTA
              </span>
            </motion.div>

            {/* Shorter intro (scannable) */}
            <motion.p
              className="martel-bold landing-page-intro mt-3 mb-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{ maxWidth: "50rem" }}
            >
              <strong>{t("index.intro")}</strong>
            </motion.p>

            <motion.p
              className="text-muted mt-2 mb-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.24 }}
              style={{ maxWidth: "50rem" }}
            >
              {t("index.details")} {t("index.services")}
            </motion.p>

            {/* Popular services chips (internal traffic boost) */}
            <motion.div
              className="mt-3 d-flex gap-2 flex-wrap justify-content-center justify-content-lg-start"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
            >
              {popularServices.map((s, idx) => (
                <Link
                  key={idx}
                  to={s.to}
                  className="btn btn-sm btn-outline-secondary rounded-pill"
                  data-track="popular-service"
                >
                  {s.label}
                </Link>
              ))}
            </motion.div>

            {/* Quick actions (big click targets) */}
            <motion.div
              className="mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 }}
            >
              <div className="row g-2">
                {quickLinks.map((q, idx) => {
                  const cardBody = (
                    <div className="cleanar-actioncard h-100">
                      <div className="d-flex align-items-start gap-2">
                        <div
                          className={`cleanar-actioncard__icon ${q.variant === "primary" ? "text-success" : "text-secondary"
                            }`}
                        >
                          <q.Icon size={20} />
                        </div>

                        <div className="flex-grow-1">
                          <div className="fw-bold">{q.title}</div>
                          <div className="text-muted small">{q.subtitle}</div>
                        </div>
                      </div>
                    </div>
                  );

                  return (
                    <div className="col-12 col-md-4" key={idx}>
                      {q.onClick ? (
                        <button
                          type="button"
                          className={`w-100 text-start btn p-0 ${q.variant === "primary" ? "" : ""}`}
                          onClick={q.onClick}
                          data-track={q.track}
                          style={{ border: "none", background: "transparent" }}
                        >
                          {cardBody}
                        </button>
                      ) : q.href ? (
                        <a
                          className="text-decoration-none"
                          href={q.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          data-track={q.track}
                        >
                          {cardBody}
                        </a>
                      ) : (
                        <Link className="text-decoration-none" to={q.to} data-track={q.track}>
                          {cardBody}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </Col>

          {/* Right: contact list as clickable cards */}
          <Col xs="12" lg="5">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="mx-0 mx-md-2"
            >
              <Card className="cleanar-contactpanel">
                <div className="p-3 pb-2">
                  <div className="fw-bold" style={{ fontSize: "1.05rem" }}>
                    {t("index.contact_title") || "Contact options"}
                  </div>
                  <div className="text-muted small">
                    {t("index.contact_subtitle") || "Pick one — we reply fast."}
                  </div>
                </div>

                {/* Collapsible Proof (badges) */}
                <motion.div
                  className="mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.36 }}
                >
                  <button
                    type="button"
                    className="btn btn-link p-0 text-decoration-none"
                    onClick={() => setShowProof((v) => !v)}
                    aria-expanded={showProof}
                  >
                    <span className="fw-bold">
                      {showProof
                        ? (t("index.proof.hide") || "Hide trust proof")
                        : (t("index.proof.show") || "Show certifications & memberships")}
                    </span>{" "}
                    <span className="text-muted small">{showProof ? "▲" : "▼"}</span>
                  </button>

                  {showProof && (
                    <div className="mt-3 d-grid gap-2">
                      <div className="cleanar-proofbox">
                        <ISSAMembershipBadge className="m-0" layout="horizontal" />
                        <div className="mt-1">
                          <Link to="/blog/cleanar-solutions-joins-issa-canada" className="small text-primary">
                            {t("index.certification.ctaSecondary")}
                          </Link>
                        </div>
                      </div>
                      <div className="cleanar-proofbox">
                        <CQCCCertificationBadge className="m-0" layout="horizontal" />
                      </div>
                    </div>
                  )}
                </motion.div>

                <div className="px-3 pb-3">
                  <button
                    className="btn btn-success btn-lg w-100 rounded-pill"
                    onClick={goToQuote}
                    data-track="contactpanel-quote"
                  >
                    {t("quick_quote.form.title")}
                  </button>
                </div>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </section>

      <ReviewsCarousel />

      {/* BODY */}
      <div className="container">
        <Row>
          <Col xs="12" md="12" className="p-0" id="quote-section">
            <QuoteRequest initialData={{}} />
          </Col>
        </Row>
        <WhyChooseUs />
        <FeaturedServices />

        <ToastContainer position="top-center" autoClose={2000} />
        <Row>
          <Col xs="12" md="12" className="p-0">
            <ContactUs />
          </Col>
        </Row>

        <FAQAccordion />
        <StickyButtons />
      </div>
    </>
  );
}

export default Index;
