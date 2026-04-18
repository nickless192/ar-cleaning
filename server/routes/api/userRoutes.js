const router = require('express').Router();
const { getUsers, createUser, getUserById, deleteUser, updateUser, login, migrateUsernamesToLowercase, resetPassword, getUserBookings, setUserConsent,
    logout,
    refreshToken
 } = require('../../controllers/userControllers');
const {authMiddleware} = require('../../utils/auth');
const requireAdminFlag = require('../../middleware/requireAdminFlag');
const { authRouteLimiter, adminRouteLimiter } = require('../../middleware/rateLimiters');
const validateCsrfToken = require('../../middleware/validateCsrfToken');

const requireSelfOrAdmin = (req, res, next) => {
    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    if (req.user.adminFlag || String(req.user._id) === String(req.params.userId)) {
        return next();
    }

    return res.status(403).json({ message: 'Not authorized' });
};

router.route('/')
    .get(adminRouteLimiter, authMiddleware, requireAdminFlag, getUsers)
    .post(authRouteLimiter, createUser)
    .put(authRouteLimiter, authMiddleware, updateUser);
    
router.route('/migrate-user').put(adminRouteLimiter, authMiddleware, requireAdminFlag, migrateUsernamesToLowercase);

router.route('/:userId')
    .get(adminRouteLimiter, authMiddleware, requireSelfOrAdmin, getUserById)
    .put(adminRouteLimiter, authMiddleware, requireSelfOrAdmin, updateUser)
    .delete(adminRouteLimiter, authMiddleware, requireSelfOrAdmin, deleteUser);

    router.route('/:userId/consent').patch(authRouteLimiter, authMiddleware, requireSelfOrAdmin, setUserConsent);

router.route('/reset-password').post(authRouteLimiter, resetPassword);

router.route('/me').get(authRouteLimiter, authMiddleware, getUserById);

router.route('/:userId/bookings').get(authRouteLimiter, authMiddleware, requireSelfOrAdmin, getUserBookings);

router.route('/login').post(authRouteLimiter, login);
router.route('/logout').post(authRouteLimiter, validateCsrfToken, logout);
router.route('/refresh').post(authRouteLimiter, validateCsrfToken, refreshToken);


// router.route('/:userId/friends/:friendId')
//     .post(addFriend)
//     .delete(removeFriend);

module.exports = router;
