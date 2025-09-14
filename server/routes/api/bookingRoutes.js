const router = require('express').Router();
const isDev = process.env.NODE_ENV !== "production";
const cron = require('node-cron');
const { createBooking, getBookings, deleteBooking, completeBooking, hideBooking, sendScheduledReminder, sendScheduledConfirmationEmail, confirmBooking, cancelBooking, pendBookingById,
  updateBookingDate,
  submitNewDateRequest,
  updateBooking
 } = require('../../controllers/bookingController');


router.post('/', createBooking);
router.get('/', getBookings);
router.delete('/:id', deleteBooking);
router.put('/:id/update-date', updateBookingDate);
router.put('/:id/complete', completeBooking);
router.put('/:id/hide', hideBooking);
router.put('/:id/confirm', confirmBooking);
router.put('/:id/cancel', cancelBooking);
router.put('/:id/pending', pendBookingById);
router.put('/:id/request-change', submitNewDateRequest);
router.put('/:id/update', updateBooking);


// Reminder Scheduler
cron.schedule(
  isDev ? "*/1 * * * *" : "*/15 * * * *", // Dev: every 1 min | Prod: every 15 mins
  sendScheduledReminder
);

// Confirmation Email Scheduler
cron.schedule(
  isDev ? "*/10 * * * * *" : "*/5 * * * *", // Dev: every 10 sec | Prod: every 5 mins
  sendScheduledConfirmationEmail
);

module.exports = router;
