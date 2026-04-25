import React, { useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

const SERVICE_CONTENT = {
  "residential-cleaning": {
    title: "Residential Cleaning Services",
    intro:
      "Keep your home consistently clean with recurring or one-time residential cleaning delivered by the CleanAR Solutions team.",
    query: "Residential+Cleaning",
    bestFor: "Busy households that want reliable weekly, biweekly, or monthly support.",
    included: [
      "Kitchen, bathroom, and common area maintenance",
      "Dusting, vacuuming, and floor care",
      "Flexible recurring schedules"
    ],
    addOns: ["Interior windows", "Bed linen service", "Laundry service"]
  },
  "deep-cleaning": {
    title: "Deep Cleaning Services",
    intro:
      "Get a detailed top-to-bottom reset for homes or units that need more than standard recurring maintenance.",
    query: "Deep+Cleaning",
    bestFor: "Seasonal cleaning, first-time service, or post-renovation touch-ups.",
    included: [
      "Detailed kitchen and bathroom focus",
      "Baseboards, edges, and high-touch surfaces",
      "Targeted grime and buildup removal"
    ],
    addOns: ["Fridge deep cleaning", "Oven deep cleaning", "Organization & styling"]
  },
  "move-in-move-out-cleaning": {
    title: "Move-In / Move-Out Cleaning",
    intro:
      "Prepare empty units for handover, showings, or move-in day with a thorough professional clean.",
    query: "Move+In+Move+Out+Cleaning",
    bestFor: "Tenants, landlords, realtors, and property managers.",
    included: [
      "Cabinet, appliance exterior, and surface wipe-downs",
      "Bathroom sanitization and fixture polishing",
      "Floor vacuuming, mopping, and finishing"
    ],
    addOns: ["Interior windows", "Balcony deep cleaning", "Curtain steam cleaning"]
  },
  "commercial-cleaning": {
    title: "Commercial Cleaning Services",
    intro:
      "Maintain a healthier, more professional workplace with customized commercial cleaning services for offices and facilities.",
    query: "Commercial+Cleaning",
    bestFor: "Offices, retail spaces, and shared commercial environments.",
    included: [
      "Reception, workspace, and washroom cleaning",
      "High-touch disinfection and waste handling",
      "Flexible day/evening scheduling"
    ],
    addOns: ["Carpet extraction", "Window interior cleaning", "Amenities maintenance"]
  },
  "commercial-deep-cleaning": {
    title: "Commercial Deep Cleaning",
    intro:
      "Reset high-traffic business spaces with detailed sanitation and deeper cleaning workflows.",
    query: "Commercial+Cleaning",
    bestFor: "Quarterly resets, occupancy transitions, and heavily used facilities.",
    included: [
      "Detail-focused sanitation and spot treatment",
      "Deep cleaning for shared areas and washrooms",
      "Targeted service plan based on traffic patterns"
    ],
    addOns: ["Carpet cleaning", "Upholstery cleaning", "Monthly building cleaning"]
  },
  "carpet-cleaning": {
    title: "Carpet Cleaning Services",
    intro:
      "Steam and extraction cleaning to refresh carpets, reduce odours, and lift embedded dirt.",
    query: "Carpet+And+Upholstery",
    bestFor: "Small rooms, high-traffic spaces, and common-area carpet maintenance.",
    included: [
      "Hot-water extraction process",
      "Spot treatment for common stains",
      "Tailored approach based on fiber and condition"
    ],
    addOns: ["Hallways/common areas", "Upholstery pairing", "Post-service deodorizing"]
  },
  "upholstery-cleaning": {
    title: "Upholstery Cleaning Services",
    intro:
      "Deep-clean sofas, loveseats, chairs, and fabric seating with methods matched to material and condition.",
    query: "Carpet+And+Upholstery",
    bestFor: "Furniture refreshes, stain treatment, and allergy-conscious maintenance.",
    included: [
      "Material-safe upholstery cleaning methods",
      "Odour and stain reduction support",
      "Options for individual items or full sets"
    ],
    addOns: ["Dining chair sets", "Curtain steam cleaning", "Carpet bundle quote"]
  },
  "post-construction-cleaning": {
    title: "Post-Construction Cleaning",
    intro:
      "Clear fine dust, debris, and construction residue so your renovated space is move-in ready.",
    query: "Post-Construction+Cleaning",
    bestFor: "Renovated units, office fit-outs, and newly finished interiors.",
    included: [
      "Detailed dust and surface removal",
      "Fixture, trim, and edge cleaning",
      "Final handover-ready finishing"
    ],
    addOns: ["Window interior cleaning", "Floor detailing", "Full unit clean-out"]
  },
  "full-unit-clean-out": {
    title: "Full Unit Clean-Out",
    intro:
      "Comprehensive reset cleaning for units that require a full interior turnaround.",
    query: "Deep+Cleaning",
    bestFor: "Heavily used spaces, transitions, or intensive reset projects.",
    included: [
      "Whole-unit interior cleaning and reset",
      "Targeted high-build-up area treatment",
      "Scope aligned to access and condition"
    ],
    addOns: ["Bathroom recaulk prep cleanup", "Balcony deep cleaning", "Laundry service"]
  },
  "monthly-building-amenities-cleaning": {
    title: "Monthly Building / Amenities Cleaning",
    intro:
      "Recurring cleaning plans for lobbies, shared amenities, and resident-facing common areas.",
    query: "Commercial+Cleaning",
    bestFor: "Property managers and building teams needing predictable quality standards.",
    included: [
      "Amenity and shared-space cleaning routines",
      "Monthly cadence with flexible service windows",
      "Checklist-based consistency and reporting readiness"
    ],
    addOns: ["Carpet extraction", "Glass cleaning", "Seasonal deep clean support"]
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
      {service.bestFor ? (
        <p className="mb-4 text-cleanar-color"><strong>Best for:</strong> {service.bestFor}</p>
      ) : null}
      {Array.isArray(service.included) && service.included.length > 0 ? (
        <div className="mb-4">
          <h2 className="h5 text-cleanar-color text-bold mb-2">What’s included</h2>
          <ul className="mb-0">
            {service.included.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      ) : null}
      {Array.isArray(service.addOns) && service.addOns.length > 0 ? (
        <div className="mb-4">
          <h2 className="h5 text-cleanar-color text-bold mb-2">Optional add-ons</h2>
          <ul className="mb-0">
            {service.addOns.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      ) : null}
      <div className="d-flex flex-wrap gap-2">
        <Link className="btn btn-primary btn-round secondary-bg-color" to={`/?service=${service.query}&scrollToQuote=true`}>
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
