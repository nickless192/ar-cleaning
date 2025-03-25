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
        <h1 className="primary-color text-bold montserrat-bold">CleanAR Solutions</h1>
        <Row>
          <Col xs='12' md='6'>
            <CardImg top className="logo-image-index mb-2" src={Logo} alt="CleanAR Solutions logo" />
            <p className=" p-styling martel-regular">
              With more 10 years of experience, our services are designed to meet the unique needs of our clients, providing personalized solutions and exceptional results on every project. At <b>CleanAR Solutions</b>, we take pride in offering reliable and high-quality service that ensures the impeccable cleanliness and maintenance of any space.  We are here to help you find the perfect cleaning solution for your needs; fill up our short form 👆 (Request Quote) and we'll be in touch with a quote. Need more information? Below you'll find all of our contact information 👇
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
                  <ListGroup>
                    <ListGroupItem className="gradient-bg">
                      <i className="now-ui-icons tech_mobile"></i><Link to="tel:437-440-5514" className="text-bold martel-semibold" title="Call us at 437-440-5514"> Call or message us at 437-440-5514</Link> <br />
                      <span className="martel-bold">Our customer service team is available to assist you Monday through Saturday, from 8:00 AM to 7:00 PM (1:00 PM on Saturday). Don't hesitate to call for any inquiries or support!</span>
                    </ListGroupItem>
                    <ListGroupItem className="gradient-bg">
                      <i className="now-ui-icons ui-1_email-85"></i><a href="mailto:info@cleanARsolutions.ca" className="text-bold martel-semibold" title="Email us your questions at info@cleanARsolutions.ca"> Email us your questions at info@cleanARsolutions.ca</a><br />
                      <span className="martel-bold">For detailed inquiries or if you prefer written communication, drop us an email. We aim to respond within 24 hours.</span>
                    </ListGroupItem>
                    <ListGroupItem className="gradient-bg">
                      <i className="now-ui-icons ui-2_like"></i><a href="https://www.instagram.com/cleanarsolutions/" target="_blank" rel="noreferrer noopener" className="text-bold martel-semibold" title="Follow our Instagram account"> Follow Us on Instagram</a> <br />
                      <span className="martel-bold">Stay up-to-date with our latest news, promotions, and cleaning tips! Follow us on Instagram for more information.</span>
                    </ListGroupItem>
                    <ListGroupItem className="gradient-bg">
                      <i className="now-ui-icons business_bulb-63"></i><a href="https://g.page/r/Cek9dkmHVuBKEAE/review" target="_blank" rel="noreferrer noopener" className="text-bold martel-semibold" title="Leave a Google review"> Leave A Google Review</a> <br />
                      <span className="martel-bold">Share your experience with CleanAR Solutions! We value your feedback and would love to hear about your experience with our services.</span>
                    </ListGroupItem>
                    <ListGroupItem className="gradient-bg">
                      <i className="now-ui-icons business_badge"></i><Link to="/products-and-services" className="text-bold martel-semibold" title="View our services"> View Our Services</Link> <br />
                      <span className="martel-bold">Discover the range of professional cleaning services we offer at CleanAR Solutions. From residential to commercial cleaning, we have the perfect solution for you!</span>
                    </ListGroupItem>
                  </ListGroup>
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
