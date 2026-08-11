const express = require('express');
const router = express.Router();
const frameController = require('../controllers/frameController');

// @route   GET /api/frames
// @desc    Get all active frames
router.get('/', frameController.getFrames);

// @route   GET /api/frames/:id
// @desc    Get single frame by ID
router.get('/:id', frameController.getFrameById);

module.exports = router;
