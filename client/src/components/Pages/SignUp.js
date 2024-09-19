import React from "react";
import { useEffect, useState } from "react";
import Auth from "../../utils/auth";
// reactstrap components
import {
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Container,
  Popover, PopoverBody
} from "reactstrap";

import {
  Button,
  Form,
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

  // const handleFormSubmit = async (event) => {
  //   event.preventDefault();
  //   if (formData.firstName && formData.lastName && formData.email && formData.username && formData.password && formData.telephone) {
  //     fetch(`/api/users/`, {
  //       method: 'post',
  //       body: JSON.stringify(formData),
  //       headers: {
  //         'Content-Type': 'application/json',
  //         // 'Access-Control-Allow-Credentials': 'true',
  //         // 'accept': 'application/json',
  //         // 'Access-Control-Allow-Origin': 'http://localhost:3000'
  //         // 'Access-Control-Allow-Origin': '*' 
  //       }
  //     })
  //       .then(response => {
  //         if (response.ok) {
  //           console.log(response)
  //           console.log("new account created!");
  //           response.json()
  //             .then(data => {
  //               console.log(data);
  //               // Auth.login(data.token, data.dbUserData.adminFlag);
  //               // call api to notify user of account creation
  //               fetch(`/api/email/new-user`, {
  //                 method: 'post',
  //                 // mode: 'no-cors',
  //                 body: JSON.stringify({ email: formData.email, user: data.dbUserData }),
  //                 headers: {
  //                   'Content-Type': 'application/json',
  //                 }
  //               })
  //                 .then(response => {
  //                   if (response.ok) {
  //                     console.log(response)
  //                     console.log("notification sent!");
  //                     response.json()
  //                       .then(data => {
  //                         console.log(data);
  //                       })
  //                   }
  //                   else {
  //                     alert(response.statusText)
  //                     // console.log(response)
  //                   }
  //                 })
  //                 .catch(err => console.log(err));
  //               Auth.login(data.token, data.dbUserData.adminFlag);
  //             });
  //         }
  //         else {
  //           alert(response.statusText)
  //           // console.log(response)
  //         }
  //       })
  //       .catch(err => console.log(err))

  //   }
  //   else {
  //     alert("Please fill out all fields before submitting");
  //   }
  // }

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
    // if the value type is a string, crop any additional white space
    // if (typeof value === 'string') {
    //   value.trim();
    // }
    // console.log(name, value);
    // console.log(formData);
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
      <div className="section section-signup light-blue-bg-color pb-0 mb-0">
        <div className="content">
          <Container>
            <h2 className="title text-center">Sign Up</h2>
            <Form className="form" onSubmit={(e) => handleFormSubmit(e)}>

              <Row className="g-2">
                <Col md='5' xs='10'>
                  <InputGroup
                    className={
                      "no-border" + (formData.firstName ? " input-group-focus" : "")
                    }
                  >
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="now-ui-icons users_circle-08"></i>
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      placeholder="First Name"
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="text-cleanar-color"
                      // onFocus={(e) => handleChange(e)}
                      onChange={(e) => handleChange(e)}
                    ></Input>
                  </InputGroup>
                </Col>
                <Col md='1' xs='1'>
                  <Button id="Popover1" type="button" tabIndex='-1' className="btn-round btn-icon"><FaQuestionCircle /></Button>
                  <Popover placement="right" isOpen={popoverOpen.firstName} target="Popover1" toggle={() => togglePopover('firstName')}>
                    <PopoverBody>
                      Enter your first name.
                    </PopoverBody>
                  </Popover>
                </Col>
                <Col md='5' xs='10'>
                  <InputGroup
                    className={
                      "no-border" + (formData.lastName ? " input-group-focus" : "")
                    }
                  >
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="now-ui-icons text_caps-small"></i>
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      placeholder="Last Name"
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="text-cleanar-color"
                      // onFocus={(e) => handleChange(e)}
                      onChange={(e) => handleChange(e)}
                    ></Input>
                  </InputGroup>
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
                <Col md='5' xs='10'>
                  <InputGroup
                    className={
                      "no-border" + (formData.email ? " input-group-focus" : "")
                    }
                  >
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="now-ui-icons ui-1_email-85"></i>
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      placeholder="Email"
                      type="text"
                      id="email"
                      name="email"
                      className="text-cleanar-color"
                      // onFocus={(e) => handleChange(e)}
                      onChange={(e) => handleChange(e)}
                    ></Input>
                  </InputGroup>
                </Col>
                <Col md='1' xs='1'>
                  <Button id="Popover3" type="button" tabIndex='-1' className="btn-round btn-icon"><FaQuestionCircle /></Button>
                  <Popover placement="right" isOpen={popoverOpen.email} target="Popover3" toggle={() => togglePopover('email')}>
                    <PopoverBody>
                      Enter your email address.
                    </PopoverBody>
                  </Popover>
                </Col>
                <Col md='5' xs='10'>
                  <InputGroup
                    className={
                      "no-border" + (formData.telephone ? " input-group-focus" : "")
                    }
                  >
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="now-ui-icons tech_mobile"></i>
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      placeholder="Telephone"
                      type="text"
                      id="telephone"
                      name="telephone"
                      className="text-cleanar-color"
                      // onFocus={(e) => handleChange(e)}
                      onChange={(e) => handleChange(e)}
                    ></Input>
                  </InputGroup>
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
                <Col md='5' xs='10'>
                  <InputGroup
                    className={
                      "no-border" + (formData.username ? " input-group-focus" : "")
                    }
                  >
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="now-ui-icons users_single-02"></i>
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      placeholder="Username"
                      type="text"
                      id="username"
                      name="username"
                      className="text-cleanar-color"
                      // onFocus={(e) => handleChange(e)}
                      onChange={(e) => handleChange(e)}
                    ></Input>
                  </InputGroup>
                </Col>
                <Col md='1' xs='1'>
                  <Button id="Popover5" type="button" tabIndex='-1' className="btn-round btn-icon"><FaQuestionCircle /></Button>
                  <Popover placement="right" isOpen={popoverOpen.username} target="Popover5" toggle={() => togglePopover('username')}>
                    <PopoverBody>
                      Enter your username.
                    </PopoverBody>
                  </Popover>
                </Col>
                <Col md='5' xs='10'>
                  <InputGroup
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
                  </InputGroup>
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
                <Col md='11' xs='10'>
                  <InputGroup className={`no-border ${formData.howDidYouHearAboutUs ? "input-group-focus" : ""}`}>
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText className=''>
                        <i className="now-ui-icons objects_globe"></i>
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      type="select"
                      value={formData.howDidYouHearAboutUs}
                      name='howDidYouHearAboutUs'
                      className="text-cleanar-color"
                      // className='font-weight-bold km-bg-test'
                      onChange={handleChange}
                    >
                      <option value="">How Did You Hear About Us?...</option>
                      <option value="Google">Google</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Referral">Referral</option>
                      <option value="Other">Other</option>
                    </Input>
                  </InputGroup>
                </Col>
                <Col md='1' xs='1'>
                  <Button id="Popover7" type="button" tabIndex='-1' className="btn-round btn-icon"><FaQuestionCircle /></Button>
                  <Popover placement="right" isOpen={popoverOpen.howDidYouHearAboutUs} target="Popover7" toggle={() => togglePopover('howDidYouHearAboutUs')}>
                    <PopoverBody>
                      How did you hear about us?
                    </PopoverBody>
                  </Popover>
                </Col>
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
      </div>
      {/* <Footer /> */}
    </>
  );
}

export default SignUp;
