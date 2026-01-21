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
import {
  FaAward,
  FaShieldAlt,
  FaLeaf,
  FaCheckCircle,
} from "react-icons/fa";
import VisitorCounter from "/src/components/Pages/Management/VisitorCounter.jsx";
import ISSAMembershipBadge from "/src/components/Pages/Certifications/ISSAMembershipBadge.jsx";
import Logo from "/src/assets/img/cleanar-logo.png";
// import { t } from "i18next";
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
          <Col
            xs="12"
            md="6"
            className="text-center text-md-start mb-4 mb-md-0"
          >
            <Image
              alt="CleanAR Solutions Logo"
              src={Logo}
              className="img-fluid"
              style={{ maxWidth: "320px", transition: "transform 0.3s" }}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            />
          </Col>
          <Col xs="12" md="6">
            <h1 className="text-primary fw-bold mb-3">{t('certification.title')}
              {/* Professional Certifications & Memberships */}
            </h1>
            <p className="fs-5 text-secondary">
              <Trans i18nKey="certification.intro"
                components={{ strong: <strong /> }}
              />
              {/* Your home or business deserves cleaners who follow{" "}
              <strong>recognized industry standards</strong>, not guesswork.
              Our memberships and certifications show our commitment to
              professional, safe, and healthy cleaning practices in Toronto. */}
            </p>
            <Button
              color="success"
              className="mt-3"
              onClick={goToQuote}
            >{t('certification.ctaPrimary')}
              {/* Get a Free Quote */}
            </Button>
          </Col>
        </Row>
      </Container>

      {/* ISSA Canada Highlight */}
      <Container className="my-4">
        <Row className="justify-content-center">
          <Col md="10">
            <ISSAMembershipBadge className="mb-4" layout="horizontal" />

            <Row className="mt-4">
              <Col md="7" className="mb-4 mb-md-0">
                <h2 className="fw-bold mb-3">{t('issa.sectionTitle')}
                  {/* What is ISSA Canada and why does it matter? */}
                </h2>
                <p className="fs-6 text-secondary">
                  <Trans i18nKey="issa.description1"
                    components={{ strong: <strong /> }}
                  />
                  
                  {/* <strong>ISSA</strong> is the worldwide cleaning industry
                  association, representing more than 11,000 members around
                  the globe, including building service contractors,
                  distributors, manufacturers, and residential cleaners. */}
                  {" "}
                  <a
                    href="https://www.issa.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >{t('issa.learnMore')}
                    {/* Learn more about ISSA */}
                  </a>
                  .
                </p>
                <p className="fs-6 text-secondary">
                  <Trans i18nKey="issa.description2"
                    components={{ strong: <strong /> }}
                  />
                  
                  {/* <strong>ISSA Canada</strong> is the Canadian division,
                  supporting the local cleaning industry with education,
                  standards, and advocacy. As members, we stay informed on
                  best practices for{" "}
                  <strong>health, safety, and quality</strong> in cleaning
                  services across Canada. */}
                  {" "}
                  <a
                    href="https://issa-canada.com/en/issa-canada-en/about-issa-canada-en"
                    target="_blank"
                    rel="noopener noreferrer"
                  >{t('issa.aboutCanada')}
                    {/* About ISSA Canada */}
                  </a>
                  .
                </p>
                <p className="fs-6 text-secondary mb-0">
                  <Trans i18nKey="issa.description3"
                    components={{ strong: <strong /> }}
                  />
                  {/* For our clients, this means you’re working with a company
                  that takes cleaning seriously – not just as a task, but as
                  an investment in a{" "}
                  <strong>healthier and safer environment</strong> for your
                  family, staff, and visitors. */}
                </p>
              </Col>

              <Col md="5">
                <Card className="shadow-sm border-0 bg-transparent h-100">
                  <CardHeader className="bg-primary text-white fw-bold">{t('issa.cardTitle')}
                    {/* What ISSA membership means for you */}
                  </CardHeader>
                  <CardBody className="bg-transparent">
                    <ul className="list-unstyled mb-0">
                      <li className="mb-2">
                        <FaAward className="text-primary me-2" />{t('issa.benefits.standards')}
                        {/* Alignment with international cleaning standards */}
                      </li>
                      <li className="mb-2">
                        <FaShieldAlt className="text-primary me-2" />
                        {t('issa.benefits.health')}
                        {/* Added focus on health, hygiene, and safety */}
                      </li>
                      <li className="mb-2">
                        <FaCheckCircle className="text-primary me-2" />
                        {t('issa.benefits.ethics')}
                        {/* Commitment to professional conduct and ethics */}
                      </li>
                      <li className="mb-2">
                        <FaLeaf className="text-primary me-2" />
                        {t('issa.benefits.environment')}
                        {/* Better practices for environmentally-conscious cleaning */}
                      </li>
                    </ul>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>

      {/* Future Certifications / Roadmap */}
      <Container className="my-5">
        <Row className="justify-content-center">
          <Col md="10">
            <h2 className="fw-bold mb-3">{t('roadmap.title')}</h2>
            <p className="fs-6 text-secondary">
              <Trans i18nKey="roadmap.description1"
                components={{ strong: <strong /> }}
              />
              {/* Our ISSA Canada membership is an important step, and we’re
              not stopping there. CleanAR Solutions is continuously exploring
              additional training and certifications that align with our
              focus on <strong>quality, safety, and sustainability</strong>. */}
            </p>
            <p className="fs-6 text-secondary mb-0">
              <Trans i18nKey="roadmap.description2"
                components={{ strong: <strong /> }}
              />
              
              {/* As we add new certifications, this page will be kept up to
              date so you can always see how we’re investing in better
              service for your home or business. */}
            </p>
          </Col>
        </Row>
      </Container>

      {/* Call to Action */}
      <Container className="text-center py-5">
        <h2 className="fw-bold text-dark mb-3">{t('certification-cta.title')}
          {/* Bring certified standards to your space */}
        </h2>
        <p className="mb-4 text-secondary">{t('certification-cta.description')}
          {/* Whether it’s a condo, house, or office, we apply the same level of
          care and professionalism backed by our ISSA Canada membership. */}
        </p>
        <Button
          onClick={goToQuote}
          className="btn btn-lg primary-bg-color"
        >{t('certification-cta.button')}
          {/* Request Your Cleaning Quote */}
        </Button>
        <div className="mt-3">
          <Link to="/products-and-services">{t('certification-cta.link')}
            {/* View our cleaning services */}
          </Link>
        </div>
      </Container>
    </div>
  );
}

export default CertificationsMembershipsPage;
