// src/components/Pages/About/CertificationsMembershipsPage.jsx
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Container,
  Button,
} from "reactstrap";
import { Image } from "react-bootstrap";
import { FaAward, FaShieldAlt, FaLeaf, FaCheckCircle } from "react-icons/fa";
import { FaHandshake } from "react-icons/fa6";
import VisitorCounter from "/src/components/Pages/Management/VisitorCounter.jsx";
import ISSAMembershipBadge from "/src/components/Pages/Certifications/ISSAMembershipBadge.jsx";
import CQCCCertificationBadge from "/src/components/Pages/Certifications/CQCCCertificationBadge.jsx";
import Logo from "/src/assets/img/cleanar-logo.png";
import { useTranslation, Trans } from "react-i18next";

function CertificationsMembershipsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const goToQuote = () => {
    navigate("/index?scrollToQuote=true");
  };

  useEffect(() => {
    document.body.classList.add("index-page", "sidebar-collapse");
    return () => {
      document.body.classList.remove("index-page", "sidebar-collapse");
    };
  }, []);

  return (
    <div className="section pb-0 mb-0 light-bg-color-opaque">
      <VisitorCounter page="certificationsmemberships" />

      {/* Hero Banner */}
      <Container>
        <Row className="px-4 py-5 align-items-center">
          <Col xs="12" md="6" className="text-center text-md-start mb-4 mb-md-0">
            <Image
              alt="CleanAR Solutions Logo"
              src={Logo}
              className="img-fluid"
              style={{ maxWidth: "320px", transition: "transform 0.3s" }}
              onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          </Col>

          <Col xs="12" md="6">
            <h1 className="text-primary fw-bold mb-3">{t("certification.title")}</h1>
            <p className="fs-5 text-secondary">
              <Trans i18nKey="certification.intro" components={{ strong: <strong /> }} />
            </p>
            <Button color="success" className="mt-3" onClick={goToQuote}>
              {t("certification.ctaPrimary")}
            </Button>
          </Col>
        </Row>
      </Container>

      {/* Certifications Highlights */}
      <Container className="my-4">
        <Row className="justify-content-center">
          <Col md="10">
            {/* 1) ISSA */}
            <ISSAMembershipBadge className="mb-4" layout="horizontal" />

            <Row className="mt-4">
              <Col md="7" className="mb-4 mb-md-0">
                <h2 className="fw-bold mb-3">{t("issa.sectionTitle")}</h2>

                <p className="fs-6 text-secondary">
                  <Trans i18nKey="issa.description1" components={{ strong: <strong /> }} />{" "}
                  <a
                    href="https://www.issa.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("issa.learnMore")}
                  </a>
                  .
                </p>

                <p className="fs-6 text-secondary">
                  <Trans i18nKey="issa.description2" components={{ strong: <strong /> }} />{" "}
                  <a
                    href="https://issa-canada.com/en/issa-canada-en/about-issa-canada-en"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("issa.aboutCanada")}
                  </a>
                  .
                </p>

                <p className="fs-6 text-secondary mb-0">
                  <Trans i18nKey="issa.description3" components={{ strong: <strong /> }} />
                </p>
              </Col>

              <Col md="5">
                <Card className="shadow-sm border-0 bg-transparent h-100">
                  <CardHeader className="bg-primary text-white fw-bold">
                    {t("issa.cardTitle")}
                  </CardHeader>
                  <CardBody className="bg-transparent">
                    <ul className="list-unstyled mb-0">
                      <li className="mb-2">
                        <FaAward className="text-primary me-2" />
                        {t("issa.benefits.standards")}
                      </li>
                      <li className="mb-2">
                        <FaShieldAlt className="text-primary me-2" />
                        {t("issa.benefits.health")}
                      </li>
                      <li className="mb-2">
                        <FaCheckCircle className="text-primary me-2" />
                        {t("issa.benefits.ethics")}
                      </li>
                      <li className="mb-2">
                        <FaLeaf className="text-primary me-2" />
                        {t("issa.benefits.environment")}
                      </li>
                    </ul>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            {/* 2) CQCC */}
            {import.meta.env.DEV && (
            <div className="mt-5">
              <CQCCCertificationBadge className="mb-4" layout="horizontal" />

              <Row className="mt-4">
                <Col md="7" className="mb-4 mb-md-0">
                  <h2 className="fw-bold mb-3">{t("cqcc.sectionTitle")}</h2>

                  <p className="fs-6 text-secondary">
                    <Trans i18nKey="cqcc.description1" components={{ strong: <strong /> }} />{" "}
                    <a
                      href="https://queerchamber.ca/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("cqcc.learnMore")}
                    </a>
                    .
                  </p>

                  <p className="fs-6 text-secondary">
                    <Trans i18nKey="cqcc.description2" components={{ strong: <strong /> }} />
                  </p>

                  <p className="fs-6 text-secondary mb-0">
                    <Trans i18nKey="cqcc.confidentialNote" components={{ strong: <strong /> }} />
                  </p>
                </Col>

                <Col md="5">
                  <Card className="shadow-sm border-0 bg-transparent h-100">
                    <CardHeader className="bg-dark text-white fw-bold">
                      <span className="d-inline-flex align-items-center">
                        <FaHandshake className="me-2" />
                        {t("cqcc.cardTitle")}
                      </span>
                    </CardHeader>
                    <CardBody className="bg-transparent">
                      <ul className="list-unstyled mb-0">
                        <li className="mb-2">
                          <FaCheckCircle className="text-success me-2" />
                          {t("cqcc.benefits.procurement")}
                        </li>
                        <li className="mb-2">
                          <FaCheckCircle className="text-success me-2" />
                          {t("cqcc.benefits.reporting")}
                        </li>
                        <li className="mb-0">
                          <FaCheckCircle className="text-success me-2" />
                          {t("cqcc.benefits.network")}
                        </li>
                      </ul>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </div>
            )}
          </Col>
        </Row>
      </Container>

      {/* Future Certifications / Roadmap */}
      <Container className="my-5">
        <Row className="justify-content-center">
          <Col md="10">
            <h2 className="fw-bold mb-3">{t("roadmap.title")}</h2>
            <p className="fs-6 text-secondary">
              <Trans i18nKey="roadmap.description1" components={{ strong: <strong /> }} />
            </p>
            <p className="fs-6 text-secondary mb-0">
              <Trans i18nKey="roadmap.description2" components={{ strong: <strong /> }} />
            </p>
          </Col>
        </Row>
      </Container>

      {/* Call to Action */}
      <Container className="text-center py-5">
        <h2 className="fw-bold text-dark mb-3">{t("certification-cta.title")}</h2>
        <p className="mb-4 text-secondary">{t("certification-cta.description")}</p>
        <Button onClick={goToQuote} className="btn btn-lg primary-bg-color">
          {t("certification-cta.button")}
        </Button>
        <div className="mt-3">
          <Link to="/products-and-services">{t("certification-cta.link")}</Link>
        </div>
      </Container>
    </div>
  );
}

export default CertificationsMembershipsPage;
