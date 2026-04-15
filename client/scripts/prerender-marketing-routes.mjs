import fs from "node:fs";
import path from "node:path";

const BASE_URL = "https://www.cleanarsolutions.ca";
const DIST_DIR = path.resolve(process.cwd(), "dist");
const DIST_INDEX = path.join(DIST_DIR, "index.html");
const OG_IMAGE = `${BASE_URL}/og-image.jpg`;

const ROUTES = [
  {
    route: "/",
    output: "index.html",
    title: "CleanAR Solutions - Professional Cleaning Services in Toronto & GTA",
    description:
      "Professional cleaning services in Toronto & GTA. Residential, commercial, carpet & upholstery cleaning. Get your free quote today!",
    canonical: `${BASE_URL}/`,
    h1: "Professional Cleaning Services in Toronto & GTA",
  },
  {
    route: "/index",
    output: "index/index.html",
    title: "CleanAR Solutions - Professional Cleaning Services in Toronto & GTA",
    description:
      "Professional cleaning services in Toronto & GTA. Residential, commercial, carpet & upholstery cleaning. Get your free quote today!",
    canonical: `${BASE_URL}/index`,
    h1: "Book Trusted Cleaning Services with CleanAR Solutions",
  },
  {
    route: "/about-us",
    output: "about-us/index.html",
    title: "About CleanAR Solutions | Toronto & GTA Cleaning Team",
    description:
      "Learn about CleanAR Solutions, our mission, and our commitment to reliable, high-quality cleaning services across Toronto and the GTA.",
    canonical: `${BASE_URL}/about-us`,
    h1: "About Our Toronto Cleaning Team",
  },
  {
    route: "/products-and-services",
    output: "products-and-services/index.html",
    title: "Cleaning Services | Residential & Commercial | CleanAR Solutions",
    description:
      "Explore residential and commercial cleaning services from CleanAR Solutions in Toronto and the GTA.",
    canonical: `${BASE_URL}/products-and-services`,
    h1: "Residential and Commercial Cleaning Services",
  },
  {
    route: "/blog",
    output: "blog/index.html",
    title: "CleanAR Blog | Cleaning Insights & Company Updates",
    description:
      "Read the latest news, certifications, and cleaning insights from CleanAR Solutions.",
    canonical: `${BASE_URL}/blog`,
    h1: "CleanAR Blog and Company Updates",
  },
  {
    route: "/services/residential-cleaning",
    output: "services/residential-cleaning/index.html",
    title: "Residential Cleaning Services in Toronto | CleanAR Solutions",
    description:
      "Recurring and one-time residential cleaning services in Toronto and the GTA from the CleanAR Solutions team.",
    canonical: `${BASE_URL}/services/residential-cleaning`,
    h1: "Residential Cleaning Services",
  },
  {
    route: "/services/commercial-cleaning",
    output: "services/commercial-cleaning/index.html",
    title: "Commercial Cleaning Services in Toronto | CleanAR Solutions",
    description:
      "Professional commercial cleaning for offices and facilities in Toronto and the GTA by CleanAR Solutions.",
    canonical: `${BASE_URL}/services/commercial-cleaning`,
    h1: "Commercial Cleaning Services",
  },
  {
    route: "/services/window-cleaning",
    output: "services/window-cleaning/index.html",
    title: "Window Cleaning Services in Toronto | CleanAR Solutions",
    description:
      "Interior and exterior window cleaning services for homes and businesses across Toronto and the GTA.",
    canonical: `${BASE_URL}/services/window-cleaning`,
    h1: "Window Cleaning Services",
  },
  {
    route: "/services/carpet-and-upholstery-cleaning",
    output: "services/carpet-and-upholstery-cleaning/index.html",
    title: "Carpet & Upholstery Cleaning in Toronto | CleanAR Solutions",
    description:
      "Deep carpet and upholstery cleaning services to refresh homes and workplaces in Toronto and surrounding GTA areas.",
    canonical: `${BASE_URL}/services/carpet-and-upholstery-cleaning`,
    h1: "Carpet and Upholstery Cleaning Services",
  },
  {
    route: "/services/power-pressure-washing",
    output: "services/power-pressure-washing/index.html",
    title: "Power & Pressure Washing in Toronto | CleanAR Solutions",
    description:
      "Power and pressure washing services for exterior surfaces throughout Toronto and the GTA.",
    canonical: `${BASE_URL}/services/power-pressure-washing`,
    h1: "Power and Pressure Washing Services",
  },
];

const upsertTag = (html, pattern, replacement) => {
  if (pattern.test(html)) {
    return html.replace(pattern, replacement);
  }
  return html.replace("</head>", `  ${replacement}\n</head>`);
};

const buildRouteHtml = (baseHtml, routeMeta) => {
  let html = baseHtml;

  html = html.replace(/<title>.*?<\/title>/is, `<title>${routeMeta.title}</title>`);
  html = upsertTag(
    html,
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${routeMeta.description}" />`
  );
  html = upsertTag(
    html,
    /<link\s+rel=["']canonical["'][^>]*>/i,
    `<link rel="canonical" href="${routeMeta.canonical}" />`
  );
  html = upsertTag(
    html,
    /<meta\s+property=["']og:url["'][^>]*>/i,
    `<meta property="og:url" content="${routeMeta.canonical}" />`
  );
  html = upsertTag(
    html,
    /<meta\s+property=["']og:title["'][^>]*>/i,
    `<meta property="og:title" content="${routeMeta.title}" />`
  );
  html = upsertTag(
    html,
    /<meta\s+property=["']og:description["'][^>]*>/i,
    `<meta property="og:description" content="${routeMeta.description}" />`
  );
  html = upsertTag(
    html,
    /<meta\s+property=["']og:image["'][^>]*>/i,
    `<meta property="og:image" content="${OG_IMAGE}" />`
  );
  html = upsertTag(
    html,
    /<meta\s+name=["']twitter:card["'][^>]*>/i,
    '<meta name="twitter:card" content="summary_large_image" />'
  );
  html = upsertTag(
    html,
    /<meta\s+name=["']twitter:title["'][^>]*>/i,
    `<meta name="twitter:title" content="${routeMeta.title}" />`
  );
  html = upsertTag(
    html,
    /<meta\s+name=["']twitter:description["'][^>]*>/i,
    `<meta name="twitter:description" content="${routeMeta.description}" />`
  );
  html = upsertTag(
    html,
    /<meta\s+name=["']twitter:image["'][^>]*>/i,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`
  );

  const bodyNoscriptPattern = /(<body[^>]*>\s*)(<noscript>[\s\S]*?<\/noscript>)/i;
  const noscriptContent = `<noscript>\n    <h1>${routeMeta.h1}</h1>\n    <h2>${routeMeta.description}</h2>\n  </noscript>`;
  html = html.replace(bodyNoscriptPattern, `$1${noscriptContent}`);

  return html;
};

if (!fs.existsSync(DIST_INDEX)) {
  throw new Error(`Cannot prerender routes because ${DIST_INDEX} was not found.`);
}

const baseHtml = fs.readFileSync(DIST_INDEX, "utf8");

for (const route of ROUTES) {
  const routeHtml = buildRouteHtml(baseHtml, route);
  const outputPath = path.join(DIST_DIR, route.output);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, routeHtml, "utf8");
}

const generatedPaths = ROUTES.map((route) => route.output).join(", ");
console.log(`Generated prerendered marketing routes: ${generatedPaths}`);
