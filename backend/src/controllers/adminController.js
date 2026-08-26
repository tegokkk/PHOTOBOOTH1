const prisma = require('../lib/prisma');
const photoService = require('../services/photoService');

const getMetrics = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    
    // Filter out trashed photos from count
    const totalPhotos = await prisma.photo.count({
      where: { deletedAt: null }
    });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const photosToday = await prisma.photo.count({
      where: {
        createdAt: { gte: startOfToday },
        deletedAt: null
      }
    });

    // Approximate file size (sum of fileSize column)
    const aggregate = await prisma.photo.aggregate({
      _sum: { fileSize: true },
      where: { deletedAt: null }
    });

    // fileSize is in bytes, convert to MB
    const totalBytes = aggregate._sum.fileSize || 0;
    const totalStorageMB = (totalBytes / (1024 * 1024)).toFixed(2);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalPhotos,
        photosToday,
        totalStorageMB
      }
    });
  } catch (error) {
    console.error('Failed to fetch admin metrics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getRecentPhotos = async (req, res) => {
  try {
    const photos = await photoService.getAdminPhotosList(req.query.limit);
    res.status(200).json({ success: true, data: photos });
  } catch (error) {
    console.error('Failed to fetch admin photos:', error);
    res.status(500).json({ success: false, message: 'Server error', requestId: req.requestId });
  }
};

module.exports = {
  getMetrics,
  getRecentPhotos
};
