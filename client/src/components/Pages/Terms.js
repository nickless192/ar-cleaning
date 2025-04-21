import React from 'react';
import { Container } from 'react-bootstrap';

const Terms = () => {
  return (
    <Container className="py-5">
      <h2>Terms and Conditions</h2>
      <p>These Terms and Conditions ("Terms") govern your access to and use of the CleanAR Solutions website and services. By using our website or requesting services, you agree to be bound by these Terms.</p>

      <h4>1. Acceptance of Terms</h4>
      <p>By accessing this site and/or using our services, you agree to comply with and be legally bound by these Terms. If you do not agree, please do not use the site.</p>

      <h4>2. Use of the Website</h4>
      <p>Users may not engage in any conduct that interferes with the proper working of the website, such as attempting to gain unauthorized access, distribute malware, or scrape content without permission.</p>

      <h4>3. Quote Requests</h4>
      <p>Quotes submitted through the website are non-binding estimates. Final pricing may be adjusted based on an on-site assessment or additional service requirements.</p>

      <h4>4. User Accounts</h4>
      <p>Users who register an account are responsible for maintaining the confidentiality of their login credentials and for all activities under their account.</p>

      <h4>5. Service Availability</h4>
      <p>CleanAR Solutions provides services within the Greater Toronto Area (GTA). Availability may depend on scheduling and location. We reserve the right to decline or cancel services at our discretion.</p>

      <h4>6. Payments and Cancellations</h4>
      <p>All services must be paid in accordance with our accepted payment methods. Clients may cancel or reschedule a service with at least 24 hours’ notice. Late cancellations may be subject to a fee.</p>

      <h4>7. Intellectual Property</h4>
      <p>All content on this website, including logos, text, graphics, and photos, is the property of CleanAR Solutions and may not be reproduced or used without permission.</p>

      <h4>8. Limitation of Liability</h4>
      <p>CleanAR Solutions is not liable for any indirect, incidental, or consequential damages related to the use or inability to use our website or services. We are not responsible for delays due to weather, traffic, or unforeseen issues.</p>

      <h4>9. Changes to These Terms</h4>
      <p>We reserve the right to update these Terms at any time. Continued use of the website or services constitutes acceptance of the updated Terms.</p>

      <p className="text-muted mt-4">
        For any questions regarding these Terms, please contact us at <a href="mailto:info@cleanarsolutions.ca">info@cleanarsolutions.ca</a>.
      </p>
    </Container>
  );
};

export default Terms;
