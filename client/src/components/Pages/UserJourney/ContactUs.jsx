import React, { useState } from "react";
import { Card, Form, Button, Row, Col } from "react-bootstrap";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Hook this into your API or email service
    console.log("Form submitted:", formData);
  };

  return (
    <section className="py-5 bg-light">
      <Card className="shadow-lg p-4 mx-auto rounded-4" style={{ maxWidth: "960px" }}>
        <Row>
          {/* Contact Form */}
          <Col xs={12} md={6} className="mb-4 mb-md-0">
            <h3 className="mb-3">Let’s Talk 👋</h3>
            <p className="text-muted">
              Have questions? Send us a message and we’ll get back to you shortly.
            </p>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="name">
                <Form.Label>Your Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Jane Doe"
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
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="subject">
                <Form.Label>Subject</Form.Label>
                <Form.Control
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
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
                  required
                />
              </Form.Group>

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
