const router = require('express').Router();
const cron = require('node-cron');
const { createBooking, getBookings, deleteBooking, sendReminderEmail  } = require('../../controllers/bookingController');
const Booking = require('../../models/Booking');

router.post('/', createBooking);
router.get('/', getBookings);

// send reminder scheduler
cron.schedule('0 0 * * *', async () => { 
    //  for testing purposes, run every 10 seconds
    // cron.schedule('*/10 * * * * *', async () => {
  console.log('[CRON] Checking for reminders due in 24h...');
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const windowStart = new Date(in24h.getTime() - 12 * 60 * 60 * 1000);
  const windowEnd = new Date(in24h.getTime() + 12 * 60 * 60 * 1000);

  try {
    const dueBookings = await Booking.find({
      date: { $gte: windowStart, $lte: windowEnd },
      reminderScheduled: true,
    });

    console.log(`Found ${dueBookings.length} bookings due for reminders.`);

    for (let booking of dueBookings) {
      await sendReminderEmail(booking);
      booking.reminderScheduled = false;
      await booking.save();
      console.log(`Reminder sent to ${booking.customerEmail}`);
    }
  } catch (err) {
    console.error('Reminder CRON error:', err);
  }
});

// send confirmation email
// Confirmation Scheduler
cron.schedule('* * * * *', async () => {
  const now = new Date();

  const confirmations = await Booking.find({
    confirmationDate: { $lte: now },
    scheduleConfirmation: true
  });

  for (const booking of confirmations) {
    if (booking.confirmationDate !== null) {
      try {
        await sgMail.send({
          to: booking.customerEmail,
          from: 'info@cleanarsolutions.ca',
          subject: 'Booking Confirmation',
          text: `Hello ${booking.customerName}, this is a confirmation for your service on ${new Date(booking.date).toLocaleString()}.`
        });
  
        // booking.confirmationSent = true;
        booking.confirmationDate = now; // Update confirmation date
        booking.scheduleConfirmation = false; // Mark as no longer scheduled
        await booking.save();
      } catch (err) {
        console.error('Error sending confirmation:', err);
      }
    }
  }
});

module.exports = router;
