const { Schema, model, Types } = require('mongoose');
const { isEmail } = require('../utils/validators');
const dateFormat = require('../utils/dateFormat');

const GiftCardSchema = new Schema({
    code: {
        type: String,
        unique: true,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    purchaserName: {
        type: String
    },
    recipientName: {
        type: String
    },
    recipientEmail: {
        type: String,
        // run email validation
        validate: [isEmail, 'Wrong email format']
    },
    message: String,
    isRedeemed: {
        type: Boolean,
        default: false
    },
    redeemedDate: {
        type:Date,
        default: null,
        get: redeemedDateVal => dateFormat(redeemedDateVal)
    },
    purchaseDate: {
        type: Date,
        default: Date.now,
        get: purchaseDateVal => dateFormat(purchaseDateVal)
    }
}, {
    toJSON: {
        getters: true
    },
    id: false
});

GiftCardSchema.virtual('redeemed').get(function() {
    return this.isRedeemed ? 'Yes' : 'No';
});

// GiftCardSchema.pre('findOneAndUpdate', function(next) {
//     this._update.redeemedDate = Date.now();
//     this._update.isRedeemed = true;
//     next();
// });

GiftCardSchema.pre('save', function(next) {
    if (!this.code) {
        this.code = generateGiftCardCode();
      }
    next();
});

// Function to generate a unique code
function generateGiftCardCode(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

const GiftCard = model('GiftCard', GiftCardSchema);

module.exports = GiftCard;