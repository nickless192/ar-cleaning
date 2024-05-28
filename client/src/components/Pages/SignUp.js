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
    username: "",
    password: ""
  });

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (formData.firstName && formData.lastName && formData.email && formData.username && formData.password) {
    // if (firstName && lastName && email && username && password) {
      // const response = await 
      // const body = {
      //   firstName: firstName.firstName,
      //   lastName: lastName.lastName,
      //   email: email.email,
      //   username: username.username,
      //   password: password.password
      // };
      // console.log(body);
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
            // console.log(response2json);
            // fetch('/index');
            // document.location.replace('/index');
          }
          else {
            alert(response.statusText)
            // console.log(response)
          }
        })
        .catch(err => console.log(err))

      // if (response.ok) {
      //   fetch('/index');
      //   document.location.replace('/index');
      // } else {
      //   alert(response.statusText);
      // }
    }
  }

  const handleChange = (event) => {
    event.preventDefault();
    const { name, value } = event.target;
    console.log(name, value);
        console.log(formData);
        setFormData({ ...formData, [name]: value });
    // console.log(event.target);
    // console.log(name);
    // if (name === "firstName") {

    //   setFirstName({

    //     [name]: value,
    //   });
    // }
    // if (name === "lastName") {

    //   setLastName({

    //     [name]: value
    //   });
    // }
    // if (name === "email") {

    //   setEmail({

    //     [name]: value
    //   });
    // }
    // if (name === "username") {
    //   setUsername({
    //     [name]: value
    //   })
    // }
    // if (name === "password") {
    //   setPassword({
    //     [name]: value
    //   })
    // }
    // console.log(firstName.firstName);
    // console.log(lastName.lastName);
    // console.log(email.email);
    // console.log(username.username);
    // console.log(password.password);
  };

  return (
    <>
    <Navbar />
      <div
        className="section section-signup"
        style={{
          backgroundImage: "url(" + require("assets/img/bg8.jpg") + ")",
          backgroundSize: "cover",
          backgroundPosition: "top center",
          minHeight: "700px"
        }}
      >
        <div>
        <Container>
          <Row>
            <Card className="card-signup" data-background-color="blue">
              <Form className="form" onSubmit={(e) => handleFormSubmit(e)}>
                <CardHeader className="text-center">
                  <CardTitle className="title-up" tag="h3">
                    Sign Up
                  </CardTitle>
                  <div className="social-line">
                    {/* <Button
                      className="btn-neutral btn-icon btn-round"
                      color="facebook"
                      href="#pablo"
                      onClick={(e) => e.preventDefault()}
                    >
                      <i className="fab fa-facebook-square"></i>
                    </Button>
                    <Button
                      className="btn-neutral btn-icon btn-round"
                      color="twitter"
                      href="#pablo"
                      onClick={(e) => e.preventDefault()}
                      size="lg"
                    >
                      <i className="fab fa-twitter"></i>
                    </Button>
                    <Button
                      className="btn-neutral btn-icon btn-round"
                      color="google"
                      href="#pablo"
                      onClick={(e) => e.preventDefault()}
                    >
                      <i className="fab fa-google-plus"></i>
                    </Button> */}
                  </div>
                </CardHeader>
                <CardBody>
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
                </CardBody>
                <CardFooter className="text-center">
                  <Button
                    className="btn-neutral btn-round"
                    color="info"
                    type="submit"
                    // onClick={(e) => handleFormSubmit(e)}
                    size="lg"
                  >
                    Get Started
                  </Button>
                </CardFooter>
              </Form>
            </Card>
          </Row>
          <div className="col text-center">
            <Button
              className="btn-round btn-white"
              color="default"
              to="/login-page"
              outline
              size="lg"
              tag={Link}
            >
              View Login Page
            </Button>
          </div>
        </Container>
        </div>
      </div>
        <Footer />
    </>
  );
}

export default SignUp;
