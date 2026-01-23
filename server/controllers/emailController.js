const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// const jwt = require('jsonwebtoken');
const sharp = require('sharp');
const { Parser } = require('json2csv');
const { signTokenForPasswordReset } = require('../utils/auth');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Booking = require('../models/Booking');
const VisitorLog = require('../models/VisitorLog');


const generateWeeklyReport = async () => {
  const now = new Date();

  // ---- TIME WINDOWS ----
  const endOfThisWeek = now;
  const startOfThisWeek = new Date();
  startOfThisWeek.setDate(startOfThisWeek.getDate() - 7);

  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  // ---- HELPERS ----
  const formatDate = (date) =>
    date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const countBy = (items, getKey) =>
    items.reduce((acc, item) => {
      const key = getKey(item) || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

  const sortCounts = (obj, limit) => {
    const entries = Object.entries(obj).sort((a, b) => b[1] - a[1]);
    return typeof limit === 'number' ? entries.slice(0, limit) : entries;
  };

  const formatChange = (current, previous) => {
    if (!previous) {
      if (!current) return '0%';
      return 'n/a';
    }
    const diff = current - previous;
    const pct = (diff / previous) * 100;
    const arrow = diff > 0 ? '⬆️' : diff < 0 ? '⬇️' : '➡️';
    return `${arrow} ${pct.toFixed(1)}%`;
  };

  const bucketSessionDuration = (secondsRaw) => {
    // If you're storing ms, change to: const seconds = (Number(secondsRaw) || 0) / 1000;
    const seconds = Number(secondsRaw) || 0;
    if (seconds <= 10) return '0–10s';
    if (seconds <= 30) return '11–30s';
    if (seconds <= 60) return '31–60s';
    if (seconds <= 180) return '1–3 min';
    if (seconds <= 600) return '3–10 min';
    return '10+ min';
  };

  const bucketScrollDepth = (depth) => {
    let d = depth;
    if (typeof d === 'string') d = d.replace('%', '');
    d = Number(d) || 0;

    if (d < 25) return '0–24%';
    if (d < 50) return '25–49%';
    if (d < 75) return '50–74%';
    return '75–100%';
  };

  const bucketEngagementScore = (scoreRaw) => {
    const s = Number(scoreRaw) || 0;
    if (s <= 10) return '0–10 (Low)';
    if (s <= 30) return '11–30 (Medium)';
    if (s <= 60) return '31–60 (High)';
    return '60+ (Very High)';
  };

  const formatAvgDuration = (seconds) => {
    const s = Math.round(seconds);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${rem}s`;
  };

  const joinPath = (paths) => {
    if (!paths || !paths.length) return null;
    // limit length so sequences don't get insane
    const trimmed = paths.slice(0, 5);
    return trimmed.join(' → ');
  };

  const aggregatePeriod = (logs) => {
    const totalVisits = logs.length;
    const humans = logs.filter((l) => !l.isBot);
    const bots = logs.filter((l) => l.isBot);

    const uniqueIps = new Set(logs.map((l) => l.ip).filter(Boolean)).size;
    const uniqueVisitors = new Set(
      logs.map((l) => l.visitorId).filter(Boolean)
    ).size;

    const uniqueHumanIps = new Set(
      humans.map((l) => l.ip).filter(Boolean)
    ).size;
    const uniqueHumanVisitors = new Set(
      humans.map((l) => l.visitorId).filter(Boolean)
    ).size;

    const newVisitors = humans.filter((l) => !l.isReturningVisitor).length;
    const returningVisitors = humans.filter((l) => l.isReturningVisitor).length;

    const bounceVisits = humans.filter((l) => l.isBounce).length;
    const bounceRate = humans.length
      ? (bounceVisits / humans.length) * 100
      : 0;

    // Engagement metrics
    const totalDurationSeconds = humans.reduce(
      (sum, l) => sum + (Number(l.sessionDuration) || 0),
      0
    );
    const avgSessionDuration = humans.length
      ? totalDurationSeconds / humans.length
      : 0;

    const avgPagesPerSession = humans.length
      ? humans.reduce((sum, l) => {
          const pages = (l.pathsVisited && l.pathsVisited.length) || 1;
          return sum + pages;
        }, 0) / humans.length
      : 0;

    const multiPageSessions = humans.filter(
      (l) => l.pathsVisited && l.pathsVisited.length > 1
    ).length;

    const pageCounts = countBy(humans, (l) => l.page);
    const countryCounts = countBy(humans, (l) => l.geo && l.geo.country);
    const cityCounts = countBy(humans, (l) => l.geo && l.geo.city);
    const deviceCounts = countBy(humans, (l) => l.deviceType);
    const browserCounts = countBy(humans, (l) => l.browser);
    const osCounts = countBy(humans, (l) => l.os);
    const languageCounts = countBy(humans, (l) => l.language);
    const resolutionCounts = countBy(humans, (l) => l.screenResolution);

    const referrerCounts = countBy(humans, (l) => l.referrer || 'Direct');
    const trafficSourceCounts = countBy(humans, (l) => l.trafficSource);
    const utmSourceCounts = countBy(humans, (l) => l.utm && l.utm.source);
    const utmMediumCounts = countBy(humans, (l) => l.utm && l.utm.medium);
    const utmCampaignCounts = countBy(humans, (l) => l.utm && l.utm.campaign);

    const segmentCounts = countBy(humans, (l) => l.segment);

    const durationBuckets = countBy(humans, (l) =>
      bucketSessionDuration(l.sessionDuration)
    );
    const scrollDepthBuckets = countBy(humans, (l) =>
      bucketScrollDepth(l.scrollDepth)
    );
    const engagementBuckets = countBy(humans, (l) =>
      bucketEngagementScore(l.engagementScore)
    );

    const interactionCounts = humans.reduce((acc, l) => {
      (l.interactions || []).forEach((event) => {
        const key = event || 'Unknown';
        acc[key] = (acc[key] || 0) + 1;
      });
      return acc;
    }, {});

    // path funnels
    const pathSequenceCounts = humans.reduce((acc, l) => {
      const seq = joinPath(l.pathsVisited);
      if (!seq) return acc;
      acc[seq] = (acc[seq] || 0) + 1;
      return acc;
    }, {});

    const dailyCounts = countBy(humans, (l) =>
      new Date(l.visitDate).toLocaleDateString('en-CA', {
        month: 'short',
        day: 'numeric',
      })
    );

    // average engagement score
    const totalEngagementScore = humans.reduce(
      (sum, l) => sum + (Number(l.engagementScore) || 0),
      0
    );
    const avgEngagementScore = humans.length
      ? totalEngagementScore / humans.length
      : 0;

    return {
      totalVisits,
      humanVisits: humans.length,
      botVisits: bots.length,

      uniqueIps,
      uniqueVisitors,
      uniqueHumanIps,
      uniqueHumanVisitors,

      newVisitors,
      returningVisitors,
      bounceVisits,
      bounceRate,

      avgSessionDuration,
      avgPagesPerSession,
      multiPageSessions,
      avgEngagementScore,

      pageCounts,
      countryCounts,
      cityCounts,
      deviceCounts,
      browserCounts,
      osCounts,
      languageCounts,
      resolutionCounts,
      referrerCounts,
      trafficSourceCounts,
      utmSourceCounts,
      utmMediumCounts,
      utmCampaignCounts,
      segmentCounts,
      durationBuckets,
      scrollDepthBuckets,
      engagementBuckets,
      interactionCounts,
      pathSequenceCounts,
      dailyCounts,
    };
  };

  // ---- FETCH LOGS ----
  const [thisWeekLogs, lastWeekLogs] = await Promise.all([
    VisitorLog.find({
      visitDate: { $gte: startOfThisWeek, $lt: endOfThisWeek },
    }),
    VisitorLog.find({
      visitDate: { $gte: startOfLastWeek, $lt: startOfThisWeek },
    }),
  ]);

  const thisWeekStats = aggregatePeriod(thisWeekLogs);
  const lastWeekStats = aggregatePeriod(lastWeekLogs);

  const totalVisits = thisWeekStats.totalVisits;

  // ---- CSV (this week only) ----
  const parser = new Parser();
  const csv = parser.parse(
    thisWeekLogs.map((log) => ({
      date: log.visitDate,
      visitorId: log.visitorId,
      sessionId: log.sessionId,
      page: log.page,
      pathsVisited: (log.pathsVisited || []).join(' > '),
      isReturningVisitor: log.isReturningVisitor,
      isBounce: log.isBounce,
      ipAddress: log.ip,
      browser: log.browser,
      os: log.os,
      deviceType: log.deviceType,
      screenResolution: log.screenResolution,
      language: log.language,
      sessionDuration: log.sessionDuration,
      engagementScore: log.engagementScore,
      scrollDepth: log.scrollDepth,
      referrer: log.referrer,
      country: log.geo?.country,
      region: log.geo?.region,
      city: log.geo?.city,
      trafficSource: log.trafficSource,
      utmSource: log.utm?.source,
      utmMedium: log.utm?.medium,
      utmCampaign: log.utm?.campaign,
      segment: log.segment,
      interactions: (log.interactions || []).join(','),
      isBot: log.isBot,
    }))
  );

  // ---- TOP LISTS ----
  const topPages = sortCounts(thisWeekStats.pageCounts, 5);
  const topCountries = sortCounts(thisWeekStats.countryCounts, 5);
  const topTrafficSources = sortCounts(thisWeekStats.trafficSourceCounts, 5);
  const topReferrers = sortCounts(thisWeekStats.referrerCounts, 5);
  const deviceBreakdown = sortCounts(thisWeekStats.deviceCounts);
  const languageBreakdown = sortCounts(thisWeekStats.languageCounts, 5);
  const resolutionBreakdown = sortCounts(thisWeekStats.resolutionCounts, 5);
  const topSegments = sortCounts(thisWeekStats.segmentCounts, 5);
  const topInteractions = sortCounts(thisWeekStats.interactionCounts, 5);
  const topCampaigns = sortCounts(thisWeekStats.utmCampaignCounts, 5);
  const topPathSequences = sortCounts(thisWeekStats.pathSequenceCounts, 5);
  const dailyBreakdown = sortCounts(thisWeekStats.dailyCounts);

  // ---- INSIGHTS (very simple rules) ----
  const insights = [];

  if (thisWeekStats.humanVisits && lastWeekStats.humanVisits) {
    const diffHumanVisits =
      thisWeekStats.humanVisits - lastWeekStats.humanVisits;
    const pct =
      (diffHumanVisits / lastWeekStats.humanVisits) * 100;
    const trend =
      diffHumanVisits > 0 ? 'increased' : diffHumanVisits < 0 ? 'decreased' : 'stayed flat';
    insights.push(
      `Human visits ${trend} by ${Math.abs(pct).toFixed(
        1
      )}% vs last week.`
    );
  }

  if (thisWeekStats.bounceRate > 70) {
    insights.push(
      `Bounce rate is high at ${thisWeekStats.bounceRate.toFixed(
        1
      )}%. Consider reviewing top landing pages and load speed.`
    );
  } else if (thisWeekStats.bounceRate > 0) {
    insights.push(
      `Bounce rate is ${thisWeekStats.bounceRate.toFixed(
        1
      )}%, which is within a normal range but still worth monitoring.`
    );
  }

  if (topTrafficSources.length) {
    const [topSource, topSourceCount] = topTrafficSources[0];
    insights.push(
      `Top traffic source this week is <strong>${topSource}</strong> with ${topSourceCount} visits.`
    );
  }

  if (topSegments.length) {
    const [seg, count] = topSegments[0];
    insights.push(
      `Segment <strong>${seg}</strong> is the most active with ${count} sessions.`
    );
  }

  if (thisWeekStats.avgPagesPerSession > 2) {
    insights.push(
      `Average pages per session is ${thisWeekStats.avgPagesPerSession.toFixed(
        1
      )}, indicating good content exploration.`
    );
  }

  const htmlSummary = `
    <h2>Weekly Visitor Report</h2>
    <p><strong>Period:</strong> ${formatDate(startOfThisWeek)} – ${formatDate(
      endOfThisWeek
    )}</p>
    <p><strong>Compared to:</strong> ${formatDate(
      startOfLastWeek
    )} – ${formatDate(startOfThisWeek)}</p>

    ${
      insights.length
        ? `<h3>Automatic Insights</h3><ul>${insights
            .map((i) => `<li>${i}</li>`)
            .join('')}</ul>`
        : ''
    }

    <h3>Key Metrics</h3>
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse; max-width: 650px;">
      <thead>
        <tr>
          <th>Metric</th>
          <th>This Week</th>
          <th>Last Week</th>
          <th>Change</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Total Visits</td>
          <td>${thisWeekStats.totalVisits}</td>
          <td>${lastWeekStats.totalVisits}</td>
          <td>${formatChange(
            thisWeekStats.totalVisits,
            lastWeekStats.totalVisits
          )}</td>
        </tr>
        <tr>
          <td>Human Visits</td>
          <td>${thisWeekStats.humanVisits}</td>
          <td>${lastWeekStats.humanVisits}</td>
          <td>${formatChange(
            thisWeekStats.humanVisits,
            lastWeekStats.humanVisits
          )}</td>
        </tr>
        <tr>
          <td>Bot Visits</td>
          <td>${thisWeekStats.botVisits}</td>
          <td>${lastWeekStats.botVisits}</td>
          <td>${formatChange(
            thisWeekStats.botVisits,
            lastWeekStats.botVisits
          )}</td>
        </tr>
        <tr>
          <td>Unique Visitors (IDs, Humans)</td>
          <td>${thisWeekStats.uniqueHumanVisitors}</td>
          <td>${lastWeekStats.uniqueHumanVisitors}</td>
          <td>${formatChange(
            thisWeekStats.uniqueHumanVisitors,
            lastWeekStats.uniqueHumanVisitors
          )}</td>
        </tr>
        <tr>
          <td>New vs Returning (Humans)</td>
          <td>${thisWeekStats.newVisitors} new / ${
    thisWeekStats.returningVisitors
  } returning</td>
          <td>${lastWeekStats.newVisitors} new / ${
    lastWeekStats.returningVisitors
  } returning</td>
          <td>—</td>
        </tr>
        <tr>
          <td>Bounce Rate (Humans)</td>
          <td>${thisWeekStats.bounceRate.toFixed(1)}%</td>
          <td>${lastWeekStats.bounceRate.toFixed(1)}%</td>
          <td>—</td>
        </tr>
        <tr>
          <td>Avg. Session Duration (Humans)</td>
          <td>${formatAvgDuration(thisWeekStats.avgSessionDuration)}</td>
          <td>${formatAvgDuration(lastWeekStats.avgSessionDuration)}</td>
          <td>—</td>
        </tr>
        <tr>
          <td>Avg. Pages per Session (Humans)</td>
          <td>${thisWeekStats.avgPagesPerSession.toFixed(1)}</td>
          <td>${lastWeekStats.avgPagesPerSession.toFixed(1)}</td>
          <td>—</td>
        </tr>
      </tbody>
    </table>

    <h3>Visits by Day (This Week)</h3>
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse; max-width: 400px;">
      <thead>
        <tr>
          <th>Day</th>
          <th>Visits</th>
        </tr>
      </thead>
      <tbody>
        ${
          dailyBreakdown.length
            ? dailyBreakdown
                .map(
                  ([day, count]) =>
                    `<tr><td>${day}</td><td>${count}</td></tr>`
                )
                .join('')
            : '<tr><td colspan="2">No data</td></tr>'
        }
      </tbody>
    </table>

    <h3>Top Pages (Humans)</h3>
    <ul>
      ${
        topPages.length
          ? topPages
              .map(([page, count]) => `<li>${page}: ${count} visits</li>`)
              .join('')
          : '<li>No page data</li>'
      }
    </ul>

    <h3>Top Path Flows (Humans)</h3>
    <ul>
      ${
        topPathSequences.length
          ? topPathSequences
              .map(
                ([seq, count]) =>
                  `<li>${seq}: ${count} sessions</li>`
              )
              .join('')
          : '<li>No multi-page path data</li>'
      }
    </ul>

    <h3>Audience & Location (Humans)</h3>
    <p><strong>Top Countries:</strong></p>
    <ul>
      ${
        topCountries.length
          ? topCountries
              .map(([country, count]) => `<li>${country}: ${count}</li>`)
              .join('')
          : '<li>No country data</li>'
      }
    </ul>

    <p><strong>Segments:</strong></p>
    <ul>
      ${
        topSegments.length
          ? topSegments
              .map(([seg, count]) => `<li>${seg}: ${count}</li>`)
              .join('')
          : '<li>No segment data</li>'
      }
    </ul>

    <p><strong>Languages:</strong></p>
    <ul>
      ${
        languageBreakdown.length
          ? languageBreakdown
              .map(([lang, count]) => `<li>${lang}: ${count}</li>`)
              .join('')
          : '<li>No language data</li>'
      }
    </ul>

    <h3>Devices & Tech (Humans)</h3>
    <p><strong>Devices:</strong></p>
    <ul>
      ${
        deviceBreakdown.length
          ? deviceBreakdown
              .map(([device, count]) => `<li>${device}: ${count}</li>`)
              .join('')
          : '<li>No device data</li>'
      }
    </ul>

    <p><strong>Screen Resolutions:</strong></p>
    <ul>
      ${
        resolutionBreakdown.length
          ? resolutionBreakdown
              .map(([res, count]) => `<li>${res}: ${count}</li>`)
              .join('')
          : '<li>No resolution data</li>'
      }
    </ul>

    <h3>Marketing & Attribution (Humans)</h3>
    <p><strong>Traffic Sources:</strong></p>
    <ul>
      ${
        topTrafficSources.length
          ? topTrafficSources
              .map(
                ([source, count]) =>
                  `<li>${source}: ${count} visits</li>`
              )
              .join('')
          : '<li>No traffic source data</li>'
      }
    </ul>

    <p><strong>Top Campaigns (UTM):</strong></p>
    <ul>
      ${
        topCampaigns.length
          ? topCampaigns
              .map(
                ([campaign, count]) =>
                  `<li>${campaign || 'Unspecified'}: ${count} visits</li>`
              )
              .join('')
          : '<li>No campaign data</li>'
      }
    </ul>

    <p><strong>Top Referrers:</strong></p>
    <ul>
      ${
        topReferrers.length
          ? topReferrers
              .map(
                ([ref, count]) =>
                  `<li>${ref || 'Direct'}: ${count} visits</li>`
              )
              .join('')
          : '<li>No referrer data</li>'
      }
    </ul>

    <h3>Engagement (Humans)</h3>
    <p><strong>Session Duration Buckets:</strong></p>
    <ul>
      ${
        Object.keys(thisWeekStats.durationBuckets).length
          ? sortCounts(thisWeekStats.durationBuckets)
              .map(([bucket, count]) => `<li>${bucket}: ${count}</li>`)
              .join('')
          : '<li>No duration data</li>'
      }
    </ul>

    <p><strong>Scroll Depth Buckets:</strong></p>
    <ul>
      ${
        Object.keys(thisWeekStats.scrollDepthBuckets).length
          ? sortCounts(thisWeekStats.scrollDepthBuckets)
              .map(([bucket, count]) => `<li>${bucket}: ${count}</li>`)
              .join('')
          : '<li>No scroll depth data</li>'
      }
    </ul>

    <p><strong>Engagement Score Buckets:</strong></p>
    <ul>
      ${
        Object.keys(thisWeekStats.engagementBuckets).length
          ? sortCounts(thisWeekStats.engagementBuckets)
              .map(([bucket, count]) => `<li>${bucket}: ${count}</li>`)
              .join('')
          : '<li>No engagement score data</li>'
      }
    </ul>

    <p><strong>Top Interactions:</strong></p>
    <ul>
      ${
        topInteractions.length
          ? topInteractions
              .map(
                ([event, count]) =>
                  `<li>${event}: ${count} events</li>`
              )
              .join('')
          : '<li>No interaction events recorded</li>'
      }
    </ul>

    <p style="margin-top: 20px; font-size: 0.9em; color: #666;">
      Full raw data for this week is attached as CSV.
    </p>
  `;

  return { csv, htmlSummary, totalVisits };
};




// const generateWeeklyReport = async () => {
//     const oneWeekAgo = new Date();
//     oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

//     const logs = await VisitorLog.find({ visitDate: { $gte: oneWeekAgo } });

//     // console.log('logs: ', logs);

//     const totalVisits = logs.length;
//     const pageCounts = {};
//     const userAgents = {};
//     const ipAddress = {};

//     logs.forEach((log) => {
//         pageCounts[log.page] = (pageCounts[log.page] || 0) + 1;
//         userAgents[log.userAgent] = (userAgents[log.userAgent] || 0) + 1;
//         ipAddress[log.ip] = (ipAddress[log.ip] || 0) + 1;
//     });

//     const parser = new Parser();
//     const csv = parser.parse(logs.map(log => ({
//         date: log.visitDate,
//         page: log.page,
//         // userAgent: log.userAgent,
//         ipAddress: log.ip,
//         browser: log.browser,
//         os: log.os,
//         sessionDuration: log.sessionDuration,
//         referrer: log.referrer,
//         country: log.geo.country,
//         city: log.geo.city,
//         isBot: log.isBot,
//         scrollDepth: log.scrollDepth,
//         trafficSource: log.trafficSource,
//         deviceType: log.deviceType,
//     })));

//     //   <p><strong>User Agents:</strong></p>
//     //   <ul>${Object.entries(userAgents).map(([ua, count]) => `<li>${ua}: ${count}</li>`).join('')}</ul>
//     const htmlSummary = `
//       <h2>Weekly Visitor Report</h2>
//       <p><strong>Total Visits:</strong> ${totalVisits}</p>
//       <p><strong>Page Views:</strong></p>
//       <ul>${Object.entries(pageCounts).map(([page, count]) => `<li>${page}: ${count}</li>`).join('')}</ul>
//         <p><strong>IP Addresses:</strong></p>
//         <ul>${Object.entries(ipAddress).map(([ip, count]) => `<li>${ip}: ${count}</li>`).join('')}</ul>
//         <p><strong>Country:</strong></p>
//         <ul>${Object.entries(logs.reduce((acc, log) => {
//             acc[log.geo.country] = (acc[log.geo.country] || 0) + 1;
//             return acc;
//         }, {})).map(([country, count]) => `<li>${country}: ${count}</li>`).join('')}</ul>
//         <p><strong>City:</strong></p>
//         <ul>${Object.entries(logs.reduce((acc, log) => {
//             acc[log.geo.city] = (acc[log.geo.city] || 0) + 1;
//             return acc;
//         }, {})).map(([city, count]) => `<li>${city}: ${count}</li>`).join('')}</ul>
//         <p><strong>Is Bot:</strong></p>
//         <ul>${Object.entries(logs.reduce((acc, log) => {
//             acc[log.isBot ? 'Yes' : 'No'] = (acc[log.isBot ? 'Yes' : 'No'] || 0) + 1;
//             return acc;
//         }, {})).map(([isBot, count]) => `<li>${isBot}: ${count}</li>`).join('')}</ul>
//         <p><strong>Browser:</strong></p>
//         <ul>${Object.entries(logs.reduce((acc, log) => {
//             acc[log.browser] = (acc[log.browser] || 0) + 1;
//             return acc;
//         }, {})).map(([browser, count]) => `<li>${browser}: ${count}</li>`).join('')}</ul>
//         <p><strong>Operating System:</strong></p>
//         <ul>${Object.entries(logs.reduce((acc, log) => {
//             acc[log.os] = (acc[log.os] || 0) + 1;
//             return acc;
//         }, {})).map(([os, count]) => `<li>${os}: ${count}</li>`).join('')}</ul>
//         <p><strong>Session Duration:</strong></p>
//         <ul>${Object.entries(logs.reduce((acc, log) => {
//             acc[log.sessionDuration] = (acc[log.sessionDuration] || 0) + 1;
//             return acc;
//         }, {})).map(([duration, count]) => `<li>${duration}: ${count}</li>`).join('')}</ul>
//         <p><strong>Referrers:</strong></p>
//         <ul>${Object.entries(logs.reduce((acc, log) => {
//             acc[log.referrer] = (acc[log.referrer] || 0) + 1;
//             return acc;
//         }, {})).map(([referrer, count]) => `<li>${referrer}: ${count}</li>`).join('')}</ul>
//     <p><strong>Scroll Depth:</strong></p>
//     <ul>${Object.entries(logs.reduce((acc, log) => {
//         acc[log.scrollDepth] = (acc[log.scrollDepth] || 0) + 1;
//         return acc;
//     }, {})).map(([depth, count]) => `<li>${depth}: ${count}</li>`).join('')}</ul>
//     <p><strong>Traffic Source</strong></p>
//     <ul>${Object.entries(logs.reduce((acc, log) => {
//         acc[log.trafficSource] = (acc[log.trafficSource] || 0) + 1;
//         return acc;
//     }, {})).map(([source, count]) => `<li>${source}: ${count}</li>`).join('')}</ul>
//     <p><strong>Device Type:</strong></p>
//     <ul>${Object.entries(logs.reduce((acc, log) => {
//         acc[log.deviceType] = (acc[log.deviceType] || 0) + 1;
//         return acc;
//     }, {})).map(([device, count]) => `<li>${device}: ${count}</li>`).join('')}</ul>    

//     `;

//     // console.log('csv: ', csv);
//     // console.log('htmlSummary: ', htmlSummary);
//     // console.log('totalVisits: ', totalVisits);

//     return { csv, htmlSummary, totalVisits };
// };

const formatDate = (d) => {
    return new Date(d).toLocaleString('en-CA', {
        timeZone: 'America/Toronto',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// const buildEmailContent = (bookings, days) => {
//     if (!bookings.length) {
//         const subject = `No upcoming bookings in next ${days} day(s)`;
//         const text = `There are currently no bookings scheduled in the next ${days} day(s).`;
//         const html = `<p>There are currently <strong>no bookings</strong> scheduled in the next ${days} day(s).</p>`;
//         return { subject, text, html };
//     }

//     const subject = `Upcoming bookings (next ${days} day${days > 1 ? 's' : ''})`;

//     const lines = bookings.map((b) => {
//         return [
//             `Date: ${formatDate(b.date)}`,
//             `Customer: ${b.customerName || 'N/A'}`,
//             `Status: ${b.status}`,
//             b.location ? `Location: ${b.location}` : '',
//             b.notes ? `Notes: ${b.notes}` : '',
//         ]
//             .filter(Boolean)
//             .join(' | ');
//     });

//     const text = `Here are the upcoming bookings for the next ${days} day(s):\n\n${lines
//         .map((l) => `• ${l}`)
//         .join('\n')}`;

//     const htmlListItems = bookings
//         .map(
//             (b) => `
//             <li>
//                 <strong>${formatDate(b.date)}</strong><br/>
//                 Customer: ${b.customerName || 'N/A'}<br/>
//                 Status: ${b.status}<br/>
//                 ${b.location ? `Location: ${b.location}<br/>` : ''}
//                 ${b.notes ? `Notes: ${b.notes}<br/>` : ''}
//             </li>`
//         )
//         .join('');

//     const html = `
//         <p>Here are the upcoming bookings for the next <strong>${days}</strong> day(s):</p>
//         <ul>
//             ${htmlListItems}
//         </ul>
//     `;

//     return { subject, text, html };
// };

function buildEmailContent({ upcomingBookings, days, recentBookings, now, since }) {
  const fmt = (d) => {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "-";
    return dt.toLocaleString("en-CA", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const safe = (v) => (v === undefined || v === null || v === "" ? "-" : String(v));

  // Adjust these field names to match your schema
  const getCustomerLabel = (b) => {
    // common patterns: b.customerName, b.customer?.name, b.customer?.firstName/lastName
    if (b.customerName) return b.customerName;
    if (b.customer?.name) return b.customer.name;
    const fn = b.customer?.firstName || "";
    const ln = b.customer?.lastName || "";
    const full = `${fn} ${ln}`.trim();
    return full || "-";
  };

  const getServiceLabel = (b) => b.serviceType || b.service || "-";

  const getMoneyLabel = (b) => {
    // common patterns: income, total, price, amount
    const val =
      b.total ??
      b.amount ??
      b.price ??
      b.income ??
      b.quoteTotal ??
      null;

    if (val === null || val === undefined || val === "") return "-";
    const n = Number(val);
    return Number.isFinite(n) ? `$${n.toFixed(2)}` : String(val);
  };

  // "Needs invoicing" / "needs payment" heuristics
  const isInvoiced = (b) => {
    // examples: invoiceSent true, invoiceStatus === 'sent'|'paid', invoiced true
    if (b.invoiceSent === true) return true;
    if (b.invoiced === true) return true;
    if (typeof b.invoiceStatus === "string") {
      const s = b.invoiceStatus.toLowerCase();
      return ["sent", "paid", "partial", "overdue"].includes(s);
    }
    return false;
  };

  const isPaid = (b) => {
    // examples: paid true, paymentStatus === 'paid', balanceDue === 0
    if (b.paid === true) return true;
    if (typeof b.paymentStatus === "string") {
      return b.paymentStatus.toLowerCase() === "paid";
    }
    if (b.balanceDue !== undefined && b.balanceDue !== null) {
      const n = Number(b.balanceDue);
      if (Number.isFinite(n)) return n <= 0;
    }
    return false;
  };

  const needsInvoice = (b) => !isInvoiced(b);
  const needsPaymentFollowup = (b) => isInvoiced(b) && !isPaid(b);

  const upcomingRows = (upcomingBookings || [])
    .map((b) => {
      return `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${safe(fmt(b.date))}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">${safe(getCustomerLabel(b))}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">${safe(getServiceLabel(b))}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">${safe(b.status)}</td>
        </tr>
      `;
    })
    .join("");

  const recentRows = (recentBookings || [])
    .map((b) => {
      const invoiceTag = needsInvoice(b)
        ? `<span style="display:inline-block;padding:2px 8px;border-radius:999px;background:#fff3cd;border:1px solid #ffeeba;font-size:12px;">Invoice</span>`
        : `<span style="display:inline-block;padding:2px 8px;border-radius:999px;background:#d4edda;border:1px solid #c3e6cb;font-size:12px;">Invoiced</span>`;

      const paymentTag = isPaid(b)
        ? `<span style="display:inline-block;padding:2px 8px;border-radius:999px;background:#d4edda;border:1px solid #c3e6cb;font-size:12px;margin-left:6px;">Paid</span>`
        : `<span style="display:inline-block;padding:2px 8px;border-radius:999px;background:#f8d7da;border:1px solid #f5c6cb;font-size:12px;margin-left:6px;">Payment</span>`;

      return `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${safe(fmt(b.date))}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">${safe(getCustomerLabel(b))}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">${safe(getServiceLabel(b))}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">${safe(b.status)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">${safe(getMoneyLabel(b))}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">${invoiceTag}${paymentTag}</td>
        </tr>
      `;
    })
    .join("");

  const toInvoice = (recentBookings || []).filter(needsInvoice);
  const toFollowup = (recentBookings || []).filter(needsPaymentFollowup);

  const actionList = `
    <ul style="margin:8px 0 0 18px;color:#222;">
      <li><b>Invoices to send:</b> ${toInvoice.length}</li>
      <li><b>Payments to follow up:</b> ${toFollowup.length}</li>
    </ul>
  `;

  const invoiceBullets = toInvoice
    .slice(0, 10)
    .map((b) => `<li>${safe(getCustomerLabel(b))} — ${safe(getServiceLabel(b))} — ${safe(fmt(b.date))} (${safe(getMoneyLabel(b))})</li>`)
    .join("");

  const paymentBullets = toFollowup
    .slice(0, 10)
    .map((b) => `<li>${safe(getCustomerLabel(b))} — ${safe(getServiceLabel(b))} — ${safe(fmt(b.date))} (${safe(getMoneyLabel(b))})</li>`)
    .join("");

  const invoiceBlock =
    toInvoice.length > 0
      ? `<div style="margin-top:10px;">
           <div style="font-weight:700;margin-bottom:6px;">Invoice reminders</div>
           <ol style="margin:0 0 0 18px;">${invoiceBullets}</ol>
           ${toInvoice.length > 10 ? `<div style="margin-top:6px;color:#666;font-size:12px;">Showing first 10…</div>` : ""}
         </div>`
      : `<div style="margin-top:10px;color:#2f7a3e;">✅ No invoices pending (based on current fields).</div>`;

  const paymentBlock =
    toFollowup.length > 0
      ? `<div style="margin-top:12px;">
           <div style="font-weight:700;margin-bottom:6px;">Payment follow-ups</div>
           <ol style="margin:0 0 0 18px;">${paymentBullets}</ol>
           ${toFollowup.length > 10 ? `<div style="margin-top:6px;color:#666;font-size:12px;">Showing first 10…</div>` : ""}
         </div>`
      : `<div style="margin-top:12px;color:#2f7a3e;">✅ No payment follow-ups flagged (based on current fields).</div>`;

  const subject = `CleanAR Admin Digest: Upcoming (${days} day${days === 1 ? "" : "s"}) + Last 24h Activity`;

  const html = `
    <div style="font-family: Arial, sans-serif; color:#111; line-height:1.45;">
      <h2 style="margin:0 0 6px 0;">CleanAR Admin Digest</h2>

      <div style="font-size:13px;color:#444;margin:0 0 14px 0;">
        Generated at: <b>${fmt(now)}</b><br/>
        Upcoming window: <b>${days}</b> day(s)<br/>
        Recent window: <b>${fmt(since)}</b> → <b>${fmt(now)}</b>
      </div>

      <hr style="border:none;border-top:1px solid #ddd;margin:14px 0;" />

      <h3 style="margin:0 0 8px 0;">Upcoming bookings (next ${days} day${days === 1 ? "" : "s"})</h3>
      <div style="margin:0 0 8px 0;color:#444;font-size:13px;">
        Total upcoming: <b>${upcomingBookings.length}</b>
      </div>

      <table style="width:100%;border-collapse:collapse;border:1px solid #eee;border-radius:8px;overflow:hidden;">
        <thead>
          <tr style="background:#f7f7f7;">
            <th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">Date</th>
            <th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">Customer</th>
            <th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">Service</th>
            <th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${
            upcomingBookings.length
              ? upcomingRows
              : `<tr><td colspan="4" style="padding:10px;color:#666;">No upcoming bookings in this window.</td></tr>`
          }
        </tbody>
      </table>

      <hr style="border:none;border-top:1px solid #ddd;margin:18px 0;" />

      <h3 style="margin:0 0 8px 0;">Recent activity (last 24 hours)</h3>
      <div style="margin:0 0 8px 0;color:#444;font-size:13px;">
        Confirmed/completed: <b>${recentBookings.length}</b>
      </div>

      <table style="width:100%;border-collapse:collapse;border:1px solid #eee;border-radius:8px;overflow:hidden;">
        <thead>
          <tr style="background:#f7f7f7;">
            <th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">Date</th>
            <th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">Customer</th>
            <th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">Service</th>
            <th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">Status</th>
            <th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">Amount</th>
            <th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">Ops</th>
          </tr>
        </thead>
        <tbody>
          ${
            recentBookings.length
              ? recentRows
              : `<tr><td colspan="6" style="padding:10px;color:#666;">No confirmed/completed bookings in the last 24 hours.</td></tr>`
          }
        </tbody>
      </table>

      <div style="margin-top:14px;padding:12px;border:1px solid #eee;border-radius:10px;background:#fafafa;">
        <div style="font-weight:700;">Invoice & payment follow-up</div>
        ${actionList}
        ${invoiceBlock}
        ${paymentBlock}

        <div style="margin-top:12px;color:#666;font-size:12px;">
          Note: Follow-up flags are based on your Booking fields (invoice/payment status). Adjust the heuristics in <code>buildEmailContent</code> to match your schema.
        </div>
      </div>

      <div style="margin-top:18px;color:#777;font-size:12px;">
        This is an automated email from CleanAR Solutions.
      </div>
    </div>
  `;

  return { subject, html };
}

// const sendUpcomingBookingsEmail = async (req, res) => {
//     try {
//         console.log("sendUpcomingBookingsEmail called");
//         const rawDays = Number(req.body.days || req.query.days || 1);
//         const days = Number.isFinite(rawDays) && rawDays > 0 ? rawDays : 1;

//         const now = new Date();
//         const to = new Date();
//         to.setDate(to.getDate() + days);

//         const bookings = await Booking.find({
//             date: { $gte: now, $lte: to },
//             status: { $in: ['confirmed', 'pending'] },
//         })
//             .sort({ date: 1 })
//             .lean();

//         const admins = await User.find({
//             adminFlag: true,
//             email: { $exists: true, $ne: '' },
//         })
//             .select('email name')
//             .lean();

//         if (!admins.length) {
//             return res.status(200).json({
//                 message: 'No admin users with email found. Nothing sent.',
//                 bookingsCount: bookings.length,
//             });
//         }

//         const { subject, text, html } = buildEmailContent(bookings, days);

//                 const message = {
//             to: admins.map(admin => admin.email), // Update with admin email
//             from: 'no-reply@cleanarsolutions.ca',
//             subject: subject,
//             html: html,
//             // attachments: [
//             //     {
//             //         content: Buffer.from(csv).toString('base64'),
//             //         filename: 'visitor-report.csv',
//             //         type: 'text/csv',
//             //         disposition: 'attachment',
//             //     },
//             // ],
//         };

//         try {
//             await sgMail.send(message);
//             // console.log('Email sent successfully');
//             // res.status(200).json({ message: 'Email sent successfully' });
//         } catch (error) {
//             console.error('Error sending email:', error);
//             if (error.response) {
//                 console.error(error.response.body);
//             }
//             // res.status(500).json({ message: 'Error sending email' });
//         }

//         // const sendPromises = admins.map((admin) =>
//         //     sendMail({
//         //         to: admin.email,
//         //         subject,
//         //         text,
//         //         html,
//         //     })
//         // );

//         // await Promise.all(sendPromises);

//         return res.status(200).json({
//             message: 'Upcoming bookings email sent to all admins.',
//             adminsNotified: admins.map((a) => a.email),
//             bookingsCount: bookings.length,
//             days,
//         });
//     } catch (err) {
//         console.error('Error sending upcoming bookings email:', err);
//         return res.status(500).json({
//             message: 'Failed to send upcoming bookings email.',
//             error: err.message,
//         });
//     }
// };

const sendUpcomingBookingsEmail = async (req, res) => {
  try {
    console.log("sendUpcomingBookingsEmail called");

    const rawDays = Number(req.body.days || req.query.days || 1);
    const days = Number.isFinite(rawDays) && rawDays > 0 ? rawDays : 1;

    const now = new Date();

    // Upcoming window
    const to = new Date(now);
    to.setDate(to.getDate() + days);

    // Last-24h window
    const since = new Date(now);
    since.setHours(since.getHours() - 24);

    // Upcoming bookings (existing)
    const upcomingBookings = await Booking.find({
      date: { $gte: now, $lte: to },
      status: { $in: ["confirmed", "pending"] },
    })
      .sort({ date: 1 })
      .lean();

    // Recent confirmed/completed (last 24h)
    // NOTE: Use date or updatedAt depending on what you mean by "in last 24h".
    // If you mean "status changed in last 24h", you likely need a statusHistory or updatedAt filter.
    const recentBookings = await Booking.find({
      date: { $gte: since, $lte: now },
      status: { $in: ["confirmed", "completed"] },
    })
      .sort({ date: -1 })
      .lean();

    const admins = await User.find({
      adminFlag: true,
      email: { $exists: true, $ne: "" },
    })
      .select("email name")
      .lean();

    if (!admins.length) {
      return res.status(200).json({
        message: "No admin users with email found. Nothing sent.",
        upcomingCount: upcomingBookings.length,
        recentCount: recentBookings.length,
      });
    }

    const { subject, html } = buildEmailContent({
      upcomingBookings,
      days,
      recentBookings,
      now,
      since,
    });

    const message = {
      to: admins.map((admin) => admin.email),
      from: "no-reply@cleanarsolutions.ca",
      subject,
      html,
    };

    try {
      await sgMail.send(message);
    } catch (error) {
      console.error("Error sending email:", error);
      if (error.response) console.error(error.response.body);
      // You can choose to return 500 here; keeping your current behavior.
    }

    return res.status(200).json({
      message: "Upcoming + last-24h bookings email sent to all admins.",
      adminsNotified: admins.map((a) => a.email),
      upcomingCount: upcomingBookings.length,
      recentCount: recentBookings.length,
      days,
      windowLast24h: { since, now },
    });
  } catch (err) {
    console.error("Error sending upcoming bookings email:", err);
    return res.status(500).json({
      message: "Failed to send upcoming bookings email.",
      error: err.message,
    });
  }
};


// Define your email controller
const emailController = {
    emailQuote: async (req, res) => {
        try {
            // console.log('Emailing quote: ', req.body);
            const { email, quote } = req.body;

            const emailText = `
Dear ${quote.name},

Thank you for your quote request! We have received it with the following details:

**Quote ID**: ${quote.quoteId}

**Company**: ${quote.companyName}  
**Address**: ${quote.address.toUpperCase()}, ${quote.city.toUpperCase()}, ${quote.province.toUpperCase()}, ${quote.postalcode.toUpperCase()}  
**Phone Number**: ${quote.phonenumber}  
**Email**: ${quote.email}
**Date**: ${quote.createdAt}
**Promo Code**: ${(quote.promoCode) ? (quote.promoCode) : ('No promo code was used.')}

**Services Requested**:
${quote.services.map(service => {
                let customOptionsText = '';
                if (service.customOptions && typeof service.customOptions === 'object') {
                    customOptionsText = Object.keys(service.customOptions).map(key => {
                        console.log('service.customOptions[key]: ', service.customOptions[key]);
                        const option = service.customOptions[key];
                        const label = option.label || key; // Use ariaLabel if available, otherwise fallback to key
                        if (typeof option.service === 'boolean') {
                            return `- ${label}`;
                        } else {
                            return `- ${label}: ${option.service}`;
                        }
                    }).join('\n');
                } else {
                    console.error('service.customOptions is not an object:', service.customOptions);
                    customOptionsText = 'No custom options were selected.';
                }

                // Use customOptionsText as needed
                // console.log(customOptionsText);
                return `
- **${service.type}** (${service.serviceLevel})

- **Custom Options**:
${customOptionsText}
`            }
            ).join('\n')}           


Please note, this is a preliminary summary, and we will send a finalized quote in a separate email. We look forward to discussing your requirements further.

Best regards,  
CleanAR Solutions
info@cleanARsolutions.ca
(437) 440-5514

            `;
            // - **Description**: ${service.description}
            // - **Cost**: $${service.customOptions.find(option => option.optionName === 'serviceCost').optionValue}

            // ${quote.services.map(service => `- ${service.type} (${service.serviceLevel}) - Cost: $${service.customOptions.get('serviceCost')}`).join('\n')}

            // **Products Included**:
            // ${quote.products.map(product => `- ${product.name} - Cost: $${product.productCost}`).join('\n')}
            // **Subtotal**: $${quote.subtotalCost}  
            // **Tax**: $${quote.tax}  
            // **Grand Total**: $${quote.grandTotal}

            const msg = {
                to: email, // Change to your recipient
                from: 'info@cleanARsolutions.ca', // Change to your verified sender
                bcc: 'info@cleanarsolutions.ca',
                subject: 'Your Quote from CleanAR Solutions',
                text: emailText, // plain text body

            }
            // console.log('Emailing quote message: ', msg);

            sgMail
                .send(msg)
                .then(() => {
                    res.status(201).json({ message: 'Email sent' });
                })
                .catch((error) => {
                    console.error(error);
                    res.status(500).json({ message: 'Error emailing quote' });
                })


        } catch (error) {
            console.error('Error emailing quote: ', error);
            res.status(500).json({ message: 'Error emailing quote' });
        }
    },
    emailQuoteNotification: async (req, res) => {

        try {
            // console.log('Emailing quote: ', req.body);
            const { email, quote } = req.body;
            const emailText = `This is an automated notification email from CleanAR Solutions.

A new quote has been created:

--------------------------------------------

Dear ${quote.name},

Thank you for your quote request! We have received it with the following details:

**Quote ID**: ${quote.quoteId}

**Company**: ${quote.companyName}  
**Address**: ${quote.address.toUpperCase()}, ${quote.city.toUpperCase()}, ${quote.province.toUpperCase()}, ${quote.postalcode.toUpperCase()}  
**Phone Number**: ${quote.phonenumber}  
**Email**: ${quote.email}
**Promo Code**: ${(quote.promoCode) ? (quote.promoCode) : ('No promo code was used.')}

**Services Requested**:
${quote.services.map(service => {
                let customOptionsText = '';

                // if (service.customOptions && typeof service.customOptions === 'object') {
                //     customOptionsText = Object.keys(service.customOptions).map(key => {
                //         const option = service.customOptions[key];
                //         if (typeof option.service === 'boolean') {
                //             return `- ${key}`;
                //         } else {
                //             return `- ${key}: ${option.service}`;
                //         }
                //     }).join('\n');
                if (service.customOptions && typeof service.customOptions === 'object') {
                    customOptionsText = Object.keys(service.customOptions).map(key => {
                        console.log('service.customOptions[key]: ', service.customOptions[key]);
                        const option = service.customOptions[key];
                        const label = option.label || key; // Use ariaLabel if available, otherwise fallback to key
                        if (typeof option.service === 'boolean') {
                            if (option.service) {
                                return `- ${label}`;
                            }
                            // return `- ${label}`;
                        } else {
                            return `- ${label}: ${option.service}`;
                        }
                    }).join('\n');
                } else {
                    console.error('service.customOptions is not an object:', service.customOptions);
                    customOptionsText = 'No custom options were selected.';
                }

                // Use customOptionsText as needed
                console.log(customOptionsText);
                return `
- **${service.type}** (${service.serviceLevel})

- **Custom Options**:
${customOptionsText}
`            }
            ).join('\n')}           


Please note, this is a preliminary summary, and we will send a finalized quote in a separate email. We look forward to discussing your requirements further.

Best regards,  
CleanAR Solutions
info@cleanARsolutions.ca
(437) 440-5514

--------------------------------------------

Make sure to follow up with the client to discuss their requirements further.

Best regards,

CleanAR Solutions
info@cleanARsolutions.ca
(437) 440-5514`;
            const msg = {
                to: ['omar.rguez26@gmail.com', 'filiberto_2305@outlook.com', 'info@cleanARsolutions.ca'], // Change to your recipient
                from: 'info@cleanARsolutions.ca', // Change to your verified sender
                subject: 'User Quote Notification: Your Quote from CleanAR Solutions',
                text: emailText, // plain text body

            }

            sgMail
                .send(msg)
                .then(() => {
                    res.status(201).json({ message: 'Notification Email sent' });
                })
                .catch((error) => {
                    console.error(error);
                    res.status(500).json({ message: 'Error emailing Notification quote' });
                })
        } catch (error) {
            console.error('Error emailing quote: ', error);
            res.status(500).json({ message: 'Error emailing quote' });
        }
    },
    emailNewUser: async (req, res) => {
        try {
            // console.log('Emailing new user: ', req.body);
            const { email, user } = req.body;
            const emailText = `Dear ${user.firstName} ${user.lastName},

Welcome to CleanAR Solutions! We are excited to have you join our community and look forward to providing you with exceptional cleaning services. 

Remember to log in to your account to request quotes, view your quotes, and manage your account.

If you have any questions or need assistance, please don't hesitate to reach out to us. 

Best regards,

CleanAR Solutions
info@cleanARsolutions.ca
(437) 440-5514`;
            const msg = {
                to: email, // Change to your recipient
                from: 'info@cleanARsolutions.ca', // Change to your verified sender
                // bcc: 'info@cleanARsolutions.ca',
                subject: 'Welcome to CleanAR Solutions',
                text: emailText, // plain text body

            }
            sgMail
                .send(msg)
                .then(() => {
                    res.status(201).json({ message: 'Email sent' });
                })
                .catch((error) => {
                    console.error(error);
                    res.status(500).json({ message: 'Error emailing new user' });
                })
        } catch (error) {
            console.error('Error emailing new user: ', error);
            res.status(500).json({ message: 'Error emailing new user' });
        }
    },
    emailNewUserNotification: async (req, res) => {
        try {
            // console.log('Emailing new user: ', req.body);
            // const { email, user } = req.body;
            const emailText = `This is an automated notification email from CleanAR Solutions.

An new user has joined our community!

Best regards,

CleanAR Solutions`;
            const msg = {
                to: ['omar.rguez26@gmail.com', 'filiberto_2305@outlook.com'], // Change to your recipient
                from: 'info@cleanARsolutions.ca', // Change to your verified sender
                subject: 'New User Notification: Welcome to CleanAR Solutions',
                text: emailText, // plain text body

            }
            sgMail
                .send(msg)
                .then(() => {
                    res.status(201).json({ message: 'Notification Email sent' });
                })
                .catch((error) => {
                    console.error(error);
                    res.status(500).json({ message: 'Error emailing new user notification' });
                })
        } catch (error) {
            console.error('Error emailing new user notification: ', error);
            res.status(500).json({ message: 'Error emailing new user notification' });
        }
    },
    emailPasswordResetRequest: async (req, res) => {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send('User not found');
        }
        console.log('user: ', user);
        const resetToken = signTokenForPasswordReset({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });
        user.resetToken = bcrypt.hashSync(resetToken, 10); // Store hashed token in the DB
        user.resetTokenExpires = Date.now() + 3600000; // 1 hour expiration
        await user.save();

        // Send the reset email with SendGrid
        const msg = {
            to: user.email,
            from: 'info@cleanARsolutions.ca', // Your verified sender
            subject: 'Password Reset Request',
            text: `
        You are receiving this email because you (or someone else) has requested a password reset for your account.
        Please click on the following link, or paste this into your browser to complete the process:
        https://www.cleanARsolutions.ca/reset-password?token=${resetToken}
        If you did not request this, please ignore this email and your password will remain unchanged.
        `,

            // http://localhost:3000/reset-password?token=${resetToken}
        };

        try {
            await sgMail.send(msg);
            res.status(200).json({ message: 'Password reset email sent! Please check your email for next steps.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error sending email' });

        }
    },
    emailQuickQuote: async (req, res) => {
        try {
            // const { textSummary, imageBase64, formData } = req.body;
            // if (!textSummary || !imageBase64 || !formData) {
                const { textSummary, formData } = req.body;
                if (!textSummary || !formData) {
                return res.status(400).json({ message: "Form data and image are required." });
            }

            // Decode the base64 image string to a buffer
            // const imageBuffer = Buffer.from(imageBase64, 'base64');
            const { name, email, phonenumber, postalcode } = formData;

            // Use Sharp to convert PNG to JPEG
            // const jpegBuffer = await sharp(imageBuffer)
            //     .jpeg({ quality: 80 })  // Convert to JPEG and set quality
            //     .toBuffer();  // Return a buffer

            // Convert JPEG buffer to Base64
            // const jpegBase64 = jpegBuffer.toString('base64');

            // Construct email HTML with inline image
            const emailHtml = `
            <h2>Customer Form Submission</h2>                    
            <p>${textSummary}</p>
            `;
            // <p><strong>Form Screenshot:</strong></p>
            // <img src="data:image/jpeg;base64,${jpegBase64}" alt="Quote Form" style="max-width:100%; border:1px solid #ccc; border-radius:8px;">

            // const msg = {
            //     to: 'info@cleanARsolutions.ca', // Change to your recipient
            //     from: 'info@cleanARsolutions.ca',
            //     subject: 'Quick Quote Request',
            //     html: formHtml,
            // }
            // Email content
            const msg = {
                to: 'info@cleanARsolutions.ca',
                // to: 'cleanARsolutions@gmail.com',
                from: 'info@cleanARsolutions.ca',
                // bcc: 'info@clenarsolutions.ca',
                subject: "CleanAR Solutions: A new quote has been submitted! Please review and follow up with the client.",
                html: emailHtml
            };
            sgMail
                .send(msg)
                .then(() => {
                    res.status(201).json({ message: 'Email sent' });
                })
                .catch((error) => {
                    console.error(error);
                    res.status(500).json({ message: 'Error emailing quote' });
                }
                )
        } catch (error) {
            console.error('Error emailing quote: ', error);
            res.status(500).json({ message: 'Error emailing quote' });
        }

    },
    emailQuickNotePDF: async (req, res) => {
        const { from, to, cc, subject, html, attachments } = req.body;

        const msg = {
            to: to,
            from: from,
            subject: subject,
            bcc: ['cleanARsolutions@gmail.com', 'info@cleanarsolutions.ca'],
            html: html,
            attachments: attachments.map(attachment => ({
                content: attachment.content,
                filename: attachment.filename,
                type: 'application/pdf',
                disposition: 'attachment',
                contentId: 'quickQuotePDF'
            }))
        };

        try {
            await sgMail.send(msg);
            console.log('Email sent successfully');
            res.status(200).json({ message: 'Email sent successfully' });
        } catch (error) {
            console.error('Error sending email:', error);
            if (error.response) {
                console.error(error.response.body);
            }
            res.status(500).json({ message: 'Error sending email' });
        }
    },
    generateWeeklyReport: async () => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const logs = await VisitorLog.find({ visitDate: { $gte: oneWeekAgo } });

        // console.log('logs: ', logs);

        const totalVisits = logs.length;
        const pageCounts = {};
        const userAgents = {};
        const ipAddress = {};

        logs.forEach((log) => {
            pageCounts[log.page] = (pageCounts[log.page] || 0) + 1;
            userAgents[log.userAgent] = (userAgents[log.userAgent] || 0) + 1;
            ipAddress[log.ip] = (ipAddress[log.ip] || 0) + 1;
        });

        const parser = new Parser();
        const csv = parser.parse(logs.map(log => ({
        date: log.visitDate,
        page: log.page,
        // userAgent: log.userAgent,
        ipAddress: log.ip,
        browser: log.browser,
        os: log.os,
        sessionDuration: log.sessionDuration,
        referrer: log.referrer,
        country: log.geo.country,
        city: log.geo.city,
        isBot: log.isBot,
        scrollDepth: log.scrollDepth,
        trafficSource: log.trafficSource,
        deviceType: log.deviceType,
    })));

    //   <p><strong>User Agents:</strong></p>
    //   <ul>${Object.entries(userAgents).map(([ua, count]) => `<li>${ua}: ${count}</li>`).join('')}</ul>
    const htmlSummary = `
      <h2>Weekly Visitor Report</h2>
      <p><strong>Total Visits:</strong> ${totalVisits}</p>
      <p><strong>Page Views:</strong></p>
      <ul>${Object.entries(pageCounts).map(([page, count]) => `<li>${page}: ${count}</li>`).join('')}</ul>
        <p><strong>IP Addresses:</strong></p>
        <ul>${Object.entries(ipAddress).map(([ip, count]) => `<li>${ip}: ${count}</li>`).join('')}</ul>
        <p><strong>Country:</strong></p>
        <ul>${Object.entries(logs.reduce((acc, log) => {
            acc[log.geo.country] = (acc[log.geo.country] || 0) + 1;
            return acc;
        }, {})).map(([country, count]) => `<li>${country}: ${count}</li>`).join('')}</ul>
        <p><strong>City:</strong></p>
        <ul>${Object.entries(logs.reduce((acc, log) => {
            acc[log.geo.city] = (acc[log.geo.city] || 0) + 1;
            return acc;
        }, {})).map(([city, count]) => `<li>${city}: ${count}</li>`).join('')}</ul>
        <p><strong>Is Bot:</strong></p>
        <ul>${Object.entries(logs.reduce((acc, log) => {
            acc[log.isBot ? 'Yes' : 'No'] = (acc[log.isBot ? 'Yes' : 'No'] || 0) + 1;
            return acc;
        }, {})).map(([isBot, count]) => `<li>${isBot}: ${count}</li>`).join('')}</ul>
        <p><strong>Browser:</strong></p>
        <ul>${Object.entries(logs.reduce((acc, log) => {
            acc[log.browser] = (acc[log.browser] || 0) + 1;
            return acc;
        }, {})).map(([browser, count]) => `<li>${browser}: ${count}</li>`).join('')}</ul>
        <p><strong>Operating System:</strong></p>
        <ul>${Object.entries(logs.reduce((acc, log) => {
            acc[log.os] = (acc[log.os] || 0) + 1;
            return acc;
        }, {})).map(([os, count]) => `<li>${os}: ${count}</li>`).join('')}</ul>
        <p><strong>Session Duration:</strong></p>
        <ul>${Object.entries(logs.reduce((acc, log) => {
            acc[log.sessionDuration] = (acc[log.sessionDuration] || 0) + 1;
            return acc;
        }, {})).map(([duration, count]) => `<li>${duration}: ${count}</li>`).join('')}</ul>
        <p><strong>Referrers:</strong></p>
        <ul>${Object.entries(logs.reduce((acc, log) => {
            acc[log.referrer] = (acc[log.referrer] || 0) + 1;
            return acc;
        }, {})).map(([referrer, count]) => `<li>${referrer}: ${count}</li>`).join('')}</ul>
    <p><strong>Scroll Depth:</strong></p>
    <ul>${Object.entries(logs.reduce((acc, log) => {
        acc[log.scrollDepth] = (acc[log.scrollDepth] || 0) + 1;
        return acc;
    }, {})).map(([depth, count]) => `<li>${depth}: ${count}</li>`).join('')}</ul>
    <p><strong>Traffic Source</strong></p>
    <ul>${Object.entries(logs.reduce((acc, log) => {
        acc[log.trafficSource] = (acc[log.trafficSource] || 0) + 1;
        return acc;
    }, {})).map(([source, count]) => `<li>${source}: ${count}</li>`).join('')}</ul>
    <p><strong>Device Type:</strong></p>
    <ul>${Object.entries(logs.reduce((acc, log) => {
        acc[log.deviceType] = (acc[log.deviceType] || 0) + 1;
        return acc;
    }, {})).map(([device, count]) => `<li>${device}: ${count}</li>`).join('')}</ul>    

    `;
        // const csv = parser.parse(logs.map(log => ({
        //     date: log.visitDate,
        //     page: log.page,
        //     userAgent: log.userAgent,
        //     ipAddress: log.ip,
        // })));

        // const htmlSummary = `
        //   <h2>Weekly Visitor Report</h2>
        //   <p><strong>Total Visits:</strong> ${totalVisits}</p>
        //   <p><strong>Page Views:</strong></p>
        //   <ul>${Object.entries(pageCounts).map(([page, count]) => `<li>${page}: ${count}</li>`).join('')}</ul>
        //   <p><strong>User Agents:</strong></p>
        //   <ul>${Object.entries(userAgents).map(([ua, count]) => `<li>${ua}: ${count}</li>`).join('')}</ul>
        //     <p><strong>IP Addresses:</strong></p>
        //     <ul>${Object.entries(ipAddress).map(([ip, count]) => `<li>${ip}: ${count}</li>`).join('')}</ul>
        // `;

        // console.log('csv: ', csv);
        // console.log('htmlSummary: ', htmlSummary);
        // console.log('totalVisits: ', totalVisits);

        return { csv, htmlSummary, totalVisits };
    },
    sendWeeklyReportEmail: async () => {
        const { csv, htmlSummary } = await generateWeeklyReport();

        //   console.log('htmlSummary: ', htmlSummary);

        const message = {
            to: 'info@cleanarsolutions.ca', // Update with admin email
            from: 'info@cleanarsolutions.ca',
            subject: 'Weekly Visitor Report',
            html: htmlSummary,
            attachments: [
                {
                    content: Buffer.from(csv).toString('base64'),
                    filename: 'visitor-report.csv',
                    type: 'text/csv',
                    disposition: 'attachment',
                },
            ],
        };

        try {
            await sgMail.send(message);
            // console.log('Email sent successfully');
            // res.status(200).json({ message: 'Email sent successfully' });
        } catch (error) {
            console.error('Error sending email:', error);
            if (error.response) {
                console.error(error.response.body);
            }
            // res.status(500).json({ message: 'Error sending email' });
        }
    },
    generateManualReport: async (req, res) => {
        try {
            const { csv } = await generateWeeklyReport();
            res.header('Content-Type', 'text/csv');
            res.attachment('visitor-report.csv');
            res.send(csv);
        } catch (err) {
            console.error('Manual report error:', err);
            res.status(500).json({ error: 'Failed to generate report' });
        }
    },
    sendUpcomingBookingsEmail,

};

module.exports = emailController;