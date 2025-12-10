import React from "react";
import { useEffect, useState, useRef } from "react";
import Auth from "/src/utils/auth";
import { useTranslation } from "react-i18next";
// reactstrap components
import {
  Container,
  Popover,
  PopoverBody
} from "reactstrap";

import {
  Button,
  Form,
  Row,
  Col
} from "react-bootstrap";

import { FaQuestionCircle } from "react-icons/fa";
import pageBg from "/src/assets/img/bg1.png";

// core components

function SignUp({ focus }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    howDidYouHearAboutUs: "",
    howDidYouHearAboutUsSupport: "",
    telephone: "",
    username: "",
    password: "",
    termsConsent: false
  });
  const { t } = useTranslation();

  const emailRef = useRef(null);

  useEffect(() => {
    if (focus && emailRef.current) {
      emailRef.current.focus();
    }
  }, [focus]);

  const [popoverOpen, setPopoverOpen] = useState({
    firstName: false,
    lastName: false,
    email: false,
    telephone: false,
    username: false,
    password: false,
    howDidYouHearAboutUs: false,
    howDidYouHearAboutUsSupport: false
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
    const cleanedData = Object.fromEntries(
      Object.entries(formData).map(([key, val]) => [
        key,
        typeof val === "string" ? val.trim() : val
      ])
    );
    console.log(cleanedData);
    if (
      cleanedData.firstName &&
      cleanedData.lastName &&
      cleanedData.email &&
      cleanedData.username &&
      cleanedData.password &&
      cleanedData.telephone &&
      cleanedData.termsConsent
    ) {
      try {
        const response = await fetch(`/api/users/`, {
          method: "post",
          body: JSON.stringify(formData),
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          const data = await response.json();

          const emailResponse = await fetch(`/api/email/new-user`, {
            method: "post",
            body: JSON.stringify({
              email: formData.email,
              user: data.dbUserData
            }),
            headers: {
              "Content-Type": "application/json"
            }
          });

          if (!emailResponse.ok) {
            alert(emailResponse.statusText);
          }

          const emailNotificationResponse = await fetch(
            `/api/email/new-user-notification`,
            {
              method: "post",
              body: JSON.stringify({
                email: formData.email,
                user: data.dbUserData
              }),
              headers: {
                "Content-Type": "application/json"
              }
            }
          );

          if (!emailNotificationResponse.ok) {
            alert(emailNotificationResponse.statusText);
          }

          Auth.login(data.token, data.dbUserData.adminFlag);
        } else {
          alert(t("signup.alerts.username_taken"));
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      alert(t("signup.alerts.missing_fields"));
    }
  };

  // Define transition props for Popover to avoid warning
  const transitionProps = {
    timeout: 150
  };

  const handleChange = (event) => {
    event.preventDefault();
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    document.body.classList.add("signup-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    return function cleanup() {
      document.body.classList.remove("signup-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  return (
    <>
      <div
        className="content content-border bg-light"
        style={{ backgroundImage: `url(${pageBg})`, backgroundSize: "cover" }}
      >
        <h1 className="title secondary-color text-center montserrat-bold">
          {t("signup.title")}
        </h1>
        <Container className="container">
          <p className="text-center text-cleanar-color text-bold">
            {t("signup.description")}
          </p>

          <Form className="form" onSubmit={handleFormSubmit}>
            {/* Email */}
            <Row className="justify-content-center">
              <Col md="10" xs="10" className="py-1">
                <Form.Group controlId="signupEmail">
                  <Form.Label className="text-cleanar-color">
                    {t("signup.form_labels.email")}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t("signup.form_labels.email")}
                    className="text-cleanar-color form-input rounded-pill"
                    name="email"
                    ref={emailRef}
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md="1" xs="1" className="py-1">
                <FaQuestionCircle
                  id="Popover3"
                  onClick={() => togglePopover("email")}
                />
                <Popover
                  placement="right"
                  isOpen={popoverOpen.email}
                  target="Popover3"
                  toggle={() => togglePopover("email")}
                  transition={transitionProps}
                >
                  <PopoverBody>{t("signup.tooltips.email")}</PopoverBody>
                </Popover>
              </Col>
            </Row>

            {/* First name */}
            <Row className="justify-content-center">
              <Col md="10" xs="10" className="py-1">
                <Form.Group controlId="signupFirstName">
                  <Form.Label className="text-cleanar-color">
                    {t("signup.form_labels.first_name")}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t("signup.form_labels.first_name")}
                    className="form-input text-cleanar-color rounded-pill"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md="1" xs="1" className="py-1">
                <FaQuestionCircle
                  id="Popover1"
                  onClick={() => togglePopover("firstName")}
                />
                <Popover
                  placement="right"
                  isOpen={popoverOpen.firstName}
                  target="Popover1"
                  toggle={() => togglePopover("firstName")}
                  transition={transitionProps}
                >
                  <PopoverBody>{t("signup.tooltips.first_name")}</PopoverBody>
                </Popover>
              </Col>
            </Row>

            {/* Last name */}
            <Row className="justify-content-center">
              <Col md="10" xs="10" className="py-1">
                <Form.Group controlId="signupLastName">
                  <Form.Label className="text-cleanar-color">
                    {t("signup.form_labels.last_name")}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t("signup.form_labels.last_name")}
                    className="text-cleanar-color form-input rounded-pill"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md="1" xs="1" className="py-1">
                <FaQuestionCircle
                  id="Popover2"
                  onClick={() => togglePopover("lastName")}
                />
                <Popover
                  placement="right"
                  isOpen={popoverOpen.lastName}
                  target="Popover2"
                  toggle={() => togglePopover("lastName")}
                  transition={transitionProps}
                >
                  <PopoverBody>{t("signup.tooltips.last_name")}</PopoverBody>
                </Popover>
              </Col>
            </Row>

            {/* Telephone */}
            <Row className="justify-content-center">
              <Col md="10" xs="10" className="py-1">
                <Form.Group controlId="signupTelephone">
                  <Form.Label className="text-cleanar-color">
                    {t("signup.form_labels.telephone")}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t("signup.form_labels.telephone")}
                    className="text-cleanar-color form-input rounded-pill"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md="1" xs="1" className="py-1">
                <FaQuestionCircle
                  id="Popover4"
                  onClick={() => togglePopover("telephone")}
                />
                <Popover
                  placement="right"
                  isOpen={popoverOpen.telephone}
                  target="Popover4"
                  toggle={() => togglePopover("telephone")}
                  transition={transitionProps}
                >
                  <PopoverBody>{t("signup.tooltips.telephone")}</PopoverBody>
                </Popover>
              </Col>
            </Row>

            {/* Username */}
            <Row className="justify-content-center">
              <Col md="10" xs="10" className="py-1">
                <Form.Group controlId="signupUsername">
                  <Form.Label className="text-cleanar-color">
                    {t("signup.form_labels.username")}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t("signup.form_labels.username")}
                    className="text-cleanar-color form-input rounded-pill"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md="1" xs="1" className="py-1">
                <FaQuestionCircle
                  id="Popover5"
                  onClick={() => togglePopover("username")}
                />
                <Popover
                  placement="right"
                  isOpen={popoverOpen.username}
                  target="Popover5"
                  toggle={() => togglePopover("username")}
                  transition={transitionProps}
                >
                  <PopoverBody>{t("signup.tooltips.username")}</PopoverBody>
                </Popover>
              </Col>
            </Row>

            {/* Password */}
            <Row className="justify-content-center">
              <Col md="10" xs="10" className="py-1">
                <Form.Group controlId="signupPassword">
                  <Form.Label className="text-cleanar-color">
                    {t("signup.form_labels.password")}
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder={t("signup.form_labels.password")}
                    className="text-cleanar-color form-input rounded-pill"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md="1" xs="1" className="py-1">
                <FaQuestionCircle
                  id="Popover6"
                  onClick={() => togglePopover("password")}
                />
                <Popover
                  placement="right"
                  isOpen={popoverOpen.password}
                  target="Popover6"
                  toggle={() => togglePopover("password")}
                  transition={transitionProps}
                >
                  <PopoverBody>{t("signup.tooltips.password")}</PopoverBody>
                </Popover>
              </Col>
            </Row>

            {/* How did you hear about us */}
            <Row className="justify-content-center">
              <Col md="10" xs="10" className="py-1">
                <Form.Group controlId="signupHowHeard">
                  <Form.Label className="text-cleanar-color">
                    {t("signup.form_labels.how_heard")}
                  </Form.Label>
                  <Form.Select
                    type="select"
                    placeholder={t("signup.form_labels.how_heard")}
                    className="text-cleanar-color form-input rounded-pill"
                    name="howDidYouHearAboutUs"
                    value={formData.howDidYouHearAboutUs}
                    onChange={handleChange}
                  >
                    <option value="">
                      {t("signup.form_labels.how_heard")}
                    </option>
                    <option value="Google">
                      {t("signup.dropdown_options.google")}
                    </option>
                    <option value="Facebook">
                      {t("signup.dropdown_options.facebook")}
                    </option>
                    <option value="Instagram">
                      {t("signup.dropdown_options.instagram")}
                    </option>
                    <option value="Referral">
                      {t("signup.dropdown_options.referral")}
                    </option>
                    <option value="Other">
                      {t("signup.dropdown_options.other")}
                    </option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md="1" xs="1" className="py-1">
                <FaQuestionCircle
                  id="Popover7"
                  onClick={() => togglePopover("howDidYouHearAboutUs")}
                />
                <Popover
                  placement="right"
                  isOpen={popoverOpen.howDidYouHearAboutUs}
                  target="Popover7"
                  toggle={() => togglePopover("howDidYouHearAboutUs")}
                  transition={transitionProps}
                >
                  <PopoverBody>{t("signup.tooltips.how_heard")}</PopoverBody>
                </Popover>
              </Col>
            </Row>

            {/* Conditional fields for Referral / Other */}
            <Row className="justify-content-center">
              {formData.howDidYouHearAboutUs === "Referral" && (
                <>
                  <Col md="10" xs="10" className="py-1">
                    <Form.Group controlId="signupReferral">
                      <Form.Label className="text-cleanar-color">
                        {t("signup.form_labels.referral")}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder={t("signup.form_labels.referral")}
                        className="text-cleanar-color form-input rounded-pill"
                        name="howDidYouHearAboutUs"
                        value={formData.howDidYouHearAboutUsSupport}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md="1" xs="1" className="py-1">
                    <FaQuestionCircle
                      id="Popover8"
                      onClick={() =>
                        togglePopover("howDidYouHearAboutUsSupport")
                      }
                    />
                    <Popover
                      placement="right"
                      isOpen={popoverOpen.howDidYouHearAboutUsSupport}
                      target="Popover8"
                      toggle={() =>
                        togglePopover("howDidYouHearAboutUsSupport")
                      }
                      transition={transitionProps}
                    >
                      <PopoverBody>{t("signup.tooltips.referral")}</PopoverBody>
                    </Popover>
                  </Col>
                </>
              )}

              {formData.howDidYouHearAboutUs === "Other" && (
                <>
                  <Col md="10" xs="10" className="py-1">
                    <Form.Group controlId="signupOtherSource">
                      <Form.Label className="text-cleanar-color">
                        {t("signup.form_labels.please_specify")}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder={t("signup.form_labels.please_specify")}
                        className="text-cleanar-color form-input rounded-pill"
                        name="howDidYouHearAboutUs"
                        value={formData.howDidYouHearAboutUsSupport}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md="1" xs="1" className="py-1">
                    <FaQuestionCircle
                      id="Popover9"
                      onClick={() =>
                        togglePopover("howDidYouHearAboutUsSupport")
                      }
                    />
                    <Popover
                      placement="right"
                      isOpen={popoverOpen.howDidYouHearAboutUsSupport}
                      target="Popover9"
                      toggle={() =>
                        togglePopover("howDidYouHearAboutUsSupport")
                      }
                      transition={transitionProps}
                    >
                      <PopoverBody>{t("signup.tooltips.how_heard")}</PopoverBody>
                    </Popover>
                  </Col>
                </>
              )}
            </Row>

            {/* Terms & conditions */}
            <Row className="justify-content-center">
              <Col md="10" xs="10" className="py-1">
                <Form.Group controlId="termsCheckbox" className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="termsConsent"
                    value={formData.termsConsent}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        termsConsent: e.target.checked
                      })
                    }
                    label={
                      <>
                        {t("signup.form_labels.agree")}{" "}
                        <a
                          href="/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t("footer.terms")}
                        </a>{" "}
                        &{" "}
                        <a
                          href="/privacy-policy"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t("footer.privacy_policy")}
                        </a>
                        .
                      </>
                    }
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Submit button */}
            <Row className="justify-content-center">
              <Col md="10" xs="10" className="py-3">
                <Button
                  className="btn-round light-bg-color rounded-pill"
                  type="submit"
                  data-track="signup"
                  size="lg"
                >
                  {t("signup.button")}
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>
    </>
  );
}

export default SignUp;
