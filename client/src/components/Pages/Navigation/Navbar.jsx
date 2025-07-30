import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    FaBoxOpen,
    FaConciergeBell,
    FaUsersCog,
    FaRegFileAlt,
    FaGift,
    FaTachometerAlt,
    FaCalendarCheck,
    FaUserCircle,
    FaSignOutAlt,
    FaRocket,
    FaIdBadge,
    FaLightbulb,
    FaBars,
    FaInstagram,
    FaFacebook,
    FaTiktok,
    FaRegEnvelope,
    FaBell,
    FaUser
} from "react-icons/fa";
import {
    Collapse,
    Row,
    Col,
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
    Badge
} from "reactstrap";
import { useTranslation } from 'react-i18next';
import Auth from "/src/utils/auth";
import logo from "/src/assets/img/IC CLEAN AR-15-cropped.png";
import LanguageSwitcher from "/src/components/Pages/Management/LanguageSwitcher";
import '/src/assets/css/NavBar.css';


// import "./NavBar.css"; // We'll create this CSS file

function IndexNavbar() {
    const [navbarColor, setNavbarColor] = useState("navbar-color");
    const [collapseOpen, setCollapseOpen] = useState(false);
    const [unackCount, setUnackCount] = useState(0);
    const [isLogged] = useState(Auth.loggedIn());
    const { t } = useTranslation();
    const [testerFlag, setTesterFlag] = useState(false);

    const handleToggle = () => {
        document.documentElement.classList.toggle("nav-open");
        setCollapseOpen(!collapseOpen);
    };

    const fetchUnacknowledged = async () => {
        try {
            const response = await fetch(`/api/quotes/quickquote/unacknowledged`);
            const data = await response.json();
            // console.log(data);
            // console.log(data.length);
            setUnackCount(data.quotes?.length || 0);
        } catch (err) {
            console.error("Error fetching unacknowledged quotes:", err);
        }
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

        window.addEventListener("scroll", updateNavbarColor);
        return function cleanup() {
            window.removeEventListener("scroll", updateNavbarColor);
        };
    }, []);

    // Add this right after your existing useEffect
    useEffect(() => {
        // Get the actual navbar height
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            const navbarHeight = navbar.offsetHeight;

            // Apply padding to body
            document.body.style.paddingTop = `${navbarHeight}px`;

            // Set a CSS variable for potential use elsewhere
            document.documentElement.style.setProperty('--navbar-height', `${navbarHeight}px`);
        }

        // Clean up function
        return () => {
            document.body.style.paddingTop = '0';
        };
    }, []);

    useEffect(() => {
        if (isLogged) {
            if (Auth.getProfile().data.adminFlag === true) {
                fetchUnacknowledged();
                const interval = setInterval(fetchUnacknowledged, 30000); // Poll every 30s
                return () => clearInterval(interval);
            }

            if (Auth.getProfile().data.testerFlag === true) {
                setTesterFlag(true);
            }
        }
    }, []);

    function showLogin() {
        if (isLogged) {
            return (
                <>
                    {Auth.getProfile().data.adminFlag === true && (
                        <UncontrolledDropdown nav className="nav-item-dropdown">
                            <DropdownToggle
                                nav
                                className="nav-link-dropdown"
                            >
                                <div className="nav-link-content">
                                    <FaUsersCog className="nav-icon" />
                                    <span>{t('navbar.admin.configure')}</span>
                                </div>
                            </DropdownToggle>

                            <DropdownMenu className="dropdown-menu">
                                <DropdownItem to="/manage-categories" tag={Link} className="dropdown-item">
                                    <FaBoxOpen className="dropdown-icon" />
                                    <span>{t('navbar.admin.manage_categories')}</span>
                                </DropdownItem>
                                <DropdownItem to="/manage-product" tag={Link} className="dropdown-item">
                                    <FaBoxOpen className="dropdown-icon" />
                                    <span>{t('navbar.admin.manage_products')}</span>
                                </DropdownItem>

                                <DropdownItem to="/manage-service" tag={Link} className="dropdown-item">
                                    <FaConciergeBell className="dropdown-icon" />
                                    <span>{t('navbar.admin.manage_services')}</span>
                                </DropdownItem>

                                <DropdownItem to="/manage-user" tag={Link} className="dropdown-item">
                                    <FaUsersCog className="dropdown-icon" />
                                    <span>{t('navbar.admin.manage_users')}</span>
                                </DropdownItem>
                                <DropdownItem to="/manage-customers" tag={Link} className="dropdown-item">
                                    <FaUsersCog className="dropdown-icon" />
                                    <span>{t('navbar.admin.manage_customers')}</span>
                                </DropdownItem>                               
                                <DropdownItem to="/view-quotes" tag={Link} className="dropdown-item">
                                    <FaRegFileAlt className="dropdown-icon" />
                                    <span>{t('navbar.admin.view_quotes')}</span>
                                </DropdownItem>

                                <DropdownItem to="/manage-gift-card" tag={Link} className="dropdown-item">
                                    <FaGift className="dropdown-icon" />
                                    <span>{t('navbar.admin.manage_gift_cards')}</span>
                                </DropdownItem>

                                <DropdownItem to="/dashboard" tag={Link} className="dropdown-item">
                                    <FaTachometerAlt className="dropdown-icon" />
                                    <span>{t('navbar.admin.visitor_dashboard')}</span>
                                </DropdownItem>

                                <DropdownItem to="/booking-dashboard" tag={Link} className="dropdown-item">
                                    <FaCalendarCheck className="dropdown-icon" />
                                    <span>{t('navbar.admin.booking_dashboard')}</span>
                                </DropdownItem>

                                <DropdownItem to="/manage-finance" tag={Link} className="dropdown-item">
                                    <FaCalendarCheck className="dropdown-icon" />
                                    <span>{t('navbar.admin.manage_finance')}</span>
                                </DropdownItem>
                                <DropdownItem to="/manage-expenses" tag={Link} className="dropdown-item">
                                    <FaCalendarCheck className="dropdown-icon" />
                                    <span>{t('navbar.admin.manage_expenses')}</span>
                                </DropdownItem>
                            </DropdownMenu>
                        </UncontrolledDropdown>
                    )}



                    <NavItem className="nav-item">
                        <NavLink href="/profile-page" className="nav-link">
                            <div className="nav-link-content">
                                <FaUserCircle className="nav-icon" />
                                <span>{t('navbar.profile')}</span>
                            </div>
                        </NavLink>
                    </NavItem>

                    {Auth.getProfile().data.adminFlag === true && (
                        <>
                            <NavItem>
                                <NavLink href="/view-quotes" className="position-relative">
                                    <FaBell className="nav-icon" />
                                    {unackCount > 0 && (
                                        <Badge color="danger" pill className="position-absolute top-0 start-100 translate-middle">
                                            {unackCount}
                                        </Badge>
                                    )}
                                </NavLink>
                            </NavItem>
                        </>
                    )}


                    <NavItem className="nav-item">
                        <NavLink
                            href="/index"
                            id="logout-btn"
                            onClick={() => Auth.logout()}
                            className="nav-link"
                        >
                            <div className="nav-link-content">
                                <FaSignOutAlt className="nav-icon" />
                                <span>{t('navbar.log_out')}</span>
                            </div>
                        </NavLink>
                    </NavItem>
                </>
            );
        } else {
            return (
                <NavItem className="nav-item">
                    <NavLink href="/login-signup" className="nav-link nav-link-signup">
                        <div className="nav-link-content">
                            <FaRocket className="nav-icon" />
                            <span>{t('navbar.log_in_signup')}</span>
                        </div>
                    </NavLink>
                </NavItem>
            );
        }
    }

    return (
        <>
            {collapseOpen && (
                <div
                    id="bodyClick"
                    onClick={() => {
                        document.documentElement.classList.toggle("nav-open");
                        setCollapseOpen(false);
                    }}
                />
            )}
            <Navbar className={" mb-0 navbar-color " + navbarColor} expand="lg">
                <Container fluid className=" ">
                    <Row className="navbar-wrapper">
                        <Col md="3" xs="3">
                            <NavbarBrand
                                href="/index"
                                id="navbar-brand"
                                className="text-capitalize font-weight-bold"
                            >
                                <img src={logo} alt="CleanAR Solutions" className="navbarlogo" />
                                <div>
                                    <h1 className="navlogotext navbarh1 montserrat-bold m-0 t-0 ms-2">
                                        CleanAR Solutions
                                    </h1>
                                </div>
                            </NavbarBrand>
                        </Col>
                        <Col md="9" xs="9">
                            <div>
                                <div className="navbar-nav social-icons-container">
                                    <NavItem className="nav-item ml-auto">
                                        <NavLink href="https://www.instagram.com/cleanarsolutions/" className="nav-link" target="_blank" rel="noopener noreferrer">
                                            <div className="nav-link-content">
                                                <FaInstagram />
                                            </div>
                                        </NavLink>
                                    </NavItem>
                                    <NavItem className="nav-item ml-1">
                                        <NavLink href="https://www.facebook.com/share/18X3sPR1vf/?mibextid=wwXIfr" className="nav-link" target="_blank" rel="noopener noreferrer">
                                            <div className="nav-link-content">
                                                <FaFacebook className="nav-icon" />
                                            </div>
                                        </NavLink>
                                    </NavItem>
                                    <NavItem className="nav-item ml-1">
                                        <NavLink href="https://www.tiktok.com/@cleanar.solutions" className="nav-link" target="_blank" rel="noopener noreferrer">
                                            <div className="nav-link-content">
                                                <FaTiktok className="nav-icon" />
                                            </div>
                                        </NavLink>
                                    </NavItem>
                                    <NavItem className="nav-item ml-1">
                                        <a
                                            href="mailto:info@cleanARsolutions.ca"
                                            className="nav-link"
                                            // target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <div className="nav-link-content">
                                                <FaRegEnvelope className="nav-icon" />
                                            </div>
                                        </a>
                                    </NavItem>
                                    <LanguageSwitcher />
                                </div>
                                <div className="">
                                    <button
                                        className="navbar-toggler"
                                        type="button"
                                        onClick={handleToggle}
                                        aria-expanded={collapseOpen}
                                    >
                                        <FaBars className="navbar-toggler-icon" />
                                    </button>
                                    {/* Navigation links */}
                                    <Collapse isOpen={collapseOpen} navbar className="navbar-collapse">
                                        <Nav navbar className="navbar-nav ">
                                            <NavItem className="nav-item">
                                                <NavLink href="/about-us" className="nav-link">
                                                    <div className="nav-link-content">
                                                        <FaIdBadge className="nav-icon" />
                                                        <span>{t('navbar.about_us')}</span>
                                                    </div>
                                                </NavLink>
                                            </NavItem>

                                            <NavItem className="nav-item">
                                                <NavLink href="/products-and-services" className="nav-link">
                                                    <div className="nav-link-content">
                                                        <FaLightbulb className="nav-icon" />
                                                        <span>{t('navbar.products_services')}</span>
                                                    </div>
                                                </NavLink>
                                            </NavItem>

                                             {testerFlag === true && (
                                                 <NavItem className="nav-item">
                                                    <NavLink href="/quick-request-v2" className="nav-link">
                                                     <div className="nav-link-content">
                                                        <FaLightbulb className="nav-icon" />
                                                        <span>{t('New Quote Request - testing - en prueba')}</span>
                                                     </div>
                                                    </NavLink>
                                                 </NavItem>
                               
                                )}

                                            {showLogin()}
                                        </Nav>
                                    </Collapse>
                                </div>
                            </div>


                        </Col>
                    </Row>
                    {/* </div> */}

                </Container>
            </Navbar>
        </>
    );
}

export default IndexNavbar;