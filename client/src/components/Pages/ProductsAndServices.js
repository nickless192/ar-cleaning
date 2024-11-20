import React from 'react';
import { useEffect } from 'react';
import "./../../assets/css/our-palette.css";
import {
  Row,
  Col,
  CardGroup,
  Card,
  CardHeader,
  ListGroup,
  ListGroupItem,
  CardBody,
  Button

} from 'reactstrap'; // Importing required components from reactstrap


const ProductsAndServices = () => {

  useEffect(() => {
    document.body.classList.add("products-services-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    // window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    return function cleanup() {
      document.body.classList.remove("products-services-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  return (
    <>
      {/* <Navbar /> */}

      <div className="container pb-0 mb-0">
        {/* <div className="container"> */}
          <h2 className="title">Products and Services</h2>
          {/* <Row>
            <Col className="text-center ml-auto mr-auto"> */}
              <div className="service-selector text-center">
                <h3 className="title text-start">Our Services</h3>                
                <Row className="">
                  {/* <Col> */}
                  <CardGroup>
                    <Card className="card-border"
                    // color="primary"
                    //   inverse
                    //   outline
                    >
                      <CardHeader tag="h3" className="m-1">
                        Residential Cleaning
                        {/* </h3> */}
                      </CardHeader>
                      <CardBody>
                        <ListGroup>
                          <ListGroupItem className="">
                            Complete cleaning of homes, apartments, and condominiums.
                          </ListGroupItem>
                          <ListGroupItem className="text-dark">
                            Carpet Cleaning to revitalize and maintain the freshness of carpets.
                          </ListGroupItem>
                          <ListGroupItem className="text-dark">
                            Furniture cleaning to preserve its beauty and prolong its lifespan.
                          </ListGroupItem>
                        </ListGroup>
                      </CardBody>
                      <Button className="btn-round" color="primary" href="/request-quote?service=Residential">Add Residential Cleaning to Quote</Button>
                    </Card>
                    <Card className="card-border"
                    // color="primary"
                    // outline
                    //   inverse
                    >
                      <CardHeader tag="h3" className="m-1">
                        Commercial Cleaning
                        {/* </h3> */}
                      </CardHeader>
                      <CardBody>
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
                      </CardBody>
                      <Button className="btn-round" color="primary" href="/request-quote?service=Commercial">Add Commercial Cleaning to Quote</Button>
                    </Card>
                    {/*
                    <Card className=""
                    color="primary"
                    outline
                      inverse
                    >
                      <CardHeader tag="h3" className="m-1">
                        Specialized Cleaning
                      </CardHeader>
                      <CardBody>
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
                      </CardBody>
                      <Button className="btn-round" color="primary" href="/request-quote?service=Commercial">Add Specialized Cleaning to Quote</Button>
                    </Card>

                   */}
                    <Card className="card-border"
                    // color="primary"
                    // outline
                      // inverse
                    >
                      <CardHeader tag="h3" className="m-1">
                        Carpet Cleaning
                      </CardHeader>
                      <CardBody>
                        <ListGroup>
                          <ListGroupItem className="text-dark">
                            Deep cleaning of carpets in homes and commercial spaces.
                          </ListGroupItem>
                          <ListGroupItem className="text-dark">
                            Stain removal and odor neutralization.
                          </ListGroupItem>
                          <ListGroupItem className="text-dark">
                            Regular maintenance to prolong the life of carpets.
                          </ListGroupItem>
                        </ListGroup>
                      </CardBody>
                      <Button className="btn-round" color="primary" href="/request-quote?service=Carpet Cleaning">Add Carpet Cleaning to Quote</Button>
                    </Card>
                    </CardGroup>
                  {/* </Col> */}                 
                </Row>
              </div>
              {/* <div className="product-selector">
                <h3 className="title text-start">Our Products</h3>
                <Row className="">
                  <Col className="text-center">
                  <CardGroup>
                    <Card className="card-border"
                      // inverse
                    >
                      <CardHeader tag="h3" className="m-1">
                        Gift Cards
                      </CardHeader>
                      <CardBody>
                        <ListGroup>
                          <ListGroupItem className="text-dark">
                            Gift cards for cleaning services.
                          </ListGroupItem>                          
                          <ListGroupItem className="text-dark">
                            Available in various denominations.
                          </ListGroupItem>
                          <ListGroupItem className="text-dark">
                            Perfect for friends and family.
                          </ListGroupItem>
                        </ListGroup>
                      </CardBody>
                      <Button className="btn-round" color="primary" href="/request-quote">Add Gift Card to Quote</Button>
                    </Card>
                  </CardGroup>
                  </Col>
                  </Row>
                  </div> */}

            {/* </Col>
          </Row> */}
        {/* </div> */}
      </div>
    </>
  );
};

export default ProductsAndServices;
