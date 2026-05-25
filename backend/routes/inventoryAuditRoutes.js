const express = require('express');
const {protect, adminOnly} = require('../middleware/authMiddleware');
const {getAudits} = require('../controllers/inventoryAuditController');

const router = express.Router();

router.get('/', protect, adminOnly, getAudits);

module.exports = router;
