import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Button,
  Container,
  Row,
  Col,
  Input,
  Form,
} from "reactstrap";
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
      <div className="wrapper light-bg-color mb-0 section-background" style={{ backgroundImage: `url(${backgroundImage})`}}>
        <div className="content" filter-color="blue">
            <Form onSubmit={handleSaveClick} >
              {/* <div className="photo-container">
                <img alt="..." src={require("assets/img/default-avatar.png")}></img>
              </div> */}
              <h3 className="title primary-color">{formData.name}</h3>
              <p className="category">
                {isEditing ? (
                  <>
                    <Input
                      type="text"
                      name="address"
                      placeholder="Address"
                      className="mb-3"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                    <Input
                      type="text"
                      name="city"
                      className="mb-3"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                    <Input
                      type="text"
                      name="province"
                      className="mb-3"
                      placeholder="Province"
                      value={formData.province}
                      onChange={handleInputChange}
                    />
                    <Input
                      type="text"
                      name="postalcode"
                      className="mb-3"
                      placeholder="Postal Code"
                      value={formData.postalcode}
                      onChange={handleInputChange}
                    />
                  </>
                ) : (
                  (formData.address === undefined || formData.city === undefined || formData.postalcode === undefined || formData.province === undefined)
                    ?
                    "Add address" :
                    `${formData.address}, ${formData.city}, ${formData.postalcode.toUpperCase()}, ${formData.province}`
                )}
              </p>
              <Row className="content no-gutters">
                <Col lg="6" xs="12" className="mb-3 secondary-color text-center">
                  <h5 className="text-bold">Phone Number</h5>
                  {isEditing ? (
                    <Input
                      type="text"
                      className="mb-3"
                      name="phonenumber"
                      value={formData.phonenumber}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p>{formData.phonenumber ? formData.phonenumber : "Add phone number"}</p>
                  )}
                </Col>
                <Col lg="6" xs="12" className="mb-3 secondary-color text-center">
                  <h5 className="text-bold">Email Address</h5>
                  <p>{formData.email ? formData.email : "Add email"}</p>
                </Col>
              </Row>
              <Row className="content no-gutters text-center">
                <Col lg="3" xs="0" className="">
                </Col>
                <Col lg="6" xs="12" className="mb-3 secondary-color text-center">
                  <h5 className="text-bold">Company Name</h5>
                  {isEditing ? (
                    <Input
                      type="text"
                      className="mb-3"
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
              <Container className="section bg-transparent mt-3">
                <div className="button-container ">
                  {isEditing ? (
                    <>
                    <Button className="btn-round primary-bg-color mx-2" size="lg" type="submit">
                      Save Profile
                    </Button>
                    <Button className="btn-round secondary-bg-color mx-2" size="lg" onClick={handleCancelClick}> 
                    Cancel 
                    </Button>
                    </>

                  ) : (
                    <Button className="btn-round secondary-bg-color" size="lg" onClick={handleEditClick}>
                      Edit Profile
                    </Button>
                  )}
                </div>
              </Container>
            </Form>
          {/* </Container> */}
        </div>
        {/* <div className="content"> */}
        {/* <Row>
          <Col className="">
          <h4 className="title text-left">Search your Quotes</h4>
          <Dropdown isOpen={dropdownOpen} toggle={toggle}>
            <DropdownToggle caret>
              {`Select Quote to View Details`}
            </DropdownToggle>
            <DropdownMenu className='scrollable-dropdown-menu'>
              <DropdownItem onClick={(e) => handleQuoteClick(e)} value="">Quotes</DropdownItem>
              {quotes.map((quote) => (
                <DropdownItem key={quote._id} onClick={(e) => handleQuoteClick(e)} value={quote.quoteId}>
                  {"Quote Id:"}{quote.quoteId} - {"Created at:"}{quote.createdAt}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          </Col>
        </Row> */}
        </div>
      {/* </div> */}
      {/* <Footer /> */}
    </>
  );
}

export default ProfilePage;
