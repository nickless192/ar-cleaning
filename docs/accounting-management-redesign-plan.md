# Accounting Management Revamp Plan

## 1) Current-State Audit

### What exists now
- **Admin information architecture** has a dedicated `/admin/accounting` area with 4 tabs:
  1) Income & Finance Overview
  2) Expense Management
  3) Services & Products Configuration
  4) Financial Reports (currently Monthly Profit Compare)
- **Finance dashboard** currently combines KPI cards + monthly chart + forecast + top customers + status breakdown from `/api/finance/summary`.
- **Expense dashboard** supports accrual/cash view, period filtering, category-based entry, receipt OCR, and statement import.
- **Invoices** are managed in the booking section (not accounting), with list/detail views and mark-as-paid actions.
- **Booking dashboard** includes operational alerts (upcoming jobs, completed but unpaid, needs invoice, missed bookings).
- **Visitor reports** exist under customer/contact management and are unrelated to accounting outcomes.

### Key strengths
- Working **React Bootstrap/Reactstrap tabbed structure** and card/table conventions are already in place.
- Core backend primitives already exist for business financial analytics:
  - finance summary + monthly profit endpoints
  - invoice CRUD + send/pdf
  - expense CRUD + OCR + monthly summary
- Booking model already stores useful finance lifecycle timestamps (`completedAt`, `paidAt`, invoice flags, workflow flags).

### Key structural issues found
1. **Accounting signal is fragmented across areas**
   - Invoices are under Booking; analytics are under Accounting; visitor “reports” are under Customer section.
2. **Revenue and receivables are mixed concepts**
   - Finance KPIs focus on booking status buckets and weighted pipeline, but do not directly present AR metrics (open/unpaid/overdue aging, due-soon collections).
3. **Profit view is separated but not unified**
   - Monthly profit compare exists, but no single owner view that ties revenue + expenses + receivables + expected cash-in.
4. **Data contract mismatches / fragility**
   - `RechartMonthly` expects fields (`recognized/projected/expenses/net` + numeric month) inconsistent with finance dashboard payload (`month: YYYY-MM`, `total`).
   - Invoice route order likely conflicts: `/:id` route declared before `/by-booking/:bookingId`, which can mask the by-booking route.
5. **Invoice model lacks collections-critical fields**
   - No due date, overdue metadata, AR aging buckets, partial payment handling maturity, or collection activity timeline.
6. **Expense/income basis logic differs by endpoint**
   - Some endpoints use `date`, others use `completedAt`/`paidAt` fallbacks; basis alignment is not fully standardized.
7. **No explicit “top clients by period” / “revenue by service” dashboard standard**
   - Some data exists (`top customers`, `incomeByService` in overview), but not packaged consistently into executive widgets.

---

## 2) File Map (Accounting / Invoice / Booking / Payment / Dashboard / Report)

### Frontend (primary)

#### Shell / navigation
- `client/src/index.jsx` (admin routes, `/admin/accounting`, `/admin/booking`, `/admin/customer`)
- `client/src/components/Pages/ManagementViews/AdminManagementLayout.jsx`

#### Accounting area
- `client/src/components/Pages/ManagementViews/AccountingTabbedView.jsx`
- `client/src/components/Pages/Dashboards/FinanceDashboard.jsx`
- `client/src/components/Pages/Dashboards/ExpenseDashboard.jsx`
- `client/src/components/Pages/Dashboards/MonthlyProfitCompare.jsx`
- `client/src/components/Pages/Dashboards/RechartMonthly.jsx`

#### Booking + invoicing (currently split from accounting)
- `client/src/components/Pages/ManagementViews/BookingTabbedView.jsx`
- `client/src/components/Pages/Management/BookingDashboard.jsx`
- `client/src/components/Pages/Booking/InvoiceList.jsx`
- `client/src/components/Pages/Booking/InvoiceDetail.jsx`
- `client/src/components/Pages/Booking/GenerateInvoiceModal.jsx`

#### Reports (currently visitor-centric)
- `client/src/components/Pages/ManagementViews/ContactManagementTabbedView.jsx`
- `client/src/components/Pages/Dashboards/ReportsDashboard.jsx`
- `client/src/components/Pages/Dashboards/DailyReport.jsx`
- `client/src/components/Pages/Dashboards/WeeklyReport.jsx`
- `client/src/components/Pages/Management/ReportDownloadButton.jsx`

### Backend (primary)

#### Routes
- `server/routes/api/index.js` (mount points)
- `server/routes/api/financeRoutes.js`
- `server/routes/api/expensesRoutes.js`
- `server/routes/api/invoiceRoutes.js`
- `server/routes/api/bookingRoutes.js`
- `server/routes/api/adminReportsRoutes.js`

#### Controllers
- `server/controllers/financeControllers.js`
- `server/controllers/expensesController.js`
- `server/controllers/invoiceControllers.js`
- `server/controllers/bookingController.js`
- `server/controllers/eventsReportController.js`

#### Data models
- `server/models/Booking.js`
- `server/models/Invoice.js`
- `server/models/Expenses.js`

#### Supporting utilities
- `server/utils/invoicePdf.js`
- `server/utils/sendInvoiceEmail.js`

---

## 3) Data Flow Map (Current)

### A. Revenue + pipeline (finance summary)
1. Frontend `FinanceDashboard` builds filters and calls `GET /api/finance/summary`.
2. Backend `financeControllers.getFinanceSummary`:
   - derives period (month/custom/fiscal)
   - aggregates bookings by status and customer
   - computes earned, cash received, weighted pipeline, cancelled
   - computes monthly series + simple forecast
3. Frontend renders KPI cards, monthly chart, forecast chart/table, top-customer table.

### B. Expenses
1. `ExpenseDashboard` calls `GET /api/expenses?method=...&from=...&to=...`.
2. `expensesController.getExpenses` filters by `incurredAt` or `paidAt` basis.
3. `ExpenseDashboard` supports create/update with multipart upload and OCR helpers (`/api/expenses/ocr-receipt`, `/api/expenses/ocr-bank-statement`).
4. Expense monthly aggregation available at `/api/expenses/monthly-summary` (not fully unified with finance monthly profit consumption pattern).

### C. Profit
1. `MonthlyProfitCompare` calls `GET /api/finance/monthly-profit?from&to&incomeMethod`.
2. Backend calculates month series from bookings (cash/accrual) and expenses.
3. Frontend compares monthly income vs expenses and net.

### D. Invoices / payments
1. Invoice creation from booking modal -> `POST /api/invoices`.
2. Invoice list/detail fetch -> `GET /api/invoices`, `GET /api/invoices/:id`.
3. Mark paid -> `PUT /api/invoices/:id` updates invoice + booking status.
4. Send PDF -> `POST /api/invoices/:id/send`, `GET /api/invoices/:id/pdf`.

### E. Operational booking alerts
- `BookingDashboard` derives unpaid / needs-invoice / missed statuses in UI using bookings feed (`/api/bookings`).
- This alert logic is not currently part of accounting summary payloads.

---

## 4) UX Pain Points (Owner Decision-Making Perspective)

1. **No true executive “today/this month at a glance” page**
   - Owner must jump across Finance, Expenses, Booking-Invoices, and Profit tabs.
2. **Receivables and cash collection risk are not first-class**
   - Unpaid and overdue invoices are not surfaced as headline finance widgets with aging buckets.
3. **Expected cash-in is implicit, not explicit**
   - Weighted pipeline exists, but collections forecast (based on issued/unpaid invoices + due dates) is missing.
4. **Top clients and revenue-by-service are not consistently visualized**
   - Data may exist but no stable executive cards/charts for fast ranking/trend inspection.
5. **Inconsistent mental models for cash vs accrual**
   - Different pages/endpoints use different date bases and labels; this makes decisions less trustworthy.
6. **Reports IA confusion**
   - “Reports Dashboard” currently represents visitor traffic reports, not business/accounting performance reports.
7. **Some implementation mismatches increase reliability risk**
   - Chart data shape mismatch and route-order issues can reduce confidence and increase support burden.

---

## 5) Recommended Dashboard / Page Structure (Target IA)

> Keep existing React + Bootstrap tab patterns; reorganize content, not framework.

### A. Accounting Home (new top-level in `/admin/accounting`)
Single owner cockpit with 4 zones:
1. **Health KPIs (headline row)**
   - Revenue MTD (accrual/cash toggle)
   - Expenses MTD
   - Gross Profit MTD
   - Net Profit MTD
2. **Collections & Cash-In (second row)**
   - Unpaid invoices total/count
   - Overdue invoices total/count
   - Expected cash-in (next 7/30 days)
   - Collection rate (paid within X days)
3. **Trend & Mix (charts)**
   - Monthly revenue/expense/profit trend (12 months)
   - Revenue by service mix (bar or donut)
   - Top clients by revenue (table + sparkline)
4. **Action queue (operational)**
   - Overdue invoice list
   - Jobs completed but uninvoiced
   - Upcoming high-value bookings not confirmed

### B. Subpages/Tabs under Accounting
1. **Overview** (new cockpit above)
2. **Receivables** (invoice aging + follow-up queue)
3. **Revenue** (service/client/time deep dives)
4. **Expenses** (existing expense management enhanced with insights)
5. **Profit & Trends** (existing MonthlyProfitCompare evolved)
6. **Settings / Definitions**
   - accrual vs cash defaults
   - fiscal year start
   - pipeline weighting presets

### C. Cross-area cleanup recommendations
- Keep booking operational workflow in Booking section, but **surface accounting-relevant action cards in Accounting Overview** via shared APIs.
- Move/rename visitor reports so “Reports” inside accounting is clearly financial.

---

## 6) KPI Recommendations

### Must-have owner KPIs
- Revenue (MTD, last month, YoY same month)
- Expenses (MTD, last month, YoY same month)
- Gross Profit + Net Profit (MTD)
- Open AR (unpaid invoices total)
- Overdue AR (overdue invoices total + aging buckets)
- Expected Cash-In (7/30/60 days)
- Top 5 Clients (period revenue + share)
- Top Services (period revenue + margin proxy if COGS available)
- Revenue Trend (12 months)
- Profit Trend (12 months)

### Supporting KPIs
- Invoice conversion lag (job completed -> invoice issued)
- Invoice collection days (invoice issued -> paid)
- Collection rate within terms
- Cancelled value and refund impact (if applicable)

---

## 7) Chart / Table / Widget Recommendations

### Dashboard widgets
- **KPI cards**: compact, with MoM delta and colored trend indicator.
- **Receivables aging strip**: Current, 1–30, 31–60, 61–90, 90+ days.
- **Expected cash-in widget**: stacked bars by confidence (invoiced due, booked pipeline).

### Charts
- **Monthly combo chart**: revenue (bar), expenses (bar), net profit (line).
- **Revenue by service**: horizontal bar for readability.
- **Top clients**: table with contribution %, trend sparkline, unpaid exposure.

### Tables
- **Overdue invoice table**: invoice #, client, amount, due date, days overdue, last contact, action.
- **Uninvoiced completed jobs table**: booking date, client, service, expected amount, action “Create invoice”.
- **Expense variance table**: category vs last month vs 3-month average.

---

## 8) Backend Data Gaps (and API Gaps)

## Backend-required (high priority)
1. **Invoice terms and aging fields**
   - Add: `issuedAt`, `dueAt`, `paidAt` (invoice-level canonical), `balanceDue`, `paymentTermsDays`, optional `lastReminderAt`.
2. **Overdue / AR endpoints**
   - New endpoint for receivables summary and aging buckets.
3. **Expected cash-in endpoint**
   - Blend due invoices + likely near-term bookings/pipeline with configurable confidence.
4. **Revenue by service endpoint (stable contract)**
   - Period + basis (cash/accrual), grouped from booking service lines.
5. **Unified monthly trend endpoint**
   - Revenue/expenses/profit in one payload with consistent date basis.
6. **Data quality hardening**
   - Align date basis defaults across finance + expenses + invoicing.
   - Fix route declaration order in invoice routes for deterministic matching.

## Frontend-only (can start immediately)
1. **Information architecture cleanup** in `/admin/accounting` tabs.
2. **Widget composition from existing endpoints** (interim version).
3. **Labeling and basis consistency** in UI copy, badges, and legends.
4. **Action-oriented sections** (overdue/unpaid placeholders from current invoice status until due-date fields exist).
5. **Chart component contract fixes** for existing payloads (without waiting for backend).

---

## 9) Phased Implementation Plan (Small, Reviewable)

## Phase 0 — Alignment & Instrumentation (Frontend-only + light backend hygiene)
- Deliverables:
  - Confirm KPI definitions + basis rules (cash vs accrual).
  - Fix obvious contract/routing pitfalls that block reliable UI.
  - Add accounting glossary/tooltips.
- Acceptance criteria:
  - KPI definition doc approved by owner.
  - No broken chart payload mappings.
  - Invoice by-booking route behaves deterministically.

## Phase 1 — Accounting Overview v1 (Frontend-first)
- Deliverables:
  - New Overview tab in Accounting.
  - Headline cards: Revenue, Expenses, Profit, Unpaid total.
  - Basic trend chart + top clients table using existing APIs.
  - Action queue for unpaid and “completed but uninvoiced” using current fields.
- Acceptance criteria:
  - Owner can answer “How are we doing this month?” in <30 seconds.
  - All widgets load within existing auth/admin context and responsive layout.

## Phase 2 — Receivables v1 (Backend-required)
- Deliverables:
  - Invoice schema/API enhancements (`dueAt`, AR aging).
  - Receivables tab with aging buckets and overdue table.
  - Expected cash-in (7/30) based on due invoices.
- Acceptance criteria:
  - Overdue totals match invoice ledger for selected period.
  - AR aging buckets reconcile to total unpaid balance.

## Phase 3 — Revenue Intelligence (Mixed)
- Deliverables:
  - Revenue by service chart + trend.
  - Top clients page (revenue, share, open balance).
  - Filters: period, service, client segment.
- Acceptance criteria:
  - Owner can identify top 3 revenue services and top 5 clients by period.
  - Filtered totals reconcile with summary totals.

## Phase 4 — Profit Intelligence & Forecasting (Mixed)
- Deliverables:
  - Unified monthly trend API + advanced compare UI.
  - Profit bridge (revenue -> expenses -> net).
  - Cash-in forecast model improvements (invoice due + pipeline confidence).
- Acceptance criteria:
  - Profit numbers reconcile with revenue/expense components.
  - Forecast assumptions are visible and editable.

## Phase 5 — Workflow Optimization (Frontend + optional backend)
- Deliverables:
  - In-dashboard operational tasks (send reminder, mark paid, create invoice).
  - Saved views and period presets.
- Acceptance criteria:
  - Reduction in overdue invoices and invoice-to-paid days across 1–2 cycles.

---

## 10) Frontend-Only vs Backend-Required Work Breakdown

## Frontend-only candidates (start now)
- Reorganize accounting tabs and labels.
- Build owner cockpit layout with existing cards/charts/tables.
- Improve visual hierarchy and action-first widgets.
- Standardize copy around accrual/cash toggles.
- Improve chart data adapters between API shape and component expectations.

## Backend-required candidates (schedule with API work)
- Due dates / AR aging / expected cash-in APIs.
- Revenue-by-service canonical endpoint with stable grouping.
- Unified trend endpoint with explicit accounting basis.
- Data-quality migrations for legacy invoice/booking records.

---

## 11) Practical “Definition of Done” for the Revamp

A release is successful when a business owner can, from `/admin/accounting` alone:
1. See current month revenue, expenses, and profit (cash/accrual basis clearly shown).
2. See unpaid + overdue exposure and expected cash in next 30 days.
3. Identify top clients and top services for the selected period.
4. Understand monthly trend direction quickly (revenue, expense, profit).
5. Act immediately on overdue/uninvoiced items without hunting across unrelated tabs.

