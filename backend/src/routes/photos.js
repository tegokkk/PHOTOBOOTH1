const express = require('express');
const router = express.Router();
const photoController = require('../controllers/photoController');
const { optionalAuth, authMiddleware } = require('../middleware/auth');

// @route   POST /api/photos
router.post('/', optionalAuth, photoController.uploadPhoto);

// @route   GET /api/photos
router.get('/', authMiddleware, photoController.getPhotos);

// @route   GET /api/photos/:id
router.get('/:id', optionalAuth, photoController.getPhotoById);

// @route   DELETE /api/photos/:id
router.delete('/:id', authMiddleware, photoController.deletePhoto);

module.exports = router;
