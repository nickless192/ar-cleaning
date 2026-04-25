export const BASE_URL = "https://www.cleanarsolutions.ca";
export const OG_IMAGE = `${BASE_URL}/og-image.jpg`;
export const ORGANIZATION_NAME = "CleanAR Solutions";
export const ORGANIZATION_PHONE = "+1-437-440-5514";
export const ORGANIZATION_ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: "414 Jarvis St",
  addressLocality: "Toronto",
  addressRegion: "ON",
  postalCode: "M4Y 3C2",
  addressCountry: "CA",
};
export const AREA_SERVED = ["Toronto", "Greater Toronto Area"];

export const MINIMAL_SITE_FALLBACK_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: ORGANIZATION_NAME,
  url: BASE_URL,
  telephone: ORGANIZATION_PHONE,
  address: ORGANIZATION_ADDRESS,
  areaServed: AREA_SERVED,
};

export const ROUTE_META = {
  "/index": {
    title: "CleanAR Solutions - Professional Cleaning Services in Toronto & GTA",
    description:
      "Professional cleaning services in Toronto & GTA. Residential, commercial, carpet & upholstery cleaning. Get your free quote today!",
    canonicalPath: "/",
    keywords:
      "cleaning services toronto, professional cleaning, residential cleaning, commercial cleaning, carpet cleaning, upholstery cleaning, CleanAR Solutions",
  },
  "/": {
    title: "CleanAR Solutions - Professional Cleaning Services in Toronto & GTA",
    description:
      "Professional cleaning services in Toronto & GTA. Residential, commercial, carpet & upholstery cleaning. Get your free quote today!",
    canonicalPath: "/",
    keywords:
      "cleaning services toronto, professional cleaning, residential cleaning, commercial cleaning, carpet cleaning, upholstery cleaning, CleanAR Solutions",
  },
  "/about-us": {
    title: "About CleanAR Solutions | Toronto & GTA Cleaning Team",
    description:
      "Learn about CleanAR Solutions, our mission, and our commitment to reliable, high-quality cleaning services across Toronto and the GTA.",
  },
  "/products-and-services": {
    title: "Cleaning Services in Toronto & GTA | CleanAR Solutions",
    description:
      "Explore CleanAR Solutions’ residential, commercial, deep cleaning, move-in/move-out, carpet, upholstery, and specialty cleaning services across Toronto and the GTA.",
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
  "/services/deep-cleaning": {
    title: "Deep Cleaning Services in Toronto | CleanAR Solutions",
    description:
      "Book detailed deep cleaning services for homes and commercial spaces in Toronto and the GTA.",
  },
  "/services/move-in-move-out-cleaning": {
    title: "Move-In / Move-Out Cleaning in Toronto | CleanAR Solutions",
    description:
      "Professional move-in and move-out cleaning in Toronto and the GTA for smooth property transitions.",
  },
  "/services/commercial-deep-cleaning": {
    title: "Commercial Deep Cleaning Services in Toronto | CleanAR Solutions",
    description:
      "Targeted commercial deep cleaning for high-traffic facilities, offices, and shared spaces in Toronto and the GTA.",
  },
  "/services/window-cleaning": {
    title: "Window Cleaning Services in Toronto | CleanAR Solutions",
    description:
      "Interior and exterior window cleaning services for homes and businesses across Toronto and the GTA.",
  },
  "/services/carpet-cleaning": {
    title: "Carpet Cleaning Services in Toronto | CleanAR Solutions",
    description:
      "Steam and extraction carpet cleaning for homes and commercial spaces across Toronto and the GTA.",
  },
  "/services/upholstery-cleaning": {
    title: "Upholstery Cleaning Services in Toronto | CleanAR Solutions",
    description:
      "Professional upholstery cleaning for sofas, chairs, and soft furniture across Toronto and the GTA.",
  },
  "/services/post-construction-cleaning": {
    title: "Post-Construction Cleaning in Toronto | CleanAR Solutions",
    description:
      "Remove dust, debris, and construction residue with post-construction cleaning services in Toronto and the GTA.",
  },
  "/services/full-unit-clean-out": {
    title: "Full Unit Clean-Out Services in Toronto | CleanAR Solutions",
    description:
      "Comprehensive full unit clean-out support for transitions and intensive reset projects in Toronto and the GTA.",
  },
  "/services/monthly-building-amenities-cleaning": {
    title: "Monthly Building Amenities Cleaning in Toronto | CleanAR Solutions",
    description:
      "Recurring monthly cleaning for lobbies, amenities, and shared building spaces across Toronto and the GTA.",
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
  "/carpet-upholstery-cleaning-toronto": {
    title: "Carpet & Upholstery Cleaning Toronto | CleanAR Solutions",
    description:
      "Professional carpet and upholstery cleaning in Toronto and the GTA for homes and businesses. Remove dirt, allergens, and stains with CleanAR Solutions.",
    canonicalPath: "/carpet-upholstery-cleaning-toronto",
    ogTitle: "Carpet & Upholstery Cleaning in Toronto | CleanAR Solutions",
    ogDescription:
      "Refresh carpets and furniture with targeted carpet and upholstery cleaning services across Toronto and the GTA.",
    twitterTitle: "Toronto Carpet & Upholstery Cleaning | CleanAR",
    twitterDescription:
      "Book carpet and upholstery cleaning for Toronto and GTA homes and businesses.",
  },
  "/commercial-cleaning-toronto": {
    title: "Commercial Cleaning Toronto | Office & Facility Cleaning",
    description:
      "Custom commercial cleaning services for Toronto and GTA offices, retail sites, and facilities. Flexible scheduling and consistent quality from CleanAR Solutions.",
    canonicalPath: "/commercial-cleaning-toronto",
    ogTitle: "Commercial Cleaning Services for Toronto Businesses",
    ogDescription:
      "Keep your Toronto workplace clean and professional with recurring commercial cleaning from CleanAR Solutions.",
    twitterTitle: "Commercial Cleaning Toronto | CleanAR",
    twitterDescription:
      "Reliable office and facility cleaning services in Toronto and the GTA.",
  },
  "/deep-cleaning-toronto": {
    title: "Deep Cleaning Toronto | Detailed Home & Business Cleaning",
    description:
      "Deep cleaning services in Toronto and the GTA for homes and businesses that need detailed, top-to-bottom cleaning beyond routine maintenance.",
    canonicalPath: "/deep-cleaning-toronto",
    ogTitle: "Deep Cleaning Services in Toronto & GTA",
    ogDescription:
      "Book a detailed deep clean for your Toronto home or workplace with CleanAR Solutions.",
    twitterTitle: "Deep Cleaning Toronto | CleanAR",
    twitterDescription:
      "Top-to-bottom deep cleaning services across Toronto and the GTA.",
  },
  "/move-in-move-out-cleaning-toronto": {
    title: "Move-In Move-Out Cleaning Toronto | CleanAR Solutions",
    description:
      "Move-in and move-out cleaning in Toronto and the GTA for tenants, homeowners, landlords, and property managers with dependable turnaround support.",
    canonicalPath: "/move-in-move-out-cleaning-toronto",
    ogTitle: "Move-In & Move-Out Cleaning in Toronto",
    ogDescription:
      "Professional move-in and move-out cleaning for Toronto condos, homes, and rentals.",
    twitterTitle: "Move-In/Move-Out Cleaning Toronto | CleanAR",
    twitterDescription:
      "Get your Toronto property cleaned and ready for handover or move-in day.",
  },
  "/residential-cleaning-toronto": {
    title: "Residential Cleaning Toronto | Home Cleaning in the GTA",
    description:
      "Residential cleaning services in Toronto and the GTA. Weekly, bi-weekly, and one-time home cleaning from CleanAR Solutions.",
    canonicalPath: "/residential-cleaning-toronto",
    ogTitle: "Residential Cleaning Services in Toronto & GTA",
    ogDescription:
      "Reliable home cleaning for Toronto and GTA households with flexible recurring plans.",
    twitterTitle: "Residential Cleaning Toronto | CleanAR",
    twitterDescription:
      "Book trusted residential cleaning in Toronto and across the GTA.",
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
    route: "/services/deep-cleaning",
    output: "services/deep-cleaning/index.html",
    h1: "Deep Cleaning Services",
  },
  {
    route: "/services/move-in-move-out-cleaning",
    output: "services/move-in-move-out-cleaning/index.html",
    h1: "Move-In / Move-Out Cleaning Services",
  },
  {
    route: "/services/commercial-deep-cleaning",
    output: "services/commercial-deep-cleaning/index.html",
    h1: "Commercial Deep Cleaning Services",
  },
  {
    route: "/services/carpet-cleaning",
    output: "services/carpet-cleaning/index.html",
    h1: "Carpet Cleaning Services",
  },
  {
    route: "/services/upholstery-cleaning",
    output: "services/upholstery-cleaning/index.html",
    h1: "Upholstery Cleaning Services",
  },
  {
    route: "/services/post-construction-cleaning",
    output: "services/post-construction-cleaning/index.html",
    h1: "Post-Construction Cleaning Services",
  },
  {
    route: "/services/full-unit-clean-out",
    output: "services/full-unit-clean-out/index.html",
    h1: "Full Unit Clean-Out Services",
  },
  {
    route: "/services/monthly-building-amenities-cleaning",
    output: "services/monthly-building-amenities-cleaning/index.html",
    h1: "Monthly Building / Amenities Cleaning Services",
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
  { route: "/residential-cleaning-toronto", output: "residential-cleaning-toronto/index.html", h1: "Residential Cleaning Services in Toronto & the GTA" },
  { route: "/commercial-cleaning-toronto", output: "commercial-cleaning-toronto/index.html", h1: "Commercial Cleaning Services for Toronto Businesses" },
  { route: "/deep-cleaning-toronto", output: "deep-cleaning-toronto/index.html", h1: "Deep Cleaning Services in Toronto for Detailed Results" },
  { route: "/move-in-move-out-cleaning-toronto", output: "move-in-move-out-cleaning-toronto/index.html", h1: "Move-In & Move-Out Cleaning in Toronto and the GTA" },
  { route: "/carpet-upholstery-cleaning-toronto", output: "carpet-upholstery-cleaning-toronto/index.html", h1: "Carpet & Upholstery Cleaning Services in Toronto" },
];

const SERVICE_SCHEMA_CONFIG = {
  "/services/residential-cleaning": {
    name: "Residential Cleaning Services in Toronto & GTA",
    serviceType: "Residential Cleaning",
  },
  "/services/commercial-cleaning": {
    name: "Commercial Cleaning Services in Toronto & GTA",
    serviceType: "Commercial Cleaning",
  },
  "/services/deep-cleaning": {
    name: "Deep Cleaning Services in Toronto & GTA",
    serviceType: "Deep Cleaning",
  },
  "/services/move-in-move-out-cleaning": {
    name: "Move-In and Move-Out Cleaning Services in Toronto & GTA",
    serviceType: "Move-In Move-Out Cleaning",
  },
  "/services/commercial-deep-cleaning": {
    name: "Commercial Deep Cleaning Services in Toronto & GTA",
    serviceType: "Commercial Deep Cleaning",
  },
  "/services/carpet-cleaning": {
    name: "Carpet Cleaning Services in Toronto & GTA",
    serviceType: "Carpet Cleaning",
  },
  "/services/upholstery-cleaning": {
    name: "Upholstery Cleaning Services in Toronto & GTA",
    serviceType: "Upholstery Cleaning",
  },
  "/services/post-construction-cleaning": {
    name: "Post-Construction Cleaning Services in Toronto & GTA",
    serviceType: "Post-Construction Cleaning",
  },
  "/services/full-unit-clean-out": {
    name: "Full Unit Clean-Out Services in Toronto & GTA",
    serviceType: "Full Unit Clean-Out",
  },
  "/services/monthly-building-amenities-cleaning": {
    name: "Monthly Building and Amenities Cleaning in Toronto & GTA",
    serviceType: "Monthly Building Amenities Cleaning",
  },
  "/services/window-cleaning": {
    name: "Window Cleaning Services in Toronto & GTA",
    serviceType: "Window Cleaning",
  },
  "/services/carpet-and-upholstery-cleaning": {
    name: "Carpet and Upholstery Cleaning Services in Toronto & GTA",
    serviceType: "Carpet and Upholstery Cleaning",
  },
  "/services/power-pressure-washing": {
    name: "Power and Pressure Washing Services in Toronto & GTA",
    serviceType: "Power and Pressure Washing",
  },
  "/residential-cleaning-toronto": {
    name: "Residential Cleaning Services in Toronto & GTA",
    serviceType: "Residential Cleaning",
  },
  "/commercial-cleaning-toronto": {
    name: "Commercial Cleaning Services in Toronto & GTA",
    serviceType: "Commercial Cleaning",
  },
  "/deep-cleaning-toronto": {
    name: "Deep Cleaning Services in Toronto & GTA",
    serviceType: "Deep Cleaning",
  },
  "/move-in-move-out-cleaning-toronto": {
    name: "Move-In and Move-Out Cleaning Services in Toronto & GTA",
    serviceType: "Move-In Move-Out Cleaning",
  },
  "/carpet-upholstery-cleaning-toronto": {
    name: "Carpet and Upholstery Cleaning Services in Toronto & GTA",
    serviceType: "Carpet and Upholstery Cleaning",
  },
};

const BREADCRUMB_CONFIG = {
  "/products-and-services": [
    { name: "Home", path: "/" },
    { name: "Products and Services", path: "/products-and-services" },
  ],
  "/services/residential-cleaning": [
    { name: "Home", path: "/" },
    { name: "Products and Services", path: "/products-and-services" },
    { name: "Residential Cleaning", path: "/services/residential-cleaning" },
  ],
  "/services/commercial-cleaning": [
    { name: "Home", path: "/" },
    { name: "Products and Services", path: "/products-and-services" },
    { name: "Commercial Cleaning", path: "/services/commercial-cleaning" },
  ],
  "/services/deep-cleaning": [
    { name: "Home", path: "/" },
    { name: "Products and Services", path: "/products-and-services" },
    { name: "Deep Cleaning", path: "/services/deep-cleaning" },
  ],
  "/services/move-in-move-out-cleaning": [
    { name: "Home", path: "/" },
    { name: "Products and Services", path: "/products-and-services" },
    { name: "Move-In / Move-Out Cleaning", path: "/services/move-in-move-out-cleaning" },
  ],
  "/services/commercial-deep-cleaning": [
    { name: "Home", path: "/" },
    { name: "Products and Services", path: "/products-and-services" },
    { name: "Commercial Deep Cleaning", path: "/services/commercial-deep-cleaning" },
  ],
  "/services/carpet-cleaning": [
    { name: "Home", path: "/" },
    { name: "Products and Services", path: "/products-and-services" },
    { name: "Carpet Cleaning", path: "/services/carpet-cleaning" },
  ],
  "/services/upholstery-cleaning": [
    { name: "Home", path: "/" },
    { name: "Products and Services", path: "/products-and-services" },
    { name: "Upholstery Cleaning", path: "/services/upholstery-cleaning" },
  ],
  "/services/post-construction-cleaning": [
    { name: "Home", path: "/" },
    { name: "Products and Services", path: "/products-and-services" },
    { name: "Post-Construction Cleaning", path: "/services/post-construction-cleaning" },
  ],
  "/services/full-unit-clean-out": [
    { name: "Home", path: "/" },
    { name: "Products and Services", path: "/products-and-services" },
    { name: "Full Unit Clean-Out", path: "/services/full-unit-clean-out" },
  ],
  "/services/monthly-building-amenities-cleaning": [
    { name: "Home", path: "/" },
    { name: "Products and Services", path: "/products-and-services" },
    { name: "Monthly Building / Amenities Cleaning", path: "/services/monthly-building-amenities-cleaning" },
  ],
  "/services/window-cleaning": [
    { name: "Home", path: "/" },
    { name: "Products and Services", path: "/products-and-services" },
    { name: "Window Cleaning", path: "/services/window-cleaning" },
  ],
  "/services/carpet-and-upholstery-cleaning": [
    { name: "Home", path: "/" },
    { name: "Products and Services", path: "/products-and-services" },
    { name: "Carpet and Upholstery Cleaning", path: "/services/carpet-and-upholstery-cleaning" },
  ],
  "/services/power-pressure-washing": [
    { name: "Home", path: "/" },
    { name: "Products and Services", path: "/products-and-services" },
    { name: "Power and Pressure Washing", path: "/services/power-pressure-washing" },
  ],
  "/blog": [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
  ],
  "/blog/cleanar-solutions-joins-issa-canada": [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: "CleanAR Solutions Joins ISSA Canada", path: "/blog/cleanar-solutions-joins-issa-canada" },
  ],
  "/blog/cleanar-joins-cqcc": [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: "CleanAR Joins CQCC as an LGBTQ+ Certified Supplier", path: "/blog/cleanar-joins-cqcc" },
  ],
  "/residential-cleaning-toronto": [
    { name: "Home", path: "/" },
    { name: "Products and Services", path: "/products-and-services" },
    { name: "Residential Cleaning Toronto", path: "/residential-cleaning-toronto" },
  ],
  "/commercial-cleaning-toronto": [
    { name: "Home", path: "/" },
    { name: "Products and Services", path: "/products-and-services" },
    { name: "Commercial Cleaning Toronto", path: "/commercial-cleaning-toronto" },
  ],
  "/deep-cleaning-toronto": [
    { name: "Home", path: "/" },
    { name: "Products and Services", path: "/products-and-services" },
    { name: "Deep Cleaning Toronto", path: "/deep-cleaning-toronto" },
  ],
  "/move-in-move-out-cleaning-toronto": [
    { name: "Home", path: "/" },
    { name: "Products and Services", path: "/products-and-services" },
    { name: "Move-In Move-Out Cleaning Toronto", path: "/move-in-move-out-cleaning-toronto" },
  ],
  "/carpet-upholstery-cleaning-toronto": [
    { name: "Home", path: "/" },
    { name: "Products and Services", path: "/products-and-services" },
    { name: "Carpet and Upholstery Cleaning Toronto", path: "/carpet-upholstery-cleaning-toronto" },
  ],
};

const normalizePathname = (path) => {
  if (!path || path === "/") return "/";
  return path.replace(/\/+$/, "");
};

export const buildRouteStructuredData = (pathname, routeMeta) => {
  const normalizedPathname = normalizePathname(pathname);
  const pagePath = normalizedPathname === "/index" ? "/" : normalizedPathname;
  const pageUrl = `${BASE_URL}${pagePath}`;
  const schemas = [];

  if (pagePath === "/") {
    schemas.push({
      "@context": "https://schema.org",
      "@type": ["CleaningService", "LocalBusiness"],
      name: ORGANIZATION_NAME,
      url: BASE_URL,
      telephone: ORGANIZATION_PHONE,
      address: ORGANIZATION_ADDRESS,
      areaServed: AREA_SERVED,
    });
  }

  const serviceConfig = SERVICE_SCHEMA_CONFIG[pagePath];
  if (serviceConfig) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Service",
      name: serviceConfig.name,
      serviceType: serviceConfig.serviceType,
      areaServed: AREA_SERVED,
      provider: {
        "@type": "LocalBusiness",
        name: ORGANIZATION_NAME,
        telephone: ORGANIZATION_PHONE,
        address: ORGANIZATION_ADDRESS,
        areaServed: AREA_SERVED,
        url: BASE_URL,
      },
      url: pageUrl,
      description: routeMeta?.description,
    });
  }

  const breadcrumbItems = BREADCRUMB_CONFIG[pagePath];
  if (breadcrumbItems) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbItems.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: `${BASE_URL}${item.path}`,
      })),
    });
  }

  return schemas;
};
