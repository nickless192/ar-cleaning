import React, { useState } from "react";
import { Card, Form, Button, Row, Col, Alert } from "react-bootstrap";
import ReCAPTCHA from "react-google-recaptcha";

const ContactUs = () => {
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
    console.log("Captcha value:", value);
    setCaptchaValue(value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!captchaValue) {
      alert("Please complete the CAPTCHA.");
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

    setStatus({ loading: false, error: "", success: "Your message has been sent!" });
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
  } catch (error) {
    setStatus({
      loading: false,
      error: error.message || "Unable to send message. Try again later.",
      success: "",
    });
  }
};


  return (
    <section className="py-5 bg-light">
      <Card className="shadow-lg p-4 mx-auto rounded-4" style={{ maxWidth: "960px" }}>
        <Row>
          {/* Contact Form */}
          <Col xs={12} md={6} className="mb-4 mb-md-0">
            <h3 className="mb-3">Let’s Talk 👋</h3>
            <p className="text-muted">
              Still have questions? Send us a message and we’ll get back to you shortly.
            </p>
            <Form onSubmit={handleSubmit}>
               {status.success && <Alert variant="success">{status.success}</Alert>}
              {status.error && <Alert variant="danger">{status.error}</Alert>}
              <Form.Group className="mb-3" controlId="name">
                <Form.Label>Your Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                  className="text-cleanar-color form-input"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="text-cleanar-color form-input"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="phone">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(123) 456-7890"
                  className="text-cleanar-color form-input"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="subject">
                <Form.Label>Subject</Form.Label>
                <Form.Control
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="text-cleanar-color form-input"
                  placeholder="e.g., Booking Question"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="message">
                <Form.Label>Message</Form.Label>
                <Form.Control
                  as="textarea"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Let us know how we can help..."
                  className="text-cleanar-color form-input"
                  required
                />
              </Form.Group>
              <ReCAPTCHA
        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
        onChange={handleCaptcha}
      />

              <Button variant="primary" type="submit" className="w-100 mt-2">
                Send Message
              </Button>
            </Form>
          </Col>

          {/* Company Info */}
          <Col xs={12} md={6} className="ps-md-4 d-flex flex-column justify-content-center">
            <h4 className="mb-3">📍 CleanAR Solutions</h4>
            <p className="mb-2"><strong>Location:</strong> Downtown Toronto</p>
            <p className="mb-2"><strong>Phone:</strong> (437) 440-5514</p>
            <p className="mb-2"><strong>Email:</strong> <a href="mailto:info@cleanarsolutions.ca" className="text-decoration-none">
             info@cleanARsolutions.ca
            </a>
             </p>
            <p className="text-muted mt-3">
                We’re here to make your space sparkle! ✨ If you have any questions or need assistance, feel free to reach out. We look forward to hearing from you!
            </p>
          </Col>
        </Row>
      </Card>
    </section>
  );
};

export default ContactUs;
