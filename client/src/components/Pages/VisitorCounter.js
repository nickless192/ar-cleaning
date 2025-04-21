import React, { useEffect } from 'react';

const VisitorCounter = ({page}) => {    
    useEffect(() => {
        // Increment the visitor count silently
        // console.log('Incrementing visitor count for page:', page);    
        // console.log('Pathname:', window.location.pathname);    
        fetch('/api/visitors/logs/', {
            method: 'POST',
            body: JSON.stringify({ page,
                userAgent: navigator.userAgent                 
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
