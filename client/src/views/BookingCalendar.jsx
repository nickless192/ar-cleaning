import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { parseISO } from 'date-fns';
import moment from 'moment';

const localizer = momentLocalizer(moment);

const BookingCalendar = ({ bookings }) => {
  const events = bookings.map((b) => ({
    id: b._id,
    title: `${b.customerName} - ${b.serviceType}`,
    start: parseISO(b.date),
    end: parseISO(b.date), // Or set a 1-hour range
    allDay: false,
  }));

  return (
<>
  {/* <div style={{ height: '80vh',}}> */}
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      defaultView="week"
      views={['month', 'week', 'day']}
      selectable
    //   toolbar={false}
      style={{ height: '100%' }}
    />
  {/* </div> */}
</>
  );
};

export default BookingCalendar;
