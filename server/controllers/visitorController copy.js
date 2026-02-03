const { VisitorLog, VisitorCount } = require('../models');
const crypto = require('crypto');
const fetch = require('node-fetch');
const UAParser = require('ua-parser-js');

// -------------------------
// existing helpers (kept)
// -------------------------
function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (xff) return String(xff).split(',')[0].trim();
  return (
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    null
  );
}

function hashIp(ip) {
  return crypto.createHash('sha256').update(ip || '').digest('hex');
}

function generateFallbackVisitorId(req) {
  const ip = getClientIp(req) || '';
  const ua = req.headers['user-agent'] || '';
  return crypto.createHash('sha256').update(ip + ua).digest('hex');
}

function isInternalRequest(req) {
  if (req.body?.disableVisitorTracking === true) return true;

  // Never block dev automatically
  if (process.env.NODE_ENV !== 'production') return false;

  const ip = getClientIp(req);
  if (!ip) return false;

  const internalIps = (process.env.INTERNAL_IPS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  if (!internalIps.length) return false;
  return internalIps.includes(ip);
}

async function getGeoInfo(ip) {
  try {
    const res = await fetch(`http://api.ipapi.com/${ip}?access_key=${process.env.IPAPIKEY}`);
    if (!res.ok) throw new Error('GeoIP request failed');
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
    console.error('GeoIP lookup error:', err.message);
    return null;
  }
}

// -------------------------
// scoring/qualification (kept)
// -------------------------
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function computeEngagementScore(doc) {
  const duration = Number(doc.sessionDuration) || 0; // seconds
  const scroll = Number(doc.scrollDepth) || 0; // 0-100
  const pages = Array.isArray(doc.pathsVisited) ? doc.pathsVisited.length : 1;
  const interactions = Array.isArray(doc.interactions) ? doc.interactions.length : 0;

  const durationPts = clamp((duration / 120) * 35, 0, 35);
  const scrollPts = clamp((scroll / 100) * 25, 0, 25);
  const pagesPts = clamp(((pages - 1) / 3) * 20, 0, 20);
  const interactionPts = clamp(interactions * 5, 0, 20);

  return Math.round(durationPts + scrollPts + pagesPts + interactionPts);
}

function computeQualified(doc) {
  const duration = Number(doc.sessionDuration) || 0;
  const scroll = Number(doc.scrollDepth) || 0;
  const pages = Array.isArray(doc.pathsVisited) ? doc.pathsVisited.length : 1;
  const interactions = Array.isArray(doc.interactions) ? doc.interactions : [];

  const hasConversionAction = interactions.some(a =>
    String(a).startsWith('cta_') || ['quote_submit', 'call_click', 'email_click'].includes(String(a))
  );

  const reasons = [];
  if (duration >= 60) reasons.push('duration>=60s');
  if (scroll >= 50) reasons.push('scroll>=50%');
  if (pages >= 2) reasons.push('pages>=2');
  if (hasConversionAction) reasons.push('conversion_action');

  const behaviorPasses = [duration >= 60, scroll >= 50, pages >= 2].filter(Boolean).length;
  const qualified = hasConversionAction || behaviorPasses >= 2;

  return { qualified, reasons };
}

// -------------------------
// NEW report helpers
// -------------------------
function toStartOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
function toEndOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}
function safeBool(v, defaultVal = false) {
  if (v === undefined) return defaultVal;
  if (typeof v === "boolean") return v;
  return String(v).toLowerCase() === "true";
}

function buildBaseMatch({
  start,
  end,
  excludeBots,
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

  if (excludeBots) match.isBot = { $ne: true };
  if (page) match.page = page;
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
  pipeline.push(
    { $group: { _id: fieldExpr, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: n }
  );
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
      totalInteractions: 1,

      qualifiedRate: {
        $cond: [
          { $gt: ["$humanSessions", 0] },
          { $multiply: [{ $divide: ["$qualifiedSessions", "$humanSessions"] }, 100] },
          0,
        ],
      },
      bounceRate: {
        $cond: [
          { $gt: ["$humanSessions", 0] },
          { $multiply: [{ $divide: ["$bounces", "$humanSessions"] }, 100] },
          0,
        ],
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
      avgInteractions: {
        $cond: [{ $gt: ["$humanSessions", 0] }, { $divide: ["$totalInteractions", "$humanSessions"] }, 0],
      },
    },
  };
}

// -------------------------
// controller
// -------------------------
const visitorController = {

  // -------------------------
  // EXISTING: logVisit (kept)
  // -------------------------
  logVisit: async (req, res) => {
    try {
      if (isInternalRequest(req)) {
        console.log('[VisitorLog] internal traffic ignored:', getClientIp(req));
        return res.status(204).send();
      }

      const {
        page,
        sessionId,
        visitorId: clientVisitorId,
        userAgent: uaString = req.body.userAgent || req.headers['user-agent'] || '',
        pathsVisited = [],
        screenResolution = '',
        language = '',
        timezone = '',
        utm = {},
        referrer = req.body.referrer || req.get('Referrer') || null,
        trafficSource = req.body.trafficSource || 'unknown',
        pageTitle,
      } = req.body;

      if (!page) return res.status(400).json({ error: 'Missing page' });

      const effectiveSessionId = sessionId || crypto.randomUUID();
      const visitorId = clientVisitorId || generateFallbackVisitorId(req);

      const ip = getClientIp(req);
      const hashedIp = hashIp(ip);

      const parser = new UAParser(uaString);
      const uaResult = parser.getResult();

      const isBot = /bot|crawl|slurp|spider|mediapartners/i.test(uaString);
      const deviceType = uaResult.device?.type || 'desktop';
      const browser = uaResult.browser?.name || 'unknown';
      const os = uaResult.os?.name || 'unknown';

      let geoInfo = null;
      if (process.env.NODE_ENV === 'production' && ip) {
        geoInfo = await getGeoInfo(ip);
      } else {
        geoInfo = {
          country: 'Unknown',
          region: 'Unknown',
          city: 'Unknown',
          timezone: timezone || 'Unknown',
          postal: 'Unknown',
          org: 'Unknown',
          latitude: 0,
          longitude: 0,
        };
      }

      // more accurate: "ever seen visitorId before?"
      const seenBefore = await VisitorLog.exists({
        visitorId,
        firstSeenAt: { $exists: true },
      });

      const now = new Date();

      const update = {
        $setOnInsert: {
          visitorId,
          sessionId: effectiveSessionId,
          visitDate: now,
          firstSeenAt: now,
          page, // landing page
        },
        $set: {
          lastSeenAt: now,
          isReturningVisitor: Boolean(seenBefore),
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
        $addToSet: {
          pathsVisited: { $each: Array.isArray(pathsVisited) ? pathsVisited : [] },
        },
      };

      if (pageTitle) update.$set.pageTitle = pageTitle;

      await VisitorLog.findOneAndUpdate(
        { sessionId: effectiveSessionId },
        update,
        { new: true, upsert: true }
      );

      res.status(200).json({ message: 'Visit logged/updated' });
    } catch (err) {
      console.error('logVisit error:', err);
      res.status(500).send({ error: 'Failed to log visit' });
    }
  },

  // -------------------------
  // EXISTING: small stats endpoints (kept)
  // -------------------------
  getDailyVisitors: async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const pages = ['index', 'request-quote', 'career'];
      const dailyVisits = {};
      for (const page of pages) {
        dailyVisits[page] = await VisitorLog.countDocuments({
          page,
          visitDate: { $gte: today, $lt: tomorrow }
        });
      }

      res.json(dailyVisits);
    } catch (err) {
      res.status(500).send({ error: 'Failed to retrieve daily visitor stats' });
    }
  },

  getVisitorPerDay: async (req, res) => {
    try {
      const page = req.params.page;
      const date = new Date(req.params.date); // FIX: was treating string as Date
      date.setHours(0, 0, 0, 0);
      const tomorrow = new Date(date);
      tomorrow.setDate(date.getDate() + 1);

      const visits = await VisitorLog.countDocuments({
        page,
        visitDate: { $gte: date, $lt: tomorrow }
      });

      res.json({ count: visits });
    } catch (err) {
      res.status(500).send({ error: 'Failed to retrieve daily visitor stats' });
    }
  },

  getVisits: async (req, res) => {
    try {
      const visits = await VisitorLog.find({})
        .select('-__v')
        .sort({ visitDate: -1 })
        .limit(100);

      res.json(visits);
    } catch (err) {
      res.status(500).send({ error: 'Failed to retrieve visits' });
    }
  },

  migrateData: async (req, res) => {
    try {
      const pages = ['index', 'request-quote', 'career'];
      const chosenDate = new Date();
      chosenDate.setHours(0, 0, 0, 0);

      for (const page of pages) {
        const visitorCount = await VisitorCount.findOne({ page });
        if (!visitorCount) continue;

        const totalCount = visitorCount.count;

        for (let i = 0; i < totalCount; i++) {
          const newLog = new VisitorLog({ page, visitDate: chosenDate });
          await newLog.save();
        }
      }

      res.status(200).json({ message: 'Migration successful' });
    } catch (err) {
      console.error('Migration failed:', err);
      res.status(500).json({ error: 'Migration failed' });
    }
  },

  // -------------------------
  // NEW: DAILY REPORT
  // GET /api/visitors/daily-report?date=YYYY-MM-DD&excludeBots=true
  // -------------------------
  getDailyReport: async (req, res) => {
    try {
      // const dateStr = req.query.date || new Date().toISOString().slice(0, 10);
      const dateStr =
  req.query.date ||
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto" }).format(new Date());

      const excludeBots = safeBool(req.query.excludeBots, true);

      const start = toStartOfDay(dateStr);
      const end = toEndOfDay(dateStr);

      const match = buildBaseMatch({
        start,
        end,
        excludeBots,
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
                  totalInteractions: { $sum: { $cond: [{ $ne: ["$isBot", true] }, { $size: { $ifNull: ["$interactions", []] } }, 0] } },
                },
              },
              { $addFields: { uniqueVisitors: { $size: "$uniqueVisitorsSet" } } },
              { $project: { uniqueVisitorsSet: 0 } },
              computeRatesDoc(),
            ],

            hourly: [
              {
                $group: {
                  _id: { $hour: "$visitDate" },
                  visits: { $sum: 1 },
                  humans: { $sum: { $cond: [{ $ne: ["$isBot", true] }, 1, 0] } },
                  qualified: { $sum: { $cond: [{ $and: [{ $ne: ["$isBot", true] }, { $eq: ["$qualified", true] }] }, 1, 0] } },
                },
              },
              { $sort: { _id: 1 } },
            ],

            topPages: topNStage("$page", 10),
            topExitPages: topNStage("$exitPage", 10, { isBot: { $ne: true } }),
            topCountries: topNStage("$geo.country", 8),
            topTrafficSources: topNStage({ $ifNull: ["$trafficSource", "unknown"] }, 10, { isBot: { $ne: true } }),
            topSegments: topNStage("$segment", 10, { isBot: { $ne: true } }),

            topUtmCampaigns: topNStage("$utm.campaign", 10, { isBot: { $ne: true } }),
            topUtmSources: topNStage("$utm.source", 10, { isBot: { $ne: true } }),
            topUtmMediums: topNStage("$utm.medium", 10, { isBot: { $ne: true } }),

            qualifiedReasons: [
              { $match: { isBot: { $ne: true }, qualified: true } },
              { $unwind: { path: "$qualifiedReason", preserveNullAndEmptyArrays: false } },
              { $group: { _id: "$qualifiedReason", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 10 },
            ],

            topReferrers: [
              { $match: { isBot: { $ne: true }, referrer: { $ne: null } } },
              {
                $addFields: {
                  refHost: {
                    $replaceAll: {
                      input: {
                        $replaceAll: { input: "$referrer", find: "https://", replacement: "" },
                      },
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
        qualifiedReasons: result.qualifiedReasons || [],
        topReferrers: result.topReferrers || [],
      });
    } catch (err) {
      console.error("getDailyReport error:", err);
      res.status(500).json({ message: "Failed to generate daily report" });
    }
  },

  // -------------------------
  // NEW: WEEKLY REPORT
  // GET /api/visitors/weekly-report?end=YYYY-MM-DD&days=7&excludeBots=true
  // -------------------------
  getWeeklyReport: async (req, res) => {
    try {
      const excludeBots = safeBool(req.query.excludeBots, true);
      const days = Math.max(1, Math.min(31, Number(req.query.days || 7)));

      const endStr = req.query.end || new Date().toISOString().slice(0, 10);
      const end = toEndOfDay(endStr);

      const start = new Date(end);
      start.setDate(start.getDate() - (days - 1));
      start.setHours(0, 0, 0, 0);

      const match = buildBaseMatch({
        start,
        end,
        excludeBots,
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
                  totalInteractions: { $sum: { $cond: [{ $ne: ["$isBot", true] }, { $size: { $ifNull: ["$interactions", []] } }, 0] } },
                },
              },
              { $addFields: { uniqueVisitors: { $size: "$uniqueVisitorsSet" } } },
              { $project: { uniqueVisitorsSet: 0 } },
              computeRatesDoc(),
            ],

            dailyTrend: [
              {
                $group: {
                  _id: { $dateToString: { format: "%Y-%m-%d", date: "$visitDate" } },
                  visits: { $sum: 1 },
                  humans: { $sum: { $cond: [{ $ne: ["$isBot", true] }, 1, 0] } },
                  qualified: { $sum: { $cond: [{ $and: [{ $ne: ["$isBot", true] }, { $eq: ["$qualified", true] }] }, 1, 0] } },
                  bounces: { $sum: { $cond: [{ $and: [{ $ne: ["$isBot", true] }, { $eq: ["$isBounce", true] }] }, 1, 0] } },
                  sumEngagement: { $sum: { $cond: [{ $ne: ["$isBot", true] }, "$engagementScore", 0] } },
                  sumScroll: { $sum: { $cond: [{ $ne: ["$isBot", true] }, "$scrollDepth", 0] } },
                  sumDuration: { $sum: { $cond: [{ $ne: ["$isBot", true] }, "$sessionDuration", 0] } },
                },
              },
              { $sort: { _id: 1 } },
              {
                $project: {
                  day: "$_id",
                  _id: 0,
                  visits: 1,
                  humans: 1,
                  qualified: 1,
                  bounceRate: {
                    $cond: [{ $gt: ["$humans", 0] }, { $multiply: [{ $divide: ["$bounces", "$humans"] }, 100] }, 0],
                  },
                  avgEngagement: {
                    $cond: [{ $gt: ["$humans", 0] }, { $divide: ["$sumEngagement", "$humans"] }, 0],
                  },
                  avgScroll: {
                    $cond: [{ $gt: ["$humans", 0] }, { $divide: ["$sumScroll", "$humans"] }, 0],
                  },
                  avgDuration: {
                    $cond: [{ $gt: ["$humans", 0] }, { $divide: ["$sumDuration", "$humans"] }, 0],
                  },
                },
              },
            ],

            engagementBuckets: [
              { $match: { isBot: { $ne: true } } },
              {
                $bucket: {
                  groupBy: "$engagementScore",
                  boundaries: [0, 10, 25, 50, 75, 90, 101],
                  default: "unknown",
                  output: { count: { $sum: 1 } },
                },
              },
            ],

            topUtmCampaigns: topNStage("$utm.campaign", 10, { isBot: { $ne: true } }),
            topUtmSources: topNStage("$utm.source", 10, { isBot: { $ne: true } }),
            topUtmMediums: topNStage("$utm.medium", 10, { isBot: { $ne: true } }),

            topCampaignsByQualified: [
              { $match: { isBot: { $ne: true }, qualified: true } },
              { $group: { _id: "$utm.campaign", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 10 },
            ],

            qualifiedReasons: [
              { $match: { isBot: { $ne: true }, qualified: true } },
              { $unwind: { path: "$qualifiedReason", preserveNullAndEmptyArrays: false } },
              { $group: { _id: "$qualifiedReason", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 10 },
            ],

            topCountries: topNStage("$geo.country", 8),
            topDevices: topNStage("$deviceType", 8),
            topBrowsers: topNStage("$browser", 8),
            topOS: topNStage("$os", 8),

            topTrafficSources: topNStage({ $ifNull: ["$trafficSource", "unknown"] }, 10, { isBot: { $ne: true } }),
            topSegments: topNStage("$segment", 10, { isBot: { $ne: true } }),

            topPages: topNStage("$page", 10),
            topExitPages: topNStage("$exitPage", 10, { isBot: { $ne: true } }),

            topReferrers: [
              { $match: { isBot: { $ne: true }, referrer: { $ne: null } } },
              {
                $addFields: {
                  refHost: {
                    $replaceAll: {
                      input: {
                        $replaceAll: { input: "$referrer", find: "https://", replacement: "" },
                      },
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
        topReferrers: result.topReferrers || [],
      });
    } catch (err) {
      console.error("getWeeklyReport error:", err);
      res.status(500).json({ message: "Failed to generate weekly report" });
    }
  },

  // -------------------------
  // KEEP: your older weekly report (deprecated)
  // -------------------------
  // NOTE: You can remove this after switching routes to getWeeklyReport
  // generateWeeklyReport: async (req, res) => {
  //   return res.status(410).json({
  //     message: "This endpoint is deprecated. Use GET /api/visitors/weekly-report instead."
  //   });
  // },

  // -------------------------
  // EXISTING: interaction/session endpoints (kept)
  // -------------------------
  logInteraction: async (req, res) => {
    try {
      const { sessionId, action } = req.body;

      if (!sessionId || !action) {
        return res.status(400).json({ error: 'Missing sessionId or action' });
      }

      const result = await VisitorLog.findOneAndUpdate(
        { sessionId },
        {
          $push: {
            interactions: {
              $each: [action],
              $slice: -100,
            },
          },
          $set: { lastSeenAt: new Date() },
        },
        { new: true }
      );

      if (!result) return res.status(404).json({ error: 'Session not found' });

      await result.save();
      res.status(200).json({ message: 'Interaction logged' });
    } catch (error) {
      console.error('Failed to log interaction:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  updateSessionDuration: async (req, res) => {
    try {
      const { sessionId, duration } = req.body;

      if (!sessionId || typeof duration !== 'number') {
        return res.status(400).json({ error: 'Missing or invalid sessionId or duration' });
      }

      const result = await VisitorLog.findOneAndUpdate(
        { sessionId },
        { $set: { sessionDuration: duration, lastSeenAt: new Date() } },
        { new: true }
      );

      if (!result) return res.status(404).json({ error: 'Session not found' });

      await result.save();
      res.status(200).json({ message: 'Session duration updated' });
    } catch (error) {
      console.error('Error updating session duration:', error);
      res.status(500).json({ error: 'Failed to update session duration' });
    }
  },

  updateScrollDepth: async (req, res) => {
    try {
      const { sessionId, scrollDepth } = req.body;

      if (!sessionId || typeof scrollDepth !== 'number') {
        return res.status(400).json({ error: 'Missing or invalid sessionId or scrollDepth' });
      }

      const result = await VisitorLog.findOneAndUpdate(
        { sessionId },
        { $max: { scrollDepth }, $set: { lastSeenAt: new Date() } },
        { new: true }
      );

      if (!result) return res.status(404).json({ error: 'Session not found' });

      await result.save();
      res.status(200).json({ message: 'Scroll depth updated' });
    } catch (error) {
      console.error('Error updating scroll depth:', error);
      res.status(500).json({ error: 'Failed to update scroll depth' });
    }
  },

  sessionHeartbeat: async (req, res) => {
    try {
      const { sessionId, lastSeenAt, scrollDepth, pathsVisited } = req.body;

      if (!sessionId) {
        return res.status(400).json({ error: 'Missing sessionId' });
      }

      const update = {
        $set: {
          lastSeenAt: lastSeenAt ? new Date(lastSeenAt) : new Date(),
        },
      };

      if (typeof scrollDepth === 'number') {
        update.$max = { scrollDepth };
      }

      if (Array.isArray(pathsVisited) && pathsVisited.length) {
        update.$addToSet = { pathsVisited: { $each: pathsVisited } };
      }

      const result = await VisitorLog.findOneAndUpdate(
        { sessionId },
        update,
        { new: true }
      );

      if (!result) return res.status(404).json({ error: 'Session not found' });

      return res.status(200).json({ message: 'Heartbeat updated' });
    } catch (error) {
      console.error('sessionHeartbeat error:', error);
      return res.status(500).json({ error: 'Failed to update heartbeat' });
    }
  },

  sessionExit: async (req, res) => {
    try {
      const { sessionId, page, lastSeenAt } = req.body;

      if (!sessionId) {
        return res.status(400).json({ error: 'Missing sessionId' });
      }

      const doc = await VisitorLog.findOne({ sessionId });
      if (!doc) return res.status(404).json({ error: 'Session not found' });

      const paths = Array.isArray(doc.pathsVisited) ? doc.pathsVisited : [];
      const exitPage = page || paths[paths.length - 1] || doc.page;

      doc.exitPage = exitPage;
      doc.lastSeenAt = lastSeenAt ? new Date(lastSeenAt) : new Date();

      doc.isBounce = paths.length <= 1;

      doc.engagementScore = computeEngagementScore(doc);
      const { qualified, reasons } = computeQualified(doc);
      doc.qualified = qualified;
      doc.qualifiedReason = reasons;

      await doc.save();

      return res.status(200).json({
        message: 'Session exit recorded',
        isBounce: doc.isBounce,
        engagementScore: doc.engagementScore,
        qualified: doc.qualified,
      });
    } catch (error) {
      console.error('sessionExit error:', error);
      return res.status(500).json({ error: 'Failed to record session exit' });
    }
  },
};

module.exports = visitorController;
