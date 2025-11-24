// src/components/Pages/Blog/CleanARJoinsISSACanada.jsx
import React, { useEffect } from "react";
import { Container, Row, Col } from "reactstrap";
import VisitorCounter from "/src/components/Pages/Management/VisitorCounter.jsx";
import ISSAMembershipBadge from "/src/components/Pages/Certifications/ISSAMembershipBadge.jsx";

function CleanARJoinsISSACanada() {
  useEffect(() => {
    document.body.classList.add("index-page", "sidebar-collapse");
    return () => {
      document.body.classList.remove("index-page", "sidebar-collapse");
    };
  }, []);

  return (
    <div className="section pb-0 mb-0 light-bg-color-opaque">
      <VisitorCounter page="blog_cleanar_joins_issa_canada" />

      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md="10" lg="8">
            <p className="text-uppercase text-muted small fw-semibold mb-2">
              Company News · Professional Standards
            </p>
            <h1 className="fw-bold mb-3">
              CleanAR Solutions Joins ISSA Canada: Raising the Bar for
              Professional Cleaning in Toronto
            </h1>
            <p className="text-secondary mb-4">
              At CleanAR Solutions, our goal has always been simple: provide
              reliable, high-quality cleaning services that our clients can
              trust. Today, we’re excited to share an important milestone in
              that journey – we are now an official{" "}
              <strong>ISSA Canada Member</strong>, part of{" "}
              <a
                href="https://www.issa.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                ISSA, the worldwide cleaning industry association
              </a>
              .
            </p>

            <ISSAMembershipBadge className="mb-4" layout="stacked" />

            <h2 className="fw-bold mt-4 mb-3">
              Who is ISSA and what is ISSA Canada?
            </h2>
            <p className="text-secondary">
              <strong>ISSA</strong> is the leading global trade association for
              the cleaning, hygiene, and facility management industry, with
              more than 11,000 members worldwide. Its mission is to{" "}
              <em>“change the way the world views cleaning”</em> by promoting
              cleaning as an essential investment in human health, the
              environment, and performance.
            </p>
            <p className="text-secondary">
              <strong>ISSA Canada</strong> represents the Canadian market and
              helps cleaning companies like ours stay aligned with industry
              best practices, education, and standards. You can learn more
              directly from{" "}
              <a
                href="https://issa-canada.com/en/issa-canada-en/about-issa-canada-en"
                target="_blank"
                rel="noopener noreferrer"
              >
                ISSA Canada’s official website
              </a>
              .
            </p>

            <h2 className="fw-bold mt-4 mb-3">
              What ISSA membership means for our clients
            </h2>
            <p className="text-secondary">
              Membership is not just a logo on our website – it reflects how
              we operate day-to-day. As an ISSA Canada member, CleanAR
              Solutions is committed to:
            </p>
            <ul className="text-secondary">
              <li>
                Following <strong>recognized industry standards</strong> for
                quality and consistency in cleaning.
              </li>
              <li>
                Prioritizing <strong>health and safety</strong> in homes,
                condos, and offices across Toronto.
              </li>
              <li>
                Staying up to date with{" "}
                <strong>training, education, and best practices</strong>.
              </li>
              <li>
                Supporting more <strong>environmentally responsible</strong>{" "}
                cleaning methods where possible.
              </li>
            </ul>

            <h2 className="fw-bold mt-4 mb-3">
              Connecting our work to industry standards
            </h2>
            <p className="text-secondary">
              ISSA supports programs like the{" "}
              <a
                href="https://cims.issa.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Cleaning Industry Management Standard (CIMS)
              </a>
              , the global benchmark for management and quality in cleaning
              operations. While CIMS certification is a separate process,
              being part of the ISSA community keeps us aligned with the same
              principles: documented processes, consistent results, and a
              strong focus on hygiene and customer satisfaction.
            </p>

            <h2 className="fw-bold mt-4 mb-3">
              What this means if you’re a homeowner or business in Toronto
            </h2>
            <p className="text-secondary">
              When you hire CleanAR Solutions, you’re choosing a local
              Toronto cleaning company that is backed by an{" "}
              <strong>international network</strong> and standards. That
              matters when you’re trusting someone with your home, your
              building, or your team’s workspace.
            </p>
            <p className="text-secondary">
              Whether we’re performing a one-time deep clean, ongoing
              residential maintenance, or commercial janitorial work, you can
              expect a higher level of professionalism and accountability.
            </p>

            <h2 className="fw-bold mt-4 mb-3">
              Our commitment going forward
            </h2>
            <p className="text-secondary">
              This is not the end goal – it’s a foundation. We’ll continue to
              invest in training, equipment, and processes that align with
              ISSA’s mission and the needs of our customers in Toronto.
            </p>

            <p className="text-secondary mb-4">
              To see how our professional memberships fit into the bigger
              picture, visit our{" "}
              <a href="/certifications-memberships">
                Professional Certifications &amp; Memberships
              </a>{" "}
              page, or explore our{" "}
              <a href="/products-and-services">cleaning services</a>.
            </p>

            <hr className="my-4" />

            <p className="text-secondary">
              Ready to experience the difference that professional standards
              make? Get in touch with us for a{" "}
              <strong>custom quote for your home or business</strong> in
              Toronto.
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default CleanARJoinsISSACanada;
