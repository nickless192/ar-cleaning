const express = require('express');
const router = express.Router();
const cron = require('node-cron');
const { createBooking, getBookings, deleteBooking, sendReminderEmail  } = require('../../controllers/bookingController');
const Booking = require('../../models/Booking');

router.post('/', createBooking);
router.get('/', getBookings);

cron.schedule('*/30 * * * *', async () => {
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
      reminderSent: false,
    });

    console.log(`Found ${dueBookings.length} bookings due for reminders.`);

    for (let booking of dueBookings) {
      await sendReminderEmail(booking);
      booking.reminderSent = true;
      await booking.save();
      console.log(`Reminder sent to ${booking.customerEmail}`);
    }
  } catch (err) {
    console.error('Reminder CRON error:', err);
  }
});

module.exports = router;
