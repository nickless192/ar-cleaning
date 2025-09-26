const User = require('../models/User');
const Customer = require('../models/Customer');
const { signToken } = require('../utils/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


const userControllers = {
    // get all users
    getUsers(req, res) {
        User.find({})
            .select('-__v')
            .sort({ _id: -1 })
            .then(dbUserData => res.json(dbUserData))
            .catch(err => res.status(400).json(err));
    },
    // get user by id
    getUserById({ params }, res) {
        User.findOne({ username: params.username })
            .select('-__v')
            .then(dbUserData => {
                if (!dbUserData) {
                    res.status(404).json({ message: 'No user found with this id' });
                    return;
                }
                res.json(dbUserData);
            })
            .catch(err => res.status(500).json(err));
    },
    // create new user
    async createUser({ body }, res) {
        // check if consent was given
        if (!body.termsConsent) {
            return res.status(400).json({ message: 'You must agree to the terms and conditions.' });
        }
        // Set the consentReceivedDate to now
        body.consentReceivedDate = Date.now();

        User.create(body).
            then(dbUserData => {
                console.log(dbUserData);
                const token = signToken(dbUserData);
                res.status(200).json(
                    { token, dbUserData });
            })
            .catch(err => {
                console.log(err);
                res.status(400).json(err);
            });
    },
    // update user's information
    updateUser({ params, body }, res) {
        User.findByIdAndUpdate({ _id: params.userId }, body, { new: true })
            .select('-__v')
            .then(dbUserData => {
                if (!dbUserData) {
                    res.status(404).json({ message: 'No user found by this username' });
                    return;
                }
                res.json(dbUserData);
            })
            .catch(err => res.status(500).json(err));
    },
    deleteUser({ params }, res) {
        User.findByIdAndDelete({ _id: params.userId })
            .then(dbUserData => {
                if (!dbUserData) {
                    res.status(404).json({ message: 'No user found by this username' });
                    return;
                }
                res.json(dbUserData);
            })
            .catch(err => res.status(500).json(err));
    },
    async login({ body }, res) {
        const dbUserData = await User.findOne({ email: body.email });

        // if (dbUserData) {
        if (!dbUserData) {
            res.status(404).json({ message: 'No user found by this email' });
            return;
        }
        const correctPassword = await dbUserData.isCorrectPassword(body.password)
        // .then(token => console.log(token));
        // console.log(correctPassword);
        if (!correctPassword) {
            return res.status(401).json({ message: 'Wrong password!' });
        }
        const token = signToken(dbUserData);
        res.status(200).json({ token, dbUserData });
        // }
        // )
        // .catch(err => console.log(err))
    },
    async migrateUsernamesToLowercase(req, res) {
        try {
            const users = await User.find({});
            for (let user of users) {
                const lowercaseUsername = user.username.toLowerCase();
                if (user.username !== lowercaseUsername) {
                    user.username = lowercaseUsername;
                    await user.save();
                }
            }
            res.status(200).json({ message: 'Usernames successfully migrated to lowercase' });
        } catch (error) {
            console.error('Error during migration:', error);
            res.status(500).json({ message: 'Server error during migration' });
        }
    },
    async resetPassword({ body }, res) {
        const { token, password } = body;
        console.log(token);
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.SECRET_KEY);
            console.log(decoded);
        } catch (error) {
            return res.status(400).json({ message: 'Invalid or expired token' });            
        }

        const user = await User.findById(decoded.data.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });            
        }

        // Check if token is expired
        if (user.resetTokenExpires < Date.now()) {
            return res.status(400).json({ message: 'Token expired' });            
        }

        // Verify token matches the stored hashed token
        const tokenIsValid = bcrypt.compareSync(token, user.resetToken);
        if (!tokenIsValid) {
            return res.status(400).json({ message: 'Invalid token' });
            
        }

        // Update password
        // user.password = bcrypt.hashSync(password, 10);
        user.password = password;
        user.resetToken = null; // Clear reset token after successful reset
        user.resetTokenExpires = null;
        await user.save();

        res.status(200).json({ message: 'Password successfully reset' });
    },
    async getUserBookings({ params }, res) {
        // get userId and check if its linked to customer and get the customer bookings
        try {
            // const user = await User.findById(params.userId);
            // if (!user) return res.status(404).json({ message: 'User not found' });

            const customer = await Customer.findOne({ user: params.userId }).populate('bookings');
            if (!customer) return res.status(404).json({ message: 'No customer linked to this user' });

            res.json({ bookings: customer.bookings });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch user bookings' });
        }
    },
    async setUserConsent({ params, body }, res) {
        try {
            const user = await User.findById(params.userId);
            if (!user) return res.status(404).json({ message: 'No user found' });

            user.termsConsent = body.termsConsent;
            user.consentReceivedDate = body.consentReceivedDate;
            await user.save();

            res.json({ message: 'User consent updated successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to update user consent' });
        }
    }    
};

module.exports = userControllers;