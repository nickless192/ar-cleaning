const router = require('express').Router();
const apiRoute = require('./api');
const homeRoutes = require('./homeRoutes');

// router.use('/', homeRoutes);

router.use('/api', apiRoute);


// router.use((req, res) => {
//     res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
// });


module.exports = router;