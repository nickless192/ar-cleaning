const router = require('express').Router();
const { createNewFrom, getForms, updateFormStatus, archiveForm } = require('../../controllers/contactFormController');

router.post("/",
    createNewFrom);

router.get("/",
    getForms);


router.patch("/:id/status",
    updateFormStatus);

router.patch("/:id/archive",
    archiveForm);

module.exports = router;