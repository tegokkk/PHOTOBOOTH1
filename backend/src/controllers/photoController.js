const photoService = require('../services/photoService');

const uploadPhoto = async (req, res) => {
  try {
    const { frameId, compositeImageBase64 } = req.body;
    
    const newPhoto = await photoService.processAndSavePhoto({
      frameId,
      compositeImageBase64,
      userId: req.user ? req.user.id : null,
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });

    res.status(201).json({ success: true, data: newPhoto });
  } catch (error) {
    if (error.message.includes('Invalid') || error.message.includes('too large') || error.message.includes('required')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Failed to upload photo:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getPhotos = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { cursor, limit, status } = req.query;
    
    const result = await photoService.getPhotosList(userId, limit, cursor, status);

    res.status(200).json({ 
      success: true, 
      data: result.photos, 
      pagination: result.pagination 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getPhotoById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;
    const isAdmin = req.user ? req.user.isAdmin : false;
    const guestAccessToken = typeof req.query.accessToken === 'string' ? req.query.accessToken : null;

    const photo = await photoService.getSinglePhoto(id, userId, isAdmin, guestAccessToken);
    res.status(200).json({ success: true, data: photo });
  } catch (error) {
    if (error.message === 'Photo not found') return res.status(404).json({ success: false, message: error.message });
    if (error.message === 'Forbidden') return res.status(403).json({ success: false, message: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deletePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    await photoService.trashPhoto(id, req.user.id);
    res.status(200).json({ success: true, message: 'Photo moved to trash' });
  } catch (error) {
    if (error.message === 'Photo not found') return res.status(404).json({ success: false, message: error.message });
    if (error.message.startsWith('Forbidden')) return res.status(403).json({ success: false, message: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const restorePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    await photoService.restorePhotoFromTrash(id, req.user.id);
    res.status(200).json({ success: true, message: 'Photo restored' });
  } catch (error) {
    if (error.message === 'Photo not found') return res.status(404).json({ success: false, message: error.message });
    if (error.message.startsWith('Forbidden')) return res.status(403).json({ success: false, message: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const permanentDeletePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;
    const isAdmin = req.user ? req.user.isAdmin : false;

    await photoService.permanentDeletePhoto(id, userId, isAdmin);
    res.status(200).json({ success: true, message: 'Photo permanently deleted' });
  } catch (error) {
    if (error.message === 'Photo not found') return res.status(404).json({ success: false, message: error.message });
    if (error.message.startsWith('Forbidden')) return res.status(403).json({ success: false, message: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  uploadPhoto,
  getPhotos,
  getPhotoById,
  deletePhoto,
  restorePhoto,
  permanentDeletePhoto
};
