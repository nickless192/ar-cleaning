const { VisitorLog, VisitorCount } = require('../models');
const crypto = require('crypto');
const fetch = require('node-fetch');
const UAParser = require('ua-parser-js');

async function getGeoInfo(ip) {
  try {
    const res = await fetch(`http://api.ipapi.com/${ip}?access_key=${process.env.IPAPIKEY}`);
    // const res = await fetch(`http://api.ipapi.com/8.8.8.8?access_key=${process.env.IPAPIKEY}`); // Google DNS

    if (!res.ok) throw new Error('GeoIP request failed');
    const data = await res.json();

    return {
      country: data.country_name,
      region: data.region,
      city: data.city,
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

function generateVisitorId(req) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const ua = req.headers['user-agent'] || '';
  console.log('IP:', ip);
  console.log('User-Agent:', ua);
  return crypto.createHash('sha256').update(ip + ua).digest('hex');
}
// const {VisitorCount} = require('../models');

// Fetch visitor count
const visitorController = {

  logVisit: async (req, res) => {
    try {

      const page = req.body.page;
      const sessionId = req.body.sessionId || crypto.randomUUID();
      let visitor = await VisitorLog.findOne({ sessionId });
      // console.log('Visitor:', visitor);
      if (!visitor) {
        console.log('No existing visitor found, creating a new one');
        const visitorId = generateVisitorId(req);
        // console.log('Generated Visitor ID:', visitorId);
        // const referrer = req.get('Referrer') || null;
        // console.log('Referrer:', referrer);
        const ip =
          req.headers['x-forwarded-for']?.split(',').shift() ||
          req.connection?.remoteAddress ||
          req.socket?.remoteAddress;
        // console.log('IP Address:', ip);
        const geoInfo = await getGeoInfo(ip);
        // console.log('Geo Info:', geoInfo);
        const hashedIp = crypto.createHash('sha256').update(ip || '').digest('hex');
        // console.log('Hashed IP:', hashedIp);
        const uaString = req.body.userAgent || '';
        const parser = new UAParser(uaString);
        const uaResult = parser.getResult();  // this is now an object with device, os, browser, etc.
        const isBot = /bot|crawl|slurp|spider|mediapartners/i.test(uaResult);
        const deviceType = uaResult.device.type || 'desktop'; // fallback if undefined
        const browser = uaResult.browser.name || 'unknown';
        const os = uaResult.os.name || 'unknown';
        const screenResolution = req.body.screenResolution || '';
        const language = req.body.language || '';
        const timezone = req.body.timezone || '';
        const referrer = req.body.referrer || req.get('Referrer') || null;
        const utm = req.body.utm || {};
        const trafficSource = req.body.trafficSource || 'unknown';
        // console.log('Device Type:', deviceType);
        // console.log('Browser:', browser);
        // console.log('OS:', os);
        const newVisit = new VisitorLog({
          page, userAgent: req.body.userAgent,
          ip: hashedIp,
          referrer,
          geo: geoInfo,
          deviceType, browser, os,
          visitorId, sessionId,
          firstSeenAt: new Date(),
          lastSeenAt: new Date(),
          screenResolution,
          language,
          timezone,
          utm,
          trafficSource,
          isBot
        });
        await newVisit.save();
        res.json({ message: 'Visit logged successfully' });
      } else {
        // Update the existing visitor's page and pathsVisited
        console.log('Existing visitor found, updating visit');
        if (!visitor.pathsVisited.includes(page)) {
          visitor.pathsVisited.push(page);
        }
        visitor.lastSeenAt = new Date();
        visitor.isReturningVisitor = true;
        await visitor.save();
        res.json({ message: 'Visit updated successfully' });
      }
    } catch (err) {
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
      { $push: { interactions: action }, $set: { lastSeenAt: new Date() } },
      { new: true }
    );

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
    }2
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



};

module.exports = visitorController;
