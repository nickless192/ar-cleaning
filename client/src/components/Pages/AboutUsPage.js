import React from "react";
import { Link } from "react-router-dom";
import {
  Row, Col, Card, CardBody, CardTitle, CardText, CardHeader, ListGroup, ListGroupItem,
  CardFooter
} from "reactstrap";
import { Image } from 'react-bootstrap';
import "./../../assets/css/our-palette.css";
import Logo from "../../assets/img/logo.png";
import Navbar from "components/Pages/Navbar.js";
import Footer from "components/Pages/Footer.js";
import VisitorCounter from "components/Pages/VisitorCounter.js";

function AboutUsPage() {

  React.useEffect(() => {
    document.body.classList.add("index-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    // window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    return function cleanup() {
      document.body.classList.remove("index-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  return (
    <>
      <Navbar />
      <div className="section pb-0 mb-0">

        <VisitorCounter page={"index"} />
        <Row className="content-row py-0 px-5">
          <Col xs="12" md="6" className="logo-col pr-0">
            <Image
              alt="..."
              src={Logo}
              className="logo-image pr-0"
            />
          </Col>
          <Col xs="12" md="6" className="text-col">
          <Card className="card-plain">
          <CardHeader>
            <CardTitle tag="h3" className="text-bold">Welcome to CleanAR Solutions</CardTitle>
          </CardHeader>
          <CardBody>          
            <CardText>
              <p className="">
              At <b>CleanAR Solutions</b>, we provide professional cleaning services in Toronto and the GTA. Our focus on excellence ensures every project meets the highest standards, creating a clean and healthy environment. Whether you need residential, commercial, or carpet cleaning, we customize our approach to meet your needs. Get started by <a href="/request-quote" >requesting a quote</a>, or <a href="mailto:info@cleanARsolutions.ca">contact us</a> for more information.
              </p>
              <p className="">              
              With 10 years of experience, our services are designed to meet the unique needs of our clients, providing personalized solutions and exceptional results on every project. At <b>CleanAR Solutions</b>, we take pride in offering reliable and high-quality service that ensures the impeccable cleanliness and maintenance of any space.  We are here to help you find the perfect cleaning solution for your needs.
              </p>
            </CardText>
            <Link to="/request-quote" className="btn primary-bg-color">Request a Quote</Link>
            <Link to="/products-and-services" className="btn secondary-bg-color">Learn More About Our Services</Link>
          </CardBody>
        </Card>
            
            
          </Col>
        </Row>
        <div className="py-1 px-5 secondary-bg-color">
          <Row className=" py-0 pr-5 secondary-bg-color">
            <Col className="pr-0">
              <Card className="card-plain">
                <CardHeader>
                  <CardTitle tag="h4" className="text-bold">Contact Us!</CardTitle>
                </CardHeader>
                <CardBody>
                  <CardText>
                    <p>We'd love to hear from you! Whether you have a question, need assistance, or just want to share your feedback, our team is here to help. Reach out to us through through your preferred method, and we'll get back to you as soon as possible.</p>
                  </CardText>
                </CardBody>
              </Card>
            </Col>
            <Col>
              <Card className="card-plain">
                <CardBody>
                  <CardText>
                    <ListGroup className="contact-info">
                      <ListGroupItem>
                        <i className="now-ui-icons tech_mobile"></i> <strong>Call Us:</strong> <Link to="tel:437-440-5514">437-440-5514</Link> <br />
                        <span>Our customer service team is available to assist you Monday through Friday, from 9 AM to 6 PM. Don't hesitate to call for any inquiries or support!</span>
                      </ListGroupItem>
                      <ListGroupItem>
                        <i className="now-ui-icons ui-1_email-85"></i> <strong>Email Us:</strong> <a href="mailto:info@cleanarsolutions.ca">info@cleanarsolutions.ca</a><br />
                        <span>For detailed inquiries or if you prefer written communication, drop us an email. We aim to respond within 24 hours.</span>
                      </ListGroupItem>
                      <ListGroupItem>
                        <i className="now-ui-icons location_pin"></i> <strong>Visit Us:</strong>  <a
                          href="https://www.google.com/maps/search/?api=1&query=Toronto,+ON+M4Y+3C2"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="location-link"
                        >
                          Toronto, ON M4Y 3C2
                        </a><br />
                        <span>We're conveniently located in the heart of Toronto. Contact us to schedule an appointment or for more information.</span>
                      </ListGroupItem>
                    </ListGroup>
                  </CardText>
                </CardBody>
              </Card>
            </Col>
            {/* </Col> */}
          </Row>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AboutUsPage;
