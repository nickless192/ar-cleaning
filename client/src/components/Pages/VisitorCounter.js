import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
const expiry = 60 * 60 * 1000; // 1 hour
const timestamp = localStorage.getItem('sessionTimestamp');
// import Auth from 'utils/auth';

if (!timestamp || Date.now() - timestamp > expiry) {
    localStorage.removeItem('sessionId');
    localStorage.removeItem('pathsVisited');
    localStorage.setItem('sessionTimestamp', Date.now());
  }

const getSessionId = () => {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      const sessionId = uuidv4();
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  const getPathsVisited = () => {
    let pathsVisited = JSON.parse(localStorage.getItem('pathsVisited'));
    if (!pathsVisited) {
        pathsVisited = [];
    }
    return pathsVisited;
}

const addPathToVisited = (newPath) => {
    const pathsVisited = getPathsVisited();
    if (!pathsVisited.includes(newPath)) {
        pathsVisited.push(newPath);
        localStorage.setItem('pathsVisited', JSON.stringify(pathsVisited));
    }
}

const VisitorCounter = ({page}) => {    
    useEffect(() => {
        // Increment the visitor count silently
        // console.log('Incrementing visitor count for page:', page);    
        // console.log('Pathname:', window.location.pathname);  
        // Update the visited pages
        const effectivePage = page || window.location.pathname;
        addPathToVisited(window.location.pathname);  
        const pathsVisited = getPathsVisited();  // Fetch paths visited from localStorage
        const sessionId = getSessionId();
        fetch('/api/visitors/logs/', {
            method: 'POST',
            body: JSON.stringify({ page: effectivePage,
                userAgent: navigator.userAgent,
                sessionId,
                pathsVisited
             }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    , [page]);

    return null; // No UI component is displayed
};

export default VisitorCounter;
