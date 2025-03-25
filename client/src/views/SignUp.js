import React from "react";
import { useEffect, useState } from "react";
import Auth from "utils/auth";
// reactstrap components
import {
  Container,
  Popover,
  PopoverBody
} from "reactstrap";

import {
  Button,
  Form,
  FloatingLabel,
  Row,
  Col
} from 'react-bootstrap';

import { FaQuestionCircle } from 'react-icons/fa';

// core components

function SignUp() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    howDidYouHearAboutUs: "",
    howDidYouHearAboutUsSupport: "",
    telephone: "",
    username: "",
    password: ""
  });

  const [popoverOpen, setPopoverOpen] = useState({
    firstName: false,
    lastName: false,
    email: false,
    telephone: false,
    username: false,    
    password: false
  });

  const togglePopover = (field) => {
    setPopoverOpen((prevState) => {
      // Reset all fields to false
      const newState = Object.keys(prevState).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {});

      // Toggle the selected field
      return { ...newState, [field]: !prevState[field] };
    });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (formData.firstName && formData.lastName && formData.email && formData.username && formData.password && formData.telephone) {
      try {
        const response = await fetch(`/api/users/`, {
          method: 'post',
          body: JSON.stringify(formData),
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          console.log("New account created!");
          const data = await response.json();

          // Call API to notify user of account creation
          const emailResponse = await fetch(`/api/email/new-user`, {
            method: 'post',
            body: JSON.stringify({ email: formData.email, user: data.dbUserData }),
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (emailResponse.ok) {
            console.log("Notification sent!");
            // const emailData = await emailResponse.json();
            // console.log(emailData);
          } else {
            alert(emailResponse.statusText);
          }

          const EmailNotificationResponse = await fetch(`/api/email/new-user-notification`, {
            method: 'post',
            body: JSON.stringify({ email: formData.email, user: data.dbUserData }),
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (EmailNotificationResponse.ok) {
            console.log("Notification sent!");
            // const emailData = await EmailNotificationResponse.json();
            // console.log(emailData);
          } else {
            alert(EmailNotificationResponse.statusText);
          }

          // Now call Auth.login after the email has been sent
          Auth.login(data.token, data.dbUserData.adminFlag);

        } else {
          alert(response.statusText);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      alert("Please fill out all fields before submitting");
    }
  };


  const handleChange = (event) => {
    event.preventDefault();
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value.trim() });
  };

  useEffect(() => {
    document.body.classList.add("signup-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    return function cleanup() {
      document.body.classList.remove("signup-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  return (
    <>
      {/* <Navbar /> */}
      {/* <div className="section section-signup light-blue-bg-color pb-0 mb-0"> */}
        <div className="content light-blue-bg-color">
          <Container className="container">
            <h2 className="title text-center">Sign Up</h2>
            <Form className="form" onSubmit={(e) => handleFormSubmit(e)}>

              <Row className="g-2">
                <Col md='10' xs='10'>
                  <Form.Floating className="mb-3">
                    <Form.Control
                      id="floatinFirstName"
                      type="text"
                      placeholder="First Name"
                      className="text-cleanar-color"
                      name="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleChange(e)}
                    />
                    <label htmlFor="floatinFirstName"
                      className="text-cleanar-color"
                    >First Name*</label>
                  </Form.Floating>
                </Col>
                <Col md='1' xs='1'>
                  <Button id="Popover1" type="button" tabIndex='-1' className="btn-round btn-icon"><FaQuestionCircle /></Button>
                  <Popover placement="right" isOpen={popoverOpen.firstName} target="Popover1" toggle={() => togglePopover('firstName')}>
                    <PopoverBody>
                      Enter your first name.
                    </PopoverBody>
                  </Popover>
                </Col>
                <Col md='10' xs='10'>
                  <Form.Floating className="mb-3">
                    <Form.Control
                      id="floatingLastName"
                      type="text"
                      placeholder="Last Name"
                      className="text-cleanar-color"
                      name="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleChange(e)}
                    />
                    <label htmlFor="floatingLastName"
                      className="text-cleanar-color"
                    >Last Name*</label>
                  </Form.Floating>
                </Col>
                <Col md='1' xs='1'>
                  <Button id="Popover2" type="button" tabIndex='-1' className="btn-round btn-icon"><FaQuestionCircle /></Button>
                  <Popover placement="right" isOpen={popoverOpen.lastName} target="Popover2" toggle={() => togglePopover('lastName')}>
                    <PopoverBody>
                      Enter your last name.
                    </PopoverBody>
                  </Popover>
                </Col>
              </Row>
              <Row className="g-2">
                <Col md='10' xs='10'>
                  <Form.Floating className="mb-3">
                    <Form.Control
                      id="floatingEmail"
                      type="text"
                      placeholder="Email"
                      className="text-cleanar-color"
                      name="email"
                      value={formData.email}
                      onChange={(e) => handleChange(e)}
                    />
                    <label htmlFor="floatingEmail"
                      className="text-cleanar-color"
                    >Email*</label>
                  </Form.Floating>
                </Col>
                <Col md='1' xs='1'>
                  <Button id="Popover3" type="button" tabIndex='-1' className="btn-round btn-icon"><FaQuestionCircle /></Button>
                  <Popover placement="right" isOpen={popoverOpen.email} target="Popover3" toggle={() => togglePopover('email')}>
                    <PopoverBody>
                      Enter your email address.
                    </PopoverBody>
                  </Popover>
                </Col>
                <Col md='10' xs='10'>
                  <Form.Floating className="mb-3">
                    <Form.Control
                      id="floatingTelephone"
                      type="text"
                      placeholder="Telephone"
                      className="text-cleanar-color"
                      name="telephone"
                      value={formData.telephone}
                      onChange={(e) => handleChange(e)}
                    />
                    <label htmlFor="floatingTelephone"
                      className="text-cleanar-color"
                    >Telephone*</label>
                  </Form.Floating>
                </Col>
                <Col md='1' xs='1'>
                  <Button id="Popover4" type="button" tabIndex='-1' className="btn-round btn-icon"><FaQuestionCircle /></Button>
                  <Popover placement="right" isOpen={popoverOpen.telephone} target="Popover4" toggle={() => togglePopover('telephone')}>
                    <PopoverBody>
                      Enter your telephone number.
                    </PopoverBody>
                  </Popover>
                </Col>
              </Row>
              <Row className="">
                <Col md='10' xs='10'>
                  <Form.Floating className="mb-3">
                    <Form.Control
                      id="floatingUsername"
                      type="text"
                      placeholder="Username"
                      className="text-cleanar-color"
                      name="username"
                      value={formData.username}
                      onChange={(e) => handleChange(e)}
                    />
                    <label htmlFor="floatingUsername"
                      className="text-cleanar-color"
                    >Username*</label>
                  </Form.Floating>
                </Col>
                <Col md='1' xs='1'>
                  <Button id="Popover5" type="button" tabIndex='-1' className="btn-round btn-icon"><FaQuestionCircle /></Button>
                  <Popover placement="right" isOpen={popoverOpen.username} target="Popover5" toggle={() => togglePopover('username')}>
                    <PopoverBody>
                      Enter your username.
                    </PopoverBody>
                  </Popover>
                </Col>
                <Col md='10' xs='10'>
                  <Form.Floating className="mb-3">
                    <Form.Control
                      id="floatingPassword"
                      type="password"
                      placeholder="Password"
                      className="text-cleanar-color"
                      name="password"
                      value={formData.password}
                      onChange={(e) => handleChange(e)}
                    />
                    <label htmlFor="floatingPassword"
                      className="text-cleanar-color"
                    >Password*</label>
                  </Form.Floating>
                  {/* <InputGroup
                    className={
                      "no-border" + (formData.password ? " input-group-focus" : "")
                    }
                  >
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="now-ui-icons objects_key-25"></i>
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      placeholder="Password"
                      type="password"
                      id="password"
                      name="password"
                      className="text-cleanar-color"
                      // onFocus={(e) => handleChange(e)}
                      onChange={(e) => handleChange(e)}
                    ></Input>
                  </InputGroup> */}
                </Col>
                <Col md='1' xs='1'>
                  <Button id="Popover6" type="button" tabIndex='-1' className="btn-round btn-icon"><FaQuestionCircle /></Button>
                  <Popover placement="right" isOpen={popoverOpen.password} target="Popover6" toggle={() => togglePopover('password')}>
                    <PopoverBody>
                      Enter your password.
                    </PopoverBody>
                  </Popover>
                </Col>
              </Row>
              <Row className="">
                <Col md='10' xs='10'>
                  <FloatingLabel
                    controlId="floatingHowDidYouHearAboutUs"
                    label="How Did You Hear About Us?"
                    className="text-cleanar-color"
                  >
                    <Form.Select
                      id="floatingHowDidYouHearAboutUs"
                      type="select"
                      placeholder="How Did You Hear About Us?"
                      className="text-cleanar-color light-blue-bg-color"
                      name="howDidYouHearAboutUs"
                      value={formData.howDidYouHearAboutUs}
                      onChange={(e) => handleChange(e)}
                    >
                      <option value="">How Did You Hear About Us?...</option>
                      <option value="Google">Google</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Referral">Referral</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                  </FloatingLabel>
                  </Col>
                  <Col md='1' xs='1'>
                  <Button id="Popover7" type="button" tabIndex='-1' className="btn-round btn-icon"><FaQuestionCircle /></Button>
                  <Popover placement="right" isOpen={popoverOpen.howDidYouHearAboutUs} target="Popover7" toggle={() => togglePopover('howDidYouHearAboutUs')}>
                    <PopoverBody>
                      How did you hear about us?
                    </PopoverBody>
                  </Popover>
                </Col>
                  {/* if the user selected other, then render the box to enter the source. if they select referral, another box renders that allows to enter who referred them */}
                  {formData.howDidYouHearAboutUs === 'Referral' ? (
                    <>
                <Col md='5' xs='1'>
                      <Form.Floating className="mb-3">
                        <Form.Control
                          id="floatingReferral"
                          type="text"
                          placeholder="Referral"
                          className="text-cleanar-color "
                          name="howDidYouHearAboutUs"
                          value={formData.howDidYouHearAboutUsSupport}
                          onChange={(e) => handleChange(e)}
                        />
                        <label htmlFor="floatingReferral"
                          className="text-cleanar-color"
                        >Referral</label>
                      </Form.Floating>
                    </Col>
                    <Col md='1' xs='1'>
                      <Button id="Popover8" type="button" tabIndex='-1' className="btn-round btn-icon"><FaQuestionCircle /></Button>
                      <Popover placement="right" isOpen={popoverOpen.howDidYouHearAboutUsSupport} target="Popover8" toggle={() => togglePopover('howDidYouHearAboutUsSupport')}>
                        <PopoverBody>
                          Who referred you?
                        </PopoverBody>
                      </Popover>
                    </Col>
                    </>
                  ) : null
                  }
                  {formData.howDidYouHearAboutUs === 'Other' ? (
                    <>

                      <Col md='5' xs='1'>
                      <Form.Floating className="mb-3">
                        <Form.Control
                          id="floatingOther"
                          type="text"
                          placeholder="Other"
                          className="text-cleanar-color"
                          name="howDidYouHearAboutUs"
                          value={formData.howDidYouHearAboutUsSupport}
                          onChange={(e) => handleChange(e)}
                        />
                        <label htmlFor="floatingOther"
                          className="text-cleanar-color"
                        >Other</label>
                      </Form.Floating>
                      </Col>
                      <Col md='1' xs='1'>
                      <Button id="Popover9" type="button" tabIndex='-1' className="btn-round btn-icon"><FaQuestionCircle /></Button>
                      <Popover placement="right" isOpen={popoverOpen.howDidYouHearAboutUsSupport} target="Popover9" toggle={() => togglePopover('howDidYouHearAboutUsSupport')}>
                        <PopoverBody>
                          How did you hear about us?
                        </PopoverBody>
                      </Popover>
                    </Col>
                    </>
                  ) : null
                  }
                
              </Row>
              <div className="text-center py-3">

                <Button
                  className="btn-round light-bg-color"
                  type="submit"
                  // onClick={(e) => handleFormSubmit(e)}
                  size="lg"
                >
                  Get Started
                </Button>
              </div>
            </Form>
          </Container>
        </div>
      {/* </div> */}
      {/* <Footer /> */}
    </>
  );
}

export default SignUp;
