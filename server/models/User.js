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
    refreshToken: {
        type: String
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

// Convenience virtual: "First Last"
UserSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`.trim();
});

/**
 * Check if user has a given role name (e.g. 'admin', 'tester', 'customer')
 * Looks at Role documents AND legacy flags for now.
 */
UserSchema.methods.hasRole = async function (roleName) {
    const Role = require('./Role'); // avoid circular dep issues
    const target = (roleName || '').toLowerCase().trim();
    if (!target) return false;

    // Map legacy flags for backward compatibility
    if (target === 'admin' && this.adminFlag) return true;
    if (target === 'tester' && this.testerFlag) return true;

    if (!this.roles || this.roles.length === 0) return false;

    // Ensure roles are populated or fetch minimal fields
    const roleIds = this.roles.map((r) => r._id ? r._id : r);
    const roles = await Role.find({ _id: { $in: roleIds } }).select('name');

    return roles.some((r) => r.name === target);
};

/**
 * Check if user has a given permission (e.g. 'notifications.manage_templates')
 * This walks the roles and their inherited permissions.
 */
UserSchema.methods.hasPermission = async function (permissionKey) {
    if (!permissionKey) return false;

    // Quick path: adminFlag can bypass permissions if you want
    if (this.adminFlag) return true;

    const Role = require('./Role');
    const Permission = require('./Permission'); // assuming you have this

    if (!this.roles || this.roles.length === 0) return false;

    const roleIds = this.roles.map((r) => (r._id ? r._id : r));
    const roles = await Role.find({ _id: { $in: roleIds } });

    // Collect all permission ids from all roles (with inheritance)
    const permIdsSet = new Set();

    for (const role of roles) {
        const effective = await role.getEffectivePermissions();
        effective.forEach((id) => permIdsSet.add(id.toString()));
    }

    if (permIdsSet.size === 0) return false;

    // Check if any of those permissions match the key
    const perms = await Permission.find({
        _id: { $in: Array.from(permIdsSet) },
    }).select('key');

    return perms.some((p) => p.key === permissionKey);
};


const User = model('User', UserSchema);

module.exports = User;