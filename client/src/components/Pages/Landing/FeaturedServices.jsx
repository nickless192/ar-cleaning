// FeaturedServices.jsx
import React, {useState} from "react";
import { Row, Col, Card, CardBody, CardImg } from "reactstrap";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { t } from "i18next";

const [services, setServices] = useState([
  {
    title: t("products_and_services.carpet_cleaning_title"),
    img: "/src/assets/img/stock-photo-high-angle-view-person-cleaning-white-carpet-professional-vacuum-cleaner.jpg",
    link: "/products-and-services#carpet",
  },
  {
    title: t("products_and_services.residential_cleaning_title"),
    img: "/src/assets/img/man-servant-cleaning-house.jpg",
    link: "/products-and-services#moveout",
  },
  {
    title: t("products_and_services.commercial_cleaning_title"),
    img: "/src/assets/img/full-shot-people-cleaning-office.jpg",
    link: "/products-and-services#commercial",
  }
]);

function FeaturedServices() {
  return (
    <div className="py-3 px-2">
      <h2 className="text-center mb-4">{t("featuredServices.heading")}</h2>
      <Row className="justify-content-center">
        {services.map((s, i) => (
          <Col xs="12" md="4" key={i} className="mb-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="shadow-sm service-card h-100">
                <CardImg top src={s.img} alt={s.title} />
                <CardBody className="text-center">
                  <h5>{s.title}</h5>
                  <Link to={s.link} className="btn btn-outline-success mt-2">
                    {t("featuredServices.learnMore")}
                  </Link>
                </CardBody>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default FeaturedServices;
