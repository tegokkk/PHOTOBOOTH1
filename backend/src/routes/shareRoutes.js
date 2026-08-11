const express = require('express');
const router = express.Router();
const shareController = require('../controllers/shareController');
const { optionalAuth } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

const shareLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many share requests, please try again later.' }
});

// @route   POST /api/share
router.post('/', shareLimiter, optionalAuth, shareController.createShareLink);

// @route   GET /api/share/:token
router.get('/:token', shareController.getSharedPhoto);

// @route   DELETE /api/share/:token
router.delete('/:token', optionalAuth, shareController.revokeShareLink);

module.exports = router;
