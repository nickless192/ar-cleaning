import React from "react";
import { useEffect, useState } from "react";
import Auth from "../../utils/auth";
// reactstrap components
import {
  Button,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Container,
  Row,
  Col
} from "reactstrap";

import Navbar from "components/Pages/Navbar.js";
import Footer from "components/Pages/Footer.js";

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

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (formData.firstName && formData.lastName && formData.email && formData.username && formData.password && formData.telephone) {
      fetch(`/api/users/`, {
        method: 'post',
        // mode: 'no-cors',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json',
          // 'Access-Control-Allow-Credentials': 'true',
          // 'accept': 'application/json',
          // 'Access-Control-Allow-Origin': 'http://localhost:3000'
          // 'Access-Control-Allow-Origin': '*' 
        }
      })
        .then(response => {
          if (response.ok) {
            console.log(response)
            console.log("new account created!");
            response.json()
              .then(data => {
                console.log(data);
                // Auth.login(data.token, data.dbUserData.adminFlag);
                // call api to notify user of account creation
                fetch(`/api/email/new-user`, {
                  method: 'post',
                  // mode: 'no-cors',
                  body: JSON.stringify({ email: formData.email, user: data.dbUserData }),
                  headers: {
                    'Content-Type': 'application/json',
                  }
                })
                  .then(response => {
                    if (response.ok) {
                      console.log(response)
                      console.log("notification sent!");
                      response.json()
                        .then(data => {
                          console.log(data);
                        })
                    }
                    else {
                      alert(response.statusText)
                      // console.log(response)
                    }
                  })
                  .catch(err => console.log(err));
                Auth.login(data.token, data.dbUserData.adminFlag);
              });
          }
          else {
            alert(response.statusText)
            // console.log(response)
          }
        })
        .catch(err => console.log(err))

    }
  }

  const handleChange = (event) => {
    event.preventDefault();
    const { name, value } = event.target;
    // console.log(name, value);
    // console.log(formData);
    setFormData({ ...formData, [name]: value });
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
      <Navbar />
      <div className="section section-signup secondary-bg-color pb-0 mb-0">
        <div className="content">
          <Container>
            <h2 className="title text-center">Sign Up</h2>
            <Form className="form" onSubmit={(e) => handleFormSubmit(e)}>

              <Row className="g-2">
                <Col md>
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
                <Col md>
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
              </Row>
              <Row className="g-2">
                <Col md>
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
                <Col md>
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
              </Row>
              <Row className="g-2">
                <Col md>
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
                <Col md>
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
              </Row>
              <Row className="g-2">
                <Col md>
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
              </Row>
              <div className="text-center py-3">
                <Row>
                  <Col>

                    <Button
                      className="btn-neutral btn-round btn-lg light-bg-color"
                      // color="info"

                      type="submit"
                      // onClick={(e) => handleFormSubmit(e)}
                      size="lg"
                    >
                      Get Started
                    </Button>
                  </Col>
                  {/* <Col>

                <Button
                  className="btn-round btn-white"
                  color="default"
                  to="/login-page"
                  // outline
                  size="lg"
                  tag={Link}
                >
                  View Login Page
                </Button>
</Col> */}


                </Row>
              </div>
            </Form>

          </Container>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default SignUp;
