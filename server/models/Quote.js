const { Schema, model, Types } = require('mongoose');
const { isEmail } = require('../utils/validators');
const dateFormat = require('../utils/dateFormat');

// const CustomOptionsSchema = new Schema({
//     unitSize: { type: String },
//     bedrooms: { type: Number },
//     bathrooms: { type: Number },
//     fridge: { type: Boolean },
//     parking: { type: Boolean },
//     squareFootage: { type: String },
//     rooms: { type: Number },
//     windows: { type: Boolean },
//     employees: { type: Number },
//     highDusting: { type: Boolean },
//     machineryCleaning: { type: Boolean }
// }, { _id: false });
const CustomOptionsSchema = new Schema({
    service: { type: Schema.Types.Mixed, required: true }, // Mixed type to handle string, boolean, or other types
    serviceCost: { type: Number, required: true },
    label: { type: String }
});

const ServiceSchema = new Schema({
    type: { 
        type: String, 
        // required: true 
    },
    serviceLevel: { 
        type: String, 
        // required: true 
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

const QuoteSchema = new Schema({
    quoteId: {
        type: Schema.Types.ObjectId,
        default: () => new Types.ObjectId()
    },
    name: {
        type: String,
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
    companyName: {
        type: String,
        required: true
    },
    phonenumber: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    province: {
        type: String,
        required: true
    },
    postalcode: {
        type: String,
        required: true
    },    
    howDidYouHearAboutUs: {
        type: String,
        // required: true
    },
    howDidYouHearAboutUsSupport: {
        type: String
    },    
    promoCode: {
        type: String
    },
    
    products: [ProductSchema],
    services: [ServiceSchema],
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    subtotalCost: {
        type: Number,
        required: true
    },
    grandTotal: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        get: createdAtVal => dateFormat(createdAtVal)
    }
}, {
    toJSON: {
        getters: true
    },
    id: false
});

const Quote = model('Quote', QuoteSchema);

module.exports = Quote;
