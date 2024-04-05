const {Schema, model} = require('mongoose');
const {isEmail} = require('../utils/validators');
const dateFormat = require('../utils/dateFormat');

const UserSchema = new Schema({
    userName: {
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
    firstName: {
        type: String,
        required: true
    },
    lastName: {
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

const User = model('User', UserSchema);

module.exports = User;