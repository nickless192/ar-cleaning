import React from "react";
import { Card, CardBody } from "reactstrap";
import { motion } from "framer-motion";
import PropTypes from "prop-types";

export default function ContactCard({ icon, link, text, description, additionalInfo, color }) {
  const renderLink = (url, label, idx) => {
    const isPhone = url.startsWith("tel:");
    const isEmail = url.startsWith("mailto:");
    const isExternal = url.startsWith("http");
    const isInternal = !isPhone && !isEmail && !isExternal;

    const linkProps = {
      href: url,
      ...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})
    };

    return (
      <div key={idx}>
        <a {...linkProps} className="contact-card-link d-block">
          {label}
        </a>
      </div>
    );
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="shadow-sm h-100 border-0">
        <CardBody className="text-center">
          <div className={`icon icon-lg mb-3 ${color}`}>
            <i className={icon}></i>
          </div>
          <h5 className="card-title mb-2">{description}</h5>

          {Array.isArray(link)
            ? link.map((l, i) => renderLink(l, text[i], i))
            : renderLink(link, text, 0)}

          {additionalInfo && (
            <p className="text-muted small mt-2">{additionalInfo}</p>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
}

ContactCard.propTypes = {
  icon: PropTypes.string.isRequired,
  link: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]).isRequired,
  text: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]).isRequired,
  description: PropTypes.string,
  additionalInfo: PropTypes.string,
  color: PropTypes.string
};
