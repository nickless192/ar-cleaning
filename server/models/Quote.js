const { Schema, model, Types } = require('mongoose');
const {isEmail} = require('../utils/validators');
const dateFormat = require('../utils/dateFormat');

const QuoteSchema = new Schema({
    quoteId: {
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
    email: {
        type: String,
        required: true,
        validate: [isEmail, 'Wrong email format']
    },
    phonenumber: {
        type: String,
        required: true
    },
    howDidYouHearAboutUs: {
        type: String,
        required: true
    },
    products: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Product'
        }
    ],
    services: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Service'
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now(),
        get: createdAtVal => dateFormat(createdAtVal)
    },
}, {
    toJSON: {
        // enable getters to format timestamps
        getters: true
    },
    id: false
});

const Quote = model('Quote', QuoteSchema);

module.exports = Quote;