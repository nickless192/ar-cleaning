import React from "react";
import { Link } from "react-router-dom";
import {
  Row, Col, Card, CardBody, CardTitle, CardText, CardHeader,
  Container,
} from "reactstrap";
import { Image } from 'react-bootstrap';
import "./../../assets/css/our-palette.css";
import Logo from "../../assets/img/logo.png";
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
      {/* <Navbar /> */}
      <div className="section pb-0 mb-0">

        <VisitorCounter page={"aboutuspage"} />
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
        <Container>
            <Row>
              <Col>                
                <h2>Our Mission</h2>
                <p>
                  Our mission is to provide a platform for people to request and receive quotes for cleaning services.
                </p>
                <h2>Our Vision</h2>
                <p>
                  Our vision is to create a platform that connects people with cleaning service providers.
                </p>
                <h2>Our Values</h2>
                <p>
                  We value honesty, integrity, and transparency.
                </p>
                <h2>Our Services</h2>
                <p>
                  We offer a platform for people to request quotes for cleaning services.
                </p>


              </Col>
            </Row>
          </Container>
      </div>
      {/* <Footer /> */}
    </>
  );
}

export default AboutUsPage;
