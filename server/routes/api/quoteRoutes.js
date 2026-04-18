const router = require('express').Router();
const { authRouteLimiter, adminRouteLimiter } = require('../../middleware/rateLimiters');
const { authMiddleware } = require('../../utils/auth');
const requireAdminFlag = require('../../middleware/requireAdminFlag');
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

const adminGuards = [adminRouteLimiter, authMiddleware, requireAdminFlag];

router.route('/')
    .get(...adminGuards, getQuotes)
    .post(createQuote);

router.route('/user/:userId')
    .get(getUserQuotes);

router.route('/quickquote')
    .post(createQuoteRequest)
    .get(...adminGuards, getPaginatedQuickQuotes)

router.route('/quickquote/:quoteId')
    .delete(...adminGuards, deleteQuoteRequest);

router.route('/:quoteId')
    .get(...adminGuards, getQuoteById)
    .put(...adminGuards, updateQuote)
    .delete(...adminGuards, deleteQuote);

    
router.route('/quickquote/:id/acknowledge')
      .patch(...adminGuards, acknowledgeQuickQuote);

      router.get('/quickquote/unacknowledged', ...adminGuards, getUnacknowledgedQuotes);



module.exports = router;
