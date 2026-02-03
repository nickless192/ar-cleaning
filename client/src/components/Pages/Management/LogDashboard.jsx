// LogDashboard.jsx (DROP-IN)
// Server-driven analytics (weekly-reporting) + server-driven log table (logs)
// Uses MiniBars chart (no chart libs). Keeps your FilterBar + LogTable + Pagination components.
//
// Requirements on backend:
// ✅ GET /api/visitors/weekly-reporting?end=YYYY-MM-DD&days=7&excludeBots=true&... (your getWeeklyReport)
// ✅ GET /api/visitors/logs?start=YYYY-MM-DD&end=YYYY-MM-DD&excludeBots=true&limit=10&pageNum=1&... (paginated getVisits I gave you)
//
// Components expected to exist:
// ./ExportCSV.jsx
// ./ReportDownloadButton.jsx
// ./CustomPagination.jsx
// ./LogTable.jsx   (you provided)
// ./FilterBar.jsx  (your FilterBar component)
//
// Notes:
// - This file does NOT rely on client-side computeStats or client-side aggregation.
// - Filter options are still computed from a small "options sample" set of logs.
// - Trend uses report.dailyTrend from backend.

import React, { useEffect, useMemo, useState } from "react";
import { Row, Col, Card, Spinner, Badge, Button, ButtonGroup } from "react-bootstrap";

import ExportCSV from "./ExportCSV.jsx";
import ReportDownloadButton from "./ReportDownloadButton.jsx";
import CustomPagination from "./CustomPagination.jsx";
import LogTable from "./LogTable.jsx";
import FilterBar from "./FilterBar.jsx";

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

/** -------------------------
 * helpers
 * ------------------------- */
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

const uniq = (arr) => [...new Set((arr || []).filter(Boolean))];

const pct = (num, den) => (den ? (num / den) * 100 : 0);

const safeArr = (x) => (Array.isArray(x) ? x : []);

// server returns objects like: { _id: "/index", count: 12 } etc
const normalizeTopList = (items, keyName) =>
  safeArr(items).map((it) => ({
    [keyName]: it?.[keyName] ?? it?._id ?? "unknown",
    count: Number(it?.count ?? 0),
  }));

// Some of your weekly report lists are returned as:
// topPages: [{_id:"/index",count:10}]  OR already {page:"/index",count:10} depending on pipeline.
// We'll support both by mapping based on the labelField in ListWithBadges below.
const coerceList = (items, labelField) =>
  safeArr(items).map((it) => {
    if (it && typeof it === "object") {
      // if already contains labelField, keep it
      if (it[labelField] != null) return it;
      // else try _id
      return { [labelField]: it._id ?? "unknown", count: it.count ?? 0 };
    }
    return { [labelField]: String(it), count: 1 };
  });

const buildDaysFromRange = (startISO, endISO) => {
  // inclusive day count
  const s = new Date(`${startISO}T00:00:00`);
  const e = new Date(`${endISO}T00:00:00`);
  const diff = Math.round((e - s) / 86400000);
  return Math.max(1, Math.min(31, diff + 1));
};

const titleCase = (s) => String(s || "").replace(/(^|\s)\S/g, (t) => t.toUpperCase());

/** -------------------------
 * UI components
 * ------------------------- */
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

const ListWithBadges = ({ title, items, keyField, labelField }) => {
  const safe = useMemo(() => coerceList(items, labelField), [items, labelField]);

  return (
    <Card className="h-100">
      <Card.Body>
        <Card.Title className="mb-3">{title}</Card.Title>
        {safe?.length ? (
          <ul className="list-unstyled mb-0">
            {safe.map((it, idx) => {
              const key = it?.[keyField] ?? it?.[labelField] ?? idx;
              const label = it?.[labelField] ?? "unknown";
              const count = Number(it?.count ?? 0);

              return (
                <li key={key} className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-truncate" style={{ maxWidth: "75%" }}>
                    {String(label)}
                  </span>
                  <Badge bg="light" text="dark">
                    {count}
                  </Badge>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-muted">No data</div>
        )}
      </Card.Body>
    </Card>
  );
};

// Simple inline bar chart (no libs)
function MiniBars({ values }) {
  const max = Math.max(...values, 1);
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 120 }}>
      {values.map((v, i) => (
        <div
          key={i}
          title={String(v)}
          style={{
            width: 14,
            height: `${(v / max) * 100}%`,
            background: "rgba(13,110,253,0.75)",
            borderRadius: 6,
          }}
        />
      ))}
    </div>
  );
}

const TrendMiniBarChart = ({ dailyTrend, metric = "visits" }) => {
  const data = useMemo(() => safeArr(dailyTrend), [dailyTrend]);

  const { labels, values } = useMemo(() => {
    const labels = data.map((d) => String(d.day || "").slice(5)); // MM-DD
    const values = data.map((d) => {
      switch (metric) {
        case "humans":
          return Number(d.humans ?? 0);
        case "qualified":
          return Number(d.qualified ?? 0);
        case "bounceRate":
          return Number(Number(d.bounceRate ?? 0).toFixed(1));
        case "avgEngagement":
          return Number(Number(d.avgEngagement ?? 0).toFixed(1));
        case "avgScroll":
          return Number(Number(d.avgScroll ?? 0).toFixed(0));
        case "avgDuration":
          return Number(Number(d.avgDuration ?? 0).toFixed(0));
        case "visits":
        default:
          return Number(d.visits ?? 0);
      }
    });

    return { labels, values };
  }, [data, metric]);

  if (!data.length) {
    return <div className="text-muted">No data for the selected filters.</div>;
  }

  const metricLabel =
    {
      visits: "Visits",
      humans: "Human Visits",
      qualified: "Qualified Sessions",
      bounceRate: "Bounce Rate %",
      avgEngagement: "Avg Engagement Score",
      avgScroll: "Avg Scroll Depth %",
      avgDuration: "Avg Session Duration (sec)",
    }[metric] || "Metric";

  return (
    <div>
      <div className="text-muted small mb-2">{metricLabel}</div>
      <MiniBars values={values} />
      <div className="d-flex flex-wrap gap-2 mt-3">
        {labels.map((l, i) => (
          <span key={i} className="badge bg-light text-dark">
            {l}: {values[i]}
          </span>
        ))}
      </div>
    </div>
  );
};

/** -------------------------
 * Main
 * ------------------------- */
const LogDashboard = () => {
  // report (weekly-reporting)
  const [report, setReport] = useState(null);
  const [isReportLoading, setIsReportLoading] = useState(true);

  // table (paginated logs)
  const [tableData, setTableData] = useState({ items: [], total: 0, totalPages: 1 });
  const [isTableLoading, setIsTableLoading] = useState(false);

  // We still keep a small options-sample of logs to populate filter dropdown values.
  // We'll fetch only the most recent 200 logs for options.
  const [logsForOptions, setLogsForOptions] = useState([]);
  const [pages, setPages] = useState([]);

  // filters
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedPage, setSelectedPage] = useState("");

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

  // trend metric toggle
  const [trendMetric, setTrendMetric] = useState("visits");

  // pagination for table
  const [tablePage, setTablePage] = useState(1);
  const [tableLimit] = useState(10);

  const [error, setError] = useState("");

  const [sendingReport, setSendingReport] = useState(false);
  const [reportStatus, setReportStatus] = useState(null);

  const sendTestEventsReport = async () => {
    setSendingReport(true);
    setReportStatus(null);

    try {
      const res = await fetch("/api/admin-reports/send-daily-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // optional override:
        // body: JSON.stringify({ date: "2026-02-01" })
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "Failed to send report");
      }

      setReportStatus({
        type: "success",
        message: `Report sent successfully (${data.date})`,
      });
    } catch (err) {
      console.error(err);
      setReportStatus({
        type: "error",
        message: err.message || "Error sending report",
      });
    } finally {
      setSendingReport(false);
    }
  };


  const buildCommonParams = () => {
    const params = new URLSearchParams();

    // date range (YYYY-MM-DD)
    if (dateRange.start) params.set("start", dateRange.start);
    if (dateRange.end) params.set("end", dateRange.end);

    params.set("excludeBots", String(excludeBots));
    if (qualifiedOnly) params.set("qualifiedOnly", "true");

    if (selectedPage) params.set("page", selectedPage);
    if (countryFilter) params.set("country", countryFilter);
    if (deviceFilter) params.set("deviceType", deviceFilter);
    if (browserFilter) params.set("browser", browserFilter);
    if (osFilter) params.set("os", osFilter);
    if (segmentFilter) params.set("segment", segmentFilter);
    if (trafficSourceFilter) params.set("trafficSource", trafficSourceFilter);

    if (utmSourceFilter) params.set("utmSource", utmSourceFilter);
    if (utmMediumFilter) params.set("utmMedium", utmMediumFilter);
    if (utmCampaignFilter) params.set("utmCampaign", utmCampaignFilter);

    // optional server-side visitor type (if you implemented in getVisits)
    if (visitorTypeFilter) params.set("visitorType", visitorTypeFilter);

    return params;
  };

  // init default date range (last 7 days)
  useEffect(() => {
    const now = new Date();
    const end = now.toISOString().slice(0, 10);
    const start = new Date(now.getTime() - 6 * 86400000).toISOString().slice(0, 10);
    setDateRange({ start, end });
  }, []);

  // Fetch a small options sample for dropdowns (pages, countries, etc)
  useEffect(() => {
    let cancelled = false;

    const fetchOptionsSample = async () => {
      try {
        // use a broad window (last 31 days) for richer filter options
        const now = new Date();
        const end = now.toISOString().slice(0, 10);
        const start = new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10);

        const params = new URLSearchParams();
        params.set("start", start);
        params.set("end", end);
        params.set("excludeBots", "false"); // include bots for options
        params.set("limit", "200");
        params.set("pageNum", "1");
        params.set("sort", "desc");

        const res = await fetch(`/api/visitors/logs?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch logs (options sample)");
        const data = await res.json();

        if (cancelled) return;

        const items = safeArr(data.items);
        setLogsForOptions(items);
        setPages(uniq(items.map((l) => l.page)).sort((a, b) => String(a).localeCompare(String(b))));
      } catch (e) {
        if (!cancelled) console.error(e);
      }
    };

    fetchOptionsSample();
    return () => {
      cancelled = true;
    };
  }, []);

  // reset table page on any filter change
  useEffect(() => {
    setTablePage(1);
  }, [
    dateRange.start,
    dateRange.end,
    selectedPage,
    excludeBots,
    qualifiedOnly,
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
    minEngagement,
    scrollMin,
    scrollMax,
  ]);

  // weekly report fetch (server)
  useEffect(() => {
    if (!dateRange.start || !dateRange.end) return;

    let cancelled = false;

    const fetchReport = async () => {
      setIsReportLoading(true);
      setError("");

      try {
        const params = buildCommonParams();

        // weekly-reporting expects end + days (your controller)
        const days = buildDaysFromRange(dateRange.start, dateRange.end);
        params.set("end", dateRange.end);
        params.set("days", String(days));

        // weekly-reporting doesn't use start; keep request clean
        params.delete("start");

        const res = await fetch(`/api/visitors/weekly-reporting?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch weekly report");
        const data = await res.json();

        if (!cancelled) setReport(data);
      } catch (e) {
        if (!cancelled) setError(e.message || "Error loading report");
      } finally {
        if (!cancelled) setIsReportLoading(false);
      }
    };

    fetchReport();
    return () => {
      cancelled = true;
    };
  }, [
    dateRange.start,
    dateRange.end,
    selectedPage,
    excludeBots,
    qualifiedOnly,
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
  ]);

  // table logs fetch (server)
  useEffect(() => {
    if (!dateRange.start || !dateRange.end) return;

    let cancelled = false;

    const fetchTable = async () => {
      setIsTableLoading(true);
      setError("");

      try {
        const params = buildCommonParams();

        // server-side pagination
        params.set("limit", String(tableLimit));
        params.set("pageNum", String(tablePage));
        params.set("sort", "desc");

        // include numeric filters if you want them server-side later.
        // For now, keep them client-side on the returned page only (lightweight).
        // If you want full accuracy, add these to backend match and remove client filtering.
        const res = await fetch(`/api/visitors/logs?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch logs");
        const data = await res.json();

        if (!cancelled) {
          let items = safeArr(data.items);

          // Apply optional thresholds locally (only affects current page of results)
          // If you want these to affect totals + report, move them to backend and weekly-reporting.
          if (minEngagement !== "" && minEngagement != null) {
            const minE = clampNum(minEngagement, 0);
            items = items.filter((l) => clampNum(l.engagementScore, 0) >= minE);
          }
          const sMin = scrollMin === "" ? null : clampNum(scrollMin, 0);
          const sMax = scrollMax === "" ? null : clampNum(scrollMax, 100);
          if (sMin != null) items = items.filter((l) => clampNum(l.scrollDepth, 0) >= sMin);
          if (sMax != null) items = items.filter((l) => clampNum(l.scrollDepth, 0) <= sMax);

          setTableData({
            items,
            total: Number(data.total ?? 0),
            totalPages: Number(data.totalPages ?? 1),
          });
        }
      } catch (e) {
        if (!cancelled) setError(e.message || "Error loading logs");
      } finally {
        if (!cancelled) setIsTableLoading(false);
      }
    };

    fetchTable();
    return () => {
      cancelled = true;
    };
  }, [
    dateRange.start,
    dateRange.end,
    selectedPage,
    excludeBots,
    qualifiedOnly,
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
    minEngagement,
    scrollMin,
    scrollMax,
    tablePage,
    tableLimit,
  ]);

  const h = report?.headline || null;

  // Derived headline numbers (safe)
  const headline = useMemo(() => {
    const totalSessions = Number(h?.totalSessions ?? 0);
    const humanSessions = Number(h?.humanSessions ?? 0);
    const botSessions = Number(h?.botSessions ?? Math.max(0, totalSessions - humanSessions));
    const uniqueVisitors = Number(h?.uniqueVisitors ?? 0);

    const qualifiedSessions = Number(h?.qualifiedSessions ?? 0);
    const qualifiedRate = Number(h?.qualifiedRate ?? pct(qualifiedSessions, humanSessions));

    const bounceRate = Number(h?.bounceRate ?? 0);

    const avgEngagementScore = Number(h?.avgEngagementScore ?? 0);
    const avgScrollDepth = Number(h?.avgScrollDepth ?? 0);
    const avgSessionDuration = Number(h?.avgSessionDuration ?? 0);
    const avgPagesPerSession = Number(h?.avgPagesPerSession ?? 0);

    const totalActions = Number(h?.totalActions ?? 0);
    const avgActions = Number(h?.avgActions ?? 0);

    return {
      totalSessions,
      humanSessions,
      botSessions,
      uniqueVisitors,
      qualifiedSessions,
      qualifiedRate,
      bounceRate,
      avgEngagementScore,
      avgScrollDepth,
      avgSessionDuration,
      avgPagesPerSession,
      totalActions,
      avgActions,
    };
  }, [h]);

  // Insights (server-ish): generate from headline + top items
  const insights = useMemo(() => {
    const out = [];

    if (!headline.totalSessions) {
      out.push("No activity for the selected filters and date range.");
      return out;
    }

    out.push(
      `Traffic: ${headline.totalSessions} sessions (${headline.humanSessions} human, ${headline.botSessions} bot). Unique visitors: ${headline.uniqueVisitors}.`
    );

    out.push(`Quality: ${headline.qualifiedSessions} qualified sessions (${headline.qualifiedRate.toFixed(1)}% of human).`);

    const bounceLabel = headline.bounceRate > 70 ? "high" : headline.bounceRate < 40 ? "healthy" : "moderate";
    out.push(`Bounce rate is ${bounceLabel} at ${headline.bounceRate.toFixed(1)}%.`);

    out.push(
      `Engagement: avg score ${headline.avgEngagementScore.toFixed(1)}, avg scroll ${headline.avgScrollDepth.toFixed(
        0
      )}%, avg session ${formatDuration(headline.avgSessionDuration)}.`
    );

    const topTraffic = safeArr(report?.topTrafficSources)?.[0];
    if (topTraffic) out.push(`Top traffic source: ${topTraffic._id ?? topTraffic.source} (${topTraffic.count}).`);

    const topCampaign = safeArr(report?.topUtmCampaigns)?.[0];
    if (topCampaign) out.push(`Top UTM campaign: ${topCampaign._id ?? topCampaign.utmCampaign} (${topCampaign.count}).`);

    const topCountry = safeArr(report?.topCountries)?.[0];
    if (topCountry) out.push(`Top location: ${topCountry._id ?? topCountry.country} (${topCountry.count}).`);

    const topReason = safeArr(report?.qualifiedReasons)?.[0];
    if (topReason) out.push(`Most common qualification reason: "${topReason._id ?? topReason.reason}" (${topReason.count}).`);

    return out;
  }, [headline, report]);

  const isLoading = isReportLoading && !report;

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
          <div className="text-muted small">Server-driven KPIs, trend and logs. Bots can be excluded.</div>
          {error ? <div className="text-danger small mt-1">{error}</div> : null}
        </div>
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <ExportCSV logs={tableData.items} />
          <ReportDownloadButton />

          <Button
            variant="outline-primary"
            size="sm"
            disabled={sendingReport}
            onClick={sendTestEventsReport}
          >
            {sendingReport ? "Sending…" : "Send Events Report"}
          </Button>
        </div>

      </div>

      {/* Filters */}
      <FilterBar
        logs={logsForOptions}
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
              <h3 className="mb-0">{headline.totalSessions}</h3>
              <div className="text-muted small">Unique Visitors: {headline.uniqueVisitors}</div>
              {isReportLoading ? <div className="text-muted small mt-2">Updating…</div> : null}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <FaRobot size={22} className="mb-2 text-secondary" />
              <div className="text-muted small">Bots vs Humans</div>
              <h3 className="mb-0">{headline.humanSessions}</h3>
              <div className="text-muted small">Human sessions</div>
              <div className="small">
                Bots: <b>{headline.botSessions}</b>
              </div>
              {isReportLoading ? <div className="text-muted small mt-2">Updating…</div> : null}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <FaCheckCircle size={22} className="mb-2 text-success" />
              <div className="text-muted small">Qualified Sessions</div>
              <h3 className="mb-0">{headline.qualifiedSessions}</h3>
              <div className="text-muted small">Rate: {headline.qualifiedRate.toFixed(1)}%</div>
              {isReportLoading ? <div className="text-muted small mt-2">Updating…</div> : null}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <FaStar size={22} className="mb-2 text-warning" />
              <div className="text-muted small">Avg Engagement Score</div>
              <h3 className="mb-0">{headline.avgEngagementScore.toFixed(1)}</h3>
              <div className="text-muted small">Avg actions: {headline.avgActions.toFixed(1)}</div>
              {isReportLoading ? <div className="text-muted small mt-2">Updating…</div> : null}
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
                  <h4>{headline.bounceRate.toFixed(1)}%</h4>
                </div>
                <div>
                  <div className="text-muted small">Avg Duration</div>
                  <h4>{formatDuration(headline.avgSessionDuration)}</h4>
                </div>
                <div>
                  <div className="text-muted small">Pages / Session</div>
                  <h4>{headline.avgPagesPerSession.toFixed(1)}</h4>
                </div>
              </div>

              <div className="d-flex justify-content-between mt-3">
                <div>
                  <div className="text-muted small">Avg Scroll</div>
                  <h5 className="d-flex align-items-center gap-2">
                    <FaScroll /> {headline.avgScrollDepth.toFixed(0)}%
                  </h5>
                </div>
                <div>
                  <div className="text-muted small">Actions</div>
                  <h5 className="d-flex align-items-center gap-2">
                    <FaMousePointer /> {headline.totalActions}
                  </h5>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} md={6}>
          <ListWithBadges title="Top Pages" items={report?.topPages} keyField="page" labelField="page" />
        </Col>

        <Col lg={4} md={12}>
          <ListWithBadges title="Top Exit Pages" items={report?.topExitPages} keyField="exitPage" labelField="exitPage" />
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
                {safeArr(report?.topCountries).slice(0, 5).map((c, idx) => {
                  const country = c.country ?? c._id ?? "unknown";
                  return (
                    <div key={`${country}-${idx}`} className="d-flex justify-content-between">
                      <span>{country}</span>
                      <Badge bg="light" text="dark">
                        {c.count ?? 0}
                      </Badge>
                    </div>
                  );
                })}
              </div>

              <hr />

              {/* Device breakdown may not be in weekly report; show "n/a" gracefully */}
              <div className="text-muted small mb-1">Devices</div>
              <div className="d-flex justify-content-between">
                <div>
                  <div className="text-muted small">Desktop</div>
                  <b>{safeArr(report?.topDevices).find((x) => (x.deviceType ?? x._id) === "desktop")?.count ?? 0}</b>
                </div>
                <div>
                  <div className="text-muted small">Mobile</div>
                  <b>{safeArr(report?.topDevices).find((x) => (x.deviceType ?? x._id) === "mobile")?.count ?? 0}</b>
                </div>
                <div>
                  <div className="text-muted small">Tablet</div>
                  <b>{safeArr(report?.topDevices).find((x) => (x.deviceType ?? x._id) === "tablet")?.count ?? 0}</b>
                </div>
              </div>

              <hr />

              <div className="text-muted small mb-1">Top Browsers</div>
              {safeArr(report?.topBrowsers).slice(0, 4).map((b, idx) => {
                const browser = b.browser ?? b._id ?? "unknown";
                return (
                  <div key={`${browser}-${idx}`} className="d-flex justify-content-between">
                    <span>{browser}</span>
                    <Badge bg="light" text="dark">
                      {b.count ?? 0}
                    </Badge>
                  </div>
                );
              })}

              <div className="text-muted small mt-3 mb-1">Top OS</div>
              {safeArr(report?.topOS).slice(0, 4).map((o, idx) => {
                const os = o.os ?? o._id ?? "unknown";
                return (
                  <div key={`${os}-${idx}`} className="d-flex justify-content-between">
                    <span>{os}</span>
                    <Badge bg="light" text="dark">
                      {o.count ?? 0}
                    </Badge>
                  </div>
                );
              })}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} md={6}>
          <ListWithBadges title="Traffic Sources" items={report?.topTrafficSources} keyField="source" labelField="source" />
        </Col>

        <Col lg={4} md={12}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>UTM Breakdown</Card.Title>

              <div className="mt-2">
                <div className="text-muted small mb-1">Top Campaigns</div>
                {safeArr(report?.topUtmCampaigns).slice(0, 6).map((x, idx) => {
                  const campaign = x.utmCampaign ?? x._id ?? "unknown";
                  return (
                    <div key={`${campaign}-${idx}`} className="d-flex justify-content-between">
                      <span className="text-truncate" style={{ maxWidth: "75%" }}>
                        {campaign}
                      </span>
                      <Badge bg="light" text="dark">
                        {x.count ?? 0}
                      </Badge>
                    </div>
                  );
                })}
              </div>

              <hr />

              <Row>
                <Col md={6}>
                  <div className="text-muted small mb-1">Top Sources</div>
                  {safeArr(report?.topUtmSources).slice(0, 4).map((x, idx) => {
                    const src = x.utmSource ?? x._id ?? "unknown";
                    return (
                      <div key={`${src}-${idx}`} className="d-flex justify-content-between">
                        <span className="text-truncate" style={{ maxWidth: "70%" }}>
                          {src}
                        </span>
                        <Badge bg="light" text="dark">
                          {x.count ?? 0}
                        </Badge>
                      </div>
                    );
                  })}
                </Col>
                <Col md={6}>
                  <div className="text-muted small mb-1">Top Mediums</div>
                  {safeArr(report?.topUtmMediums).slice(0, 4).map((x, idx) => {
                    const med = x.utmMedium ?? x._id ?? "unknown";
                    return (
                      <div key={`${med}-${idx}`} className="d-flex justify-content-between">
                        <span className="text-truncate" style={{ maxWidth: "70%" }}>
                          {med}
                        </span>
                        <Badge bg="light" text="dark">
                          {x.count ?? 0}
                        </Badge>
                      </div>
                    );
                  })}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Referrers / Segments / Qualified reasons */}
      <Row className="g-3 mb-3">
        <Col lg={4} md={6}>
          <ListWithBadges title="Top Referrers" items={report?.topReferrers} keyField="referrer" labelField="referrer" />
        </Col>
        <Col lg={4} md={6}>
          <ListWithBadges title="Top Segments" items={report?.topSegments} keyField="segment" labelField="segment" />
        </Col>
        <Col lg={4} md={12}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title className="d-flex align-items-center gap-2">
                <FaSignOutAlt /> Qualified Reasons
              </Card.Title>
              {safeArr(report?.qualifiedReasons)?.length ? (
                <ul className="list-unstyled mb-0 mt-2">
                  {safeArr(report?.qualifiedReasons).map((r, idx) => {
                    const reason = r.reason ?? r._id ?? "unknown";
                    return (
                      <li key={`${reason}-${idx}`} className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-truncate" style={{ maxWidth: "75%" }}>
                          {reason}
                        </span>
                        <Badge bg="light" text="dark">
                          {r.count ?? 0}
                        </Badge>
                      </li>
                    );
                  })}
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
                  {insights.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
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
          <TrendMiniBarChart dailyTrend={report?.dailyTrend || []} metric={trendMetric} />
        </Card.Body>
      </Card>

      {/* Table */}
      <Card className="mb-3">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
            <Card.Title className="mb-0">Visitor Log Details</Card.Title>
            {isTableLoading ? (
              <div className="d-flex align-items-center gap-2 text-muted small">
                <Spinner animation="border" size="sm" />
                Loading table…
              </div>
            ) : null}
          </div>

          <LogTable logs={tableData.items} />

          <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
            <div className="text-muted">
              Showing {tableData.items.length} of {tableData.total} entries
            </div>

            <CustomPagination
              currentPage={tablePage}
              totalPages={tableData.totalPages}
              onPageChange={setTablePage}
            />
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default LogDashboard;
