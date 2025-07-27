const { Schema, model, Types } = require('mongoose');
const { isEmail } = require('../utils/validators');

const CustomOptionsSchema = new Schema({
    service: { type: Schema.Types.Mixed, required: true }, // Mixed type to handle string, boolean, or other types
    label: { type: String }
});

const ServiceSchema = new Schema({
    type: { 
        type: String, 
        required: true 
    },
    service: { 
        type: String, 
        required: true 
    },
    customOptions: { 
        type: Map, 
        of: CustomOptionsSchema, 
        // required: true 
    }
});

const ProductSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    productCost: {
        type: Number,
        required: true
    },
    id: {
        type: String,
        required: true
    }
}, { _id: false });

const QuickQuoteSchema = new Schema({
    quoteId: {
        type: Schema.Types.ObjectId,
        default: () => new Types.ObjectId()
    },
    name: {
        type: String,
        required: true
    },
    // description: {
    //     type: String
    // },
    email: {
        type: String,
        // required: true,
        validate: [isEmail, 'Wrong email format']
    },
    companyName: {
        type: String,
        // required: true
    },
    phonenumber: {
        type: String,
        required: true
    },    
    postalcode: {
        type: String,
        required: true
    },   
    promoCode: {
        type: String
    },
    
    products: [ProductSchema],
    services: [ServiceSchema],
    // formHtml: {
    //     type: String,
    //     required: true
    // },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    acknowledgedByUser: {
        type: Boolean,
        default: false
    },
    acknowledgedAt: { 
        type: Date 
    },
  acknowledgedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
},
    createdAt: {
        type: Date,
        default: Date.now,
        // get: createdAtVal => dateFormat(createdAtVal)
    }
}, {
    toJSON: {
        getters: true
    },
    id: false
});

const QuickQuote = model('QuickQuote', QuickQuoteSchema);

module.exports = QuickQuote;
