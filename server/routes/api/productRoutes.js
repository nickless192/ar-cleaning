const router = require('express').Router();
const { getProducts, createProduct, getProductByName, getProductById, updateProduct, deleteProduct } = require('../../controllers/productControllers');

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
