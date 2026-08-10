const fs = require('fs');
const path = require('path');
const prisma = require('../lib/prisma');

const uploadPhoto = async (req, res) => {
  try {
    const { frameId, compositeImageBase64, isPublic } = req.body;

    if (!compositeImageBase64) {
      return res.status(400).json({ success: false, message: 'Image data is required' });
    }

    // Extract base64 data
    const matches = compositeImageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ success: false, message: 'Invalid image data' });
    }

    const mimeType = matches[1];
    
    // Validate MIME type
    if (mimeType !== 'image/png' && mimeType !== 'image/jpeg') {
      return res.status(400).json({ success: false, message: 'Invalid image format. Only PNG or JPEG allowed.' });
    }

    const imageBuffer = Buffer.from(matches[2], 'base64');
    const ext = mimeType.includes('jpeg') ? 'jpg' : 'png';
    const fileName = `photo_${Date.now()}.${ext}`;
    const uploadsDir = path.join(__dirname, '../../uploads');
    const filePath = path.join(uploadsDir, fileName);

    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Save image to disk
    fs.writeFileSync(filePath, imageBuffer);

    const imageUrl = `/uploads/${fileName}`;

    // Save metadata to DB
    const newPhoto = await prisma.photo.create({
      data: {
        userId: req.user ? req.user.id : null,
        frameId: frameId || null,
        originalImageUrl: '',
        compositeImageUrl: imageUrl,
        fileSize: imageBuffer.length,
        isPublic: false,
      }
    });

    res.status(201).json({ success: true, data: newPhoto });
  } catch (error) {
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

    let where = { userId };

    const photos = await prisma.photo.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { frame: true },
      take: 100
    });

    res.status(200).json({ success: true, data: photos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getPhotoById = async (req, res) => {
  try {
    const { id } = req.params;
    const photo = await prisma.photo.findUnique({
      where: { id },
      include: { frame: true }
    });

    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }

    res.status(200).json({ success: true, data: photo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deletePhoto = async (req, res) => {
  try {
    const { id } = req.params;

    const photo = await prisma.photo.findUnique({ where: { id } });
    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }
    
    // Check ownership
    if (photo.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only delete your own photos' });
    }

    // Delete file from disk
    if (photo.compositeImageUrl && photo.compositeImageUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '../..', photo.compositeImageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete from DB
    await prisma.photo.delete({ where: { id } });

    res.status(200).json({ success: true, message: 'Photo deleted' });
  } catch (error) {
    console.error('Failed to delete photo:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  uploadPhoto,
  getPhotos,
  getPhotoById,
  deletePhoto
};
