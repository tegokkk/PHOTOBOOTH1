const prisma = require('../lib/prisma');

const getFrames = async (req, res) => {
  try {
    const frames = await prisma.frame.findMany({
      where: {
        isActive: true
      },
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
      where: { id }
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
