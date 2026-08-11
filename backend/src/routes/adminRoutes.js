const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyAdmin } = require('../middleware/authMiddleware');

// Endpoint untuk metrics khusus admin
router.get('/metrics', verifyAdmin, adminController.getMetrics);

module.exports = router;
