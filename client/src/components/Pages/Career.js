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

function Career() {

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

        <VisitorCounter page={"career"} />
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
            <CardTitle tag="h3" className="text-bold">Welcome to CleanAR Solutions<br />Work With Us!</CardTitle>
          </CardHeader>
          <CardBody>          
            <CardText>
                
              <p className="">
                Join us in our mission to provide exceptional cleaning services to our clients. We are always looking for talented and dedicated individuals to join our team. If you are passionate about cleanliness and customer service, we want to hear from you. Explore our current job openings and apply today!<br />
                <br />
                <strong>Email Us Your Resume:</strong> <a href="mailto:info@cleanARsolutions.ca?subject=Work%20With%20Us">info@cleanARsolutions.ca</a><br />
              </p>              
            </CardText>
          </CardBody>
        </Card>
            
            
          </Col>
        </Row>
      </div>
      {/* <Footer /> */}
    </>
  );
}

export default Career;
