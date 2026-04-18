const router = require('express').Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../../controllers/categoryControllers');
const { adminRouteLimiter } = require('../../middleware/rateLimiters');
const { authMiddleware } = require('../../utils/auth');
const requireAdminFlag = require('../../middleware/requireAdminFlag');

router.use(adminRouteLimiter);
router.use(authMiddleware);
router.use(requireAdminFlag);

router.get('/', getCategories);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
