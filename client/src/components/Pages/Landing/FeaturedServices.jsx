import React from "react";
import { Row, Col, Card, CardBody } from "reactstrap";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import carpetAvif from "/src/assets/img/optimized/carpet-cleaning.avif";
import carpetWebp from "/src/assets/img/optimized/carpet-cleaning.webp";
import carpetJpg from "/src/assets/img/carpet-cleaning.jpg";

import residentialAvif from "/src/assets/img/optimized/residential-cleaning.avif";
import residentialWebp from "/src/assets/img/optimized/residential-cleaning.webp";
import residentialJpg from "/src/assets/img/residential-cleaning.jpg";

import commercialAvif from "/src/assets/img/optimized/commercial-cleaning.avif";
import commercialWebp from "/src/assets/img/optimized/commercial-cleaning.webp";
import commercialJpg from "/src/assets/img/commercial-cleaning.jpg";

function FeaturedServices() {
  const { t } = useTranslation();

  const services = [
    {
      title: t("products_and_services.carpet_cleaning_title"),
      avif: carpetAvif,
      webp: carpetWebp,
      fallback: carpetJpg,
      link: "/products-and-services#carpet",
      width: 1024,
      height: 683,
    },
    {
      title: t("products_and_services.residential_cleaning_title"),
      avif: residentialAvif,
      webp: residentialWebp,
      fallback: residentialJpg,
      link: "/products-and-services#residential",
      width: 5906,
      height: 3937,
    },
    {
      title: t("products_and_services.commercial_cleaning_title"),
      avif: commercialAvif,
      webp: commercialWebp,
      fallback: commercialJpg,
      link: "/products-and-services#commercial",
      width: 4536,
      height: 3024,
    },
  ];

  return (
    <div className="py-5 px-2">
      <h2 className="text-center mb-4 secondary-color montserrat-bold">
        {t("featuredServices.heading")}
      </h2>

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
                <picture>
                  <source srcSet={s.avif} type="image/avif" />
                  <source srcSet={s.webp} type="image/webp" />
                  <img
                    src={s.fallback}
                    alt={s.title}
                    width={s.width}
                    height={s.height}
                    loading="lazy"
                    decoding="async"
                    className="card-img-top"
                    sizes="(max-width: 767px) 92vw, (max-width: 1200px) 30vw, 360px"
                    style={{ width: "100%", height: "auto" }}
                  />
                </picture>

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