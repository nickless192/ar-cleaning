const router = require('express').Router();
const cron = require('node-cron');
const { createBooking, getBookings, deleteBooking, completeBooking, hideBooking, sendReminderCron, sendConfirmationEmailCron } = require('../../controllers/bookingController');


router.post('/', createBooking);
router.get('/', getBookings);
router.delete('/:id', deleteBooking);
router.put('/:id/complete', completeBooking);
router.put('/:id/hide', hideBooking);

// send reminder scheduler
cron.schedule('* * * * *', sendReminderCron);

// Confirmation Scheduler - this will run every minute
// for testing purposes, run every 10 seconds -->cron.schedule('*/10 * * * * *', sendConfirmationEmailCron)
cron.schedule('* * * * *', sendConfirmationEmailCron);

module.exports = router;
