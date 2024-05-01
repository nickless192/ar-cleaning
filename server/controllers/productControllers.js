const { Product } = require('../models');

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
        Product.create(body).
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
        Product.findByIdAndUpdate({ _id: params.productId }, body, { new: true })
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
        Product.findByIdAndDelete({ _id: params.productId })
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
