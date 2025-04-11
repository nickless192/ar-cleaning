import React, { useState, useEffect } from 'react';
import {
  Offcanvas,
  OffcanvasHeader,
  OffcanvasBody,
  Button,
  ListGroup,
  ListGroupItem
} from 'reactstrap';

const BusinessHoursSidebar = () => {
  const [showHours, setShowHours] = useState(false);

  const toggle = () => setShowHours(!showHours);

  const businessHours = {
    Sunday: "Closed",
    Monday: "8:00 AM – 7:00 PM",
    Tuesday: "8:00 AM – 7:00 PM",
    Wednesday: "8:00 AM – 7:00 PM",
    Thursday: "8:00 AM – 7:00 PM",
    Friday: "8:00 AM – 7:00 PM",
    Saturday: "8:00 AM – 1:00 PM"
  };

  const currentDay = new Date().toLocaleDateString("en-US", {
    weekday: "long"
  });

  const [availabilityStatus, setAvailabilityStatus] = useState('');
    const [responseTimeMessage, setResponseTimeMessage] = useState('');
  

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShowHours(false);
      }
    };
    const currentTime = new Date();
    const currentDay = currentTime.getDay();
    const currentHour = currentTime.getHours();

    // Availability Check
    const isBusinessHours =
      (currentDay >= 1 && currentDay <= 5 && currentHour >= 8 && currentHour < 19) || // Weekdays
      (currentDay === 6 && currentHour >= 8 && currentHour < 13); // Saturday morning

    if (isBusinessHours) {
      setAvailabilityStatus('✅ We are currently available - click to view business hours');
      setResponseTimeMessage('Expect a Quick Reply');
    } else {
      setAvailabilityStatus('⏰ We are currently offline - click to view business hours');
      setResponseTimeMessage('We will respond as soon as possible');
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <Button color="link" onClick={toggle} className="text-bold martel-semibold p-0 m-0" title="View Business Hours">
        <p className="text-bold martel-semibold underline pl-0 m-0 text-link">{availabilityStatus}</p>
      </Button>
      <Offcanvas direction="end" isOpen={showHours} toggle={toggle}>
        <OffcanvasHeader toggle={toggle}>Business Hours</OffcanvasHeader>
        <OffcanvasBody>
          <ListGroup flush>
            {Object.entries(businessHours).map(([day, hours]) => (
              <ListGroupItem
                key={day}
                className={`d-flex justify-content-between align-items-center ${
                  currentDay === day ? "fw-bold text-primary bg-light" : ""
                }`}
              >
                <span>{day}</span>
                <span>
                  {hours}
                  {currentDay === day && <span className="ms-1">←</span>}
                </span>
              </ListGroupItem>
            ))}
          </ListGroup>
        </OffcanvasBody>
      </Offcanvas>
    </>
  );
};

export default BusinessHoursSidebar;
