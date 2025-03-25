import React, { useEffect, useState } from "react";
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

// import backgroundImage from 'assets/img/stock-photo-high-angle-view-person-cleaning-white-carpet-professional-vacuum-cleaner.jpg';
import Logo from "assets/img/IC CLEAN AR-15-cropped.png";
import Footer from "components/Pages/Footer";

function Index() {

  const contactItems = [
    {
      icon: "now-ui-icons tech_mobile",
      link: "tel:437-440-5514",
      text: "Call or message us at 437-440-5514",
      description: "Our customer service team is available Monday through Saturday, from 8:00 AM to 7:00 PM (1:00 PM on Saturday). Call for any inquiries or support!",
    },
    {
      icon: "now-ui-icons ui-1_email-85",
      link: "mailto:info@cleanARsolutions.ca",
      text: "Email us your questions at info@cleanARsolutions.ca",
      description: "For detailed inquiries or written communication, send us an email. We aim to respond within 24 hours.",
    },
    {
      icon: "now-ui-icons ui-2_like",
      link: "https://www.instagram.com/cleanarsolutions/",
      text: "Follow Us on Instagram",
      description: "Stay updated with our latest news, promotions, and cleaning tips on Instagram.",
    },
    {
      icon: "now-ui-icons business_bulb-63",
      link: "https://g.page/r/Cek9dkmHVuBKEAE/review",
      text: "Leave A Google Review",
      description: "Share your experience with CleanAR Solutions. We value your feedback!",
    },
    {
      icon: "now-ui-icons business_badge",
      link: "/products-and-services",
      text: "View Our Services",
      description: "Explore our range of professional cleaning services, from residential to commercial.",
    },
  ];

  useEffect(() => {
    // const modalShown = localStorage.getItem('modalShown');

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
      <div className="content section-background index-section mb-0">
        <Row>
          <Col xs='12' md='6'>
            <h1 className="primary-color text-bold montserrat-bold">CleanAR Solutions</h1>
            <CardImg top className="logo-image-index mb-3" src={Logo} alt="CleanAR Solutions logo" />
            <p className="p-styling martel-regular">
              With more 10 years of experience, our services are designed to meet the unique needs of our clients, providing personalized solutions and exceptional results on every project. At <b>CleanAR Solutions</b>, we take pride in offering reliable and high-quality service that ensures the impeccable cleanliness and maintenance of any space.  We are here to help you find the perfect cleaning solution for your needs; fill up our short form 👉 and we'll be in touch with a quote. Need more information? Below you'll find all of our contact information 👇
            </p>
          </Col>
          <Col xs='12' md='6'>
            <QuickQuote />
          </Col>
        </Row>
        <Row className="">
          <Col className="" xs='12' md='6'>
            <Card className="card-plain">
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
            </Card>
          </Col>
        </Row>
        <Footer />
      </div>
    </>
  );
}

export default Index;
