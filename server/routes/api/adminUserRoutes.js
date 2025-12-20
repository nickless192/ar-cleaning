// routes/adminUserRoutes.js
const router = require('express').Router();
// const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../../middleware/requireRole');
const {
    getUsers,
    getRoles,
    createUser,
    updateUser,
    deleteUser,
} = require('../../controllers/adminUserController');

// All routes in this file require authentication + admin role
// router.use(authMiddleware);
router.use(requireRole('admin')); // or 'super_admin' if you add that later

// GET /api/admin/users
router.get('/users', getUsers);

// GET /api/admin/roles
router.get('/roles', getRoles);

// POST /api/admin/users
router.post('/users', createUser);

// PUT /api/admin/users/:id
router.put('/users/:id', updateUser);

// DELETE /api/admin/users/:id
router.delete('/users/:id', deleteUser);

module.exports = router;
