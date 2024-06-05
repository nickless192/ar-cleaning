import React from "react";
import {
  // Container,
  Row,
  Col
} from "reactstrap";
import "./../../assets/css/our-palette.css";

import Navbar from "components/Pages/Navbar.js";
import Footer from "components/Pages/Footer.js";
// import AboutUsPage from "components/Pages/AboutUsPage";
// import ProfilePage from "components/Pages/ProfilePage";

function AboutUsPage() {


  React.useEffect(() => {
    document.body.classList.add("index-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    // initializeServices();
    return function cleanup() {
      document.body.classList.remove("index-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  return (
    <>
      <Navbar />
      {/* <div className="page-header clear-filter" filter-color="blue"> */}
      <div
        className="page-header-image"
        style={{
          backgroundImage: "url(" + require("assets/img/stock-photo-professional-cleaners-safety-protocols-wearing-protection-suits-while-sanitizing-furniture.jpg") + ")",
          // backgroundRepeat: "repeat",
          // backgroundSize: "auto"
        }}
      >
        <div className="">
          {/* <div className="content"> */}
          <div className="section section-about-us bg-info">
            {/* <Container> */}
            <Row>
              <Col className="ml-auto mr-auto text-center" md="8" lg="6">
                <h2 className="title text-dark"> </h2>
                <p className="description test-secondary">
                  At KleanMart Services, we are dedicated to providing professional and reliable cleaning services in Toronto and the GTA area. With a focus on excellence and customer satisfaction, we strive to exceed expectations on every project, delivering impeccable results and exceptional service.
                </p>
              </Col>
            </Row>
            {/* </Container> */}
          </div>
          <div className="section section-industries ">

            <h2 className="title text-center text-dark">Industries We Serve</h2>
            <Row>
              <Col md="4">
                <h3 className="text-dark">Residential Buildings</h3>
                <ul className="text-dark">
                  <li>General Cleaning: Complete cleaning of common areas such as lobbies, hallways, stairs, and recreational areas.</li>
                  <li>Exterior Area Maintenance: Cleaning of sidewalks, courtyards, and parking areas.</li>
                  <li>Trash Management: Collection and proper disposal of waste and garbage.</li>
                  <li>Special Area Cleaning: Cleaning of laundry areas, pools, gyms, and meeting rooms.</li>
                  <li>Special Services: Carpet cleaning, cleaning of carpets and furniture in common areas.</li>
                </ul>
              </Col>
              <Col md="4">
                <h3 className="text-dark">Offices</h3>
                <ul className="text-dark">
                  <li>Daily Cleaning: Cleaning of desks, tables, chairs, and break areas.</li>
                  <li>Floor Maintenance: Sweeping, mopping, and polishing of floors.</li>
                  <li>Bathroom Cleaning: Disinfection and deep cleaning of bathrooms and sanitary areas.</li>
                  <li>Surface Cleaning: Cleaning of windows, doors, and other glass and metal surfaces.</li>
                  <li>Special Services: Cleaning of electronic equipment, air duct cleaning, and maintenance of kitchen areas.</li>
                </ul>
              </Col>
              <Col md="4">
                <h3 className="text-dark">Shopping Centers</h3>
                <ul className="text-dark">
                  <li>Common Area Cleaning: Cleaning of corridors, escalators, and rest areas.</li>
                  <li>Store Maintenance: Cleaning of shop windows, display areas, and customer service counters.</li>
                  <li>Bathroom Cleaning: Disinfection and cleaning of public bathrooms and rest areas.</li>
                  <li>Food Area Cleaning: Cleaning of dining areas, tables, and kitchen areas.</li>
                  <li>Special Services: Carpet cleaning in high-traffic areas, cleaning of fountains and water areas, and cleaning of playgrounds.</li>
                </ul>
              </Col>
            </Row>
            <Row>
              <Col md="4">
                <h3 className="text-dark">Festivals</h3>
                <ul className="text-dark">
                  <li>Pre-Event Cleaning: Cleaning of the event area before its start, including garbage collection and grounds cleaning.</li>
                  <li>Event Maintenance: Continuous maintenance of bathrooms, rest areas, and food areas during the event.</li>
                  <li>Post-Event Cleaning: Thorough cleaning of the event area after its conclusion, including garbage collection and site sanitation.</li>
                  <li>Waste Management: Proper disposal of waste and garbage generated during the event.</li>
                  <li>Special Services: Cleaning of performance areas, backstage areas, and VIP areas.</li>
                </ul>
              </Col>
              <Col md="4">
                <h3 className="text-dark">Film Industry</h3>
                <ul className="text-dark">
                  <li>Set Cleaning: Cleaning of filming sets before, during, and after production.</li>
                  <li>Location Maintenance: Regular maintenance of filming locations, including cleaning of common and exterior areas.</li>
                  <li>Waste Management: Proper disposal of waste and garbage generated during filming.</li>
                  <li>Specialized Cleaning: Stain removal, carpet cleaning, and cleaning of delicate areas such as makeup sets and dressing rooms.</li>
                  <li>Emergency Services: Availability for emergency cleaning services during film production and events.</li>
                </ul>
              </Col>
              {/* Add more industries as needed */}
            </Row>

          </div>
          <div className="section section-services bg-success">

            <h2 className="title text-center text-dark">Our Services</h2>
            <Row>
              <Col md="4">
                <h3 className="text-dark">Residential Cleaning</h3>
                <ul className="text-dark">
                  <li>Complete cleaning of homes, apartments, and condominiums.</li>
                  <li>Carpet Cleaning to revitalize and maintain the freshness of carpets.</li>
                  <li>Furniture cleaning to preserve its beauty and prolong its lifespan.</li>
                </ul>
              </Col>
              <Col md="4">
                <h3 className="text-dark">Commercial Cleaning</h3>
                <ul className="text-dark">
                  <li>Regular maintenance of offices and commercial spaces.</li>
                  <li>Cleaning of shopping centers and supermarkets.</li>
                  <li>Specialized services for the film industry and special events.</li>
                </ul>
              </Col>
              <Col md="4">
                <h3 className="text-dark">Specialized Cleaning</h3>
                <ul className="text-dark">
                  <li>Cleaning contracts for real estate developers and condominiums.</li>
                  <li>Carpet Cleaning at large events and festivals.</li>
                  <li>High-end furniture cleaning in residences and commercial spaces.</li>
                </ul>
              </Col>
            </Row>

          </div>
          <div className="section section-additional-info ">

            {/* <h2 className="title text-center text-dark">Additional Information</h2> */}
            <p className="test-primary">
              Our services are designed to meet the unique needs of our clients, providing personalized solutions and exceptional results on every project. At KleanMart Services, we take pride in offering reliable and high-quality service that ensures the impeccable cleanliness and maintenance of any space.
            </p>

          </div>
          {/* <LandingPage /> */}
          {/* <ProfilePage /> */}
          {/* </div> */}


        </div>
          <Footer />
      </div>
      {/* </div> */}
    </>
  );
}

export default AboutUsPage;
