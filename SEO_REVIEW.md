# SEO Improvement Review (Updated April 9, 2026)

This review reflects the current implementation state in the codebase after recent SEO quick-win updates.

## Current implementation snapshot

### ✅ Completed quick wins

1. **Route-level metadata is now implemented.**
   - `MetaTags.jsx` is route-aware and sets per-route title/description/canonical/OG/Twitter tags.
   - Metadata is mounted at the app shell level in `client/src/index.jsx`, so all routes can update head tags.

2. **Homepage canonical is normalized to `/index` (business collateral alignment).**
   - Both `/` and `/index` route metadata resolve to canonical `/index`.
   - Sitemap homepage entry is now `https://www.cleanarsolutions.ca/index`.

3. **Sitemap cleanup is done.**
   - Invalid entry `/quick-quote` has been removed.
   - Blog listing, blog detail routes, privacy page, and key public pages are included.

4. **Blog structured data is implemented.**
   - `BlogPosting` JSON-LD is now generated for both current blog detail pages.
   - Dates currently configured:
     - ISSA article: published **2025-11-01**, modified **2026-02-01**
     - CQCC article: published **2026-02-01**, modified **2026-02-01**

5. **Private route crawl controls are implemented.**
   - `MetaTags.jsx` applies `noindex,nofollow` to admin/auth/sensitive flows via route patterns.
   - `robots.txt` disallows known private paths (`/admin/`, `/login-signup`, `/profile-page`, `/invoices/`, etc.).

6. **OG image reference is centralized.**
   - `MetaTags.jsx` and `client/index.html` use the same absolute OG image URL:
     - `https://www.cleanarsolutions.ca/apple-icon.jpg`

7. **Legacy template banner cleanup is done.**
   - The Now UI Kit comment banner has been removed from `client/index.html`.

---

## Open items (next priorities)

### High impact

1. **Rendering strategy (SSR/prerender) still pending.**
   - Site remains a client-rendered SPA.
   - Recommended next step: prerender key marketing routes (`/index`, `/about-us`, `/products-and-services`, `/blog`, blog details).

2. **International SEO strategy still undefined.**
   - i18n exists, but there is no URL-level language strategy or `hreflang` mapping.
   - Recommended next step: choose URL convention (e.g., `/en/...`, `/fr/...`, `/es/...`) and add `hreflang` + sitemap alternates.

3. **Route normalization at server level still pending.**
   - Canonical points to `/index`, but hard 301 normalization strategy should be explicitly enforced server-side.
   - Recommended next step: enforce one homepage URL policy in hosting/server redirects.

4. **CI SEO checks are not yet automated.**
   - Recommended next step: add Lighthouse CI + sitemap validation + broken-link checks in CI.

### Medium impact

5. **Additional schema opportunities remain.**
   - Consider adding `Service` schema for service pages and `FAQPage` schema where applicable.

6. **Heading and semantic hierarchy audit remains.**
   - Validate one H1 per page and orderly H2/H3 structure on all public pages.

---

## OG image guidance (current path uses `apple-icon.jpg`)

Use one production-ready image with these standards:

- **Dimensions:** 1200 × 630 px (recommended for Facebook/LinkedIn/X previews)
- **Aspect ratio:** 1.91:1
- **Format:** PNG or high-quality JPG
- **File size target:** ideally under 300 KB (hard max ~1 MB)
- **Content:**
  - CleanAR brand/logo
  - Short readable headline (5–8 words)
  - High contrast for mobile previews
  - No dense text blocks
- **Safety margin:** keep logo/text away from outer 60 px edges
- **URL stability:** keep filename stable at the final public path (currently `/apple-icon.jpg`) to avoid stale share metadata

### Suggested baseline creative
- Background: clean workspace or branded light gradient
- Foreground: CleanAR logo + line like “Professional Cleaning in Toronto & GTA”
- Optional badge: “ISSA Member” / “LGBTQ+ Certified Supplier” (if legible at thumbnail size)

---

## Quick wins status board

- [x] Replace static canonical in `index.html` with per-route canonical handling
- [x] Remove invalid sitemap entries and add missing blog routes
- [x] Add `BlogPosting` schema to blog detail pages
- [x] Add `noindex` meta on admin/auth flows
- [x] Normalize OG image URLs to a single canonical asset
