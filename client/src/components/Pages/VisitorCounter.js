import React, { useEffect } from 'react';

const VisitorCounter = ({page}) => {    
    useEffect(() => {
        // Increment the visitor count silently
        console.log('Incrementing visitor count for page:', page);        
        // fetch('/api/visitors/increment/', {
        //     method: 'POST',
        //     body: JSON.stringify({ page }),
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        // });
        fetch('/api/visitors/logs/', {
            method: 'POST',
            body: JSON.stringify({ page }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    , [page]);

    return null; // No UI component is displayed
};

export default VisitorCounter;
