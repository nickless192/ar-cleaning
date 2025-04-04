import React from "react";
import { Link } from "react-router-dom";
import {
  Row, Col, Card, CardBody, CardTitle, CardText, CardHeader,
  ListGroup, ListGroupItem,
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
              Our mission is to transform spaces into cleaner, healthier, and more welcoming environments. We achieve this by offering customizable, high-quality cleaning services that are tailored to our clients’ needs while staying true to our commitment to sustainability and excellence.
              </p>
              <h2>Our Vision</h2>
              <p>
              Our vision is to become Toronto’s most trusted and innovative cleaning service provider, setting the standard for excellence while contributing to a cleaner, greener, and happier community.
              </p>
              <h2>Our Values</h2>
              <p>
                <b>At CleanAR Solutions, we are guided by the following values:</b>
                <ol>
                  <li>Integrity: We conduct our business with honesty, transparency, and accountability.</li>
                  <li>Quality: We deliver top-tier cleaning services with attention to detail and excellence.</li>
                  <li>Customer Focus: We prioritize our clients’ unique needs, building trust through personalized solutions.</li>
                  <li>Sustainability: We promote eco-friendly cleaning practices to protect our environment.</li>
                  <li>Teamwork: We value collaboration, respect, and unity to achieve success together.</li>
                </ol>
              </p>

            </Col>
          </Row>
        </Container>
        <Container className="product-selector">
          <h2 className="title text-center text-dark my-0 pb-2">Industries We Serve</h2>
          <Row className="my-0">
            <Col>
              <Card className="secondary-bg-color" inverse>
                <CardHeader tag="h3" className="mx-2">
                  Residential Buildings
                </CardHeader>
                <ListGroup>
                  <ListGroupItem className="text-dark">
                    General Cleaning: Complete cleaning of common areas such as lobbies, hallways, stairs, and recreational areas.
                  </ListGroupItem>
                  <ListGroupItem className="text-dark">
                    Exterior Area Maintenance: Cleaning of sidewalks, courtyards, and parking areas.
                  </ListGroupItem>
                  <ListGroupItem className="text-dark">
                    Trash Management: Collection and proper disposal of waste and garbage.
                  </ListGroupItem>
                </ListGroup>
              </Card>
            </Col>
            <Col>
              <Card className="primary-bg-color" inverse>
                <CardHeader tag="h3" className="mx-2">
                  Offices
                </CardHeader>
                <ListGroup>
                  <ListGroupItem className="text-dark">
                    Daily Cleaning: Cleaning of desks, tables, chairs, and break areas.
                  </ListGroupItem>
                  <ListGroupItem className="text-dark">
                    Floor Maintenance: Sweeping, mopping, and polishing of floors.
                  </ListGroupItem>
                  <ListGroupItem className="text-dark">
                    Bathroom Cleaning: Disinfection and deep cleaning of bathrooms and sanitary areas.
                  </ListGroupItem>
                </ListGroup>
              </Card>

            </Col>
            {/* <Col>
              <Card className="light-blue-bg-color"
                // color="primary"
                inverse
              >
                <CardHeader tag="h3" className="mx-2">
                  Shopping Centers
                </CardHeader>
                <ListGroup>
                  <ListGroupItem className="text-dark">
                    Common Area Cleaning: Cleaning of corridors, escalators, and rest areas.
                  </ListGroupItem>
                  <ListGroupItem className="text-dark">
                    Store Maintenance: Cleaning of shop windows, display areas, and customer service counters.
                  </ListGroupItem>
                  <ListGroupItem className="text-dark">
                    Bathroom Cleaning: Disinfection and cleaning of public bathrooms and rest areas.
                  </ListGroupItem>
                </ListGroup>
              </Card>
            </Col> */}
            <Col>
              <Card className="secondary-bg-color"
                // color="primary"
                inverse
              >
                <CardHeader tag="h3" className="mx-2">
                  Festivals
                </CardHeader>
                <ListGroup>
                  <ListGroupItem className="text-dark">
                    Pre-Event Cleaning: Cleaning of the event area before its start, including garbage collection and grounds cleaning.
                  </ListGroupItem>
                  <ListGroupItem className="text-dark">

                    Event Maintenance: Continuous maintenance of bathrooms, rest areas, and food areas during the event.
                  </ListGroupItem>
                  <ListGroupItem className="text-dark">
                    Post-Event Cleaning: Thorough cleaning of the event area after its conclusion, including garbage collection and site sanitation.
                  </ListGroupItem>
                </ListGroup>
              </Card>

            </Col>
          </Row>
          <Row className="px-5 ml-auto mr-auto">
            
            {/* <Col>
              <Card className="primary-bg-color"
                // color="primary"

                inverse
              >
                <CardHeader tag="h3" className="mx-2">
                  Film Industry
                </CardHeader>
                <ListGroup>
                  <ListGroupItem className="text-dark">
                    Set Cleaning: Cleaning of filming sets before, during, and after production.
                  </ListGroupItem>
                  <ListGroupItem className="text-dark">
                    Location Maintenance: Regular maintenance of filming locations, including cleaning of common and exterior areas.
                  </ListGroupItem>
                  <ListGroupItem className="text-dark">
                    Waste Management: Proper disposal of waste and garbage generated during filming.
                  </ListGroupItem>
                </ListGroup>
              </Card>
            </Col> */}
            {/* Add more industries as needed */}
          </Row>
        </Container>
      </div>
      {/* <Footer /> */}
    </>
  );
}

export default AboutUsPage;
