const express = require('express');
const {
    getAdminAnalytics,
    getUsers,
    updateUserStatus,
    updateUserRole,
    deleteUser,
} = require('../controllers/adminController');
const {protect} = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/analytics', protect, getAdminAnalytics);
router.get('/users', protect, getUsers);
router.put('/users/:id/status', protect, updateUserStatus);
router.put('/users/:id/role', protect, updateUserRole);
router.delete('/users/:id', protect, deleteUser);

module.exports = router;