const express = require('express');
const { emailQuote, emailQuoteNotification, emailNewUser, emailNewUserNotification } = require('../../controllers/emailController');

const router = express.Router();

// Route for sending an email
router.post('/quote', emailQuote);
router.post('/quote-notification', emailQuoteNotification);


// Route for sending an email
router.post('/new-user', emailNewUser);
router.post('/new-user-notification', emailNewUserNotification);


module.exports = router;