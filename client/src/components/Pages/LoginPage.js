import React from "react";
import { useEffect, useState } from "react";
import Auth from "../../utils/auth";
// import Logo from "../../assets/svg/cleanmart-blue.svg";

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

// core components
// import ExamplesNavbar from "components/Navbars/ExamplesNavbar.js";
import Navbar from "components/Pages/Navbar.js";
import Footer from "components/Pages/Footer.js";

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
  }

  const handleChange = (event) => {
    event.preventDefault();
    const { name, value } = event.target;
    // console.log(name, value);
    // console.log(formData);
    setFormData({ ...formData, [name]: value });
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
      <Navbar />
      <div className="section accent-bg-color pb-0 mb-0">
        <div className="content">
          <Container className="">
              <h2 className="title">Welcome to CleanAR Solutions</h2>
              <p className="description text-dark">
                Log in to access your account
              </p>
            <Form onSubmit={handleFormSubmit}>

              <Row>
                <Col className="ml-auto mr-auto" md="11" xs='11'>
                  <FloatingLabel
                    controlId="floatingInput"
                    label="Username"
                    className="mb-3"
                  >
                    <Form.Control type="text" placeholder="" onChange={(e) => handleChange(e)} name="username" id="username" />
                  </FloatingLabel>
                </Col>
                <Col className="ml-auto mr-auto" md="1" xs='1'>
                  <Button
                    id="Tooltip1"
                    type="button"
                    // color="link"
                    className="primary-bg-color btn-round btn-icon"
                    onClick={() => togglePopover('username')}
                  >
                    <FaQuestionCircle />
                  </Button>
                  <Popover
                    placement="top"
                    isOpen={popoverOpen.username}
                    target="Tooltip1"
                    toggle={() => togglePopover('username')}
                  >
                    <PopoverBody>Enter your registered username.</PopoverBody>
                  </Popover>
                </Col>
              </Row>
              <Row>
                <Col className="ml-auto mr-auto" md="11" xs='11'>
                  <FloatingLabel controlId="floatingPassword" label="Password">
                    <Form.Control type="password" placeholder="" onChange={(e) => handleChange(e)} name="password" id="password" />
                  </FloatingLabel>
                </Col>
                <Col className="ml-auto mr-auto" md="1" xs='1'>
                  <Button
                    id="Tooltip2"
                    type="button"
                    // color="link"
                    className="primary-bg-color btn-round btn-icon"
                    onClick={() => togglePopover('password')}
                  >
                    <FaQuestionCircle />
                  </Button>
                  <Popover
                    placement="top"
                    isOpen={popoverOpen.password}
                    target="Tooltip2"
                    toggle={() => togglePopover('password')}
                  >
                    <PopoverBody>Enter your account password.</PopoverBody>
                  </Popover>
                </Col>
              </Row>
<Row>
              <Col className="ml-auto mr-auto" md="4">
                <div className="text-center">
                  <Button
                    block
                    className="btn-round primary-bg-color"
                    type="submit"
                    // color="info"

                    size="lg"
                  // onClick={(e) => handleFormSubmit(e)}
                  >
                    Log In
                  </Button>
                </div>
                {/* </Form> */}
                {/* </Card> */}
              </Col>
              </Row>
            </Form>
          </Container>
        </div>
      </div>
      <Footer />
      {/* </div> */}
    </>
  );
}

export default LoginPage;
