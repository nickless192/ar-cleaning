import './../../assets/css/quote-dropdown.css';
import './../../assets/css/our-palette.css';
import Auth from "../../utils/auth";
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
  Label,
  Button
} from 'reactstrap';

import Navbar from "components/Pages/Navbar.js";
import Footer from "components/Pages/Footer.js";
import { f } from 'html2pdf.js';

const ViewQuote = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [quotes, setQuotes] = useState([]);
  const [displayedQuote, setDisplayedQuote] = useState({ products: [], services: [], name: '', phonenumber: '', companyName: '', email: '', description: '', serviceType: '', howDidYouHearAboutUs: '', subtotalCost: 0, tax: 0, grandTotal: 0});
  const [isLogged] = React.useState(Auth.loggedIn());
  

  const toggle = () => setDropdownOpen(prevState => !prevState);

  const searchQuote = () => {
    if (!document.getElementById('search').value) {
      console.error('No search term provided!');
      return;
    }
    
    fetch(`/api/quotes/${document.getElementById('search').value}`)
    .then((response) => {
        if (!response.ok) {
            throw new Error('Quote not found');
        }
        return response.json();
    })
    .then((data) => {
        console.log(data);
        setDisplayedQuote(data);
    })
    .catch((error) => {
      setDisplayedQuote({ products: [], services: [], name: '', phonenumber: '', companyName: '', email: '', description: '', serviceType: '', howDidYouHearAboutUs: '', subtotalCost: 0, tax: 0, grandTotal: 0});
        console.error('Error:', error);
        // Optionally display an error message to the user
        window.alert('Quote not found!');
    });
    
    
  };

  useEffect(() => {
    // fetch('/api/quotes')
    //   .then((response) => response.json())
    //   .then((data) => {
    //     // console.log(data);
    //     setQuotes(data);
    //   })
    //   .catch((error) => {
    //     console.error('Error:', error);
    //   });


      const prepopulateQuotes = async () => {
        console.log('isLogged: ', isLogged);
        if (isLogged) {
          console.log('Auth.getProfile(): ', Auth.getProfile());
          if (Auth.getProfile().data.adminFlag) {
            const response = await fetch('/api/quotes');
            const data = await response.json();
            // console.log(data);
            setQuotes(data);
          }
          else {
            const response = await fetch(`/api/quotes/user/${Auth.getProfile().data._id}`);
            const data = await response.json();
            setQuotes(data);
          }
        }
        else {
          // not logged in, so need to setQuotes to empty array
          setQuotes([]);
        }
      };

      prepopulateQuotes();

      document.body.classList.add("view-quote-page");
      document.body.classList.add("sidebar-collapse");
      document.documentElement.classList.remove("nav-open");
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      return function cleanup() {
        document.body.classList.remove("view-quote-page");
        document.body.classList.remove("sidebar-collapse");      
      };
  }, [isLogged]);

  return (
    <>
      <Navbar />
      
      <div
        className="section section-signup"
        style={{
          backgroundImage: "url(" + require("assets/img/stock-photo-high-angle-view-person-cleaning-white-carpet-professional-vacuum-cleaner.jpg") + ")",
          backgroundSize: "cover",
          backgroundPosition: "top center",
          minHeight: "700px"
        }}
      >
        <div className="content">
          <Container>
            <h2 className="title text-light">Search for a quote:</h2>
            {/* add a search bar for users to input a quote Id to search for */}
            <InputGroup>
              <Input
                className="text-light"
                id="search"
                placeholder="Search for a quote..."
                type="text"
              />
              <InputGroupAddon addonType="append">
                <InputGroupText className="text-light bg-secondary" onClick={searchQuote}>
                  <i className="now-ui-icons ui-1_zoom-bold"></i>
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            {/* <Button className="mt-3" color="primary">Search</Button> */}

{/* display the dropdown button if the user is logged */}
{/* if the user is not logged in, display a message to log in */} 
            {isLogged ? (
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
            ) : (
              <h3 className="text-light">Please log in to view all your quotes</h3>
            )}
            
            <Row>
              <Col className="text-center ml-auto mr-auto" lg="6" md="8">
                {quotes.length === 0 && (
                  <p className="text-danger">No quotes found!</p>
                )}
              </Col>
            </Row>
            {displayedQuote && <QuoteDetails displayedQuote={displayedQuote}/>}
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
      <h3 className="mt-5">Quote Information:</h3>
      <div className=' rounded p-2'>

      {Object.keys(fieldMapping).map(displayLabel => (
        <FormGroup key={displayLabel} className="text-light">
          <Label for={fieldMapping[displayLabel]} className="text-light">{displayLabel}</Label>
          <InputGroup className="no-border">
            <InputGroupAddon addonType="prepend">
              <InputGroupText className="text-light bg-secondary">
                <i className={`now-ui-icons ${iconClassMap[displayLabel]}`}></i>
              </InputGroupText>
            </InputGroupAddon>
            <Input
              id={fieldMapping[displayLabel]}
              className="text-light no-cursor bg-secondary"
              placeholder={`${displayLabel}...`}
              type="text"
              alt={`${displayLabel}...`}
              value={displayedQuote[fieldMapping[displayLabel]]}
              readOnly
            />
          </InputGroup>
        </FormGroup>
      ))}
      <ProductList products={displayedQuote.products} />
      <ServiceList services={displayedQuote.services} />
      <CostDetails displayedQuote={displayedQuote} />
      </div>
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
        <InputGroup className="no-border">
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
