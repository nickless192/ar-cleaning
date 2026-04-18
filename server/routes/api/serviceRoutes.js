const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { getServices, createService, getServiceByName, getServiceById, updateService, deleteService, duplicateService } = require('../../controllers/serviceControllers');

const duplicateServiceLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 duplicate requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});

router.route('/')
    .get(getServices)
    .post(createService);

router.route('/duplicate/:serviceId')
    .post(duplicateServiceLimiter, duplicateService)


router.route('/:serviceId')
    .get(getServiceById)
    .put(updateService)
    .delete(deleteService);

router.route('/:name')
    .get(getServiceByName);

module.exports = router;