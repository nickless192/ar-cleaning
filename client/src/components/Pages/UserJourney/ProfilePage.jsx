import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Spinner,
  Alert,
  Table,
} from "react-bootstrap";
import Auth from "/src/utils/auth";

import backgroundImage from '/src/assets/img/stock-photo-cropped-shot-woman-rubber-gloves-cleaning-office-table.jpg';


function ProfilePage() {
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
  // const [quotes, setQuotes] = useState([]);

  const [displayedQuote, setDisplayedQuote] = useState({ products: [], services: [], name: '', phonenumber: '', companyName: '', email: '', description: '', serviceType: '', howDidYouHearAboutUs: '', subtotalCost: 0, tax: 0, grandTotal: 0 });

  const toggle = () => setDropdownOpen(prevState => !prevState);

  useEffect(() => {

    // if (!Auth.loggedIn()) {
    //   navigate("/login"); // Pass current location to the login page
    //   // return;
    // } else {

    const userInfo = async () => {
      try {
        const data = await Auth.getProfile().data;
        const response = await fetch(`/api/quotes/user/${Auth.getProfile().data._id}`);
        // const quotesData = await response.json();
        // setQuotes(quotesData);
        // console.log(quotesData);
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
                  <h5>Address</h5>
                  {isEditing ? (
                    <>
                      <Form.Control
                        type="text"
                        name="address"
                        placeholder="Address"
                        className="text-cleanar-color form-input mb-2"
                        value={formData.address}
                        onChange={handleInputChange}
                      />
                      <Row className="mb-3 text-center">
                        <Col>
                          <Form.Control
                            type="text"
                            name="city"
                            placeholder="City"
                            value={formData.city}
                            className="text-cleanar-color form-input text-center"
                            onChange={handleInputChange}
                          />
                        </Col>
                        <Col>
                          <Form.Control
                            type="text"
                            name="province"
                            placeholder="Province"
                            value={formData.province}
                            className="text-cleanar-color form-input text-center"
                            onChange={handleInputChange}
                          />
                        </Col>
                        <Col>
                          <Form.Control
                            type="text"
                            name="postalcode"
                            placeholder="Postal Code"
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
                        : "Add address"}
                    </p>
                  )}
                </Form.Group>
              </Row>

              {/* Phone & Email */}
              <Row className="mb-3 text-center">
                <Col md={6}>
                  <h5>Phone Number</h5>
                  {isEditing ? (
                    <Form.Control
                      type="text"
                      name="phonenumber"
                      value={formData.phonenumber}
                      className="text-cleanar-color form-input text-center"
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p>{formData.phonenumber || "Add phone number"}</p>
                  )}
                </Col>
                <Col md={6}>
                  <h5>Email Address</h5>
                  <p>{formData.email || "Add email"}</p>
                </Col>
              </Row>

              {/* Company */}
              <Form.Group className="mb-4 text-center">
                <h5>Company Name</h5>
                {isEditing ? (
                  <Form.Control
                    type="text"
                    name="companyName"
                    className="text-cleanar-color form-input text-center"
                    value={formData.companyName}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p>{formData.companyName || "Add company name"}</p>
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
                      Save Profile
                    </Button>
                    <Button
                      variant="secondary"
                      className="mx-2"
                      onClick={handleCancelClick}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={(e) => { e.preventDefault(); setIsEditing(true); }}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </Form>
          </Card>
          <Card className="p-4 mt-4 shadow-lg">
            <h3 className="text-center primary-color mb-4">My Bookings</h3>
            {bookings.length === 0 ? (
              <p className="text-center">No bookings found.</p>
            ) : (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Service Type</th>
                    <th>Status</th>
                    <th>Need help?</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.bookings && bookings.bookings.map((booking) => {
                    const bookingDate = new Date(booking.date);
                    const today = new Date();
                    const isPast = bookingDate < today; // check if booking is in the past
                    const isDone = booking.status?.toLowerCase() === "completed";

                    return (
                      <tr key={booking._id}>
                        <td>{bookingDate.toLocaleDateString()}</td>
                        <td>{booking.serviceType}</td>
                        <td className="text-capitalize">{booking.status}</td>
                        <td>
                          {(!isPast && !isDone) ? (
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => handleRequestDateChange(booking._id)}
                            >
                              Request Service Change
                            </Button>
                          ) : (
                            <span className="text-muted">Not available</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
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
