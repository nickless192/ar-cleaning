const { Schema, model } = require('mongoose');
const { isEmail } = require('../utils/validators');
const dateFormat = require('../utils/dateFormat');
const bcrypt = require('bcrypt');

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        uniquie: true
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
    telephone: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        get: createdAtVal => dateFormat(createdAtVal)
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

// compare the incoming password with the hashed password
UserSchema.methods.isCorrectPassword = async function (password) {
    // console.log(password);
    return await bcrypt.compare(password, this.password);
};

const User = model('User', UserSchema);

module.exports = User;