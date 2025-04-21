import React from 'react';
import { Container } from 'react-bootstrap';

const Disclaimer = () => {
  return (
    <Container className="py-5">
      <h2>Privacy & Data Disclaimer</h2>
      <p>
        At CleanAR Solutions, we are committed to protecting your privacy. This page outlines how we collect, use, and safeguard your data when you use our services.
      </p>

      <h4>What Data We Collect</h4>
      <ul>
        <li><strong>Visitor Tracking:</strong> Page visits, user agent, and anonymized IP address (hashed).</li>
        <li><strong>Quote Requests:</strong> Your name, address, email, phone, and service details.</li>
        <li><strong>User Accounts:</strong> Personal details you provide to create an account (name, email, etc).</li>
      </ul>

      <h4>Why We Collect Your Data</h4>
      <ul>
        <li>To provide and personalize quotes.</li>
        <li>To analyze website performance and ensure security.</li>
        <li>To contact you regarding your request or service updates.</li>
      </ul>

      <h4>How We Protect Your Data</h4>
      <ul>
        <li>We hash your IP address before storage to ensure anonymity.</li>
        <li>We use secure authentication (JWT) for logged-in users.</li>
        <li>Your information is never shared or sold to third parties.</li>
      </ul>

      <h4>Your Rights</h4>
      <p>You may request to review, correct, or delete any personal data we hold. Contact us at <a href="mailto:info@cleanarsolutions.ca">info@cleanarsolutions.ca</a>.</p>

      <p className="text-muted mt-4">
        This policy may be updated from time to time. Please review it periodically.
      </p>
    </Container>
  );
};

export default Disclaimer;
