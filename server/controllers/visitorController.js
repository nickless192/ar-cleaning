const { VisitorLog, VisitorCount, VisitorIdentity } = require("../models");
const crypto = require("crypto");
const fetch = require("node-fetch");
const UAParser = require("ua-parser-js");
const { DateTime } = require("luxon");

// -------------------------
// helpers
// -------------------------
function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (xff) return String(xff).split(",")[0].trim();
  return req.connection?.remoteAddress || req.socket?.remoteAddress || req.ip || null;
}

function hashIp(ip) {
  return crypto.createHash("sha256").update(ip || "").digest("hex");
}

function generateFallbackVisitorId(req) {
  const ip = getClientIp(req) || "";
  const ua = req.headers["user-agent"] || "";
  return crypto.createHash("sha256").update(ip + ua).digest("hex");
}

function isInternalRequest(req) {
  if (req.body?.disableVisitorTracking === true) return true;

  // Never block dev automatically
  if (process.env.NODE_ENV !== "production") return false;

  const ip = getClientIp(req);
  if (!ip) return false;

  const internalIps = (process.env.INTERNAL_IPS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!internalIps.length) return false;
  return internalIps.includes(ip);
}

function normalizePage(p) {
  if (!p) return p;
  const s = String(p).trim();
  if (!s) return s;
  // allow things like "index" but normalize to "/index"
  if (s.startsWith("/")) return s;
  return `/${s}`;
}

async function getGeoInfo(ip) {
  try {
    // use https
    const url = `https://api.ipapi.com/${ip}?access_key=${process.env.IPAPIKEY}`;
    const res = await fetch(url, { timeout: 3500 });
    if (!res.ok) throw new Error("GeoIP request failed");
    const data = await res.json();

    return {
      country: data.country_name,
      region: data.region,
      city: data.city,
      timezone: data.timezone,
      postal: data.postal,
      org: data.org,
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch (err) {
    console.error("GeoIP lookup error:", err.message);
    return null;
  }
}

// -------------------------
// scoring/qualification (events-first, interactions fallback)
// -------------------------
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function getActionCount(doc) {
  const ev = Array.isArray(doc.events) ? doc.events.length : 0;
  if (ev > 0) return ev;
  return Array.isArray(doc.interactions) ? doc.interactions.length : 0;
}

function hasConversionAction(doc) {
  const events = Array.isArray(doc.events) ? doc.events : [];
  const legacy = Array.isArray(doc.interactions) ? doc.interactions : [];

  const convNames = new Set([
    "quote_submit",
    "call_click",
    "email_click",
    "booking_submit",
    "quick_quote_submit",
  ]);

  const eventHit = events.some((e) => {
    const n = String(e?.name || "");
    return n.startsWith("cta_") || convNames.has(n);
  });

  const legacyHit = legacy.some((a) => {
    const s = String(a || "");
    return s.startsWith("cta_") || convNames.has(s);
  });

  return eventHit || legacyHit;
}

function computeEngagementScore(doc) {
  const duration = Number(doc.sessionDuration) || 0; // seconds
  const scroll = Number(doc.scrollDepth) || 0; // 0-100
  const pages = Array.isArray(doc.pathsVisited) && doc.pathsVisited.length ? doc.pathsVisited.length : 1;
  const actions = getActionCount(doc);

  const durationPts = clamp((duration / 120) * 35, 0, 35);
  const scrollPts = clamp((scroll / 100) * 25, 0, 25);
  const pagesPts = clamp(((pages - 1) / 3) * 20, 0, 20);
  const actionPts = clamp(actions * 5, 0, 20);

  return Math.round(durationPts + scrollPts + pagesPts + actionPts);
}

function computeQualified(doc) {
  const duration = Number(doc.sessionDuration) || 0;
  const scroll = Number(doc.scrollDepth) || 0;
  const pages = Array.isArray(doc.pathsVisited) && doc.pathsVisited.length ? doc.pathsVisited.length : 1;

  const conv = hasConversionAction(doc);

  const reasons = [];
  if (duration >= 60) reasons.push("duration>=60s");
  if (scroll >= 50) reasons.push("scroll>=50%");
  if (pages >= 2) reasons.push("pages>=2");
  if (conv) reasons.push("conversion_action");

  const behaviorPasses = [duration >= 60, scroll >= 50, pages >= 2].filter(Boolean).length;
  const qualified = conv || behaviorPasses >= 2;

  return { qualified, reasons };
}

// -------------------------
// Toronto date helpers (correct day boundaries)
// -------------------------
function torontoTodayISO() {
  return DateTime.now().setZone("America/Toronto").toISODate();
}

function torontoRangeForDay(dateStr /* YYYY-MM-DD */) {
  const start = DateTime.fromISO(dateStr, { zone: "America/Toronto" }).startOf("day");
  const end = start.endOf("day");
  return { start: start.toUTC().toJSDate(), end: end.toUTC().toJSDate() };
}

function torontoRangeForWindow(endStr, days) {
  const endLocal = DateTime.fromISO(endStr, { zone: "America/Toronto" }).endOf("day");
  const startLocal = endLocal.minus({ days: days - 1 }).startOf("day");
  return { start: startLocal.toUTC().toJSDate(), end: endLocal.toUTC().toJSDate() };
}

// -------------------------
// report helpers
// -------------------------
function safeBool(v, defaultVal = false) {
  if (v === undefined) return defaultVal;
  if (typeof v === "boolean") return v;
  return String(v).toLowerCase() === "true";
}

function buildBaseMatch({
  start,
  end,
  page,
  country,
  deviceType,
  browser,
  os,
  segment,
  trafficSource,
  utmSource,
  utmMedium,
  utmCampaign,
  qualifiedOnly,
}) {
  const match = { visitDate: { $gte: start, $lte: end } };

  if (page) match.page = normalizePage(page);
  if (country) match["geo.country"] = country;
  if (deviceType) match.deviceType = deviceType;
  if (browser) match.browser = browser;
  if (os) match.os = os;
  if (segment) match.segment = segment;
  if (trafficSource) match.trafficSource = trafficSource;
  if (utmSource) match["utm.source"] = utmSource;
  if (utmMedium) match["utm.medium"] = utmMedium;
  if (utmCampaign) match["utm.campaign"] = utmCampaign;
  if (qualifiedOnly) match.qualified = true;

  return match;
}

function topNStage(fieldExpr, n = 10, extraMatch = null) {
  const pipeline = [];
  if (extraMatch) pipeline.push({ $match: extraMatch });
  pipeline.push({ $group: { _id: fieldExpr, count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: n });
  return pipeline;
}

function computeRatesDoc() {
  return {
    $project: {
      totalSessions: 1,
      humanSessions: 1,
      botSessions: 1,
      uniqueVisitors: 1,
      newVisitors: 1,
      returningVisitors: 1,
      qualifiedSessions: 1,
      bounces: 1,
      totalActions: 1,

      qualifiedRate: {
        $cond: [{ $gt: ["$humanSessions", 0] }, { $multiply: [{ $divide: ["$qualifiedSessions", "$humanSessions"] }, 100] }, 0],
      },
      bounceRate: {
        $cond: [{ $gt: ["$humanSessions", 0] }, { $multiply: [{ $divide: ["$bounces", "$humanSessions"] }, 100] }, 0],
      },

      avgEngagementScore: {
        $cond: [{ $gt: ["$humanSessions", 0] }, { $divide: ["$sumEngagementScore", "$humanSessions"] }, 0],
      },
      avgScrollDepth: {
        $cond: [{ $gt: ["$humanSessions", 0] }, { $divide: ["$sumScrollDepth", "$humanSessions"] }, 0],
      },
      avgSessionDuration: {
        $cond: [{ $gt: ["$humanSessions", 0] }, { $divide: ["$sumSessionDuration", "$humanSessions"] }, 0],
      },
      avgPagesPerSession: {
        $cond: [{ $gt: ["$humanSessions", 0] }, { $divide: ["$sumPagesPerSession", "$humanSessions"] }, 0],
      },
      avgActions: {
        $cond: [{ $gt: ["$humanSessions", 0] }, { $divide: ["$totalActions", "$humanSessions"] }, 0],
      },
    },
  };
}

function actionsExpr() {
  // prefer events count; fallback to interactions
  return {
    $cond: [
      { $gt: [{ $size: { $ifNull: ["$events", []] } }, 0] },
      { $size: { $ifNull: ["$events", []] } },
      { $size: { $ifNull: ["$interactions", []] } },
    ],
  };
}

// -------------------------
// controller
// -------------------------
const visitorController = {
  // -------------------------
  // logVisit (updated: returning visitor via VisitorIdentity + page normalization)
  // -------------------------
  logVisit: async (req, res) => {
    try {
      if (isInternalRequest(req)) {
        console.log("[VisitorLog] internal traffic ignored:", getClientIp(req));
        return res.status(204).send();
      }
      // console.log("[VisitorLog] logging visit from:", getClientIp(req));

      const {
        page,
        sessionId,
        visitorId: clientVisitorId,
        userAgent: uaString = req.body.userAgent || req.headers["user-agent"] || "",
        pathsVisited = [],
        screenResolution = "",
        language = "",
        timezone = "",
        utm = {},
        referrer = req.body.referrer || req.get("Referrer") || null,
        trafficSource = req.body.trafficSource || "unknown",
        pageTitle,
      } = req.body;

      if (!page) return res.status(400).json({ error: "Missing page" });

      const effectiveSessionId = sessionId || crypto.randomUUID();
      const visitorId = clientVisitorId || generateFallbackVisitorId(req);

      const ip = getClientIp(req);
      const hashedIp = hashIp(ip);

      const parser = new UAParser(uaString);
      const uaResult = parser.getResult();

      const isBot = /bot|crawl|slurp|spider|mediapartners/i.test(uaString);
      const deviceType = uaResult.device?.type || "desktop";
      const browser = uaResult.browser?.name || "unknown";
      const os = uaResult.os?.name || "unknown";

      const now = new Date();

      // Geo
      let geoInfo = null;
      if (process.env.NODE_ENV === "production" && ip) {
        geoInfo = await getGeoInfo(ip);
      } else {
        geoInfo = {
          country: "Unknown",
          region: "Unknown",
          city: "Unknown",
          timezone: timezone || "Unknown",
          postal: "Unknown",
          org: "Unknown",
          latitude: 0,
          longitude: 0,
        };
      }

      // Returning visitor (fast + correct): VisitorIdentity
      let isReturningVisitor = false;
      try {
        if (VisitorIdentity) {
          const prev = await VisitorIdentity.findOneAndUpdate(
            { visitorId },
            {
              $set: { lastSeenAt: now, lastSessionId: effectiveSessionId },
              $setOnInsert: { firstSeenAt: now, firstSessionId: effectiveSessionId },
            },
            { new: false, upsert: true }
          );
          isReturningVisitor = !!prev;
        } else {
          // fallback (less ideal): check visitorId exists with different sessionId
          const prev = await VisitorLog.exists({ visitorId, sessionId: { $ne: effectiveSessionId } });
          isReturningVisitor = !!prev;
        }
      } catch (e) {
        console.error("[VisitorIdentity] failed:", e.message);
        const prev = await VisitorLog.exists({ visitorId, sessionId: { $ne: effectiveSessionId } });
        isReturningVisitor = !!prev;
      }

      const pageNorm = normalizePage(page);
      const safePaths = Array.isArray(pathsVisited)
        ? pathsVisited.map(normalizePage).filter(Boolean).slice(0, 10)
        : [];

      const update = {
        $setOnInsert: {
          visitorId,
          sessionId: effectiveSessionId,
          visitDate: now,
          firstSeenAt: now,
          page: pageNorm, // landing page
        },
        $set: {
          lastSeenAt: now,
          isReturningVisitor,
          ip: hashedIp,
          geo: geoInfo,
          userAgent: uaString,
          deviceType,
          browser,
          os,
          screenResolution,
          language,
          timezone,
          utm,
          referrer,
          trafficSource,
          isBot,
        },
      };

      if (pageTitle) update.$set.pageTitle = pageTitle;

      // Keep pathsVisited bounded. NOTE: push allows ordering but can duplicate.
      if (safePaths.length) {
        update.$push = { pathsVisited: { $each: safePaths, $slice: -50 } };
      }

      await VisitorLog.findOneAndUpdate({ sessionId: effectiveSessionId }, update, {
        new: true,
        upsert: true,
      });

      res.status(200).json({ message: "Visit logged/updated", sessionId: effectiveSessionId, visitorId });
    } catch (err) {
      console.error("logVisit error:", err);
      res.status(500).send({ error: "Failed to log visit" });
    }
  },

  // -------------------------
  // NEW: logEvent (events[])
  // POST /api/visitors/event
  // -------------------------
  logEvent: async (req, res) => {
    try {
      const { sessionId, name, label, page, meta } = req.body;
      if (!sessionId || !name) {
        return res.status(400).json({ error: "Missing sessionId or event name" });
      }

      const now = new Date();
      const event = {
        name: String(name).slice(0, 64),
        label: label ? String(label).slice(0, 64) : undefined,
        page: page ? normalizePage(page).slice(0, 128) : undefined,
        ts: now,
        meta: meta && typeof meta === "object" ? meta : {},
      };

      const result = await VisitorLog.findOneAndUpdate(
        { sessionId },
        {
          $push: { events: { $each: [event], $slice: -300 } },
          $set: { lastSeenAt: now },
        },
        { new: true }
      );

      if (!result) return res.status(404).json({ error: "Session not found" });

      res.status(200).json({ message: "Event logged" });
    } catch (error) {
      console.error("logEvent error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // -------------------------
  // EXISTING: small stats endpoints (kept, but page normalization)
  // -------------------------
  getDailyVisitors: async (req, res) => {
    try {
      const todayISO = torontoTodayISO();
      const { start: today, end: endToday } = torontoRangeForDay(todayISO);
      const tomorrow = new Date(endToday.getTime() + 1); // unused but keeps pattern

      const pages = ["/index", "/request-quote", "/career"];
      const dailyVisits = {};
      for (const p of pages) {
        dailyVisits[p] = await VisitorLog.countDocuments({
          page: p,
          visitDate: { $gte: today, $lte: endToday },
        });
      }

      res.json(dailyVisits);
    } catch (err) {
      res.status(500).send({ error: "Failed to retrieve daily visitor stats" });
    }
  },

  getVisitorPerDay: async (req, res) => {
    try {
      const page = normalizePage(req.params.page);
      const dateStr = req.params.date; // YYYY-MM-DD
      const { start, end } = torontoRangeForDay(dateStr);

      const visits = await VisitorLog.countDocuments({
        page,
        visitDate: { $gte: start, $lte: end },
      });

      res.json({ count: visits });
    } catch (err) {
      res.status(500).send({ error: "Failed to retrieve daily visitor stats" });
    }
  },

  // getVisits: async (req, res) => {
  //   try {
  //     // consider adding query params later for pagination
  //     const visits = await VisitorLog.find({}).select("-__v").sort({ visitDate: -1 }).limit(100);
  //     res.json(visits);
  //   } catch (err) {
  //     res.status(500).send({ error: "Failed to retrieve visits" });
  //   }
  // },
  // -------------------------
// getVisits (server-side filters + pagination, Toronto-safe)
// GET /api/visitors/logs?start=YYYY-MM-DD&end=YYYY-MM-DD&page=/index&excludeBots=true&limit=10&pageNum=1&sort=desc
// Also supports: country, deviceType, browser, os, segment, trafficSource, utmSource, utmMedium, utmCampaign, qualifiedOnly
// -------------------------
getVisits: async (req, res) => {
  try {
    const excludeBots = safeBool(req.query.excludeBots, true);
    const qualifiedOnly = safeBool(req.query.qualifiedOnly, false);

    const limit = Math.max(1, Math.min(200, Number(req.query.limit || 10)));
    const pageNum = Math.max(1, Number(req.query.pageNum || 1));
    const skip = (pageNum - 1) * limit;

    // Sorting: newest first by default
    const sortDir = String(req.query.sort || "desc").toLowerCase() === "asc" ? 1 : -1;
    const sort = { visitDate: sortDir };

    // Date window (Toronto)
    // Preferred: start + end (YYYY-MM-DD)
    // Fallback: date=YYYY-MM-DD (single day)
    // Fallback: end + days (window)
    const date = req.query.date;
    const startStr = req.query.start;
    const endStr = req.query.end;

    let start, end;

    if (startStr && endStr) {
      // inclusive window start->end in Toronto
      const { start: s } = torontoRangeForDay(startStr);
      const { end: e } = torontoRangeForDay(endStr);
      start = s;
      end = e;
    } else if (date) {
      const r = torontoRangeForDay(date);
      start = r.start;
      end = r.end;
    } else {
      // default: last 7 days ending today Toronto
      const days = Math.max(1, Math.min(31, Number(req.query.days || 7)));
      const endISO = req.query.end || torontoTodayISO();
      const r = torontoRangeForWindow(endISO, days);
      start = r.start;
      end = r.end;
    }

    const match = buildBaseMatch({
      start,
      end,
      page: req.query.page,
      country: req.query.country,
      deviceType: req.query.deviceType,
      browser: req.query.browser,
      os: req.query.os,
      segment: req.query.segment,
      trafficSource: req.query.trafficSource,
      utmSource: req.query.utmSource,
      utmMedium: req.query.utmMedium,
      utmCampaign: req.query.utmCampaign,
      qualifiedOnly,
    });

    if (excludeBots) match.isBot = { $ne: true };

    // You can optionally support visitorType server-side too:
    // visitorType=new|returning
    const visitorType = String(req.query.visitorType || "");
    if (visitorType === "new") match.isReturningVisitor = false;
    if (visitorType === "returning") match.isReturningVisitor = true;

    // IMPORTANT: Your schema uses visitDate; buildBaseMatch currently matches visitDate,
    // but your getDailyVisitors uses visitDate too. Keep consistent.
    // (If any docs still have legacy field names, fix in migration.)

    const [items, total] = await Promise.all([
      VisitorLog.find(match)
        .select("-__v")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      VisitorLog.countDocuments(match),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      range: { start, end },
      page: pageNum,
      limit,
      total,
      totalPages,
      items,
    });
  } catch (err) {
    console.error("getVisits (paginated) error:", err);
    res.status(500).json({ error: "Failed to retrieve visits" });
  }
},


  migrateData: async (req, res) => {
    try {
      const pages = ["/index", "/request-quote", "/career"];
      const todayISO = torontoTodayISO();
      const { start } = torontoRangeForDay(todayISO);

      for (const page of pages) {
        const visitorCount = await VisitorCount.findOne({ page });
        if (!visitorCount) continue;

        const totalCount = visitorCount.count;

        for (let i = 0; i < totalCount; i++) {
          const newLog = new VisitorLog({
            page,
            visitDate: start,
            visitorId: crypto.randomUUID(),
            sessionId: crypto.randomUUID(),
            userAgent: "migration",
          });
          await newLog.save();
        }
      }

      res.status(200).json({ message: "Migration successful" });
    } catch (err) {
      console.error("Migration failed:", err);
      res.status(500).json({ error: "Migration failed" });
    }
  },

  // -------------------------
  // DAILY REPORT (fixed TZ + fixed excludeBots + added events)
  // GET /api/visitors/daily-report?date=YYYY-MM-DD&excludeBots=true
  // -------------------------
  getDailyReport: async (req, res) => {
    try {
      const dateStr = req.query.date || torontoTodayISO();
      const excludeBots = safeBool(req.query.excludeBots, true);

      const { start, end } = torontoRangeForDay(dateStr);

      const match = buildBaseMatch({
        start,
        end,
        page: req.query.page,
        country: req.query.country,
        deviceType: req.query.deviceType,
        browser: req.query.browser,
        os: req.query.os,
        segment: req.query.segment,
        trafficSource: req.query.trafficSource,
        utmSource: req.query.utmSource,
        utmMedium: req.query.utmMedium,
        utmCampaign: req.query.utmCampaign,
        qualifiedOnly: safeBool(req.query.qualifiedOnly, false),
      });

      const humanMatch = excludeBots ? { isBot: { $ne: true } } : null;

      const pipeline = [
        { $match: match },
        {
          $facet: {
            headline: [
              {
                $group: {
                  _id: null,
                  totalSessions: { $sum: 1 },
                  humanSessions: { $sum: { $cond: [{ $ne: ["$isBot", true] }, 1, 0] } },
                  botSessions: { $sum: { $cond: [{ $eq: ["$isBot", true] }, 1, 0] } },
                  uniqueVisitorsSet: { $addToSet: "$visitorId" },
                  newVisitors: { $sum: { $cond: [{ $eq: ["$isReturningVisitor", false] }, 1, 0] } },
                  returningVisitors: { $sum: { $cond: [{ $eq: ["$isReturningVisitor", true] }, 1, 0] } },
                  qualifiedSessions: {
                    $sum: {
                      $cond: [{ $and: [{ $ne: ["$isBot", true] }, { $eq: ["$qualified", true] }] }, 1, 0],
                    },
                  },
                  bounces: {
                    $sum: {
                      $cond: [{ $and: [{ $ne: ["$isBot", true] }, { $eq: ["$isBounce", true] }] }, 1, 0],
                    },
                  },
                  sumEngagementScore: { $sum: { $cond: [{ $ne: ["$isBot", true] }, "$engagementScore", 0] } },
                  sumScrollDepth: { $sum: { $cond: [{ $ne: ["$isBot", true] }, "$scrollDepth", 0] } },
                  sumSessionDuration: { $sum: { $cond: [{ $ne: ["$isBot", true] }, "$sessionDuration", 0] } },
                  sumPagesPerSession: {
                    $sum: {
                      $cond: [
                        { $ne: ["$isBot", true] },
                        {
                          $cond: [
                            { $gt: [{ $size: { $ifNull: ["$pathsVisited", []] } }, 0] },
                            { $size: { $ifNull: ["$pathsVisited", []] } },
                            1,
                          ],
                        },
                        0,
                      ],
                    },
                  },
                  totalActions: { $sum: { $cond: [{ $ne: ["$isBot", true] }, actionsExpr(), 0] } },
                },
              },
              { $addFields: { uniqueVisitors: { $size: "$uniqueVisitorsSet" } } },
              { $project: { uniqueVisitorsSet: 0 } },
              computeRatesDoc(),
            ],

            hourly: [
              ...(excludeBots ? [{ $match: { isBot: { $ne: true } } }] : []),
              {
                $group: {
                  _id: { $hour: "$visitDate" },
                  visits: { $sum: 1 },
                  qualified: { $sum: { $cond: [{ $eq: ["$qualified", true] }, 1, 0] } },
                },
              },
              { $sort: { _id: 1 } },
            ],

            topPages: topNStage("$page", 10, humanMatch),
            topExitPages: topNStage("$exitPage", 10, humanMatch),
            topCountries: topNStage("$geo.country", 8, excludeBots ? { isBot: { $ne: true } } : null),
            topTrafficSources: topNStage({ $ifNull: ["$trafficSource", "unknown"] }, 10, humanMatch),
            topSegments: topNStage("$segment", 10, humanMatch),

            topUtmCampaigns: topNStage("$utm.campaign", 10, humanMatch),
            topUtmSources: topNStage("$utm.source", 10, humanMatch),
            topUtmMediums: topNStage("$utm.medium", 10, humanMatch),

            topEvents: [
              ...(excludeBots ? [{ $match: { isBot: { $ne: true } } }] : []),
              { $match: { events: { $exists: true, $ne: [] } } },
              { $unwind: "$events" },
              { $group: { _id: "$events.name", count: { $sum: 1 }, sessions: { $addToSet: "$sessionId" } } },
              { $project: { _id: 0, event: "$_id", count: 1, sessions: { $size: "$sessions" } } },
              { $sort: { count: -1 } },
              { $limit: 20 },
            ],

            topIndexEvents: [
              ...(excludeBots ? [{ $match: { isBot: { $ne: true } } }] : []),
              { $match: { page: "/index", events: { $exists: true, $ne: [] } } },
              { $unwind: "$events" },
              { $group: { _id: "$events.name", count: { $sum: 1 } } },
              { $project: { _id: 0, event: "$_id", count: 1 } },
              { $sort: { count: -1 } },
              { $limit: 15 },
            ],

            qualifiedReasons: [
              ...(excludeBots ? [{ $match: { isBot: { $ne: true } } }] : []),
              { $match: { qualified: true } },
              { $unwind: { path: "$qualifiedReason", preserveNullAndEmptyArrays: false } },
              { $group: { _id: "$qualifiedReason", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 10 },
            ],

            topReferrers: [
              ...(excludeBots ? [{ $match: { isBot: { $ne: true } } }] : []),
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
            ],
          },
        },
      ];

      const [result] = await VisitorLog.aggregate(pipeline).allowDiskUse(true);

      res.json({
        date: dateStr,
        range: { start, end },
        excludeBots,
        headline: result.headline?.[0] || null,
        hourly: result.hourly || [],
        topPages: result.topPages || [],
        topExitPages: result.topExitPages || [],
        topCountries: result.topCountries || [],
        topTrafficSources: result.topTrafficSources || [],
        topSegments: result.topSegments || [],
        topUtmCampaigns: result.topUtmCampaigns || [],
        topUtmSources: result.topUtmSources || [],
        topUtmMediums: result.topUtmMediums || [],
        topEvents: result.topEvents || [],
        topIndexEvents: result.topIndexEvents || [],
        qualifiedReasons: result.qualifiedReasons || [],
        topReferrers: result.topReferrers || [],
      });
    } catch (err) {
      console.error("getDailyReport error:", err);
      res.status(500).json({ message: "Failed to generate daily report" });
    }
  },

  // -------------------------
  // WEEKLY REPORT (fixed TZ + fixed excludeBots + added events)
  // GET /api/visitors/weekly-report?end=YYYY-MM-DD&days=7&excludeBots=true
  // -------------------------
  getWeeklyReport: async (req, res) => {
    try {
      const excludeBots = safeBool(req.query.excludeBots, true);
      const days = Math.max(1, Math.min(31, Number(req.query.days || 7)));

      const endStr = req.query.end || torontoTodayISO();
      const { start, end } = torontoRangeForWindow(endStr, days);

      const match = buildBaseMatch({
        start,
        end,
        page: req.query.page,
        country: req.query.country,
        deviceType: req.query.deviceType,
        browser: req.query.browser,
        os: req.query.os,
        segment: req.query.segment,
        trafficSource: req.query.trafficSource,
        utmSource: req.query.utmSource,
        utmMedium: req.query.utmMedium,
        utmCampaign: req.query.utmCampaign,
        qualifiedOnly: safeBool(req.query.qualifiedOnly, false),
      });

      const humanMatch = excludeBots ? { isBot: { $ne: true } } : null;

      const pipeline = [
        { $match: match },
        {
          $facet: {
            headline: [
              {
                $group: {
                  _id: null,
                  totalSessions: { $sum: 1 },
                  humanSessions: { $sum: { $cond: [{ $ne: ["$isBot", true] }, 1, 0] } },
                  botSessions: { $sum: { $cond: [{ $eq: ["$isBot", true] }, 1, 0] } },
                  uniqueVisitorsSet: { $addToSet: "$visitorId" },
                  newVisitors: { $sum: { $cond: [{ $eq: ["$isReturningVisitor", false] }, 1, 0] } },
                  returningVisitors: { $sum: { $cond: [{ $eq: ["$isReturningVisitor", true] }, 1, 0] } },
                  qualifiedSessions: { $sum: { $cond: [{ $and: [{ $ne: ["$isBot", true] }, { $eq: ["$qualified", true] }] }, 1, 0] } },
                  bounces: { $sum: { $cond: [{ $and: [{ $ne: ["$isBot", true] }, { $eq: ["$isBounce", true] }] }, 1, 0] } },
                  sumEngagementScore: { $sum: { $cond: [{ $ne: ["$isBot", true] }, "$engagementScore", 0] } },
                  sumScrollDepth: { $sum: { $cond: [{ $ne: ["$isBot", true] }, "$scrollDepth", 0] } },
                  sumSessionDuration: { $sum: { $cond: [{ $ne: ["$isBot", true] }, "$sessionDuration", 0] } },
                  sumPagesPerSession: {
                    $sum: {
                      $cond: [
                        { $ne: ["$isBot", true] },
                        {
                          $cond: [
                            { $gt: [{ $size: { $ifNull: ["$pathsVisited", []] } }, 0] },
                            { $size: { $ifNull: ["$pathsVisited", []] } },
                            1,
                          ],
                        },
                        0,
                      ],
                    },
                  },
                  totalActions: { $sum: { $cond: [{ $ne: ["$isBot", true] }, actionsExpr(), 0] } },
                },
              },
              { $addFields: { uniqueVisitors: { $size: "$uniqueVisitorsSet" } } },
              { $project: { uniqueVisitorsSet: 0 } },
              computeRatesDoc(),
            ],

            dailyTrend: [
              ...(excludeBots ? [{ $match: { isBot: { $ne: true } } }] : []),
              {
                $group: {
                  _id: { $dateToString: { format: "%Y-%m-%d", date: "$visitDate" } },
                  visits: { $sum: 1 },
                  qualified: { $sum: { $cond: [{ $eq: ["$qualified", true] }, 1, 0] } },
                  bounces: { $sum: { $cond: [{ $eq: ["$isBounce", true] }, 1, 0] } },
                  sumEngagement: { $sum: "$engagementScore" },
                  sumScroll: { $sum: "$scrollDepth" },
                  sumDuration: { $sum: "$sessionDuration" },
                },
              },
              { $sort: { _id: 1 } },
              {
                $project: {
                  day: "$_id",
                  _id: 0,
                  visits: 1,
                  qualified: 1,
                  bounceRate: { $cond: [{ $gt: ["$visits", 0] }, { $multiply: [{ $divide: ["$bounces", "$visits"] }, 100] }, 0] },
                  avgEngagement: { $cond: [{ $gt: ["$visits", 0] }, { $divide: ["$sumEngagement", "$visits"] }, 0] },
                  avgScroll: { $cond: [{ $gt: ["$visits", 0] }, { $divide: ["$sumScroll", "$visits"] }, 0] },
                  avgDuration: { $cond: [{ $gt: ["$visits", 0] }, { $divide: ["$sumDuration", "$visits"] }, 0] },
                },
              },
            ],

            engagementBuckets: [
              ...(excludeBots ? [{ $match: { isBot: { $ne: true } } }] : []),
              {
                $bucket: {
                  groupBy: "$engagementScore",
                  boundaries: [0, 10, 25, 50, 75, 90, 101],
                  default: "unknown",
                  output: { count: { $sum: 1 } },
                },
              },
            ],

            topUtmCampaigns: topNStage("$utm.campaign", 10, humanMatch),
            topUtmSources: topNStage("$utm.source", 10, humanMatch),
            topUtmMediums: topNStage("$utm.medium", 10, humanMatch),

            topCampaignsByQualified: [
              ...(excludeBots ? [{ $match: { isBot: { $ne: true }, qualified: true } }] : [{ $match: { qualified: true } }]),
              { $group: { _id: "$utm.campaign", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 10 },
            ],

            qualifiedReasons: [
              ...(excludeBots ? [{ $match: { isBot: { $ne: true }, qualified: true } }] : [{ $match: { qualified: true } }]),
              { $unwind: { path: "$qualifiedReason", preserveNullAndEmptyArrays: false } },
              { $group: { _id: "$qualifiedReason", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 10 },
            ],

            topCountries: topNStage("$geo.country", 8, excludeBots ? { isBot: { $ne: true } } : null),
            topDevices: topNStage("$deviceType", 8, humanMatch),
            topBrowsers: topNStage("$browser", 8, humanMatch),
            topOS: topNStage("$os", 8, humanMatch),

            topTrafficSources: topNStage({ $ifNull: ["$trafficSource", "unknown"] }, 10, humanMatch),
            topSegments: topNStage("$segment", 10, humanMatch),

            topPages: topNStage("$page", 10, humanMatch),
            topExitPages: topNStage("$exitPage", 10, humanMatch),

            topEvents: [
              ...(excludeBots ? [{ $match: { isBot: { $ne: true } } }] : []),
              { $match: { events: { $exists: true, $ne: [] } } },
              { $unwind: "$events" },
              { $group: { _id: "$events.name", count: { $sum: 1 }, sessions: { $addToSet: "$sessionId" } } },
              { $project: { _id: 0, event: "$_id", count: 1, sessions: { $size: "$sessions" } } },
              { $sort: { count: -1 } },
              { $limit: 20 },
            ],

            topIndexEvents: [
              ...(excludeBots ? [{ $match: { isBot: { $ne: true } } }] : []),
              { $match: { page: "/index", events: { $exists: true, $ne: [] } } },
              { $unwind: "$events" },
              { $group: { _id: "$events.name", count: { $sum: 1 } } },
              { $project: { _id: 0, event: "$_id", count: 1 } },
              { $sort: { count: -1 } },
              { $limit: 15 },
            ],

            topReferrers: [
              ...(excludeBots ? [{ $match: { isBot: { $ne: true } } }] : []),
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
            ],
          },
        },
      ];

      const [result] = await VisitorLog.aggregate(pipeline).allowDiskUse(true);

      res.json({
        range: { start, end },
        days,
        excludeBots,
        headline: result.headline?.[0] || null,
        dailyTrend: result.dailyTrend || [],
        engagementBuckets: result.engagementBuckets || [],
        topUtmCampaigns: result.topUtmCampaigns || [],
        topUtmSources: result.topUtmSources || [],
        topUtmMediums: result.topUtmMediums || [],
        topCampaignsByQualified: result.topCampaignsByQualified || [],
        qualifiedReasons: result.qualifiedReasons || [],
        topCountries: result.topCountries || [],
        topDevices: result.topDevices || [],
        topBrowsers: result.topBrowsers || [],
        topOS: result.topOS || [],
        topTrafficSources: result.topTrafficSources || [],
        topSegments: result.topSegments || [],
        topPages: result.topPages || [],
        topExitPages: result.topExitPages || [],
        topEvents: result.topEvents || [],
        topIndexEvents: result.topIndexEvents || [],
        topReferrers: result.topReferrers || [],
      });
    } catch (err) {
      console.error("getWeeklyReport error:", err);
      res.status(500).json({ message: "Failed to generate weekly report" });
    }
  },

  // -------------------------
  // EXISTING: interaction endpoint (legacy kept)
  // -------------------------
  logInteraction: async (req, res) => {
    try {
      const { sessionId, action } = req.body;

      if (!sessionId || !action) {
        return res.status(400).json({ error: "Missing sessionId or action" });
      }

      const result = await VisitorLog.findOneAndUpdate(
        { sessionId },
        {
          $push: { interactions: { $each: [String(action).slice(0, 64)], $slice: -100 } },
          $set: { lastSeenAt: new Date() },
        },
        { new: true }
      );

      if (!result) return res.status(404).json({ error: "Session not found" });

      res.status(200).json({ message: "Interaction logged" });
    } catch (error) {
      console.error("Failed to log interaction:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // -------------------------
  // optional legacy endpoints (kept)
  // -------------------------
  updateSessionDuration: async (req, res) => {
    try {
      const { sessionId, duration } = req.body;
      if (!sessionId || typeof duration !== "number") {
        return res.status(400).json({ error: "Missing or invalid sessionId or duration" });
      }

      const result = await VisitorLog.findOneAndUpdate(
        { sessionId },
        { $set: { sessionDuration: duration, lastSeenAt: new Date() } },
        { new: true }
      );

      if (!result) return res.status(404).json({ error: "Session not found" });
      res.status(200).json({ message: "Session duration updated" });
    } catch (error) {
      console.error("Error updating session duration:", error);
      res.status(500).json({ error: "Failed to update session duration" });
    }
  },

  updateScrollDepth: async (req, res) => {
    try {
      const { sessionId, scrollDepth } = req.body;

      if (!sessionId || typeof scrollDepth !== "number") {
        return res.status(400).json({ error: "Missing or invalid sessionId or scrollDepth" });
      }

      const result = await VisitorLog.findOneAndUpdate(
        { sessionId },
        { $max: { scrollDepth }, $set: { lastSeenAt: new Date() } },
        { new: true }
      );

      if (!result) return res.status(404).json({ error: "Session not found" });

      res.status(200).json({ message: "Scroll depth updated" });
    } catch (error) {
      console.error("Error updating scroll depth:", error);
      res.status(500).json({ error: "Failed to update scroll depth" });
    }
  },

  // -------------------------
  // sessionHeartbeat (updated: server computes duration + bounded paths)
  // -------------------------
  sessionHeartbeat: async (req, res) => {
    try {
      const { sessionId, lastSeenAt, scrollDepth, pathsVisited } = req.body;

      if (!sessionId) return res.status(400).json({ error: "Missing sessionId" });

      const now = lastSeenAt ? new Date(lastSeenAt) : new Date();

      const doc = await VisitorLog.findOne({ sessionId }).select("firstSeenAt");
      if (!doc) return res.status(404).json({ error: "Session not found" });

      const durationSec = Math.max(0, Math.round((now - doc.firstSeenAt) / 1000));

      const update = { $set: { lastSeenAt: now, sessionDuration: durationSec } };

      if (typeof scrollDepth === "number") update.$max = { scrollDepth };

      if (Array.isArray(pathsVisited) && pathsVisited.length) {
        const safePaths = pathsVisited.map(normalizePage).filter(Boolean).slice(0, 10);
        update.$push = { pathsVisited: { $each: safePaths, $slice: -50 } };
      }

      await VisitorLog.updateOne({ sessionId }, update);

      return res.status(200).json({ message: "Heartbeat updated", sessionDuration: durationSec });
    } catch (error) {
      console.error("sessionHeartbeat error:", error);
      return res.status(500).json({ error: "Failed to update heartbeat" });
    }
  },

  // -------------------------
  // sessionExit (updated: compute duration server-side, score from events)
  // -------------------------
 sessionExit: async (req, res) => {
  try {
    const { sessionId, page, lastSeenAt } = req.body;
    if (!sessionId) return res.status(400).json({ error: "Missing sessionId" });

    // Read current doc (needed because you compute derived fields)
    const doc = await VisitorLog.findOne({ sessionId }).lean();
    if (!doc) return res.status(404).json({ error: "Session not found" });

    const computedLastSeenAt = lastSeenAt ? new Date(lastSeenAt) : new Date();

    // compute duration here even if heartbeat didn’t run
    const sessionDuration = Math.max(
      0,
      Math.round((computedLastSeenAt - new Date(doc.firstSeenAt)) / 1000)
    );

    const paths = Array.isArray(doc.pathsVisited) ? doc.pathsVisited : [];
    const exitPage =
      normalizePage(page) || paths[paths.length - 1] || doc.page;

    // bounce logic: if only one page and no meaningful actions
    const actions = getActionCount(doc);
    const isBounce = paths.length <= 1 && actions === 0;

    // Build a “doc-like” object for your scoring functions
    const scoredDoc = {
      ...doc,
      lastSeenAt: computedLastSeenAt,
      sessionDuration,
      exitPage,
      isBounce,
    };

    const engagementScore = computeEngagementScore(scoredDoc);
    const { qualified, reasons } = computeQualified(scoredDoc);

    // ✅ Atomic write (no doc.save → no VersionError)
    const updated = await VisitorLog.findOneAndUpdate(
      { sessionId },
      {
        $set: {
          lastSeenAt: computedLastSeenAt,
          sessionDuration,
          exitPage,
          isBounce,
          engagementScore,
          qualified,
          qualifiedReason: reasons,
          updatedAt: new Date(),
        },
        // optional — only if you want explicit version bumps
        // $inc: { __v: 1 },
      },
      { new: true } // return updated document
    );

    return res.status(200).json({
      message: "Session exit recorded",
      isBounce: updated?.isBounce ?? isBounce,
      engagementScore: updated?.engagementScore ?? engagementScore,
      qualified: updated?.qualified ?? qualified,
      sessionDuration: updated?.sessionDuration ?? sessionDuration,
    });
  } catch (error) {
    console.error("sessionExit error:", error);
    return res.status(500).json({ error: "Failed to record session exit" });
  }
},

};

module.exports = visitorController;
