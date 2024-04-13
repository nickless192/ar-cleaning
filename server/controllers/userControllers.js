const { User } = require('../models');
const {signToken} = require('../utils/auth');

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
        User.findOne({ userName: params.userName })            
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
                const token = signToken(dbUserData);
                res.json({token, dbUserData});
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
                    res.status(404).json({ message: 'No user found by this userName' });
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
                    res.status(404).json({ message: 'No user found by this userName' });
                    return;
                }
                res.json(dbUserData);
            })
            .catch(err => res.status(500).json(err));
    },
    login({body}, res) {
        User.findOne({userName: body.userName})
        .then (dbUserData => {
            if(!dbUserData) {
                res.status(404).json({message: 'No user found by this userName'});
                return;
            }
            const correctPassword = dbUserData.isCorrectPassword(body.password);
            if (!correctPassword) {
                return res.status(400).json({message: 'Wrong password!'});
            }
            const token = signToken(dbUserData);
            res.json({token, dbUserData});
        })
    }
};

module.exports = userControllers;