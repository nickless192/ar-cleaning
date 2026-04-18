const router = require('express').Router();
const { getChat } = require('../../controllers/chatControllers');
const { authRouteLimiter } = require('../../middleware/rateLimiters');

router.use(authRouteLimiter);

// POST /chats
router.post('/', getChat); // Get a chat response


module.exports = router;
