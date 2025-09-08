import React from "react";
import { useEffect, useState } from "react";
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
  FloatingLabel,
  Row,
  Col
} from 'react-bootstrap';

import { FaQuestionCircle } from 'react-icons/fa';
import pageBg from "/src/assets/img/bg1.png";

// core components

function SignUp() {
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

  const [popoverOpen, setPopoverOpen] = useState({
    firstName: false,
    lastName: false,
    email: false,
    telephone: false,
    username: false,
    password: false
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

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const cleanedData = Object.fromEntries(
      Object.entries(formData).map(([key, val]) => [key, val.trim()])
    );

    if (cleanedData.firstName &&
      cleanedData.lastName &&
      cleanedData.email &&
      cleanedData.username &&
      cleanedData.password &&
      cleanedData.telephone &&
      cleanedData.termsConsent) {
      try {
        const response = await fetch(`/api/users/`, {
          method: 'post',
          body: JSON.stringify(formData),
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          // console.log("New account created!");
          const data = await response.json();

          // Call API to notify user of account creation
          const emailResponse = await fetch(`/api/email/new-user`, {
            method: 'post',
            body: JSON.stringify({ email: formData.email, user: data.dbUserData }),
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (emailResponse.ok) {
            // console.log("Notification sent!");
            // const emailData = await emailResponse.json();
            // console.log(emailData);
          } else {
            alert(emailResponse.statusText);
          }

          const emailNotificationResponse = await fetch(`/api/email/new-user-notification`, {
            method: 'post',
            body: JSON.stringify({ email: formData.email, user: data.dbUserData }),
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (emailNotificationResponse.ok) {
            // console.log("Notification sent!");
            // const emailData = await emailNotificationResponse.json();
            // console.log(emailData);
          } else {
            alert(emailNotificationResponse.statusText);
          }

          // Now call Auth.login after the email has been sent
          Auth.login(data.token);

        } else {
          // alert(response.statusText);
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
    timeout: 150 // Set a timeout value for the transition (in milliseconds)
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
      {/* <Navbar /> */}
      {/* <div className="section section-signup light-blue-bg-color pb-0 mb-0"> */}
      <div className="content content-border bg-light" style={{ backgroundImage: `url(${pageBg})`, backgroundSize: 'cover' }}>
        <h1 className="title secondary-color text-center montserrat-bold">{t("signup.title")}</h1>
        <Container className="container">
          <p className="text-center text-cleanar-color text-bold">{t("signup.description")}</p>

          <Form className="form" onSubmit={(e) => handleFormSubmit(e)}>
            <Row className="justify-content-center">
              <Col md='10' xs='10' className="py-1">
                <FloatingLabel
                  controlId="floatingFirstName"
                  label={`${t("signup.form_labels.first_name")}`}
                  className="text-cleanar-color"
                >
                  <Form.Control
                    type="text"
                    placeholder={t("signup.form_labels.first_name")}
                    className="form-input text-cleanar-color rounded-pill"
                    name="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleChange(e)}
                  />
                </FloatingLabel>
              </Col>
              <Col md='1' xs='1' className="py-1">
                <FaQuestionCircle
                  id="Popover1"
                />
                {/* <Button id="Popover1" type="button" tabIndex='-1' className="btn-round btn-icon">
                </Button> */}
                <Popover placement="right" isOpen={popoverOpen.firstName} target="Popover1" toggle={() => togglePopover('firstName')}
                  transition={transitionProps}
                >
                  <PopoverBody>
                    {t("signup.tooltips.first_name")}
                  </PopoverBody>
                </Popover>
              </Col>
            </Row>
            <Row className="justify-content-center">
              <Col md='10' xs='10' className="py-1">
                <FloatingLabel
                  controlId="floatingLastName"
                  label={`${t("signup.form_labels.last_name")}`}
                  className="text-cleanar-color"
                >
                  <Form.Control
                    type="text"
                    placeholder={t("signup.form_labels.last_name")}
                    className="text-cleanar-color form-input rounded-pill"
                    name="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleChange(e)}
                  />
                </FloatingLabel>
              </Col>
              <Col md='1' xs='1' className="py-1">
                {/* <Button id="Popover2" type="button" tabIndex='-1' className="btn-round btn-icon"> */}
                <FaQuestionCircle id="Popover2" />
                {/* </Button> */}
                <Popover placement="right" isOpen={popoverOpen.lastName} target="Popover2" toggle={() => togglePopover('lastName')}
                  transition={transitionProps}
                >
                  <PopoverBody>
                    {t("signup.tooltips.last_name")}
                  </PopoverBody>
                </Popover>
              </Col>
            </Row>
            <Row className="justify-content-center">
              <Col md='10' xs='10' className="py-1">
                <FloatingLabel
                  controlId="floatingEmail"
                  label={`${t("signup.form_labels.email")}`}
                  className="text-cleanar-color"
                >
                  <Form.Control
                    type="text"
                    placeholder={t("signup.form_labels.email")}
                    className="text-cleanar-color form-input rounded-pill"
                    name="email"
                    value={formData.email}
                    onChange={(e) => handleChange(e)}
                  />
                </FloatingLabel>
              </Col>
              <Col md='1' xs='1' className="py-1">
                {/* <Button id="Popover3" type="button" tabIndex='-1' className="btn-round btn-icon"> */}
                <FaQuestionCircle id="Popover3" />
                {/* </Button> */}
                <Popover placement="right" isOpen={popoverOpen.email} target="Popover3" toggle={() => togglePopover('email')}
                  transition={transitionProps}
                >
                  <PopoverBody>
                    {t("signup.tooltips.email")}
                  </PopoverBody>
                </Popover>
              </Col>
            </Row>
            <Row className="justify-content-center">
              <Col md='10' xs='10' className="py-1">
                <FloatingLabel
                  controlId="floatingTelephone"
                  label={`${t("signup.form_labels.telephone")}`}
                  className="text-cleanar-color"
                >
                  <Form.Control
                    type="text"
                    placeholder={t("signup.form_labels.telephone")}
                    className="text-cleanar-color form-input rounded-pill"
                    name="telephone"
                    value={formData.telephone}
                    onChange={(e) => handleChange(e)}
                  />
                </FloatingLabel>
              </Col>
              <Col md='1' xs='1' className="py-1">
                {/* <Button id="Popover4" type="button" tabIndex='-1' className="btn-round btn-icon"> */}
                <FaQuestionCircle id="Popover4" />
                {/* </Button> */}
                <Popover placement="right" isOpen={popoverOpen.telephone} target="Popover4" toggle={() => togglePopover('telephone')}
                  transition={transitionProps}
                >
                  <PopoverBody>
                    {t("signup.tooltips.telephone")}
                  </PopoverBody>
                </Popover>
              </Col>
            </Row>
            <Row className="justify-content-center">
              <Col md='10' xs='10' className="py-1">
                <FloatingLabel
                  controlId="floatingUsername"
                  label={`${t("signup.form_labels.username")}`}
                  className="text-cleanar-color"
                >
                  <Form.Control
                    type="text"
                    placeholder={t("signup.form_labels.username")}
                    className="text-cleanar-color form-input rounded-pill"
                    name="username"
                    value={formData.username}
                    onChange={(e) => handleChange(e)}
                  />
                </FloatingLabel>
              </Col>
              <Col md='1' xs='1' className="py-1">
                {/* <Button id="Popover5" type="button" tabIndex='-1' className="btn-round btn-icon"> */}
                <FaQuestionCircle id="Popover5" />
                {/* </Button> */}
                <Popover placement="right" isOpen={popoverOpen.username} target="Popover5" toggle={() => togglePopover('username')}
                  transition={transitionProps}
                >
                  <PopoverBody>
                    {t("signup.tooltips.username")}
                  </PopoverBody>
                </Popover>
              </Col>
            </Row>
            <Row className="justify-content-center">
              <Col md='10' xs='10' className="py-1">
                <FloatingLabel
                  controlId="floatingPasswordSignUp"
                  label={`${t("signup.form_labels.password")}`}
                  className="text-cleanar-color"
                >
                  <Form.Control
                    type="password"
                    placeholder={t("signup.form_labels.password")}
                    className="text-cleanar-color form-input rounded-pill"
                    name="password"
                    value={formData.password}
                    onChange={(e) => handleChange(e)}
                  />
                </FloatingLabel>
              </Col>
              <Col md='1' xs='1' className="py-1">
                {/* <Button id="Popover6" type="button" tabIndex='-1' className="btn-round btn-icon"> */}
                <FaQuestionCircle id="Popover6" />
                {/* </Button> */}
                <Popover placement="right" isOpen={popoverOpen.password} target="Popover6" toggle={() => togglePopover('password')}
                  transition={transitionProps}
                >
                  <PopoverBody>
                    {t("signup.tooltips.password")}
                  </PopoverBody>
                </Popover>
              </Col>
            </Row>
            <Row className="justify-content-center">
              <Col md='10' xs='10' className="py-1">
                <FloatingLabel
                  controlId="floatingHowDidYouHearAboutUs"
                  label={`${t("signup.form_labels.how_heard")}`}
                  className="text-cleanar-color"
                >
                  <Form.Select
                    type="select"
                    placeholder={t("signup.form_labels.how_heard")}
                    className="text-cleanar-color form-input  rounded-pill"
                    name="howDidYouHearAboutUs"
                    value={formData.howDidYouHearAboutUs}
                    onChange={(e) => handleChange(e)}
                  >
                    <option value="">{t("signup.form_labels.how_heard")}</option>
                    <option value="Google">{t("signup.dropdown_options.google")}</option>
                    <option value="Facebook">{t("signup.dropdown_options.facebook")}</option>
                    <option value="Instagram">{t("signup.dropdown_options.instagram")}</option>
                    <option value="Referral">{t("signup.dropdown_options.referral")}</option>
                    <option value="Other">{t("signup.dropdown_options.other")}</option>
                  </Form.Select>
                </FloatingLabel>
              </Col>
              <Col md='1' xs='1 ' className="py-1">
                {/* <Button id="Popover7" type="button" tabIndex='-1' className="btn-round btn-icon"> */}
                <FaQuestionCircle id="Popover7" />
                {/* </Button> */}
                <Popover placement="right" isOpen={popoverOpen.howDidYouHearAboutUs} target="Popover7" toggle={() => togglePopover('howDidYouHearAboutUs')}
                  transition={transitionProps}
                >
                  <PopoverBody>
                    {t("signup.tooltips.how_heard")}
                  </PopoverBody>
                </Popover>
              </Col>
            </Row>
            <Row className="justify-content-center">
              {/* if the user selected other, then render the box to enter the source. if they select referral, another box renders that allows to enter who referred them */}
              {formData.howDidYouHearAboutUs === 'Referral' ? (
                <>
                  <Col md='10' xs='10' className="py-1">
                    <FloatingLabel
                      controlId="floatingReferral"
                      label={t("signup.form_labels.referral")}
                      className="text-cleanar-color"
                    >
                      <Form.Control
                        type="text"
                        placeholder={t("signup.form_labels.referral")}
                        className="text-cleanar-color form-input  rounded-pill"
                        name="howDidYouHearAboutUs"
                        value={formData.howDidYouHearAboutUsSupport}
                        onChange={(e) => handleChange(e)}
                      />
                    </FloatingLabel>
                  </Col>
                  <Col md='1' xs='1' className="py-1">
                    {/* <Button id="Popover8" type="button" tabIndex='-1' className="btn-round btn-icon"> */}
                    <FaQuestionCircle
                      id="Popover8"
                    />
                    {/* </Button> */}
                    <Popover placement="right" isOpen={popoverOpen.howDidYouHearAboutUsSupport} target="Popover8" toggle={() => togglePopover('howDidYouHearAboutUsSupport')}
                      transition={transitionProps}
                    >
                      <PopoverBody>
                        {t("signup.tooltips.referral")}
                      </PopoverBody>
                    </Popover>
                  </Col>
                </>
              ) : null
              }
              {formData.howDidYouHearAboutUs === 'Other' ? (
                <>

                  <Col md='10' xs='10' className="py-1">
                    <FloatingLabel
                      controlId="floatingOther"
                      label={t("signup.form_labels.please_specify")}
                      className="text-cleanar-color"
                    >
                      <Form.Control
                        type="text"
                        placeholder={t("signup.form_labels.please_specify")}
                        className="text-cleanar-color form-input  rounded-pill"
                        name="howDidYouHearAboutUs"
                        value={formData.howDidYouHearAboutUsSupport}
                        onChange={(e) => handleChange(e)}
                      />
                    </FloatingLabel>
                  </Col>
                  <Col md='1' xs='1'>
                    <FaQuestionCircle id="Popover9" />
                    <Popover placement="right" isOpen={popoverOpen.howDidYouHearAboutUsSupport} target="Popover9" toggle={() => togglePopover('howDidYouHearAboutUsSupport')}
                      transition={transitionProps}
                    >
                      <PopoverBody>
                        {t("signup.tooltips.how_heard")}
                      </PopoverBody>
                    </Popover>
                  </Col>
                </>
              ) : null
              }

            </Row>
            <Row className="justify-content-center">
              <Col md='10' xs='10' className="py-1">
                <Form.Group controlId="termsCheckbox" className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="termsConsent"
                    value={formData.termsConsent}
                    label={
                      <>
                        {t("signup.form_labels.agree")}{" "}
                        <a href="/terms" target="_blank" rel="noopener noreferrer">
                          {t("footer.terms")}
                        </a>{" "}
                        &{" "}
                        <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
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
            <Row className="justify-content-center">
              <Col md='6' xs='6' className="py-3">
                <Button
                  className="btn-round light-bg-color rounded-pill"
                  type="submit"
                  data-track="signup"
                  // onClick={(e) => handleFormSubmit(e)}
                  size="lg"
                >
                  {t("signup.button")}
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
        {/* </div> */}
      </div>
      {/* <Footer /> */}
    </>
  );
}

export default SignUp;
