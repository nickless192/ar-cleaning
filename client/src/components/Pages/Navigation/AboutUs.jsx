import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container, Row, Col, Card, CardBody, Button } from "reactstrap";
import {
  FaCheckCircle,
  FaHandshake,
  FaStar,
  FaUsers,
  FaLeaf,
  FaClipboardCheck,
  FaComments,
  FaTools,
  FaBuilding,
} from "react-icons/fa";
import VisitorCounter from "/src/components/Pages/Management/VisitorCounter.jsx";
import "/src/assets/css/about-us.css";

function AboutUsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const goToQuote = () => {
    navigate("/?scrollToQuote=true");
  };

  useEffect(() => {
    document.body.classList.add("index-page", "sidebar-collapse");
    return () => {
      document.body.classList.remove("index-page", "sidebar-collapse");
    };
  }, []);

  const values = t("about.values.cards", { returnObjects: true });
  const reasons = t("about.whyChoose.points", { returnObjects: true });
  const serviceAreas = t("about.serviceArea.locations", { returnObjects: true });

  const valueIcons = [FaHandshake, FaStar, FaUsers, FaLeaf, FaCheckCircle];
  const reasonIcons = [FaClipboardCheck, FaComments, FaStar, FaTools, FaLeaf, FaBuilding];

  return (
    <main className="about-us-page section pb-5 mb-0">
      <VisitorCounter page="aboutuspage" />

      <section className="about-us-hero py-5" aria-labelledby="about-us-hero-title">
        <Container>
          <Row className="g-4 align-items-center">
            <Col xs="12" lg="7">
              <p className="about-us-eyebrow mb-2">{t("about.hero.eyebrow")}</p>
              <h1 id="about-us-hero-title" className="about-us-title mb-3">
                {t("about.hero.title")}
              </h1>
              <p className="about-us-subtitle mb-4">{t("about.hero.subtitle")}</p>
              <div className="d-flex flex-column flex-sm-row gap-2">
                <Button onClick={goToQuote} className="primary-bg-color border-0 px-4 py-2 fw-semibold">
                  {t("about.hero.ctaPrimary")}
                </Button>
                <Link to="/products-and-services" className="btn btn-outline-secondary px-4 py-2 fw-semibold">
                  {t("about.hero.ctaSecondary")}
                </Link>
              </div>
            </Col>

            <Col xs="12" lg="5">
              <Card className="about-us-card">
                <CardBody>
                  <ul className="about-us-trust-list" aria-label={t("about.hero.trustLabel")}>
                    {t("about.hero.trustChips", { returnObjects: true }).map((chip) => (
                      <li key={chip}>{chip}</li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="py-4" aria-labelledby="about-story-title">
        <Container>
          <Card className="about-us-card">
            <CardBody className="p-4 p-md-5">
              <h2 id="about-story-title" className="about-us-section-title mb-3">{t("about.story.title")}</h2>
              <p className="mb-0 about-us-body-copy">{t("about.story.body")}</p>
            </CardBody>
          </Card>
        </Container>
      </section>

      <section className="py-4" aria-labelledby="about-mission-vision-title">
        <Container>
          <h2 id="about-mission-vision-title" className="about-us-section-title mb-3">{t("about.missionVision.title")}</h2>
          <Row className="g-3">
            <Col xs="12" md="6">
              <Card className="about-us-card h-100">
                <CardBody className="p-4">
                  <h3 className="h5 fw-bold">{t("about.missionVision.mission.title")}</h3>
                  <p className="mb-0 about-us-body-copy">{t("about.missionVision.mission.body")}</p>
                </CardBody>
              </Card>
            </Col>
            <Col xs="12" md="6">
              <Card className="about-us-card h-100">
                <CardBody className="p-4">
                  <h3 className="h5 fw-bold">{t("about.missionVision.vision.title")}</h3>
                  <p className="mb-0 about-us-body-copy">{t("about.missionVision.vision.body")}</p>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="py-4" aria-labelledby="about-values-title">
        <Container>
          <h2 id="about-values-title" className="about-us-section-title mb-3">{t("about.values.title")}</h2>
          <Row className="g-3">
            {values.map((value, index) => {
              const Icon = valueIcons[index] ?? FaCheckCircle;
              return (
                <Col xs="12" sm="6" lg="4" key={value.title}>
                  <Card className="about-us-card h-100">
                    <CardBody className="p-4">
                      <div className="about-us-icon-wrap" aria-hidden="true">
                        <Icon />
                      </div>
                      <h3 className="h5 fw-bold mt-3">{value.title}</h3>
                      <p className="mb-0 about-us-body-copy">{value.description}</p>
                    </CardBody>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Container>
      </section>

      <section className="py-4" aria-labelledby="about-why-title">
        <Container>
          <h2 id="about-why-title" className="about-us-section-title mb-3">{t("about.whyChoose.title")}</h2>
          <Row className="g-3">
            {reasons.map((reason, index) => {
              const Icon = reasonIcons[index] ?? FaCheckCircle;
              return (
                <Col xs="12" sm="6" lg="4" key={reason}>
                  <Card className="about-us-card h-100">
                    <CardBody className="p-4 d-flex align-items-start gap-3">
                      <span className="about-us-icon-inline" aria-hidden="true">
                        <Icon />
                      </span>
                      <p className="mb-0 about-us-body-copy fw-semibold">{reason}</p>
                    </CardBody>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Container>
      </section>

      <section className="py-4" aria-labelledby="about-service-area-title">
        <Container>
          <Card className="about-us-card">
            <CardBody className="p-4 p-md-5">
              <h2 id="about-service-area-title" className="about-us-section-title mb-3">{t("about.serviceArea.title")}</h2>
              <p className="about-us-body-copy mb-3">{t("about.serviceArea.intro")}</p>
              <ul className="about-us-area-list">
                {serviceAreas.map((location) => (
                  <li key={location}>{location}</li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </Container>
      </section>

      <section className="py-4" aria-labelledby="about-final-cta-title">
        <Container>
          <Card className="about-us-card about-us-final-cta text-center">
            <CardBody className="p-4 p-md-5">
              <h2 id="about-final-cta-title" className="about-us-section-title mb-2">{t("about.finalCta.title")}</h2>
              <p className="about-us-body-copy mb-4">{t("about.finalCta.subtitle")}</p>
              <div className="d-flex flex-column flex-sm-row justify-content-center gap-2">
                <Button onClick={goToQuote} className="primary-bg-color border-0 px-4 py-2 fw-semibold">
                  {t("about.finalCta.ctaPrimary")}
                </Button>
                <Link to="/products-and-services" className="btn btn-outline-secondary px-4 py-2 fw-semibold">
                  {t("about.finalCta.ctaSecondary")}
                </Link>
              </div>
              <p className="small text-muted mt-3 mb-0">{t("about.finalCta.contactHint")}</p>
            </CardBody>
          </Card>
        </Container>
      </section>
    </main>
  );
}

export default AboutUsPage;
