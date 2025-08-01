import React from "react";
import { useEffect, useState } from "react";
import Auth from "/src/utils/auth";
import VisitorCounter from "/src/components/Pages/Management/VisitorCounter";
// import Logo from "../../assets/svg/cleanmart-blue.svg";
// import 'bootstrap/dist/css/bootstrap.min.css';

// reactstrap components
import {
  // Button,
  Row,
  Col,
  // Tooltip,
  Popover, PopoverBody
} from "reactstrap";

import {
  FloatingLabel,
  Button,
  Form,
  Container,
  // InputGroup
} from 'react-bootstrap';

import { FaQuestionCircle } from 'react-icons/fa';


function LoginPage() {

  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  // const [tooltipOpen, setTooltipOpen] = useState({
  //   username: false,
  //   password: false
  // });

  const [popoverOpen, setPopoverOpen] = useState({
    username: false,
    password: false
  });

  // const toggleTooltip = (field) => {
  //   setTooltipOpen({ ...tooltipOpen, [field]: !tooltipOpen[field] });
  // };

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

    if (formData.username && formData.password) {
      // console.log(body);
      await fetch('/api/users/login/', {
        method: 'post',
        // mode: 'no-cors',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json',
        }
      })
        .then(response => {
          if (response.ok) {
            console.log("you're logged!");
            response.json()
              .then(data => {
                console.log(data);
                console.log(data.dbUserData.adminFlag);
                Auth.login(data.token, data.dbUserData.adminFlag);


              });
          }
          else {
            // alert(response.statusText)
            if (response.status === 404) {
              alert("User not found")
            }
            else if (response.status === 401) {
              alert("Wrong password!")
            }
            console.log(response)
          }
        })
        .catch(err => console.log(err))


    }
    else {
      alert("Please enter your username and password");
    }
  }

  const handleResetPassword = async (event) => {
    event.preventDefault();
    if (formData.username) {
      await fetch('/api/email/request-password-reset', {
        method: 'post',
        // mode: 'no-cors',
        body: JSON.stringify({ username: formData.username.toLowerCase() }),
        headers: {
          'Content-Type': 'application/json',
        }
      })
        .then(response => {
          if (response.ok) {
            // console.log("Password reset request sent!");
            response.json()
              .then(data => {
                // console.log(data);
                alert(data.message);
              });
          }
          else {
            // alert(response.statusText)
            if (response.status === 404) {
              alert("User not found")
            }
            else if (response.status === 401) {
              alert("Wrong password!")
            }
            // console.log(response)
          }
        })
        .catch(err => console.log(err))
    }
    else {
      alert("Please enter your username to reset your password");
    }
  }

  const handleChange = (event) => {
    event.preventDefault();
    const { name, value } = event.target;
    // console.log(name, value);
    // console.log(formData);
    setFormData({ ...formData, [name]: value.trim() });
  };

    // Define transition props for Popover to avoid warning
    const transitionProps = {
      timeout: 150 // Set a timeout value for the transition (in milliseconds)
    };


  useEffect(() => {
    document.body.classList.add("login-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    // window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    return function cleanup() {
      document.body.classList.remove("login-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);


  return (
    <>
      {/* <Navbar /> */}
      <VisitorCounter page={"login-page"} />
      <div className="content content-border">
          <h1 className="title primary-color text-center montserrat-bold">Log in</h1>
        {/* <div className="content px-2"> */}
        <Container className="container">
          <p className="primary-color text-bold text-center">
            Log in to access your account for faster checkout and to view order history.
          </p>
          <Form onSubmit={handleFormSubmit}>
            <Row className="justify-content-center">
              <Col className="py-3" md="10" xs='10'>
                <FloatingLabel
                  controlId="floatingInput"
                  label="Username*"
                  // className="mb-3"
                  className="text-cleanar-color"
                >
                  <Form.Control type="text" className='form-input rounded-pill text-cleanar-color' placeholder="" onChange={(e) => handleChange(e)} name="username"/>
                </FloatingLabel>
              </Col>
              <Col className="py-3" md="1" xs='1'>
                {/* <Button
                  type="button"
                  tabIndex='-1'
                  // color="link"
                  className="primary-bg-color btn-round btn-icon"
                  > */}
                  <FaQuestionCircle
                  onClick={() => togglePopover('username')}
                  id="Tooltip1"
                  
                  />
                {/* </Button> */}
                <Popover
                  placement="top"
                  isOpen={popoverOpen.username}
                  target="Tooltip1"                  
                  toggle={() => togglePopover('username')}
                  transition={transitionProps}
                >
                  <PopoverBody>Enter your registered username.</PopoverBody>
                </Popover>
              </Col>
            </Row>
            <Row className="justify-content-center">
              <Col className="py-3" md="10" xs='10'>
                <FloatingLabel controlId="floatingPassword" label="Password*"
                  className="text-cleanar-color"
                >
                  <Form.Control type="password" placeholder=""
                    className="form-input rounded-pill text-cleanar-color"
                    onChange={(e) => handleChange(e)} name="password" />
                </FloatingLabel>
              </Col>
              <Col className="py-3" md="1" xs='1'>
                {/* <Button
                  type="button"
                  tabIndex='-1'
                  // color="link"
                  className="primary-bg-color btn-round btn-icon"
                  > */}
                  <FaQuestionCircle
                  id="Tooltip2"
                  onClick={() => togglePopover('password')}
                  
                  />
                {/* </Button> */}
                <Popover
                  placement="top"
                  isOpen={popoverOpen.password}
                  target="Tooltip2"
                  toggle={() => togglePopover('password')}
                  transition={transitionProps}
                >
                  <PopoverBody>Enter your account password.</PopoverBody>
                </Popover>
              </Col>
            </Row>
            <Row className="justify-content-center">
              <Col className="py-3" md="6" xs='6'>
                {/* <div className="text-center"> */}
                  <Button
                    className="btn rounded-pill primary-bg-color"
                    type="submit"
                    data-track="login"
                    size="lg"
                  >
                    Log In
                  </Button>
                  </Col>
                  <Col className="py-3" md='6' xs='6'>
                  <Button
                    className="btn-info rounded-pill"
                    type="button"
                    data-track="reset-password"
                    onClick={handleResetPassword}
                    size="lg"
                  >
                    Reset Your Password
                  </Button>
                {/* </div> */}
                {/* </Form> */}
                {/* </Card> */}
              </Col>
            </Row>
          </Form>
        </Container>
      </div>
    </>
  );
}

export default LoginPage;
