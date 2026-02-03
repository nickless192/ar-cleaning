import React, { useEffect, useMemo, useState } from "react";
import { Row, Col, Card, Spinner, Badge, Button, ButtonGroup } from "react-bootstrap";
import ExportCSV from "./ExportCSV.jsx";
import ReportDownloadButton from "./ReportDownloadButton.jsx";
import CustomPagination from "./CustomPagination.jsx";
import LogTable from "./LogTable.jsx";
import LogChartV2 from "./LogChart.jsx";
import FilterBarV2 from "./FilterBar.jsx";

import {
  FaUsers,
  FaRobot,
  FaStar,
  FaCheckCircle,
  FaChartLine,
  FaGlobe,
  FaClock,
  FaMousePointer,
  FaScroll,
  FaSignOutAlt,
} from "react-icons/fa";

const logsPerPage = 10;

const clampNum = (n, fallback = 0) => {
  const x = Number(n);
  return Number.isFinite(x) ? x : fallback;
};

const formatDuration = (secondsRaw) => {
  const seconds = Math.round(clampNum(secondsRaw, 0));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${s}s`;
  return `${s}s`;
};

const safeLower = (v) => (v ? String(v).toLowerCase() : "");

const hostnameFromReferrer = (ref) => {
  if (!ref) return null;
  try {
    return new URL(ref).hostname.replace("www.", "");
  } catch {
    return null;
  }
};

const getDayKey = (dateLike) => {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "invalid";
  return d.toISOString().slice(0, 10);
};

const uniq = (arr) => [...new Set(arr.filter(Boolean))];

const topN = (mapObj, n = 5, keyName = "key") => {
  return Object.entries(mapObj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k, v]) => ({ [keyName]: k, count: v }));
};

const buildValueMap = (logs, getter) => {
  const m = {};
  logs.forEach((l) => {
    const v = getter(l);
    if (!v) return;
    m[v] = (m[v] || 0) + 1;
  });
  return m;
};

const pct = (num, den) => (den ? (num / den) * 100 : 0);

function computeStats(logs) {
  const total = logs.length;
  const botVisits = logs.filter((l) => !!l.isBot).length;
  const humanVisits = total - botVisits;

  const humans = logs.filter((l) => !l.isBot);

  // visitorId unique (overall)
  const uniqueVisitors = new Set(logs.map((l) => l.visitorId).filter(Boolean)).size;

  const newVisitors = logs.filter((l) => !l.isReturningVisitor).length;
  const returningVisitors = logs.filter((l) => !!l.isReturningVisitor).length;

  // qualified (humans)
  const qualifiedSessions = humans.filter((l) => !!l.qualified).length;
  const qualifiedRate = pct(qualifiedSessions, humans.length);

  const bounces = humans.filter((l) => !!l.isBounce).length;
  const bounceRate = pct(bounces, humans.length);

  // engagement metrics (humans)
  const avgEngagementScore =
    humans.length
      ? humans.reduce((sum, l) => sum + clampNum(l.engagementScore, 0), 0) / humans.length
      : 0;

  const avgScrollDepth =
    humans.length
      ? humans.reduce((sum, l) => sum + clampNum(l.scrollDepth, 0), 0) / humans.length
      : 0;

  const avgSessionDuration =
    humans.length
      ? humans.reduce((sum, l) => sum + clampNum(l.sessionDuration, 0), 0) / humans.length
      : 0;

  const totalInteractions = humans.reduce((sum, l) => sum + (l.interactions?.length || 0), 0);
  const avgInteractions = humans.length ? totalInteractions / humans.length : 0;

  const avgPagesPerSession = humans.length
    ? humans.reduce((sum, l) => sum + ((l.pathsVisited?.length || 0) || 1), 0) / humans.length
    : 0;

  // devices
  const deviceCounts = { desktop: 0, mobile: 0, tablet: 0, unknown: 0 };
  logs.forEach((l) => {
    const d = safeLower(l.deviceType) || "unknown";
    deviceCounts[d] = (deviceCounts[d] || 0) + 1;
  });

  // geo
  const countries = buildValueMap(logs, (l) => l.geo?.country);
  const topCountries = topN(countries, 8, "country");

  // browsers, OS
  const browsers = buildValueMap(logs, (l) => l.browser);
  const topBrowsers = topN(browsers, 8, "browser");

  const osMap = buildValueMap(logs, (l) => l.os);
  const topOS = topN(osMap, 8, "os");

  // pages & exit pages
  const pages = buildValueMap(logs, (l) => l.page);
  const topPages = topN(pages, 10, "page");

  const exits = buildValueMap(humans, (l) => l.exitPage);
  const topExitPages = topN(exits, 10, "exitPage");

  // referrers
  const refMap = buildValueMap(humans, (l) => hostnameFromReferrer(l.referrer));
  const topReferrers = topN(refMap, 10, "referrer");

  // trafficSource / segment
  const trafficMap = buildValueMap(humans, (l) => l.trafficSource || "unknown");
  const topTrafficSources = topN(trafficMap, 10, "source");

  const segMap = buildValueMap(humans, (l) => l.segment);
  const topSegments = topN(segMap, 10, "segment");

  // UTM breakdown
  const utmSourceMap = buildValueMap(humans, (l) => l.utm?.source);
  const utmMediumMap = buildValueMap(humans, (l) => l.utm?.medium);
  const utmCampaignMap = buildValueMap(humans, (l) => l.utm?.campaign);

  const topUtmSources = topN(utmSourceMap, 10, "utmSource");
  const topUtmMediums = topN(utmMediumMap, 10, "utmMedium");
  const topUtmCampaigns = topN(utmCampaignMap, 10, "utmCampaign");

  // qualified reasons (humans only, qualified only)
  const reasonMap = {};
  humans
    .filter((l) => !!l.qualified)
    .forEach((l) => {
      (l.qualifiedReason || []).forEach((r) => {
        const key = String(r || "").trim();
        if (!key) return;
        reasonMap[key] = (reasonMap[key] || 0) + 1;
      });
    });
  const topQualifiedReasons = topN(reasonMap, 10, "reason");

  return {
    total,
    uniqueVisitors,
    botVisits,
    humanVisits,

    newVisitors,
    returningVisitors,

    qualifiedSessions,
    qualifiedRate,

    bounceRate,
    avgEngagementScore,
    avgScrollDepth,
    avgSessionDuration,
    totalInteractions,
    avgInteractions,
    avgPagesPerSession,

    devices: deviceCounts,

    topCountries,
    topBrowsers,
    topOS,

    topPages,
    topExitPages,
    topReferrers,
    topTrafficSources,
    topSegments,

    topUtmSources,
    topUtmMediums,
    topUtmCampaigns,

    topQualifiedReasons,
  };
}

function generateInsights(stats) {
  const out = [];

  if (!stats.total) {
    out.push("No activity for the selected filters and date range.");
    return out;
  }

  out.push(
    `Traffic: ${stats.total} sessions (${stats.humanVisits} human, ${stats.botVisits} bot). Unique visitors: ${stats.uniqueVisitors}.`
  );

  out.push(
    `Quality: ${stats.qualifiedSessions} qualified sessions (${stats.qualifiedRate.toFixed(1)}% of human).`
  );

  const bounceLabel =
    stats.bounceRate > 70 ? "high" : stats.bounceRate < 40 ? "healthy" : "moderate";
  out.push(`Bounce rate is ${bounceLabel} at ${stats.bounceRate.toFixed(1)}%.`);

  out.push(
    `Engagement: avg score ${stats.avgEngagementScore.toFixed(1)}, avg scroll ${stats.avgScrollDepth.toFixed(0)}%, avg session ${formatDuration(
      stats.avgSessionDuration
    )}.`
  );

  if (stats.topTrafficSources?.[0]) {
    out.push(`Top traffic source: ${stats.topTrafficSources[0].source} (${stats.topTrafficSources[0].count}).`);
  }
  if (stats.topUtmCampaigns?.[0]) {
    out.push(`Top UTM campaign: ${stats.topUtmCampaigns[0].utmCampaign} (${stats.topUtmCampaigns[0].count}).`);
  }
  if (stats.topCountries?.[0]) {
    out.push(`Top location: ${stats.topCountries[0].country} (${stats.topCountries[0].count}).`);
  }
  if (stats.topQualifiedReasons?.[0]) {
    out.push(`Most common qualification reason: "${stats.topQualifiedReasons[0].reason}" (${stats.topQualifiedReasons[0].count}).`);
  }

  return out;
}

const MetricButtons = ({ metric, onChange }) => {
  const options = [
    { key: "visits", label: "Visits" },
    { key: "humans", label: "Human Visits" },
    { key: "qualified", label: "Qualified" },
    { key: "bounceRate", label: "Bounce Rate" },
    { key: "avgEngagement", label: "Avg Engagement" },
    { key: "avgScroll", label: "Avg Scroll" },
    { key: "avgDuration", label: "Avg Duration" },
  ];

  return (
    <ButtonGroup className="flex-wrap">
      {options.map((o) => (
        <Button
          key={o.key}
          size="sm"
          variant={metric === o.key ? "primary" : "outline-primary"}
          onClick={() => onChange(o.key)}
        >
          {o.label}
        </Button>
      ))}
    </ButtonGroup>
  );
};

const ListWithBadges = ({ title, items, keyField, labelField }) => (
  <Card className="h-100">
    <Card.Body>
      <Card.Title className="mb-3">{title}</Card.Title>
      {items?.length ? (
        <ul className="list-unstyled mb-0">
          {items.map((it) => (
            <li key={it[keyField]} className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-truncate" style={{ maxWidth: "75%" }}>
                {it[labelField]}
              </span>
              <Badge bg="light" text="dark">
                {it.count}
              </Badge>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-muted">No data</div>
      )}
    </Card.Body>
  </Card>
);

const LogDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [pages, setPages] = useState([]);

  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedPage, setSelectedPage] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // new filters
  const [deviceFilter, setDeviceFilter] = useState("");
  const [browserFilter, setBrowserFilter] = useState("");
  const [osFilter, setOsFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("");
  const [trafficSourceFilter, setTrafficSourceFilter] = useState("");

  const [utmSourceFilter, setUtmSourceFilter] = useState("");
  const [utmMediumFilter, setUtmMediumFilter] = useState("");
  const [utmCampaignFilter, setUtmCampaignFilter] = useState("");

  const [visitorTypeFilter, setVisitorTypeFilter] = useState(""); // new | returning | ""
  const [qualifiedOnly, setQualifiedOnly] = useState(false);
  const [excludeBots, setExcludeBots] = useState(true);

  const [minEngagement, setMinEngagement] = useState("");
  const [scrollMin, setScrollMin] = useState("");
  const [scrollMax, setScrollMax] = useState("");

  // chart metric toggle
  const [trendMetric, setTrendMetric] = useState("visits");

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/visitors/logs");
        if (!res.ok) throw new Error("Failed to fetch logs");
        const data = await res.json();

        setLogs(data);
        setFilteredLogs(data);

        setPages(uniq(data.map((l) => l.page)));

        const now = new Date();
        const lastWeek = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
        setDateRange({
          start: lastWeek.toISOString().slice(0, 10),
          end: now.toISOString().slice(0, 10),
        });
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // apply filters
  useEffect(() => {
    let filtered = [...logs];

    // page
    if (selectedPage) filtered = filtered.filter((l) => l.page === selectedPage);

    // date range
    if (dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      filtered = filtered.filter((l) => {
        const d = new Date(l.visitDate);
        return d >= start && d <= end;
      });
    }

    // exclude bots
    if (excludeBots) filtered = filtered.filter((l) => !l.isBot);

    // device/browser/os/country
    if (deviceFilter) filtered = filtered.filter((l) => l.deviceType === deviceFilter);
    if (browserFilter) filtered = filtered.filter((l) => l.browser === browserFilter);
    if (osFilter) filtered = filtered.filter((l) => l.os === osFilter);
    if (countryFilter) filtered = filtered.filter((l) => l.geo?.country === countryFilter);

    // segment / trafficSource
    if (segmentFilter) filtered = filtered.filter((l) => l.segment === segmentFilter);
    if (trafficSourceFilter) filtered = filtered.filter((l) => (l.trafficSource || "unknown") === trafficSourceFilter);

    // utm
    if (utmSourceFilter) filtered = filtered.filter((l) => (l.utm?.source || "") === utmSourceFilter);
    if (utmMediumFilter) filtered = filtered.filter((l) => (l.utm?.medium || "") === utmMediumFilter);
    if (utmCampaignFilter) filtered = filtered.filter((l) => (l.utm?.campaign || "") === utmCampaignFilter);

    // visitor type
    if (visitorTypeFilter === "new") filtered = filtered.filter((l) => !l.isReturningVisitor);
    if (visitorTypeFilter === "returning") filtered = filtered.filter((l) => !!l.isReturningVisitor);

    // qualified
    if (qualifiedOnly) filtered = filtered.filter((l) => !!l.qualified);

    // engagement threshold
    if (minEngagement !== "" && minEngagement != null) {
      const minE = clampNum(minEngagement, 0);
      filtered = filtered.filter((l) => clampNum(l.engagementScore, 0) >= minE);
    }

    // scroll depth range
    const sMin = scrollMin === "" ? null : clampNum(scrollMin, 0);
    const sMax = scrollMax === "" ? null : clampNum(scrollMax, 100);
    if (sMin != null) filtered = filtered.filter((l) => clampNum(l.scrollDepth, 0) >= sMin);
    if (sMax != null) filtered = filtered.filter((l) => clampNum(l.scrollDepth, 0) <= sMax);

    setFilteredLogs(filtered);
    setCurrentPage(1);
  }, [
    logs,
    selectedPage,
    dateRange,
    deviceFilter,
    browserFilter,
    osFilter,
    countryFilter,
    segmentFilter,
    trafficSourceFilter,
    utmSourceFilter,
    utmMediumFilter,
    utmCampaignFilter,
    visitorTypeFilter,
    qualifiedOnly,
    excludeBots,
    minEngagement,
    scrollMin,
    scrollMax,
  ]);

  const stats = useMemo(() => computeStats(filteredLogs), [filteredLogs]);
  const insights = useMemo(() => generateInsights(stats), [stats]);

  // pagination
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * logsPerPage, currentPage * logsPerPage);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: 320 }}>
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h2 className="mb-0">Visitor Analytics</h2>
          <div className="text-muted small">
            Filters update everything (KPIs, charts, tables). Bots can be excluded.
          </div>
        </div>
        <div className="d-flex gap-2">
          <ExportCSV logs={filteredLogs} />
          <ReportDownloadButton />
        </div>
      </div>

      {/* Filters */}
      <FilterBarV2
        logs={logs}
        pages={pages}
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
        dateRange={dateRange}
        setDateRange={setDateRange}
        deviceFilter={deviceFilter}
        setDeviceFilter={setDeviceFilter}
        browserFilter={browserFilter}
        setBrowserFilter={setBrowserFilter}
        osFilter={osFilter}
        setOsFilter={setOsFilter}
        countryFilter={countryFilter}
        setCountryFilter={setCountryFilter}
        segmentFilter={segmentFilter}
        setSegmentFilter={setSegmentFilter}
        trafficSourceFilter={trafficSourceFilter}
        setTrafficSourceFilter={setTrafficSourceFilter}
        utmSourceFilter={utmSourceFilter}
        setUtmSourceFilter={setUtmSourceFilter}
        utmMediumFilter={utmMediumFilter}
        setUtmMediumFilter={setUtmMediumFilter}
        utmCampaignFilter={utmCampaignFilter}
        setUtmCampaignFilter={setUtmCampaignFilter}
        visitorTypeFilter={visitorTypeFilter}
        setVisitorTypeFilter={setVisitorTypeFilter}
        qualifiedOnly={qualifiedOnly}
        setQualifiedOnly={setQualifiedOnly}
        excludeBots={excludeBots}
        setExcludeBots={setExcludeBots}
        minEngagement={minEngagement}
        setMinEngagement={setMinEngagement}
        scrollMin={scrollMin}
        setScrollMin={setScrollMin}
        scrollMax={scrollMax}
        setScrollMax={setScrollMax}
      />

      {/* KPI cards */}
      <Row className="g-3 mb-3">
        <Col lg={3} md={6}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <FaUsers size={22} className="mb-2 text-primary" />
              <div className="text-muted small">Total Sessions</div>
              <h3 className="mb-0">{stats.total}</h3>
              <div className="text-muted small">Unique Visitors: {stats.uniqueVisitors}</div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <FaRobot size={22} className="mb-2 text-secondary" />
              <div className="text-muted small">Bots vs Humans</div>
              <h3 className="mb-0">{stats.humanVisits}</h3>
              <div className="text-muted small">Human sessions</div>
              <div className="small">
                Bots: <b>{stats.botVisits}</b>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <FaCheckCircle size={22} className="mb-2 text-success" />
              <div className="text-muted small">Qualified Sessions</div>
              <h3 className="mb-0">{stats.qualifiedSessions}</h3>
              <div className="text-muted small">Rate: {stats.qualifiedRate.toFixed(1)}%</div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <FaStar size={22} className="mb-2 text-warning" />
              <div className="text-muted small">Avg Engagement Score</div>
              <h3 className="mb-0">{stats.avgEngagementScore.toFixed(1)}</h3>
              <div className="text-muted small">Avg interactions: {stats.avgInteractions.toFixed(1)}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Engagement / Behavior KPIs */}
      <Row className="g-3 mb-3">
        <Col lg={4} md={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title className="d-flex align-items-center gap-2">
                <FaChartLine /> Engagement & Behavior
              </Card.Title>
              <div className="d-flex justify-content-between mt-3">
                <div>
                  <div className="text-muted small">Bounce Rate</div>
                  <h4>{stats.bounceRate.toFixed(1)}%</h4>
                </div>
                <div>
                  <div className="text-muted small">Avg Duration</div>
                  <h4>{formatDuration(stats.avgSessionDuration)}</h4>
                </div>
                <div>
                  <div className="text-muted small">Pages / Session</div>
                  <h4>{stats.avgPagesPerSession.toFixed(1)}</h4>
                </div>
              </div>

              <div className="d-flex justify-content-between mt-3">
                <div>
                  <div className="text-muted small">Avg Scroll</div>
                  <h5 className="d-flex align-items-center gap-2">
                    <FaScroll /> {stats.avgScrollDepth.toFixed(0)}%
                  </h5>
                </div>
                <div>
                  <div className="text-muted small">Interactions</div>
                  <h5 className="d-flex align-items-center gap-2">
                    <FaMousePointer /> {stats.totalInteractions}
                  </h5>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} md={6}>
          <ListWithBadges title="Top Pages" items={stats.topPages} keyField="page" labelField="page" />
        </Col>

        <Col lg={4} md={12}>
          <ListWithBadges title="Top Exit Pages" items={stats.topExitPages} keyField="exitPage" labelField="exitPage" />
        </Col>
      </Row>

      {/* Attribution / UTM / Segments */}
      <Row className="g-3 mb-3">
        <Col lg={4} md={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title className="d-flex align-items-center gap-2">
                <FaGlobe /> Geo, Devices & Platforms
              </Card.Title>

              <div className="mt-3">
                <div className="text-muted small mb-1">Top Countries</div>
                {stats.topCountries?.slice(0, 5).map((c) => (
                  <div key={c.country} className="d-flex justify-content-between">
                    <span>{c.country}</span>
                    <Badge bg="light" text="dark">{c.count}</Badge>
                  </div>
                ))}
              </div>

              <hr />

              <div className="d-flex justify-content-between">
                <div>
                  <div className="text-muted small">Desktop</div>
                  <b>{stats.devices.desktop}</b>
                </div>
                <div>
                  <div className="text-muted small">Mobile</div>
                  <b>{stats.devices.mobile}</b>
                </div>
                <div>
                  <div className="text-muted small">Tablet</div>
                  <b>{stats.devices.tablet}</b>
                </div>
              </div>

              <hr />

              <div className="text-muted small mb-1">Top Browsers</div>
              {stats.topBrowsers?.slice(0, 4).map((b) => (
                <div key={b.browser} className="d-flex justify-content-between">
                  <span>{b.browser}</span>
                  <Badge bg="light" text="dark">{b.count}</Badge>
                </div>
              ))}

              <div className="text-muted small mt-3 mb-1">Top OS</div>
              {stats.topOS?.slice(0, 4).map((o) => (
                <div key={o.os} className="d-flex justify-content-between">
                  <span>{o.os}</span>
                  <Badge bg="light" text="dark">{o.count}</Badge>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} md={6}>
          <ListWithBadges title="Traffic Sources" items={stats.topTrafficSources} keyField="source" labelField="source" />
        </Col>

        <Col lg={4} md={12}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>UTM Breakdown</Card.Title>

              <div className="mt-2">
                <div className="text-muted small mb-1">Top Campaigns</div>
                {stats.topUtmCampaigns?.slice(0, 6).map((x) => (
                  <div key={x.utmCampaign} className="d-flex justify-content-between">
                    <span className="text-truncate" style={{ maxWidth: "75%" }}>{x.utmCampaign}</span>
                    <Badge bg="light" text="dark">{x.count}</Badge>
                  </div>
                ))}
              </div>

              <hr />

              <Row>
                <Col md={6}>
                  <div className="text-muted small mb-1">Top Sources</div>
                  {stats.topUtmSources?.slice(0, 4).map((x) => (
                    <div key={x.utmSource} className="d-flex justify-content-between">
                      <span className="text-truncate" style={{ maxWidth: "70%" }}>{x.utmSource}</span>
                      <Badge bg="light" text="dark">{x.count}</Badge>
                    </div>
                  ))}
                </Col>
                <Col md={6}>
                  <div className="text-muted small mb-1">Top Mediums</div>
                  {stats.topUtmMediums?.slice(0, 4).map((x) => (
                    <div key={x.utmMedium} className="d-flex justify-content-between">
                      <span className="text-truncate" style={{ maxWidth: "70%" }}>{x.utmMedium}</span>
                      <Badge bg="light" text="dark">{x.count}</Badge>
                    </div>
                  ))}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Referrers / Segments / Qualified reasons */}
      <Row className="g-3 mb-3">
        <Col lg={4} md={6}>
          <ListWithBadges title="Top Referrers" items={stats.topReferrers} keyField="referrer" labelField="referrer" />
        </Col>
        <Col lg={4} md={6}>
          <ListWithBadges title="Top Segments" items={stats.topSegments} keyField="segment" labelField="segment" />
        </Col>
        <Col lg={4} md={12}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title className="d-flex align-items-center gap-2">
                <FaSignOutAlt /> Qualified Reasons
              </Card.Title>
              {stats.topQualifiedReasons?.length ? (
                <ul className="list-unstyled mb-0 mt-2">
                  {stats.topQualifiedReasons.map((r) => (
                    <li key={r.reason} className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-truncate" style={{ maxWidth: "75%" }}>{r.reason}</span>
                      <Badge bg="light" text="dark">{r.count}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-muted mt-2">No qualified reasons in this filter range.</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Insights */}
      <Row className="g-3 mb-3">
        <Col md={12}>
          <Card>
            <Card.Body>
              <Card.Title>Insights</Card.Title>
              {insights?.length ? (
                <ul className="mb-0">
                  {insights.map((t, idx) => <li key={idx}>{t}</li>)}
                </ul>
              ) : (
                <div className="text-muted">No insights available.</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Trend chart with metric toggles */}
      <Card className="mb-3">
        <Card.Body className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <Card.Title className="mb-0 d-flex align-items-center gap-2">
              <FaClock /> Trend
            </Card.Title>
            <div className="text-muted small">Toggle the metric shown in the chart.</div>
          </div>
          <MetricButtons metric={trendMetric} onChange={setTrendMetric} />
        </Card.Body>
        <Card.Body>
          <LogChartV2 logs={filteredLogs} metric={trendMetric} />
        </Card.Body>
      </Card>

      {/* Table */}
      <Card className="mb-3">
        <Card.Body>
          <Card.Title className="mb-3">Visitor Log Details</Card.Title>
          <LogTable logs={paginatedLogs} />
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="text-muted">
              Showing {paginatedLogs.length} of {filteredLogs.length} entries
            </div>
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default LogDashboard;