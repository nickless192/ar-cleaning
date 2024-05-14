const router = require('express').Router();
const path = require('path');

router.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });

  router.get('/request-quote', (req, res) => {
    res.render('request-quote');
    // res.sendFile(path.join(__dirname, '../client/src/components/Pages', 'index.html'));
  });

module.exports = router;