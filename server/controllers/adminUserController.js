// controllers/adminUserController.js
const User = require('../models/User');
const Role = require('../models/Role');

const normalizeRoleName = (name) =>
    (name || '').toLowerCase().trim();

/**
 * Find or create a Role document for a given roleName.
 * This is where we define default labels & priorities.
 */
const resolveRoleByName = async (roleName) => {
    const name = normalizeRoleName(roleName || 'customer');

    let role = await Role.findOne({ name });
    if (role) return role;

    // Create some sane defaults for the main roles
    let label = name.charAt(0).toUpperCase() + name.slice(1);
    let priority = 0;

    if (name === 'admin') {
        label = 'Admin';
        priority = 100;
    } else if (name === 'staff') {
        label = 'Staff';
        priority = 50;
    } else if (name === 'tester') {
        label = 'Tester';
        priority = 40;
    } else if (name === 'customer') {
        label = 'Customer';
        priority = 10;
    }

    role = await Role.create({
        name,
        label,
        isSystem: true,
        priority,
    });

    return role;
};

/**
 * Apply a "primary role" label (string) to a user:
 * - find/create Role doc
 * - set user.roles = [role._id] (for now: single primary role)
 * - sync adminFlag / testerFlag for backward compatibility
 */
const applyPrimaryRoleToUser = async (user, roleName) => {
    const role = await resolveRoleByName(roleName);

    user.roles = [role._id];

    // Legacy flags
    const name = role.name;
    user.adminFlag = name === 'admin';
    user.testerFlag = name === 'tester';

    return user;
};

/* ============================
   GET /api/admin/users
============================ */

const getUsers = async (req, res) => {
    try {
        const users = await User.find({})
            .select('-password -resetToken -resetTokenExpires') // don’t leak secrets
            .populate({
                path: 'roles',
                select: 'name label priority',
            })
            .sort({ createdAt: -1 });

        return res.status(200).json(users);
    } catch (err) {
        console.error('[AdminUserController] getUsers error:', err);
        return res.status(500).json({ message: 'Failed to load users.' });
    }
};

/* ============================
   GET /api/admin/roles
============================ */

const getRoles = async (req, res) => {
    try {
        const roles = await Role.find({})
            .select('name label description priority isSystem')
            .sort({ priority: -1, name: 1 });

        return res.status(200).json(roles);
    } catch (err) {
        console.error('[AdminUserController] getRoles error:', err);
        return res.status(500).json({ message: 'Failed to load roles.' });
    }
};

/* ============================
   POST /api/admin/users
   Create user + assign primary role
============================ */

const createUser = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            username,
            password,
            roleName,
            adminFlag,
            testerFlag,
        } = req.body;

        if (!firstName || !lastName || !email || !username || !password) {
            return res.status(400).json({
                message: 'firstName, lastName, email, username, and password are required.',
            });
        }

        // Basic user creation (password hashing handled in pre-save)
        let user = new User({
            firstName,
            lastName,
            email,
            username,
            password,
            adminFlag: !!adminFlag,
            testerFlag: !!testerFlag,
        });

        // If roleName is provided, use it, else infer from flags or default
        let primaryRoleName = roleName;
        if (!primaryRoleName) {
            if (adminFlag) primaryRoleName = 'admin';
            else if (testerFlag) primaryRoleName = 'tester';
            else primaryRoleName = 'customer';
        }

        user = await applyPrimaryRoleToUser(user, primaryRoleName);
        await user.save();

        const populated = await User.findById(user._id)
            .select('-password -resetToken -resetTokenExpires')
            .populate({
                path: 'roles',
                select: 'name label priority',
            });

        return res.status(201).json(populated);
    } catch (err) {
        console.error('[AdminUserController] createUser error:', err);

        if (err.code === 11000) {
            // Duplicate key
            const field = Object.keys(err.keyPattern || {})[0] || 'field';
            return res.status(400).json({
                message: `Duplicate ${field}. A user with that ${field} already exists.`,
            });
        }

        return res.status(500).json({ message: 'Failed to create user.' });
    }
};

/* ============================
   PUT /api/admin/users/:id
   Update user + primary role
============================ */

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            firstName,
            lastName,
            email,
            username,
            roleName,
            adminFlag,
            testerFlag,
        } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (email !== undefined) user.email = email;
        if (username !== undefined) user.username = username;

        // Optional: protect yourself from accidentally removing your own admin role here
        // (you can implement "cannot demote last admin" logic later if needed)

        // Determine primary role name
        let primaryRoleName = roleName;
        if (!primaryRoleName) {
            // If not provided, infer from flags or default
            if (adminFlag) primaryRoleName = 'admin';
            else if (testerFlag) primaryRoleName = 'tester';
        }

        if (primaryRoleName) {
            await applyPrimaryRoleToUser(user, primaryRoleName);
        } else {
            // If no role change requested, we still sync flags if provided
            if (adminFlag !== undefined) user.adminFlag = !!adminFlag;
            if (testerFlag !== undefined) user.testerFlag = !!testerFlag;
        }

        await user.save();

        const populated = await User.findById(user._id)
            .select('-password -resetToken -resetTokenExpires')
            .populate({
                path: 'roles',
                select: 'name label priority',
            });

        return res.status(200).json(populated);
    } catch (err) {
        console.error('[AdminUserController] updateUser error:', err);

        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern || {})[0] || 'field';
            return res.status(400).json({
                message: `Duplicate ${field}. A user with that ${field} already exists.`,
            });
        }

        return res.status(500).json({ message: 'Failed to update user.' });
    }
};

/* ============================
   DELETE /api/admin/users/:id
============================ */

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent deleting yourself
        if (req.user && req.user._id && req.user._id.toString() === id.toString()) {
            return res.status(400).json({
                message: 'You cannot delete your own account.',
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        await user.deleteOne();

        return res.status(204).send();
    } catch (err) {
        console.error('[AdminUserController] deleteUser error:', err);
        return res.status(500).json({ message: 'Failed to delete user.' });
    }
};

module.exports = {
    getUsers,
    getRoles,
    createUser,
    updateUser,
    deleteUser,
};
