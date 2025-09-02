// WhyChooseUs.jsx
import React from "react";
import { Row, Col, Card, CardBody } from "reactstrap";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaLeaf, FaUserShield, FaClock, FaCheckCircle } from "react-icons/fa";

function WhyChooseUs() {
  const { t } = useTranslation();

  const benefits = [
    {
      icon: <FaLeaf className="fs-2 text-success" />,
      title: t("whyChooseUs.benefits.ecoFriendly.title"),
      desc: t("whyChooseUs.benefits.ecoFriendly.desc")
    },
    {
      icon: <FaUserShield className="fs-2 text-primary" />,
      title: t("whyChooseUs.benefits.trustedProfessionals.title"),
      desc: t("whyChooseUs.benefits.trustedProfessionals.desc")
    },
    {
      icon: <FaClock className="fs-2 text-warning" />,
      title: t("whyChooseUs.benefits.flexibleScheduling.title"),
      desc: t("whyChooseUs.benefits.flexibleScheduling.desc")
    },
    {
      icon: <FaCheckCircle className="fs-2 text-info" />,
      title: t("whyChooseUs.benefits.satisfactionGuaranteed.title"),
      desc: t("whyChooseUs.benefits.satisfactionGuaranteed.desc")
    }
  ];

  return (
    <div className="py-3 bg-light px-2">
      <h2 className="text-center mb-4">{t("whyChooseUs.heading")}</h2>
      <Row className="justify-content-center">
        {benefits.map((b, i) => (
          <Col xs="12" md="3" key={i} className="mb-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="shadow-sm text-center py-1 h-100">
                <CardBody>
                  {b.icon}
                  <h5 className="mt-3">{b.title}</h5>
                  <p className="text-muted">{b.desc}</p>
                </CardBody>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default WhyChooseUs;
