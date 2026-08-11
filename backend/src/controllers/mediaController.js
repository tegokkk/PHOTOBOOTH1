const path = require('path');
const fs = require('fs');
const prisma = require('../lib/prisma');
const { hasValidGuestAccess } = require('../services/photoService');

const getMedia = async (req, res) => {
  try {
    const { filename } = req.params;
    const shareToken = typeof req.query.token === 'string' ? req.query.token : null;
    const guestToken = typeof req.query.accessToken === 'string' ? req.query.accessToken : null;

    // Prevent directory traversal attacks
    if (!filename || filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
      return res.status(400).json({ success: false, message: 'Invalid filename' });
    }

    // Find the corresponding photo record
    const photoUrl = `/api/media/${filename}`;
    // We search for both old format and new format just in case
    const photo = await prisma.photo.findFirst({
      where: {
        OR: [
          { compositeImageUrl: photoUrl },
          { compositeImageUrl: `/uploads/${filename}` }
        ]
      }
    });

    if (!photo) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }

    // Access Control Logic
    let authorized = false;

    // 1. Check if public
    if (photo.isPublic) {
      authorized = true;
    }

    // 2. Check if user is owner or admin
    if (!authorized && req.user) {
      if (req.user.id === photo.userId || req.user.isAdmin) {
        authorized = true;
      }
    }

    // 3. Check if valid share token provided
    if (!authorized && shareToken) {
      const shareLink = await prisma.shareLink.findFirst({
        where: {
          photoId: photo.id,
          token: shareToken
        }
      });
      
      if (shareLink) {
        // Check expiry
        if (!shareLink.expiresAt || new Date() < shareLink.expiresAt) {
          authorized = true;
        }
      }
    }

    if (!authorized && hasValidGuestAccess(photo, guestToken)) {
      authorized = true;
    }

    // Anonymous uploads (where userId is null) can be accessed if we decide on a policy, 
    // but typically they are accessed via share tokens or immediately downloaded on the frontend.
    // If the frontend needs to render the preview immediately after upload, the user usually 
    // doesn't have an auth token. We might need a guest session token for that, or 
    // we assume the frontend downloads it as blob directly without re-fetching from URL.
    // Since we need to allow anonymous users to view their just-taken photos (if no account),
    // we should see if we need a temporary guest token. For now, strict auth.
    // Actually, if userId is null, how does the anonymous user view it?
    // They get the share link immediately, or they have the base64. 
    // If they need to download it later, they need the share link.
    // We will stick to the strict rules for now as requested by Task 3.

    if (!authorized) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not have access to this media' });
    }

    // Serve the file
    const uploadsDir = path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads'));
    const filePath = path.resolve(uploadsDir, filename);
    if (!filePath.startsWith(`${uploadsDir}${path.sep}`)) {
      return res.status(400).json({ success: false, message: 'Invalid filename' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on disk' });
    }

    // Security headers appropriate to privacy
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Cache-Control', 'private, max-age=3600'); // Cache privately

    res.sendFile(filePath);
  } catch (error) {
    console.error('Media Access Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getMedia
};
