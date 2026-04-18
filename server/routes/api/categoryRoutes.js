const router = require('express').Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../../controllers/categoryControllers');
const { adminRouteLimiter } = require('../../middleware/rateLimiters');

router.use(adminRouteLimiter);

router.get('/', getCategories);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
