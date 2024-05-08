const router = require('express').Router();
const {getQuotes, createQuote, getQuoteById, updateQuote, deleteQuote} = require('../../controllers/quoteControllers');


router.route('/')
    .get(getQuotes)
    .post(createQuote);

router.route('/:quoteId')
    .get(getQuoteById)
    .put(updateQuote)
    .delete(deleteQuote);

module.exports = router;
