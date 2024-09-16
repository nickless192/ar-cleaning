import './../../assets/css/quote-dropdown.css';
import './../../assets/css/our-palette.css';
import Auth from "../../utils/auth";
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
import { FloatingLabel,
  Form
 } from 'react-bootstrap';

import Navbar from "components/Pages/Navbar.js";
import Footer from "components/Pages/Footer.js";

const ViewQuote = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [quotes, setQuotes] = useState([]);
  const [displayedQuote, setDisplayedQuote] = useState({ products: [], services: [], name: '', phonenumber: '', companyName: '', email: '', description: '', serviceType: '', howDidYouHearAboutUs: '', subtotalCost: 0, tax: 0, grandTotal: 0 });
  const [isLogged] = useState(Auth.loggedIn());
  const {quoteId} = useParams();


  const toggle = () => setDropdownOpen(prevState => !prevState);

  const searchQuote = () => {

    const quoteSearchTerm = document.getElementById('search').value;
    if (!quoteSearchTerm) {
      console.error('No search term provided!');
      return;
    }

    // if the user is logged, and if the quoteSearchTerm is one of the quotes in the quotes array, then perform the fetch
    if ((isLogged && quotes.includes(quoteSearchTerm))|| !isLogged) {
      fetch(`/api/quotes/${quoteSearchTerm}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Quote not found');
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        // first confirm if the quote can be displayed.
        if (((data.quoteId === data.userId)||isLogged)) {

          setDisplayedQuote(data);
        } else {
          console.log('user cannot see this quote');
        }

      })
      .catch((error) => {
        setDisplayedQuote({ products: [], services: [], name: '', phonenumber: '', companyName: '', email: '', description: '', serviceType: '', howDidYouHearAboutUs: '', subtotalCost: 0, tax: 0, grandTotal: 0 });
        console.error('Error:', error);
        // Optionally display an error message to the user
        window.alert('Quote not found!');
      });
    }
    

    fetch(`/api/quotes/${quoteSearchTerm}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Quote not found');
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        // first confirm if the quote can be displayed.
        if ((data.quoteId === data.userId)) {

          setDisplayedQuote(data);
        } else {
          console.log('user cannot see this quote');
        }

      })
      .catch((error) => {
        setDisplayedQuote({ products: [], services: [], name: '', phonenumber: '', companyName: '', email: '', description: '', serviceType: '', howDidYouHearAboutUs: '', subtotalCost: 0, tax: 0, grandTotal: 0 });
        console.error('Error:', error);
        // Optionally display an error message to the user
        window.alert('Quote not found!');
      });


  };

  useEffect(() => {

    const prepopulateQuotes = async () => {
      // console.log('isLogged: ', isLogged);
      
      if (isLogged) {
        // console.log('Auth.getProfile(): ', Auth.getProfile());
        if (Auth.getProfile().data.adminFlag) {
          const response = await fetch('/api/quotes');
          const data = await response.json();
          // console.log(data);
          setQuotes(data);
          if (quoteId) {
            const quote = data.find(quote => quote.quoteId === quoteId);
            if (quote) {
              setDisplayedQuote(quote);
            }
          }
        }
        else {
          const response = await fetch(`/api/quotes/user/${Auth.getProfile().data._id}`);
          const data = await response.json();
          setQuotes(data);
          // if the quoteId is in the quotes array, then setDisplayedQuote to the quoteId
          if (quoteId) {
            const quote = data.find(quote => quote.quoteId === quoteId);
            if (quote) {
              setDisplayedQuote(quote);
            }
          }
        }
      }
      else if (quoteId) {
        fetch(`/api/quotes/${quoteId}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Quote not found');
            }
            return response.json();
          })
          .then((data) => {
            console.log(data);
            // first confirm if the quote can be displayed.
            if ((data.quoteId === data.userId)) {
              setDisplayedQuote(data);
            } 

            else {
              // console.log('user cannot see this quote');
              alert('You are not authorized to view this quote, please log in to view your quotes');
            }
          })
          .catch((error) => {
            setDisplayedQuote({ products: [], services: [], name: '', phonenumber: '', companyName: '', email: '', description: '', serviceType: '', howDidYouHearAboutUs: '', subtotalCost: 0, tax: 0, grandTotal: 0 });
            console.error('Error:', error);
            // Optionally display an error message to the user
            window.alert('Quote not found!');
          });
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
  }, [isLogged, quoteId]);

  return (
    <>
      {/* <Navbar /> */}

      <div
        className="section section-signup light-bg-color"
        style={{
          // backgroundImage: "url(" + require("assets/img/stock-photo-high-angle-view-person-cleaning-white-carpet-professional-vacuum-cleaner.jpg") + ")",
          backgroundSize: "cover",
          backgroundColor: "green",
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
                className=""
                id="search"
                placeholder="Search for a quote..."
                type="text"
              />
              <InputGroupAddon addonType="append">
                <InputGroupText className="" onClick={searchQuote}>
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
                  {`Select Quote...`}
                </DropdownToggle>
                <DropdownMenu className='scrollable-dropdown-menu'>
                  <DropdownItem onClick={() => setDisplayedQuote({ products: [], services: [] })}>Quotes</DropdownItem>
                  {quotes.map((quote) => (
                    <DropdownItem key={quote._id} onClick={() => setDisplayedQuote(quote)}>
                      {"Quote Id: "}{quote.quoteId} - {"Created on: "}{quote.createdAt} - {"Requested By: "}{quote.name} {quote.userId}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            ) : (
              <h3 className="text-light">Please log in to view all your quotes</h3>
            )}

            {/* <Row>
              <Col className="text-center ml-auto mr-auto" lg="12" md="8">
                {quotes.length === 0 && (
                  <p className='text-danger'>No quotes found!</p>
                )}
              </Col>
            </Row> */}
            {displayedQuote && <QuoteDetails displayedQuote={displayedQuote} />}
          </Container>
        </div>
      </div>
      {/* <Footer /> */}
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
    'Address': 'address',
    'City': 'city',
    'Province': 'province',
    'Postal Code': 'postalcode',
    // 'Service Type': 'serviceType',
    'How Did You Hear About Us': 'howDidYouHearAboutUs'
  };

  return (

    <>
      <h3 className="mt-5">Quote Information:</h3>
      <div className=' rounded p-2'>
<Row className="justify-content-center">
    
        {Object.keys(fieldMapping).map(displayLabel => (
          <Col key={displayLabel} className="text-light" lg="4" md="12">
          <FloatingLabel
          controlId="floatingInput"
          label={fieldMapping[displayLabel]}
          className="mb-3"
        >
          <Form.Control type="text" placeholder={`${displayLabel}...`} alt={`${displayLabel}...`}
                value={displayedQuote[fieldMapping[displayLabel]]} id={fieldMapping[displayLabel]} />
          </FloatingLabel>
          </Col>
          // <FormGroup key={displayLabel} className="text-light">
          //   <Label for={fieldMapping[displayLabel]} className="text-light">{displayLabel}</Label>
          //   <InputGroup className="no-border">
          //     <InputGroupAddon addonType="prepend">
          //       <InputGroupText className="text-light ">
          //         <i className={`now-ui-icons ${iconClassMap[displayLabel]}`}></i>
          //       </InputGroupText>
          //     </InputGroupAddon>
          //     <Input
          //       id={fieldMapping[displayLabel]}
          //       className="text-light no-cursor "
          //       placeholder={`${displayLabel}...`}
          //       type="text"
          //       alt={`${displayLabel}...`}
          //       value={displayedQuote[fieldMapping[displayLabel]]}
          //       readOnly
          //     />
          //   </InputGroup>
          // </FormGroup>
        ))}
        </Row>
        {/* <ProductList products={displayedQuote.products} /> */}
        <ServiceList services={displayedQuote.services} />
        {/* <CostDetails displayedQuote={displayedQuote} /> */}
      </div>
    </>
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
            <Input id={`product-${index}`} className="text-light " placeholder="Product..." type="text" value={product.name} readOnly />
            <Input className="text-light " placeholder="Product Cost..." type="number" value={product.productCost} readOnly />
            <Input className="text-light " placeholder="Id..." type="text" value={product.id} readOnly />
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
            <Input
              id={`service-type-${index}`}
              className="text-light"
              placeholder="Service Type..."
              type="text"
              value={service.type}
              readOnly
            />
            <Input
              id={`service-level-${index}`}
              className="text-light"
              placeholder="Service Level..."
              type="text"
              value={service.serviceLevel}
              readOnly
            />
            <InputGroupAddon addonType="append" className="text-light">Custom Options:</InputGroupAddon>
          </InputGroup>
          
          {Array.from(service.customOptions).map(([key, option], optIndex) => (
            <InputGroup key={optIndex} className="mb-2">
              <Input
                id={`option-${index}-${optIndex}`}
                className="text-light"
                placeholder="Option Name..."
                type="text"
                value={key}
                readOnly
              />
              <Input
                className="text-light"
                placeholder="Option Value..."
                type="text"
                value={option.service}
                readOnly
              />
              <Input
                className="text-light"
                placeholder="Service Cost..."
                type="number"
                value={option.serviceCost}
                readOnly
              />
            </InputGroup>
          ))}
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
            <InputGroupText className="">
              <i className="now-ui-icons shopping_tag-content"></i>
            </InputGroupText>
          </InputGroupAddon>
          <Input
            id={field}
            className="text-light "
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
