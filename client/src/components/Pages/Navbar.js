import React from "react";
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
    
} from "reactstrap";
import Auth from "../../utils/auth";
// import { set } from "mongoose";

function IndexNavbar() {
    const [navbarColor, setNavbarColor] = React.useState("navbar-transparent");
    const [collapseOpen, setCollapseOpen] = React.useState(false);

    const [isLogged] = React.useState(Auth.loggedIn());
    // const [adminFlag, setAdminFlag] = React.useState(localStorage.getItem('adminFlag'));

    // setAdminFlag(localStorage.getItem('adminFlag'));
    // console.log(adminFlag);
    // console.log(Auth.loggedIn());

    React.useEffect(() => {
        const scrollTopVal = 90;
        
        const updateNavbarColor = () => {
            if (
                document.documentElement.scrollTop > (scrollTopVal-1) ||
                document.body.scrollTop > (scrollTopVal-1)
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
                            href="/api/logout"
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
                            href="/signup-page"
                        >
                            <i className="now-ui-icons objects_spaceship mr-1"></i>
                            <p>Sign Up</p>
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            // className="nav-link btn-neutral"
                            // color="info"
                            href="/login-page"
                        >
                            <i className="now-ui-icons sport_user-run mr-1"></i>
                            <p>Log In</p>
                        </NavLink>
                    </NavItem>
                </>
            )
        }
    }
    return (
        <>
            {collapseOpen ? (
                <div
                    id="bodyClick"
                    onClick={() => {
                        document.documentElement.classList.toggle("nav-open");
                        setCollapseOpen(false);
                    }}
                />
            ) : null}
            <Navbar className={"fixed-top navbar-color " + navbarColor} expand="lg" >
                <Container>
                    <div className="navbar-translate">
                        <NavbarBrand
                            href="/index"
                            id="navbar-brand"
                            className="text-capitalize font-weight-bold"
                        >
                            CleanAR Solutions
                        </NavbarBrand>
                        <button
                            className="navbar-toggler navbar-toggler"
                            onClick={() => {
                                document.documentElement.classList.toggle("nav-open");
                                setCollapseOpen(!collapseOpen);
                            }}
                            aria-expanded={collapseOpen}
                            type="button"
                        >
                            <span className="navbar-toggler-bar top-bar"></span>
                            <span className="navbar-toggler-bar middle-bar"></span>
                            <span className="navbar-toggler-bar bottom-bar"></span>
                        </button>
                    </div>
                    <Collapse
                        className="justify-content-end"
                        isOpen={collapseOpen}
                        navbar
                    >
                        <Nav navbar>
                            {/* <NavItem>
                                <NavLink
                                    href="#pablo"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document
                                            .getElementById("download-section")
                                            .scrollIntoView();
                                    }}
                                >
                                    <i className="now-ui-icons arrows-1_cloud-download-93"></i>
                                    <p>Download</p>
                                </NavLink>
                            </NavItem> */}
                            <NavItem>
                                <NavLink
                                    // className="nav-link btn-neutral"
                                    // color="info"
                                    href="/products-and-services"
                                >
                                    <i className="now-ui-icons business_bulb-63 mr-1"></i>
                                    <p>Products & Services</p>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    // className="nav-link btn-neutral"
                                    // color="info"
                                    href="/request-quote"
                                >
                                    <i className="now-ui-icons shopping_cart-simple mr-1"></i>
                                    <p>Request Quote</p>
                                </NavLink>

                            </NavItem>
                                                        <NavItem>
                                <NavLink
                                    // className="nav-link btn-neutral"
                                    // color="info"
                                    href="/view-quotes"
                                >
                                    <i className="now-ui-icons files_single-copy-04 mr-1"></i>
                                    <p>View Quotes</p>
                                </NavLink>
                            </NavItem>
                            {showLogin()}
                            <NavItem>
                                <NavLink
                                    href="https://www.instagram.com/cleanARsolutions/"
                                    target="_blank"
                                    id="instagram-tooltip"
                                >
                                    <i className="fab fa-instagram"></i>
                                    <p className="d-lg-none d-xl-none">Instagram</p>
                                </NavLink>
                            </NavItem>
                        </Nav>
                    </Collapse>
                </Container>
            </Navbar>
        </>
    );
}

export default IndexNavbar;
