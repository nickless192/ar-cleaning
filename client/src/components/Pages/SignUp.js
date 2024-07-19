import React from "react";
import { Link } from "react-router-dom";
import Auth from "../../utils/auth";
// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Container,
  Row
} from "reactstrap";

import Navbar from "components/Pages/Navbar.js";
import Footer from "components/Pages/Footer.js";

// core components

function SignUp() {
  // const [firstName, setFirstName] = React.useState(false);
  // const [lastName, setLastName] = React.useState(false);
  // const [email, setEmail] = React.useState(false);
  // const [username, setUsername] = React.useState(false);
  // const [password, setPassword] = React.useState(false);
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    howDidYouHearAboutUs: "",
    username: "",
    password: ""
  });

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (formData.firstName && formData.lastName && formData.email && formData.username && formData.password) {
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
    console.log(name, value);
    console.log(formData);
    setFormData({ ...formData, [name]: value });
  };

  React.useEffect(() => {
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
      <div
        className="section section-signup km-bg-primary"
        style={{
          // backgroundImage: "url(" + require("assets/img/bg8.jpg") + ")",
          backgroundColor: "green",
          backgroundSize: "cover",
          backgroundPosition: "top center",
          minHeight: "700px"
        }}
      >
        <div>
          <Container>
            <h2 className="title text-center">Sign Up</h2>
            <Form className="form" onSubmit={(e) => handleFormSubmit(e)}>
              
              <div>
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
                    // onFocus={(e) => handleChange(e)}
                    onChange={(e) => handleChange(e)}
                  ></Input>
                </InputGroup>
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
                    // onFocus={(e) => handleChange(e)}
                    onChange={(e) => handleChange(e)}
                  ></Input>
                </InputGroup>
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
                    // onFocus={(e) => handleChange(e)}
                    onChange={(e) => handleChange(e)}
                  ></Input>
                </InputGroup>
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
                    // onFocus={(e) => handleChange(e)}
                    onChange={(e) => handleChange(e)}
                  ></Input>
                </InputGroup>
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
                    // onFocus={(e) => handleChange(e)}
                    onChange={(e) => handleChange(e)}
                  ></Input>
                </InputGroup>
              </div>
              <div className="text-center">
              <Button
                  className="btn-neutral btn-round"
                  color="info"
                  type="submit"
                  // onClick={(e) => handleFormSubmit(e)}
                  size="lg"
                >
                  Get Started
                </Button>
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
