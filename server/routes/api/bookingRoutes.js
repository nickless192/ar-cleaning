const router = require('express').Router();
const isDev = process.env.NODE_ENV !== "production";
const cron = require('node-cron');
const Booking = require('../../models/Booking');
const NotificationService = require('../../services/NotificationService');
const { authMiddleware } = require('../../utils/auth');
const requireAdminFlag = require('../../middleware/requireAdminFlag');
const { createBooking, getBookings, deleteBooking, completeBooking, hideBooking, sendScheduledReminder, sendScheduledConfirmationEmail, confirmBooking, cancelBooking, pendBookingById,
  updateBookingDate,
  submitNewDateRequest,
  updateBooking,
  submitNewBookingRequest
 } = require('../../controllers/bookingController');


router.post('/', createBooking);
router.post('/request', submitNewBookingRequest);
router.get('/', authMiddleware, requireAdminFlag, getBookings);
router.delete('/:id', authMiddleware, requireAdminFlag, deleteBooking);
router.put('/:id/update-date', authMiddleware, requireAdminFlag, updateBookingDate);
router.put('/:id/complete', authMiddleware, requireAdminFlag, completeBooking);
router.put('/:id/hide', authMiddleware, requireAdminFlag, hideBooking);
router.put('/:id/confirm', authMiddleware, requireAdminFlag, confirmBooking);
router.put('/:id/cancel', authMiddleware, requireAdminFlag, cancelBooking);
router.put('/:id/pending', authMiddleware, requireAdminFlag, pendBookingById);
router.put('/:id/request-change', authMiddleware, requireAdminFlag, submitNewDateRequest);
router.put('/:id/update', authMiddleware, requireAdminFlag, updateBooking);


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

cron.schedule('*/15 * * * *', async () => {
    // every 15 minutes
    try {
        const now = new Date();
        const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const bookings = await Booking.find({
            startTime: { $gte: in24h, $lt: new Date(in24h.getTime() + 15 * 60 * 1000) },
            status: { $in: ['confirmed', 'pending'] },
            reminderSent: { $ne: true }, // add this field if you want
        });

        for (const booking of bookings) {
            await NotificationService.sendBookingReminderCustomer(booking._id);
            booking.reminderSent = true;
            await booking.save();
        }
    } catch (err) {
        console.error('[Cron] booking reminders error:', err);
    }
});


module.exports = router;
