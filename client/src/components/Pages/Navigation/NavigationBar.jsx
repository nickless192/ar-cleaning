import React from 'react';
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
// import './NavigationBar.css'; // Custom CSS file
import '/src/assets/css/Navigation.css';

const NavigationBar = () => {
  return (
    <Navbar bg="white" expand="lg" className="py-3 shadow-sm">
      <Container fluid className="px-4">
        {/* Logo Section */}
        <Navbar.Brand href="#" className="d-flex align-items-center">
          <div className="logo-container">
            <div className="logo-box rounded-3 p-3 mb-2">
              <img 
                src="/cleanar-logo.png" 
                alt="CleanAR logo"
                height="50"
                width="50"
              />
            </div>
            <div className="brand-text text-center">
              <strong>CleanAR</strong><br/>
              <small>SOlutions</small>
            </div>
          </div>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        
        <Navbar.Collapse id="responsive-navbar-nav">
          {/* Center Navigation */}
          <Nav className="mx-auto">
            <Nav.Link href="#home" className="px-3">Home</Nav.Link>
            <Nav.Link href="#services" className="px-3">Services</Nav.Link>
            <Nav.Link href="#products" className="px-3">Products</Nav.Link>
            <Nav.Link href="#about" className="px-3">About</Nav.Link>
            <Nav.Link href="#contact" className="px-3">Contact</Nav.Link>
          </Nav>

          {/* Right Side Icons */}
          <div className="d-flex align-items-center">
            {/* Social Media Icons */}
            <div className="social-icons border rounded px-3 py-2 me-2">
              <a href="#" className="text-dark mx-2">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-dark mx-2">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-dark mx-2">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-dark mx-2">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>

            {/* Language Selector */}
            <Dropdown className="language-selector">
              <Dropdown.Toggle variant="outline-secondary" size="sm">
                <i className="fas fa-globe me-1"></i> EN
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item>English</Dropdown.Item>
                <Dropdown.Item>Español</Dropdown.Item>
                <Dropdown.Item>Français</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;