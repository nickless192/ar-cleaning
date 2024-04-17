import React from 'react';
import {
  Button,
  Container,
  Row,
  Col,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText
} from 'reactstrap'; // Importing required components from reactstrap

const ProductsAndServices = () => {
  return (
    <>
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
                  <Button
                    block
                    className="btn-round"
                    color="info"
                    size="lg"
                  >
                    Add to Cart
                  </Button>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </>
  );
};

export default ProductsAndServices;
