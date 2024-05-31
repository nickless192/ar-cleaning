import './../../assets/css/quote-dropdown.css';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  // Button,
  DropdownMenu,
  DropdownItem,
  // UncontrolledDropdown,
  Dropdown,
  DropdownToggle
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

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [quotes, setQuotes] = useState([]); // State to hold the quote object
  const [displayedQuote, setDisplayedQuote] = useState({}); // State to hold the displayed quotes

  const toggle = () => setDropdownOpen(prevState => !prevState);

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
              <h2 className="title">Search for a quote:</h2>
              {/* <p className="description">Search for a quote:</p> */}
              <Dropdown isOpen={dropdownOpen} toggle={toggle}>
                    <DropdownToggle caret>
                      {`Selected Quote: ${displayedQuote.name || 'Select Quote...'}`}
                    </DropdownToggle>
                    <DropdownMenu className='scrollable-dropdown-menu'>
                      {quotes.map((quote) => (
                        <DropdownItem key={quote._id} onClick={() => setDisplayedQuote(quote)}>
                          {quote.name}
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
              <Row>
                <Col className="text-center ml-auto mr-auto" lg="6" md="8">
                  
                  {/* <InputGroup className="input-lg">
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
                  </InputGroup> */}
                  {quotes.length === 0 && (
                    <p className="text-danger">No quotes found!</p>
                  )}
                  {/* <UncontrolledDropdown className="button-dropdown">
                    <DropdownToggle
                      caret
                      data-toggle="dropdown"
                      href="#pablo"
                      id="navbarDropdown"
                      tag="a"
                      onClick={(e) => e.preventDefault()}
                    >                      
                      <i className="now-ui-icons users_single-02"></i>
                  Select Quote
                    </DropdownToggle>
                    <DropdownMenu aria-labelledby="navbarDropdown">                     
                      {quotes.map((quote, index) => (
                        <DropdownItem key={quote._id} onClick={(e) => setDisplayedQuote(quotes[index])}>
                          {quote.name}
                        </DropdownItem>
                      ))}

                    </DropdownMenu>
                  </UncontrolledDropdown> */}
                  {/* <Input
                    type="select"
                    value=""
                    name='service'
                    // onChange={(e) => setDisplayedQuote(quotes[index])}
                  > */}
                  {/* <option value="">Select Quote...</option>
                    {quotes.map((quote, index) => (
                      { index === 0 && (
                        <Input
                      type="select"
                      value=""
                      name='service'
                      // onChange={(e) => setDisplayedQuote(quotes[index])}
                    >) : null}

                      <option value={quote._id} key={quote._id} onChange={(e) => setDisplayedQuote(quotes[index])}>
                        {quote.name}
                      </option>
                    ))}
                  </Input> */}




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
                      <Input
                        placeholder="Phone Number..."
                        type="text"
                        value={displayedQuote.phonenumber}
                        readOnly
                      />
                    </InputGroup>
                    <InputGroup className="input-lg">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="now-ui-icons tech_mobile"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        placeholder="Company Name..."
                        type="text"
                        value={displayedQuote.companyName}
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
                    <InputGroup className="textarea-container">
                      <Input
                        cols="80"
                        name="description"
                        placeholder="Message..."
                        rows="4"
                        type="textarea"
                        value={displayedQuote.description}
                        readOnly
                      />
                    </InputGroup>

                    <InputGroup className="input-lg">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="now-ui-icons shopping_tag-content"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        placeholder="Service Type..."
                        type="text"
                        value={displayedQuote.serviceType}
                        readOnly
                      />
                      <Input
                        placeholder="How did you hear about us..."
                        type="text"
                        value={displayedQuote.howDidYouHearAboutUs}
                        readOnly
                      />
                    </InputGroup>
                    {/* Product Selector */}
                    <div className="product-selector">
                      <h5>Products:</h5>
                      {displayedQuote.products.length === 0 && (
                        <p className="text-danger">No products selected!</p>
                      )}
                      {displayedQuote.products.length !== 0 && displayedQuote.products.map((product, index) => (
                      <InputGroup key={index}>
                        <Input
                          placeholder="Product..."
                          type="text"
                          value={product.name}
                          readOnly
                        />
                        <Input
                          placeholder="Product Cost..."
                          type="number"
                          value={product.productCost}
                          readOnly
                        />
                        <Input
                          placeholder="Id..."
                          type="text"
                          value={product.id}
                          readOnly
                        />
                      </InputGroup>
                    ))}
                    </div>
                    {/* Service Selector */}
                    <div className="service-selector">
                      <h5>Services:</h5>
                      {displayedQuote.services.length === 0 && (
                        <p className="text-danger">No services selected!</p>
                      )}

                      {displayedQuote.services.length !== 0 && displayedQuote.services.map((service, index) => (
                      <InputGroup key={index}>
                        <Input
                          placeholder="Service..."
                          type="text"
                          value={service.name}
                          readOnly
                        />
                        <Input
                          placeholder="Service cost..."
                          type="number"
                          value={service.serviceCost}
                          readOnly
                        />
                        <Input
                          placeholder="Id..."
                          type="text"
                          value={service.id}
                          readOnly
                        />
                      </InputGroup>
                    ))}
                    


                    </div>
                    <div>
                    <h5>Costs:</h5>
                    <InputGroup className="input-lg">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="now-ui-icons shopping_tag-content"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        placeholder="Subtotal Cost..."
                        type="number"
                        value={displayedQuote.subtotalCost}
                        readOnly
                      />
                      <Input
                        placeholder="Tax..."
                        type="number"
                        value={displayedQuote.tax}
                        readOnly
                      />
                      <Input
                        placeholder="Total Cost..."
                        type="number"
                        value={displayedQuote.grandTotal}
                        readOnly
                      />
                    </InputGroup>
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
