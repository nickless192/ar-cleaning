const router = require('express').Router();
const { getServices, createService, getServiceByName, getServiceById, updateService, deleteService, duplicateService } = require('../../controllers/serviceControllers');

router.route('/')
    .get(getServices)
    .post(createService);

router.route('/duplicate/:serviceId')
    .post(duplicateService)


router.route('/:serviceId')
    .get(getServiceById)
    .put(updateService)
    .delete(deleteService);

router.route('/:name')
    .get(getServiceByName);

module.exports = router;