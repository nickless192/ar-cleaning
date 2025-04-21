import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./../../assets/css/our-palette.css";
// reactstrap components
import {

    Collapse,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    UncontrolledDropdown,
    NavbarBrand,
    Navbar,
    NavItem,
    NavLink,
    Nav,
    Container,
    Row,
    Col
} from "reactstrap";
import Auth from "../../utils/auth";
// import { set } from "mongoose";

function IndexNavbar() {
    const [navbarColor, setNavbarColor] = useState("navbar-color");
    const [collapseOpen, setCollapseOpen] = useState(false);

    const [isLogged] = useState(Auth.loggedIn());
    // const [adminFlag, setAdminFlag] = React.useState(localStorage.getItem('adminFlag'));

    // setAdminFlag(localStorage.getItem('adminFlag'));
    // console.log(adminFlag);
    // console.log(Auth.loggedIn());

    const handleToggle = () => {
        const doc = document.documentElement;
        const isOpen = doc.classList.contains("nav-open");
      
        if (isOpen) {
          doc.classList.remove("nav-open");
        } else {
          doc.classList.add("nav-open");
        }
      
        setCollapseOpen(!collapseOpen);
      };
      

    useEffect(() => {
        const scrollTopVal = 0;

        const updateNavbarColor = () => {
            if (
                document.documentElement.scrollTop > (scrollTopVal - 1) ||
                document.body.scrollTop > (scrollTopVal - 1)
            ) {
                setNavbarColor("navbar-color");
            } else if (
                document.documentElement.scrollTop < scrollTopVal ||
                document.body.scrollTop < scrollTopVal
            ) {
                setNavbarColor("navbar-transparent");
            }
        };

        // const initializeAdminFlag = () => {
        //     setAdminFlag(localStorage.getItem('adminFlag'));
        // }


        window.addEventListener("scroll", updateNavbarColor);
        return function cleanup() {
            // initializeAdminFlag();
            window.removeEventListener("scroll", updateNavbarColor);
        };
    });

    function showLogin() {
        // console.log(Auth.getProfile().data.adminFlag);
        if (isLogged) {
            return (
                <>
                    {Auth.getProfile().data.adminFlag === true ? (
                        <UncontrolledDropdown nav>
                            <DropdownToggle
                                caret
                                color="default"
                                href="#pablo"
                                nav
                                onClick={(e) => e.preventDefault()}
                            >
                                <i className="now-ui-icons ui-1_settings-gear-63 mr-1"></i>
                                <p>Configure</p>
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem to="/manage-product" tag={Link}>
                                    <i className="now-ui-icons ui-1_settings-gear-63 mr-1"></i>
                                    Manage Products
                                </DropdownItem>
                                <DropdownItem to="/manage-service" tag={Link}>
                                    <i className="now-ui-icons ui-1_settings-gear-63 mr-1"></i>
                                    Manage Services
                                </DropdownItem>
                                <DropdownItem to="/manage-user" tag={Link}>
                                    <i className="now-ui-icons ui-1_settings-gear-63 mr-1"></i>
                                    Manage Users
                                </DropdownItem>
                                <DropdownItem to="/view-quotes" tag={Link}>
                                    <i className="now-ui-icons ui-1_settings-gear-63 mr-1"></i>
                                    View Quotes
                                </DropdownItem>
                                <DropdownItem to="/manage-gift-card" tag={Link}>
                                    <i className="now-ui-icons ui-1_settings-gear-63 mr-1"></i>
                                    Manage Gift Cards
                                </DropdownItem>
                                <DropdownItem to="/dashboard" tag={Link}>
                                    <i className="now-ui-icons ui-1_settings-gear-63 mr-1"></i>
                                    Dashboard
                                </DropdownItem>
                                <DropdownItem to="/booking-dashboard" tag={Link}>
                                    <i className="now-ui-icons ui-1_settings-gear-63 mr-1"></i>
                                    Bookings
                                </DropdownItem>
                                {/* <NavItem>
                                <NavLink
                                    // className="nav-link btn-neutral"
                                    // color="info"
                                    href="/view-quotes/"
                                >
                                    <i className="now-ui-icons files_single-copy-04 mr-1"></i>
                                    <p>View Quotes</p>
                                </NavLink>
                            </NavItem> */}
                            </DropdownMenu>
                        </UncontrolledDropdown>

                    ) : console.log("Not an admin")}
                    {/* {Auth.getProfile().data.adminFlag === true ? (
                        <NavItem>
                            <NavLink
                                // className="nav-link btn-neutral"
                                // color="info"
                                href="/manage-service"
                            >
                                <i className="now-ui-icons ui-1_settings-gear-63 mr-1"></i>
                                <p>Manage Services</p>
                            </NavLink>
                        </NavItem>
                    ) : null}
                    {Auth.getProfile().data.adminFlag === true ? (
                        <NavItem>
                            <NavLink
                                // className="nav-link btn-neutral"
                                // color="info"
                                href="/manage-product"
                            >
                                <i className="now-ui-icons ui-1_settings-gear-63 mr-1"></i>
                                <p>Manage Products</p>
                            </NavLink>
                        </NavItem>
                    ) : null} */}
                    <NavItem>
                        <NavLink
                            // className="nav-link btn-neutral"
                            // color="info"
                            href="/profile-page"
                        >
                            <i className="now-ui-icons users_circle-08 mr-1"></i>
                            <p>Profile</p>
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            // className="nav-link btn-neutral"
                            // color="info"
                            href="/index"
                            id="logout-btn"
                            onClick={() => Auth.logout()}
                        >
                            <i className="now-ui-icons arrows-1_share-66 mr-1"></i>
                            <p>Log Out</p>
                        </NavLink>
                    </NavItem>
                </>
            )
        }
        else {
            return (
                <>
                    <NavItem>
                        <NavLink
                            // className="nav-link btn-neutral"
                            // color="info"
                            href="/login-signup"
                        >
                            <i className="now-ui-icons objects_spaceship mr-1"></i>
                            <p>Log In + Sign Up</p>
                        </NavLink>
                    </NavItem>
                    {/* <NavItem>
                        <NavLink
                            // className="nav-link btn-neutral"
                            // color="info"
                            href="/login-page"
                        >
                            <i className="now-ui-icons sport_user-run mr-1"></i>
                            <p>Log In</p>
                        </NavLink>
                    </NavItem> */}
                </>
            )
        }
    }
    return (
        <>
            {collapseOpen ? (
                <div
                    id="bodyClick"
                    onClick={
                    // handleToggle
                        () => {
                        document.documentElement.classList.toggle("nav-open");
                        setCollapseOpen(false);
                    }
                }
                />
            ) : null}
            <Navbar className={"fixed-topnav-bar-top mb-0 navbar-color " + navbarColor} expand="lg">
                <Container fluid className="d-flex justify-content-between align-items-center px-3">
                    {/* Left: Logo + Company Name */}
                    <NavbarBrand
                        href="/index"
                        id="navbar-brand"
                        className="text-capitalize font-weight-bold d-flex align-items-center"
                    >
                        <Row>
<Col xs="12">
                        <img
                            src={require("../../assets/img/IC CLEAN AR-15-cropped.png")}
                            alt="CleanAR Solutions"
                            className="navbarlogo"
                        />
</Col>
                        <Col>
                        <div className="">
                            <h1 className="navlogotext navbarh1 montserrat-bold m-0 t-0 ms-2">
                                CleanAR Solutions
                                </h1>
                        </div>
                        </Col>
                        </Row>
                    </NavbarBrand>

                    {/* Right: Toggler + Nav Links */}
                    <div className="d-flex align-items-center">
                        <button
                            className="navbar-toggler"
                            onClick={handleToggle
                            //     () => {
                            //     document.documentElement.classList.toggle("nav-open");
                            //     setCollapseOpen(!collapseOpen);
                            // }
                        }
                            aria-expanded={collapseOpen}
                            type="button"
                        >
                            <span className="navbar-toggler-bar top-bar"></span>
                            <span className="navbar-toggler-bar middle-bar"></span>
                            <span className="navbar-toggler-bar bottom-bar"></span>
                        </button>

                        <Collapse className="ms-3" isOpen={collapseOpen} navbar>
                            <Nav navbar className="d-flex align-items-center">
                                <NavItem>
                                    <NavLink href="/about-us">
                                        <i className="now-ui-icons business_badge mr-1"></i>
                                        <p>About Us</p>
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink href="/products-and-services">
                                        <i className="now-ui-icons business_bulb-63 mr-1"></i>
                                        <p>Products & Services</p>
                                    </NavLink>
                                </NavItem>
                                {showLogin()}
                            </Nav>
                        </Collapse>
                    </div>
                </Container>
            </Navbar>
        </>
    );
}

export default IndexNavbar;
