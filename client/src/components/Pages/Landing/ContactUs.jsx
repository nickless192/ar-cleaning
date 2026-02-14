import React, { useState } from "react";
import { Card, Form, Button, Row, Col, Alert } from "react-bootstrap";
import ReCAPTCHA from "react-google-recaptcha";
import { useTranslation } from "react-i18next";

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

  const handleCaptcha = (value) => setCaptchaValue(value);

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
      const body = { ...formData, captcha: captchaValue };

      const response = await fetch("/api/contactForm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Something went wrong.");

      setStatus({ loading: false, error: "", success: t("contact.alerts.success") });
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setCaptchaValue(null);
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
      <Card
        className="shadow-lg mx-auto rounded-4 bg-transparent"
        style={{ maxWidth: 980 }}
      >
        <div className="p-4 p-md-5">
          {/* Header */}
          <div className="mb-4">
            <h3 className="mb-2">
              {t("contact.heading") || "Message Us Directly"} <span role="img" aria-label="wave">👋</span>
            </h3>
            <p className="text-muted mb-0">
              {t("contact.intro") || "Still have questions? Send us a message and we’ll get back to you shortly."}
            </p>
          </div>

          <Form onSubmit={handleSubmit}>
            {status.success && <Alert variant="success">{status.success}</Alert>}
            {status.error && <Alert variant="danger">{status.error}</Alert>}

            {/* 2-column grid on md+ */}
            <Row className="g-3">
              <Col xs={12} md={6}>
                <Form.Group controlId="name">
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
              </Col>

              <Col xs={12} md={6}>
                <Form.Group controlId="email">
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
              </Col>

              <Col xs={12} md={6}>
                <Form.Group controlId="phone">
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
              </Col>

              <Col xs={12} md={6}>
                <Form.Group controlId="subject">
                  <Form.Label>{t("contact.form.subject_label")}</Form.Label>
                  <Form.Control
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder={t("contact.form.subject_placeholder")}
                    className="text-cleanar-color form-input"
                    required
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group controlId="message">
                  <Form.Label>{t("contact.form.message_label")}</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder={t("contact.form.message_placeholder")}
                    className="text-cleanar-color form-input"
                    required
                  />
                </Form.Group>
              </Col>

              {/* Captcha + Submit */}
              <Col xs={12}>
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mt-2">
                  <ReCAPTCHA
                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                    onChange={handleCaptcha}
                  />

                  <Button
                    variant="primary"
                    type="submit"
                    disabled={status.loading}
                    className="px-4"
                    style={{ minWidth: 180 }}
                  >
                    {status.loading
                      ? (t("contact.form.sending") || "Sending…")
                      : t("contact.form.submit")}
                  </Button>
                </div>

                <div className="text-muted small mt-2">
                  {t("contact.form.note") || "We usually reply within 24 hours."}
                </div>
              </Col>
            </Row>
          </Form>
        </div>
      </Card>
    </section>
  );
};

export default ContactUs;
