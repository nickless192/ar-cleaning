import React, { useEffect } from "react";
import { Container, Row, Col } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import VisitorCounter from "/src/components/Pages/Management/VisitorCounter.jsx";
import CQCCCertificationBadge from "/src/components/Pages/Certifications/CQCCCertificationBadge.jsx";

function CleanARJoinsCQCC() {
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
      <VisitorCounter page="blog_cleanar_joins_cqcc" />

      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md="10" lg="8">
            <p className="text-uppercase text-muted small fw-semibold mb-2">
              {t("blogCQCC.meta")}
            </p>

            <button
              onClick={() => navigate(-1)}
              className="btn btn-link p-0 mb-3 text-decoration-none"
              type="button"
            >
              {t("blogCQCC.back")}
            </button>

            <h1 className="fw-bold mb-3">{t("blogCQCC.title")}</h1>

            {/* ✅ Intro with real external link */}
            <p className="text-secondary mb-4">
              <Trans
                i18nKey="blogCQCC.intro"
                components={{
                  strong: <strong />,
                  cqccLink: (
                    <a
                      href="https://queerchamber.ca/"
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                }}
              />
            </p>

            <CQCCCertificationBadge className="mb-4" layout="stacked" />

            <h2 className="fw-bold mt-4 mb-3">{t("blogCQCC.whatIsTitle")}</h2>

            <p className="text-secondary">
              <Trans i18nKey="blogCQCC.whatIsP1" components={{ strong: <strong /> }} />
            </p>

            <p className="text-secondary">
              <Trans
                i18nKey="blogCQCC.whatIsP2"
                components={{ strong: <strong />, em: <em /> }}
              />
            </p>

            <h2 className="fw-bold mt-4 mb-3">{t("blogCQCC.orgMeaningTitle")}</h2>

            <p className="text-secondary">{t("blogCQCC.orgMeaningP")}</p>

            <ul className="text-secondary">
              <li>
                <Trans i18nKey="blogCQCC.orgList.one" components={{ strong: <strong /> }} />
              </li>
              <li>
                <Trans i18nKey="blogCQCC.orgList.two" components={{ strong: <strong /> }} />
              </li>
              <li>
                <Trans i18nKey="blogCQCC.orgList.three" components={{ strong: <strong /> }} />
              </li>
            </ul>

            <h2 className="fw-bold mt-4 mb-3">{t("blogCQCC.localTitle")}</h2>

            <p className="text-secondary">{t("blogCQCC.localP1")}</p>
            <p className="text-secondary">{t("blogCQCC.localP2")}</p>

            <h2 className="fw-bold mt-4 mb-3">{t("blogCQCC.standardsTitle")}</h2>

            <p className="text-secondary">{t("blogCQCC.standardsP1")}</p>

            {/* ✅ Internal links as components */}
            <p className="text-secondary mb-4">
              <Trans
                i18nKey="blogCQCC.standardsP2"
                components={{
                  certLink: <a href="/certifications-memberships" />,
                  servicesLink: <a href="/products-and-services" />,
                }}
              />
            </p>

            <h2 className="fw-bold mt-4 mb-3">{t("blogCQCC.commitmentTitle")}</h2>

            <p className="text-secondary">{t("blogCQCC.commitmentP")}</p>

            {/* <hr className="my-4" /> */}

            <p className="text-secondary">
              <Trans i18nKey="blogCQCC.closing" components={{ strong: <strong /> }} />
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default CleanARJoinsCQCC;
