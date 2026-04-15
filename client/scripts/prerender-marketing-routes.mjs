import fs from "node:fs";
import path from "node:path";
import {
  BASE_URL,
  OG_IMAGE,
  ROUTE_META,
  MARKETING_PRERENDER_ROUTES,
  buildRouteStructuredData,
} from "../src/seo/routeMeta.mjs";

const DIST_DIR = path.resolve(process.cwd(), "dist");
const DIST_INDEX = path.join(DIST_DIR, "index.html");

const upsertTag = (html, pattern, replacement) => {
  if (pattern.test(html)) {
    return html.replace(pattern, replacement);
  }
  return html.replace("</head>", `  ${replacement}\n</head>`);
};

const buildRouteHtml = (baseHtml, routeConfig, routeMeta) => {
  let html = baseHtml;

  const canonicalPath = routeMeta.canonicalPath ?? routeConfig.route;
  const canonicalUrl = `${BASE_URL}${canonicalPath}`;

  html = html.replace(/<title>.*?<\/title>/is, `<title>${routeMeta.title}</title>`);
  html = upsertTag(
    html,
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${routeMeta.description}" />`
  );
  html = upsertTag(
    html,
    /<link\s+rel=["']canonical["'][^>]*>/i,
    `<link rel="canonical" href="${canonicalUrl}" />`
  );
  html = upsertTag(
    html,
    /<meta\s+property=["']og:url["'][^>]*>/i,
    `<meta property="og:url" content="${canonicalUrl}" />`
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
  html = upsertTag(
    html,
    /<meta\s+name=["']robots["'][^>]*>/i,
    '<meta name="robots" content="index, follow" />'
  );
  html = upsertTag(
    html,
    /<meta\s+name=["']googlebot["'][^>]*>/i,
    '<meta name="googlebot" content="index, follow" />'
  );

  const bodyNoscriptPattern = /(<body[^>]*>[\s\S]*?)(<noscript>[\s\S]*?<\/noscript>)/i;
  const noscriptContent = `<noscript>\n    <h1>${routeConfig.h1}</h1>\n    <h2>${routeMeta.description}</h2>\n  </noscript>`;
  html = html.replace(bodyNoscriptPattern, `$1${noscriptContent}`);

  const routeSchemas = buildRouteStructuredData(routeConfig.route, routeMeta);
  const routeSchemaScripts = routeSchemas
    .map((schema, index) => {
      const schemaType = Array.isArray(schema["@type"]) ? schema["@type"].join(",") : schema["@type"];
      return `  <script type="application/ld+json" data-route-schema="true" data-schema-type="${schemaType}" data-schema-index="${index}">${JSON.stringify(
        schema
      )}</script>`;
    })
    .join("\n");
  html = html.replace(/\s*<script[^>]*data-route-schema=["']true["'][^>]*>[\s\S]*?<\/script>/gi, "");
  html = html.replace(
    /<\/head>/i,
    `${routeSchemaScripts ? `${routeSchemaScripts}\n` : ""}</head>`
  );

  return html;
};

const validateRouteHtml = (html, routeConfig, routeMeta) => {
  const canonicalPath = routeMeta.canonicalPath ?? routeConfig.route;
  const canonicalUrl = `${BASE_URL}${canonicalPath}`;
  const requiredChecks = [
    { label: "canonical", pattern: new RegExp(`<link\\s+rel=["']canonical["'][^>]*href=["']${canonicalUrl.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}["']`, "i") },
    { label: "og:title", pattern: /<meta\s+property=["']og:title["'][^>]*>/i },
    { label: "og:description", pattern: /<meta\s+property=["']og:description["'][^>]*>/i },
    { label: "og:image", pattern: /<meta\s+property=["']og:image["'][^>]*>/i },
    { label: "twitter:card", pattern: /<meta\s+name=["']twitter:card["'][^>]*>/i },
    { label: "twitter:title", pattern: /<meta\s+name=["']twitter:title["'][^>]*>/i },
    { label: "twitter:description", pattern: /<meta\s+name=["']twitter:description["'][^>]*>/i },
    { label: "robots", pattern: /<meta\s+name=["']robots["'][^>]*content=["']index, follow["'][^>]*>/i },
    { label: "googlebot", pattern: /<meta\s+name=["']googlebot["'][^>]*content=["']index, follow["'][^>]*>/i },
  ];

  const missing = requiredChecks.filter((check) => !check.pattern.test(html)).map((check) => check.label);
  if (missing.length > 0) {
    throw new Error(
      `Prerender validation failed for route ${routeConfig.route}: missing ${missing.join(", ")}`
    );
  }

  const expectedSchemas = buildRouteStructuredData(routeConfig.route, routeMeta);
  const schemaTypeCounts = {
    cleaningServiceOrLocalBusiness: (
      html.match(/data-schema-type=["'][^"']*(CleaningService|LocalBusiness)[^"']*["']/g) || []
    ).length,
    service: (html.match(/data-schema-type=["']Service["']/g) || []).length,
    breadcrumbList: (html.match(/data-schema-type=["']BreadcrumbList["']/g) || []).length,
  };
  const expectedCounts = {
    cleaningServiceOrLocalBusiness: expectedSchemas.some((schema) => {
      const type = schema["@type"];
      return Array.isArray(type)
        ? type.includes("CleaningService") || type.includes("LocalBusiness")
        : type === "CleaningService" || type === "LocalBusiness";
    })
      ? 1
      : 0,
    service: expectedSchemas.some((schema) => schema["@type"] === "Service") ? 1 : 0,
    breadcrumbList: expectedSchemas.some((schema) => schema["@type"] === "BreadcrumbList") ? 1 : 0,
  };

  const mismatch = Object.entries(expectedCounts)
    .filter(([key, expected]) => schemaTypeCounts[key] !== expected)
    .map(([key, expected]) => `${key} expected ${expected} found ${schemaTypeCounts[key]}`);
  if (mismatch.length > 0) {
    throw new Error(`Schema validation failed for route ${routeConfig.route}: ${mismatch.join("; ")}`);
  }
};

if (!fs.existsSync(DIST_INDEX)) {
  throw new Error(`Cannot prerender routes because ${DIST_INDEX} was not found.`);
}

const baseHtml = fs.readFileSync(DIST_INDEX, "utf8");

for (const routeConfig of MARKETING_PRERENDER_ROUTES) {
  const routeMeta = ROUTE_META[routeConfig.route];
  if (!routeMeta) {
    throw new Error(`Missing route metadata for prerender route: ${routeConfig.route}`);
  }

  const routeHtml = buildRouteHtml(baseHtml, routeConfig, routeMeta);
  validateRouteHtml(routeHtml, routeConfig, routeMeta);

  const outputPath = path.join(DIST_DIR, routeConfig.output);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, routeHtml, "utf8");
}

const generatedPaths = MARKETING_PRERENDER_ROUTES.map((route) => route.output).join(", ");
console.log(`Generated prerendered marketing routes: ${generatedPaths}`);
