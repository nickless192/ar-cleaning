import React, { useState, useEffect } from 'react';
import { Button } from 'reactstrap';


const VisitorStats = () => {
    const [dailyVisits, setDailyVisits] = useState({
        index: 0,
        'request-quote': 0,
        career: 0,
    });
    const [migrationStatus, setMigrationStatus] = useState('');

    // Function to trigger the migration
    const handleMigrate = async () => {
        const response = await fetch('/api/visitors/migrate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        const data = await response.json();
        console.log(data);
        setMigrationStatus(data.message);

    };

    useEffect(() => {
        // Fetch daily visitor stats
        const fetchDailyVisits = async () => {
            try {
                const response = await fetch('/api/visitors/daily', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch daily visitor stats');
                }
                const data = await response.json();
                console.log(data);
                setDailyVisits(data);
            } catch (error) {
                console.log(error);
            }
        }
        fetchDailyVisits();
        
    }, []);

    return (
        <>
            <div>
                <h3>Daily Visitors: </h3>
                <p>Index: {dailyVisits.index}</p>
                <p>Request Quote: {dailyVisits['request-quote']}</p>
                <p>Career: {dailyVisits.career}</p>
            </div>
                {/* Button to trigger migration  */}
                {/* Display migration status */}
            {/* <div className='visitor-log-migration'>
                <Button onClick={handleMigrate}>
                    Migrate Visitor Data
                </Button>

                {migrationStatus && <p>{migrationStatus}</p>}
            </div> */}
        </>
    );
};

export default VisitorStats;
