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
const eventRoutes = require('./eventRoutes');
const customerRoutes = require('./customerRoutes');
const categoryRoutes = require('./categoryRoutes');
const financeRoutes = require('./financeRoutes');
const expensesRoutes = require('./expensesRoutes');
const contactFormRoutes = require('./contactFormRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const notificationRoutes = require('./notificationRoutes');
const adminUserRoutes = require('./adminUserRoutes');
const i18nRoutes = require('./i18nRoutes');
const adminReportsRoutes = require('./adminReportsRoutes');

// Mount admin reports routes
router.use('/admin-reports', adminReportsRoutes);

router.use('/users', userRoutes);
router.use('/services', serviceRoutes);
router.use('/products', productRoutes);
router.use('/quotes', quoteRoutes);
router.use('/chat', chatRoutes);
router.use('/visitors', visitorRoutes);
router.use('/email', emailRoutes);
router.use('/reviews', reviewRoutes);
router.use('/bookings', bookingRoutes); 
router.use('/events', eventRoutes);
router.use('/customers', customerRoutes);
router.use('/categories', categoryRoutes);
router.use('/finance', financeRoutes);
router.use('/expenses', expensesRoutes);
router.use('/contactForm', contactFormRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminUserRoutes);
router.use('/i18n', i18nRoutes);

module.exports = router;