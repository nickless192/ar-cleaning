import React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import { FaHandshake, FaCheckCircle } from "react-icons/fa";
import { useTranslation, Trans } from "react-i18next";

const CQCCCertificationBadge = ({ className = "", layout = "horizontal" }) => {
  const { t } = useTranslation();

  return (
    <Card className={`shadow-sm border-0 ${className}`}>
      <CardHeader className="bg-dark text-white fw-bold d-flex align-items-center">
        <FaHandshake className="me-2" />
        {t("cqcc.cardTitle")}
      </CardHeader>

      <CardBody className="bg-transparent">
        <div className={layout === "horizontal" ? "row align-items-start" : ""}>
          <div className={layout === "horizontal" ? "col-md-8" : ""}>
            <p className="mb-2 text-secondary">
              <Trans i18nKey="cqcc.description1" components={{ strong: <strong /> }} />
            </p>

            <p className="mb-0 text-secondary">
              <Trans i18nKey="cqcc.description2" components={{ strong: <strong /> }} />
            </p>

            <div className="mt-3">
              <small className="text-muted">
                {t("cqcc.confidentialNote")}
              </small>
            </div>
          </div>

          <div className={layout === "horizontal" ? "col-md-4 mt-3 mt-md-0" : "mt-3"}>
            <div className="p-3 rounded border bg-light">
              <div className="fw-bold mb-2">{t("cqcc.benefitsTitle")}</div>
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <FaCheckCircle className="me-2 text-success" />
                  {t("cqcc.benefits.procurement")}
                </li>
                <li className="mb-2">
                  <FaCheckCircle className="me-2 text-success" />
                  {t("cqcc.benefits.reporting")}
                </li>
                <li className="mb-0">
                  <FaCheckCircle className="me-2 text-success" />
                  {t("cqcc.benefits.network")}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default CQCCCertificationBadge;
