import React from "react";
import { Link, Navigate } from "react-router-dom";

const SERVICE_PAGES = {
  residential: {
    slug: "residential-cleaning-toronto",
    serviceName: "Residential Cleaning",
    h1: "Residential Cleaning Services in Toronto & the GTA",
    body: [
      "CleanAR Solutions delivers dependable residential cleaning throughout Toronto, Etobicoke, North York, Scarborough, Markham, Mississauga, and nearby GTA communities.",
      "Whether you need weekly upkeep, bi-weekly service, or a one-time refresh before guests arrive, our team follows a structured room-by-room checklist and adapts to your priorities.",
      "From condo units downtown to family homes across the GTA, we focus on consistent quality, clear communication, and flexible scheduling that fits your routine.",
    ],
    ctaLabel: "Get a Residential Cleaning Quote",
    quoteQuery: "Residential+Cleaning",
    related: [
      { to: "/deep-cleaning-toronto", label: "Deep Cleaning Toronto" },
      { to: "/move-in-move-out-cleaning-toronto", label: "Move-In/Move-Out Cleaning" },
      { to: "/commercial-cleaning-toronto", label: "Commercial Cleaning Toronto" },
    ],
    faqs: [
      {
        q: "Do you offer recurring house cleaning across the GTA?",
        a: "Yes. We provide recurring plans in Toronto and surrounding GTA areas, including weekly, bi-weekly, and monthly schedules.",
      },
      {
        q: "Can I customize what gets cleaned each visit?",
        a: "Absolutely. You can prioritize rooms, surfaces, and add-ons so each visit matches your home and preferences.",
      },
      {
        q: "Do I need to supply cleaning products?",
        a: "Our team can arrive with professional-grade supplies and equipment. If you prefer specific products, we can accommodate that too.",
      },
    ],
  },
  commercial: {
    slug: "commercial-cleaning-toronto",
    serviceName: "Commercial Cleaning",
    h1: "Commercial Cleaning Services for Toronto Businesses",
    body: [
      "We help Toronto and GTA businesses maintain cleaner, healthier workplaces with dependable commercial cleaning programs.",
      "Our crews service offices, retail spaces, clinics, and shared facilities with after-hours and off-peak scheduling to minimize disruption.",
      "CleanAR Solutions builds service scopes around your operations, covering high-touch disinfection, washrooms, break areas, floors, and common spaces.",
    ],
    ctaLabel: "Request a Commercial Cleaning Plan",
    quoteQuery: "Commercial+Cleaning",
    related: [
      { to: "/residential-cleaning-toronto", label: "Residential Cleaning Toronto" },
      { to: "/deep-cleaning-toronto", label: "Deep Cleaning Toronto" },
      { to: "/carpet-upholstery-cleaning-toronto", label: "Carpet & Upholstery Cleaning" },
    ],
    faqs: [
      {
        q: "Do you clean offices outside regular business hours?",
        a: "Yes. We offer flexible scheduling, including evenings and weekends, to support business continuity.",
      },
      {
        q: "Can you clean multi-tenant or mixed-use facilities?",
        a: "Yes. We can structure service by floor, suite, or zone for mixed-use and multi-tenant properties.",
      },
      {
        q: "Do you provide ongoing janitorial support?",
        a: "We do. Many clients choose recurring janitorial plans with quality checks and clear communication.",
      },
    ],
  },
  deep: {
    slug: "deep-cleaning-toronto",
    serviceName: "Deep Cleaning",
    h1: "Deep Cleaning Services in Toronto for Detailed Results",
    body: [
      "Our deep cleaning service is designed for homes and workplaces that need a detailed reset beyond routine maintenance.",
      "We focus on built-up dust, grease, soap scum, and overlooked areas such as baseboards, vents, trim, and hard-to-reach surfaces.",
      "Toronto and GTA clients often book deep cleaning before seasonal transitions, after renovations, or before launching recurring service.",
    ],
    ctaLabel: "Book Deep Cleaning in Toronto",
    quoteQuery: "Deep+Cleaning",
    related: [
      { to: "/residential-cleaning-toronto", label: "Residential Cleaning Toronto" },
      { to: "/move-in-move-out-cleaning-toronto", label: "Move-In/Move-Out Cleaning" },
      { to: "/carpet-upholstery-cleaning-toronto", label: "Carpet & Upholstery Cleaning" },
    ],
    faqs: [
      {
        q: "What is included in a deep cleaning service?",
        a: "Deep cleaning includes intensive detail work on high-build-up and often-missed areas, in addition to standard cleaning tasks.",
      },
      {
        q: "Is deep cleaning a one-time service or recurring?",
        a: "Most clients begin with a one-time deep clean, then switch to recurring maintenance for ongoing upkeep.",
      },
      {
        q: "How long does a deep cleaning appointment take?",
        a: "Timing depends on property size and condition. We provide an estimate after reviewing your specific needs.",
      },
    ],
  },
  moveInMoveOut: {
    slug: "move-in-move-out-cleaning-toronto",
    serviceName: "Move-In/Move-Out Cleaning",
    h1: "Move-In & Move-Out Cleaning in Toronto and the GTA",
    body: [
      "When timelines are tight, our move-in and move-out cleaning helps you hand over or settle into a clean, ready space.",
      "We clean kitchens, bathrooms, interior surfaces, floors, and high-contact areas to support tenants, homeowners, landlords, and property managers.",
      "From condo turnovers in downtown Toronto to suburban relocations across the GTA, we help reduce stress during moving day.",
    ],
    ctaLabel: "Schedule Move-In/Move-Out Cleaning",
    quoteQuery: "Move+In+Move+Out+Cleaning",
    related: [
      { to: "/deep-cleaning-toronto", label: "Deep Cleaning Toronto" },
      { to: "/residential-cleaning-toronto", label: "Residential Cleaning Toronto" },
      { to: "/commercial-cleaning-toronto", label: "Commercial Cleaning Toronto" },
    ],
    faqs: [
      {
        q: "Do you clean empty units before key handover?",
        a: "Yes. We frequently clean vacant homes, condos, and rental units before move-in or after move-out.",
      },
      {
        q: "Can move-out cleaning help with landlord inspections?",
        a: "A professional clean can improve presentation for final walkthroughs and help address common inspection concerns.",
      },
      {
        q: "How far in advance should I book?",
        a: "We recommend booking as early as possible during peak moving periods, but we can often support urgent timelines.",
      },
    ],
  },
  carpetUpholstery: {
    slug: "carpet-upholstery-cleaning-toronto",
    serviceName: "Carpet and Upholstery Cleaning",
    h1: "Carpet & Upholstery Cleaning Services in Toronto",
    body: [
      "Our carpet and upholstery cleaning service helps Toronto and GTA homes and businesses remove embedded dirt, allergens, and everyday stains.",
      "We clean high-traffic carpeted zones and fabric furniture using methods selected for your material type and soil conditions.",
      "This service is ideal before hosting guests, after pet-related messes, or as part of a larger deep cleaning plan.",
    ],
    ctaLabel: "Request Carpet & Upholstery Cleaning",
    quoteQuery: "Carpet+And+Upholstery",
    related: [
      { to: "/deep-cleaning-toronto", label: "Deep Cleaning Toronto" },
      { to: "/residential-cleaning-toronto", label: "Residential Cleaning Toronto" },
      { to: "/commercial-cleaning-toronto", label: "Commercial Cleaning Toronto" },
    ],
    faqs: [
      {
        q: "Can you treat pet odours and high-traffic stains?",
        a: "Yes. We target common stain and odour issues and recommend realistic expectations based on fibre type and stain age.",
      },
      {
        q: "Do you clean both carpets and fabric furniture?",
        a: "Yes. We service carpets, area rugs, and many upholstered furniture pieces across residential and commercial spaces.",
      },
      {
        q: "How often should carpets and upholstery be cleaned?",
        a: "Many GTA clients schedule professional cleaning every 6 to 12 months, or more often in high-use environments.",
      },
    ],
  },
};

const TorontoServiceTemplate = ({ serviceKey }) => {
  const service = SERVICE_PAGES[serviceKey];

  if (!service) {
    return <Navigate to="/products-and-services" replace />;
  }

  return (
    <section className="container py-5 mt-5">
      <h1 className="primary-color text-bold mb-3">{service.h1}</h1>

      {service.body.map((paragraph) => (
        <p key={paragraph} className="lead text-cleanar-color mb-3">
          {paragraph}
        </p>
      ))}

      <div className="d-flex flex-wrap gap-2 my-4">
        <Link className="btn btn-primary btn-round secondary-bg-color" to={`/index?service=${service.quoteQuery}`}>
          {service.ctaLabel}
        </Link>
        <Link className="btn btn-outline-secondary btn-round" to="/products-and-services">
          View All Services
        </Link>
      </div>

      <section className="mt-5">
        <h2 className="primary-color text-bold mb-3">Toronto Service FAQs</h2>
        <div className="d-grid gap-3">
          {service.faqs.map((faq) => (
            <details key={faq.q} className="border rounded p-3 bg-white">
              <summary className="fw-semibold">{faq.q}</summary>
              <p className="mt-2 mb-0">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <h2 className="primary-color text-bold mb-3">Related Cleaning Services</h2>
        <ul className="list-unstyled d-grid gap-2">
          {service.related.map((relatedLink) => (
            <li key={relatedLink.to}>
              <Link to={relatedLink.to}>{relatedLink.label}</Link>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
};

export const ResidentialCleaningTorontoPage = () => <TorontoServiceTemplate serviceKey="residential" />;
export const CommercialCleaningTorontoPage = () => <TorontoServiceTemplate serviceKey="commercial" />;
export const DeepCleaningTorontoPage = () => <TorontoServiceTemplate serviceKey="deep" />;
export const MoveInMoveOutCleaningTorontoPage = () => <TorontoServiceTemplate serviceKey="moveInMoveOut" />;
export const CarpetUpholsteryCleaningTorontoPage = () => <TorontoServiceTemplate serviceKey="carpetUpholstery" />;

export default TorontoServiceTemplate;
