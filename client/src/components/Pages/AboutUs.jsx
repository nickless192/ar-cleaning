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

// Reusable Content Section Component
const ContentSection = ({ title, content, onEdit, isEditing, field }) => (
  <div className="content-section">
    {isEditing ? (
      <>
        <h2>{title}</h2>
        <Input
          type="textarea"
          value={content}
          onChange={(e) => onEdit(field, e.target.value)}
          rows={5}
          className="mb-3"
        />
      </>
    ) : (
      <>
        <h2>{title}</h2>
        <div>{content}</div> {/* Use div instead of p to avoid potential nesting */}
      </>
    )}
  </div>
);

// Reusable Industry Card Component
const IndustryCard = ({ title, items, bgColor }) => (
  <Col>
    <Card className={bgColor} inverse>
      <CardHeader tag="h3" className="mx-2">{title}</CardHeader>
      <ListGroup>
        {items.map((item, index) => (
          <ListGroupItem key={index} className="text-dark">{item}</ListGroupItem>
        ))}
      </ListGroup>
    </Card>
  </Col>
);

function AboutUsPage({ isAdmin = false }) {
  const { t } = useTranslation();

  const [content, setContent] = useState({
    welcomeText: t('about.welcome_text'),
    mission: t('about.mission_text'),
    vision: t('about.vision_text'),
    values_intro: t('about.values_intro'),
    values: t('about.values_list', { returnObjects: true }),
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleEditChange = (field, value) => {
    setContent((prev) => ({ ...prev, [field]: value }));
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const saveChanges = () => {
    setIsEditing(false);
    alert("Changes saved! (Simulated)");
  };

  useEffect(() => {
    document.body.classList.add("index-page", "sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    document.body.scrollTop = 0;

    return () => {
      document.body.classList.remove("index-page", "sidebar-collapse");
    };
  }, []);

  const industries = [
    {
      title: t("about.industries.residential.title"),
      bgColor: "secondary-bg-color",
      items: t("about.industries.residential.items", { returnObjects: true }),
    },
    {
      title: t("about.industries.offices.title"),
      bgColor: "primary-bg-color",
      items: t("about.industries.offices.items", { returnObjects: true }),
    },
    {
      title: t("about.industries.festivals.title"),
      bgColor: "secondary-bg-color",
      items: t("about.industries.festivals.items", { returnObjects: true }),
    },
  ];

  return (
    <div className="section pb-0 mb-0" role="main">
      <VisitorCounter page="aboutuspage" />
      
      {isAdmin && (
        <div className="admin-controls text-center mb-3">
          <Button color="primary" onClick={toggleEditMode}>
            {isEditing ? "Cancel" : "Edit Content"}
          </Button>
          {isEditing && (
            <Button color="success" onClick={saveChanges} className="ml-2">
              Save Changes
            </Button>
          )}
        </div>
      )}

      <Row className="content-row py-0 px-5" role="banner">
        <Col xs="12" md="6" className="logo-col d-flex align-items-center justify-content-center">
          <Image alt="CleanAR Solutions Logo" src={Logo} className="logo-image pr-0" />
        </Col>
        <Col xs="12" md="6" className="text-col ">
          <Card className="card-plain">
            <CardHeader>
              <CardTitle tag="h3" className="text-bold">{t('about.welcome_heading')}</CardTitle>
            </CardHeader>
            <CardBody>
              <CardText>
                {isEditing ? (
                  <Input
                    type="textarea"
                    value={content.welcomeText}
                    onChange={(e) => handleEditChange("welcomeText", e.target.value)}
                    rows={5}
                  />
                ) : (
                  <span>{t('about.welcome_text')}</span>
                )}
              </CardText>
              {/* <Link to="/request-quote" className="btn primary-bg-color">Request a Quote</Link> */}
              <Link to="/products-and-services" className="btn secondary-bg-color">{t('about.learn_more_services')}</Link>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Container role="region" aria-label="Company Information">
        <Row>
          <Col>
            <ContentSection
              title={t('about.mission_title')}
              content={t('about.mission_text')}
              onEdit={handleEditChange}
              isEditing={isEditing && isAdmin}
              field="mission"
            />
            <ContentSection
              title={t('about.vision_title')}
              content={t('about.vision_text')}
              onEdit={handleEditChange}
              isEditing={isEditing && isAdmin}
              field="vision"
            />
            <div className="content-section">
              <h2>{t('about.values_title')}</h2>
              {isEditing && isAdmin ? (
                <Input
                  type="textarea"
                  value={content.values}
                  onChange={(e) => handleEditChange("values", e.target.value)}
                  rows={5}
                  className="mb-3"
                />
              ) : (
                <>
                  <div><strong>{t('about.values_intro')}</strong></div>
                  <ul>
                    {content.values.map((value, index) => (
                      <li key={index}>{t(`about.values_list.${index}`)}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </Col>
        </Row>
      </Container>

      <Container className="product-selector" role="region" aria-label="Industries We Serve">
        <h2 className="title text-center text-dark my-0 pb-2">{t('about.industries_title')}</h2>
        <Row className="my-0">
          {industries.map((industry, index) => (
            <IndustryCard
              key={index}
              title={industry.title}
              items={industry.items}
              bgColor={industry.bgColor}
            />
          ))}
        </Row>
      </Container>
    </div>
  );
}

export default AboutUsPage;