const router = require('express').Router();
const { getUsers, createUser, getUserById, deleteUser, updateUser, login, migrateUsernamesToLowercase, resetPassword, getUserBookings, setUserConsent,
    logout,
    refreshToken
 } = require('../../controllers/userControllers');
const {authMiddleware} = require('../../utils/auth');
const requireAdminFlag = require('../../middleware/requireAdminFlag');
const { authRouteLimiter, adminRouteLimiter } = require('../../middleware/rateLimiters');
const validateCsrfToken = require('../../middleware/validateCsrfToken');

router.route('/')
    .get(adminRouteLimiter, authMiddleware, requireAdminFlag, getUsers)
    .post(createUser)
    .put(authRouteLimiter, authMiddleware, updateUser);
    
router.route('/migrate-user').put(migrateUsernamesToLowercase);

router.route('/:userId')
    .get(adminRouteLimiter, getUserById)
    .put(adminRouteLimiter, updateUser)
    .delete(adminRouteLimiter, deleteUser);

    router.route('/:userId/consent').patch(authRouteLimiter, setUserConsent);

router.route('/reset-password').post(authRouteLimiter, resetPassword);

router.route('/me').get(authRouteLimiter, authMiddleware, getUserById);

router.route('/:userId/bookings').get(authRouteLimiter, getUserBookings);

router.route('/login').post(authRouteLimiter, login);
router.route('/logout').post(authRouteLimiter, validateCsrfToken, logout);
router.route('/refresh').post(authRouteLimiter, validateCsrfToken, refreshToken);


// router.route('/:userId/friends/:friendId')
//     .post(addFriend)
//     .delete(removeFriend);

module.exports = router;
