import React from "react";
import { Container, Row, Col, Nav } from "react-bootstrap";
import {useTranslation} from "react-i18next";

function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer className="text-dark py-4 mt-auto light-blue-bg-color text-bold">
      <Container>
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
                  href="https://g.page/r/Cek9dkmHVuBKEAE/review"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-0 text-dark text-decoration-none"
                >
                  {t("footer.leave_review")}
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
      </Container>
    </footer>
  );
}

export default Footer;
