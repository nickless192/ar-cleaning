// src/components/CQCCCertificationBadge.jsx
import React from "react";
import { Link } from "react-router-dom";
import cqccLogo from "/src/assets/img/cqcc-en.png";
import NewIconAnimated from "/src/components/Pages/Navigation/NewIconAnimated";
import { useTranslation, Trans } from "react-i18next";

export default function CQCCCertificationBadge({ layout = "horizontal", className = "" }) {
  const { t } = useTranslation();

  return (
    <section
      className={`issa-membership-badge issa-membership-badge--${layout} ${className}`}
      aria-label="CQCC LGBTBE certification badge"
    >
      {/* Logo */}
      <div className="issa-membership-badge__logo-wrapper">
        <Link to="/blog" className="issa-membership-badge__link">
          <img
            src={cqccLogo}
            alt="LGBTQ+ Certified Supplier (LGBTBE) – Canada’s Queer Chamber of Commerce (CQCC)"
            className="issa-membership-badge__logo"
            loading="lazy"
          />
        </Link>
      </div>

      {/* Content */}
      <div className="issa-membership-badge__content">
        <p className="issa-membership-badge__eyebrow">
          {t("cqcc.badge.eyebrow")}
        </p>

        <Link to="/blog" className="issa-membership-badge__headline-link">
          <p className="issa-membership-badge__headline">
            <Trans i18nKey="cqcc.badge.headline" components={{ strong: <strong /> }} />
            <NewIconAnimated />
          </p>
        </Link>

        <p className="issa-membership-badge__body">
          <Trans i18nKey="cqcc.badge.body" components={{ strong: <strong /> }} />
        </p>
      </div>
    </section>
  );
}
