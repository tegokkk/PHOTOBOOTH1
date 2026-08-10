const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { success: false, message: 'Too many requests, please try again later.' }
});

// @route   POST /api/auth/register
router.post('/register', authLimiter, authController.register);

// @route   POST /api/auth/login
router.post('/login', authLimiter, authController.login);

// @route   GET /api/auth/me
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
