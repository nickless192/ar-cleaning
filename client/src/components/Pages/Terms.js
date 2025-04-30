import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const Terms = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center text-center mb-4">
        <Col md={10} lg={8}>
          <h1 className="fw-bold text-primary">CleanAR Solutions — Terms & Conditions</h1>
          <p className="text-muted">Updated April 2025</p>
        </Col>
      </Row>

      {/* Promo Disclaimer */}
      <Row className="justify-content-center mb-5">
        <Col md={10} lg={8}>
          <Card className="border-0 shadow-sm bg-light text-start">
            <Card.Body>
              <h5 className="text-danger fw-bold">Promotions & Discounts</h5>
              <p className="mb-1">
                Unless stated otherwise, promotional discounts (e.g., 15% off) are:
              </p>
              <ul className="ps-3">
                <li>Available to <strong>first-time customers only</strong>.</li>
                <li><strong>Cannot be combined</strong> with any other offer or discount.</li>
                <li>Subject to change or cancellation without notice.</li>
              </ul>
              <p className="mb-0 text-muted small">
                Have a question? Reach out to us at <a href="mailto:info@cleanarsolutions.ca">info@cleanarsolutions.ca</a>.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Legal Terms */}
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <section className="mb-5">
            <h4 className="fw-bold">1. Acceptance of Terms</h4>
            <p>
              By accessing this site and/or using our services, you agree to comply with and be legally bound by these Terms. If you do not agree, please do not use the site.
            </p>
          </section>

          <section className="mb-5">
            <h4 className="fw-bold">2. Use of the Website</h4>
            <p>
              Users may not engage in any conduct that interferes with the proper working of the website, such as attempting to gain unauthorized access, distribute malware, or scrape content without permission.
            </p>
          </section>

          <section className="mb-5">
            <h4 className="fw-bold">3. Quote Requests</h4>
            <p>
              Quotes submitted through the website are non-binding estimates. Final pricing may be adjusted based on an on-site assessment or additional service requirements.
            </p>
          </section>

          <section className="mb-5">
            <h4 className="fw-bold">4. User Accounts</h4>
            <p>
              Users who register an account are responsible for maintaining the confidentiality of their login credentials and for all activities under their account.
            </p>
          </section>

          <section className="mb-5">
            <h4 className="fw-bold">5. Service Availability</h4>
            <p>
              CleanAR Solutions provides services within the Greater Toronto Area (GTA). Availability may depend on scheduling and location. We reserve the right to decline or cancel services at our discretion.
            </p>
          </section>

          <section className="mb-5">
            <h4 className="fw-bold">6. Payments and Cancellations</h4>
            <p>
              All services must be paid in accordance with our accepted payment methods. Clients may cancel or reschedule a service with at least 24 hours’ notice. Late cancellations may be subject to a fee.
            </p>
          </section>

          <section className="mb-5">
            <h4 className="fw-bold">7. Intellectual Property</h4>
            <p>
              All content on this website, including logos, text, graphics, and photos, is the property of CleanAR Solutions and may not be reproduced or used without permission.
            </p>
          </section>

          <section className="mb-5">
            <h4 className="fw-bold">8. Limitation of Liability</h4>
            <p>
              CleanAR Solutions is not liable for any indirect, incidental, or consequential damages related to the use or inability to use our website or services. We are not responsible for delays due to weather, traffic, or unforeseen issues.
            </p>
          </section>

          <section className="mb-5">
            <h4 className="fw-bold">9. Changes to These Terms</h4>
            <p>
              We reserve the right to update these Terms at any time. Continued use of the website or services constitutes acceptance of the updated Terms.
            </p>
          </section>

          <p className="text-muted text-center small">
            For any questions, email us at <a href="mailto:info@cleanarsolutions.ca">info@cleanarsolutions.ca</a>.
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default Terms;
