import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import VisitorCounter from "components/Pages/VisitorCounter.js";
import { Helmet } from "react-helmet";
import {
  // Modal,
  // ModalHeader,
  // ModalBody,
  // ModalFooter,
  // Button,
  Carousel, CarouselItem, CarouselControl, CarouselIndicators, CarouselCaption,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardText,
  ListGroup,
  ListGroupItem,
  Row,
  Col,
  CardImg
} from "reactstrap";
import {
  // Container,
  // Accordion,
  // AccordionItem,
  // AccordionHeader,
  // AccordionBody,
} from "react-bootstrap";
import QuickQuote from "./QuickQuote";

// import backgroundImage from 'assets/img/stock-photo-high-angle-view-person-cleaning-white-carpet-professional-vacuum-cleaner.jpg';
import Logo from "assets/img/IC CLEAN AR-15-cropped.png";

function Index() {

  // const [promoCode] = useState('FALL15');
  // const [promoCode] = useState('WINTER10');


  const items = [
    // {
    //   content: (
    //     <div className="promo-slide fall-saving-slide">
    //       <h3 className="slide-title">Fall Savings! Book with code FALL15 and get 15% off your next service!</h3>
    //       <p className="">
    //         This fall, use code <Link to={`/request-quote?promoCode=FALL15`} className="slide-link">FALL15</Link> to enjoy 15% off your next cleaning service with CleanAR Solutions!
    //         <br />
    //         <a href="mailto:info@cleanARsolutions.ca" className="slide-link">Contact us</a> today or <Link to={`/request-quote?promoCode=FALL15`} className="slide-link" alt>click here to request a quote.</Link>
    //       </p>
    //     </div>
    //   )
    // },
    {
      content: (
        <div className="promo-slide follow-us-slide">
          <h3 className="slide-title">Follow Us on Instagram!</h3>
          <p>
            Stay up-to-date with our latest news, promotions, and cleaning tips!
            <br />
            <a href="https://www.instagram.com/cleanarsolutions/" target="_blank" rel="noreferrer" className="slide-link" title="Follow us on Instagram">Join us on Instagram</a>
          </p>
        </div>
      )
    },
    // create content for winter10 code for new customers
    {
      content: (
        <div className="promo-slide winter-saving-slide">
          <h3 className="slide-title">New Customer? Use code <span className="winter-title">WINTER10</span> for 10% off your first service!</h3>
          <p>
            New customers can enjoy 10% off their first cleaning service with CleanAR Solutions! <br />
            Use code <Link to={`/request-quote?promoCode=WINTER10`} className="slide-link" title="Use code for promo">WINTER10</Link> when you book.
            <br />
            <a href="mailto:info@cleanarsolutions.ca" className="slide-link">Contact us</a> today or <Link to={`/request-quote?promoCode=WINTER10`} className="slide-link" alt title="Use code for promo">click here to request a quote.</Link>
          </p>
        </div>
      )
    },
    // create content for ad to get customers tor request upholsery cleaning for the new year with a new year new you theme
    {
      content: (
        <div className="promo-slide new-year-slide">
          <h3 className="slide-title">New Year, New Upholstery!</h3>
          <p className='new-year-saving-p'>
            Start the new year with fresh upholstery! <br />
            Book your upholstery cleaning service with CleanAR Solutions today.
            <br />
            <Link to="/request-quote?service=Carpet Cleaning" className="slide-link" title="Request a quote">Request a quote</Link>
          </p>
        </div>
      )
    },
    // {
    //   // create content to get customer to request a quote page
    //   content: (
    //     <div className="promo-slide request-quote-slide">
    //       <h3 className="slide-title">Get a Quote Today!</h3>
    //       <p>
    //         Get the professional cleaning services you need with CleanAR Solutions! Contact us to learn more and request a quote.
    //         <br />
    //         <Link to="/request-quote" className="slide-link" title="Request a quote">Request a quote</Link>
    //       </p>
    //     </div>
    //   )
    // },

    //   {
    // content: (
    //   <div className="promo-slide work-with-us-slide">
    //     <h3 className="slide-title">Work with Us!</h3>
    //     <p>
    //   Join our mission to provide exceptional cleaning services. If you are passionate about cleanliness and customer service, email us your resume.
    //   <br />
    //   <a href="mailto:info@cleanARsolutions.ca" className="slide-link">Email us</a>
    //     </p>
    //   </div>
    // )
    //   },
    // {
    //   content: (
    //     <div className="promo-slide display-review-slide">
    //       <h3 className="slide-title">Read Our Reviews!</h3>
    //       <p>
    //         New customer? Check out our reviews on Google!
    //         <br />
    //         <a href="https://www.google.com/search?q=cleanar+solutions" target="_blank" rel="noreferrer" className="slide-link" title="Read our Google reviews">Read Reviews</a>
    //       </p>
    //     </div>
    //   )
    // },
    // {
    //   content: (
    //     <div className="promo-slide review-slide">
    //       <h3 className="slide-title">We'd love to hear from you!</h3>
    //       <p>
    //         Returning customer? Share your experience by leaving a review on Google.
    //         <br />
    //         <a href="https://g.page/r/Cek9dkmHVuBKEAE/review" target="_blank" rel="noreferrer" className="slide-link" title="Leave a Google review">Leave a Review</a>
    //       </p>
    //     </div>
    //   )
    // },
    // {
    //   src: 'https://via.placeholder.com/800x400?text=Slide+3',
    //   altText: 'Slide 3',
    //   caption: 'Slide 3 Caption'
    // }

  ];
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  const next = () => {
    if (animating) return;
    const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(nextIndex);
  };

  const previous = () => {
    if (animating) return;
    const nextIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
    setActiveIndex(nextIndex);
  };

  const goToIndex = (newIndex) => {
    if (animating) return;
    setActiveIndex(newIndex);
  };

  const slides = items.map((item, index) => {
    if (item.content) {
      return (
        <CarouselItem
          key={index}
          onExiting={() => setAnimating(true)}
          onExited={() => setAnimating(false)}
        >
          <div className="d-block w-100 promo-slide-container">
            {item.content}
          </div>
        </CarouselItem>
      );
    }

    return (
      <CarouselItem
        key={item.src}
        onExiting={() => setAnimating(true)}
        onExited={() => setAnimating(false)}
      >
        <img src={item.src} alt={item.altText} className="d-block w-100" />
        <CarouselCaption captionText={item.caption} captionHeader={item.altText} />
      </CarouselItem>
    );
  });


  useEffect(() => {
    // const modalShown = localStorage.getItem('modalShown');

    document.body.classList.add("index-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    // window.scrollTo(0, 0);
    // document.body.scrollTop = 0;
    // initializeServices();
    return function cleanup() {
      document.body.classList.remove("index-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>CleanAR Solutions - Home</title>
        <meta name="description" content="CleanAR Solutions offers professional cleaning services for residential and commercial properties. Book now and enjoy a clean and fresh environment." />
        <meta name="keywords" content="cleaning, professional cleaning, residential cleaning, commercial cleaning, CleanAR Solutions" />
        <meta name="author" content="Omar Rodriguez" />
        <meta itemprop="name" content="CleanAR Solutions" />
        <meta itemprop="description" content="CleanAR Solutions offers top-quality cleaning services across Toronto and the GTA. From deep cleans to specialized property cleanouts, we tailor our services to" />
        <meta itemprop="image" content="" />
        <meta property="og:title" content="CleanAR Solutions - Home" />
        <meta property="og:description" content="CleanAR Solutions offers professional cleaning services for residential and commercial properties. Book now and enjoy a clean and fresh environment." />
        <meta property="og:url" content="www.cleanarsolutions.ca/index" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.cleanarsolutions.ca/static/media/IC%20CLEAN%20AR-15-cropped.32f050a6a0836902ad34.png" />
        <meta property="og:image:alt" content="CleanAR Solutions logo" />
        <meta property="og:locale" content="en_CA" />
        <meta name="instagram:title" content="CleanAR Solutions - Home" />
        <meta name="instagram:description" content="CleanAR Solutions offers professional cleaning services for residential and commercial properties. Book now and enjoy a clean and fresh environment." />
        <meta name="instagram:url" content="www.instagram.com/cleanarsolutions" />
        <meta name="instagram:type" content="website" />
        <meta name="instagram:image:alt" content="CleanAR Solutions logo" />

      </Helmet>
      <VisitorCounter page={"index"} />
      <div className="content section-background index-section mb-0">
        <Row>
          <Col xs='12' md='6'>
            <CardImg top className="logo-image-index" src={Logo} alt="CleanAR Solutions logo" />
            <h1 className="primary-color text-bold montserrat-bold">CleanAR Solutions</h1>
            <p className=" p-styling martel-regular">
              With more 10 years of experience, our services are designed to meet the unique needs of our clients, providing personalized solutions and exceptional results on every project. At <b>CleanAR Solutions</b>, we take pride in offering reliable and high-quality service that ensures the impeccable cleanliness and maintenance of any space.  We are here to help you find the perfect cleaning solution for your needs; fill up our quick form 👆 (Request Quote) and we'll be in touch with a quote. Need more information? Below you'll find all of our contact information 👇
            </p>
          </Col>
          {/* <Col xs='12' md='6'>
            <QuickQuote />

          </Col> */}
        </Row>
        <Row className="">
          <Col className="" xs='12' md='6'>
            <Card className="card-plain">
              <CardBody>
                <CardText>
                  <ListGroup>
                    {/* <ListGroupItem className="gradient-bg">
                    <i className="now-ui-icons tech_laptop"></i><Link to="/request-quote" className="text-bold" title="Request a quote"> Want To Request A Quote?</Link> <br />
                    <span>Get the professional cleaning services you need with CleanAR Solutions! We offer a range of services, contact us today to learn more about our services and request a quote.</span>
                  </ListGroupItem> */}
                    <ListGroupItem className="gradient-bg">
                      <i className="now-ui-icons tech_mobile"></i><Link to="tel:437-440-5514" className="text-bold martel-semibold" title="Call us at 437-440-5514"> Call or message us at 437-440-5514</Link> <br />
                      <span className="martel-bold">Our customer service team is available to assist you Monday through Saturday, from 8:00 AM to 7:00 PM (1:00 PM on Saturday). Don't hesitate to call for any inquiries or support!</span>
                    </ListGroupItem>
                    <ListGroupItem className="gradient-bg">
                      <i className="now-ui-icons ui-1_email-85"></i><a href="mailto:info@cleanARsolutions.ca" className="text-bold martel-semibold" title="Email us your questions at info@cleanARsolutions.ca"> Email us your questions at info@cleanARsolutions.ca</a><br />
                      <span className="martel-bold">For detailed inquiries or if you prefer written communication, drop us an email. We aim to respond within 24 hours.</span>
                    </ListGroupItem>
                    <ListGroupItem className="gradient-bg">
                      <i className="now-ui-icons ui-2_like"></i><a href="https://www.instagram.com/cleanarsolutions/" target="_blank" rel="noreferrer" className="text-bold martel-semibold" title="Follow our Instagram account"> Follow Us on Instagram</a> <br />
                      <span className="martel-bold">Stay up-to-date with our latest news, promotions, and cleaning tips! Follow us on Instagram for more information.</span>
                    </ListGroupItem>
                    <ListGroupItem className="gradient-bg">
                      <i className="now-ui-icons business_bulb-63"></i><a href="https://g.page/r/Cek9dkmHVuBKEAE/review" target="_blank" rel="noreferrer" className="text-bold martel-semibold" title="Leave a Google review"> Leave A Google Review</a> <br />
                      <span className="martel-bold">Share your experience with CleanAR Solutions! We value your feedback and would love to hear about your experience with our services.</span>
                    </ListGroupItem>
                    {/* <ListGroupItem className="gradient-bg">
                      <i className="now-ui-icons location_pin"></i><Link to="/service-area" className="text-bold martel-semibold" title="View our service area"> View Our Service Area</Link> <br />
                      <span className="martel-bold">We offer professional cleaning services across Toronto and the GTA. Check out our service area to see if we cover your location.</span>
                    </ListGroupItem> */}
                  </ListGroup>
                </CardText>
              </CardBody>
              {/* </Card> */}

              {/* </Row> */}
            </Card>
            {/* <Carousel
              activeIndex={activeIndex}
              next={next}
              previous={previous}
              className="carousel"
            // interval={3000}
            >
              <CarouselIndicators items={items} activeIndex={activeIndex} onClickHandler={goToIndex} />
              {slides}
              <CarouselControl direction="prev" directionText="Previous" onClickHandler={previous} />
              <CarouselControl direction="next" directionText="Next" onClickHandler={next} />
            </Carousel> */}
          </Col>
          <Col className="ml-0">
          </Col>

        </Row>
        <Row className="py-0 px-2 ">
          <Col md="6" className="px-0">
          </Col>
          <Col md="6" className="px-0">

          </Col>
        </Row>
      </div>
    </>
  );
}

export default Index;
