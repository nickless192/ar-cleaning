const router = require('express').Router();
const {getQuotes, createQuote, getQuoteById, updateQuote, deleteQuote, emailQuote, getUserQuotes} = require('../../controllers/quoteControllers');


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


module.exports = router;
