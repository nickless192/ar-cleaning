const { VisitorLog, VisitorCount } = require('../models');
const crypto = require('crypto');
const fetch = require('node-fetch');
const UAParser = require('ua-parser-js');

// async function getGeoInfo(ip) {
//   try {
//     const res = await fetch(`http://api.ipapi.com/${ip}?access_key=${process.env.IPAPIKEY}`);
//     // const res = await fetch(`http://api.ipapi.com/8.8.8.8?access_key=${process.env.IPAPIKEY}`); // Google DNS

//     if (!res.ok) throw new Error('GeoIP request failed');
//     const data = await res.json();

//     return {
//       country: data.country_name,
//       region: data.region,
//       city: data.city,
//       postal: data.postal,
//       org: data.org,
//       latitude: data.latitude,
//       longitude: data.longitude,
//     };
//   } catch (err) {
//     console.error('GeoIP lookup error:', err.message);
//     return null;
//   }
// }

// function generateVisitorId(req) {
//   const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
//   const ua = req.headers['user-agent'] || '';
//   console.log('IP:', ip);
//   console.log('User-Agent:', ua);
//   return crypto.createHash('sha256').update(ip + ua).digest('hex');
// }
// // const {VisitorCount} = require('../models');
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
  // fallback only (less reliable): ip + ua
  const ip = getClientIp(req) || '';
  const ua = req.headers['user-agent'] || '';
  return crypto.createHash('sha256').update(ip + ua).digest('hex');
}

// function isInternalRequest(req) {
//   // 1) client can request to disable tracking (admin/dev toggle)
//   if (req.body?.disableVisitorTracking) return true;

//   // 2) ignore in dev / localhost
//   if (process.env.NODE_ENV !== 'production') return true;

//   // 3) IP allowlist (recommended)
//   // Example env: INTERNAL_IPS="1.2.3.4,5.6.7.8"
//   const ip = getClientIp(req);
//   const internalIps = (process.env.INTERNAL_IPS || '')
//     .split(',')
//     .map(s => s.trim())
//     .filter(Boolean);

//   if (ip && internalIps.includes(ip)) return true;

//   return false;
// }
function isInternalRequest(req) {
  // 1) Frontend/admin toggle
  if (req.body?.disableVisitorTracking === true) {
    return true;
  }

  // 2) Never block dev automatically
  if (process.env.NODE_ENV !== 'production') {
    return false;
  }

  // 3) Production IP allowlist
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

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function computeEngagementScore(doc) {
  const duration = Number(doc.sessionDuration) || 0; // seconds
  const scroll = Number(doc.scrollDepth) || 0; // 0-100
  const pages = Array.isArray(doc.pathsVisited) ? doc.pathsVisited.length : 1;
  const interactions = Array.isArray(doc.interactions) ? doc.interactions.length : 0;

  // Normalize components (tweak as you like)
  const durationPts = clamp((duration / 120) * 35, 0, 35); // 2 min = full points
  const scrollPts = clamp((scroll / 100) * 25, 0, 25);
  const pagesPts = clamp(((pages - 1) / 3) * 20, 0, 20); // 4 pages = full
  const interactionPts = clamp(interactions * 5, 0, 20); // up to 4 meaningful interactions

  return Math.round(durationPts + scrollPts + pagesPts + interactionPts);
}

function computeQualified(doc) {
  const duration = Number(doc.sessionDuration) || 0;
  const scroll = Number(doc.scrollDepth) || 0;
  const pages = Array.isArray(doc.pathsVisited) ? doc.pathsVisited.length : 1;
  const interactions = Array.isArray(doc.interactions) ? doc.interactions : [];

  // Example "high intent" actions (match your data-track values)
  const hasConversionAction = interactions.some(a =>
    String(a).startsWith('cta_') || ['quote_submit', 'call_click', 'email_click'].includes(String(a))
  );

  const reasons = [];
  if (duration >= 60) reasons.push('duration>=60s');
  if (scroll >= 50) reasons.push('scroll>=50%');
  if (pages >= 2) reasons.push('pages>=2');
  if (hasConversionAction) reasons.push('conversion_action');

  // Qualified rule:
  // - Either: conversion action OR score-ish behaviors (2 out of 3)
  const behaviorPasses = [
    duration >= 60,
    scroll >= 50,
    pages >= 2,
  ].filter(Boolean).length;

  const qualified = hasConversionAction || behaviorPasses >= 2;

  return { qualified, reasons };
}


// Fetch visitor count
const visitorController = {

  // logVisit: async (req, res) => {
  //   try {

  //     const page = req.body.page;
  //     let geoInfo;
  //     const sessionId = req.body.sessionId || crypto.randomUUID();
  //     let visitor = await VisitorLog.findOne({ sessionId });
  //     // console.log('Visitor:', visitor);
  //     if (!visitor) {
  //       console.log('No existing visitor found, creating a new one');
  //       const visitorId = generateVisitorId(req);
  //       // console.log('Generated Visitor ID:', visitorId);
  //       // const referrer = req.get('Referrer') || null;
  //       // console.log('Referrer:', referrer);
  //       const ip =
  //         req.headers['x-forwarded-for']?.split(',').shift() ||
  //         req.connection?.remoteAddress ||
  //         req.socket?.remoteAddress;
  //       // console.log('IP Address:', ip);
  //       if (process.env.NODE_ENV === 'production') {
  //         geoInfo = await getGeoInfo(ip);
  //       } else {
  //         geoInfo = {
  //           country: 'Unknown',
  //           region: 'Unknown',
  //           city: 'Unknown',
  //           postal: 'Unknown',
  //           org: 'Unknown',
  //           latitude: 0,
  //           longitude: 0,
  //         };
  //       }
  //       // console.log('Geo Info:', geoInfo);
  //       const hashedIp = crypto.createHash('sha256').update(ip || '').digest('hex');
  //       // console.log('Hashed IP:', hashedIp);
  //       const uaString = req.body.userAgent || '';
  //       const parser = new UAParser(uaString);
  //       const uaResult = parser.getResult();  // this is now an object with device, os, browser, etc.
  //       const isBot = /bot|crawl|slurp|spider|mediapartners/i.test(uaResult);
  //       const deviceType = uaResult.device.type || 'desktop'; // fallback if undefined
  //       const browser = uaResult.browser.name || 'unknown';
  //       const os = uaResult.os.name || 'unknown';
  //       const screenResolution = req.body.screenResolution || '';
  //       const language = req.body.language || '';
  //       const timezone = req.body.timezone || '';
  //       const referrer = req.body.referrer || req.get('Referrer') || null;
  //       const utm = req.body.utm || {};
  //       const trafficSource = req.body.trafficSource || 'unknown';
  //       // console.log('Device Type:', deviceType);
  //       // console.log('Browser:', browser);
  //       // console.log('OS:', os);
  //       const newVisit = new VisitorLog({
  //         page, userAgent: req.body.userAgent,
  //         ip: hashedIp,
  //         referrer,
  //         geo: geoInfo,
  //         deviceType, browser, os,
  //         visitorId, sessionId,
  //         firstSeenAt: new Date(),
  //         lastSeenAt: new Date(),
  //         screenResolution,
  //         language,
  //         timezone,
  //         utm,
  //         trafficSource,
  //         isBot
  //       });
  //       await newVisit.save();
  //       res.json({ message: 'Visit logged successfully' });
  //     } else {
  //       // Update the existing visitor's page and pathsVisited
  //       console.log('Existing visitor found, updating visit');
  //       if (!visitor.pathsVisited.includes(page)) {
  //         visitor.pathsVisited.push(page);
  //       }
  //       visitor.lastSeenAt = new Date();
  //       visitor.isReturningVisitor = true;
  //       await visitor.save();
  //       res.json({ message: 'Visit updated successfully' });
  //     }
  //   } catch (err) {
  //     res.status(500).send({ error: 'Failed to log visit' });
  //   }
  // },
  logVisit: async (req, res) => {
    try {
      if (isInternalRequest(req)) {
        console.log('[VisitorLog] internal traffic ignored:', getClientIp(req));
        return res.status(204).send(); // No Content
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

      if (!page) {
        return res.status(400).json({ error: 'Missing page' });
      }

      // sessionId should be required for correct dedupe
      const effectiveSessionId = sessionId || crypto.randomUUID();

      // visitorId: prefer client stable UUID
      const visitorId = clientVisitorId || generateFallbackVisitorId(req);

      const ip = getClientIp(req);
      const hashedIp = hashIp(ip);

      // Parse UA
      const parser = new UAParser(uaString);
      const uaResult = parser.getResult();

      // FIXED: detect bots using UA string (not uaResult object)
      const isBot = /bot|crawl|slurp|spider|mediapartners/i.test(uaString);

      const deviceType = uaResult.device?.type || 'desktop';
      const browser = uaResult.browser?.name || 'unknown';
      const os = uaResult.os?.name || 'unknown';

      // Geo: only in prod, and only if IP exists
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

      // Determine returning visitor (site-level): have we ever seen this visitorId before?
      // IMPORTANT: this is more accurate than "session exists"
      const seenBefore = await VisitorLog.exists({
        visitorId,
        firstSeenAt: { $exists: true },
      });

      const now = new Date();

      // Upsert a single doc per session
      // - set firstSeenAt only on insert
      // - always update lastSeenAt, page (landing page), etc.
      // - add visited pages without duplicates
      const update = {
        $setOnInsert: {
          visitorId,
          sessionId: effectiveSessionId,
          visitDate: now,
          firstSeenAt: now,
          // isBot,
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
          page, // treat as landing page for this session
        },
        $set: {
          lastSeenAt: now,
          isReturningVisitor: Boolean(seenBefore),
          // keep latest attribution fields in case they arrive later
          screenResolution,
          language,
          timezone,
          utm,
          referrer,
          trafficSource,
          isBot,
        },
        $addToSet: {
          // store unique pages visited in session
          pathsVisited: { $each: Array.isArray(pathsVisited) ? pathsVisited : [] },
        },
      };

      // optional: store pageTitle if you add it to schema
      if (pageTitle) {
        update.$set.pageTitle = pageTitle;
      }

      const doc = await VisitorLog.findOneAndUpdate(
        { sessionId: effectiveSessionId },
        update,
        { new: true, upsert: true }
      );

      // "bounce" can be derived: if only 1 path visited after session ends.
      // You can also set it later in session-exit endpoint.

      res.status(200).json({
        message: doc.createdAt ? 'Visit logged/updated' : 'Visit logged/updated',
      });
    } catch (err) {
      console.error('logVisit error:', err);
      res.status(500).send({ error: 'Failed to log visit' });
    }
  },
  getDailyVisitors: async (req, res) => {
    try {
      // const page = req.body.page;
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of the day
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1); // End of the day
      const pages = ['index', 'request-quote', 'career'];
      const dailyVisits = {};
      for (const page of pages) {
        dailyVisits[page] = await VisitorLog.countDocuments({
          page: page,
          visitDate: { $gte: today, $lt: tomorrow }
        });
      }

      // const dailyVisits = await VisitorLog.countDocuments({
      //     page: page,
      //     visitDate: { $gte: today, $lt: tomorrow }
      // });
      console.log(dailyVisits);
      res.json(dailyVisits);
    } catch (err) {
      res.status(500).send({ error: 'Failed to retrieve daily visitor stats' });
    }
  },
  getVisitorPerDay: async (req, res) => {
    try {
      const page = req.params.page;
      const date = req.params.date;
      date.setHours(0, 0, 0, 0); // Start of the day
      const tomorrow = new Date(date);
      tomorrow.setDate(date.getDate() + 1); // End of the day
      visits = await VisitorLog.countDocuments({
        page: page,
        visitDate: { $gte: date, $lt: tomorrow }
      });
      res.json({ count: visits });
    } catch (err) {
      res.status(500).send({ error: 'Failed to retrieve daily visitor stats' });
    }
  },
  getVisits: async (req, res) => {
    try {
      //find all visits
      const visits = await VisitorLog.find({})
        .select('-__v')
        .sort({ visitDate: -1 }) // Sort by visitDate in descending order
        .limit(100); // Limit to the last 100 visits
      // console.log(visits);
      // console.log(visits);
      res.json(visits);
    } catch (err) {
      res.status(500).send({ error: 'Failed to retrieve daily visitor stats' });
    }
  },
  migrateData: async (req, res) => {
    try {
      // Define the pages you want to migrate data for
      const pages = ['index', 'request-quote', 'career'];

      // Specify the date to assign the counts to (e.g., today)
      const chosenDate = new Date(); // Use current date, or modify if needed
      chosenDate.setHours(0, 0, 0, 0); // Reset the time to midnight for consistency

      // Loop through each page and migrate its visit count
      for (const page of pages) {
        // Fetch the existing count for each page
        const visitorCount = await VisitorCount.findOne({ page });

        if (!visitorCount) {
          console.log(`No data to migrate for page: ${page}`);
          continue;
        }
        // console.log(visitorCount);
        // console.log(visitorCount.count);
        const totalCount = visitorCount.count;
        console.log(`Migrating ${totalCount} visits for page: ${page}`);

        // Log each visit for the page with the chosen date
        for (let i = 0; i < totalCount; i++) {
          const newLog = new VisitorLog({
            page,
            visitDate: chosenDate
          });
          await newLog.save();
        }

        console.log(`Successfully migrated ${totalCount} visits to ${page} on ${chosenDate}.`);
      }
      console.log('Migration complete');
      res.status(200).json({ message: 'Migration successful' });
    } catch (err) {
      console.error('Migration failed:', err);
      res.status(500).json({ error: 'Migration failed' });
    }
    // finally {
    //     mongoose.connection.close();
    // }
  },
  // generateWeeklyReport: async (res, req) => {
  //   try {
  //     const oneWeekAgo = new Date();
  //     oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  //     // 1. Total Sessions and Unique Visitors
  //     const sessionsAndVisitors = await VisitorLog.aggregate([
  //       { $match: { visitDate: { $gte: oneWeekAgo } } },
  //       {
  //         $group: {
  //           _id: "$visitorId",
  //           sessions: { $addToSet: "$sessionId" },
  //         },
  //       },
  //       {
  //         $group: {
  //           _id: null,
  //           uniqueVisitors: { $sum: 1 },
  //           totalSessions: { $sum: { $size: "$sessions" } },
  //         },
  //       },
  //     ]);

  //     // 2. Top Countries
  //     const topCountries = await VisitorLog.aggregate([
  //       { $match: { visitDate: { $gte: oneWeekAgo } } },
  //       { $group: { _id: "$geo.country", visitors: { $sum: 1 } } },
  //       { $sort: { visitors: -1 } },
  //       { $limit: 5 },
  //     ]);

  //     // 3. Top Landing Pages
  //     const topLandingPages = await VisitorLog.aggregate([
  //       { $match: { visitDate: { $gte: oneWeekAgo } } },
  //       { $group: { _id: "$landingPage", visits: { $sum: 1 } } },
  //       { $sort: { visits: -1 } },
  //       { $limit: 5 },
  //     ]);

  //     // 4. Top Exit Pages
  //     const topExitPages = await VisitorLog.aggregate([
  //       { $match: { visitDate: { $gte: oneWeekAgo } } },
  //       { $project: { lastPage: { $arrayElemAt: ["$pathsVisited", -1] } } },
  //       { $group: { _id: "$lastPage", exits: { $sum: 1 } } },
  //       { $sort: { exits: -1 } },
  //       { $limit: 5 },
  //     ]);

  //     // 5. Device Breakdown
  //     const deviceBreakdown = await VisitorLog.aggregate([
  //       { $match: { visitDate: { $gte: oneWeekAgo } } },
  //       { $group: { _id: "$deviceType", count: { $sum: 1 } } },
  //     ]);

  //     // 6. New vs Returning Visitors
  //     const visitorTypes = await VisitorLog.aggregate([
  //       { $match: { visitDate: { $gte: oneWeekAgo } } },
  //       { $group: { _id: "$isReturningVisitor", count: { $sum: 1 } } },
  //     ]);

  //     res.status(200).json({
  //       totalSessions: sessionsAndVisitors[0]?.totalSessions || 0,
  //       uniqueVisitors: sessionsAndVisitors[0]?.uniqueVisitors || 0,
  //       topCountries,
  //       topLandingPages,
  //       topExitPages,
  //       deviceBreakdown,
  //       visitorTypes,
  //     });
  //     // return {
  //     //   totalSessions: sessionsAndVisitors[0]?.totalSessions || 0,
  //     //   uniqueVisitors: sessionsAndVisitors[0]?.uniqueVisitors || 0,
  //     //   topCountries,
  //     //   topLandingPages,
  //     //   topExitPages,
  //     //   deviceBreakdown,
  //     //   visitorTypes,
  //     // };
  //   } catch (error) {
  //     console.error("Error generating weekly report:", error);
  //     res.status(500).json({ error: "Failed to generate weekly report" });
  //     // throw error;
  //   }
  // }
  generateWeeklyReport: async (req, res) => {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      // Humans only (recommended for business KPIs)
      const baseMatch = { visitDate: { $gte: oneWeekAgo }, isBot: { $ne: true } };

      // Qualified sessions + rates
      const qualitySummary = await VisitorLog.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: null,
            sessions: { $sum: 1 },
            qualifiedSessions: { $sum: { $cond: ['$qualified', 1, 0] } },
            avgDuration: { $avg: '$sessionDuration' },
            avgScroll: { $avg: '$scrollDepth' },
            avgScore: { $avg: '$engagementScore' },
            bounceRate: { $avg: { $cond: ['$isBounce', 1, 0] } },
            avgPages: { $avg: { $size: { $ifNull: ['$pathsVisited', []] } } },
          }
        }
      ]);

      // Top pages by qualified sessions (landing page = doc.page)
      const topQualifiedPages = await VisitorLog.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: '$page',
            sessions: { $sum: 1 },
            qualifiedSessions: { $sum: { $cond: ['$qualified', 1, 0] } },
            avgScore: { $avg: '$engagementScore' }
          }
        },
        {
          $addFields: {
            qualifiedRate: {
              $cond: [{ $eq: ['$sessions', 0] }, 0, { $divide: ['$qualifiedSessions', '$sessions'] }]
            }
          }
        },
        { $sort: { qualifiedSessions: -1, qualifiedRate: -1 } },
        { $limit: 5 }
      ]);

      // Traffic sources by qualified rate
      const sourceQuality = await VisitorLog.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: '$trafficSource',
            sessions: { $sum: 1 },
            qualifiedSessions: { $sum: { $cond: ['$qualified', 1, 0] } }
          }
        },
        {
          $addFields: {
            qualifiedRate: {
              $cond: [{ $eq: ['$sessions', 0] }, 0, { $divide: ['$qualifiedSessions', '$sessions'] }]
            }
          }
        },
        { $sort: { qualifiedRate: -1, sessions: -1 } },
        { $limit: 10 }
      ]);
      // Total Sessions and Unique Visitors
      const sessionsAndVisitors = await VisitorLog.aggregate([
        { $match: { visitDate: { $gte: oneWeekAgo } } },
        {
          $group: {
            _id: "$visitorId",
            sessions: { $addToSet: "$sessionId" },
          },
        },
        {
          $group: {
            _id: null,
            uniqueVisitors: { $sum: 1 },
            totalSessions: { $sum: { $size: "$sessions" } },
          },
        },
      ]);

      // Top Countries
      const topCountries = await VisitorLog.aggregate([
        { $match: { visitDate: { $gte: oneWeekAgo }, "geo.country": { $ne: null } } },
        { $group: { _id: "$geo.country", visitors: { $sum: 1 } } },
        { $sort: { visitors: -1 } },
        { $limit: 5 },
      ]);

      // Daily Visit Trend
      const dailyTrend = await VisitorLog.aggregate([
        { $match: { visitDate: { $gte: oneWeekAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$visitDate" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Top Visited Pages
      const topPages = await VisitorLog.aggregate([
        { $match: { visitDate: { $gte: oneWeekAgo } } },
        { $group: { _id: "$page", visits: { $sum: 1 } } },
        { $sort: { visits: -1 } },
        { $limit: 5 }
      ]);

      // Device Type Breakdown
      const deviceBreakdownRaw = await VisitorLog.aggregate([
        { $match: { visitDate: { $gte: oneWeekAgo } } },
        { $group: { _id: "$deviceType", count: { $sum: 1 } } },
      ]);
      const totalDevices = deviceBreakdownRaw.reduce((sum, d) => sum + d.count, 0);
      const deviceBreakdown = deviceBreakdownRaw.map(d => ({
        type: d._id || 'unknown',
        count: d.count,
        percent: ((d.count / totalDevices) * 100).toFixed(1) + '%'
      }));

      // New vs Returning Visitors
      const visitorTypesRaw = await VisitorLog.aggregate([
        { $match: { visitDate: { $gte: oneWeekAgo } } },
        { $group: { _id: "$isReturningVisitor", count: { $sum: 1 } } }
      ]);
      const totalTypeCount = visitorTypesRaw.reduce((sum, v) => sum + v.count, 0);
      const visitorTypes = visitorTypesRaw.map(v => ({
        type: v._id ? 'returning' : 'new',
        count: v.count,
        percent: ((v.count / totalTypeCount) * 100).toFixed(1) + '%'
      }));

      const q = qualitySummary[0] || {};

      res.status(200).json({
        summaryRange: {
          from: oneWeekAgo.toISOString().split('T')[0],
          to: new Date().toISOString().split('T')[0]
        },
        totalSessions: sessionsAndVisitors[0]?.totalSessions || 0,
        uniqueVisitors: sessionsAndVisitors[0]?.uniqueVisitors || 0,
        topCountries,
        dailyTrend,
        topPages,
        deviceBreakdown,
        visitorTypes,
         quality: {
    sessions: q.sessions || 0,
    qualifiedSessions: q.qualifiedSessions || 0,
    qualifiedRate: q.sessions ? Number(((q.qualifiedSessions / q.sessions) * 100).toFixed(1)) : 0,
    avgDuration: q.avgDuration ? Math.round(q.avgDuration) : 0,
    avgScroll: q.avgScroll ? Math.round(q.avgScroll) : 0,
    avgPages: q.avgPages ? Number(q.avgPages.toFixed(1)) : 0,
    avgScore: q.avgScore ? Math.round(q.avgScore) : 0,
    bounceRate: q.bounceRate ? Number((q.bounceRate * 100).toFixed(1)) : 0,
  },
  topQualifiedPages,
  sourceQuality,
      });
    } catch (error) {
      console.error("Error generating weekly report:", error);
      res.status(500).json({ error: "Failed to generate weekly report" });
    }
  },
  logInteraction: async (req, res) => {
    try {
      const { sessionId, action } = req.body;

      if (!sessionId || !action) {
        return res.status(400).json({ error: 'Missing sessionId or action' });
      }

      console.log('Logging interaction for session:', sessionId, 'action:', action);

      const result = await VisitorLog.findOneAndUpdate(
        { sessionId },
        {
          $push: {
            interactions: {
              $each: [action],
              $slice: -100, // keep last 100 events only
            },
          },
          $set: { lastSeenAt: new Date() },
        },
        { new: true }
      );
      //   { sessionId },
      //   { $push: { interactions: action }, $set: { lastSeenAt: new Date() } },
      //   { new: true }
      // );

      if (!result) {
        return res.status(404).json({ error: 'Session not found' });
      }
      await result.save(); // Ensure the interaction is saved

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

      if (!result) {
        return res.status(404).json({ error: 'Session not found' });
      }
      // Ensure the session duration is updated
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
      console.log('Updating scroll depth for session:', sessionId, 'to', scrollDepth);

      const result = await VisitorLog.findOneAndUpdate(
        { sessionId },
        { $max: { scrollDepth }, $set: { lastSeenAt: new Date() } }, // $max only updates if greater
        { new: true }
      );

      if (!result) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Ensure the scroll depth is updated
      await result.save();
      res.status(200).json({ message: 'Scroll depth updated' });
    } catch (error) {
      console.error('Error updating scroll depth:', error);
      res.status(500).json({ error: 'Failed to update scroll depth' });
    }
  },
  sessionHeartbeat: async (req, res) => {
    try {
      // console.log('Received heartbeat:', req.body);
      const { sessionId, page, lastSeenAt, scrollDepth, pathsVisited, secondsSinceActive } = req.body;

      if (!sessionId) {
        return res.status(400).json({ error: 'Missing sessionId' });
      }

      const update = {
        $set: {
          lastSeenAt: lastSeenAt ? new Date(lastSeenAt) : new Date(),
        },
      };

      // Keep highest scroll depth
      if (typeof scrollDepth === 'number') {
        update.$max = { scrollDepth };
      }

      // Merge paths visited (dedupe)
      if (Array.isArray(pathsVisited) && pathsVisited.length) {
        update.$addToSet = { pathsVisited: { $each: pathsVisited } };
      }

      // Optional: store activity freshness (requires adding a field if you want)
      // update.$set.secondsSinceActive = secondsSinceActive;

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

  // sessionExit: async (req, res) => {
  //   try {
  //     // console.log('Received session exit:', req.body);
  //     const { sessionId, page, lastSeenAt } = req.body;

  //     if (!sessionId) {
  //       return res.status(400).json({ error: 'Missing sessionId' });
  //     }

  //     const doc = await VisitorLog.findOne({ sessionId });
  //     if (!doc) return res.status(404).json({ error: 'Session not found' });

  //     const paths = doc.pathsVisited || [];
  //     const isBounce = paths.length <= 1;

  //     doc.isBounce = isBounce;
  //     doc.lastSeenAt = lastSeenAt ? new Date(lastSeenAt) : new Date();

  //     // If you want: store exit page (you’d need to add exitPage in schema)
  //     // doc.exitPage = page || paths[paths.length - 1] || doc.page;

  //     await doc.save();

  //     return res.status(200).json({ message: 'Session exit recorded', isBounce });
  //   } catch (error) {
  //     console.error('sessionExit error:', error);
  //     return res.status(500).json({ error: 'Failed to record session exit' });
  //   }
  // },
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

      // Bounce = only one page viewed (you can refine later)
      doc.isBounce = paths.length <= 1;

      // Compute score + qualification
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
