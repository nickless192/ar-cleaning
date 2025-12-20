import { useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

/**
 * Storage keys
 */
const LS_VISITOR_ID = 'visitorId';
const LS_SELF_TRACKING_DISABLED = 'disableVisitorTracking'; // set to "true" to stop tracking (admin/dev)
const SS_SESSION_ID = 'sessionId';
const SS_SESSION_STARTED_AT = 'sessionStart';
const SS_PATHS_VISITED = 'pathsVisited';
const SS_SENT_PAGEVIEWS = 'sentPageViews'; // dedupe per session

/**
 * Config
 */
const HEARTBEAT_SECONDS = 30; // optional - reduce to 0 to disable
const MAX_PATHS = 50;

const safeJsonParse = (str, fallback) => {
  if (!str) return fallback; // ✅ handles null, undefined, empty string
  try {
    const parsed = JSON.parse(str);
    return parsed ?? fallback; // ✅ handles JSON.parse("null") => null
  } catch {
    return fallback;
  }
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

const getPathsVisited = () =>
  safeJsonParse(sessionStorage.getItem(SS_PATHS_VISITED), []);

const addPathToVisited = (path) => {
  const paths = getPathsVisited();
  if (!paths.includes(path)) {
    const next = [...paths, path].slice(-MAX_PATHS);
    sessionStorage.setItem(SS_PATHS_VISITED, JSON.stringify(next));
  }
};

const getUTMParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get('utm_source'),
    medium: params.get('utm_medium'),
    campaign: params.get('utm_campaign'),
  };
};

const getTrafficSource = (referrer) => {
  if (!referrer) return 'direct';
  try {
    const hostname = new URL(referrer).hostname.toLowerCase();

    if (hostname.includes('google')) return 'organic';
    if (
      hostname.includes('facebook') ||
      hostname.includes('instagram') ||
      hostname.includes('tiktok')
    )
      return 'social';

    if (hostname === window.location.hostname.toLowerCase()) return 'internal';
    return 'referral';
  } catch {
    return 'referral';
  }
};

// --- Self-tracking prevention strategies ---
// 1) disable tracking flag in localStorage (easy admin toggle)
// 2) don't track in localhost/dev
// 3) optionally add a “known internal IP” rule on backend too (best place)
const shouldTrack = () => {
  const disabled = localStorage.getItem(LS_SELF_TRACKING_DISABLED) === 'true';
  if (disabled) return false;

  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') return false;

  return true;
};

// Beacon-first fetch helper for unload events
const send = (url, payload, { useBeacon = false } = {}) => {
  const body = JSON.stringify(payload);

  // try sendBeacon for unload/hidden events
  if (useBeacon && navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' });
    navigator.sendBeacon(url, blob);
    return;
  }

  // keepalive helps on page unload in modern browsers
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: useBeacon, // best-effort
  }).catch(() => {});
};

const VisitorCounter = ({ page }) => {
  const maxScrollRef = useRef(0);
  const lastActiveAtRef = useRef(Date.now());
  const heartbeatTimerRef = useRef(null);

  useEffect(() => {
    if (!shouldTrack()) return;

    const effectivePage = page || window.location.pathname;
    const visitorId = getOrCreateVisitorId();
    const sessionId = getOrCreateSessionId();

    // mark page path
    addPathToVisited(effectivePage);
    const pathsVisited = getPathsVisited();

    // returning visitor detection: visitorId exists => returning after first ever pageview
    const firstSeenKey = `firstSeenAt:${visitorId}`;
    const firstSeenAt =
      localStorage.getItem(firstSeenKey) || new Date().toISOString();
    if (!localStorage.getItem(firstSeenKey)) {
      localStorage.setItem(firstSeenKey, firstSeenAt);
    }
    const isReturningVisitor = localStorage.getItem(firstSeenKey) !== null;

    // Deduplicate: avoid sending the same pageview twice per session
    const sentMap = safeJsonParse(sessionStorage.getItem(SS_SENT_PAGEVIEWS), {});
    if (sentMap[effectivePage]) {
      // Still update pathsVisited on backend if you want, but skip counting.
      // If your backend supports "upsert by sessionId+page", you can still send as an update:
      send('/api/visitors/logs', {
        visitorId,
        sessionId,
        page: effectivePage,
        pathsVisited,
        lastSeenAt: new Date().toISOString(),
        // lightweight "update" payload
      });
      return;
    }
    sentMap[effectivePage] = true;
    sessionStorage.setItem(SS_SENT_PAGEVIEWS, JSON.stringify(sentMap));

    const screenResolution = `${window.screen.width}x${window.screen.height}`;
    const language = navigator.language;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const utm = getUTMParams();
    const referrer = document.referrer || null;
    const trafficSource = getTrafficSource(referrer);

    // initial pageview (count once)
    send('/api/visitors/logs', {
      visitorId,
      sessionId,
      page: effectivePage,
      userAgent: navigator.userAgent,
      pathsVisited,
      screenResolution,
      language,
      timezone,
      utm,
      referrer,
      trafficSource,
      isReturningVisitor,
      firstSeenAt,
      lastSeenAt: new Date().toISOString(),
      // optional fields to support better analytics:
      pageTitle: document.title,
    });

    // Track “active time” (optional): consider active if user interacts / scrolls.
    const markActive = () => {
      lastActiveAtRef.current = Date.now();
    };

    const onScroll = () => {
      markActive();
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const percent = Math.round((window.scrollY / docHeight) * 100);
      if (percent > maxScrollRef.current) maxScrollRef.current = percent;
    };

    const onClick = (e) => {
      markActive();

      // Track custom CTA interactions
      const trackEl = e.target.closest('[data-track]');
      if (trackEl) {
        const action = trackEl.getAttribute('data-track');
        send('/api/visitors/interaction', { sessionId, action });
      }

      // Track outbound clicks (growth insight)
      const link = e.target.closest('a[href]');
      if (link) {
        try {
          const url = new URL(link.href, window.location.href);
          const isOutbound = url.hostname !== window.location.hostname;
          if (isOutbound) {
            send('/api/visitors/interaction', {
              sessionId,
              action: 'outbound_click',
              meta: { href: url.href, hostname: url.hostname },
            });
          }
        } catch {
          // ignore
        }
      }
    };

    // Heartbeat: lets you compute "still here" and improves lastSeenAt accuracy
    const heartbeat = () => {
      const now = Date.now();
      const secondsSinceActive = Math.round((now - lastActiveAtRef.current) / 1000);

      // if user hasn't been active in a while, you may skip to reduce noise
      send('/api/visitors/session-heartbeat', {
        sessionId,
        page: effectivePage,
        lastSeenAt: new Date().toISOString(),
        secondsSinceActive,
        scrollDepth: maxScrollRef.current,
        pathsVisited: getPathsVisited(),
      });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // flush scroll + duration
        flush(true);
      } else {
        markActive();
      }
    };

    const flush = (useBeacon) => {
      const startedAt = Number(sessionStorage.getItem(SS_SESSION_STARTED_AT)) || Date.now();
      const durationSeconds = Math.max(0, Math.round((Date.now() - startedAt) / 1000));

      // Scroll depth
      send('/api/visitors/scroll-depth', {
        sessionId,
        scrollDepth: maxScrollRef.current,
      }, { useBeacon });

      // Duration
      send('/api/visitors/session-duration', {
        sessionId,
        duration: durationSeconds,
      }, { useBeacon });

      // Optional: page exit
      send('/api/visitors/session-exit', {
        sessionId,
        page: effectivePage,
        lastSeenAt: new Date().toISOString(),
      }, { useBeacon });
    };

    // register listeners once per mount
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('click', onClick);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('beforeunload', () => flush(true));

    // start heartbeat
    if (HEARTBEAT_SECONDS > 0) {
      heartbeatTimerRef.current = window.setInterval(
        heartbeat,
        HEARTBEAT_SECONDS * 1000
      );
    }

    return () => {
      // cleanup
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('click', onClick);
      document.removeEventListener('visibilitychange', onVisibilityChange);

      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }

      // flush on unmount (SPA route change)
      flush(false);
    };
  }, [page]);

  return null;
};

export default VisitorCounter;
