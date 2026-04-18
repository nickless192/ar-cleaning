const router = require('express').Router();
const { createNewFrom, getForms, updateFormStatus, archiveForm } = require('../../controllers/contactFormController');
const { authRouteLimiter, adminRouteLimiter } = require('../../middleware/rateLimiters');

router.post('/', authRouteLimiter, createNewFrom);

router.get('/', adminRouteLimiter, getForms);


router.patch('/:id/status', adminRouteLimiter, updateFormStatus);

router.patch('/:id/archive', adminRouteLimiter, archiveForm);

module.exports = router;
