export const BASE_URL = "https://www.cleanarsolutions.ca";
export const OG_IMAGE = `${BASE_URL}/og-image.jpg`;

export const ROUTE_META = {
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

export const MARKETING_PRERENDER_ROUTES = [
  { route: "/", output: "index.html", h1: "Professional Cleaning Services in Toronto & GTA" },
  { route: "/index", output: "index/index.html", h1: "Book Trusted Cleaning Services with CleanAR Solutions" },
  { route: "/about-us", output: "about-us/index.html", h1: "About Our Toronto Cleaning Team" },
  {
    route: "/products-and-services",
    output: "products-and-services/index.html",
    h1: "Residential and Commercial Cleaning Services",
  },
  { route: "/blog", output: "blog/index.html", h1: "CleanAR Blog and Company Updates" },
  {
    route: "/services/residential-cleaning",
    output: "services/residential-cleaning/index.html",
    h1: "Residential Cleaning Services",
  },
  {
    route: "/services/commercial-cleaning",
    output: "services/commercial-cleaning/index.html",
    h1: "Commercial Cleaning Services",
  },
  {
    route: "/services/window-cleaning",
    output: "services/window-cleaning/index.html",
    h1: "Window Cleaning Services",
  },
  {
    route: "/services/carpet-and-upholstery-cleaning",
    output: "services/carpet-and-upholstery-cleaning/index.html",
    h1: "Carpet and Upholstery Cleaning Services",
  },
  {
    route: "/services/power-pressure-washing",
    output: "services/power-pressure-washing/index.html",
    h1: "Power and Pressure Washing Services",
  },
];
