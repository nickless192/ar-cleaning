// src/components/Terms.jsx
import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const Terms = () => {
  return (
    <Container className="py-5">


      {/* Title */}
      <Row className="justify-content-center text-center mb-4">
        <Col md={10} lg={8}>
          <h1 className="fw-bold text-primary">
            CleanAR Solutions — Terms & Conditions
          </h1>
          <p className="text-muted">Updated April 2025</p>
        </Col>
      </Row>

      {/* Promotions & Discounts */}
      <Row className="justify-content-center mb-5">
        <Col md={10} lg={8}>
          <Card className="border-0 shadow-sm bg-light text-start">
            <Card.Body>
              <h5 className="text-danger fw-bold">
                Promotions & Discounts
              </h5>
              <p className="mb-1">
                Unless stated otherwise, promotional discounts (e.g., 15% off)
                are:
              </p>
              <ul className="ps-3">
                <li>
                  Available to <strong>first-time customers only</strong>.
                </li>
                <li>
                  <strong>Cannot be combined</strong> with any other offer.
                </li>
                <li>Subject to change or cancellation without notice.</li>
              </ul>
              <p className="mb-0 text-muted small">
                Questions? Email{' '}
                <a href="mailto:info@cleanarsolutions.ca">
                  info@cleanarsolutions.ca
                </a>
                .
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Legal Terms */}
      <Row className="justify-content-center">
        <Col md={10} lg={8}>

          {/* 1. Acceptance of Terms */}
          <section className="mb-5">
            <h4 className="fw-bold">1. Acceptance of Terms</h4>
            <p>
              By accessing this site and/or using our services, you agree to
              comply with and be legally bound by these Terms. If you do not
              agree, please do not use the site or book our services.
            </p>
          </section>

          {/* 2. Use of the Website */}
          <section className="mb-5">
            <h4 className="fw-bold">2. Use of the Website</h4>
            <p>
              You may not engage in any conduct that interferes with the
              proper working of the website, including attempting to gain
              unauthorized access, distributing malware, or scraping content
              without permission.
            </p>
          </section>

          {/* 3. Quote Requests */}
          <section className="mb-5">
            <h4 className="fw-bold">3. Quote Requests</h4>
            <p>
              Quotes submitted through the website are non-binding estimates.
              Final pricing may be adjusted based on an on-site assessment or
              additional service requirements.
            </p>
          </section>

          {/* 4. User Accounts */}
          <section className="mb-5">
            <h4 className="fw-bold">4. User Accounts</h4>
            <p>
              Users who register an account are responsible for maintaining
              the confidentiality of their login credentials and for all
              activities under their account.
            </p>
          </section>

          {/* 5. Service Area & Travel Surcharges */}
          <section className="mb-5">
            <h4 className="fw-bold">5. Service Area & Travel Surcharges</h4>
            <Card className="border-0 shadow-sm bg-light text-start my-5">
              <Card.Body>
                <h5 className="fw-bold text-primary">Our Service Area</h5>
                <p>
                  CleanAR Solutions proudly serves the Greater Toronto Area (GTA). Below is a map highlighting our primary region of operation. If you are outside this area, please contact us — we may still be able to help, though additional fees may apply.
                </p>
                <div className="ratio ratio-16x9 mb-3">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d905576.763759628!2d-79.95798278386575!3d43.90043816518561!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b2a1d7471156d%3A0x4ecad8e272e4c2a2!2sGreater%20Toronto%20Area%2C%20ON!5e1!3m2!1sen!2sca!4v1746987886625!5m2!1sen!2sca"
                    width="100%"
                    height="400"
                    allowFullScreen=""
                    loading="lazy"
                    title="CleanAR Service Area Map"
                  ></iframe>

                  {/* <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d905576.763759628!2d-79.95798278386575!3d43.90043816518561!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b2a1d7471156d%3A0x4ecad8e272e4c2a2!2sGreater%20Toronto%20Area%2C%20ON!5e1!3m2!1sen!2sca!4v1746987886625!5m2!1sen!2sca" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe> */}
                </div>

                <h6 className="fw-bold mt-4">Currently Servicing:</h6>
                <ul>
                  <li>Toronto (Downtown, East York, North York, Midtown)</li>
                  <li>Scarborough</li>
                  <li>Etobicoke</li>
                  <li>Mississauga</li>
                  <li>Markham</li>
                  <li>Richmond Hill</li>
                  <li>Pickering</li>
                  <li>Vaughan</li>
                  <li>Oakville</li>
                </ul>
                <p className="text-muted small">
                  Need service outside this area? A surcharge may apply. Contact us for a custom quote.
                </p>
              </Card.Body>
            </Card>
            <p>
              Services requested beyond these zones may be accepted at our discretion
              and will incur a flat travel surcharge, the amount of which will be
              agreed upon at the time of booking and added to your quoted service fee.
            </p>
            <p>
              We reserve the right to amend our service area or surcharge rates
              at any time. Updated terms will be posted on this website.
            </p>
          </section>

          {/* 6. Payments, Deposits & Cancellations */}
          <section className="mb-5">
            <h4 className="fw-bold">
              6. Payments, Deposits & Cancellations
            </h4>
            <ol type="a" className="ps-3">
              <li>
                A non-refundable deposit of 20% of the estimated cost is due
                at booking to reserve your slot. This deposit will be applied
                toward your final invoice.
              </li>
              <li>
                Payment in full is due upon completion of services. We currently accept
                cash, and e-transfer.
              </li>
              <li>
                To cancel or reschedule without penalty, please notify us at
                least 48 hours before your appointment via email at{' '}
                <a href="mailto:info@cleanarsolutions.ca">
                  info@cleanarsolutions.ca
                </a>
                .
              </li>
              <li>
                Cancellations made 24–48 hours before service incur a fee
                equal to 25% of the total charge. Cancellations under 24 hours
                or no-shows incur 50% of the total charge.
              </li>
              <li>
                All distance surcharge fees (if applicable) are due at time
                of service or upon receipt of invoice.
              </li>
            </ol>
          </section>

          {/* 7. Intellectual Property */}
          <section className="mb-5">
            <h4 className="fw-bold">7. Intellectual Property</h4>
            <p>
              All original content on this website, including logos, written content, graphics, and proprietary photos, is the property of CleanAR Solutions and may not be reproduced or redistributed without prior written consent.
            </p>
            <p>
              Some visual assets and images used are licensed from third-party providers such as <a href="https://www.freepik.com" target="_blank" rel="noopener noreferrer">Freepik</a>. Where applicable, attribution is provided in the image <code>alt</code> tags or captions (e.g., "Designed by Freepik").
            </p>
          </section>

          {/* 8. Limitation of Liability */}
          <section className="mb-5">
            <h4 className="fw-bold">8. Limitation of Liability</h4>
            <p>
              CleanAR Solutions is not liable for any indirect, incidental,
              or consequential damages arising from your use of our website or
              services. We are not responsible for delays due to weather,
              traffic, or other unforeseen events.
            </p>
          </section>

          {/* 9. Changes to These Terms */}
          <section className="mb-5">
            <h4 className="fw-bold">9. Changes to These Terms</h4>
            <p>
              We reserve the right to update these Terms at any time. Your
              continued use of the website or our services after changes have
              been posted constitutes acceptance of the revised Terms.
            </p>
          </section>

          {/* Footer Contact */}
          <p className="text-muted text-center small">
            For any questions, email{' '}
            <a href="mailto:info@cleanarsolutions.ca">
              info@cleanarsolutions.ca
            </a>
            .
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default Terms;