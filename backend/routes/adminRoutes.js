const express = require('express');
const {getAdminAnalytics} = require('../controllers/adminController');
const {protect} = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/analytics', protect, getAdminAnalytics);

module.exports = router;