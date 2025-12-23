import React, { useMemo } from "react";
import { Card } from "react-bootstrap";

const clampNum = (n, fallback = 0) => {
  const x = Number(n);
  return Number.isFinite(x) ? x : fallback;
};

const getDayKey = (dateLike) => {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "invalid";
  return d.toISOString().slice(0, 10);
};

function aggregateByDay(logs) {
  const map = {};

  logs.forEach((l) => {
    const day = getDayKey(l.visitDate);
    if (day === "invalid") return;

    if (!map[day]) {
      map[day] = {
        visits: 0,
        humans: 0,
        qualified: 0,
        bounceRate: { bounces: 0, humans: 0 },
        avgEngagement: { sum: 0, humans: 0 },
        avgScroll: { sum: 0, humans: 0 },
        avgDuration: { sum: 0, humans: 0 },
      };
    }

    map[day].visits += 1;

    const isHuman = !l.isBot;
    if (isHuman) {
      map[day].humans += 1;

      // qualified
      if (l.qualified) map[day].qualified += 1;

      // bounce
      map[day].bounceRate.humans += 1;
      if (l.isBounce) map[day].bounceRate.bounces += 1;

      // engagement
      map[day].avgEngagement.humans += 1;
      map[day].avgEngagement.sum += clampNum(l.engagementScore, 0);

      // scroll
      map[day].avgScroll.humans += 1;
      map[day].avgScroll.sum += clampNum(l.scrollDepth, 0);

      // duration
      map[day].avgDuration.humans += 1;
      map[day].avgDuration.sum += clampNum(l.sessionDuration, 0);
    }
  });

  const days = Object.keys(map).sort();
  const series = days.map((day) => {
    const x = map[day];

    const bounceRate = x.bounceRate.humans
      ? (x.bounceRate.bounces / x.bounceRate.humans) * 100
      : 0;

    const avgEngagement = x.avgEngagement.humans
      ? x.avgEngagement.sum / x.avgEngagement.humans
      : 0;

    const avgScroll = x.avgScroll.humans ? x.avgScroll.sum / x.avgScroll.humans : 0;

    const avgDuration = x.avgDuration.humans
      ? x.avgDuration.sum / x.avgDuration.humans
      : 0;

    return {
      day,
      visits: x.visits,
      humans: x.humans,
      qualified: x.qualified,
      bounceRate,
      avgEngagement,
      avgScroll,
      avgDuration,
    };
  });

  return series;
}

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

const LogChart = ({ logs, metric = "visits" }) => {
  const data = useMemo(() => aggregateByDay(logs), [logs]);

  const { labels, values } = useMemo(() => {
    const labels = data.map((d) => d.day.slice(5)); // MM-DD
    const values = data.map((d) => {
      switch (metric) {
        case "humans": return d.humans;
        case "qualified": return d.qualified;
        case "bounceRate": return Number(d.bounceRate.toFixed(1));
        case "avgEngagement": return Number(d.avgEngagement.toFixed(1));
        case "avgScroll": return Number(d.avgScroll.toFixed(0));
        case "avgDuration": return Number(d.avgDuration.toFixed(0)); // seconds
        case "visits":
        default: return d.visits;
      }
    });

    return { labels, values };
  }, [data, metric]);

  if (!data.length) {
    return <div className="text-muted">No data for the selected filters.</div>;
  }

  const metricLabel = {
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
}

export default LogChart;