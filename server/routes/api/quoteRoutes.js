const router = require('express').Router();
const { authRouteLimiter, adminRouteLimiter } = require('../../middleware/rateLimiters');
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
    acknowledgeQuickQuote,
    getUnacknowledgedQuotes
 } = require('../../controllers/quoteControllers');

router.use(authRouteLimiter);


router.route('/')
    .get(getQuotes)
    .post(createQuote);

router.route('/user/:userId')
    .get(getUserQuotes);

router.route('/quickquote')
    .post(createQuoteRequest)
    .get(getPaginatedQuickQuotes)

router.route('/quickquote/:quoteId')
    .delete(adminRouteLimiter, deleteQuoteRequest);

router.route('/:quoteId')
    .get(getQuoteById)
    .put(adminRouteLimiter, updateQuote)
    .delete(adminRouteLimiter, deleteQuote);

    
router.route('/quickquote/:id/acknowledge')
      .patch(adminRouteLimiter, acknowledgeQuickQuote);

      router.get('/quickquote/unacknowledged', adminRouteLimiter, getUnacknowledgedQuotes);



module.exports = router;
