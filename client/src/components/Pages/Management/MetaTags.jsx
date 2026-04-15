import React from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "react-router-dom";
import { BASE_URL, OG_IMAGE, ROUTE_META } from "../../../seo/routeMeta.mjs";

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
  const canonicalPath =
    normalizedPathname === "/index"
      ? "/"
      : normalizePathname(routeMeta.canonicalPath ?? normalizedPathname);
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
