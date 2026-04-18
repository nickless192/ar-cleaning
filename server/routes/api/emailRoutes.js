const cron = require('node-cron');
const { emailQuote, emailQuoteNotification, emailNewUser, emailNewUserNotification, emailPasswordResetRequest, emailQuickQuote, emailQuickNotePDF, generateWeeklyReport, sendWeeklyReportEmail, generateManualReport,
    sendUpcomingBookingsEmail,
    awsEmailTest
} = require('../../controllers/emailController');
const NotificationService = require('../../services/NotificationService');

const router = require('express').Router();
const isDev = process.env.NODE_ENV !== "production";
const { authMiddleware } = require('../../utils/auth');
const requireAdminFlag = require('../../middleware/requireAdminFlag');
const { adminRouteLimiter, authRouteLimiter } = require('../../middleware/rateLimiters');

// Route for sending an email
router.post('/quote', authRouteLimiter, emailQuote);
router.post('/quick-quote', authRouteLimiter, emailQuickQuote);
router.post('/quote-notification', authRouteLimiter, emailQuoteNotification);
router.post('/send-quick-quote-pdf', authRouteLimiter, emailQuickNotePDF);


// Route for sending an email
router.post('/new-user', authRouteLimiter, emailNewUser);
router.post('/new-user-notification', authRouteLimiter, emailNewUserNotification);

router.post('/request-password-reset', authRouteLimiter, emailPasswordResetRequest);

router.get('/weekly-report', adminRouteLimiter, authMiddleware, requireAdminFlag, generateManualReport);
router.post('/upcoming-bookings', adminRouteLimiter, authMiddleware, requireAdminFlag, sendUpcomingBookingsEmail);

// ✅ Manually trigger Admin Upcoming Bookings Digest
router.post("/admin-upcoming-bookings-digest", adminRouteLimiter, authMiddleware, requireAdminFlag, async (req, res) => {
    try {
        const days = Number(req.body?.days || 7);

        // optional: small validation
        if (!Number.isFinite(days) || days < 1 || days > 31) {
            return res.status(400).json({ message: "days must be between 1 and 31" });
        }

        await NotificationService.sendAdminUpcomingBookingsDigestForPeriod(days);

        return res.status(200).json({
            message: `Upcoming bookings digest sent successfully for next ${days} days.`,
        });
    } catch (err) {
        console.error("[Manual] Failed to send upcoming bookings digest:", err);
        return res.status(500).json({ message: "Failed to send digest." });
    }
});

router.post('/aws-email-test', adminRouteLimiter, authMiddleware, requireAdminFlag, awsEmailTest);


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
    },
    {
        timezone: 'America/Toronto',
    });


cron.schedule(
    // isDev ? "*/10 * * * * *" : "0 7 * * *", // Dev: every 10 sec | Prod: every day at 7 am
    "0 7 * * *",
    async () => {
        try {
            await sendUpcomingBookingsEmail(
                { body: { days: 7 }, query: {} },
                {
                    status: () => ({ json: () => null }),
                }
            );
            // await NotificationService.sendAdminUpcomingBookingsDigestForPeriod(7);
        } catch (err) {
            console.error('[Cron] Failed to send upcoming bookings email:', err);
        }
    },
    {
        timezone: 'America/Toronto',
    });

module.exports = router;
