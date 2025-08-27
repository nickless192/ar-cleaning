const router = require('express').Router();
const {getReviews, listAccounts, listLocations} = require('../../controllers/reviewsControllers');

router.route('/')
    .get(getReviews);

router.route('/accounts')
    .get(listAccounts);

router.route('/locations')
    .get(listLocations);

module.exports = router;