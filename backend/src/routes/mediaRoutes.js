const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { optionalAuth } = require('../middleware/authMiddleware');

// @route   GET /api/media/:filename
router.get('/:filename', optionalAuth, mediaController.getMedia);

module.exports = router;
