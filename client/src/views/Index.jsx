import React, { useEffect, useMemo, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import VisitorCounter from "/src/components/Pages/Management/VisitorCounter.jsx";
import ContactUs from "../components/Pages/Landing/ContactUs";
import { Card, Row, Col } from "reactstrap";
import MetaTags from "/src/components/Pages/Management/MetaTags.jsx";
import Hero from "../components/Pages/Landing/Hero.jsx";
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
import { FaFileInvoiceDollar, FaBroom, FaStar, FaPhoneAlt, FaSms } from "react-icons/fa";

function Index() {
  const [availabilityStatus, setAvailabilityStatus] = useState("");
  const [responseTimeMessage, setResponseTimeMessage] = useState("");
  const [showHours, setShowHours] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  const location = useLocation();
  const { t, i18n } = useTranslation();

  const goToQuote = () => {
    const nameInput = document.getElementById("floatingName");
    if (nameInput) nameInput.focus({ preventScroll: false });
    document.getElementById("quote-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <MetaTags />
      <VisitorCounter />

      {/* HERO */}
      <Hero onGoToQuote={goToQuote} />
    

      <ReviewsCarousel />

      <div className="my-3 d-flex justify-content-center">
        <Card className="cleanar-contactpanel" style={{ width: "100%", maxWidth: "720px" }}>
          <div className="p-3">
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
              <div>
                <div className="fw-bold">{t("index.proof.title") || "Certified & trusted"}</div>
                <div className="text-muted small">
                  {t("index.proof.subtitle") || "Memberships & certifications that back our quality."}
                </div>
                <Link
                  to="/blog/cleanar-solutions-joins-issa-canada"
                  className="small text-primary text-decoration-none"
                >
                  {t("certification.ctaSecondary") || "Learn more"}
                </Link>
              </div>

            </div>

            <div className="mt-3 d-flex flex-column flex-sm-row gap-2">
              <div className="cleanar-proofbox d-flex align-items-center justify-content-center flex-fill px-2 py-2">
                <ISSAMembershipBadge className="m-0" layout="horizontal" />
              </div>
              <div className="cleanar-proofbox d-flex align-items-center justify-content-center flex-fill px-2 py-2">
                <CQCCCertificationBadge className="m-0" layout="horizontal" />
              </div>
            </div>
          </div>
        </Card>
      </div>


      {/* BODY */}
      <div className="container">
        <Row>
          <Col xs="12" md="12" className="p-0" id="quote-section">
            <QuoteRequest initialData={{}} />
          </Col>
        </Row>
        <FeaturedServices />

        <ToastContainer position="top-center" autoClose={2000} />

        <FAQAccordion />
        <ContactUs />
        <StickyButtons />
      </div>
    </>
  );
}

export default Index;
