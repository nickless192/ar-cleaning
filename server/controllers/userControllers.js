const { User } = require('../models');

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
        User.findById({ _id: params.userId })            
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
    createUser({ body }, res) {
        User.create(body).
            then(dbUserData => {
                console.log(dbUserData);
                res.json(dbUserData);
            } )
            .catch(err => {
                console.log(err);
                res.status(400).json(err);
            }) ;
    },
    // update user's information
    updateUser({ params, body }, res) {
        User.findByIdAndUpdate({ _id: params.userId }, body, { new: true })            
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
    deleteUser({ params }, res) {
        User.findByIdAndDelete({ _id: params.userId })
            .then(dbUserData => {
                if (!dbUserData) {
                    res.status(404).json({ message: 'No user found with this id' });
                    return;
                }
                res.json(dbUserData);
            })
            .catch(err => res.status(500).json(err));
    }
};

module.exports = userControllers;