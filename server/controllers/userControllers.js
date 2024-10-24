const { User } = require('../models');
const { signToken } = require('../utils/auth');

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
    async login ({ body }, res) {
        const dbUserData = await User.findOne({ username: body.username.toLowerCase() });

        // if (dbUserData) {
        if (!dbUserData) {
            res.status(404).json({ message: 'No user found by this username' });
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
    async migrateUsernamesToLowercase (req, res) {
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
      }
};

module.exports = userControllers;