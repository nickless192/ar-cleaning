import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Button
} from 'reactstrap'; // Importing required components from reactstrap

const ViewQuote = () => {
  // Stubbed quote object
  const stubbedQuote = {
    name: 'John Doe',
    email: 'john@example.com',
    description: 'Lorem ipsum dolor sit amet',
    products: [
      { name: 'Shampoo', amount: 1, costPerQuantity: 10 },
      { name: 'Spot Remover', amount: 2, costPerQuantity: 15 }
    ],
    services: [
      { name: 'Deep Cleaning', amount: 1, costPerQuantity: 50 },
      { name: 'Spot Cleaning', amount: 1, costPerQuantity: 30 }
    ]
  };

  const [quote, setQuote] = useState(stubbedQuote); // State to hold the quote object
  const [searchTerm, setSearchTerm] = useState(''); // State to hold the search term

  const handleSearch = () => {
    // Simulate fetching quote based on search term
    // You can replace this with actual API call to fetch the quote
    // Here, we're just setting a sample quote object
    const sampleQuote = {
      name: 'John Doe',
      email: 'john@example.com',
      description: 'Lorem ipsum dolor sit amet',
      products: [
        { name: 'Shampoo', amount: 1, costPerQuantity: 10 },
        { name: 'Spot Remover', amount: 2, costPerQuantity: 15 }
      ],
      services: [
        { name: 'Deep Cleaning', amount: 1, costPerQuantity: 50 },
        { name: 'Spot Cleaning', amount: 1, costPerQuantity: 30 }
      ]
    };
    setQuote(sampleQuote); // Set the quote state with the sample quote
  };

  return (
    <>
      <div className="wrapper">
        <div className="section section-contact-us text-center">
          <Container>
            <h2 className="title">View Quote</h2>
            <p className="description">Search for a quote:</p>
            <Row>
              <Col className="text-center ml-auto mr-auto" lg="6" md="8">
                <InputGroup className="input-lg">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="now-ui-icons ui-1_zoom-bold"></i>
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Search..."
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
                <Button
                  color="primary"
                  onClick={handleSearch}
                  disabled={!searchTerm} // Disable button if search term is empty
                >
                  Search
                </Button>
              </Col>
            </Row>
            {quote && (
              <Row>
                <Col className="text-center ml-auto mr-auto" lg="6" md="8">
                  {/* Render quote details if quote state is not null */}
                  <h3 className="mt-5">Quote Information:</h3>
                  <InputGroup className="input-lg">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="now-ui-icons users_circle-08"></i>
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      placeholder="Your Name..."
                      type="text"
                      value={quote.name}
                      readOnly
                    />
                  </InputGroup>
                  <InputGroup className="input-lg">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="now-ui-icons ui-1_email-85"></i>
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      placeholder="Your Email..."
                      type="email"
                      value={quote.email}
                      readOnly
                    />
                  </InputGroup>
                  <div className="textarea-container">
                    <Input
                      cols="80"
                      name="description"
                      placeholder="Message..."
                      rows="4"
                      type="textarea"
                      value={quote.description}
                      readOnly
                    />
                  </div>
                  {/* Product Selector */}
                  <div className="product-selector">
                    <h5>Products:</h5>
                    {quote.products.map((product, index) => (
                      <InputGroup key={index}>
                        <Input
                          placeholder="Product..."
                          type="text"
                          value={product.name}
                          readOnly
                        />
                        <Input
                          placeholder="Amount..."
                          type="number"
                          value={product.amount}
                          readOnly
                        />
                        <Input
                          placeholder="Cost per Quantity: $..."
                          type="text"
                          value={product.costPerQuantity}
                          readOnly
                        />
                      </InputGroup>
                    ))}
                  </div>
                  {/* Service Selector */}
                  <div className="service-selector">
                    <h5>Services:</h5>
                    {quote.services.map((service, index) => (
                      <InputGroup key={index}>
                        <Input
                          placeholder="Service..."
                          type="text"
                          value={service.name}
                          readOnly
                        />
                        <Input
                          placeholder="Amount..."
                          type="number"
                          value={service.amount}
                          readOnly
                        />
                        <Input
                          placeholder="Cost per Quantity: $..."
                          type="text"
                          value={service.costPerQuantity}
                          readOnly
                        />
                      </InputGroup>
                    ))}
                  </div>
                </Col>
              </Row>
            )}
          </Container>
        </div>
      </div>
    </>
  );
};

export default ViewQuote;
