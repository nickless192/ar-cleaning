import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import {
  Row, Col, Card, CardBody, CardTitle, CardText, CardHeader,
  ListGroup, ListGroupItem, Container, Button, Input,
} from "reactstrap";
import { Image } from 'react-bootstrap';
// import "./../../assets/css/our-palette.css";
import Logo from "/src/assets/img/IC CLEAN AR-15-cropped.png";
import VisitorCounter from "/src/components/Pages/VisitorCounter.jsx";
// ...imports unchanged...

// Reusable Content Section
const ContentSection = ({ title, content, onEdit, isEditing, field }) => (
  <div className="content-section my-4 px-3">
    <h2 className="fs-3 fw-bold">{title}</h2>
    {isEditing ? (
      <Input
        type="textarea"
        value={content}
        onChange={(e) => onEdit(field, e.target.value)}
        rows={4}
        className="border border-primary-subtle bg-light"
      />
    ) : (
      <p className="fs-5 text-secondary">{content}</p>
    )}
  </div>
);

// Reusable Industry Card
const IndustryCard = ({ title, items, bgColor }) => (
  <Col xs="12" md="4" className="mb-4">
    <Card className={`h-100 shadow-sm ${bgColor}`}>
      <CardHeader tag="h4" className="fw-bold text-white">{title}</CardHeader>
      <ListGroup flush>
        {items.map((item, index) => (
          <ListGroupItem key={index} className="text-dark">{item}</ListGroupItem>
        ))}
      </ListGroup>
    </Card>
  </Col>
);

function AboutUsPage() {
  const { t } = useTranslation();
  const [isAdmin, setIsAdmin] = useState(true); // This should be dynamic
  const [content, setContent] = useState({
    welcomeText: t('about.welcome_text'),
    mission: t('about.mission_text'),
    vision: t('about.vision_text'),
    values_intro: t('about.values_intro'),
    values: t('about.values_list', { returnObjects: true }),
  });




  useEffect(() => {
    document.body.classList.add("index-page", "sidebar-collapse");
    return () => {
      document.body.classList.remove("index-page", "sidebar-collapse");
    };
  }, []);

  const industries = [
    {
      title: t("about.industries.residential.title"),
      bgColor: "bg-secondary",
      items: t("about.industries.residential.items", { returnObjects: true }),
    },
    {
      title: t("about.industries.offices.title"),
      bgColor: "bg-primary",
      items: t("about.industries.offices.items", { returnObjects: true }),
    },
    {
      title: t("about.industries.festivals.title"),
      bgColor: "bg-success",
      items: t("about.industries.festivals.items", { returnObjects: true }),
    },
  ];

  return (
    <div className="section pb-0 mb-0 bg-light">
      <VisitorCounter page="aboutuspage" />

      {/* Banner */}
      <Container>

      <Row className="px-4 py-5 align-items-center">
        <Col xs="12" md="6" className="text-center text-md-start mb-4 mb-md-0">
          <Image alt="CleanAR Solutions Logo" src={Logo} className="img-fluid" />
        </Col>
        <Col xs="12" md="6">
          <Card className="border-0 bg-light">
            <CardHeader className="bg-light">
              <CardTitle tag="h2" className="text-primary fw-bold">{t('about.welcome_heading')}</CardTitle>
            </CardHeader>
            <CardBody className="">
              <CardText className="fs-5 text-muted">
                
                  <span>{content.welcomeText}</span>
                
              </CardText>
              <Link to="/products-and-services" className="btn btn-outline-primary mt-3">
                {t('about.learn_more_services')}
              </Link>
            </CardBody>
          </Card>
        </Col>
      </Row>
      </Container>

      {/* Company Info */}
      <Container className="my-5">
        <Row>
          <Col>
            <ContentSection
              title={t('about.mission_title')}
              content={content.mission}
              field="mission"
            />
            <ContentSection
              title={t('about.vision_title')}
              content={content.vision}
              field="vision"
            />
            <div className="content-section my-4 px-3">
              <h2 className="fs-3 fw-bold">{t('about.values_title')}</h2>
              
                  <p className="fw-semibold">{content.values_intro}</p>
                  <ul>
                    {content.values.map((value, index) => (
                      <li key={index} className="text-secondary">{value}</li>
                    ))}
                  </ul>
                
            </div>
          </Col>
        </Row>
      </Container>

      {/* Industries */}
      <Container className="py-5">
        <h2 className="text-center text-dark mb-4">{t('about.industries_title')}</h2>
        <Row>
          {industries.map((industry, index) => (
            <IndustryCard key={index} {...industry} />
          ))}
        </Row>
      </Container>
    </div>
  );
}

export default AboutUsPage;
