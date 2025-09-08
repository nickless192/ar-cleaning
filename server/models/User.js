const { Schema, model } = require('mongoose');
const { isEmail } = require('../utils/validators');
const dateFormat = require('../utils/dateFormat');
const bcrypt = require('bcrypt');

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        // run email validation
        validate: [isEmail, 'Wrong email format']
    },
    howDidYouHearAboutUs: {
        type: String,
        // required: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    adminFlag: {
        type: Boolean,
        default: false
    },
    testerFlag: {
        type: Boolean,
        default: false
    },
    telephone: {
        type: String,
        // required: true
    },
    address: {
        type: String,
        // required: true
    },
    city: {
        type: String,
        // required: true
    },
    province: {
        type: String,
        // required: true
    },
    postalcode: {
        type: String,
        // required: true
    },
    companyName: {
        type: String,
        // required: true
    },
    resetToken: {
        type: String
    },
    resetTokenExpires: {
        type: Date
    },
    termsConsent: {
        type: Boolean,
        default: false
    },
    consentReceivedDate: {
        type: Date
    },
    roles: [{
        type: Schema.Types.ObjectId,
        ref: 'Role',
        default: []
    }],
    createdAt: {
        type: Date,
        default: Date.now(),
        // get: createdAtVal => dateFormat(createdAtVal)
    }
    // TO DO: add password with encrypting
}, {
    toJSON: {
        // enable getters to format timestamps
        getters: true
    },
    // id: false
});

// set up pre-save middleware to create password
UserSchema.pre('save', async function (next) {
    if (this.isNew || this.isModified('password')) {
        const saltRounds = await bcrypt.genSalt();
        this.password = await bcrypt.hash(this.password, saltRounds);
    }

    next();
});

// Pre-save hook to store the username in lowercase
UserSchema.pre('save', function (next) {
    if (this.isModified('username')) {
        this.username = this.username.toLowerCase();
    }
    next();
});

// compare the incoming password with the hashed password
UserSchema.methods.isCorrectPassword = async function (password) {
    // console.log(password);
    return await bcrypt.compare(password, this.password);
};

const User = model('User', UserSchema);

module.exports = User;