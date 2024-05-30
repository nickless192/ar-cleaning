import React, { useState, useEffect } from 'react';
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

import Navbar from "components/Pages/Navbar.js";
import Footer from "components/Pages/Footer.js";

const ViewQuote = () => {
  // Stubbed quote object
  // const stubbedQuote = {
  //   name: 'John Doe',
  //   email: 'john@example.com',
  //   description: 'Lorem ipsum dolor sit amet',
  //   products: [
  //     { name: 'Shampoo', amount: 1, costPerQuantity: 10 },
  //     { name: 'Spot Remover', amount: 2, costPerQuantity: 15 }
  //   ],
  //   services: [
  //     { name: 'Deep Cleaning', amount: 1, costPerQuantity: 50 },
  //     { name: 'Spot Cleaning', amount: 1, costPerQuantity: 30 }
  //   ]
  // };

  const [quotes, setQuotes] = useState([]); // State to hold the quote object
  const [searchTerm, setSearchTerm] = useState(''); // State to hold the search term
  const [displayedQuote, setDisplayedQuote] = useState({}); // State to hold the displayed quotes

  // const handleSearch = () => {
  //   // Simulate fetching quote based on search term
  //   // You can replace this with actual API call to fetch the quote
  //   // Here, we're just setting a sample quote object
  //   const sampleQuote = {
  //     name: 'John Doe',
  //     email: 'john@example.com',
  //     description: 'Lorem ipsum dolor sit amet',
  //     products: [
  //       { name: 'Shampoo', amount: 1, costPerQuantity: 10 },
  //       { name: 'Spot Remover', amount: 2, costPerQuantity: 15 }
  //     ],
  //     services: [
  //       { name: 'Deep Cleaning', amount: 1, costPerQuantity: 50 },
  //       { name: 'Spot Cleaning', amount: 1, costPerQuantity: 30 }
  //     ]
  //   };
  //   setQuotes(sampleQuote); // Set the quote state with the sample quote
  // };

  useEffect(() => {
    fetch('/api/quotes') // Fetch quote data from the API
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setQuotes(data); // Set the quote state with the fetched data
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
  , []); // Empty dependency array to run the effect only once

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
                {quotes.length === 0 && (
                  <p className="text-danger">No quotes found!</p>
                )}
                {quotes.map((quote, index) => (
                  <Row key={index}>
                    <Col className="text-center ml-auto mr-auto" lg="6" md="8">
                      {/* <h3 className='mt-5'>Quote Information:</h3> */}
                      <Button
                        color="primary"
                        onClick={() => setDisplayedQuote(quotes[index])}
                        // disabled={!searchTerm} // Disable button if search term is empty
                        id={quote._id}
                        name={quote.name}
                        size='sm'

                      >
                        {quote.name} {quote._id}
                      </Button>
                      {/* <InputGroup className="input-lg">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="now-ui-icons users_circle-08"></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input
                          placeholder="Your Name..."
                          type="text"
                          value={quote._id}
                          readOnly
                        />
                      </InputGroup> */}
                      </Col>
                  </Row>  
                ) )}

                
                {/* <Button
                  color="primary"
                  onClick={handleSearch}
                  disabled={!searchTerm} // Disable button if search term is empty
                >
                  Search
                </Button> */}
              </Col>
            </Row>
            {displayedQuote && (
              
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
                      value={displayedQuote.name}
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
                      value={displayedQuote.email}
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
                      value={displayedQuote.description}
                      readOnly
                    />
                  </div>
                  {/* Product Selector */}
                  <div className="product-selector">
                    <h5>Products:</h5>
                    {/* {displayedQuote.products.map((product, index) => (
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
                    ))} */}
                  </div>
                  {/* Service Selector */}
                  <div className="service-selector">
                    <h5>Services:</h5>
                    {/* {displayedQuote.services.map((service, index) => (
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
                    ))} */}
                  </div>
                </Col>
              </Row>
            )}
                  
            
           
          </Container>
        </div>
      </div>
    </div>
        <Footer />
    </>
  );
};

export default ViewQuote;
