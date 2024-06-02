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
  DropdownMenu,
  DropdownItem,
  Dropdown,
  DropdownToggle,
  FormGroup,
  Label
} from 'reactstrap';

import Navbar from "components/Pages/Navbar.js";
import Footer from "components/Pages/Footer.js";

const ViewQuote = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [quotes, setQuotes] = useState([]);
  const [displayedQuote, setDisplayedQuote] = useState({ products: [], services: [] });
  

  const toggle = () => setDropdownOpen(prevState => !prevState);

  useEffect(() => {
    fetch('/api/quotes')
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setQuotes(data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });

      document.body.classList.add("view-quote-page");
      document.body.classList.add("sidebar-collapse");
      document.documentElement.classList.remove("nav-open");
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      return function cleanup() {
        document.body.classList.remove("view-quote-page");
        document.body.classList.remove("sidebar-collapse");      
      };
  }, []);

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
        <div className="content">
          <Container>
            <h2 className="title text-light">Search for a quote:</h2>
            <Dropdown isOpen={dropdownOpen} toggle={toggle}>
              <DropdownToggle caret>
                {`Selected Quote: ${displayedQuote.name || 'Select Quote...'}`}
              </DropdownToggle>
              <DropdownMenu className='scrollable-dropdown-menu'>
                <DropdownItem onClick={() => setDisplayedQuote({ products: [], services: [] })}>Quotes</DropdownItem>
                {quotes.map((quote) => (
                  <DropdownItem key={quote._id} onClick={() => setDisplayedQuote(quote)}>
                    {quote.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Row>
              <Col className="text-center ml-auto mr-auto" lg="6" md="8">
                {quotes.length === 0 && (
                  <p className="text-danger">No quotes found!</p>
                )}
              </Col>
            </Row>
            {displayedQuote && <QuoteDetails displayedQuote={displayedQuote} />}
          </Container>
        </div>
      </div>
      <Footer />
    </>
  );
};

const QuoteDetails = ({ displayedQuote }) => {
  const fieldMapping = {
    'Name': 'name',
    'Phone Number': 'phonenumber',
    'Company Name': 'companyName',
    'Email': 'email',
    'Description': 'description',
    'Service Type': 'serviceType',
    'How Did You Hear About Us': 'howDidYouHearAboutUs'
  };

  return (
    <Col className="text-center ml-auto mr-auto" lg="6" md="8">
      <h3 className="mt-5 text-light">Quote Information:</h3>
      {Object.keys(fieldMapping).map(displayLabel => (
        <FormGroup key={displayLabel} className="text-light">
          <Label for={fieldMapping[displayLabel]} className="text-light">{displayLabel}</Label>
          <InputGroup className="no-border">
            <InputGroupAddon addonType="prepend">
              <InputGroupText className="text-light">
                <i className={`now-ui-icons ${iconClassMap[displayLabel]}`}></i>
              </InputGroupText>
            </InputGroupAddon>
            <Input
              id={fieldMapping[displayLabel]}
              className="text-light"
              placeholder={`${displayLabel}...`}
              type="text"
              value={displayedQuote[fieldMapping[displayLabel]]}
              readOnly
            />
          </InputGroup>
        </FormGroup>
      ))}
      <ProductList products={displayedQuote.products} />
      <ServiceList services={displayedQuote.services} />
      <CostDetails displayedQuote={displayedQuote} />
    </Col>
  );
};

const ProductList = ({ products }) => (
  <div className="product-selector">
    <h5 className="text-light">Products:</h5>
    {products.length === 0 ? (
      <p className="text-danger">No products selected!</p>
    ) : (
      products.map((product, index) => (
        <FormGroup key={index} className="text-light">
          <Label for={`product-${index}`} className="text-light">Product</Label>
          <InputGroup>
            <Input id={`product-${index}`} className="text-light" placeholder="Product..." type="text" value={product.name} readOnly />
            <Input className="text-light" placeholder="Product Cost..." type="number" value={product.productCost} readOnly />
            <Input className="text-light" placeholder="Id..." type="text" value={product.id} readOnly />
          </InputGroup>
        </FormGroup>
      ))
    )}
  </div>
);

const ServiceList = ({ services }) => (
  <div className="service-selector">
    <h5 className="text-light">Services:</h5>
    {services.length === 0 ? (
      <p className="text-danger">No services selected!</p>
    ) : (
      services.map((service, index) => (
        <FormGroup key={index} className="text-light">
          <Label for={`service-${index}`} className="text-light">Service</Label>
          <InputGroup>
            <Input id={`service-${index}`} className="text-light" placeholder="Service..." type="text" value={service.name} readOnly />
            <Input className="text-light" placeholder="Service cost..." type="number" value={service.serviceCost} readOnly />
            <Input className="text-light" placeholder="Id..." type="text" value={service.id} readOnly />
          </InputGroup>
        </FormGroup>
      ))
    )}
  </div>
);

const CostDetails = ({ displayedQuote }) => (
  <div>
    <h5 className="text-light">Costs:</h5>
    {['subtotalCost', 'tax', 'grandTotal'].map(field => (
      <FormGroup key={field} className="text-light">
        <Label for={field} className="text-light">{capitalize(field)}</Label>
        <InputGroup className="input-lg">
          <InputGroupAddon addonType="prepend">
            <InputGroupText className="text-light">
              <i className="now-ui-icons shopping_tag-content"></i>
            </InputGroupText>
          </InputGroupAddon>
          <Input
            id={field}
            className="text-light"
            placeholder={`${capitalize(field)}...`}
            type="number"
            value={displayedQuote[field]}
            readOnly
          />


        </InputGroup>
      </FormGroup>
    ))}
  </div>
);

const iconClassMap = {
  'Name': 'users_circle-08',
  'Phone Number': 'tech_mobile',
  'Company Name': 'tech_mobile',
  'Email': 'ui-1_email-85',
  'Description': 'shopping_tag-content',
  'Service Type': 'shopping_tag-content',
  'How Did You Hear About Us': 'shopping_tag-content',
};

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

export default ViewQuote;
