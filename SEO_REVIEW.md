# SEO Improvement Review (April 9, 2026)

This review is based on a static audit of the current codebase.

## High-impact opportunities

1. **Move away from client-only rendering for key marketing pages.**
   - The app is a React SPA bootstrapped from a single entry (`client/index.html`) and routes are rendered client-side in `client/src/index.jsx`.
   - For non-branded queries, crawlers and social bots generally perform better when content is available in the initial HTML response.
   - **Recommendation:** Add SSR or pre-rendering for `/index`, `/about-us`, `/products-and-services`, and blog pages.

2. **Use route-specific metadata instead of one global homepage metadata block.**
   - Global tags in `client/index.html` are homepage-specific and reused by default for all routes.
   - `MetaTags.jsx` is also hardcoded to homepage values and currently only used on the Index view.
   - **Recommendation:** Standardize route-level title/description/canonical/OG tags for each public URL (including blog posts).

3. **Fix URL canonicalization and duplicate path patterns.**
   - Routing supports both `/` and `/index` and redirects can create duplicate content states.
   - Sitemap includes `/` and `/index`, which may split ranking signals if not normalized.
   - **Recommendation:** Pick one canonical homepage URL (prefer `/`), 301-redirect the other, and align canonical tags + sitemap.

4. **Repair and expand sitemap coverage.**
   - Current sitemap includes a path (`/quick-quote`) that does not appear in router definitions.
   - Important indexable routes are missing (e.g., blog post URLs, privacy policy, localized URL strategy if applicable).
   - **Recommendation:** Generate sitemap from actual routes/content and validate in Search Console.

5. **Strengthen structured data and keep it synchronized.**
   - There is LocalBusiness JSON-LD in `client/index.html`, which is good.
   - But business/service/review/blog schema appears limited to homepage-level data.
   - **Recommendation:** Add `Service` and `FAQPage` schema where relevant, and `BlogPosting` for each article page.

## Medium-impact opportunities

6. **Add explicit robots handling for private/admin routes.**
   - Public `robots.txt` currently allows all crawling globally.
   - App contains admin/auth/invoice routes in router config.
   - **Recommendation:** Add `noindex` for authenticated/sensitive pages and disallow known private paths when appropriate.

7. **Improve international SEO strategy (if EN/ES/FR pages are intended for indexing).**
   - i18n is configured, but there is no clear `hreflang` URL mapping strategy in the head tags/sitemap.
   - **Recommendation:** Introduce language-specific URLs (or query strategy), add `hreflang`, and include alternates in sitemap.

8. **Optimize Open Graph image consistency and reliability.**
   - OG image URLs differ between `index.html` and `MetaTags.jsx`, and one points to a build artifact-style path.
   - **Recommendation:** Use stable, absolute OG/Twitter image URLs hosted in `public` and keep dimensions/social previews validated.

9. **Tighten heading/content semantics for crawl clarity.**
   - Hero uses H1/H2 correctly, but broader page hierarchy and repeated component blocks should be reviewed for semantic consistency.
   - **Recommendation:** Ensure one H1 per page, logical H2/H3 sections, and descriptive anchor text for key conversion links.

10. **Automate technical SEO checks in CI.**
    - No visible SEO validation pipeline in current repo.
    - **Recommendation:** Add periodic checks (Lighthouse CI, broken-link checks, sitemap validation, metadata regression tests).

## Quick wins (1–2 days)

- Replace static canonical in `index.html` with per-route canonical handling.
- Remove invalid sitemap entries and add missing blog routes.
- Add `BlogPosting` schema to blog detail pages.
- Add `noindex` meta on admin/auth flows.
- Normalize OG image URLs to a single canonical asset.
