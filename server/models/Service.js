const {Schema, model, Types} = require('mongoose');
const dateFormat = require('../utils/dateFormat');

const ServiceSchema = new Schema({
    serviceId: {
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
    serviceCost: {
        type: Number
    },
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

const Service = model('Service', ServiceSchema);

module.exports = Service;