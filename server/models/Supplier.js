const {Schema, model} = require('mongoose');
const {isEmail} = require('../utils/validators');
const dateFormat = require('../utils/dateFormat');

const SupplierSchema = new Schema({
    supplierId: {
        type: Schema.Types.ObjectId,
        default: () => new Types.ObjectId
    },
    contactName: {
        type: String,
        required: true,
        // unique: true
    },
    companyName: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: Number,
        // add phone number validation

    },
    email: {
        type: String,
        required: true,
        validate: [isEmail, 'Wrong email format']
    },
    ingredients: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Ingredient'
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now(),
        get: createdAtVal => dateFormat(createdAtVal)
    }
}, {
    toJSON: {
        // enable getters to format timestamps
        getters: true
    },
    id: false
});

const Supplier = model('Supplier', SupplierSchema);

module.exports = Supplier;