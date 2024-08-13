import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Button,
  Container,
  Row,
  Col,
  Input,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,

  Form,
} from "reactstrap";
import Auth from "../../utils/auth";
import Navbar from "components/Pages/Navbar.js";
import ProfilePageHeader from "components/Headers/ProfilePageHeader.js";
import Footer from "components/Pages/Footer.js";
// import './../../assets/css/quote-dropdown.css';
// import './../../assets/css/our-palette.css';


function ProfilePage() {
  const navigate = useNavigate(); // useNavigate hook to handle navigation
  const location = useLocation(); // useLocation hook to get the current location
  const [isEditing, setIsEditing] = useState(false);
  const [isLogged] = React.useState(Auth.loggedIn());
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
  const [quotes, setQuotes] = useState([]);

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
        const quotesData = await response.json();
        setQuotes(quotesData);
        console.log(quotesData);
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
      } catch (err) {
        console.error(err);
      }
    };
    userInfo();
    // }
    document.body.classList.add("profile-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    window.scrollTo(0, 0);
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

  return (
    <>
      <Navbar />
      <div className="wrapper">
        <div
          className="page-header clear-filter page-header-small"
          filter-color="blue"
        >
          <div
            className="page-header-image"
            style={{
              backgroundImage: "url(" + require("assets/img/bg5.jpg") + ")"
            }}
          ></div>
          <Container >

            <Form onSubmit={handleSaveClick} >
              <div className="photo-container">
                <img alt="..." src={require("assets/img/default-avatar.png")}></img>
              </div>
              <h3 className="title">{formData.name}</h3>
              <p className="category">
                {isEditing ? (
                  <>
                    <Input
                      type="text"
                      name="address"
                      placeholder="Address"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                    <Input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                    <Input
                      type="text"
                      name="province"
                      placeholder="Province"
                      value={formData.province}
                      onChange={handleInputChange}
                    />
                    <Input
                      type="text"
                      name="postalcode"
                      placeholder="Postal Code"
                      value={formData.postalcode}
                      onChange={handleInputChange}
                    />
                  </>
                ) : (
                  (formData.address === undefined || formData.city === undefined || formData.postalcode === undefined || formData.province === undefined)
                    ?
                    "Add address" :
                    `${formData.address}, ${formData.city}, ${formData.postalcode}, ${formData.province}`
                )}
              </p>
              <Row className="content no-gutters">
                <Col lg="6" xs="12" className="mb-3">
                  <h5>Phone Number</h5>
                  {isEditing ? (
                    <Input
                      type="text"
                      name="phonenumber"
                      value={formData.phonenumber}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p>{formData.phonenumber ? formData.phonenumber : "Add phone number"}</p>
                  )}
                </Col>
                <Col lg="6" xs="12" className="mb-3">
                  <h5>Email Address</h5>
                  <p>{formData.email ? formData.email : "Add email"}</p>
                </Col>
                </Row>
                <Row className="content no-gutters">
                <Col lg="12" xs="12" className="mb-3">
                  <h5>Company Name</h5>
                  {isEditing ? (
                    <Input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p>{formData.companyName ? formData.companyName : "Add company Name"}</p>
                  )}
                </Col>
              </Row>

              {/* <div className="content">
            </div> */}
              <Container className="section bg-transparent">
                <div className="button-container ">
                  {isEditing ? (
                    <Button className="btn-round" color="success" size="lg" type="submit">
                      Save Profile
                    </Button>
                  ) : (
                    <Button className="btn-round" color="info" size="lg" onClick={handleEditClick}>
                      Edit Profile
                    </Button>
                  )}
                </div>
              </Container>
            </Form>
          </Container>
        </div>
        <div className="container">
          <h4 className="title text-left">Search your Quotes</h4>
        <Dropdown isOpen={dropdownOpen} toggle={toggle}>
                <DropdownToggle caret>
                  {`Select Quote to View Details`}
                </DropdownToggle>
                <DropdownMenu className='scrollable-dropdown-menu'>
                  {/* <DropdownItem onClick={() => setDisplayedQuote({ products: [], services: [] })}>Quotes</DropdownItem> */}
                  <DropdownItem onClick={(e) => handleQuoteClick(e)} value="">Quotes</DropdownItem>
                  {quotes.map((quote) => (
                    <DropdownItem key={quote._id} onClick={(e) => handleQuoteClick(e)} value={quote.quoteId}>
                      {/* <DropdownItem key={quote._id} onClick={() => setDisplayedQuote(quote)}></DropdownItem> */}
                      {"Quote Id:"}{quote.quoteId} - {"Created at:"}{quote.createdAt}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ProfilePage;
