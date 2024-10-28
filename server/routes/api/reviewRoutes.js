const router = require('express').Router();
const {getReviews, listAccounts} = require('../../controllers/reviewsControllers');

router.route('/')
    .get(getReviews);

router.route('/accounts')
    .get(listAccounts);

module.exports = router;