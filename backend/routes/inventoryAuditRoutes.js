const express = require('express');
const {protect} = require('../middleware/authMiddleware');
const {getAudits} = require('../controllers/inventoryAuditController');

const router = express.Router();

router.get('/', protect, getAudits);

module.exports = router;
