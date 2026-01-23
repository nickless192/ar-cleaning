// src/components/Pages/Blog/CleanARJoinsCQCC.jsx
import React, { useEffect } from "react";
import { Container, Row, Col } from "reactstrap";
import VisitorCounter from "/src/components/Pages/Management/VisitorCounter.jsx";
// Optional: if you created this component earlier, you can use it here.
// If you haven't created it yet, either remove it or replace with a simple Card.
import CQCCCertificationBadge from "/src/components/Pages/Certifications/CQCCCertificationBadge.jsx";

function CleanARJoinsCQCC() {
  useEffect(() => {
    document.body.classList.add("index-page", "sidebar-collapse");
    return () => {
      document.body.classList.remove("index-page", "sidebar-collapse");
    };
  }, []);

  return (
    <div className="section pb-0 mb-0 light-bg-color-opaque">
      <VisitorCounter page="blog_cleanar_joins_cqcc" />

      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md="10" lg="8">
            <p className="text-uppercase text-muted small fw-semibold mb-2">
              Company News · Supplier Diversity
            </p>

            <h1 className="fw-bold mb-3">
              CleanAR Solutions is Now an LGBTQ+ Certified Supplier (LGBTBE)
              Through CQCC
            </h1>

            <p className="text-secondary mb-4">
              At CleanAR Solutions, we believe professionalism means more than
              doing great work — it also means operating with transparency,
              accountability, and a long-term commitment to the communities we
              serve. We’re proud to share an important milestone: CleanAR is now
              officially recognized as an{" "}
              <strong>LGBTQ+ Certified Supplier (LGBTBE)</strong> through{" "}
              <a
                href="https://queerchamber.ca/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Canada’s Queer Chamber of Commerce (CQCC)
              </a>
              .
            </p>

            {/* Badge / Highlight */}
            <CQCCCertificationBadge className="mb-4" layout="stacked" />

            <h2 className="fw-bold mt-4 mb-3">
              What is CQCC and what does “LGBTBE” mean?
            </h2>

            <p className="text-secondary">
              <strong>Canada’s Queer Chamber of Commerce (CQCC)</strong> is a
              national organization that supports LGBTQ+ entrepreneurs and helps
              connect certified businesses with procurement opportunities, events,
              and corporate partners.
            </p>

            <p className="text-secondary">
              <strong>LGBTBE</strong> stands for{" "}
              <em>LGBTQ+ Business Enterprise</em>. It’s a supplier diversity
              certification that helps organizations identify and engage
              qualified LGBTQ+-owned businesses in their vendor networks.
            </p>

            <h2 className="fw-bold mt-4 mb-3">
              What this certification means for our clients
            </h2>

            <p className="text-secondary">
              This certification doesn’t change how we clean — it strengthens how
              we show up as a partner for organizations that prioritize inclusive
              procurement. If your team tracks vendor diversity, this may support
              your internal procurement goals when CleanAR is engaged as a vendor
              or subcontractor.
            </p>

            <ul className="text-secondary">
              <li>
                Supports <strong>inclusive procurement</strong> initiatives for
                organizations that track supplier diversity.
              </li>
              <li>
                Can help with <strong>supplier diversity reporting</strong> when
                cleaning services are subcontracted.
              </li>
              <li>
                Adds another layer of <strong>vendor credibility</strong> alongside
                our professional memberships and standards.
              </li>
            </ul>

            <h2 className="fw-bold mt-4 mb-3">
              What it means if you’re a homeowner or a local business in Toronto
            </h2>

            <p className="text-secondary">
              For residential clients and small businesses, the biggest takeaway
              is simple: you’re working with a company that invests in being
              recognized, verified, and accountable — not only for quality, but
              for how we operate.
            </p>

            <p className="text-secondary">
              Whether you hire us for a one-time deep clean, ongoing maintenance,
              or commercial janitorial services, our goal is consistent: reliable
              results, respectful service, and clear communication.
            </p>

            <h2 className="fw-bold mt-4 mb-3">
              A quick note about our certificate files
            </h2>

            <p className="text-secondary">
              CQCC has advised that certificate files should remain{" "}
              <strong>confidential</strong> for now (their branding updates are in
              progress). For that reason, we’re not sharing certificate images
              publicly at this time.
            </p>

            <p className="text-secondary mb-4">
              If you’re a corporate client and require confidential verification
              for procurement purposes, contact us — we’ll coordinate the right
              way to provide confirmation.
            </p>

            <h2 className="fw-bold mt-4 mb-3">
              Our commitment going forward
            </h2>

            <p className="text-secondary">
              This certification is one more step in building a company that
              meets professional expectations and modern procurement needs. We’ll
              continue investing in training, processes, and recognized programs
              that help us deliver strong outcomes for our clients — and operate
              with integrity as we grow.
            </p>

            <p className="text-secondary mb-4">
              To see our credentials and how they connect to our service quality,
              visit our{" "}
              <a href="/certifications-memberships">
                Professional Certifications &amp; Memberships
              </a>{" "}
              page, or explore our{" "}
              <a href="/products-and-services">cleaning services</a>.
            </p>

            <hr className="my-4" />

            <p className="text-secondary">
              Ready to work with a certified, professional cleaning partner in
              Toronto? Get in touch for a{" "}
              <strong>custom quote for your home or business</strong>.
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default CleanARJoinsCQCC;
