const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Endpoint untuk metrics khusus admin
router.get('/metrics', adminController.getMetrics);
router.get('/photos', adminController.getRecentPhotos);

module.exports = router;
