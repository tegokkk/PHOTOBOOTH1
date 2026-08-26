const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { hasValidGuestAccess } = require('../services/photoService');

// POST /api/share
const createShareLink = async (req, res) => {
  try {
    const { photoId, accessToken } = req.body || {};
    
    if (!photoId) {
      return res.status(400).json({ success: false, message: 'Photo ID is required' });
    }

    const photo = await prisma.photo.findUnique({ where: { id: photoId } });
    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }

    if (photo.deletedAt) {
      return res.status(410).json({ success: false, message: 'Cannot share a deleted photo' });
    }

    // Ownership check
    const userId = req.user ? req.user.id : null;
    const isAdmin = req.user ? req.user.isAdmin : false;
    
    const guestAccess = accessToken || req.header('X-Photo-Access-Token');
    const isOwner = photo.userId && photo.userId === userId;
    if (!isOwner && !isAdmin && !hasValidGuestAccess(photo, guestAccess)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // High entropy token (32 hex chars)
    const token = crypto.randomBytes(16).toString('hex');

    // Default expired 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Transaction for creation and increment
    const [shareLink] = await prisma.$transaction([
      prisma.shareLink.create({
        data: {
          photoId,
          createdById: userId,
          token,
          expiresAt,
        },
      }),
      prisma.photo.update({
        where: { id: photoId },
        data: { shareCount: { increment: 1 } },
      })
    ]);

    res.status(201).json({ success: true, data: { token: shareLink.token, expiresAt: shareLink.expiresAt } });
  } catch (error) {
    console.error('Failed to create share link:', error);
    res.status(500).json({ success: false, message: 'Server error', requestId: req.requestId });
  }
};

// GET /api/share/:token
const getSharedPhoto = async (req, res) => {
  try {
    const { token } = req.params;

    const shareLink = await prisma.shareLink.findUnique({
      where: { token },
      include: {
        photo: {
          include: { frame: true }
        }
      }
    });

    if (!shareLink) {
      return res.status(404).json({ success: false, message: 'Link not found or invalid' });
    }

    // Check expired
    if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
      return res.status(410).json({ success: false, message: 'This link has expired' });
    }

    // Check if photo is deleted
    if (shareLink.photo.deletedAt) {
      return res.status(410).json({ success: false, message: 'This photo has been deleted' });
    }

    // Avoid double counting from bots/prefetch
    const userAgent = req.headers['user-agent'] || '';
    const isBot = /bot|googlebot|crawler|spider|robot|crawling|whatsapp|facebook|twitter|slack/i.test(userAgent);
    const purpose = req.headers['x-purpose'] || req.headers['purpose'] || '';
    const isPrefetch = purpose.toLowerCase() === 'prefetch';

    if (!isBot && !isPrefetch) {
      await prisma.shareLink.update({
        where: { id: shareLink.id },
        data: { accessCount: { increment: 1 } },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        imageUrl: shareLink.photo.compositeImageUrl.startsWith('/api/media/')
          ? `${shareLink.photo.compositeImageUrl}?token=${encodeURIComponent(token)}`
          : shareLink.photo.compositeImageUrl,
        width: shareLink.photo.width,
        height: shareLink.photo.height,
        createdAt: shareLink.photo.createdAt,
        frame: shareLink.photo.frame ? {
          name: shareLink.photo.frame.name,
          category: shareLink.photo.frame.category,
        } : null
      }
    });
  } catch (error) {
    console.error('Failed to get shared photo:', error);
    res.status(500).json({ success: false, message: 'Server error', requestId: req.requestId });
  }
};

// DELETE /api/share/:token (Revoke)
const revokeShareLink = async (req, res) => {
  try {
    const { token } = req.params;
    const userId = req.user ? req.user.id : null;
    const isAdmin = req.user ? req.user.isAdmin : false;
    const guestAccessToken = req.body?.accessToken || req.header('X-Photo-Access-Token');

    const shareLink = await prisma.shareLink.findUnique({
      where: { token },
      include: { photo: true }
    });

    if (!shareLink) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }

    // Only owner of the photo or admin can revoke
    const isOwner = shareLink.photo.userId && shareLink.photo.userId === userId;
    if (!isOwner && !isAdmin && !hasValidGuestAccess(shareLink.photo, guestAccessToken)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    await prisma.shareLink.update({
      where: { token },
      data: { expiresAt: new Date() } // Expire immediately
    });

    res.status(200).json({ success: true, message: 'Share link revoked' });
  } catch (error) {
    console.error('Failed to revoke share link:', error);
    res.status(500).json({ success: false, message: 'Server error', requestId: req.requestId });
  }
};

module.exports = {
  createShareLink,
  getSharedPhoto,
  revokeShareLink
};
