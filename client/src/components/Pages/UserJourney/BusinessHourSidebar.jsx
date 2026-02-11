import React, { useState, useEffect } from 'react';
import {
  Offcanvas,
  OffcanvasHeader,
  OffcanvasBody,
  Button,
  ListGroup,
  ListGroupItem
} from 'reactstrap';
import { useTranslation } from 'react-i18next';

const BusinessHoursSidebar = () => {
  const [showHours, setShowHours] = useState(false);
  const { t, i18n } = useTranslation();

  const toggle = () => setShowHours(!showHours);

  const businessHours = {
    [t('daysOfTheWeek.sunday')]: [t('storeStatus.closed')],
    [t('daysOfTheWeek.monday')]: "8:00 AM – 7:00 PM",
    [t('daysOfTheWeek.tuesday')]: "8:00 AM – 7:00 PM",
    [t('daysOfTheWeek.wednesday')]: "8:00 AM – 7:00 PM",
    [t('daysOfTheWeek.thursday')]: "8:00 AM – 7:00 PM",
    [t('daysOfTheWeek.friday')]: "8:00 AM – 7:00 PM",
    [t('daysOfTheWeek.saturday')]: "8:00 AM – 1:00 PM"
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
      setAvailabilityStatus(t('index.status_online'));
      setResponseTimeMessage(t('index.response_now'));
    } else {
      setAvailabilityStatus(t('index.status_offline'));
      setResponseTimeMessage(t('index.response_later'));
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [i18n.language]);

  return (
    <>
      <Button color="link" onClick={toggle} className="text-bold martel-semibold p-0 m-0" title="View Business Hours">
        <p className="text-bold martel-semibold underline pl-0 m-0 text-link text-align-left">{availabilityStatus}</p>
      </Button>
      <Offcanvas direction="end" isOpen={showHours} toggle={toggle}>
        <OffcanvasHeader toggle={toggle}>{t('contact_business_hours')}</OffcanvasHeader>
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
