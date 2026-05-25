const express = require('express');
const {
    getAdminAnalytics,
    getLowStockProducts,
    getUsers,
    updateUserStatus,
    updateUserRole,
    deleteUser,
} = require('../controllers/adminController');
const {protect, adminOnly} = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/analytics', getAdminAnalytics);
router.get('/low-stock', getLowStockProducts);
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router;