
// WhyChooseUs.jsx
import React, { useState } from "react";
import { Row, Col, Card, CardBody, Button, Collapse } from "reactstrap";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaLeaf, FaUserShield, FaClock, FaCheckCircle, FaChevronDown } from "react-icons/fa";
import NewIconAnimated from "/src/components/Pages/Navigation/NewIconAnimated";
import issaLogo from "/src/assets/img/ISSA_CANADA_LogoCMYK.jpg";

function WhyChooseUs() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const benefits = [
    {
      icon: <FaLeaf className="fs-2 text-success" />,
      title: t("whyChooseUs.benefits.ecoFriendly.title"),
      desc: t("whyChooseUs.benefits.ecoFriendly.desc"),
    },
    {
      icon: <FaUserShield className="fs-2 text-primary" />,
      title: t("whyChooseUs.benefits.trustedProfessionals.title"),
      desc: t("whyChooseUs.benefits.trustedProfessionals.desc"),
    },
    {
      icon: <FaClock className="fs-2 text-warning" />,
      title: t("whyChooseUs.benefits.flexibleScheduling.title"),
      desc: t("whyChooseUs.benefits.flexibleScheduling.desc"),
    },
    {
      icon: <FaCheckCircle className="fs-2 text-info" />,
      title: t("whyChooseUs.benefits.satisfactionGuaranteed.title"),
      desc: t("whyChooseUs.benefits.satisfactionGuaranteed.desc"),
    },
    // {
    //   icon: <div className="issa-membership-badge__logo-wrapper">
    //           <img
    //             src={issaLogo}
    //             alt="ISSA Canada Member"
    //             className="issa-membership-badge__logo"
    //             loading="lazy"
    //           />
    //         </div>,
    //   title: 'CleanAR Solutions is a proud ISSA Canada Member',
    //   desc: 'As members of ISSA Canada – the national division of the worldwide cleaning industry association – we follow recognized best practices for quality, safety, and professionalism in every service we provide.',
    // }
  ];

  return (
    <div className="py-2 px-1 mt-4 rounded-4">
      {/* Title as Toggle Button */}
      {/* <div className="text-center mb-4">
        <Button
          color="primary"
          size="lg"
          className="rounded-pill shadow-sm montserrat-bold"
          onClick={() => setIsOpen(!isOpen)}
        >
          {t("whyChooseUs.heading")}
        </Button>
      </div> */}
      <div className="text-center mb-4">
        <motion.button
          className="why-choose-btn d-inline-flex align-items-center gap-2"
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {t("whyChooseUs.heading")}
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <FaChevronDown />
          </motion.span>
        </motion.button>
      </div>


      {/* Collapsible Section */}
      <Collapse isOpen={isOpen}>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Row className="justify-content-center">
                {benefits.map((b, i) => (
                  <Col xs="12" md="3" key={i} className="mb-3">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card className="shadow-sm text-center py-3 h-100 hover-shadow transition-all">
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
            </motion.div>
          )}
        </AnimatePresence>
      </Collapse>
    </div>
  );
}

export default WhyChooseUs;
