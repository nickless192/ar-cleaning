import React, { useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Button } from 'react-bootstrap'; // Standardize on react-bootstrap

// Assuming your CSS path is correct relative to this file or configured globally
import "./../../assets/css/our-palette.css"; // Keep your custom styles
// It's good practice to also import Bootstrap CSS if not done globally
// import 'bootstrap/dist/css/bootstrap.min.css';

import VisitorCounter from "components/Pages/VisitorCounter.js";

// Import images (ensure paths are correct)
import carpetCleaningBg from "assets/img/stock-photo-high-angle-view-person-cleaning-white-carpet-professional-vacuum-cleaner.jpg";
import residentialCleaningBg from "assets/img/man-servant-cleaning-house.jpg";
import commercialCleaningBg from "assets/img/full-shot-people-cleaning-office.jpg";

// --- Data Structure for Services ---
const servicesData = [
  {
    title: "Residential Cleaning",
    imgSrc: residentialCleaningBg,
    imgAlt: "Cleaning technician mopping the floor - Designed by Freepik",
    description: [
      "Complete cleaning of homes, apartments, and condominiums.",
      "Carpet Cleaning to revitalize and maintain the freshness of carpets.",
      "Furniture cleaning to preserve its beauty and prolong its lifespan.",
    ],
    quoteLink: "/request-quote?service=Residential",
    quoteButtonText: "Add Residential Cleaning to Quote"
  },
  {
    title: "Commercial Cleaning",
    imgSrc: commercialCleaningBg,
    imgAlt: "Cleaners on office cleaning desks and floor - Designed by Freepik",
    description: [
      "Regular maintenance of offices and commercial spaces.",
      "Cleaning of shopping centers and supermarkets.",
      "Specialized services for the film industry and special events.",
    ],
    quoteLink: "/request-quote?service=Commercial",
    quoteButtonText: "Add Commercial Cleaning to Quote"
  },
  {
    title: "Carpet and Upholstery Cleaning",
    imgSrc: carpetCleaningBg,
    imgAlt: "Carpet cleaning, vacuum cleaner on carpet - Designed by Freepik",
    description: [
      "Deep cleaning of carpets in homes and commercial spaces.",
      "Stain removal and odor neutralization.",
      "Upholstery cleaning to maintain the beauty and comfort of furniture.",
    ],
    quoteLink: "/request-quote?service=Carpet+Cleaning", // URL encode space
    quoteButtonText: "Add Carpet Cleaning to Quote"
  },
  // Add Power washing
  {
    title: "Power Washing",
    imgSrc: carpetCleaningBg, // Placeholder, replace with actual image
    imgAlt: "Power washing - Designed by Freepik",
    description: [
      "High-pressure cleaning for driveways, sidewalks, and patios.",
      "Removal of dirt, mold, and mildew from exterior surfaces.",
      "Preparation of surfaces for painting or sealing.",
    ],
    quoteLink: "/request-quote?service=Power+Washing", // URL encode space
    quoteButtonText: "Add Power Washing to Quote"
  }
];

// --- Reusable Service Card Component ---
const ServiceCard = ({ title, imgSrc, imgAlt, description, quoteLink, quoteButtonText }) => {
  return (
    <Card className="h-100 card-border white-bg-color shadow-sm"> {/* h-100 for equal height, add shadow for depth */}
      <Card.Img variant="top" src={imgSrc} alt={imgAlt} />
      <Card.Body className="d-flex flex-column"> {/* Use flexbox to push button down */}
        <Card.Title as="h3" className="text-bold secondary-color">{title}</Card.Title>
        <ListGroup variant="flush" className="flex-grow-1 mb-3"> {/* flush removes card borders, flex-grow takes space */}
          {description.map((item, index) => (
            // Ensure ListGroup.Item background is transparent or matches card if needed
            <ListGroup.Item key={index} className="px-0 py-1 border-0 text-dark bg-transparent">
              {item}
            </ListGroup.Item>
          ))}
        </ListGroup>
        {/* <Button
          variant="primary" // Use Bootstrap variants
          href={quoteLink}
          className="btn-round mt-auto" // mt-auto pushes button to bottom
        >
          {quoteButtonText}
        </Button> */}
      </Card.Body>
    </Card>
  );
};


// --- Main Products and Services Page Component ---
const ProductsAndServices = () => {

  useEffect(() => {
    // Add classes for potential page-specific styling overrides
    document.body.classList.add("products-services-page");
    // Assuming sidebar-collapse is desired for this page layout
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    // Scroll to top on mount
    window.scrollTo(0, 0); // More standard way

    // Cleanup function to remove classes when component unmounts
    return function cleanup() {
      document.body.classList.remove("products-services-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []); // Empty dependency array ensures this runs only once on mount and cleanup on unmount

  return (
    <>
      {/* <Navbar /> */} {/* Assuming Navbar is handled globally or in a layout component */}

      {/* Use semantic section tag if appropriate */}
      <section className="content py-5 section-background products-services-section"> {/* Added padding Y */}
        <VisitorCounter page={"products-and-services"} />
        <Container> {/* Use Container for centered, max-width content */}
          <h1 className="title secondary-color text-center mb-4">Products and Services</h1>

          <div className="service-selector mb-5"> {/* Added margin bottom */}
            <h2 className="title secondary-color mb-4">Our Services</h2>
            <Row xs={1} md={2} lg={3} className="g-4"> {/* Responsive Grid: 1 col on xs, 2 on md, 3 on lg. g-4 adds gutters */}
              {servicesData.map((service, index) => (
                <Col key={index} className="d-flex align-items-stretch"> {/* Ensure cols stretch to content height */}
                  <ServiceCard {...service} />
                </Col>
              ))}
            </Row>
          </div>

          {/* --- Optional Products Section (Example) --- */}
          {/*
          <div className="product-selector">
            <h2 className="title secondary-color mb-4">Our Products</h2>
            <Row xs={1} md={2} lg={3} className="g-4">
              <Col className="d-flex align-items-stretch">
                 // You could create a ProductCard component here too
                 <Card className="h-100 card-border white-bg-color shadow-sm">
                   <Card.Body className="d-flex flex-column">
                     <Card.Title as="h3" className="text-bold secondary-color">Gift Cards</Card.Title>
                     <ListGroup variant="flush" className="flex-grow-1 mb-3">
                       <ListGroup.Item className="px-0 py-1 border-0 text-dark bg-transparent">Gift cards for cleaning services.</ListGroup.Item>
                       <ListGroup.Item className="px-0 py-1 border-0 text-dark bg-transparent">Available in various denominations.</ListGroup.Item>
                       <ListGroup.Item className="px-0 py-1 border-0 text-dark bg-transparent">Perfect for friends and family.</ListGroup.Item>
                     </ListGroup>
                     <Button variant="primary" href="/request-quote" className="btn-round mt-auto">Add Gift Card to Quote</Button>
                   </Card.Body>
                 </Card>
              </Col>
              // Add more product columns if needed
            </Row>
          </div>
          */}

        </Container>
      </section>
    </>
  );
};

export default ProductsAndServices;