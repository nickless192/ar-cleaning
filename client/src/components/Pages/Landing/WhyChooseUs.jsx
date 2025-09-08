// // WhyChooseUs.jsx
// import React from "react";
// import { Row, Col, Card, CardBody } from "reactstrap";
// import { motion } from "framer-motion";
// import { useTranslation } from "react-i18next";
// import { FaLeaf, FaUserShield, FaClock, FaCheckCircle } from "react-icons/fa";

// function WhyChooseUs() {
//   const { t } = useTranslation();

//   const benefits = [
//     {
//       icon: <FaLeaf className="fs-2 text-success" />,
//       title: t("whyChooseUs.benefits.ecoFriendly.title"),
//       desc: t("whyChooseUs.benefits.ecoFriendly.desc")
//     },
//     {
//       icon: <FaUserShield className="fs-2 text-primary" />,
//       title: t("whyChooseUs.benefits.trustedProfessionals.title"),
//       desc: t("whyChooseUs.benefits.trustedProfessionals.desc")
//     },
//     {
//       icon: <FaClock className="fs-2 text-warning" />,
//       title: t("whyChooseUs.benefits.flexibleScheduling.title"),
//       desc: t("whyChooseUs.benefits.flexibleScheduling.desc")
//     },
//     {
//       icon: <FaCheckCircle className="fs-2 text-info" />,
//       title: t("whyChooseUs.benefits.satisfactionGuaranteed.title"),
//       desc: t("whyChooseUs.benefits.satisfactionGuaranteed.desc")
//     }
//   ];

//   return (
//     <div className="py-5 secondary-bg-color px-5 mt-4 rounded-4">
//       <h2 className="text-center mb-4 montserrat-bold primary-color">{t("whyChooseUs.heading")}</h2>
//       <Row className="justify-content-center">
//         {benefits.map((b, i) => (
//           <Col xs="12" md="3" key={i} className="mb-3">
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ delay: i * 0.1 }}
//             >
//               <Card className="shadow-sm text-center py-1 h-100">
//                 <CardBody>
//                   {b.icon}
//                   <h5 className="mt-3">{b.title}</h5>
//                   <p className="text-muted">{b.desc}</p>
//                 </CardBody>
//               </Card>
//             </motion.div>
//           </Col>
//         ))}
//       </Row>
//     </div>
//   );
// }

// export default WhyChooseUs;

// WhyChooseUs.jsx
import React, { useState } from "react";
import { Row, Col, Card, CardBody, Button, Collapse } from "reactstrap";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaLeaf, FaUserShield, FaClock, FaCheckCircle, FaChevronDown  } from "react-icons/fa";

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
  ];

  return (
    <div className="py-5 px-4 mt-4 rounded-4">
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
