// src/components/ISSAMembershipBadge.jsx
import React from "react";
import { Link } from "react-router-dom";
import issaLogo from "/src/assets/img/ISSA_CANADA_LogoCMYK.jpg";
import NewIconAnimated from "/src/components/Pages/Navigation/NewIconAnimated";
import { useTranslation, Trans } from "react-i18next";
// import {useTranslation} from "i18next";

export default function ISSAMembershipBadge({ layout = "horizontal", className = "" }) {
  const { t } = useTranslation();
  return (
    <section
      className={`issa-membership-badge issa-membership-badge--${layout} ${className}`}
      aria-label="ISSA Canada membership badge"
    >
      {/* Logo */}
      <div className="issa-membership-badge__logo-wrapper">
        <Link to="/certifications-memberships" className="issa-membership-badge__link">
          <img
            src={issaLogo}
            alt="ISSA Canada Member"
            className="issa-membership-badge__logo"
            loading="lazy"
          />
        </Link>

      </div>

      {/* Content */}
      <div className="issa-membership-badge__content">
        <p className="issa-membership-badge__eyebrow">{t('badge.eyebrow')}
          {/* Professional cleaning you can trust */}
        </p>

        <Link to="/certifications-memberships" className="issa-membership-badge__headline-link">
          <p className="issa-membership-badge__headline">
            {/* {t('badge.headline')} */}
            <Trans
              i18nKey="badge.headline"
              components={{ strong: <strong /> }}
            />
            <NewIconAnimated />
            {/* CleanAR Solutions is a proud <strong>ISSA Canada Member</strong> */}
          </p>
        </Link>

        <p className="issa-membership-badge__body">
          {t('badge.body')}
          {/* As members of ISSA Canada – the national division of the worldwide
          cleaning industry association – we follow recognized best practices
          for quality, safety, and professionalism in every service we provide. */}
        </p>
      </div>
    </section>
  );
}
