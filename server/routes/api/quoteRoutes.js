const router = require('express').Router();
const {getQuotes, createQuote, getQuoteById, updateQuote, deleteQuote, getUserQuotes, createQuickQuote, getPaginatedQuickQuotes} = require('../../controllers/quoteControllers');


router.route('/')
    .get(getQuotes)
    .post(createQuote);

    router.route('/user/:userId')
    .get(getUserQuotes);

router.route('/quickquote')
    .post(createQuickQuote)
    .get(getPaginatedQuickQuotes);

    router.route('/:quoteId')
    .get(getQuoteById)
    .put(updateQuote)
    .delete(deleteQuote);


module.exports = router;
