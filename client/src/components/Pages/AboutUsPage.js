import React from "react";

import {
  // Container,
  Row,
  Col,
  Container,
  Card,
  CardBody,
  CardTitle,
  CardText,
  CardHeader,
  ListGroup,
  ListGroupItem,
  // Image

} from "reactstrap";
import {
  Image
} from 'react-bootstrap';
import "./../../assets/css/our-palette.css";
import Logo from "../../assets/img/logo.png";

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
      {/* <div
        className="page-header-image"
        style={{
          backgroundImage: "url(" + require("assets/img/stock-photo-professional-cleaners-safety-protocols-wearing-protection-suits-while-sanitizing-furniture.jpg") + ")",
          // backgroundRepeat: "repeat",
          // backgroundSize: "auto"
        }}
      > */}
      <div className="section pb-0">
        {/* <div className="content"> */}
          <Row className="section py-0 pr-5">
            <Col className="pr-0">
            {/* <div className="logo-container"> */}
              <Image
                alt="..."
                src={Logo}
                className="logo-size pr-0"
              // sizes="sm"

              />
            {/* </div> */}
            </Col>
            <Col className="">
              <p className="text-bold pt-5 secondary-color ">
                At CleanAR Solutions, we are dedicated to providing professional and reliable cleaning services in Toronto and the Greater Toronto Area. With a steadfast focus on excellence and customer satisfaction, we strive to exceed expectations on every project, delivering impeccable results and exceptional service. Our team of experienced and skilled professionals is committed to ensuring your space is not only clean but also a healthy and pleasant environment.
                <br />
                <br />

                Whether you need residential, commercial, or specialized cleaning services, we tailor our approach to meet your unique needs and ensure your complete satisfaction. Ready to experience the CleanAR difference? Click on "Request Quote" from the top navigation bar to get started. Still have questions? Feel free to contact us via email or phone. Our friendly team is here to answer any questions and help you find the perfect cleaning solution for your needs.
              </p>
            </Col>
          </Row>
        <div className="py-2 px-5 light-bg-color">  
          <p className="text-cleanar-color">
            Our services are designed to meet the unique needs of our clients, providing personalized solutions and exceptional results on every project. At CleanAR Solutions, we take pride in offering reliable and high-quality service that ensures the impeccable cleanliness and maintenance of any space. Get started by requesting a quote, or log in to your account to manage your existing quotes and services. Have questions? Contact us today to speak with a member of our team. We are here to help you find the perfect cleaning solution for your needs.
          </p>
        </div>


      </div>
      <Footer />
    </>
  );
}

export default AboutUsPage;
