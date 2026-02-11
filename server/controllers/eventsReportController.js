const sgMail = require("@sendgrid/mail");
const { DateTime } = require("luxon");
const { VisitorLog } = require("../models");

// Make sure your SendGrid key is set
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// -------------------------
// Toronto day helpers
// -------------------------
function torontoRangeForDay(dateStr /* YYYY-MM-DD */) {
  const start = DateTime.fromISO(dateStr, { zone: "America/Toronto" }).startOf("day");
  const end = start.endOf("day");
  return { start: start.toUTC().toJSDate(), end: end.toUTC().toJSDate() };
}

function torontoYesterdayISO() {
  return DateTime.now().setZone("America/Toronto").minus({ days: 1 }).toISODate();
}

// -------------------------
// Aggregation (events)
// -------------------------
async function buildDailyEventsReport({
  dateStr,
  excludeBots = true,
  topLimit = 30,
} = {}) {
  const day = dateStr || torontoYesterdayISO();
  const { start, end } = torontoRangeForDay(day);

  const baseMatch = {
    visitDate: { $gte: start, $lte: end },
    ...(excludeBots ? { isBot: { $ne: true } } : {}),
  };

  const pipeline = [
    { $match: baseMatch },
    {
      $facet: {
        headline: [
          {
            $group: {
              _id: null,
              totalSessions: { $sum: 1 },
              uniqueVisitorsSet: { $addToSet: "$visitorId" },
              sessionsWithEvents: {
                $sum: {
                  $cond: [
                    { $gt: [{ $size: { $ifNull: ["$events", []] } }, 0] },
                    1,
                    0,
                  ],
                },
              },
              totalEvents: {
                $sum: { $size: { $ifNull: ["$events", []] } },
              },
              qualifiedSessions: {
                $sum: { $cond: [{ $eq: ["$qualified", true] }, 1, 0] },
              },
              bounces: {
                $sum: { $cond: [{ $eq: ["$isBounce", true] }, 1, 0] },
              },
            },
          },
          { $addFields: { uniqueVisitors: { $size: "$uniqueVisitorsSet" } } },
          { $project: { uniqueVisitorsSet: 0 } },
        ],

        topEvents: [
          { $match: { events: { $exists: true, $ne: [] } } },
          { $unwind: "$events" },
          {
            $group: {
              _id: "$events.name",
              count: { $sum: 1 },
              sessions: { $addToSet: "$sessionId" },
              pages: { $addToSet: "$events.page" },
            },
          },
          {
            $project: {
              _id: 0,
              event: "$_id",
              count: 1,
              uniqueSessions: { $size: "$sessions" },
              pages: {
                $slice: [
                  {
                    $filter: {
                      input: "$pages",
                      as: "p",
                      cond: { $and: [{ $ne: ["$$p", null] }, { $ne: ["$$p", ""] }] },
                    },
                  },
                  6,
                ],
              },
            },
          },
          { $sort: { count: -1 } },
          { $limit: topLimit },
        ],

        // Page-level: which pages produce the most events
        eventsByPage: [
          { $match: { events: { $exists: true, $ne: [] } } },
          { $unwind: "$events" },
          {
            $group: {
              _id: "$events.page",
              count: { $sum: 1 },
              sessions: { $addToSet: "$sessionId" },
            },
          },
          {
            $project: {
              _id: 0,
              page: { $ifNull: ["$_id", "unknown"] },
              count: 1,
              uniqueSessions: { $size: "$sessions" },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 15 },
        ],

        // Helpful: top referrer hosts for humans
        topReferrers: [
          { $match: { referrer: { $ne: null } } },
          {
            $addFields: {
              refHost: {
                $replaceAll: {
                  input: { $replaceAll: { input: "$referrer", find: "https://", replacement: "" } },
                  find: "http://",
                  replacement: "",
                },
              },
            },
          },
          { $addFields: { refHost: { $arrayElemAt: [{ $split: ["$refHost", "/"] }, 0] } } },
          { $addFields: { refHost: { $replaceAll: { input: "$refHost", find: "www.", replacement: "" } } } },
          { $group: { _id: "$refHost", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          { $project: { _id: 0, referrer: "$_id", count: 1 } },
        ],
      },
    },
  ];

  const [result] = await VisitorLog.aggregate(pipeline).allowDiskUse(true);

  return {
    date: day,
    range: { start, end },
    excludeBots,
    headline: result.headline?.[0] || {
      totalSessions: 0,
      uniqueVisitors: 0,
      sessionsWithEvents: 0,
      totalEvents: 0,
      qualifiedSessions: 0,
      bounces: 0,
    },
    topEvents: result.topEvents || [],
    eventsByPage: result.eventsByPage || [],
    topReferrers: result.topReferrers || [],
  };
}

// -------------------------
// Email formatting
// -------------------------
function renderHtml(report) {
  const h = report.headline || {};
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));

  const li = (items, render) =>
    items?.length
      ? `<ul>${items.map(render).join("")}</ul>`
      : `<div style="color:#666">No data</div>`;

  return `
  <div style="font-family:Arial,sans-serif; line-height:1.4">
    <h2 style="margin:0 0 8px 0;">CleanAR — Daily Events Report</h2>
    <div style="color:#666; margin-bottom:12px;">
      Date (Toronto): <b>${esc(report.date)}</b> · Exclude bots: <b>${report.excludeBots ? "Yes" : "No"}</b>
    </div>

    <table cellpadding="8" cellspacing="0" style="border-collapse:collapse; margin: 8px 0 16px 0;">
      <tr>
        <td style="border:1px solid #ddd;"><b>Total sessions</b><br/>${h.totalSessions ?? 0}</td>
        <td style="border:1px solid #ddd;"><b>Unique visitors</b><br/>${h.uniqueVisitors ?? 0}</td>
        <td style="border:1px solid #ddd;"><b>Sessions w/ events</b><br/>${h.sessionsWithEvents ?? 0}</td>
        <td style="border:1px solid #ddd;"><b>Total events</b><br/>${h.totalEvents ?? 0}</td>
        <td style="border:1px solid #ddd;"><b>Qualified</b><br/>${h.qualifiedSessions ?? 0}</td>
        <td style="border:1px solid #ddd;"><b>Bounces</b><br/>${h.bounces ?? 0}</td>
      </tr>
    </table>

    <h3 style="margin: 16px 0 6px 0;">Top events</h3>
    ${li(report.topEvents, (e) => `
      <li>
        <b>${esc(e.event)}</b> — ${e.count} hits (${e.uniqueSessions} sessions)
        ${e.pages?.length ? `<br/><span style="color:#666">Pages:</span> ${e.pages.map(esc).join(", ")}` : ""}
      </li>
    `)}

    <h3 style="margin: 16px 0 6px 0;">Events by page</h3>
    ${li(report.eventsByPage, (p) => `
      <li><b>${esc(p.page)}</b> — ${p.count} events (${p.uniqueSessions} sessions)</li>
    `)}

    <h3 style="margin: 16px 0 6px 0;">Top referrers</h3>
    ${li(report.topReferrers, (r) => `
      <li><b>${esc(r.referrer)}</b> — ${r.count}</li>
    `)}

    <div style="margin-top:16px; color:#666; font-size:12px;">
      Tip: If "Top events" is empty, confirm the frontend is POSTing to <code>/api/visitors/log-event</code> and that sessions exist for that day.
    </div>
  </div>
  `;
}

function renderText(report) {
  const h = report.headline || {};
  const lines = [];

  lines.push(`CleanAR — Daily Events Report`);
  lines.push(`Date (Toronto): ${report.date} | Exclude bots: ${report.excludeBots ? "Yes" : "No"}`);
  lines.push(``);
  lines.push(`Totals: sessions=${h.totalSessions ?? 0}, uniqueVisitors=${h.uniqueVisitors ?? 0}, sessionsWithEvents=${h.sessionsWithEvents ?? 0}, totalEvents=${h.totalEvents ?? 0}, qualified=${h.qualifiedSessions ?? 0}, bounces=${h.bounces ?? 0}`);
  lines.push(``);

  lines.push(`Top events:`);
  if (!report.topEvents?.length) lines.push(`  - none`);
  else {
    report.topEvents.forEach((e) => {
      lines.push(`  - ${e.event}: ${e.count} hits (${e.uniqueSessions} sessions)`);
    });
  }

  lines.push(``);
  lines.push(`Events by page:`);
  if (!report.eventsByPage?.length) lines.push(`  - none`);
  else {
    report.eventsByPage.forEach((p) => {
      lines.push(`  - ${p.page}: ${p.count} events (${p.uniqueSessions} sessions)`);
    });
  }

  lines.push(``);
  lines.push(`Top referrers:`);
  if (!report.topReferrers?.length) lines.push(`  - none`);
  else {
    report.topReferrers.forEach((r) => {
      lines.push(`  - ${r.referrer}: ${r.count}`);
    });
  }

  return lines.join("\n");
}

// -------------------------
// Public functions
// -------------------------
async function sendDailyEventsReportEmail({ dateStr } = {}) {
  const ADMIN_EMAILS = (process.env.ADMIN_REPORT_EMAILS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!ADMIN_EMAILS.length) {
    console.warn("[DailyEventsReport] No ADMIN_REPORT_EMAILS configured");
    return { ok: false, reason: "missing_admin_emails" };
  }

  if (!process.env.SENDGRID_API_KEY) {
    console.warn("[DailyEventsReport] Missing SENDGRID_API_KEY");
    return { ok: false, reason: "missing_sendgrid_key" };
  }

  const report = await buildDailyEventsReport({ dateStr, excludeBots: true });

  const subject = `CleanAR — Daily Events Report (${report.date})`;
  const html = renderHtml(report);
  const text = renderText(report);

  await sgMail.send({
    to: ADMIN_EMAILS,
    from: process.env.SENDGRID_FROM || "info@cleanarsolutions.ca",
    subject,
    text,
    html,
  });

  return { ok: true, sentTo: ADMIN_EMAILS, date: report.date };
}

module.exports = {
  buildDailyEventsReport,
  sendDailyEventsReportEmail,
};
