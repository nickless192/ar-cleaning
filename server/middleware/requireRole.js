// middleware/requireRole.js
const User = require('../models/User');

const requireRole = (roleName) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user._id) {
                return res.status(401).json({ message: 'Not authenticated' });
            }

            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            const ok = await user.hasRole(roleName);
            if (!ok) {
                return res.status(403).json({ message: 'Not authorized' });
            }

            // Attach full user doc if useful
            req.currentUser = user;
            return next();
        } catch (err) {
            console.error('[requireRole] error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };
};

module.exports = requireRole;
