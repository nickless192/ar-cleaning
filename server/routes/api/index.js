const router = require('express').Router();
const userRoutes = require('./userRoutes');
const serviceRoutes = require('./serviceRoutes');
const productRoutes = require('./productRoutes');

router.use('/users', userRoutes);
router.use('/services', serviceRoutes);
router.use('/products', productRoutes);
// router.use('/thoughts', thoughtsRoutes);

module.exports = router;