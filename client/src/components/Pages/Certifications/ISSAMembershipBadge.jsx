// src/components/ISSAMembershipBadge.jsx
import React from "react";
import { Link } from "react-router-dom";
import issaLogo from "/src/assets/img/ISSA_CANADA_LogoCMYK.jpg"; // adjust path

export default function ISSAMembershipBadge({
  layout = "horizontal",
  className = "",
}) {
  return (
    <section
      className={`issa-membership-badge issa-membership-badge--${layout} ${className}`}
      aria-label="ISSA Canada membership badge"
    >
      <div className="issa-membership-badge__logo-wrapper">
        <Link
          to="/certifications-memberships"
          className="issa-membership-badge__link"
        >

        <img
          src={issaLogo}
          alt="ISSA Canada Member"
          className="issa-membership-badge__logo"
          loading="lazy"
        />
        </Link>
      </div>

      <div className="issa-membership-badge__content">
        <p className="issa-membership-badge__eyebrow">
          Professional cleaning you can trust
        </p>
         <Link
          to="/certifications-memberships"
          className="text-decoration-none text-reset"
        >

        <p className="issa-membership-badge__headline">
          CleanAR Solutions is a proud <strong>ISSA Canada Member</strong>
        </p>
        </Link>
        <p className="issa-membership-badge__body">
          As members of ISSA Canada – the national division of the worldwide
          cleaning industry association – we follow recognized best practices
          for quality, safety, and professionalism in every service we provide.
        </p>
      </div>
    </section>
  );
}
