import React from 'react';
import { useEffect } from 'react';
import "./../../assets/css/our-palette.css";
import {
  Row,
  Col,
  CardGroup,
  // Card,
  CardHeader,
  ListGroup,
  ListGroupItem,
  CardBody,
  Button

} from 'reactstrap'; // Importing required components from reactstrap

import VisitorCounter from "components/Pages/VisitorCounter.js";

import {
  Card
} from 'react-bootstrap'

import carpetCleaningBg from "assets/img/stock-photo-high-angle-view-person-cleaning-white-carpet-professional-vacuum-cleaner.jpg"
import residentialCleaningBg from "assets/img/man-servant-cleaning-house.jpg";
import commercialCleaningBg from "assets/img/full-shot-people-cleaning-office.jpg";



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

      <div className="content pb-0 mb-0 section-background products-services-section">
        <VisitorCounter page={"products-and-services"} />
        {/* <div className="container"> */}
          <h1 className="title secondary-color">Products and Services</h1>
          {/* <Row>
            <Col className="text-center ml-auto mr-auto"> */}
              <div className="service-selector text-center">
                <h2 className="title text-start secondary-color">Our Services</h2>                
                <Row className="">
                  {/* <Col> */}
                  <CardGroup>
                    <Card className="card-border"
                    // color="primary"
                    //   inverse
                    //   outline
                    >
                      <h3 className="m-1 card-title text-bold">
                        Residential Cleaning
                        {/* </h3> */}
                      </h3>
                      <Card.Img variant="top" src={residentialCleaningBg} alt='Cleaning technician mopping the floor - Designed by Freepik' />
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
                      <h3 className="m-1 card-title text-bold">
                        Commercial Cleaning
                        {/* </h3> */}
                      </h3>
                      <Card.Img variant="top" src={commercialCleaningBg} alt='Cleaners on office cleaning desks and floor - Designed by Freepik' />
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
                      <CardHeader tag="h3" className="m-1 card-title">
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
                      <h3 className="m-1 card-title text-bold">
                        Carpet and Upholstery Cleaning
                      </h3>
                      <Card.Img variant="top" src={carpetCleaningBg} alt='Carpet cleaning, vaccum cleaner on carpet - Designed by Freepik' />
                      <CardBody>
                        <ListGroup>
                          <ListGroupItem className="text-dark">
                            Deep cleaning of carpets in homes and commercial spaces.
                          </ListGroupItem>
                          <ListGroupItem className="text-dark">
                            Stain removal and odor neutralization.
                          </ListGroupItem>
                          <ListGroupItem className="text-dark">
                            Upholstery cleaning to maintain the beauty and comfort of furniture.
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
                <h2 className="title text-start">Our Products</h2>
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
