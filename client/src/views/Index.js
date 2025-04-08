import React, { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { Link } from "react-router-dom";
import VisitorCounter from "components/Pages/VisitorCounter.js";
import {
  Card,
  CardBody,
  CardText,
  ListGroup,
  ListGroupItem,
  Row,
  Col,
  CardImg
} from "reactstrap";
import MetaTags from "components/Pages/MetaTags.js";
import QuickQuote from "./QuickQuote";
import LandingPageHeader from "components/Headers/LandingPageHeader.js";

import backgroundImage from 'assets/img/stock-photo-high-angle-view-person-cleaning-white-carpet-professional-vacuum-cleaner.jpg';
import Logo from "assets/img/IC CLEAN AR-15-cropped.png";
import Footer from "components/Pages/Footer";

function Index() {

  const [availabilityStatus, setAvailabilityStatus] = useState('');
  const [responseTimeMessage, setResponseTimeMessage] = useState('');

  // const contactItems = [
  //   {
  //     icon: "now-ui-icons tech_mobile",
  //     link: "tel:437-440-5514",
  //     text: "Call or message us at 437-440-5514",
  //     description: "Our customer service team is available Monday through Saturday, from 8:00 AM to 7:00 PM (1:00 PM on Saturday). Call for any inquiries or support!",
  //   },
  //   {
  //     icon: "now-ui-icons ui-1_email-85",
  //     link: "mailto:info@cleanARsolutions.ca",
  //     text: "Email us your questions at info@cleanARsolutions.ca",
  //     description: "For detailed inquiries or written communication, send us an email. We aim to respond within 24 hours.",
  //   },
  //   {
  //     icon: "now-ui-icons ui-2_like",
  //     link: "https://www.instagram.com/cleanarsolutions/",
  //     text: "Follow Us on Instagram",
  //     description: "Stay updated with our latest news, promotions, and cleaning tips on Instagram.",
  //   },
  //   {
  //     icon: "now-ui-icons business_bulb-63",
  //     link: "https://g.page/r/Cek9dkmHVuBKEAE/review",
  //     text: "Leave A Google Review",
  //     description: "Share your experience with CleanAR Solutions. We value your feedback!",
  //   },
  //   {
  //     icon: "now-ui-icons business_badge",
  //     link: "/products-and-services",
  //     text: "View Our Services",
  //     description: "Explore our range of professional cleaning services, from residential to commercial.",
  //   },
  // ];

  const contactItems = [
    {
      icon: "now-ui-icons tech_mobile",
      link: "tel:437-440-5514",
      text: "Call or Message",
      description: availabilityStatus,
      additionalInfo: responseTimeMessage,
      color: "text-primary"
    },
    {
      icon: "now-ui-icons ui-1_email-85",
      link: "mailto:info@cleanARsolutions.ca",
      text: "Email Support",
      description: "For detailed inquiries or written communication, send us an email",
      additionalInfo: "Guaranteed Response Within 24 Hours",
      color: "text-success"
    },
    {
      icon: "now-ui-icons ui-2_like",
      link: "https://www.instagram.com/cleanarsolutions/",
      text: "Social Connection",
      description: "Real-Time Updates & Engagement",
      additionalInfo: "Daily Content Refreshed",
      color: "text-instagram"
    },
    {
      icon: "now-ui-icons business_bulb-63",
      link: "https://g.page/r/Cek9dkmHVuBKEAE/review",
      text: "Customer Feedback",
      description: "Your Experience Matters",
      additionalInfo: "Help Us Improve",
      color: "text-warning"
    },
    {
      icon: "now-ui-icons business_badge",
      link: "/products-and-services",
      text: "Explore Services",
      description: "Tailored Cleaning Solutions",
      additionalInfo: "Custom Packages Available",
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
      setAvailabilityStatus('✅ We are currently available');
      setResponseTimeMessage('Instant response expected');
    } else {
      setAvailabilityStatus('⏰ We are currently offline');
      setResponseTimeMessage('We will respond within 24 hours');
    }

    document.body.classList.add("index-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    // window.scrollTo(0, 0);
    // document.body.scrollTop = 0;
    // initializeServices();
    return function cleanup() {
      document.body.classList.remove("index-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  return (
    <>
      <MetaTags />
      <VisitorCounter page={"index"} />
      {/* <LandingPageHeader /> */}
      <div className=" m-0">
        <Row className="m-0 align-items-center ">
          <Col className="m-0 p-0" xs='12' md='6'>
            <h2 className="primary-color text-bold montserrat-bold text-align-end mr-1">Get Started</h2>
            {/* <CardImg top className="logo-image-index mb-3" src={Logo} alt="CleanAR Solutions logo" /> */}
            <p className="martel-bold landing-page-intro text-align-end mr-1">
              {/* With more 10 years of experience, our services are designed to meet the unique needs of our clients, providing personalized solutions and exceptional results on every project. At <b>CleanAR Solutions</b>, we take pride in offering reliable and high-quality service that ensures the impeccable cleanliness and maintenance of any space.  We are here to help you find the perfect cleaning solution for your needs; fill up our short form and we'll be in touch with a quote. Need more information? Below you'll find all of our contact information, including our phone number, email address, and social media links. We look forward to hearing from you! */}
              {/* Tired of Cleaning? Let us handle it. At CleanAR Solutions, we offer more than just cleaning – we provide sparkling clean spaces so you can focus on what matters most. With over 10 years of experience, we tailor our services to your unique needs, delivering exceptional results every time. Get a free, personalized quote today – just fill out our short form! Connect with us on social media or contact us directly for more information. */}
              Tired of Cleaning? Reclaim your free time with CleanAR Solutions. Serving Toronto and the GTA, we provide sparkling clean spaces so you can focus on what matters. <b>Get a free quote!</b>
            </p>
          </Col>
          <Col className="text-center p-0 m-0" xs='12' md='6'>
            {/* <CardImg top className="logo-image-index mb-3" src={Logo} alt="CleanAR Solutions logo" /> */}
            <CardImg top className="background-image-index" src={backgroundImage} alt="CleanAR Solutions background" />
          </Col>
        </Row>
        <Row>
          <Col xs='12' md='6'>
            {/* <Card className="">
              <CardBody>
                <CardText>
                  {contactItems.map((item, index) => (
                    <ListGroupItem key={index} className="gradient-bg">
                      <i className={item.icon}></i>
                      {item.link.startsWith("http") || item.link.startsWith("mailto") ? (
                        <a href={item.link} target="_blank" rel="noreferrer noopener" className="text-bold martel-semibold" title={item.text}>
                          {' '}{item.text}
                        </a>
                      ) : (
                        <Link to={item.link} className="text-bold martel-semibold" title={item.text}>
                          {' '}{item.text}
                        </Link>
                      )}
                      <br />
                      <span className="martel-bold">{item.description}</span>
                    </ListGroupItem>
                  ))}
                </CardText>
              </CardBody>
            </Card> */}
            <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="contact-card-container"
    >

            <Card>
      {contactItems.map((item, index) => (
        <motion.div 
          key={index}
          whileHover={{ 
            scale: 1.05, 
            boxShadow: "0px 5px 15px rgba(0,0,0,0.1)" 
          }}
        >
          <ListGroupItem className="d-flex align-items-center">
            <div className={`me-3 ${item.color}`}>
              <i className={`${item.icon} fs-4`}></i>
            </div>
            <div>
              <h6 className="mb-1">{item.text}</h6>
              <p className="text-muted mb-0 small">{item.description}</p>
              <small className="text-muted">{item.additionalInfo}</small>
            </div>
          </ListGroupItem>
        </motion.div>
      ))}
    </Card>
            </motion.div>
          </Col>
          <Col xs='12' md='6'>
            <QuickQuote />
          </Col>
        </Row>

        <Footer />
      </div>
    </>
  );
}

export default Index;
