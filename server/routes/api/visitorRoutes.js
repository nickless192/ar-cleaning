const express = require('express');
const router = express.Router();
const {incrementVisitorCount, getVisitorCount } = require('../../controllers/visitorController');

router.get('/', getVisitorCount);
router.post('/increment', incrementVisitorCount);

module.exports = router;
