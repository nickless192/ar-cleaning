import React, { useState } from "react";
import { Card, Form, Button, Row, Col, Alert } from "react-bootstrap";
import ReCAPTCHA from "react-google-recaptcha";
import { useTranslation } from "react-i18next";
import pageBg from "/src/assets/img/bg1.png";
import NewIconAnimated from "/src/components/Pages/Navigation/NewIconAnimated";

const ContactUs = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [captchaValue, setCaptchaValue] = useState(null);


   const [status, setStatus] = useState({ loading: false, error: "", success: "" });

     const handleCaptcha = (value) => {
    // console.log("Captcha value:", value);
    setCaptchaValue(value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!captchaValue) {
      alert(t("contact.alerts.captcha"));
      return;
    }
  setStatus({ loading: true, error: "", success: "" });

  try {
    const body = {
      ...formData,
      captcha: captchaValue,
    };
    const response = await fetch("/api/contactForm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong.");
    }

    setStatus({ loading: false, error: "", success: t("contact.alerts.success") });
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
  } catch (error) {
    setStatus({
      loading: false,
      error: error.message || t("contact.alerts.error"),
      success: "",
    });
  }
};


  return (
    <section className="py-5">
      <Card className="shadow-lg p-4 mx-auto rounded-4 bg-transparent" 
      // style={{ maxWidth: "960px", backgroundImage: `url(${pageBg})`, backgroundSize: "cover" }}
      >
        <Row>
          {/* Contact Form */}
          <Col xs={12} md={6} className="mb-4 mb-md-0">
            <h3 className="mb-3">{t("contact.heading")}</h3>
            <p className="text-muted">
              {t("contact.intro")}
            </p>
            <Form onSubmit={handleSubmit}>
               {status.success && <Alert variant="success">{status.success}</Alert>}
              {status.error && <Alert variant="danger">{status.error}</Alert>}
              <Form.Group className="mb-3" controlId="name">
                <Form.Label>{t("contact.form.name_label")}</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t("contact.form.name_placeholder")}
                  className="text-cleanar-color form-input"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="email">
                <Form.Label>{t("contact.form.email_label")}</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t("contact.form.email_placeholder")}
                  className="text-cleanar-color form-input"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="phone">
                <Form.Label>{t("contact.form.phone_label")}</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t("contact.form.phone_placeholder")}
                  className="text-cleanar-color form-input"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="subject">
                <Form.Label>{t("contact.form.subject_label")}</Form.Label>
                <Form.Control
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="text-cleanar-color form-input"
                  placeholder={t("contact.form.subject_placeholder")}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="message">
                <Form.Label>{t("contact.form.message_label")}</Form.Label>
                <Form.Control
                  as="textarea"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder={t("contact.form.message_placeholder")}
                  className="text-cleanar-color form-input"
                  required
                />
              </Form.Group>
              <ReCAPTCHA
        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
        onChange={handleCaptcha}
      />

              <Button variant="primary" type="submit" className="w-100 mt-2">
                {t("contact.form.submit")}
              </Button>
            </Form>
          </Col>

          {/* Company Info */}
          <Col xs={12} md={6} className="ps-md-4 d-flex flex-column justify-content-center">
            <h4 className="mb-3">📍 CleanAR Solutions</h4>
            <p className="mb-2"><strong>{t("contact.company.location_label")}:</strong> {t("contact.company.location_value")}</p>
            <p className="mb-2"><strong>{t("contact.company.phone_label")}:</strong> {t("contact.company.phone_value")}</p>
            <p className="mb-2"><strong>{t("contact.company.email_label")}:</strong> <a href="mailto:info@cleanarsolutions.ca" className="text-decoration-none">
             info@cleanARsolutions.ca
            </a>
             </p>
            <p className="text-muted mt-3">
                {t("contact.company.description")}
            </p>
          </Col>
        </Row>
      </Card>
    </section>
  );
};

export default ContactUs;
