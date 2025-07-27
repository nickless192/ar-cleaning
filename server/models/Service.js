// models/Service.js
const { Schema, model, Types } = require('mongoose');
const dateFormat = require('../utils/dateFormat');

const ServiceSchema = new Schema({
    categoryKey: {
        type: String, // e.g., 'services.residential'
        required: true
    },
    serviceId: {
        type: Schema.Types.ObjectId,
        default: () => new Types.ObjectId()
    },
    name: {
    type: String,
    required: true,
  },
    nameKey: {
        type: String, // e.g., 'services.residential.houseCleaning'
        required: true
    },
    descriptionKey: {
        type: String // Optional, e.g., 'services.residential.houseCleaning.desc'
    },
    cost: {
        type: Number, // Base price for this service
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    options: [
        {
            key: {
                type: String, // internal ID like 'frequency', 'size'
                required: true
            },
            labelKey: {
                type: String, // i18n key, e.g., 'options.frequency'
                required: true
            },
            type: {
                type: String, // 'select', 'number', 'text', 'boolean'
                enum: ['select', 'number', 'text', 'boolean', 'checkbox', 'date'],
                default: 'text'
            },
            unitKey: {
                type: String, // Optional i18n key like 'units.sqft' or 'units.hours'
                default: ''
            },
            required: {
                type: Boolean,
                default: false
            },
            isVisible: {
                type: Boolean,
                default: true
            },
            defaultValue: Schema.Types.Mixed, // for pre-filling in UI
            choices: [
                {
                    labelKey: String,  // e.g., 'options.frequency.weekly'
                    value: String,
                    optionCost: {
                        type: Number,
                        default: 0
                    }
                }
            ]
        }
    ],

    //   options: [
    //     {
    //       labelKey: String, // e.g., 'options.deep'
    //       value: String,    // e.g., 'deep'
    //       // Optional: future-proofing for option-specific pricing
    //       optionCost: {
    //         type: Number,
    //         default: 0
    //       }
    //     }
    //   ],
    order: {
        type: Number, // Optional: for ordering categories
        default: 0
    },
    isVisible: {
        type: Boolean,
        default: true
    }
}, {
    toJSON: {
        getters: true
    },
    id: false
});

const Service = model('Service', ServiceSchema);

module.exports = Service;
