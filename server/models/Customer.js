const { Schema, model, Types } = require('mongoose');
const { isEmail } = require('../utils/validators');
const dateFormat = require('../utils/dateFormat');

const CustomerSchema = new Schema({
  user: {
    type: Types.ObjectId,
    ref: 'User',
    // required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  telephone: {
    type: String
  },
  email: {
    type: String,
            // run email validation
            validate: [isEmail, 'Wrong email format']
  },
  address: {
    type: String
  },
  city: {
    type: String
  },
  province: {
    type: String
  },
  postalcode: {
    type: String
  },
  companyName: {
    type: String
  },
  customerId: {
    type: Schema.Types.ObjectId,
    default: () => new Types.ObjectId()
  },
  bookings: [{
    type: Types.ObjectId,
    ref: 'Booking'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    // get: createdAtVal => dateFormat(createdAtVal)
  }
}, {
  toJSON: {
    getters: true
  }
});

const Customer = model('Customer', CustomerSchema);

module.exports = Customer;
