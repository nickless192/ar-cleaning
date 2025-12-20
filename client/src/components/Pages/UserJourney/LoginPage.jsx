import React from "react";
import { useEffect, useState, useRef } from "react";
import Auth from "/src/utils/auth";
import { useTranslation } from "react-i18next";
import VisitorCounter from "/src/components/Pages/Management/VisitorCounter";

// reactstrap components
import {
  Row,
  Col,
  Popover,
  PopoverBody
} from "reactstrap";

import {
  Button,
  Form,
  Container,
  Spinner
} from "react-bootstrap";

import { FaQuestionCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import pageBg from "/src/assets/img/bg1.png";

function LoginPage({ focus }) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [emailPrefilled, setEmailPrefilled] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [isMagicSending, setIsMagicSending] = useState(false);


  const passwordRef = useRef(null);

  const emailRef = useRef(null);

  // useEffect(() => {
  //   if (focus && emailRef.current) {
  //     emailRef.current.focus();
  //   }
  // }, [focus]);
  useEffect(() => {
    if (emailPrefilled && passwordRef.current) {
      // Email was auto-loaded, go straight to password
      passwordRef.current.focus();
    } else if (!emailPrefilled && focus && emailRef.current) {
      // Normal behavior when no saved email
      emailRef.current.focus();
    }
  }, [emailPrefilled, focus]);

  const handleClearRememberedEmail = () => {
    localStorage.removeItem("remembered_email");
    setFormData((prev) => ({
      ...prev,
      email: "",
      rememberMe: false,
    }));
    setEmailPrefilled(false);
    if (emailRef.current) {
      emailRef.current.focus();
    }
  };

  const handleMagicLink = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setInfoMessage("");

    if (!formData.email) {
      setErrorMessage(
        t(
          "login.alerts.missing_email_magic",
          "Please enter your email to receive a login link."
        )
      );
      return;
    }

    setIsMagicSending(true);
    try {
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email.trim() }),
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        setInfoMessage(
          data.message ||
          t(
            "login.magic_link_sent",
            "We sent you a login link. Please check your email."
          )
        );
      } else if (response.status === 404) {
        setErrorMessage(t("login.alerts.email_not_found"));
      } else {
        setErrorMessage(t("login.alerts.generic_error"));
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(t("login.alerts.generic_error"));
    } finally {
      setIsMagicSending(false);
    }
  };



  const [popoverOpen, setPopoverOpen] = useState({
    email: false,
    password: false,
  });

  const togglePopover = (field) => {
    setPopoverOpen((prevState) => {
      const newState = Object.keys(prevState).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {});

      return { ...newState, [field]: !prevState[field] };
    });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (formData.email && formData.password) {
      setIsSubmitting(true);
      await fetch("/api/users/login/", {
        method: "post",
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            response.json().then((data) => {
              Auth.login(data.token, data.dbUserData.adminFlag, {
                rememberMe: formData.rememberMe,
              });
              // ✅ store or clear remembered email
              if (formData.rememberMe) {
                localStorage.setItem("remembered_email", formData.email.trim());
              } else {
                localStorage.removeItem("remembered_email");
              }
            });
          } else {
            if (response.status === 404) {
              setErrorMessage(t("login.alerts.email_not_found"));
            } else if (response.status === 401) {
              setErrorMessage(t("login.alerts.wrong_password"));
            } else {
              setErrorMessage(t("login.alerts.generic_error"));
            }
          }
        })
        .catch((err) => {
          console.log(err);
          setErrorMessage(t("login.alerts.generic_error"));
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    } else {
      setErrorMessage(t("login.alerts.missing_credentials"));
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    if (formData.email) {
      await fetch("/api/email/request-password-reset", {
        method: "post",
        body: JSON.stringify({ email: formData.email }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            response.json().then((data) => {
              alert(data.message);
            });
          } else {
            if (response.status === 404) {
              setErrorMessage(t("login.alerts.email_not_found"));
            } else {
              setErrorMessage(t("login.alerts.generic_error"));
            }
          }
        })
        .catch((err) => {
          console.log(err);
          setErrorMessage(t("login.alerts.generic_error"));
        });
    } else {
      setErrorMessage(t("login.alerts.missing_email_reset"));
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const transitionProps = {
    timeout: 150,
  };

  useEffect(() => {
    document.body.classList.add("login-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    document.body.scrollTop = 0;
    return function cleanup() {
      document.body.classList.remove("login-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("remembered_email");
    if (rememberedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true,
      }));
      setEmailPrefilled(true);
    }
  }, []);


  return (
    <>
      <VisitorCounter page={"login-page"} />
      <div
        className=" bg-light "
      // style={{ backgroundImage: `url(${pageBg})`, backgroundSize: "cover" }}
      >
        {/* <h1 className="title primary-color text-center montserrat-bold">
          {t("login.title")}
        </h1> */}
        <Container className="container">
          {/* <p className="text-cleanar-color text-bold text-center">
            {t("login.description")}
          </p> */}

          {errorMessage && (
            <p className="text-danger text-center mb-2">{errorMessage}</p>
          )}

          <Form onSubmit={handleFormSubmit}>
            {/* Email */}
            <Row className="justify-content-center">
              <Col className="py-1" md="12" xs="12">
                <Form.Group controlId="loginEmail">
                  <Form.Label className="text-cleanar-color">
                    {t("login.email_label")} {' '}
                    <FaQuestionCircle
                      onClick={() => togglePopover("email")}
                      id="Tooltip1"
                    />
                    <Popover
                      placement="top"
                      isOpen={popoverOpen.email}
                      target="Tooltip1"
                      toggle={() => togglePopover("email")}
                      transition={transitionProps}
                    >
                      <PopoverBody>{t("login.email_tooltip")}</PopoverBody>
                    </Popover>
                  </Form.Label>


                  <Form.Control
                    type="email"
                    className="form-input rounded-pill text-cleanar-color"
                    placeholder=""
                    ref={emailRef}
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                </Form.Group>
                {emailPrefilled && (
                  // <div className="text-end mt-1">
                  <a
                    // variant="link"
                    // type="button"
                    href="#"
                    className="p-0 small"
                    tabIndex="999"
                    onClick={handleClearRememberedEmail}
                  >
                    {t("login.clear_saved_email", "Not you? Clear saved email")}
                  </a>
                  // </div>
                )}
              </Col>
              {/* <Col className="py-1" md="1" xs="1">
                <FaQuestionCircle
                  onClick={() => togglePopover("email")}
                  id="Tooltip1"
                />
                <Popover
                  placement="top"
                  isOpen={popoverOpen.email}
                  target="Tooltip1"
                  toggle={() => togglePopover("email")}
                  transition={transitionProps}
                >
                  <PopoverBody>{t("login.email_tooltip")}</PopoverBody>
                </Popover>
              </Col> */}
            </Row>

            {/* Password */}
            <Row className="justify-content-center">
              <Col className="py-1" md="12" xs="12">
                <Form.Group controlId="loginPassword">
                  <Form.Label className="text-cleanar-color">
                    {t("login.password_label")} {' '}
                    <FaQuestionCircle
                      id="Tooltip2"
                      onClick={() => togglePopover("password")}
                    />
                    <Popover
                      placement="top"
                      isOpen={popoverOpen.password}
                      target="Tooltip2"
                      toggle={() => togglePopover("password")}
                      transition={transitionProps}
                    >
                      <PopoverBody>{t("login.password_tooltip")}</PopoverBody>
                    </Popover>
                  </Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder=""
                      ref={passwordRef}
                      className="form-input rounded-pill text-cleanar-color pe-5"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                    />
                    <span
                      className="position-absolute top-50 end-0 translate-middle-y me-3"
                      style={{
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "1.75rem",
                        height: "1.75rem",
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setShowPassword((prev) => !prev);
                      }}
                      aria-label={
                        showPassword
                          ? t("login.hide_password", "Hide password")
                          : t("login.show_password", "Show password")
                      }
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </Form.Group>
              </Col>
              {/* <Col className="py-1" md="1" xs="1">
                <FaQuestionCircle
                  id="Tooltip2"
                  onClick={() => togglePopover("password")}
                />
                <Popover
                  placement="top"
                  isOpen={popoverOpen.password}
                  target="Tooltip2"
                  toggle={() => togglePopover("password")}
                  transition={transitionProps}
                >
                  <PopoverBody>{t("login.password_tooltip")}</PopoverBody>
                </Popover>
              </Col> */}
            </Row>

            {/* Remember me */}
            <Row className="justify-content-center mt-2">
              <Col md="12" xs="10">
                <Form.Check
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  label={t(
                    "login.remember_me_label",
                    "Remember me on this device"
                  )}
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
              </Col>
            </Row>

            {/* Buttons */}
            <Row className="justify-content-center mt-3">
              <Col className="py-1" md="12" xs="12">
                <Button
                  className="btn  primary-bg-color"
                  type="submit"
                  data-track="login"
                  // size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        className="me-2"
                      />
                      {t("login.logging_in", "Logging in...")}
                    </>
                  ) : (
                    t("login.login_button")
                  )}
                </Button>
              </Col>
              {/* <Col className="py-1" md="8" xs="12">
                <Button
                  className="btn-info "
                  type="button"
                  data-track="reset-password"
                  onClick={handleResetPassword}
                >
                  {t("login.reset_password_button")}
                </Button>
              </Col> */}
            </Row>
            <div className="small mt-2 d-flex justify-content-between">
              <a href="/signup-page">Create account</a>
              <a href="#" onClick={handleResetPassword}>Forgot your password?</a>
            </div>
            {/* <Row className="justify-content-center mt-2">
  <Col md="12" xs="10" className="text-center">
    <Button
      variant="outline-secondary"
      type="button"
      size="sm"
      onClick={handleMagicLink}
      disabled={isMagicSending || isSubmitting}
    >
      {isMagicSending
        ? t("login.sending_magic_link", "Sending magic link...")
        : t("login.magic_link_button", "Send me a magic login link")}
    </Button>
  </Col>
</Row> */}

          </Form>
        </Container>
      </div>
    </>
  );
}

export default LoginPage;
