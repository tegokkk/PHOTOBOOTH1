const express = require('express');
const router = express.Router();
const photoController = require('../controllers/photoController');
const { optionalAuth, authMiddleware } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many uploads, please try again later.' }
});

// @route   POST /api/photos
router.post('/', uploadLimiter, optionalAuth, photoController.uploadPhoto);

// @route   GET /api/photos
router.get('/', authMiddleware, photoController.getPhotos);

// @route   GET /api/photos/:id
router.get('/:id', optionalAuth, photoController.getPhotoById);

// @route   DELETE /api/photos/:id
router.delete('/:id', authMiddleware, photoController.deletePhoto);

// @route   POST /api/photos/:id/restore
router.post('/:id/restore', authMiddleware, photoController.restorePhoto);

// @route   DELETE /api/photos/:id/permanent
router.delete('/:id/permanent', authMiddleware, photoController.permanentDeletePhoto);

module.exports = router;
