const router = require('express').Router();
const { getChat } = require('../../controllers/chatControllers');

// POST /chats
router.post('/', getChat); // Get a chat response


module.exports = router;