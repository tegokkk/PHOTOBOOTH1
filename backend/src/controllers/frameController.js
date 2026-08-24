const prisma = require('../lib/prisma');

const frameAssetColumnsEnabled = process.env.FRAME_ASSET_COLUMNS_ENABLED === 'true';

const frameSelect = {
  id: true,
  name: true,
  category: true,
  imageUrl: true,
  cssPlaceholder: true,
  width: true,
  height: true,
  description: true,
  isActive: true,
  isPremium: true,
  designCredit: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  slots: {
    orderBy: { zIndex: 'asc' },
  },
};

if (frameAssetColumnsEnabled) {
  frameSelect.previewImageUrl = true;
  frameSelect.masterImageUrl = true;
}

const frameRelationsQuery = { select: frameSelect };

const getFrames = async (req, res) => {
  try {
    const frames = await prisma.frame.findMany({
      where: {
        isActive: true
      },
      ...frameRelationsQuery,
      orderBy: {
        createdAt: 'asc'
      }
    });

    res.status(200).json({
      success: true,
      data: frames
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch frames'
    });
  }
};

const getFrameById = async (req, res) => {
  try {
    const { id } = req.params;
    const frame = await prisma.frame.findUnique({
      where: { id },
      ...frameRelationsQuery,
    });

    if (!frame) {
      return res.status(404).json({
        success: false,
        message: 'Frame not found'
      });
    }

    res.status(200).json({
      success: true,
      data: frame
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch frame'
    });
  }
};

module.exports = {
  getFrames,
  getFrameById
};
