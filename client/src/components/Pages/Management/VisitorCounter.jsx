import { useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

/**
 * Storage keys
 */
const LS_VISITOR_ID = "visitorId";
const LS_SELF_TRACKING_DISABLED = "disableVisitorTracking"; // "true" => stop tracking
const SS_SESSION_ID = "sessionId";
const SS_SESSION_STARTED_AT = "sessionStart";
const SS_PATHS_VISITED = "pathsVisited";
const SS_SENT_PAGEVIEWS = "sentPageViews"; // dedupe per session

/**
 * Config
 */
const HEARTBEAT_SECONDS = 30; // set 0 to disable
const MAX_PATHS = 50;

/**
 * Utilities
 */
const safeJsonParse = (str, fallback) => {
  if (!str) return fallback;
  try {
    const parsed = JSON.parse(str);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const normalizePage = (p) => {
  if (!p) return p;
  const s = String(p).trim();
  if (!s) return s;
  return s.startsWith("/") ? s : `/${s}`;
};

const getOrCreateVisitorId = () => {
  let id = localStorage.getItem(LS_VISITOR_ID);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(LS_VISITOR_ID, id);
  }
  return id;
};

const getOrCreateSessionId = () => {
  let sessionId = sessionStorage.getItem(SS_SESSION_ID);
  if (!sessionId) {
    sessionId = uuidv4();
    sessionStorage.setItem(SS_SESSION_ID, sessionId);
    sessionStorage.setItem(SS_SESSION_STARTED_AT, String(Date.now()));
    sessionStorage.setItem(SS_PATHS_VISITED, JSON.stringify([]));
    sessionStorage.setItem(SS_SENT_PAGEVIEWS, JSON.stringify({}));
  }
  return sessionId;
};

const getPathsVisited = () => safeJsonParse(sessionStorage.getItem(SS_PATHS_VISITED), []);

const addPathToVisited = (path) => {
  const p = normalizePage(path);
  if (!p) return;

  const paths = getPathsVisited();
  // Keep order, avoid duplicates
  const next = paths.filter((x) => x !== p).concat(p).slice(-MAX_PATHS);
  sessionStorage.setItem(SS_PATHS_VISITED, JSON.stringify(next));
};

const getUTMParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get("utm_source") || undefined,
    medium: params.get("utm_medium") || undefined,
    campaign: params.get("utm_campaign") || undefined,
  };
};

const getTrafficSource = (referrer) => {
  if (!referrer) return "direct";
  try {
    const hostname = new URL(referrer).hostname.toLowerCase();

    if (hostname.includes("google")) return "organic";
    if (hostname.includes("facebook") || hostname.includes("instagram") || hostname.includes("tiktok")) return "social";

    if (hostname === window.location.hostname.toLowerCase()) return "internal";
    return "referral";
  } catch {
    return "referral";
  }
};

const shouldTrack = () => {
  return localStorage.getItem(LS_SELF_TRACKING_DISABLED) !== "true";
};


// send helper: beacon-first optional
const send = (url, payload, { useBeacon = false } = {}) => {
  const body = JSON.stringify(payload);

  if (useBeacon && navigator.sendBeacon) {
    try {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(url, blob);
      return;
    } catch {
      // fallback below
    }
  }

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: useBeacon,
  }).catch(() => {});
};

// Optional helper for events
const logEvent = (sessionId, { name, label, page, meta }, { useBeacon = false } = {}) => {
  if (!sessionId || !name) return;
  send(
    "/api/visitors/log-event",
    {
      sessionId,
      name,
      label,
      page: page ? normalizePage(page) : undefined,
      meta: meta && typeof meta === "object" ? meta : undefined,
    },
    { useBeacon }
  );
};

const VisitorCounter = ({ page }) => {
  const maxScrollRef = useRef(0);
  const lastActiveAtRef = useRef(Date.now());
  const heartbeatTimerRef = useRef(null);

  // StrictMode dedupe (React 18 mounts twice in dev)
  const didInitRef = useRef(false);

  useEffect(() => {
    if (!shouldTrack()) return;

    // Prevent double-run within same session+page (StrictMode / re-mount)
    if (didInitRef.current) return;
    didInitRef.current = true;

    const effectivePage = normalizePage(page || window.location.pathname);
    const visitorId = getOrCreateVisitorId();
    const sessionId = getOrCreateSessionId();

    // pathsVisited tracking (client-side list, backend also stores)
    addPathToVisited(effectivePage);

    // Deduplicate: avoid sending same pageview twice per session
    const sentMap = safeJsonParse(sessionStorage.getItem(SS_SENT_PAGEVIEWS), {});
    const sentKey = effectivePage || "__unknown__";
    if (sentMap[sentKey]) {
      // still update lastSeen / pathsVisited on backend
      send("/api/visitors/logs", {
        visitorId,
        sessionId,
        page: effectivePage,
        pathsVisited: getPathsVisited(),
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        utm: getUTMParams(),
        referrer: document.referrer || null,
        trafficSource: getTrafficSource(document.referrer || null),
        pageTitle: document.title,
      });
      return;
    }
    sentMap[sentKey] = true;
    sessionStorage.setItem(SS_SENT_PAGEVIEWS, JSON.stringify(sentMap));

    // Initial logVisit (backend decides returning visitor via VisitorIdentity)
    send("/api/visitors/logs", {
      visitorId,
      sessionId,
      page: effectivePage,
      userAgent: navigator.userAgent,
      pathsVisited: getPathsVisited(),
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      utm: getUTMParams(),
      referrer: document.referrer || null,
      trafficSource: getTrafficSource(document.referrer || null),
      pageTitle: document.title,
    });

    // Optional: track page view as an event (nice for event analytics)
    logEvent(sessionId, { name: "page_view", page: effectivePage });

    const markActive = () => {
      lastActiveAtRef.current = Date.now();
    };

    const onScroll = () => {
      markActive();
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const percent = Math.round((window.scrollY / docHeight) * 100);
      if (percent > maxScrollRef.current) maxScrollRef.current = percent;
    };

    // Click tracking:
    // - Any element with data-track => event name
    // - Outbound links => outbound_click event
    const onClick = (e) => {
      markActive();

      const trackEl = e.target.closest?.("[data-track]");
      if (trackEl) {
        const name = trackEl.getAttribute("data-track");
        const label = trackEl.getAttribute("data-track-label") || undefined;
        logEvent(sessionId, { name, label, page: effectivePage });
      }

      const link = e.target.closest?.("a[href]");
      if (link) {
        try {
          const url = new URL(link.href, window.location.href);
          const isOutbound = url.hostname !== window.location.hostname;
          if (isOutbound) {
            logEvent(sessionId, {
              name: "outbound_click",
              page: effectivePage,
              meta: { href: url.href, hostname: url.hostname },
            });
          }
        } catch {
          // ignore
        }
      }
    };

    // Heartbeat: backend computes duration from firstSeenAt, so just send lastSeen + scroll + paths
    const heartbeat = () => {
      send("/api/visitors/session-heartbeat", {
        sessionId,
        lastSeenAt: new Date().toISOString(),
        scrollDepth: maxScrollRef.current,
        pathsVisited: getPathsVisited(),
        page: effectivePage,
        secondsSinceActive: Math.round((Date.now() - lastActiveAtRef.current) / 1000),
      });
    };

    const flushExit = (useBeacon) => {
      // Final heartbeat snapshot (optional but nice)
      send(
        "/api/visitors/session-heartbeat",
        {
          sessionId,
          lastSeenAt: new Date().toISOString(),
          scrollDepth: maxScrollRef.current,
          pathsVisited: getPathsVisited(),
          page: effectivePage,
        },
        { useBeacon }
      );

      // Finalize session (backend computes duration + bounce + score)
      send(
        "/api/visitors/session-exit",
        {
          sessionId,
          page: effectivePage,
          lastSeenAt: new Date().toISOString(),
        },
        { useBeacon }
      );
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushExit(true);
      } else {
        markActive();
      }
    };

    // pagehide is more reliable than beforeunload
    const onPageHide = () => flushExit(true);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("click", onClick);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);

    if (HEARTBEAT_SECONDS > 0) {
      heartbeatTimerRef.current = window.setInterval(heartbeat, HEARTBEAT_SECONDS * 1000);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("click", onClick);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);

      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }

      // SPA route change / component unmount: finalize without beacon
      flushExit(false);
    };
  }, [page]);

  return null;
};

export default VisitorCounter;
