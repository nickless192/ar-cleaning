import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Badge,
  Alert,
  Table,
  Modal,
  Pagination
} from "react-bootstrap";
import Auth from "/src/utils/auth";
import QuoteRequest from "/src/components/Pages/UserJourney/QuoteRequest";
import BookingChangeModal from "/src/components/Pages/UserJourney/BookingChangeModal";
import { useTranslation } from "react-i18next";
import backgroundImage from '/src/assets/img/stock-photo-cropped-shot-woman-rubber-gloves-cleaning-office-table.jpg';


function ProfilePage() {
  const { t } = useTranslation(); // useTranslation hook for translations
  const navigate = useNavigate(); // useNavigate hook to handle navigation
  const location = useLocation(); // useLocation hook to get the current location
  const [isEditing, setIsEditing] = useState(false);
  // const [isLogged] = React.useState(Auth.loggedIn());
  const [setDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phonenumber: "",
    address: "",
    city: "",
    province: "",
    postalcode: "",
    howDidYouHearAboutUs: "",
    companyName: "",
    userId: ""
  });
  const [bookings, setBookings] = useState({});
  const [quotes, setQuotes] = useState([]);
  const bookingsArray = bookings.bookings || []; // fallback to empty array

  const [currentQuotePage, setCurrentQuotePage] = useState(1);
  const [currentBookingPage, setCurrentBookingPage] = useState(1);
  const quotesPerPage = 10;
  const bookingsPerPage = 10;

  const indexOfLastQuote = currentQuotePage * quotesPerPage;
  const indexOfFirstQuote = indexOfLastQuote - quotesPerPage;
  const currentQuotes = quotes.slice(indexOfFirstQuote, indexOfLastQuote);
  const indexOfLastBooking = currentBookingPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = bookingsArray.slice(indexOfFirstBooking, indexOfLastBooking);

  const totalQuotePages = Math.ceil(quotes.length / quotesPerPage);
  const totalBookingPages = Math.ceil(bookingsArray.length / bookingsPerPage);

  const [showModal, setShowModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const handleEditQuote = (quote) => {
    setSelectedQuote(quote);
    setShowModal(true);
  };
  const handleRequestDateChange = (bookingId) => {
    setSelectedBookingId(bookingId);
    setShowChangeModal(true);
  };

  const handleModalClose = () => {
    setShowChangeModal(false);
    setSelectedBookingId(null);
  };

  const handleModalSubmit = ({ newDate, comment }) => {
    // Call your API to request the change
    // console.log("Booking:", selectedBookingId, "New Date:", newDate, "Comment:", comment);
    fetch(`/api/bookings/${selectedBookingId}/request-change`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newDate, comment }),
    })
      .then((response) => {
        if (response.ok) {
          // console.log("Change request submitted successfully");
          alert(t("profile.alerts.change_request_success"));
        } else {
          // console.error("Error submitting change request");
          alert(t("profile.alerts.change_request_error"));
        }
      })
      .catch((error) => {
        // console.error("Error:", error);
        alert(t("profile.alerts.change_request_error"));
      });
  };


  useEffect(() => {

    // if (!Auth.loggedIn()) {
    //   navigate("/login"); // Pass current location to the login page
    //   // return;
    // } else {

    const userInfo = async () => {
      try {
        const data = await Auth.getProfile().data;
        const response = await fetch(`/api/quotes/user/${Auth.getProfile().data._id}`);
        const quotesData = await response.json();
        // console.log(quotesData);
        setQuotes(quotesData);
        // console.log(Auth.getProfile());
        setFormData({
          name: data.firstName + " " + data.lastName,
          email: data.email,
          phonenumber: data.telephone,
          address: data.address,
          city: data.city,
          province: data.province,
          postalcode: data.postalcode,
          howDidYouHearAboutUs: data.howDidYouHearAboutUs,
          companyName: data.companyName,
          userId: data._id,
          username: data.username
        });
        // get user bookings
        const bookingsResponse = await fetch(`/api/users/${data._id}/bookings`);
        const bookingsData = await bookingsResponse.json();
        if (bookingsData) {
          // console.log(bookingsData);
          setBookings(bookingsData);
        }
      } catch (err) {
        console.error(err);
      }
    };
    userInfo();
    // }
    document.body.classList.add("profile-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    // window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    return function cleanup() {
      document.body.classList.remove("profile-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, [navigate, location]);

  const handleEditClick = (e) => {
    e.preventDefault();
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSaveClick = async (e) => {
    e.preventDefault();
    setIsEditing(false);
    if (formData.address === "" || formData.city === "" || formData.province === "" || formData.postalcode === "" || formData.phonenumber === "" || formData.companyName === "") {
      alert("Please fill out all fields");
      return;
    }
    try {
      const updatedData = {
        firstName: formData.name.split(" ")[0],
        lastName: formData.name.split(" ")[1],
        email: formData.email,
        telephone: formData.phonenumber,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        postalcode: formData.postalcode,
        howDidYouHearAboutUs: formData.howDidYouHearAboutUs,
        companyName: formData.companyName
      };
      console.log(updatedData);

      await fetch(`/api/users/${formData.userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      })
        .then(response => {
          if (response.ok) {
            console.log("Profile updated!");
            alert("Profile updated!");
            response.json()
              .then(data => {
                console.log(data);
                setFormData({
                  name: data.firstName + " " + data.lastName,
                  email: data.email,
                  phonenumber: data.telephone,
                  address: data.address,
                  city: data.city,
                  province: data.province,
                  postalcode: data.postalcode,
                  howDidYouHearAboutUs: data.howDidYouHearAboutUs,
                  companyName: data.companyName,
                  userId: data._id
                });
              });
          } else {
            alert(response.statusText);
          }
        });
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuoteClick = (e) => {
    e.preventDefault();
    const quoteId = e.target.value;
    console.log(quoteId);
    if (quoteId !== "") {
      navigate(`/view-quotes/${quoteId}`);
      // return;
    }

    // navigate("/quote");
  }

  const handleCancelClick = async (e) => {
    e.preventDefault();
    setIsEditing(false);
    const data = await Auth.getProfile().data;
    setFormData({
      name: data.firstName + " " + data.lastName,
      email: data.email,
      phonenumber: data.telephone,
      address: data.address,
      city: data.city,
      province: data.province,
      postalcode: data.postalcode,
      howDidYouHearAboutUs: data.howDidYouHearAboutUs,
      companyName: data.companyName,
      userId: data._id
    });
  }

  return (
    <>
      {/* <Navbar /> */}
      <div className="wrapper light-bg-color mb-0 section-background" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <Container className="py-5">
          <Card className="p-4 shadow-lg">
            <h2 className="text-center primary-color mb-4">{formData.name}</h2>

            <Form onSubmit={handleSaveClick}>
              {/* Address */}
              <Row className="mb-3 text-center">

                <Form.Group className="mb-3">
                  <h5>{t("profile.address.title")}</h5>
                  {isEditing ? (
                    <>
                      <Form.Control
                        type="text"
                        name="address"
                        placeholder={t("profile.address.placeholder")}
                        className="text-cleanar-color form-input mb-2"
                        value={formData.address}
                        onChange={handleInputChange}
                      />
                      <Row className="mb-3 text-center">
                        <Col>
                          <Form.Control
                            type="text"
                            name="city"
                            placeholder={t("profile.address.city_placeholder")}
                            value={formData.city}
                            className="text-cleanar-color form-input text-center"
                            onChange={handleInputChange}
                          />
                        </Col>
                        <Col>
                          <Form.Control
                            type="text"
                            name="province"
                            placeholder={t("profile.address.province_placeholder")}
                            value={formData.province}
                            className="text-cleanar-color form-input text-center"
                            onChange={handleInputChange}
                          />
                        </Col>
                        <Col>
                          <Form.Control
                            type="text"
                            name="postalcode"
                            placeholder={t("profile.address.postalcode_placeholder")}
                            value={formData.postalcode}
                            className="text-cleanar-color form-input text-center"
                            onChange={handleInputChange}
                          />
                        </Col>
                      </Row>
                    </>
                  ) : (
                    <p>
                      {formData.address
                        ? `${formData.address}, ${formData.city}, ${formData.postalcode.toUpperCase()}, ${formData.province}`
                        : t("profile.address.add_address")}
                    </p>
                  )}
                </Form.Group>
              </Row>

              {/* Phone & Email */}
              <Row className="mb-3 text-center">
                <Col md={6}>
                  <h5>{t("profile.contact.phone_title")}</h5>
                  {isEditing ? (
                    <Form.Control
                      type="text"
                      name="phonenumber"
                      value={formData.phonenumber}
                      className="text-cleanar-color form-input text-center"
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p>{formData.phonenumber || t("profile.contact.add_phone")}</p>
                  )}
                </Col>
                <Col md={6}>
                  <h5>{t("profile.contact.email_title")}</h5>
                  <p>{formData.email || t("profile.contact.add_email")}</p>
                </Col>
              </Row>

              {/* Company */}
              <Form.Group className="mb-4 text-center">
                <h5>{t("profile.company.title")}</h5>
                {isEditing ? (
                  <Form.Control
                    type="text"
                    name="companyName"
                    className="text-cleanar-color form-input text-center"
                    value={formData.companyName}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p>{formData.companyName || t("profile.company.add_company")}</p>
                )}
              </Form.Group>

              <div className="text-center">
                {isEditing ? (
                  <>
                    <Button
                      variant="primary"
                      type="submit"
                      className="mx-2"
                    >
                      {t("profile.buttons.save_profile")}
                    </Button>
                    <Button
                      variant="secondary"
                      className="mx-2"
                      onClick={handleCancelClick}
                    >
                      {t("profile.buttons.cancel")}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={(e) => { e.preventDefault(); setIsEditing(true); }}
                  >
                    {t("profile.buttons.edit_profile")}
                  </Button>
                )}
              </div>
            </Form>
          </Card>
          {/* new: display user quotes */}
          <Card className="p-4 mt-4 shadow-lg">
            <h3 className="text-center primary-color mb-4">{t("profile.quotes.title")}</h3>

            {quotes.length === 0 ? (
              <p className="text-center">{t("profile.quotes.no_quotes")}</p>
            ) : (
              <>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      {/* <th>Customer Name</th>
          <th>Phone</th>
          <th>Postal Code</th> */}
                      <th>{t("profile.quotes.service_info")}</th>
                      {/* <th>Service</th> */}
                      <th>{t("profile.quotes.options")}</th>
                      <th>{t("profile.quotes.promo_code")}</th>
                      <th>{t("profile.quotes.submitted_at")}</th>
                      <th>{t("profile.quotes.acknowledged")}</th>
                      {/* <th>Need Help?</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {/* {quotes.map((quote) => { */}
                    {currentQuotes.map((quote) => {
                      const submittedAt = new Date(quote.createdAt);

                      return (
                        <tr key={quote._id}>
                          {/* Basic customer info - not needed at the moment, could be useful when dealing with companies */}
                          {/* <td>{quote.name}</td>
                              <td>{quote.phonenumber}</td>
                              <td>{quote.postalcode}</td> */}
                          {/* Services (loop through array) */}
                          {quote.services.map((srv, idx) => (
                            <>
                              <td>{srv.type} - {srv.service}</td>
                              {/* <td>{srv.service}</td> */}
                              <td>
                                {Object.entries(srv.customOptions || {}).map(([key, opt]) => (
                                  <div key={opt._id?.$oid || key}>
                                    <strong>{opt.label}:</strong>{" "}
                                    {typeof opt.service === "boolean"
                                      ? opt.service
                                        ? t("profile.quotes.yes")
                                        : t("profile.quotes.no")
                                      : opt.service}
                                  </div>
                                ))}
                              </td>
                            </>
                          ))}
                          {/* Submitted date */}
                          <td>{quote.promoCode || t("profile.quotes.not_applicable")}</td>
                          <td>{submittedAt.toLocaleDateString()}</td>
                          <td> {quote.acknowledgedByUser ? t("profile.quotes.yes") : t("profile.quotes.not_yet")}</td>
                          {/* Status */}
                          {/* <td className="text-capitalize">{quote.status || "pending"}</td> */}

                          {/* Help action */}
                          {/* <td>
                            <Button
                              variant="info"
                              size="sm"
                              onClick={() => handleEditQuote(quote)}
                            >
                              Edit Quote
                            </Button>
                          </td> */}
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
                {/* Pagination controls */}
                <div className="d-flex justify-content-center mt-3">
                  <Pagination size="sm" className="mb-0">
                    <Pagination.Prev
                      disabled={currentQuotePage === 1}
                      onClick={() => setCurrentQuotePage(currentQuotePage - 1)}
                    />
                    <span className="mx-3 align-self-center">
                     {t("profile.pagination.page_of")} {currentQuotePage} {t("profile.pagination.of")} {totalQuotePages}
                    </span>
                    <Pagination.Next
                      disabled={currentQuotePage === totalQuotePages}
                      onClick={() => setCurrentQuotePage(currentQuotePage + 1)}
                    />
                  </Pagination>
                </div>
              </>

            )}
            {/* Modal for editing a quote */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="xl"
            >
              <Modal.Header closeButton>
                <Modal.Title>{t("profile.quotes.edit_quote")}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {selectedQuote && (
                  <QuoteRequest
                    initialData={selectedQuote}
                    onSubmit={(updatedData) => {
                      // Handle update API call here
                      // console.log("Updated Quote:", updatedData);
                      setShowModal(false);
                    }}
                  />
                )}
              </Modal.Body>
            </Modal>
          </Card>

          <Card className="p-4 mt-4 shadow-lg">
            <h3 className="text-center primary-color mb-4">{t("profile.bookings.title")}</h3>
            {bookings.length === 0 ? (
              <p className="text-center">{t("profile.bookings.no_bookings")}</p>
            ) : (
              <>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>{t("profile.bookings.service_date")}</th>
                      <th>{t("profile.bookings.service_type")}</th>
                      <th>{t("profile.bookings.status")}</th>
                      <th>{t("profile.bookings.new_date_requested")}</th>
                      <th>{t("profile.bookings.need_help")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* {bookings.bookings && bookings.bookings.map((booking) => { */}
                    {currentBookings.map((booking) => {
                      const bookingDate = new Date(booking.date);
                      const today = new Date();
                      const isPast = bookingDate < today; // check if booking is in the past
                      const isDone = booking.status?.toLowerCase() === "completed";

                      return (
                        <tr key={booking._id}>
                          <td>{bookingDate.toLocaleDateString()}</td>
                          <td>{booking.serviceType}</td>
                          <td className="text-capitalize">{booking.status}</td>
                          <td>{booking.customerSuggestedBookingDate ? new Date(booking.customerSuggestedBookingDate).toLocaleDateString() : "N/A"}
                            {booking.customerSuggestedBookingAcknowledged && <Badge pill bg="success" className="ms-2">{t("profile.bookings.acknowledged_badge")}</Badge>}
                            {!booking.customerSuggestedBookingAcknowledged && booking.customerSuggestedBookingDate && <Badge pill bg="danger" className="ms-2">{t("profile.bookings.not_acknowledged_badge")}</Badge>}
                          </td>
                          <td>
                            {(!isPast && !isDone) ? (
                              <Button
                                variant="warning"
                                size="sm"
                                onClick={() => handleRequestDateChange(booking._id)}
                              >
                                {t("profile.bookings.request_change")}
                              </Button>
                            ) : (
                              <span className="text-muted">{t("profile.bookings.not_available")}</span>
                            )}

                            <BookingChangeModal
                              show={showChangeModal}
                              handleClose={handleModalClose}
                              handleSubmit={handleModalSubmit}
                              initialDate={booking.date}
                            // bookingId={selectedBookingId}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
                <div className="d-flex justify-content-center mt-3">
                  <Pagination size="sm" className="mb-0">
                    {/* <Pagination.First onClick={() => setCurrentBookingPage(1)} disabled={currentBookingPage === 1} /> */}
                    <Pagination.Prev onClick={() => setCurrentBookingPage(currentBookingPage - 1)} disabled={currentBookingPage === 1} />
                    <span className="mx-3 align-self-center">
                      {t("profile.pagination.page_of")} {currentBookingPage} {t("profile.pagination.of")} {totalBookingPages}
                    </span>
                    <Pagination.Next onClick={() => setCurrentBookingPage(currentBookingPage + 1)} disabled={currentBookingPage === totalBookingPages} />
                    {/* <Pagination.Last onClick={() => setCurrentBookingPage(totalBookingPages)} disabled={currentBookingPage === totalBookingPages} /> */}
                  </Pagination>
                </div>
              </>
            )}

            {/* <div className="text-center mt-4">
              <Button
                variant="primary"
                onClick={() => navigate('/bookings/new')}
              >
                New Booking
              </Button>
            </div> */}

          </Card>
        </Container>
      </div>

      {/* </div> */}
      {/* <Footer /> */}
    </>
  );
}

export default ProfilePage;
