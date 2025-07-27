const router = require('express').Router();
const { 
    getQuotes, 
    createQuote, 
    getQuoteById, 
    updateQuote, 
    deleteQuote, 
    getUserQuotes, 
    createQuoteRequest, 
    getPaginatedQuickQuotes, 
    deleteQuoteRequest,
    acknowledgeQuickQuote
 } = require('../../controllers/quoteControllers');


router.route('/')
    .get(getQuotes)
    .post(createQuote);

router.route('/user/:userId')
    .get(getUserQuotes);

router.route('/quickquote')
    .post(createQuoteRequest)
    .get(getPaginatedQuickQuotes)

router.route('/quickquote/:quoteId')
    .delete(deleteQuoteRequest);

router.route('/:quoteId')
    .get(getQuoteById)
    .put(updateQuote)
    .delete(deleteQuote);

    
router.route('/quickquote/:id/acknowledge')
      .patch(acknowledgeQuickQuote);


module.exports = router;
