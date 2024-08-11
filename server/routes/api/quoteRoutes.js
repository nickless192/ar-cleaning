const router = require('express').Router();
const {getQuotes, createQuote, getQuoteById, updateQuote, deleteQuote, emailQuote, getUserQuotes, emailQuoteNotification} = require('../../controllers/quoteControllers');


router.route('/')
    .get(getQuotes)
    .post(createQuote);

router.route('/:quoteId')
    .get(getQuoteById)
    .put(updateQuote)
    .delete(deleteQuote);

    router.route('/user/:userId')
    .get(getUserQuotes);

router.route('/send-email')
    .post(emailQuote);

    router.route('/send-email-notification')
    .post(emailQuoteNotification);



module.exports = router;
