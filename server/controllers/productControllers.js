const { Product } = require('../models');
const {
    assertNoOperatorKeys,
    pickAllowedFields,
    validateObjectId,
} = require('../utils/mongoSafety');

const PRODUCT_FIELDS = [
    'productId',
    'name',
    'description',
    'productCost',
    'quantityAtHand',
];

const productControllers = {
    getProducts(req, res) {
        Product.find({})
            .select('-__v')
            .sort({ _id: -1 })
            .then(dbProductData => res.json(dbProductData))
            .catch(err => res.status(400).json(err));
    },
    getProductById({ params }, res) {
        Product.findOne({ name: params.name })
            .select('-__v')
            .then(dbProductData => {
                if (!dbProductData) {
                    res.status(404).json({ message: 'No product found with this name' });
                    return;
                }
                res.json(dbProductData);
            })
            .catch(err => res.status(500).json(err));
    },
    getProductByName({ params }, res) {
        Product.findOne({ name: params.name })
            .select('-__v')
            .then(dbProductData => {
                if (!dbProductData) {
                    res.status(404).json({ message: 'No product found with this name' });
                    return;
                }
                res.json(dbProductData);
            })
            .catch(err => res.status(500).json(err));
    },
    async createProduct({ body }, res) {
        try {
            assertNoOperatorKeys(body);
        } catch (err) {
            return res.status(400).json({ message: 'Invalid product payload' });
        }
        const createData = pickAllowedFields(body, PRODUCT_FIELDS);
        Product.create(createData).
            then(dbProductData => {
                console.log(dbProductData);
                res.status(200).json(dbProductData);
            })
            .catch(err => {
                console.log(err);
                res.status(400).json(err);
            });
    },
    updateProduct({ params, body }, res) {
        if (!validateObjectId(params.productId)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }
        try {
            assertNoOperatorKeys(body);
        } catch (err) {
            return res.status(400).json({ message: 'Invalid product payload' });
        }
        const updateData = pickAllowedFields(body, PRODUCT_FIELDS);
        Product.findByIdAndUpdate(params.productId, updateData, { new: true, runValidators: true })
            .select('-__v')
            .then(dbProductData => {
                if (!dbProductData) {
                    res.status(404).json({ message: 'No product found by this name' });
                    return;
                }
                res.json(dbProductData);
            })
            .catch(err => res.status(500).json(err));
    },
    deleteProduct({ params }, res) {
        if (!validateObjectId(params.productId)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }
        Product.findByIdAndDelete(params.productId)
            .then(dbProductData => {
                if (!dbProductData) {
                    res.status(404).json({ message: 'No product found by this name' });
                    return;
                }
                res.json(dbProductData);
            })
            .catch(err => res.status(400).json(err));
    }
}

module.exports = productControllers;
