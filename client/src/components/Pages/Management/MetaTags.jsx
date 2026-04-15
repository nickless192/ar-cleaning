import React from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "react-router-dom";

const BASE_URL = "https://www.cleanarsolutions.ca";
const OG_IMAGE = `${BASE_URL}/og-image.jpg`;

const ROUTE_META = {
  "/index": {
    title: "CleanAR Solutions - Professional Cleaning Services in Toronto & GTA",
    description:
      "Professional cleaning services in Toronto & GTA. Residential, commercial, carpet & upholstery cleaning. Get your free quote today!",
    canonicalPath: "/index",
    keywords:
      "cleaning services toronto, professional cleaning, residential cleaning, commercial cleaning, carpet cleaning, upholstery cleaning, CleanAR Solutions",
  },
  "/": {
    title: "CleanAR Solutions - Professional Cleaning Services in Toronto & GTA",
    description:
      "Professional cleaning services in Toronto & GTA. Residential, commercial, carpet & upholstery cleaning. Get your free quote today!",
    canonicalPath: "/index",
    keywords:
      "cleaning services toronto, professional cleaning, residential cleaning, commercial cleaning, carpet cleaning, upholstery cleaning, CleanAR Solutions",
  },
  "/about-us": {
    title: "About CleanAR Solutions | Toronto & GTA Cleaning Team",
    description:
      "Learn about CleanAR Solutions, our mission, and our commitment to reliable, high-quality cleaning services across Toronto and the GTA.",
  },
  "/products-and-services": {
    title: "Cleaning Services | Residential & Commercial | CleanAR Solutions",
    description:
      "Explore residential and commercial cleaning services from CleanAR Solutions in Toronto and the GTA.",
  },
  "/blog": {
    title: "CleanAR Blog | Cleaning Insights & Company Updates",
    description:
      "Read the latest news, certifications, and cleaning insights from CleanAR Solutions.",
  },
  "/services/residential-cleaning": {
    title: "Residential Cleaning Services in Toronto | CleanAR Solutions",
    description:
      "Recurring and one-time residential cleaning services in Toronto and the GTA from the CleanAR Solutions team.",
  },
  "/services/commercial-cleaning": {
    title: "Commercial Cleaning Services in Toronto | CleanAR Solutions",
    description:
      "Professional commercial cleaning for offices and facilities in Toronto and the GTA by CleanAR Solutions.",
  },
  "/services/window-cleaning": {
    title: "Window Cleaning Services in Toronto | CleanAR Solutions",
    description:
      "Interior and exterior window cleaning services for homes and businesses across Toronto and the GTA.",
  },
  "/services/carpet-and-upholstery-cleaning": {
    title: "Carpet & Upholstery Cleaning in Toronto | CleanAR Solutions",
    description:
      "Deep carpet and upholstery cleaning services to refresh homes and workplaces in Toronto and surrounding GTA areas.",
  },
  "/services/power-pressure-washing": {
    title: "Power & Pressure Washing in Toronto | CleanAR Solutions",
    description:
      "Power and pressure washing services for exterior surfaces throughout Toronto and the GTA.",
  },
  "/blog/cleanar-solutions-joins-issa-canada": {
    title: "CleanAR Solutions Joins ISSA Canada | CleanAR Blog",
    description:
      "CleanAR Solutions is now an ISSA Canada member, reinforcing our commitment to professional cleaning standards.",
    blogPosting: {
      headline: "CleanAR Solutions Joins ISSA Canada",
      description:
        "CleanAR Solutions joins ISSA Canada to strengthen quality standards and trusted service delivery.",
      datePublished: "2025-11-01",
      dateModified: "2026-02-01",
      image: OG_IMAGE,
    },
  },
  "/blog/cleanar-joins-cqcc": {
    title: "CleanAR Joins CQCC as an LGBTQ+ Certified Supplier | CleanAR Blog",
    description:
      "CleanAR Solutions joins CQCC as an LGBTQ+ Certified Supplier, advancing supplier diversity in the cleaning industry.",
    blogPosting: {
      headline: "CleanAR Joins CQCC as an LGBTQ+ Certified Supplier",
      description:
        "CleanAR Solutions becomes CQCC-certified to support supplier diversity and inclusive business practices.",
      datePublished: "2026-02-01",
      dateModified: "2026-02-01",
      image: OG_IMAGE,
    },
  },
  "/terms-conditions": {
    title: "Terms & Conditions | CleanAR Solutions",
    description: "Read CleanAR Solutions terms and conditions.",
  },
  "/disclaimer": {
    title: "Disclaimer | CleanAR Solutions",
    description: "Read the CleanAR Solutions disclaimer.",
  },
  "/privacy-policy": {
    title: "Privacy Policy | CleanAR Solutions",
    description: "Read the CleanAR Solutions privacy policy.",
  },
  "/careers": {
    title: "Careers | CleanAR Solutions",
    description: "Explore career opportunities with CleanAR Solutions.",
  },
};

const NOINDEX_PATTERNS = [
  /^\/admin(?:\/|$)/,
  /^\/login-signup(?:\/|$)/,
  /^\/signup-page(?:\/|$)/,
  /^\/reset-password(?:\/|$)/,
  /^\/notification-management(?:\/|$)/,
  /^\/profile-page(?:\/|$)/,
  /^\/invoices(?:\/|$)/,
  /^\/quick-request-v2(?:\/|$)/,
  /^\/now(?:\/|$)/,
  /^\/start(?:\/|$)/,
  /^\/toronto(?:\/|$)/,
  /^\/fresh(?:\/|$)/,
  /^\/secret(?:\/|$)/,
];

const defaultMeta = {
  title: "CleanAR Solutions",
  description:
    "CleanAR Solutions offers professional cleaning services in Toronto and the GTA.",
};

const normalizePathname = (path) => {
  if (!path || path === "/") return "/";
  return path.replace(/\/+$/, "");
};

const MetaTags = () => {
  const { pathname } = useLocation();
  const normalizedPathname = normalizePathname(pathname);

  const routeMeta = ROUTE_META[normalizedPathname] ?? defaultMeta;
  const canonicalPath = normalizePathname(routeMeta.canonicalPath ?? normalizedPathname);
  const canonicalUrl = `${BASE_URL}${canonicalPath}`;
  const pageUrl = `${BASE_URL}${normalizedPathname}`;
  const noindex = NOINDEX_PATTERNS.some((pattern) => pattern.test(normalizedPathname));

  const blogPostingSchema = routeMeta.blogPosting
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: routeMeta.blogPosting.headline,
        description: routeMeta.blogPosting.description,
        datePublished: routeMeta.blogPosting.datePublished,
        dateModified: routeMeta.blogPosting.dateModified,
        mainEntityOfPage: pageUrl,
        image: [routeMeta.blogPosting.image],
        author: {
          "@type": "Organization",
          name: "CleanAR Solutions",
        },
        publisher: {
          "@type": "Organization",
          name: "CleanAR Solutions",
          logo: {
            "@type": "ImageObject",
            url: OG_IMAGE,
          },
        },
      }
    : null;

  return (
    <Helmet>
      <title>{routeMeta.title}</title>
      <meta name="description" content={routeMeta.description} />
      {routeMeta.keywords ? <meta name="keywords" content={routeMeta.keywords} /> : null}
      <meta name="author" content="CleanAR Solutions" />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={routeMeta.title} />
      <meta property="og:description" content={routeMeta.description} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:alt" content="CleanAR Solutions Professional Cleaning Services" />
      <meta property="og:site_name" content="CleanAR Solutions" />
      <meta property="og:locale" content="en_CA" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={routeMeta.title} />
      <meta name="twitter:description" content={routeMeta.description} />
      <meta name="twitter:image" content={OG_IMAGE} />

      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />
      <meta name="googlebot" content={noindex ? "noindex, nofollow" : "index, follow"} />

      {blogPostingSchema ? (
        <script type="application/ld+json">{JSON.stringify(blogPostingSchema)}</script>
      ) : null}
    </Helmet>
  );
};

export default MetaTags;
