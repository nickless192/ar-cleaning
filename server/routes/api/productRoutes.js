const router = require('express').Router();
const { getProducts, createProduct, getProductByName, getProductById, updateProduct, deleteProduct } = require('../../controllers/productControllers');
const { adminRouteLimiter } = require('../../middleware/rateLimiters');
const { authMiddleware } = require('../../utils/auth');
const requireAdminFlag = require('../../middleware/requireAdminFlag');

router.use(adminRouteLimiter);
router.use(authMiddleware);
router.use(requireAdminFlag);

router.route('/')
    .get(getProducts)
    .post(createProduct);

router.route('/:productId')
    .get(getProductById)
    .put(updateProduct)
    .delete(deleteProduct);

router.route('/:name')
    .get(getProductByName);

module.exports = router;
