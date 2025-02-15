const express = require('express');
// const multer = require('multer');
// const upload = multer({ storage: multer.memoryStorage() });
const { emailQuote, emailQuoteNotification, emailNewUser, emailNewUserNotification, emailPasswordResetRequest, emailQuickQuote } = require('../../controllers/emailController');

const router = express.Router();

// Route for sending an email
router.post('/quote', emailQuote);
router.post('/quick-quote', emailQuickQuote);
router.post('/quote-notification', emailQuoteNotification);


// Route for sending an email
router.post('/new-user', emailNewUser);
router.post('/new-user-notification', emailNewUserNotification);

router.post('/request-password-reset', emailPasswordResetRequest);


module.exports = router;