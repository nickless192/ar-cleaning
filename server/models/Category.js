// models/Category.js
const { Schema, model } = require('mongoose');

const CategorySchema = new Schema({
  key: {
    type: String, // Used for i18n translation, e.g., 'services.residential'
    required: true,
    unique: true
  },
  labelKey: {
    type: String, // e.g., 'Residential Services'
    required: true
  },
  descriptionKey: {
    type: String // Optional, e.g., 'services.residential.description'
  },
  order: {
    type: Number,
    default: 0
  },
  type: {
    type: String, // e.g., 'service', 'product'
    required: true
  },
  isVisible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Category = model('Category', CategorySchema);

module.exports = Category;
