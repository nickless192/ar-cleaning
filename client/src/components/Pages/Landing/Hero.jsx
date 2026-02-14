import React, { useEffect, useMemo, useState } from "react";
import { Row, Col, Card } from "reactstrap";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BusinessHoursSidebar from "/src/components/Pages/UserJourney/BusinessHourSidebar";
// import { FaPhoneAlt, FaSms, FaEnvelope, FaFileInvoiceDollar } from "react-icons/fa";
import { FaLeaf, FaUserShield, FaClock, FaCheckCircle } from "react-icons/fa";

function Hero({ onGoToQuote }) {
    const location = useLocation();
    const { t, i18n } = useTranslation();

    const [availabilityStatus, setAvailabilityStatus] = useState("");
    const [responseTimeMessage, setResponseTimeMessage] = useState("");
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
    const [showContact, setShowContact] = useState(() => window.innerWidth >= 768); // open on desktop, closed on mobile
    const phoneHref = "tel:+14374405514";
    const smsHref = 'sms:+14374405514?&body=Hi%20CleanAR%20Solutions!%20I%E2%80%99d%20like%20a%20quote%20for...';
    const mailHref = 'mailto:info@cleanARsolutions.ca';



    const benefits = [
        { icon: <FaUserShield />, text: t("whyChooseUs.benefits.trustedProfessionals.title") || "Trusted professionals" },
        { icon: <FaLeaf />, text: t("whyChooseUs.benefits.ecoFriendly.title") || "Eco-friendly options" },
        { icon: <FaClock />, text: t("whyChooseUs.benefits.flexibleScheduling.title") || "Flexible scheduling" },
        { icon: <FaCheckCircle />, text: t("whyChooseUs.benefits.satisfactionGuaranteed.title") || "Satisfaction focused" },
    ];



    useEffect(() => {
        const onResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            setShowContact(!mobile); // auto-open on desktop, auto-close on mobile
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);


    const companyInfo = useMemo(() => {
        // These already exist in your Contact translations:
        const locationLabel = t("contact.company.location_label") || "Location";
        const locationValue = t("contact.company.location_value") || "Toronto";

        const phoneLabel = t("contact.company.phone_label") || "Phone";
        const phoneValue = t("contact.company.phone_value") || "+1 (437) 440-5514";

        const emailLabel = t("contact.company.email_label") || "Email";
        // keep a real email constant (or pull from translations if you prefer)
        const emailValue = "info@cleanARsolutions.ca";

        return { locationLabel, locationValue, phoneLabel, phoneValue, emailLabel, emailValue };
    }, [t, i18n.language]);

    useEffect(() => {
        const currentTime = new Date();
        const currentDay = currentTime.getDay();
        const currentHour = currentTime.getHours();

        const withinHours =
            (currentDay >= 1 && currentDay <= 5 && currentHour >= 8 && currentHour < 19) ||
            (currentDay === 6 && currentHour >= 8 && currentHour < 13);

        if (withinHours) {
            setAvailabilityStatus(t("index.status_online"));
            setResponseTimeMessage(t("index.response_now"));
        } else {
            setAvailabilityStatus(t("index.status_offline"));
            setResponseTimeMessage(t("index.response_later"));
        }
    }, [location.search, location.state, i18n.language, t]);

    return (
        <section className="container pt-4 pt-md-5 pb-3">
            {/* ===== TOP FULL-WIDTH HERO HEADER ===== */}
            <div className="text-center mb-2">

                <motion.h1
                    className="secondary-color montserrat-bold m-0"
                    initial={{ opacity: 0, y: -14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    style={{ fontSize: "clamp(2.2rem, 4vw, 3.4rem)", lineHeight: 1.05 }}
                >
                    {t("index.companyName")}
                </motion.h1>

                <motion.h2
                    className="text-secondary mt-2 text-bold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    style={{ fontSize: "clamp(1.1rem, 1.6vw, 1.4rem)" }}
                >
                    {t("index.tagline")}
                </motion.h2>

                {/* Status badges */}
                <div className="mt-3 d-flex flex-wrap gap-2 justify-content-start">
                    <span className="badge bg-light text-dark border cleanar-badge">
                        {availabilityStatus}
                    </span>
                    <span className="badge bg-light text-dark border cleanar-badge">
                        {responseTimeMessage}
                    </span>
                    <span className="badge bg-light text-dark border cleanar-badge">
                        Toronto & GTA
                    </span>
                    <BusinessHoursSidebar />
                </div>

                {/* Main emotional hook */}
                <motion.p
                    className="mt-4 mb-0 martel-bold primary-color"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.2rem)" }}
                >
                    {t("index.intro")}
                </motion.p>

                <p className="text-muted mt-2 mx-auto secondary-color" style={{ maxWidth: 720 }}>
                    {t("index.details")}
                </p>
                <div className="hero-divider my-4" />

            </div>

            {/* ===== BOTTOM SUPPORT GRID ===== */}
            <Row className="g-4 align-items-stretch mt-1 hero-grid">

                {/* LEFT — CTA ZONE */}
                <Col xs="12" md="6" className="mt-0">
                    <div className="h-100 d-flex flex-column justify-content-center">

                        <h3 className="fw-bold mb-3 text-center text-md-start primary-color">
                            {t("whyChooseUs.heading")}
                        </h3>

                        {/* <ul className="list-unstyled text-muted small mb-4">
      <li>✔ 10+ years serving Toronto & GTA</li>
      <li>✔ Fully insured & professional</li>
      <li>✔ Flexible scheduling</li>
      <li>✔ No commitment required</li>
    </ul> */}
                        <div className="row text-center hero-benefits mb-2">
                            {benefits.map((b, i) => (
                                <div key={i} className="col-6 mb-2">
                                    <div className="d-flex align-items-center justify-content-center gap-2">
                                        <span className="text-success" style={{ fontSize: 14 }}>
                                            {b.icon}
                                        </span>
                                        <span className="fw-semibold small">
                                            {b.text}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>



                        {!isMobile && (
                            <button
                                className="hero-primary-cta mb-3"
                                onClick={onGoToQuote}
                            >
                                {t("about.cta.quote")} →
                            </button>
                        )}

                        <div className="d-flex flex-wrap gap-3 text-muted small">
                            <a href={phoneHref} className="text-decoration-none">
                                {t("index.cta.call_short") || "Call"}
                            </a>
                            <a href={smsHref} className="text-decoration-none">
                                {t("index.cta.text_short") || "Text"}
                            </a>
                            <a href={mailHref} className="text-decoration-none">
                                {t("index.cta.email_short") || "Email"}
                            </a>
                        </div>

                    </div>
                </Col>


                {/* RIGHT — CONTACT / TRUST */}
                <Col xs="12" md="5" lg="6" className="mt-0">   {/* Right Contact */}
                    <Card className="cleanar-heroCard shadow-sm border-0 rounded-4 h-100">
                        <div className="p-3 p-md-4">

                            {/* Header row (clickable on mobile only) */}
                            <button
                                type="button"
                                className={`w-100 d-flex align-items-center justify-content-between p-0 bg-transparent border-0 ${isMobile ? "" : "pe-none"}`}
                                onClick={() => isMobile && setShowContact((v) => !v)}
                                aria-expanded={showContact}
                            >
                                <div>
                                    <div className="fw-bold">{t("index.contact_title") || "Contact"}</div>
                                    {isMobile && !showContact && (
                                        <div className="text-muted small mt-1">
                                            <span className="fw-semibold">📍</span> {companyInfo.locationValue}{" "}
                                            <span className="mx-1">•</span>
                                            <a className="text-decoration-none" href={`tel:${companyInfo.phoneValue}`}>
                                                <span className="fw-semibold">📞</span> {companyInfo.phoneValue}
                                            </a>{" "}
                                            <span className="mx-1">•</span>
                                            <a className="text-decoration-none" href={`mailto:${companyInfo.emailValue}`}>
                                                <span className="fw-semibold">✉️</span> {companyInfo.emailValue}
                                            </a>
                                        </div>
                                    )}


                                </div>

                                {/* Chevron only on mobile */}
                                {isMobile && (
                                    <span className="text-muted ms-2" style={{ fontSize: 16, lineHeight: 1 }}>
                                        {showContact ? "▲" : "▼"}
                                    </span>
                                )}

                            </button>

                            {/* Divider */}
                            {/* <div className="mt-3" /> */}
                            <hr className="my-2" />

                            {/* Collapsible content */}
                            {(showContact || !isMobile) && (
                                <div className="pt-2">

                                    <div className="d-flex justify-content-between py-2 border-top small">
                                        <span className="text-muted">📍</span>
                                        <span className="fw-semibold">{companyInfo.locationValue}</span>
                                    </div>

                                    <div className="d-flex justify-content-between py-2 border-top small">
                                        <span className="text-muted">📞</span>
                                        <a href={`tel:${companyInfo.phoneValue}`} className="fw-semibold text-decoration-none">
                                            {companyInfo.phoneValue}
                                        </a>
                                    </div>

                                    <div className="d-flex justify-content-between py-2 border-top small">
                                        <span className="text-muted">✉️</span>
                                        <a href={`mailto:${companyInfo.emailValue}`} className="fw-semibold text-decoration-none">
                                            {companyInfo.emailValue}
                                        </a>
                                    </div>

                                    {/* <div className="pt-3 border-top text-muted small">
                                        {t("index.details")}
                                    </div> */}
                                </div>
                            )}
                            
                        </div>                        
                    </Card>
                </Col>

            </Row>
        </section>

    );
}

export default Hero;
