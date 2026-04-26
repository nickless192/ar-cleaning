import React, { useEffect, useMemo, useState } from "react";
import {
    Navbar,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    Container,
    Collapse,
    Badge,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Form,
    Input,
    Button,
} from "reactstrap";
import { useTranslation } from "react-i18next";
import {
    FaBars,
    FaInstagram,
    FaFacebook,
    FaTiktok,
    FaRegEnvelope,
    FaShareAlt,
    FaUser,
    FaSignOutAlt,
    FaTimes
} from "react-icons/fa";



import LoginPage from "/src/components/Pages/UserJourney/LoginPage";

import Auth from "/src/utils/auth";
import { authFetch } from "/src/utils/authFetch";
import logo from "/src/assets/img/cleanar-logo.png";
import logoAvif from "/src/assets/img/optimized/cleanar-logo.avif";
import logoWebp from "/src/assets/img/optimized/cleanar-logo.webp";
import LanguageSwitcher from "/src/components/Pages/Management/LanguageSwitcher";
import NewIconAnimated from "/src/components/Pages/Navigation/NewIconAnimated";
import "/src/assets/css/NavBar.css";

function IndexNavbar() {
    const { t } = useTranslation();

    const [collapseOpen, setCollapseOpen] = useState(false);
    const [navbarColor, setNavbarColor] = useState("navbar-color");

    const [unackCount, setUnackCount] = useState(0);
    const [testerFlag, setTesterFlag] = useState(false);

    // Keep login state reactive (so navbar updates after login/logout)
    const [isLogged, setIsLogged] = useState(Auth.loggedIn());

    // Inline login dropdown state
    const [loginForm, setLoginForm] = useState({ email: "", password: "" });
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginErr, setLoginErr] = useState("");

    const profile = useMemo(() => {
        try {
            return Auth.loggedIn() ? Auth.getProfile()?.data : null;
        } catch {
            return null;
        }
    }, [isLogged]);

    const isAdmin = !!profile?.adminFlag;

    const handleToggle = () => {
        document.documentElement.classList.toggle("nav-open");
        setCollapseOpen((v) => !v);
    };

    const handleNavClick = () => {
        if (collapseOpen) {
            document.documentElement.classList.remove("nav-open");
            setCollapseOpen(false);
        }
    };

    const fetchUnacknowledged = async () => {
        if (!Auth.loggedIn() || !Auth.getProfile()?.data?.adminFlag) {
            return;
        }
        try {
            const response = await authFetch(`/api/quotes/quickquote/unacknowledged`);
            const data = await response.json();
            setUnackCount(data.quotes?.length || 0);
        } catch (err) {
            console.error("Error fetching unacknowledged quotes:", err);
        }
    };

    // Scroll color (keep your behavior)
    useEffect(() => {
        //         console.log("MODE:", import.meta.env.MODE);
        // console.log("DEV:", import.meta.env.DEV);
        const scrollTopVal = 0;
        const updateNavbarColor = () => {
            if (
                document.documentElement.scrollTop > (scrollTopVal - 1) ||
                document.body.scrollTop > (scrollTopVal - 1)
            ) {
                setNavbarColor("navbar-color");
            } else {
                setNavbarColor("navbar-transparent");
            }
        };

        window.addEventListener("scroll", updateNavbarColor);
        return () => {
            window.removeEventListener("scroll", updateNavbarColor);
            document.documentElement.classList.remove("nav-open");
        };
    }, []);

    // Body padding (avoid content hidden under fixed navbar)
    useEffect(() => {
        const navbar = document.querySelector(".navbar");
        if (!navbar) return;

        const applyPadding = () => {
            const h = navbar.offsetHeight || 0;
            document.body.style.paddingTop = `${h}px`;
            document.documentElement.style.setProperty("--navbar-height", `${h}px`);
        };

        applyPadding();

        const ro = new ResizeObserver(applyPadding);
        ro.observe(navbar);

        return () => {
            ro.disconnect();
            document.body.style.paddingTop = "0";
        };
    }, []);

    // Update flags + polling when logged in
    useEffect(() => {
        // setIsLogged(Auth.loggedIn());
        // console.log(Auth.getProfile());
        // console.log("is logged in?", Auth.loggedIn());
        if (isLogged) {
            setTesterFlag(!!Auth.getProfile()?.data?.testerFlag);

            if (Auth.getProfile()?.data?.adminFlag) {
                fetchUnacknowledged();
                const interval = setInterval(fetchUnacknowledged, 30000);
                return () => clearInterval(interval);
            }
        } else {
            setTesterFlag(false);
            setUnackCount(0);
        }
    }, []);

    // React to login/logout from other tabs or Auth.logout()
    useEffect(() => {
        const onStorage = () => setIsLogged(Auth.loggedIn());
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    const doInlineLogin = async (e) => {
        e.preventDefault();
        setLoginErr("");
        setLoginLoading(true);

        try {
            const res = await fetch("/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginForm),
            });

            const payload = await res.json();
            if (!res.ok) {
                throw new Error(payload?.message || "Login failed");
            }

            // Expecting { token, dbUserData } like your controller
            Auth.login(payload.token);
            setIsLogged(true);
            setLoginForm({ email: "", password: "" });
            handleNavClick();
        } catch (err) {
            setLoginErr(err.message || "Login failed");
        } finally {
            setLoginLoading(false);
        }
    };

    return (
        <>
            {collapseOpen && (
                <div
                    id="bodyClick"
                    onClick={() => {
                        document.documentElement.classList.remove("nav-open");
                        setCollapseOpen(false);
                    }}
                />
            )}

            <Navbar className={`mb-0 ${navbarColor}`} expand="sm" role="navigation">
                <Container fluid className="nav-shell navbar-shell">
                    {/* LEFT: Brand */}
                    <NavbarBrand href="/" className="brand navbar-brand-zone" onClick={handleNavClick}>
                        {/* <img src={logo} alt="CleanAR Solutions" className="navbarlogo" /> */}
                        <picture>
                            <source srcSet={logoAvif} type="image/avif" />
                            <source srcSet={logoWebp} type="image/webp" />
                            <img
                                src={logo}
                                alt="CleanAR Solutions"
                                className="navbarlogo"
                                width="53"
                                height="42"
                                loading="eager"
                                fetchPriority="high"
                                decoding="async"
                            />
                        </picture>
                        <span className="brand-text montserrat-bold">CleanAR Solutions</span>
                    </NavbarBrand>

                    <button
                        className={`navbar-toggler cleanar-toggler mobile-menu-toggle ${collapseOpen ? "is-open" : ""}`}
                        type="button"
                        onClick={handleToggle}
                        aria-expanded={collapseOpen}
                        aria-label={collapseOpen ? "Close menu" : "Open menu"}
                    >
                        {collapseOpen ? <FaTimes className="navbar-toggler-icon" /> : <FaBars className="navbar-toggler-icon" />}
                    </button>

                    <Collapse isOpen={collapseOpen} navbar className="nav-collapse">
                        {/* CENTER: primary navigation */}
                        <Nav navbar className="nav-main navbar-main-links" onClick={handleNavClick}>
                            <NavItem>
                                <NavLink href="/about-us">{t("navbar.about_us")}</NavLink>
                            </NavItem>

                            <NavItem>
                                <NavLink href="/products-and-services">
                                    {t("navbar.products_services")}
                                </NavLink>
                            </NavItem>

                            {/* display the blog link only in development environment */}
                            {/* {import.meta.env.DEV && ( */}
                                <NavItem>
                                    <NavLink href="/blog">
                                        {t("navbar.blog")}
                                    </NavLink>
                                </NavItem>
                            {/* )} */}
                        </Nav>


                        {/* FAR RIGHT: Utilities (2 lines) */}
                        {/* Account/Login (NOT far right anymore) */}
                        <div className="nav-account navbar-user-menu">
                            {isLogged ? (
                                <UncontrolledDropdown>
                                    <DropdownToggle nav caret className="account-toggle user-menu-trigger">
                                        <FaUser className="me-2" />
                                        <span className="user-label user-menu-name" title={`${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() || profile?.email || (t("navbar.log_in_signup") || "Account")}>
                                            {profile?.firstName || profile?.email || (t("navbar.log_in_signup") || "Account")}
                                        </span>
                                    </DropdownToggle>
                                    <DropdownMenu end className="user-dropdown-menu">
                                        {isAdmin && (
                                            <DropdownItem href="/admin">
                                                {t("navbar.admin.admin_management")}
                                                {unackCount > 0 && (
                                                    <Badge color="danger" pill className="ms-2">{unackCount}</Badge>
                                                )}
                                            </DropdownItem>
                                        )}
                                        <DropdownItem href="/profile-page">{t("navbar.profile")}</DropdownItem>
                                        <DropdownItem divider />
                                        <DropdownItem
                                            href="/"
                                            onClick={(e) => {
                                                // e.preventDefault();
                                                Auth.logout();
                                                setIsLogged(false);
                                            }}
                                        >
                                            <FaSignOutAlt className="me-2" />
                                            {t("navbar.log_out")}
                                        </DropdownItem>
                                    </DropdownMenu>
                                </UncontrolledDropdown>
                            ) : (
                                // keep your inline login dropdown if you want
                                <UncontrolledDropdown>
                                    <DropdownToggle nav caret className="account-toggle user-menu-trigger">
                                        <FaUser className="me-2" />
                                        <span className="user-label user-menu-name">
                                            {t("login.title") || "Log in"}
                                        </span>
                                    </DropdownToggle>
                                    <DropdownMenu end className="login-dropdown user-dropdown-menu">
                                        <LoginPage />
                                        {/* <div className="px-3 py-2">
                                            <Form onSubmit={doInlineLogin}>
                                                <Input
                                                    type="email"
                                                    placeholder="Email"
                                                    value={loginForm.email}
                                                    onChange={(e) => setLoginForm((p) => ({ ...p, email: e.target.value }))}
                                                    autoComplete="email"
                                                    className="mb-2"
                                                    required
                                                />
                                                <Input
                                                    type="password"
                                                    placeholder="Password"
                                                    value={loginForm.password}
                                                    onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
                                                    autoComplete="current-password"
                                                    className="mb-2"
                                                    required
                                                />
                                                {loginErr && <div className="small text-danger mb-2">{loginErr}</div>}
                                                <Button type="submit" color="primary" className="w-100" disabled={loginLoading}>
                                                    {loginLoading ? "Signing in..." : "Sign in"}
                                                </Button>
                                                <div className="small mt-2 d-flex justify-content-between">
                                                    <a href="/login-signup" onClick={handleNavClick}>Create account</a>
                                                    <a href="/forgot-password" onClick={handleNavClick}>Forgot?</a>
                                                </div>
                                            </Form>
                                        </div> */}
                                    </DropdownMenu>
                                </UncontrolledDropdown>
                            )}
                        </div>
                        <div className="nav-utils navbar-utilities">
                            <div className="utils-lang navbar-language">
                                <LanguageSwitcher />
                                {/* <NewIconAnimated /> */}
                            </div>

                            <div className="utils-social navbar-socials navbar-socials-inline">
                                <NavLink
                                    href="https://www.instagram.com/cleanarsolutions/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Instagram"
                                ><FaInstagram /></NavLink>

                                <NavLink
                                    href="https://www.facebook.com/share/18X3sPR1vf/?mibextid=wwXIfr"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Facebook"
                                ><FaFacebook /></NavLink>

                                <NavLink
                                    href="https://www.tiktok.com/@cleanar.solutions"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="TikTok"
                                ><FaTiktok /></NavLink>

                                <NavLink href="mailto:info@cleanARsolutions.ca" aria-label="Email">
                                    <FaRegEnvelope />
                                </NavLink>
                            </div>

                            <UncontrolledDropdown className="navbar-socials navbar-socials-compact">
                                <DropdownToggle nav caret className="connect-toggle" aria-label="Connect links">
                                    <FaShareAlt className="me-2" />
                                    <span>Connect</span>
                                </DropdownToggle>
                                <DropdownMenu end>
                                    <DropdownItem
                                        href="https://www.instagram.com/cleanarsolutions/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <FaInstagram className="me-2" />
                                        Instagram
                                    </DropdownItem>
                                    <DropdownItem
                                        href="https://www.facebook.com/share/18X3sPR1vf/?mibextid=wwXIfr"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <FaFacebook className="me-2" />
                                        Facebook
                                    </DropdownItem>
                                    <DropdownItem
                                        href="https://www.tiktok.com/@cleanar.solutions"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <FaTiktok className="me-2" />
                                        TikTok
                                    </DropdownItem>
                                    <DropdownItem href="mailto:info@cleanARsolutions.ca">
                                        <FaRegEnvelope className="me-2" />
                                        Email
                                    </DropdownItem>
                                </DropdownMenu>
                            </UncontrolledDropdown>
                        </div>
                    </Collapse>

                </Container>
            </Navbar>
        </>
    );
}

export default IndexNavbar;
