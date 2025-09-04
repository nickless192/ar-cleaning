import React from "react";
import { Accordion, Card, Container } from "react-bootstrap";
import { FiChevronDown } from "react-icons/fi";
import { MdCleaningServices } from "react-icons/md";
import { FaKey, FaDollarSign } from "react-icons/fa";
import { useTranslation } from "react-i18next";



function FAQAccordion() {
    const { t } = useTranslation();
    const categories = {
  [t("faq.services_header")]: [
    { q: t("faq.services_q1"), a: t("faq.services_a1") },
    { q: t("faq.services_q2"), a: t("faq.services_a2") },
    { q: t("faq.services_q3"), a: t("faq.services_a3") },
    { q: t("faq.services_q4"), a: t("faq.services_a4") },
    { q: t("faq.services_q5"), a: t("faq.services_a5") },
  ],
  [t("faq.process_header")]: [
    { q: t("faq.process_q1"), a: t("faq.process_a1") },
    { q: t("faq.process_q2"), a: t("faq.process_a2") },
    { q: t("faq.process_q3"), a: t("faq.process_a3") },
    { q: t("faq.process_q4"), a: t("faq.process_a4") },
    { q: t("faq.process_q5"), a: t("faq.process_a5") },
  ],
  [t("faq.pricing_header")]: [
    { q: t("faq.pricing_q1"), a: t("faq.pricing_a1") },
    { q: t("faq.pricing_q2"), a: t("faq.pricing_a2") },
    { q: t("faq.pricing_q3"), a: t("faq.pricing_a3") },
    { q: t("faq.pricing_q4"), a: t("faq.pricing_a4") },
    { q: t("faq.pricing_q5"), a: t("faq.pricing_a5") },
  ]
};
  return (
    <Container className="mb-0 pb-0">
      <h2 className="text-center fw-bold mb-4">{t("faq.heading")}</h2>

      {Object.entries(categories).map(([category, items], cIdx) => {
        const Icon =
          category === "Services"
            ? MdCleaningServices
            : category === "Process & Policies"
            ? FaKey
            : FaDollarSign;

        return (
          <div key={cIdx} className="mb-5">
            <h4 className="d-flex align-items-center mb-3">
              <Icon className="me-2 text-success" size={22} />
              {category}
            </h4>
            <Accordion alwaysOpen>
              {items.map((faq, idx) => (
                <Accordion.Item eventKey={`${cIdx}-${idx}`} key={idx}>
                  <Accordion.Header>
                    <span className="fw-semibold">{faq.q}</span>
                  </Accordion.Header>
                  <Accordion.Body className="text-muted">
                    {faq.a}
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </div>
        );
      })}
    </Container>
  );
}

export default FAQAccordion;
