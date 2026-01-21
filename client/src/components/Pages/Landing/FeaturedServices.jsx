// FeaturedServices.jsx
import React, {useState} from "react";
import { Row, Col, Card, CardBody, CardImg } from "reactstrap";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import carpetCleaningBg from "/src/assets/img/carpet-cleaning.jpg";
import residentialCleaningBg from "/src/assets/img/residential-cleaning.jpg";
import commercialCleaningBg from "/src/assets/img/commercial-cleaning.jpg";
import NewIconAnimated from "/src/components/Pages/Navigation/NewIconAnimated";

function FeaturedServices() {
  const { t } = useTranslation();
  const services = [
    {
      title: t("products_and_services.carpet_cleaning_title"),
      img: carpetCleaningBg,
      link: "/products-and-services#carpet",
    },
    {
      title: t("products_and_services.residential_cleaning_title"),
      img: residentialCleaningBg,
      link: "/products-and-services#moveout",
    },
    {
      title: t("products_and_services.commercial_cleaning_title"),
      img: commercialCleaningBg,
      link: "/products-and-services#commercial",
    }
  ];
  return (
    <div className="py-5 px-2">
      <h2 className="text-center mb-4 secondary-color montserrat-bold">{t("featuredServices.heading")}</h2>
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
                  <h5 className="montserrat-bold secondary-color">{s.title}</h5>
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
