const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');

// @route   GET /api/media/:filename
router.get('/:filename', mediaController.getMedia);

module.exports = router;
