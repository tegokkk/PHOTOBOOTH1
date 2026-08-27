const prisma = require('../lib/prisma');

const frameSelect = {
  id: true,
  name: true,
  category: true,
  imageUrl: true,
  // Preview assets keep the catalog fast; master assets are used for the
  // final composite/export. These columns are now part of the deployed schema.
  previewImageUrl: true,
  masterImageUrl: true,
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

const frameRelationsQuery = { select: frameSelect };

const getFrames = async (req, res) => {
  try {
    const frames = await prisma.frame.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      ...frameRelationsQuery,
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Frame catalog changes operationally; never let a CDN keep retired frames for a year.
    res.setHeader('Cache-Control', 'no-store, max-age=0');
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

    if (frame.isActive === false || frame.deletedAt) {
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
