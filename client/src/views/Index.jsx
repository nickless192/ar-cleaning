import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import VisitorCounter from "/src/components/Pages/Management/VisitorCounter.jsx";
import ContactUs from "../components/Pages/Landing/ContactUs";
import { Card, Row, Col } from "reactstrap";
import Hero from "../components/Pages/Landing/Hero.jsx";
import QuoteRequest from "../components/Pages/UserJourney/QuoteRequest";
import FeaturedServices from "/src/components/Pages/Landing/FeaturedServices";
import ReviewsCarousel from "/src/components/Pages/Landing/ReviewsCarousel";
import FAQAccordion from "/src/components/Pages/Landing/FAQAccordion";
import StickyButtons from "/src/components/Pages/Landing/StickyButtons.jsx";
import ISSAMembershipBadge from "/src/components/Pages/Certifications/ISSAMembershipBadge.jsx";
import CQCCCertificationBadge from "/src/components/Pages/Certifications/CQCCCertificationBadge";
import { useTranslation } from "react-i18next";

function Index() {
  const { t } = useTranslation();

  const goToQuote = () => {
    const nameInput = document.getElementById("floatingName");
    if (nameInput) nameInput.focus({ preventScroll: false });
    document.getElementById("quote-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
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
        <section className="my-4" aria-label="Toronto cleaning services links">
          <h2 className="h4 text-bold primary-color mb-2">Popular cleaning services in Toronto</h2>
          <p className="text-muted mb-2">
            Explore our local landing pages for homes and businesses across Toronto and the GTA.
          </p>
          <ul className="mb-0">
            <li><Link to="/residential-cleaning-toronto">residential cleaning in Toronto</Link></li>
            <li><Link to="/commercial-cleaning-toronto">commercial cleaning in Toronto</Link></li>
            <li><Link to="/deep-cleaning-toronto">deep cleaning in Toronto</Link></li>
            <li><Link to="/move-in-move-out-cleaning-toronto">move-in and move-out cleaning in Toronto</Link></li>
            <li><Link to="/carpet-upholstery-cleaning-toronto">carpet and upholstery cleaning in Toronto</Link></li>
          </ul>
        </section>

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
