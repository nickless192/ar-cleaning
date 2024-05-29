import React from 'react';
import {
  Container,
  Row,
  Col,
  Input,
  InputGroup,
} from 'reactstrap'; // Importing required components from reactstrap

import Navbar from "components/Pages/Navbar.js";
import Footer from "components/Pages/Footer.js";

const ProductsAndServices = () => {
  return (
    <>
      <Navbar />
      <div
        className="section section-signup"
        style={{
          backgroundImage: "url(" + require("assets/img/bg8.jpg") + ")",
          backgroundSize: "cover",
          backgroundPosition: "top center",
          minHeight: "700px"
        }}
      >
        <div className="wrapper">
          <div className="section section-contact-us text-center">
            <Container>
              <h2 className="title">Products and Services</h2>
              <p className="description">Explore our offerings below:</p>
              <Row>
                <Col className="text-center ml-auto mr-auto" lg="6" md="8">
                  <div className="product-selector">
                    <h5>Products:</h5>
                    <InputGroup>
                      <Input type="select" defaultValue="">
                        <option value="" disabled>Select Product...</option>
                        <option value="Shampoo">Shampoo</option>
                        <option value="Spot Remover">Spot Remover</option>
                        <option value="Carpet Deodorizer">Carpet Deodorizer</option>
                        <option value="Stain Protector">Stain Protector</option>
                        <option value="Carpet Cleaning Machine Rental">Carpet Cleaning Machine Rental</option>
                      </Input>
                    </InputGroup>
                  </div>
                  <div className="service-selector">
                    <h5>Services:</h5>
                    <InputGroup>
                      <Input type="select" defaultValue="">
                        <option value="" disabled>Select Service...</option>
                        <option value="Deep Cleaning">Deep Cleaning</option>
                        <option value="Spot Cleaning">Spot Cleaning</option>
                        <option value="Stain Removal">Stain Removal</option>
                        <option value="Odor Removal">Odor Removal</option>
                        <option value="Area Rug Cleaning">Area Rug Cleaning</option>
                      </Input>
                    </InputGroup>
                  </div>
                  <div className="send-button">
                  </div>
                </Col>
              </Row>
            </Container>
          </div>
        </div>
      </div>
      <Footer />

    </>
  );
};

export default ProductsAndServices;
