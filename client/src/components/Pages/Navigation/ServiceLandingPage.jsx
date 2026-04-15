import React, { useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

const SERVICE_CONTENT = {
  "residential-cleaning": {
    title: "Residential Cleaning Services",
    intro:
      "Keep your home consistently clean with recurring or one-time residential cleaning delivered by the CleanAR Solutions team.",
    query: "Residential+Cleaning",
  },
  "commercial-cleaning": {
    title: "Commercial Cleaning Services",
    intro:
      "Maintain a healthier, more professional workplace with customized commercial cleaning services for offices and facilities.",
    query: "Commercial+Cleaning",
  },
  "window-cleaning": {
    title: "Window Cleaning Services",
    intro:
      "Improve curb appeal and indoor light with interior and exterior window cleaning for homes and businesses.",
    query: "Window+Cleaning",
  },
  "carpet-and-upholstery-cleaning": {
    title: "Carpet and Upholstery Cleaning Services",
    intro:
      "Refresh carpets and soft surfaces with deep cleaning solutions that remove built-up soil, odors, and stains.",
    query: "Carpet+And+Upholstery",
  },
  "power-pressure-washing": {
    title: "Power and Pressure Washing Services",
    intro:
      "Restore outdoor surfaces with targeted pressure washing for walkways, entries, and exterior areas.",
    query: "Power/Pressure+Washing",
  },
};

const ServiceLandingPage = () => {
  const { serviceSlug } = useParams();
  const service = useMemo(() => SERVICE_CONTENT[serviceSlug], [serviceSlug]);

  if (!service) {
    return <Navigate to="/products-and-services" replace />;
  }

  return (
    <section className="container py-5 mt-5">
      <h1 className="primary-color text-bold mb-3">{service.title}</h1>
      <p className="lead text-cleanar-color mb-4">{service.intro}</p>
      <div className="d-flex flex-wrap gap-2">
        <Link className="btn btn-primary btn-round secondary-bg-color" to={`/?service=${service.query}`}>
          Request a Quote
        </Link>
        <Link className="btn btn-outline-secondary btn-round" to="/products-and-services">
          View All Services
        </Link>
      </div>
    </section>
  );
};

export default ServiceLandingPage;
