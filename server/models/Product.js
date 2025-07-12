const {Schema, model, Types} = require('mongoose');
const dateFormat = require('../utils/dateFormat');

const ProductSchema = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        default: () => new Types.ObjectId
    },
    name: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String
    },
    productCost: {
        type: Number
    },
    quantityAtHand: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        // get: createdAtVal => dateFormat(createdAtVal)
    }
}, {
    toJSON: {
        // enable getters to format timestamps
        getters: true
    },
    id: false
});

const Product = model('Product', ProductSchema);

module.exports = Product;