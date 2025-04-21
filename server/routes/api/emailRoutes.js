const express = require('express');
const cron = require('node-cron');
// const multer = require('multer');
// const upload = multer({ storage: multer.memoryStorage() });
const { emailQuote, emailQuoteNotification, emailNewUser, emailNewUserNotification, emailPasswordResetRequest, emailQuickQuote, emailQuickNotePDF, generateWeeklyReport, sendWeeklyReportEmail, generateManualReport } = require('../../controllers/emailController');


const router = express.Router();

// Route for sending an email
router.post('/quote', emailQuote);
router.post('/quick-quote', emailQuickQuote);
router.post('/quote-notification', emailQuoteNotification);
router.post('/send-quick-quote-pdf', emailQuickNotePDF);


// Route for sending an email
router.post('/new-user', emailNewUser);
router.post('/new-user-notification', emailNewUserNotification);

router.post('/request-password-reset', emailPasswordResetRequest);

// for testing purposes, run every 10 seconds
// cron.schedule('*/10 * * * *', async () => {
// Route for sending weekly report email
cron.schedule('0 8 * * 1', async () => {
    console.log('[Cron] Sending weekly visitor report...');
    try {
        console.log('[Cron] Generating weekly report...');
        await sendWeeklyReportEmail();
        console.log('[Cron] Weekly report sent!');
    } catch (err) {
        console.error('[Cron] Failed to send report:', err);
    }
});



router.get('/weekly-report', generateManualReport);


module.exports = router;