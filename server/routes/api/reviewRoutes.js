const router = require('express').Router();
const {getReviews, listAccounts, listLocations} = require('../../controllers/reviewsControllers');
const { authRouteLimiter } = require('../../middleware/rateLimiters');

router.use(authRouteLimiter);

router.route('/')
    .get(getReviews);

router.route('/accounts')
    .get(listAccounts);

router.route('/locations')
    .get(listLocations);

module.exports = router;
