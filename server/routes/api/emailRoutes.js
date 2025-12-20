const cron = require('node-cron');
const { emailQuote, emailQuoteNotification, emailNewUser, emailNewUserNotification, emailPasswordResetRequest, emailQuickQuote, emailQuickNotePDF, generateWeeklyReport, sendWeeklyReportEmail, generateManualReport,
    sendUpcomingBookingsEmail
} = require('../../controllers/emailController');
const NotificationService = require('../../services/notificationService');

const router = require('express').Router();
const isDev = process.env.NODE_ENV !== "production";

// Route for sending an email
router.post('/quote', emailQuote);
router.post('/quick-quote', emailQuickQuote);
router.post('/quote-notification', emailQuoteNotification);
router.post('/send-quick-quote-pdf', emailQuickNotePDF);


// Route for sending an email
router.post('/new-user', emailNewUser);
router.post('/new-user-notification', emailNewUserNotification);

router.post('/request-password-reset', emailPasswordResetRequest);

router.get('/weekly-report', generateManualReport);
router.post('/upcoming-bookings', sendUpcomingBookingsEmail);

// for testing purposes, run every 10 seconds = "*/10 * * * * *"

// Route for sending weekly report email
cron.schedule(
    // isDev ? "*/10 * * * * *" : '0 8 * * 1', // Dev: every 10 sec | Prod: every monday at 8 am    
    '0 8 * * 1',
    async () => {
        // console.log('[Cron] Sending weekly visitor report...');
        try {
            // console.log('[Cron] Generating weekly report...');
            await sendWeeklyReportEmail();
            // console.log('[Cron] Weekly report sent!');
        } catch (err) {
            console.error('[Cron] Failed to send report:', err);
        }
    });


cron.schedule(
    // isDev ? "*/10 * * * * *" : "0 7 * * *", // Dev: every 10 sec | Prod: every day at 7 am
"0 7 * * *",
    async () => {
        try {
            // await sendUpcomingBookingsEmail(
            //     { body: { days: 7 }, query: {} },
            //     {
            //         status: () => ({ json: () => null }),
            //     }
            // );
            await NotificationService.sendAdminUpcomingBookingsDigestForPeriod(7);
        } catch (err) {
            console.error('[Cron] Failed to send upcoming bookings email:', err);
        }
    });

module.exports = router;