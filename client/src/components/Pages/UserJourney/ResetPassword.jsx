import React from "react";
import { useEffect, useState } from "react";
import Auth from "/src/utils/auth";
import { useLocation, useNavigate } from 'react-router-dom';
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


function ResetPassword() {

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState('');
  const token = new URLSearchParams(useLocation().search).get('token');
  const navigate = useNavigate();


  const [popoverOpen, setPopoverOpen] = useState({
    password: false,
    confirmPassword: false
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


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: formData.password }),
      });

      const data = await response.json();
      if (response.ok) {
        // setMessage('Password successfully reset');
        alert('Password successfully reset! Navigating to login page...');
        navigate('/login-page');
      } else {
        setMessage(data.message || 'Error resetting password');
      }
    } catch (error) {
      setMessage('Error resetting password');
    }
  };

  const handleChange = (event) => {
    event.preventDefault();
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value.trim() });
  };


  useEffect(() => {
    document.body.classList.add("reset-password-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    // window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    return function cleanup() {
      document.body.classList.remove("reset-password-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);


  return (
    <>
      {/* <Navbar /> */}
      <div className="content light-bg-color opacity-8">
        {/* <div className="content px-2"> */}
        <Container className="container">
          <h2 className="title primary-color">Welcome to CleanAR <span className="secondary-color">Solutions</span></h2>
          <p className="primary-color text-bold">
            Reset Password.
          </p>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col className="py-3" md="10" xs='10'>
                <FloatingLabel
                  controlId="floatingInput"
                  label="Password*"
                  // className="mb-3"
                  className="text-bold text-cleanar-color"
                >
                  <Form.Control type="password" className='text-bold text-cleanar-color' placeholder="" onChange={(e) => handleChange(e)} name="password" id="password" />
                </FloatingLabel>
              </Col>
              <Col className="py-3" md="1" xs='1'>
                <Button
                  id="Tooltip1"
                  type="button"
                  tabIndex='-1'
                  // color="link"
                  className="primary-bg-color btn-round btn-icon"
                  onClick={() => togglePopover('password')}
                >
                  <FaQuestionCircle />
                </Button>
                <Popover
                  placement="top"
                  isOpen={popoverOpen.password}
                  target="Tooltip1"
                  toggle={() => togglePopover('password')}
                >
                  <PopoverBody>Enter your new password.</PopoverBody>
                </Popover>
              </Col>
            </Row>
            <Row>
              <Col className="py-3" md="10" xs='10'>
                <FloatingLabel controlId="floatingPassword" label="Confirm Password*"
                  className="text-bold text-cleanar-color"
                >
                  <Form.Control type="password" placeholder=""
                    className="text-bold text-cleanar-color"
                    onChange={(e) => handleChange(e)} name="confirmPassword" id="confirmPassword" />
                </FloatingLabel>
              </Col>
              <Col className="py-3" md="1" xs='1'>
                <Button
                  id="Tooltip2"
                  type="button"
                  tabIndex='-1'
                  // color="link"
                  className="primary-bg-color btn-round btn-icon"
                  onClick={() => togglePopover('confirmPassword')}
                >
                  <FaQuestionCircle />
                </Button>
                <Popover
                  placement="top"
                  isOpen={popoverOpen.confirmPassword}
                  target="Tooltip2"
                  toggle={() => togglePopover('confirmPassword')}
                >
                  <PopoverBody>Confirm your new password.</PopoverBody>
                </Popover>
              </Col>
            </Row>
            <Row>
              <Col className="ml-auto mr-auto py-3" md="4">
                <div className="text-center">
                  <Button
                    block
                    className="btn-round primary-bg-color"
                    type="submit"
                    // color="info"

                    size="lg"
                  // onClick={(e) => handleFormSubmit(e)}
                  >
                    Change Password
                  </Button>
                </div>
                {message && <p>{message}</p>}
                {/* </Form> */}
                {/* </Card> */}
              </Col>
            </Row>
          </Form>
        </Container>
        {/* </div> */}
      </div>
      {/* <Footer /> */}
      {/* </div> */}
    </>
  );
}

export default ResetPassword;
