const { VisitorLog, VisitorCount } = require('../models');
const crypto = require('crypto');
const fetch = require('node-fetch');

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
      if (!visitor) {
        const visitorId = generateVisitorId(req);
        const referrer = req.get('Referrer') || null;
        const ip =
        req.headers['x-forwarded-for']?.split(',').shift() ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress;
        // const geoInfo = await getGeoInfo(ip);
        const hashedIp = crypto.createHash('sha256').update(ip || '').digest('hex');
        const newVisit = new VisitorLog({
          page, userAgent: req.body.userAgent, ip: hashedIp, referrer,
          //  geo: geoInfo, 
           visitorId, sessionId,
          firstSeenAt: new Date(),
          lastSeenAt: new Date()
        });
        await newVisit.save();
        res.json({ message: 'Visit logged successfully' });
      } else {
        // Update the existing visitor's page and pathsVisited
        if (!visitor.pathsVisited.includes(page)) {
          visitor.pathsVisited.push(page);
          visitor.lastSeenAt = new Date();
          await visitor.save();
        }
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
  generateWeeklyReport: async (res, req) => {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // 1. Total Sessions and Unique Visitors
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

      // 2. Top Countries
      const topCountries = await VisitorLog.aggregate([
        { $match: { visitDate: { $gte: oneWeekAgo } } },
        { $group: { _id: "$geo.country", visitors: { $sum: 1 } } },
        { $sort: { visitors: -1 } },
        { $limit: 5 },
      ]);

      // 3. Top Landing Pages
      const topLandingPages = await VisitorLog.aggregate([
        { $match: { visitDate: { $gte: oneWeekAgo } } },
        { $group: { _id: "$landingPage", visits: { $sum: 1 } } },
        { $sort: { visits: -1 } },
        { $limit: 5 },
      ]);

      // 4. Top Exit Pages
      const topExitPages = await VisitorLog.aggregate([
        { $match: { visitDate: { $gte: oneWeekAgo } } },
        { $project: { lastPage: { $arrayElemAt: ["$pathsVisited", -1] } } },
        { $group: { _id: "$lastPage", exits: { $sum: 1 } } },
        { $sort: { exits: -1 } },
        { $limit: 5 },
      ]);

      // 5. Device Breakdown
      const deviceBreakdown = await VisitorLog.aggregate([
        { $match: { visitDate: { $gte: oneWeekAgo } } },
        { $group: { _id: "$deviceType", count: { $sum: 1 } } },
      ]);

      // 6. New vs Returning Visitors
      const visitorTypes = await VisitorLog.aggregate([
        { $match: { visitDate: { $gte: oneWeekAgo } } },
        { $group: { _id: "$isReturningVisitor", count: { $sum: 1 } } },
      ]);

      res.status(200).json({
        totalSessions: sessionsAndVisitors[0]?.totalSessions || 0,
        uniqueVisitors: sessionsAndVisitors[0]?.uniqueVisitors || 0,
        topCountries,
        topLandingPages,
        topExitPages,
        deviceBreakdown,
        visitorTypes,
      });
      // return {
      //   totalSessions: sessionsAndVisitors[0]?.totalSessions || 0,
      //   uniqueVisitors: sessionsAndVisitors[0]?.uniqueVisitors || 0,
      //   topCountries,
      //   topLandingPages,
      //   topExitPages,
      //   deviceBreakdown,
      //   visitorTypes,
      // };
    } catch (error) {
      console.error("Error generating weekly report:", error);
      res.status(500).json({ error: "Failed to generate weekly report" });
      // throw error;
    }
  }
};

module.exports = visitorController;
