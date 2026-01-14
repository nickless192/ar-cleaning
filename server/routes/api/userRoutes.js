const router = require('express').Router();
const { getUsers, createUser, getUserById, deleteUser, updateUser, login, migrateUsernamesToLowercase, resetPassword, getUserBookings, setUserConsent,
    logout,
    refreshToken
 } = require('../../controllers/userControllers');
const {authMiddleware} = require('../../utils/auth');

router.route('/')
    .get(getUsers)
    .post(createUser)
    .put(authMiddleware, updateUser);
    
router.route('/migrate-user').put(migrateUsernamesToLowercase);

router.route('/:userId')
    .get(getUserById)
    .put(updateUser)
    .delete(deleteUser);

    router.route('/:userId/consent').patch(setUserConsent);

router.route('/reset-password').post(resetPassword);

router.route('/me').get(authMiddleware, getUserById);

router.route('/:userId/bookings').get(getUserBookings);

router.route('/login').post(login);
router.route('/logout').post(logout);
router.route('/refresh').post(refreshToken);


// router.route('/:userId/friends/:friendId')
//     .post(addFriend)
//     .delete(removeFriend);

module.exports = router;