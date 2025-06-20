import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Row, Col, Card, CardBody, CardTitle, CardText, CardHeader,
  ListGroup, ListGroupItem, Container, Button, Input,
} from "reactstrap";
import { Image } from 'react-bootstrap';
// import "./../../assets/css/our-palette.css";
import Logo from "../../assets/img/logo.png";
import VisitorCounter from "/src/components/Pages/VisitorCounter.jsx";

// Reusable Content Section Component
const ContentSection = React.memo(({ title, content, onEdit, isEditing, field }) => (
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
));

// Reusable Industry Card Component
const IndustryCard = React.memo(({ title, items, bgColor }) => (
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
));

function AboutUsPage({ isAdmin = false }) {
  const [content, setContent] = useState({
    welcomeText: "At CleanAR Solutions, we provide professional cleaning services in Toronto and the GTA. Our focus on excellence ensures every project meets the highest standards, creating a clean and healthy environment. Whether you need residential, commercial, or carpet cleaning, we customize our approach to meet your needs. Get started by requesting a quote, or contact us for more information.",
    mission: "Our mission is to transform spaces into cleaner, healthier, and more welcoming environments. We achieve this by offering customizable, high-quality cleaning services that are tailored to our clients’ needs while staying true to our commitment to sustainability and excellence.",
    vision: "Our vision is to become Toronto’s most trusted and innovative cleaning service provider, setting the standard for excellence while contributing to a cleaner, greener, and happier community.",
    values: "Integrity: We conduct our business with honesty, transparency, and accountability.\nQuality: We deliver top-tier cleaning services with attention to detail and excellence.\nCustomer Focus: We prioritize our clients’ unique needs, building trust through personalized solutions.\nSustainability: We promote eco-friendly cleaning practices to protect our environment.\nTeamwork: We value collaboration, respect, and unity to achieve success together.",
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
      title: "Residential Buildings",
      bgColor: "secondary-bg-color",
      items: [
        "General Cleaning: Complete cleaning of common areas such as lobbies, hallways, stairs, and recreational areas.",
        "Exterior Area Maintenance: Cleaning of sidewalks, courtyards, and parking areas.",
        "Trash Management: Collection and proper disposal of waste and garbage.",
      ],
    },
    {
      title: "Offices",
      bgColor: "primary-bg-color",
      items: [
        "Daily Cleaning: Cleaning of desks, tables, chairs, and break areas.",
        "Floor Maintenance: Sweeping, mopping, and polishing of floors.",
        "Bathroom Cleaning: Disinfection and deep cleaning of bathrooms and sanitary areas.",
      ],
    },
    {
      title: "Festivals",
      bgColor: "secondary-bg-color",
      items: [
        "Pre-Event Cleaning: Cleaning of the event area before its start, including garbage collection and grounds cleaning.",
        "Event Maintenance: Continuous maintenance of bathrooms, rest areas, and food areas during the event.",
        "Post-Event Cleaning: Thorough cleaning of the event area after its conclusion, including garbage collection and site sanitation.",
      ],
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
              <CardTitle tag="h3" className="text-bold">Welcome to CleanAR Solutions</CardTitle>
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
                  <span>{content.welcomeText}</span> 
                )}
              </CardText>
              {/* <Link to="/request-quote" className="btn primary-bg-color">Request a Quote</Link> */}
              <Link to="/products-and-services" className="btn secondary-bg-color">Learn More About Our Services</Link>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Container role="region" aria-label="Company Information">
        <Row>
          <Col>
            <ContentSection
              title="Our Mission"
              content={content.mission}
              onEdit={handleEditChange}
              isEditing={isEditing && isAdmin}
              field="mission"
            />
            <ContentSection
              title="Our Vision"
              content={content.vision}
              onEdit={handleEditChange}
              isEditing={isEditing && isAdmin}
              field="vision"
            />
            <div className="content-section">
              <h2>Our Values</h2>
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
                  <div><strong>At CleanAR Solutions, we are guided by the following values:</strong></div>
                  <ol>
                    {content.values.split('\n').map((value, index) => (
                      <li key={index}>{value}</li>
                    ))}
                  </ol>
                </>
              )}
            </div>
          </Col>
        </Row>
      </Container>

      <Container className="product-selector" role="region" aria-label="Industries We Serve">
        <h2 className="title text-center text-dark my-0 pb-2">Industries We Serve</h2>
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