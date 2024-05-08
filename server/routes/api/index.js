const router = require('express').Router();
const userRoutes = require('./userRoutes');
const serviceRoutes = require('./serviceRoutes');
const productRoutes = require('./productRoutes');
const quoteRoutes = require('./quoteRoutes');

router.use('/users', userRoutes);
router.use('/services', serviceRoutes);
router.use('/products', productRoutes);
router.use('/quotes', quoteRoutes);
// router.use('/thoughts', thoughtsRoutes);

module.exports = router;