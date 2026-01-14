import React, { useEffect, useState } from 'react';
import { Row, Col, Card, ListGroup, Button } from 'react-bootstrap'; // Standardize on react-bootstrap
import { useTranslation } from 'react-i18next';
import VisitorCounter from "/src/components/Pages/Management/VisitorCounter.jsx";

// Import images (ensure paths are correct)
import carpetCleaningBg from "/src/assets/img/stock-photo-high-angle-view-person-cleaning-white-carpet-professional-vacuum-cleaner.jpg";
import residentialCleaningBg from "/src/assets/img/man-servant-cleaning-house.jpg";
import commercialCleaningBg from "/src/assets/img/full-shot-people-cleaning-office.jpg";
import pressureCleaningBg from "/src/assets/img/person-wearing-yellow-rubber-boots-with-high-pressure-water-nozzle-cleaning-dirt-tiles.jpg";
import windowCleaningBg from "/src/assets/img/man-cleaning-window.jpg";
import pageBg from "/src/assets/img/bg1.png";

const imageMap = {
  "residential-cleaning": residentialCleaningBg,
  "commercial-cleaning": commercialCleaningBg,
  "carpet-and-upholstery": carpetCleaningBg,
  "power-pressure-washing": pressureCleaningBg,
  "window-cleaning": windowCleaningBg,
};

// --- Reusable Service Card Component ---
const ServiceCard = ({ title, imgSrc, imgAlt, description, quoteLink, quoteButtonText }) => {
  // --- Data Structure for Services ---

  return (
    <Card className="h-90 shadow-sm bg-transparent"> {/* h-100 for equal height, add shadow for depth */}
      <Card.Img variant="top" src={imgSrc} alt={imgAlt} className="service-card-img" />
      <Card.Body className="d-flex flex-column"> {/* Use flexbox to push button down */}
        <Card.Title as="h3" className="text-bold text-cleanar-color">{title}</Card.Title>
        <ListGroup className="flex-grow-1 mb-3 "> {/* flush removes card borders, flex-grow takes space */}
          {/* {description.map((item, index) => (
            // Ensure ListGroup.Item background is transparent or matches card if needed
            <ListGroup.Item key={index} className="px-0 py-1 border-0 text-dark bg-transparent">
              {item}
            </ListGroup.Item>
          ))} */}
          {Array.isArray(description) ? (
            description.map((item, index) => (
              <ListGroup.Item key={index} className="px-0 py-1 border-0 bg-transparent">
                {item}
              </ListGroup.Item>
            ))
          ) : (
            <ListGroup.Item className="px-0 py-1 border-0">
              {description}
            </ListGroup.Item>
          )}

        </ListGroup>
        <Button
          // variant="primary" // Use Bootstrap variants
          href={quoteLink}
          data-track={`clicked_add_to_quote_${title.replace(/\s+/g, '_').toLowerCase()}`}
          className="btn-round mt-auto secondary-bg-color" // mt-auto pushes button to bottom
        >
          {quoteButtonText}
        </Button>
      </Card.Body>
    </Card>
  );
};


// --- Main Products and Services Page Component ---
const ProductsAndServices = () => {
  const { t, i18n } = useTranslation(); // Initialize translation hook
  const [categories, setCategories] = useState([]);

  const normalizeLabel = (label) => {
    // console.log("Normalized label:", label.toLowerCase().replace(/[\s/]+/g, "-"));
    return label.toLowerCase().replace(/[\s/]+/g, "-");
  };

  // const servicesData = categories.map(cat => ({
  //   title: t(`${cat.key}`),
  //   imgSrc: imageMap[normalizeLabel(cat.labelKey)] || residentialCleaningBg,
  //   imgAlt: t(`${cat.labelKey}_imgAlt`, "Service image"),
  //   description: t(`${cat.descriptionKey}`, { returnObjects: true }),
  //   quoteLink: `/index?service=${encodeURIComponent(t(cat.labelKey))}&scrollToQuote=true`,
  //   quoteButtonText: t(
  //     "products_and_services." +
  //     cat.labelKey.toLowerCase().replace(/[\s/]+/g, "_") +
  //     "_button",
  //     { defaultValue: "Get a Quote For This Service" }
  //   ),
  // }));


  const servicesData = [
    {
      title: t("products_and_services.residential_cleaning_title"),
      imgSrc: residentialCleaningBg,
      imgAlt: "Cleaning technician mopping the floor - Designed by Freepik",
      description: t("products_and_services.residential_cleaning_description", { returnObjects: true }),
      quoteLink: "/index?service=Residential+Cleaning",
      quoteButtonText: t("products_and_services.residential_cleaning_button")
    },
    {
      title: t("products_and_services.commercial_cleaning_title"),
      imgSrc: commercialCleaningBg,
      imgAlt: "Cleaners on office cleaning desks and floor - Designed by Freepik",
      description: t("products_and_services.commercial_cleaning_description", { returnObjects: true }),
      quoteLink: "/index?service=Commercial+Cleaning", // URL encode space
      quoteButtonText: t("products_and_services.commercial_cleaning_button")
    },
    // add window cleaning
    {
      title: t("products_and_services.window_cleaning_title"),
      imgSrc: windowCleaningBg, // Placeholder, replace with actual image
      imgAlt: "Window cleaning - Designed by Freepik",
      description: t("products_and_services.window_cleaning_description", { returnObjects: true }),
      quoteLink: "/index?service=Window+Cleaning", // URL encode space
      quoteButtonText: t("products_and_services.window_cleaning_button")
    },
    {
      title: t("products_and_services.carpet_cleaning_title"),
      imgSrc: carpetCleaningBg,
      imgAlt: "Carpet cleaning, vacuum cleaner on carpet - Designed by Freepik",
      description: t("products_and_services.carpet_cleaning_description", { returnObjects: true }),
      quoteLink: "/index?service=Carpet+And+Upholstery", // URL encode space
      quoteButtonText: t("products_and_services.carpet_and_upholstery_button")
    },
    // Add Power washing
    {
      title: t("products_and_services.power_washing_title"),
      imgSrc: pressureCleaningBg, // Placeholder, replace with actual image
      imgAlt: "Power washing - Designed by Freepik",
      description: t("products_and_services.power_washing_description", { returnObjects: true }),
      quoteLink: "/index?service=Power/Pressure+Washing", // URL encode space
      quoteButtonText: t("products_and_services.power_pressure_washing_button")
    }
  ];

  useEffect(() => {
    // Fetch categories from API
    // fetch('/api/categories')
    //   .then(res => res.json())
    //   .then(data => setCategories(data.filter(cat => cat.type === "service" && cat.isVisible)))
    //   .catch(err => console.error('Error loading categories:', err));
    // Add classes for potential page-specific styling overrides
    // console.log("loaded categories:", categories);
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
  }, [i18n.language]); // Empty dependency array ensures this runs only once on mount and cleanup on unmount




  return (
    <>
      {/* <Navbar /> */} {/* Assuming Navbar is handled globally or in a layout component */}

      {/* Use semantic section tag if appropriate */}
      <section className="section-background" style={{ backgroundImage: `url(${pageBg})` }}> {/* Added padding Y */}
        <VisitorCounter page={"products-and-services"} />
        <section> {/* Use Container for centered, max-width content */}
          <h1 className="title primary-color text-center mb-4 pt-5 text-bold">{t("products_and_services.products_services_title")}</h1>

          <div className="service-selector mb-5"> {/* Added margin bottom */}
            <h2 className="title secondary-color mb-4 text-bold">{t("products_and_services.our_services_title")}</h2>
            <p className="text-left mb-4 text-cleanar-color text-bold">{t("products_and_services.our_services_description")}</p> {/* Optional description */}
            {/* <p className="text-cleanar-color">
  Our processes and service standards are informed by best practices from{" "}
  <a
    href="https://cims.issa.com/"
    target="_blank"
    rel="noopener noreferrer"
  >
    ISSA’s Cleaning Industry Management Standard (CIMS)
  </a>
  , the global benchmark for quality-focused cleaning organizations.
</p> */}
            <p className="fs-6 text-cleanar-color mt-3">{t("issa.prefix")}
              {/* CleanAR Solutions is a proud member of */}
              {" "}
              <a
                href="https://issa-canada.com/en/issa-canada-en/about-issa-canada-en"
                target="_blank"
                rel="noopener noreferrer"
              >{t("issa.linkText")}
                {/* ISSA Canada, a division of ISSA – the worldwide cleaning industry association */}
              </a>{t("issa.suffix")}
              {/* . This membership reflects our ongoing commitment to professional standards
              in the cleaning industry. */}
            </p>
            <Row className='justify-content-center'> {/* Responsive Grid: 1 col on xs, 2 on md, 3 on lg. g-4 adds gutters */}
              {servicesData.map((service, index) => (
                <Col xs={12} md={4} key={index} className="d-flex align-items-stretch  mb-1 mt-1"> {/* Ensure cols stretch to content height */}
                  <ServiceCard {...service} />
                </Col>
              ))}
            </Row>
          </div>

          {/* --- Optional Products Section (Example) --- */}

          <div className="product-selector">
            <h2 className="title primary-color mb-4 text-bold">{t("products_and_services.our_products_title")}</h2>
            <Row className="g-4 justify-content-center">
              <Col xs={12} md={4} className="d-flex align-items-stretch">
                {/* // You could create a ProductCard component here too */}
                <Card className="h-100 card-border shadow-sm">
                  <Card.Body className="d-flex flex-column">
                    <Card.Title as="h3" className="text-bold primary-color">{t("products_and_services.coming_soon")}</Card.Title>
                  </Card.Body>
                </Card>
              </Col>
              {/* // Add more product columns if needed */}
            </Row>
          </div>


        </section>
      </section>
    </>
  );
};

export default ProductsAndServices;