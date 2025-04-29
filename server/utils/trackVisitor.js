const VisitorLog = require('../models/VisitorLog');
const fetch = require('node-fetch');
const UAParser = require('ua-parser-js');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid'); // For session IDs

const hashIp = (ip) => crypto.createHash('sha256').update(ip).digest('hex');

const trackVisitor = async (req, res, next) => {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    const userAgentString = req.get('User-Agent') || '';
    const referrer = req.get('Referrer') || null;
    const page = req.originalUrl;
    const sessionId = req.cookies.sessionId || uuidv4(); // Generate session if none exists

    // Hash the IP for privacy
    const visitorId = hashIp(ip + userAgentString);

    // Parse user-agent data
    const ua = new UAParser(userAgentString);
    const deviceType = ua.getDevice().type || 'desktop';
    const browser = ua.getBrowser().name || 'unknown';
    const os = ua.getOS().name || 'unknown';

    // Check if session already exists
    let visitorLog = await VisitorLog.findOne({ sessionId });

    if (!visitorLog) {
      // Fetch geo-location info (only once per session)
      let geoData = {};
      try {
        const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`);
        geoData = await geoResponse.json();
      } catch (error) {
        console.error('GeoIP lookup failed:', error);
      }

      // New visitor log entry
      visitorLog = new VisitorLog({
        visitorId,
        sessionId,
        visitDate: new Date(),
        page, // First page visited
        pathsVisited: [page], // Start tracking paths
        referrer,
        userAgent: userAgentString,
        deviceType,
        browser,
        os,
        geo: {
          ip: hashIp(ip), // Store hashed IP
          country: geoData.country_name,
          region: geoData.region,
          city: geoData.city,
          timezone: geoData.timezone
        },
        isReturningVisitor: false, // We will update this later if needed
        landingPage: page
      });

    } else {
      // Update paths visited in the session
      if (!visitorLog.pathsVisited.includes(page)) {
        visitorLog.pathsVisited.push(page);
      }

      // Check if they have visited before
      visitorLog.isReturningVisitor = true;
    }

    // Save or update the log
    await visitorLog.save();

    // Set sessionId cookie if not already set
    if (!req.cookies.sessionId) {
      res.cookie('sessionId', sessionId, { maxAge: 30 * 60 * 1000, httpOnly: true }); // 30-minute session
    }

    next();
  } catch (error) {
    console.error('Error tracking visitor:', error);
    next();
  }
};

module.exports = trackVisitor;