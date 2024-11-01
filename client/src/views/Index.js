import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import VisitorCounter from "components/Pages/VisitorCounter.js";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
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
  Container,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionBody,
} from "react-bootstrap";

import backgroundImage from 'assets/img/stock-photo-high-angle-view-person-cleaning-white-carpet-professional-vacuum-cleaner.jpg';
import Logo from "assets/img/IC CLEAN AR-15-cropped.png";

function Index() {

  const [promoCode] = useState('FALL15');

  const items = [
    {
      content: (
        <div className="promo-slide fall-saving-slide">
          <h3 className="slide-title">Fall Savings! Book with code FALL15 and get 15% off your next service!</h3>
          <p className="">
            This fall, use code <Link to={`/request-quote?promoCode=FALL15`} className="slide-link">FALL15</Link> to enjoy 15% off your next cleaning service with CleanAR Solutions!
            <br />
            <a href="mailto:info@cleanARsolutions.ca" className="slide-link">Contact us</a> today or <Link to={`/request-quote?promoCode=FALL15`} className="slide-link" alt>click here to request a quote.</Link>
          </p>
        </div>
      )
    }, {
      // create content to get customer to request a quote page
      content: (
        <div className="promo-slide request-quote-slide">
          <h3 className="slide-title">Get a Quote Today!</h3>
          <p>
            Get the professional cleaning services you need with CleanAR Solutions! We offer a range of services, contact us today to learn more about our services and request a quote.
            <br />
            <Link to="/request-quote" className="slide-link">Click here to request a quote.</Link>
          </p>
        </div>
      )
    },
    {
      content: (
        <div className="promo-slide follow-us-slide">
          <h3 className="slide-title">Follow Us on Instagram!</h3>
          <p>
            Stay up-to-date with our latest news, promotions, and cleaning tips!
            < br />
            <a href="https://www.instagram.com/cleanarsolutions/" target="_blank" rel="noreferrer" className="slide-link">Join us on Instagram for more information.</a>
          </p>
        </div>
      )
    },
    {
      content: (
        <div className="promo-slide work-with-us-slide">
          <h3 className="slide-title">Work with Us!</h3>
          <p>
            Join us in our mission to provide exceptional cleaning services to our clients. We are always looking for talented and dedicated individuals to join our team. If you are passionate about cleanliness and customer service, we want to hear from you.
            < br />
            <a href="mailto:info@cleanARsolutions.ca" className="slide-link">Email us your resume today.</a>
          </p>
        </div>
      )
    },
    {
      content: (
        <div className="promo-slide display-review-slide">
          <h3 className="slide-title">Read Our Reviews!</h3>
          <p>
            Are you a <strong>new</strong> customer considering our services? Check out our reviews on Google to see what our customers are saying about us!
            < br />
            <a href="https://www.google.com/search?q=cleanar+solutions&nfpr=1&sa=X&ved=2ahUKEwi-ktao06-JAxXDJzQIHUMUGRYQvgUoAXoECAsQAg&biw=1536&bih=730&dpr=1.25#" target="_blank" rel="noreferrer" className="slide-link">Read Reviews...</a>

          </p>
        </div>
      )
    },
    {
      content: (
        <div className="promo-slide review-slide">
          <h3 className="slide-title">We'd love to hear from you!</h3>
          <p>
            Are you a <strong>returning</strong> customer? We'd love to hear from you! Share your experience with CleanAR Solutions by leaving a review on Google.
            < br />
            <a href="https://g.page/r/Cek9dkmHVuBKEAE/review" target="_blank" rel="noreferrer" className="slide-link">Leave a Review...</a>

          </p>
        </div>
      )
    },
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
      <VisitorCounter page={"index"} />
      <div className="content section-background mb-0" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <p>
          <div className="py-0 px-2 ">
            <Row className="">
              <Col className="">
                <Card className="card-plain">
                  <CardHeader>
                    <Row>
                      <Col md='3' className="logo-col">
                        <Col>
                          <CardImg top className="logo-image-index" src={Logo} alt="CleanAR Solutions logo" />
                          <Col className="" >
                            <CardTitle tag="h2" className="primary-color ">CleanAR<br /><span className="secondary-color">Solutions</span></CardTitle>
                          </Col>
                        </Col>
                      </Col>
                      <Col md='8' className="px-0">
                        <Carousel
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
                        </Carousel>
                      </Col>
                    </Row>
                  </CardHeader>
                  <Row>
                    <Card className="card-plain">
                      <CardBody>
                        <CardText>
                          <Accordion defaultActiveKey={null} >
                            <Accordion.Item eventKey="0" className="accordion-header">
                              <Accordion.Header>
                                <i className="now-ui-icons tech_mobile"></i> <strong>To Request a Quote: </strong>
                              </Accordion.Header>
                              <Accordion.Body>                                
                              <Link to="/request-quote">Click Here</Link> <br />
                                <span>Get the professional cleaning services you need with CleanAR Solutions! We offer a range of services. Contact us today to learn more and request a quote.</span>
                              </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="1" className="accordion-header">
                              <Accordion.Header >
                                <i className="now-ui-icons tech_mobile"></i> <strong>Call Us:</strong>
                              </Accordion.Header>
                              <Accordion.Body>
                                <Link to="tel:437-440-5514">437-440-5514</Link> <br />
                                <span>Our customer service team is available Monday through Friday, from 9 AM to 6 PM. Don’t hesitate to call for any inquiries or support!</span>
                              </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="2" className="accordion-header">
                              <Accordion.Header>
                                <i className="now-ui-icons ui-1_email-85"></i> <strong>Email Us:</strong>
                              </Accordion.Header>
                              <Accordion.Body>
                                <a href="mailto:info@cleanARsolutions.ca">info@cleanARsolutions.ca</a><br />
                                <span>For detailed inquiries or if you prefer written communication, drop us an email. We aim to respond within 24 hours.</span>
                              </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="3" className="accordion-header">
                              <Accordion.Header>
                                <i className="now-ui-icons ui-2_like"></i> <strong>Leave a Review:</strong>
                              </Accordion.Header>
                              <Accordion.Body>
                                <a href="https://g.page/r/Cek9dkmHVuBKEAE/review" target="_blank" rel="noreferrer">Google Review</a> <br />
                                <span>Share your experience with CleanAR Solutions! We value your feedback and would love to hear about your experience with our services.</span>
                              </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="4" className="accordion-header">
                              <Accordion.Header>
                                <i className="fab fa-instagram"></i> <strong>Follow Us:</strong>
                              </Accordion.Header>
                              <Accordion.Body>
                                <a href="https://www.instagram.com/cleanarsolutions/" target="_blank" rel="noreferrer">Instagram</a> <br />
                                <span>Stay up-to-date with our latest news, promotions, and cleaning tips! Follow us on Instagram for more information.</span>
                              </Accordion.Body>
                            </Accordion.Item>
                          </Accordion>
                        </CardText>
                      </CardBody>
                    </Card>

                  </Row>
                </Card>
              </Col>

              {/* </Col> */}
            </Row>
          </div>
        </p>
      </div>
    </>
  );
}

export default Index;
