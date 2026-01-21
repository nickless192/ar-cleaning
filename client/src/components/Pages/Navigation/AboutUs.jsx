import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardText,
  CardHeader,
  ListGroup,
  ListGroupItem,
  Container,
  Button,
} from "reactstrap";
import { Image } from "react-bootstrap";
import WhyChooseUs from "/src/components/Pages/Landing/WhyChooseUs";
import {
  FaUsers,
  FaLeaf,
  FaAward,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";
import Logo from "/src/assets/img/cleanar-logo.png";
import VisitorCounter from "/src/components/Pages/Management/VisitorCounter.jsx";


function AboutUsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const goToQuote = () => {
    navigate('/index?scrollToQuote=true');
  };

  useEffect(() => {
    document.body.classList.add("index-page", "sidebar-collapse");
    return () => {
      document.body.classList.remove("index-page", "sidebar-collapse");
    };
  }, []);

  return (
    <div className="section pb-0 mb-0 light-bg-color-opaque">
      <VisitorCounter page="aboutuspage" />

      {/* Hero Banner */}
      <Container>
        <Row className="px-4 py-5 align-items-center">
          <Col xs="12" md="6" className="text-center text-md-start mb-4 mb-md-0">
            <Image
              alt="CleanAR Solutions Logo"
              src={Logo}
              className="img-fluid"
              style={{ maxWidth: "350px", transition: "transform 0.3s" }}
              onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          </Col>
          <Col xs="12" md="6">
            <h1 className="text-primary fw-bold mb-3">
              {t("about.welcome_heading")}
            </h1>
            <p className="fs-5 text-secondary">
              {t("about.welcome_text")} <br />
              {t("about.partnership_text")}
            </p>
            <Link to="/products-and-services" className="btn btn-success mt-3">
              {t("about.learn_more_services")}
            </Link>
          </Col>
        </Row>
      </Container>

      {/* Story / Mission Section */}
      <Container className="my-5">
        <Row>
          <Col md="6">
            <h2 className="fw-bold">{t("about.mission_title")}</h2>
            <p className="fs-5 text-secondary">{t("about.mission_text")}</p>
            <h2 className="fw-bold mt-4">{t("about.vision_title")}</h2>
            <p className="fs-5 text-secondary">{t("about.vision_text")}</p>
          </Col>
          <Col md="6">
            <Card className="shadow-sm border-0 bg-transparent">
              <CardHeader className="bg-success text-white fw-bold">
                {t("about.values_title")}
              </CardHeader>
              <CardBody className="bg-transparent">
                <p className="fw-semibold">{t("about.values_intro")}</p>
                <ul className="list-unstyled bg-transparent">
                  {t("about.values_list", { returnObjects: true }).map(
                    (value, idx) => (
                      <li key={idx} className="mb-2">
                        <FaCheckCircle className="text-success me-2" />
                        {value}
                      </li>
                    )
                  )}
                </ul>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
      <Container className="my-5">
        <Row>
          <Col md="12" className="text-center">
      <p className="fs-6 text-cleanar-color mt-3">{t("issa.prefix")}
  {/* CleanAR Solutions is a proud member of */}
  {" "}
  <a
    href="https://issa-canada.com/en/issa-canada-en/about-issa-canada-en"
    target="_blank"
    rel="noopener noreferrer"
  >{t("issa.linkText")}
    {/* ISSA Canada, a division of ISSA – the worldwide cleaning industry association */}
  </a>{t("issa.suffix")}
  {/* . This membership reflects our ongoing commitment to professional standards
  in the cleaning industry. */}
</p>
          </Col>
        </Row>
      </Container>
      {/* Quick Stats / Differentiators */}
      <WhyChooseUs />

      {/* Industries We Serve */}
      <Container className="py-3 ">
        <h2 className="text-center fw-bold mb-4">
          {t("about.industries_title")}
        </h2>
        <Row>
          <Col md="4" className="mb-4">
            <Card className="h-100 shadow-sm border-0 bg-transparent">
              <CardHeader className="bg-secondary text-white fw-bold">
                {t("about.industries.residential.title")}
              </CardHeader>
              <ListGroup flush>
                {t("about.industries.residential.items", {
                  returnObjects: true,
                }).map((item, idx) => (
                  <ListGroupItem key={idx} className="bg-transparent">{item}</ListGroupItem>
                ))}
              </ListGroup>
            </Card>
          </Col>
          <Col md="4" className="mb-4">
            <Card className="h-100 shadow-sm border-0 bg-transparent">
              <CardHeader className="bg-primary text-white fw-bold">
                {t("about.industries.offices.title")}
              </CardHeader>
              <ListGroup flush>
                {t("about.industries.offices.items", {
                  returnObjects: true,
                }).map((item, idx) => (
                  <ListGroupItem key={idx} className="bg-transparent">{item}</ListGroupItem>
                ))}
              </ListGroup>
            </Card>
          </Col>
          <Col md="4" className="mb-4">
            <Card className="h-100 shadow-sm border-0 bg-transparent">
              <CardHeader className="bg-success text-white fw-bold">
                {t("about.industries.festivals.title")}
              </CardHeader>
              <ListGroup flush>
                {t("about.industries.festivals.items", {
                  returnObjects: true,
                }).map((item, idx) => (
                  <ListGroupItem key={idx} className="bg-transparent">{item}</ListGroupItem>
                ))}
              </ListGroup>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Call to Action */}
      <Container className="text-center py-5">
        <h2 className="fw-bold text-dark mb-3">
          {t("about.cta.ready")}
        </h2>
        <p className="text-bold mb-4">
          {t("about.cta.focus")}
        </p>
        <Button onClick={goToQuote} className="btn btn-lg primary-bg-color">
          {t("about.cta.quote")}
        </Button>
      </Container>
    </div>
  );
}

export default AboutUsPage;
