// src/components/Pages/Blog/CleanARJoinsISSACanada.jsx
import React, { useEffect } from "react";
import { Container, Row, Col } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";

import VisitorCounter from "/src/components/Pages/Management/VisitorCounter.jsx";
import ISSAMembershipBadge from "/src/components/Pages/Certifications/ISSAMembershipBadge.jsx";

function CleanARJoinsISSACanada() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    document.body.classList.add("index-page", "sidebar-collapse");
    return () => {
      document.body.classList.remove("index-page", "sidebar-collapse");
    };
  }, []);

  return (
    <div className="section pb-0 mb-0 light-bg-color-opaque">
      <VisitorCounter page="blog_cleanar_joins_issa_canada" />

      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md="10" lg="8">
            <p className="text-uppercase text-muted small fw-semibold mb-2">
              {t("blogISSA.meta")}
            </p>

            <button
              onClick={() => navigate(-1)}
              className="btn btn-link p-0 mb-3 text-decoration-none"
              type="button"
            >
              {t("blogISSA.back")}
            </button>

            <h1 className="fw-bold mb-3">{t("blogISSA.title")}</h1>

            <p className="text-secondary mb-4">
              <Trans
                i18nKey="blogISSA.intro"
                components={{
                  strong: <strong />,
                  issaLink: (
                    <a
                      href="https://www.issa.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                }}
              />
            </p>

            <ISSAMembershipBadge className="mb-4" layout="stacked" />

            <h2 className="fw-bold mt-4 mb-3">{t("blogISSA.whoTitle")}</h2>

            <p className="text-secondary">
              <Trans
                i18nKey="blogISSA.whoP1"
                components={{
                  strong: <strong />,
                  em: <em />,
                }}
              />
            </p>

            <p className="text-secondary">
              <Trans
                i18nKey="blogISSA.whoP2"
                components={{
                  strong: <strong />,
                  issaCanadaLink: (
                    <a
                      href="https://issa-canada.com/en/issa-canada-en/about-issa-canada-en"
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                }}
              />
            </p>

            <h2 className="fw-bold mt-4 mb-3">{t("blogISSA.meansTitle")}</h2>

            <p className="text-secondary">{t("blogISSA.meansP")}</p>

            <ul className="text-secondary">
              <li>
                <Trans
                  i18nKey="blogISSA.meansList.one"
                  components={{ strong: <strong /> }}
                />
              </li>
              <li>
                <Trans
                  i18nKey="blogISSA.meansList.two"
                  components={{ strong: <strong /> }}
                />
              </li>
              <li>
                <Trans
                  i18nKey="blogISSA.meansList.three"
                  components={{ strong: <strong /> }}
                />
              </li>
              <li>
                <Trans
                  i18nKey="blogISSA.meansList.four"
                  components={{ strong: <strong /> }}
                />
              </li>
            </ul>

            <h2 className="fw-bold mt-4 mb-3">{t("blogISSA.standardsTitle")}</h2>

            <p className="text-secondary">
              <Trans
                i18nKey="blogISSA.standardsP"
                components={{
                  cimsLink: (
                    <a
                      href="https://cims.issa.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                }}
              />
            </p>

            <h2 className="fw-bold mt-4 mb-3">{t("blogISSA.torontoTitle")}</h2>

            <p className="text-secondary">
              <Trans
                i18nKey="blogISSA.torontoP1"
                components={{ strong: <strong /> }}
              />
            </p>

            <p className="text-secondary">{t("blogISSA.torontoP2")}</p>

            <h2 className="fw-bold mt-4 mb-3">{t("blogISSA.commitmentTitle")}</h2>

            <p className="text-secondary">{t("blogISSA.commitmentP")}</p>

            <p className="text-secondary mb-4">
              <Trans
                i18nKey="blogISSA.moreP"
                components={{
                  certLink: <a href="/certifications-memberships" />,
                  servicesLink: <a href="/products-and-services" />,
                }}
              />
            </p>

            {/* <hr className="my-4" /> */}

            <p className="text-secondary">
              <Trans
                i18nKey="blogISSA.closing"
                components={{ strong: <strong /> }}
              />
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default CleanARJoinsISSACanada;
