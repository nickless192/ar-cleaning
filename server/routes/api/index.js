const router = require('express').Router();
const userRoutes = require('./userRoutes');
const serviceRoutes = require('./serviceRoutes');

router.use('/users', userRoutes);
router.use('/services', serviceRoutes);
// router.use('/thoughts', thoughtsRoutes);

module.exports = router;