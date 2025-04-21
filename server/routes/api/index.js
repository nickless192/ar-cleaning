const router = require('express').Router();
const userRoutes = require('./userRoutes');
const serviceRoutes = require('./serviceRoutes');
const productRoutes = require('./productRoutes');
const quoteRoutes = require('./quoteRoutes');
const chatRoutes = require('./chatRoutes');
const visitorRoutes = require('./visitorRoutes');
const emailRoutes = require('./emailRoutes');
const reviewRoutes = require('./reviewRoutes');
const bookingRoutes = require('./bookingRoutes');

router.use('/users', userRoutes);
router.use('/services', serviceRoutes);
router.use('/products', productRoutes);
router.use('/quotes', quoteRoutes);
router.use('/chat', chatRoutes);
router.use('/visitors', visitorRoutes);
router.use('/email', emailRoutes);
router.use('/reviews', reviewRoutes);
router.use('/bookings', bookingRoutes); 

module.exports = router;