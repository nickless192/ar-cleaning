import React, { useEffect, useState } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import VisitorCounter from "/src/components/Pages/Management/VisitorCounter.jsx";
import ContactUs from "../components/Pages/Landing/ContactUs";
import {
  Card,
  // CardBody,
  // CardText,
  // ListGroup,
  ListGroupItem,
  Row,
  Col,
  CardImg
} from "reactstrap";
import MetaTags from "/src/components/Pages/Management/MetaTags.jsx";
import QuoteRequest from "../components/Pages/UserJourney/QuoteRequest";
// import LandingPageHeader from "/src/components/Headers/LandingPageHeader.jsx";
import BusinessHoursSidebar from "/src/components/Pages/UserJourney/BusinessHourSidebar";
import WhyChooseUs from "/src/components/Pages/Landing/WhyChooseUs";
import FeaturedServices from "/src/components/Pages/Landing/FeaturedServices";
import ReviewsCarousel from "/src/components/Pages/Landing/ReviewsCarousel";
import FAQAccordion from "/src/components/Pages/Landing/FAQAccordion";
import NewIconAnimated from "/src/components/Pages/Navigation/NewIconAnimated";
import StickyButtons from "/src/components/Pages/Landing/StickyButtons.jsx";
import ISSAMembershipBadge from "/src/components/Pages/Certifications/ISSAMembershipBadge.jsx";
import CQCCCertificationBadge from "/src/components/Pages/Certifications/CQCCCertificationBadge";

// import backgroundImage from '/src/assets/img/carpet-cleaning.jpg';
// import Logo from "assets/img/cleanar-logo.png";
import WelcomeModal from "/src/components/Pages/UserJourney/WelcomeModal.jsx";
// import { FaInstagram, FaFacebook, FaTiktok } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

function StickyQuoteButton() {
  const { t } = useTranslation();
  const scrollToForm = () => {
    // const formEl = document.getElementById("quote-form") || document.getElementById("quote-section");
    // if (formEl) {
    //   formEl.scrollIntoView({ behavior: "smooth" });
    // }
    const nameInput = document.getElementById("floatingName"); // make sure your input has id="name-input"
    if (nameInput) {
      nameInput.focus({ preventScroll: false }); // scrolls if needed
    }
  };

  return (
    <div
      className="d-md-none position-fixed bottom-0 start-0 end-0 text-center bg-transparent"
      style={{ zIndex: 1050, padding: "0.75rem" }}
    >
      <button
        onClick={scrollToForm}
        className="btn btn-success btn-lg rounded-pill shadow-lg w-100"
      >
        {t("quick_quote.form.title")} 
        {/* <NewIconAnimated /> */}
      </button>
    </div>
  );
}

function Index() {

  const [availabilityStatus, setAvailabilityStatus] = useState('');
  const [responseTimeMessage, setResponseTimeMessage] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [modalText, setModalText] = useState('');
  const [show, setShow] = useState(false);
  const [variant, setVariant] = useState('A');
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const goToQuote = () => {
    const nameInput = document.getElementById("floatingName"); // make sure your input has id="name-input"
    if (nameInput) {
      nameInput.focus({ preventScroll: false }); // scrolls if needed
    }
  };


  const contactItems = [
    {
      icon: "now-ui-icons tech_mobile",
      link: "business-hours",
      text: t('contact_business_hours'),
      description: availabilityStatus,
      additionalInfo: responseTimeMessage,
      color: "text-primary"
    },
    {
      icon: "now-ui-icons ui-1_email-85",
      link: "mailto:info@cleanARsolutions.ca?subject=Cleaning%20Service%20Request&body=Hi%20CleanAR%20Solutions%2C%0A%0AI'd%20like%20to%20request%20a%20information%20for...",
      text: t('contact_email_support'),
      description: t('email_description'),
      additionalInfo: t('email_additional'),
      color: "text-success"
    },
    // {
    //   icon: "now-ui-icons tech_mobile",
    //   link: "/index?promoCode=refresh15&scrollToQuote=true'",
    //   text: t('welcome_modal.title'),
    //   description: modalText,
    //   additionalInfo: t('welcome_modal.description'),
    //   color: "text-info"
    // },
    {
      icon: "now-ui-icons business_bulb-63",
      link: "https://g.page/r/Cek9dkmHVuBKEAE/review",
      text: t('contact_feedback'),
      description: t('feedback_description'),
      additionalInfo: t('feedback_additional'),
      color: "text-warning"
    },
    {
      icon: "now-ui-icons business_badge",
      link: "/products-and-services",
      text: t('contact_services'),
      description: t('services_description'),
      additionalInfo: t('services_additional'),
      color: "text-info"
    }
  ];

  useEffect(() => {
    // const modalShown = localStorage.getItem('modalShown');
    const currentTime = new Date();
    const currentDay = currentTime.getDay();
    const currentHour = currentTime.getHours();

    // Availability Check
    const isBusinessHours =
      (currentDay >= 1 && currentDay <= 5 && currentHour >= 8 && currentHour < 19) || // Weekdays
      (currentDay === 6 && currentHour >= 8 && currentHour < 13); // Saturday morning

    if (isBusinessHours) {
      setAvailabilityStatus(t('status_online'));
      // setAvailabilityStatus('✅ We are currently available');
      setResponseTimeMessage(t('response_now'));
    } else {
      setAvailabilityStatus(t('status_offline'));
      setResponseTimeMessage(t('response_later'));
    }

    if (isInitialLoad) {

      // const savedVariant = localStorage.getItem('welcomeModalVariant');
      // const chosenVariant = savedVariant || (Math.random() > 0.5 ? 'A' : 'B');
      // if (chosenVariant === 'A') {
      //   setModalText(t('welcome_modal.variant_a'));
      // } else {
      //   setModalText(t('welcome_modal.variant_b'));
      // }
      // setVariant(chosenVariant);
      setIsInitialLoad(false);
    }

    document.body.classList.add("index-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    // window.scrollTo(0, 0);
    // document.body.scrollTop = 0;
    // initializeServices();
    // if (location.state?.scrollToQuote) {
    //   document.getElementById("quote-section")?.scrollIntoView({ behavior: "smooth" });
    // }
    return function cleanup() {
      document.body.classList.remove("index-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, [location.search, location.state, i18n.language]);

  return (
    <>
      <MetaTags />
      <VisitorCounter />
      {/* <WelcomeModal /> */}
      {/* <LandingPageHeader /> */}

      <Row className="m-0 px-0 align-items-center justify-content-center">
        {/* <Col className="m-0 p-0" xs='12' md='6'>
            <h1 className="primary-color text-bold montserrat-bold text-align-end mr-3">CleanAR Solutions <br /> Getting Started</h1>
            <p className="martel-bold landing-page-intro text-align-end mr-3">Tired of Cleaning? Reclaim your free time with CleanAR Solutions. Serving Toronto and the GTA, we provide sparkling clean spaces so you can focus on what matters. <b>Get a free quote!</b>
            </p>
          </Col> */}
        <Col xs="12" md="6" className="text-center pt-5 pl-3">
          <motion.h1
            className="secondary-color montserrat-bold p-0 m-0"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            CleanAR Solutions
          </motion.h1>

          <motion.h3
            className="text-secondary p-0 m-0 text-bold pb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Trusted Clean, Trusted Service */}
            {t('tagline')}
          </motion.h3>
          {/* </Col>
                  <Col xs="12" md="6" className="text-center px-4 mb-5"> */}
          <motion.p
            className="martel-bold landing-page-intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {/* Say goodbye to stress and hello to sparkle ✨<br /> */}
            <strong>
              {t('intro')}
            </strong> <br />
            {t('details')} {" "}
            {/* <br /> */}
            {t('services')} <br />
            {/* <b>CleanAR Solutions</b> brings 10+ years of trusted cleaning to homes and businesses across the GTA.<br /> */}
            {/* From deep cleans to regular maintenance, we tailor services to your needs—efficient, eco-friendly, and always reliable. */}
            {/* <br /><br /> */}
            {/* <b>{t('cta')}</b> <br /> */}
            {/* {t('ctaNote')} */}
            {/* <b>Get your personalized quote in under 60 seconds.</b><br /> */}
            {/* It’s fast, free, and commitment-free! */}
          </motion.p>
          <div className="pb-3">

            <button
              className="btn btn-success btn-lg w-auto"
              onClick={goToQuote}
            >
              {t('cta_text')}
            </button>
          </div>

        </Col>
        <Col xs='12' md='5' className=" pt-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="contact-card-container mx-3"
          >

            <Card className="bg-transparent">
              {contactItems.map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0px 5px 15px rgba(0,0,0,0.1)"
                  }}
                >
                  <ListGroupItem className="d-flex align-items-center bg-transparent">
                    <div className={`me-3 ${item.color}`}>
                      <i className={`${item.icon} fs-4`}></i>
                    </div>
                    <div>
                      <h6 className="mb-1">
                        {Array.isArray(item.text) ? item.description : item.text}
                      </h6>
                      {Array.isArray(item.link) ? (
                        <>
                          {item.link.map((singleLink, index) => (
                            <div key={index}>
                              {' | '}
                              <a

                                href={singleLink}
                                target="_blank"
                                data-track="contact-link"
                                rel="noreferrer noopener"
                                className="text-bold martel-semibold underline"
                                title={item.text?.[index] || item.description}
                              >
                                {item.icons?.[index]} {item.text?.[index] || new URL(singleLink).hostname.replace("www.", "")}
                                {/* {item.text?.[index] || new URL(singleLink).hostname.replace("www.", "")} */}
                              </a>
                              {' | '}
                            </div>
                          ))}
                        </>
                      ) : item.link === "business-hours" ? (
                        <BusinessHoursSidebar />
                      ) : item.link.startsWith("http") || item.link.startsWith("mailto") ? (
                        <a
                          href={item.link}
                          {...(item.link.startsWith("http") && { target: "_blank", rel: "noreferrer noopener" })}
                          data-track="contact-link"
                          className="text-bold martel-semibold underline"
                          title={item.text}
                        >
                          {' '}{item.description}
                        </a>
                      ) : (
                        <Link
                          to={item.link}
                          className="text-bold martel-semibold underline"
                          data-track="contact-link"
                          title={item.description}
                        >
                          {' '}{item.description}
                        </Link>
                      )}


                      {/* <p className="text-muted mb-0 small">{item.description}</p> */}
                      <br />
                      <p className="text-muted small">{item.additionalInfo}</p>
                    </div>

                  </ListGroupItem>
                </motion.div>
              ))}

            </Card>
            <ISSAMembershipBadge className="mb-2" layout="vertical" />
            <CQCCCertificationBadge className="mb-2" layout="vertical" />
            <Link
              to="/blog/cleanar-solutions-joins-issa-canada"
              className="text-primary small"
            >{t('certification.ctaSecondary')}
              {/* Learn why ISSA membership matters → */}
            </Link>
          </motion.div>
        </Col>
        {/* <Col className="text-center p-0 m-0 d-none d-md-block" xs='12' md='6'>
            <CardImg top className="background-image-index" src={backgroundImage} alt="CleanAR Solutions background - Designed by Freepik" />
          </Col> */}
      </Row>
      <div className="container">
        {/* New Sections */}
        <ReviewsCarousel />
        <WhyChooseUs />
        <FeaturedServices />
        <Row>
          <Col xs='12' md='12' className="p-0" id="quote-section">
            <QuoteRequest
              initialData={{}}
            />
          </Col>
        </Row>

        <ToastContainer position="top-center" autoClose={2000} />
        <Row>
          <Col xs='12' md='12' className="p-0">
            <ContactUs />
          </Col>
        </Row>
        <FAQAccordion />
        {/* <StickyQuoteButton /> */}
        <StickyButtons />

      </div>

    </>
  );
}

export default Index;