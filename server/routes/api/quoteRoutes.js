const router = require('express').Router();
const {getQuotes, createQuote, getQuoteById, updateQuote, deleteQuote, getUserQuotes, createQuickQuote} = require('../../controllers/quoteControllers');


router.route('/')
    .get(getQuotes)
    .post(createQuote);

router.route('/:quoteId')
    .get(getQuoteById)
    .put(updateQuote)
    .delete(deleteQuote);

    router.route('/user/:userId')
    .get(getUserQuotes);

router.route('/quickquote')
    .post(createQuickQuote);

module.exports = router;
