import React from "react";
import { Container, Row, Col, Nav } from "react-bootstrap";
import {useTranslation} from "react-i18next";

function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer className="footer text-dark pl-2 py-4">
      <section>
        <Row className="align-items-center">
          <Col md={6} className="mb-3 mb-md-0">
            <Nav className="flex-column flex-md-row" as="ul" aria-label="Footer navigation">
              <Nav.Item as="li" className="me-md-3 mb-2 mb-md-0">
                <Nav.Link href="/careers" className="p-0 text-dark text-decoration-none">
                  {t("footer.work_with_us")}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item as="li" className="me-md-3 mb-2 mb-md-0">
                <Nav.Link
                  href="https://g.co/kgs/7jGzM3E"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-0 text-dark text-decoration-none"
                >
                  {t("footer.google_profile")}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item as="li" className="me-md-3 mb-2 mb-md-0">
                <Nav.Link href="/terms-conditions" className="p-0 text-dark text-decoration-none">
                  {t("footer.terms")}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item as="li">
                <Nav.Link href="/disclaimer" className="p-0 text-dark text-decoration-none">
                  {t("footer.disclaimer")}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item as="li" className="ms-md-3">
                <Nav.Link href="/privacy-policy" className="p-0 text-dark text-decoration-none">
                  {t("footer.privacy_policy")}
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>

          <Col md={6} className="text-center text-md-end">
            <small>
              © {currentYear} | {t("footer.developer")}{" "}
              <a
                href="_blank"
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark text-decoration-none text-bold"
              >
                Omar Rodriguez
              </a>
            </small>
          </Col>
        </Row>
      </section>
    </footer>
  );
}

export default Footer;
