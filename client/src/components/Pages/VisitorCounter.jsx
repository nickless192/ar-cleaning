import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
// const expiry = 60 * 60 * 1000; // 1 hour
// const timestamp = localStorage.getItem('sessionTimestamp');
// // import Auth from 'utils/auth';

// if (!timestamp || Date.now() - timestamp > expiry) {
//     sessionStorage.removeItem('sessionId');
//     sessionStorage.removeItem('pathsVisited');
//     localStorage.setItem('sessionTimestamp', Date.now());
//   }

const getSessionId = () => {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
        sessionId = uuidv4();
        sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
}

const getPathsVisited = () => {
    let pathsVisited = JSON.parse(sessionStorage.getItem('pathsVisited'));
    if (!pathsVisited) {
        pathsVisited = [];
    }
    return pathsVisited;
}

const addPathToVisited = (newPath) => {
    const pathsVisited = getPathsVisited();
    if (!pathsVisited.includes(newPath)) {
        pathsVisited.push(newPath);
        sessionStorage.setItem('pathsVisited', JSON.stringify(pathsVisited));
    }
}

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

    const hostname = new URL(referrer).hostname;

    if (hostname.includes('google')) return 'organic';
    if (hostname.includes('facebook') || hostname.includes('instagram') || hostname.includes('tiktok')) return 'social';
    if (hostname === window.location.hostname) return 'internal';

    return 'referral';
};


const VisitorCounter = ({ page }) => {


    useEffect(() => {
        // Increment the visitor count silently
        // console.log('Incrementing visitor count for page:', page);    
        // console.log('Pathname:', window.location.pathname);  
        // Update the visited pages
        const sessionStart = Date.now();

        const sendSessionDuration = () => {
            const duration = Math.round((Date.now() - sessionStart) / 1000); // in seconds
            const sessionId = getSessionId();

            fetch('/api/visitors/session-duration', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, duration })
            });
        };

        window.addEventListener('beforeunload', sendSessionDuration);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') sendSessionDuration();
        });
        const effectivePage = page || window.location.pathname;
        addPathToVisited(window.location.pathname);
        const pathsVisited = getPathsVisited();  // Fetch paths visited from localStorage
        const sessionId = getSessionId();
        const screenResolution = `${window.screen.width}x${window.screen.height}`;
        const language = navigator.language;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const utm = getUTMParams();
        const referrer = document.referrer || null;
        const trafficSource = getTrafficSource(referrer);
        fetch('/api/visitors/logs/', {
            method: 'POST',
            body: JSON.stringify({
                page: effectivePage,
                userAgent: navigator.userAgent,
                sessionId,
                pathsVisited,
                screenResolution,
                language,
                timezone,
                utm,
                referrer,
                trafficSource
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return () => {
            window.removeEventListener('beforeunload', sendSessionDuration);
            document.removeEventListener('visibilitychange', sendSessionDuration);
        };
    }
        , [page]);

    useEffect(() => {
        let maxScroll = 0;

        const updateScrollDepth = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const percent = Math.round((scrollTop / docHeight) * 100);
            if (percent > maxScroll) maxScroll = percent;
        };

        const sendScrollDepth = () => {
            const sessionId = getSessionId();

            fetch('/api/visitors/scroll-depth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, scrollDepth: maxScroll })
            });
        };

        window.addEventListener('scroll', updateScrollDepth);
        window.addEventListener('beforeunload', sendScrollDepth);

        return () => {
            window.removeEventListener('scroll', updateScrollDepth);
            window.removeEventListener('beforeunload', sendScrollDepth);
        };
    }, []);

    useEffect(() => {
  const sessionStart = Date.now();

  const sendSessionDuration = () => {
    const duration = Math.round((Date.now() - sessionStart) / 1000); // in seconds
    const sessionId = getSessionId();

    fetch('/api/visitors/session-duration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, duration })
    });
  };

  window.addEventListener('beforeunload', sendSessionDuration);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') sendSessionDuration();
  });

  return () => {
    window.removeEventListener('beforeunload', sendSessionDuration);
    document.removeEventListener('visibilitychange', sendSessionDuration);
  };
}, []);


useEffect(() => {
  let maxScroll = 0;

  const updateScrollDepth = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = Math.round((scrollTop / docHeight) * 100);
    console.log('Scroll percent:', percent); // Debugging line
    console.log('Max scroll so far:', maxScroll); // Debugging line
    console.log('Document height:', docHeight); // Debugging line
    console.log('Scroll top:', scrollTop); // Debugging line
    if (percent > maxScroll) maxScroll = percent;
  };

  const sendScrollDepth = () => {
    const sessionId = getSessionId();

    fetch('/api/visitors/scroll-depth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, scrollDepth: maxScroll })
    });
  };

  window.addEventListener('scroll', updateScrollDepth);
  window.addEventListener('beforeunload', sendScrollDepth);

  return () => {
    window.removeEventListener('scroll', updateScrollDepth);
    window.removeEventListener('beforeunload', sendScrollDepth);
  };
}, []);


useEffect(() => {
  const handleClick = (e) => {
    const target = e.target.closest('[data-track]');
    if (!target) return;

    const sessionId = getSessionId();
    const action = target.getAttribute('data-track');

    fetch('/api/visitors/interaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, action })
    });
  };

  window.addEventListener('click', handleClick);
  return () => window.removeEventListener('click', handleClick);
}, []);



    return null; // No UI component is displayed
};

export default VisitorCounter;
