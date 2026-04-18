# Frontend Security Audit (April 18, 2026)

Scope audited: `client/src` with cross-checks against `server/routes/api` and related middleware.

## 1) Assumptions about `/uploads`

### Findings

- No frontend file hardcodes `"/uploads"` directly.
- The frontend *does* assume the backend returns directly browsable file URLs by rendering `exp.receiptUrl` into an anchor tag (`<a href={exp.receiptUrl}>`).
- The backend builds those URLs using the `/uploads/...` path pattern (for expense receipts), which creates an implicit contract between frontend display logic and backend path strategy.

### Risk

- If `/uploads` is not publicly served or serving behavior changes, receipt links in the frontend will silently break.
- If `receiptUrl` is not strictly controlled server-side, the frontend will still render whatever URL it receives.

### Evidence

- Frontend receipt link rendering: `client/src/components/Pages/Dashboards/ExpenseDashboard.jsx`.
- Backend URL construction to `/uploads/...`: `server/controllers/expensesController.js`.

## 2) Direct API calls without auth headers

### Findings

- There is a project utility intended for bearer auth requests (`authFetch`) and some admin screens use it.
- A substantial number of frontend modules still call `fetch('/api/...')` directly without `Authorization` headers.
- Several of those calls target routes that are explicitly protected on the backend by `authMiddleware + requireAdminFlag`, so these calls rely on unauthenticated requests and are likely to fail or behave inconsistently.

### High-signal examples

- **Expenses admin UI** uses direct `fetch` for list/create/update/delete and OCR actions: `client/src/components/Pages/Dashboards/ExpenseDashboard.jsx`.
- **Invoice management UI** uses direct `fetch` for list/update/delete: `client/src/components/Pages/Booking/InvoiceList.jsx`.
- **Category management UI** uses direct `fetch` for CRUD: `client/src/components/Pages/Management/ManageCategories.jsx`.

### Server-side cross-check

- Expenses routes require admin auth middleware chain: `server/routes/api/expensesRoutes.js`.
- Categories routes require admin auth middleware chain: `server/routes/api/categoryRoutes.js`.
- Customer routes require admin auth middleware chain (some frontend customer operations still use direct fetch in other files): `server/routes/api/customerRoutes.js`.

### Risk

- Inconsistent auth behavior across frontend screens.
- Increased chance of 401/403 failures in production UX.
- Higher maintenance burden from mixed fetch patterns.

## 3) Exposure of sensitive endpoints

### Findings

- Sensitive/admin-oriented endpoint paths are directly referenced in the frontend bundle (normal for SPAs), including:
  - `/api/quotes/quickquote/unacknowledged`
  - `/api/invoices` and `/api/invoices/:id`
  - `/api/expenses` and `/api/expenses/ocr-receipt`
- A key issue found is not just endpoint discoverability, but **server-side protection gaps** for routes that look admin-only by naming.

### Critical server-side gap observed during frontend audit

- Quote routes define operations named/admin-intended (e.g., `quickquote/unacknowledged`, delete/acknowledge quick quotes), but apply only rate limiting in routing and do not apply `authMiddleware` / admin authorization checks in that file.

### Risk

- Sensitive route names are trivially discoverable from client code (expected).
- If backend route guards are missing or inconsistent, endpoint discoverability becomes exploitable.

### Evidence

- Frontend call to unacknowledged quick quotes in navbar: `client/src/components/Pages/Navigation/Navbar.jsx`.
- Quote routing without auth guard chain in route file: `server/routes/api/quoteRoutes.js` and rate limiter definitions in `server/middleware/rateLimiters.js`.

## Recommended follow-ups (minimal-change sequence)

1. Normalize authenticated admin calls in frontend to `authFetch` (or a single existing authenticated wrapper) for admin pages first.
2. Prioritize backend hardening of quote routes by adding explicit `authMiddleware` + `requireAdminFlag` where intended.
3. For receipt links, document and enforce the `/uploads` contract (or provide signed/validated file URLs from backend consistently).
4. Add a lightweight lint/check rule or codemod guard to flag new direct `fetch('/api/...')` usages in protected admin modules.

