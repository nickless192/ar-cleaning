import React from 'react';
import {
  Container,
  Row,
  Col,
  Input,
  InputGroup,
  Card,
  CardHeader,
  ListGroup,
  ListGroupItem

} from 'reactstrap'; // Importing required components from reactstrap

import Navbar from "components/Pages/Navbar.js";
import Footer from "components/Pages/Footer.js";

const ProductsAndServices = () => {

  React.useEffect(() => {
    document.body.classList.add("products-services-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    return function cleanup() {
      document.body.classList.remove("products-services-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  return (
    <>
      <Navbar />

      <div className="section light-blue-bg-color pb-0 mb-0">
        <div className="content">
          {/* <Row>
              <Col className="ml-auto mr-auto text-center" md="8">
                <h1 className="title"> </h1>
                </Col>
            </Row> */}
          <h2 className="title">Products and Services</h2>
          <p className="description text-cleanar-color">Explore our offerings below:</p>
          <Row>
            <Col className="text-center ml-auto mr-auto">
              <div className="product-selector">
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
              <div className="service-selector">
                <h5>Services:</h5>
                {/* <InputGroup>
                      <Input type="select" defaultValue="">
                        <option value="" disabled>Select Service...</option>
                        <option value="Deep Cleaning">Deep Cleaning</option>
                        <option value="Spot Cleaning">Spot Cleaning</option>
                        <option value="Stain Removal">Stain Removal</option>
                        <option value="Odor Removal">Odor Removal</option>
                        <option value="Area Rug Cleaning">Area Rug Cleaning</option>
                      </Input>
                    </InputGroup> */}
                <div className="section-services ml-auto mr-auto ">
                  <Row className="px-5">
                    <Col>
                      <Card className="km-bg-light"
                        // color="primary"
                        inverse
                      // style={{
                      //   width: '18rem'
                      // }}
                      >
                        <CardHeader tag="h3" className="mx-2">
                          {/* <h3 className="text-dark"> */}
                          Residential Cleaning
                          {/* </h3> */}
                        </CardHeader>
                        <ListGroup>
                          <ListGroupItem className="text-dark">
                            Complete cleaning of homes, apartments, and condominiums.
                          </ListGroupItem>
                          <ListGroupItem className="text-dark">
                            Carpet Cleaning to revitalize and maintain the freshness of carpets.
                          </ListGroupItem>
                          <ListGroupItem className="text-dark">
                            Furniture cleaning to preserve its beauty and prolong its lifespan.
                          </ListGroupItem>
                        </ListGroup>
                      </Card>
                    </Col>
                    <Col>
                      <Card className="km-bg-light"
                        // color="primary"
                        inverse
                      // style={{
                      //   width: '18rem'
                      // }}
                      >
                        <CardHeader tag="h3" className="mx-2">
                          {/* <h3 className="text-dark"> */}
                          Commercial Cleaning
                          {/* </h3> */}
                        </CardHeader>
                        <ListGroup>
                          <ListGroupItem className="text-dark">
                            Regular maintenance of offices and commercial spaces.
                          </ListGroupItem>
                          <ListGroupItem className="text-dark">
                            Cleaning of shopping centers and supermarkets.
                          </ListGroupItem>
                          <ListGroupItem className="text-dark">
                            Specialized services for the film industry and special events.
                          </ListGroupItem>
                        </ListGroup>
                      </Card>
                    </Col>
                    <Col>
                      <Card className="km-bg-light"
                        // color="primary"
                        inverse
                      // style={{
                      //   width: '18rem'
                      // }}
                      >
                        <CardHeader tag="h3" className="mx-2">
                          {/* <h3 className="text-dark"> */}
                          Specialized Cleaning

                          {/* </h3> */}
                        </CardHeader>
                        <ListGroup>
                          <ListGroupItem className="text-dark">
                            Cleaning contracts for real estate developers and condominiums.
                          </ListGroupItem>
                          <ListGroupItem className="text-dark">
                            Carpet Cleaning at large events and festivals.
                          </ListGroupItem>
                          <ListGroupItem className="text-dark">
                            High-end furniture cleaning in residences and commercial spaces.
                          </ListGroupItem>
                        </ListGroup>
                      </Card>

                    </Col>

                  </Row>

                </div>
              </div>
              {/* <div className="send-button">
                  </div> */}
            </Col>
          </Row>


        </div>
        {/* </div> */}

        {/* </div> */}


      </div>
      <Footer />
    </>
  );
};

export default ProductsAndServices;
