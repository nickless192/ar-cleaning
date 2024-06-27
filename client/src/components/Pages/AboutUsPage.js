import React from "react";
import {
  // Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardText,
  CardHeader,
  ListGroup,
  ListGroupItem,

} from "reactstrap";
import "./../../assets/css/our-palette.css";
import Logo from "../../assets/img/cleanARsolutions-logo-no-bg-sm.png";

import Navbar from "components/Pages/Navbar.js";
import Footer from "components/Pages/Footer.js";
// import AboutUsPage from "components/Pages/AboutUsPage";
// import ProfilePage from "components/Pages/ProfilePage";

function AboutUsPage() {


  React.useEffect(() => {
    document.body.classList.add("index-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    // initializeServices();
    return function cleanup() {
      document.body.classList.remove("index-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  return (
    <>
      <Navbar />
      {/* <div className="page-header clear-filter" filter-color="blue"> */}
      {/* <div
        className="page-header-image"
        style={{
          backgroundImage: "url(" + require("assets/img/stock-photo-professional-cleaners-safety-protocols-wearing-protection-suits-while-sanitizing-furniture.jpg") + ")",
          // backgroundRepeat: "repeat",
          // backgroundSize: "auto"
        }}
      > */}
        <Row>
          {/* <div className="content"> */}
          <div className="section section-about-us km-bg-primary">
            {/* <Container> */}
            <Row className="pt-5">
                      {/* <Col> */}
                      <div className="logo-container">
                      {/* <img
                        alt="..."
                        src={Logo}
                        
                      ></img> */}
                      </div>
                      {/* </Col> */}
              <Col className="ml-auto mr-auto text-center" md="8" lg="6">
                <p className="text-bold pt-5 km-text-secondary">
                At CleanAR Solutions, we are dedicated to providing professional and reliable cleaning services in Toronto and the Greater Toronto Area. With a steadfast focus on excellence and customer satisfaction, we strive to exceed expectations on every project, delivering impeccable results and exceptional service. Our team of experienced and skilled professionals is committed to ensuring your space is not only clean but also a healthy and pleasant environment.
                <br />
                <br />

Whether you need residential, commercial, or specialized cleaning services, we tailor our approach to meet your unique needs and ensure your complete satisfaction. Ready to experience the CleanAR difference? Click on "Request Quote" from the top navigation bar to get started. Still have questions? Feel free to contact us via email or phone. Our friendly team is here to answer any questions and help you find the perfect cleaning solution for your needs.
                </p>
              </Col>
            </Row>
            {/* </Container> */}
          </div>
          <div className="bg-white section-industries bg-primary">

            <h2 className="title text-center text-dark my-0">Industries We Serve</h2>
            <Row className="p-5 ml-auto mr-auto my-0">
              <Col>
                <Card className="bg-primary"
                  // color="primary"
                  inverse
                // style={{
                //   width: '18rem'
                // }}
                >
                  <CardHeader tag="h3" className="mx-2">
                    {/* <h3 className="text-dark"> */}
                    Residential Buildings
                    {/* </h3> */}
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
                <Card className="bg-primary"
                  // color="primary"
                  inverse
                // style={{
                //   width: '18rem'
                // }}
                >
                  <CardHeader tag="h3" className="mx-2">
                    {/* <h3 className="text-dark"> */}
                    Offices
                    {/* </h3> */}
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
              <Col>
                <Card className="bg-primary"
                  // color="primary"
                  inverse
                // style={{
                //   width: '18rem'
                // }}
                >
                  <CardHeader tag="h3" className="mx-2">
                    {/* <h3 className="text-dark"> */}
                    Shopping Centers
                    {/* </h3> */}
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
              </Col>
            {/* </Row>
            <Row className="px-5 ml-auto mr-auto"> */}
              <Col>
                <Card className="bg-primary"
                  // color="primary"
                  inverse
                // style={{
                //   width: '18rem'
                // }}
                >
                  <CardHeader tag="h3" className="mx-2">
                    {/* <h3 className="text-dark"> */}
                    Festivals
                    {/* </h3> */}
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
              <Col>
                <Card className="bg-primary"
                  // color="primary"

                  inverse
                // style={{
                //   width: '18rem'
                // }}
                >
                  <CardHeader tag="h3" className="mx-2">
                    {/* <h3 className="text-dark"> */}
                    Film Industry
                    {/* </h3> */}
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
              </Col>
              {/* Add more industries as needed */}
            </Row>

          </div>
          
          <div className="bg-white section-additional-info py-2 px-5">

            {/* <h2 className="title text-center text-dark">Additional Information</h2> */}
            <p className="test-primary ">
              Our services are designed to meet the unique needs of our clients, providing personalized solutions and exceptional results on every project. At CleanAR Solutions, we take pride in offering reliable and high-quality service that ensures the impeccable cleanliness and maintenance of any space. Get started by requesting a quote, or log in to your account to manage your existing quotes and services. Have questions? Contact us today to speak with a member of our team. We are here to help you find the perfect cleaning solution for your needs.
            </p>

          </div>
          {/* <LandingPage /> */}
          {/* <ProfilePage /> */}
          {/* </div> */}


        </Row>
        <Footer />
      {/* </div> */}
      {/* </div> */}
    </>
  );
}

export default AboutUsPage;
