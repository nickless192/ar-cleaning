// models/ContactForm.js
const { Schema, model } = require('mongoose');

const ContactFormSchema = new Schema(
  {
    name: { 
        type: String, 
        required: true },
    email: { 
        type: String, 
        required: true },
    phone: { 
        type: String },
    subject: { 
        type: String, 
        required: true },
    message: { 
        type: String, 
        required: true },
    status: {
      type: String,
      enum: ["new", "in-progress", "resolved"],
      default: "new",
    },
     deleted: {
      type: Boolean,
      default: false,
    },
    notes: { type: String }, // for admin replies or notes
  },
  { timestamps: true }
);

const ContactForm = model('ContactForm', ContactFormSchema);

module.exports = ContactForm;
