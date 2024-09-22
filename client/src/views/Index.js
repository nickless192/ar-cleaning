import React, {useEffect, useState} from "react";
import { Link } from "react-router-dom";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
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

import backgroundImage from 'assets/img/stock-photo-high-angle-view-person-cleaning-white-carpet-professional-vacuum-cleaner.jpg';
import Logo from "assets/img/IC CLEAN AR-15-cropped.png";

function Index() {

  const [promoCode] = useState('WELCOME10');

  const [modal, setModal] = useState(false);

  const toggleModal = () => {
    setModal(!modal);
    // localStorage.setItem('modalShown', 'true');
    sessionStorage.setItem('modalShown', 'true');
  };

  const handleDontShowAgain = () => {
    localStorage.setItem('modalDontShowAgain', 'true');
    setModal(false);
  };


  useEffect(() => {
    // const modalShown = localStorage.getItem('modalShown');
    const modalShown = sessionStorage.getItem('modalShown');
    const modalDontShowAgain = localStorage.getItem('modalDontShowAgain');

    if (modalDontShowAgain) {
      setModal(false);
    } else
    if (!modalShown) {
      setModal(true);
    }
    document.body.classList.add("index-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    // initializeServices();
    return function cleanup() {
      document.body.classList.remove("index-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  return (
    <>
    <Modal isOpen={modal} toggle={toggleModal} >
        <ModalHeader toggle={toggleModal} className="modal-header-text">Welcome Promo!</ModalHeader>
        <ModalBody className="modal-body-text">
          Welcome to CleanAR Solutions! We're excited to offer you 10% discount for your first cleaning service. <a href="mailto:info@cleanARsolutions.ca" className="modal-link">Contact us</a> today to claim your discount or <Link className="modal-link" to={`/request-quote?promoCode=${promoCode}`}>click here to request a quote</Link>. We look forward to hearing from you!
        </ModalBody>
        <ModalFooter className="modal-header-text">
          <Button className="secondary-bg-color" onClick={toggleModal}>Close</Button>
          <Button color="danger" onClick={handleDontShowAgain}>Don't Show Again</Button>
        </ModalFooter>
      </Modal>
      <div className="content section-background mb-0" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <p>
          <div className="py-1 px-5 ">
            <Row className="pr-5 ">
              <Col className="pr-0">
                <Card className="card-plain">
                  <Row>
                    <CardHeader>
                      <Row>
                        <Col md='7' className="logo-col">
                          <Col>
                            <Row className="">
                              <Col className=""  >
                                <CardImg top className="logo-image-index" src={Logo} alt="Card image cap" />
                              </Col>
                            </Row>
                            <Row className="">
                              <Col className="" >
                                <CardTitle tag="h2" className="primary-color ">CleanAR<br /><span className="secondary-color">Solutions</span></CardTitle>
                              </Col>
                            </Row>

                            <Row className="">
                              <CardText className="text-start mt-3 pt-2">
                                {/* <CardTitle tag="h3" className="text-bold primary-color">Welcome to CleanAR Solutions</CardTitle> */}
                                <p className="light-color text-bold">Get the professional cleaning services you need with CleanAR Solutions! We offer a range of services, contact us today to learn more about our services and request a quote.</p>
                              </CardText>
                            </Row>
                          </Col>
                        </Col>

                        <Col md='5'>
                          <Card className="card-plain">
                            <CardBody>
                              <CardText>
                                <ListGroup className="contact-info">
                                  <ListGroupItem>
                                    <i className="now-ui-icons tech_mobile"></i> <strong>Request a Quote:</strong> <Link to="/request-quote">Click Here</Link> <br />
                                    <span>Interested in our services? Fill out our online form to request a quote. We'll get back to you with a customized estimate based on your needs.</span>
                                  </ListGroupItem>
                                  <ListGroupItem>
                                    <i className="now-ui-icons tech_mobile"></i> <strong>Call Us:</strong> <Link to="tel:437-440-5514">437-440-5514</Link> <br />
                                    <span>Our customer service team is available to assist you Monday through Friday, from 9 AM to 6 PM. Don't hesitate to call for any inquiries or support!</span>
                                  </ListGroupItem>
                                  <ListGroupItem>
                                    <i className="now-ui-icons ui-1_email-85"></i> <strong>Email Us:</strong> <a href="mailto:info@cleanARsolutions.ca">info@cleanARsolutions.ca</a><br />
                                    <span>For detailed inquiries or if you prefer written communication, drop us an email. We aim to respond within 24 hours.</span>
                                  </ListGroupItem>
                                  {/* <ListGroupItem>
                        <i className="now-ui-icons location_pin"></i> <strong>Visit Us:</strong>  <a
                          href="https://www.google.com/maps/search/?api=1&query=Toronto,+ON+M4Y+3C2"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="location-link"
                        >
                          Toronto, ON M4Y 3C2
                        </a><br />
                        <span>We're conveniently located in the heart of Toronto. Contact us to schedule an appointment or for more information.</span>
                      </ListGroupItem> */}
                                </ListGroup>
                              </CardText>
                            </CardBody>
                          </Card>
                        </Col>
                      </Row>
                    </CardHeader>
                  </Row>
                  <Row>
                    {/* <Col md='9' className="text-left">
                      <h2 className="text-bold primary-color text-start position-absolute bottom-50 start-0">Welcome to CleanAR Solutions</h2>
                    </Col> */}
                    {/* <Col>
                      <CardBody>
                        <CardText>
                          <CardTitle tag="h4" className="text-bold light-color">Contact Us!</CardTitle>
                          <p className="light-color text-bold">We'd love to hear from you! Whether you have a question, need assistance, or just want to share your feedback, our team is here to help. Reach out to us through through your preferred method, and we'll get back to you as soon as possible.</p>
                        </CardText>
                      </CardBody>
                    </Col> */}

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
