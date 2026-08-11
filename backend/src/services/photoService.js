const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const prisma = require('../lib/prisma');
const crypto = require('crypto');

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 8000;
const MAX_IMAGE_PIXELS = 40000000;

function checkMagicBytes(buffer) {
  if (buffer.length < 4) return false;
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return 'png';
  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return 'jpeg';
  return false;
}

function getPngDimensions(buffer) {
  if (buffer.length < 24 || buffer.readUInt32BE(12) !== 0x49484452) {
    throw new Error('Invalid PNG header');
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function getJpegDimensions(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    throw new Error('Invalid JPEG header');
  }

  let offset = 2;
  while (offset + 3 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    while (buffer[offset] === 0xff) offset += 1;
    const marker = buffer[offset];
    offset += 1;

    if (marker === 0xd8 || marker === 0xd9) continue;
    if (marker === 0xda) break;
    if (offset + 2 > buffer.length) break;

    const segmentLength = buffer.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > buffer.length) break;

    const isStartOfFrame =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);

    if (isStartOfFrame && offset + 7 < buffer.length) {
      return {
        height: buffer.readUInt16BE(offset + 3),
        width: buffer.readUInt16BE(offset + 5),
      };
    }

    offset += segmentLength;
  }

  throw new Error('JPEG dimensions not found');
}

function getImageDimensions(buffer, mimeType) {
  return mimeType === 'png'
    ? getPngDimensions(buffer)
    : getJpegDimensions(buffer);
}

function hashAccessToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function hasValidGuestAccess(photo, accessToken) {
  if (!photo?.guestAccessTokenHash || !accessToken || typeof accessToken !== 'string') {
    return false;
  }

  const providedHash = Buffer.from(hashAccessToken(accessToken), 'hex');
  const storedHash = Buffer.from(photo.guestAccessTokenHash, 'hex');
  return providedHash.length === storedHash.length && crypto.timingSafeEqual(providedHash, storedHash);
}

const processAndSavePhoto = async ({ frameId, compositeImageBase64, userId, userAgent, ip }) => {
  if (!compositeImageBase64) {
    throw new Error('Image data is required');
  }

  if (frameId) {
    const frame = await prisma.frame.findUnique({ where: { id: frameId } });
    if (!frame) {
      throw new Error('Invalid frame: Frame not found');
    }
    if (!frame.isActive) {
      throw new Error('Invalid frame: Frame is not active');
    }
  }

  const matches = compositeImageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid image data');
  }

  const mimeType = matches[1];
  if (mimeType !== 'image/png' && mimeType !== 'image/jpeg') {
    throw new Error('Invalid image format. Only PNG or JPEG allowed.');
  }

  const encodedImage = matches[2].replace(/\s/g, '');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(encodedImage)) {
    throw new Error('Invalid image data');
  }

  const imageBuffer = Buffer.from(encodedImage, 'base64');
  
  if (!imageBuffer.length) {
    throw new Error('Invalid image data');
  }

  if (imageBuffer.length > MAX_IMAGE_BYTES) {
    throw new Error('File too large. Maximum size is 5MB');
  }

  const actualMime = checkMagicBytes(imageBuffer);
  if (!actualMime || (actualMime !== 'png' && actualMime !== 'jpeg')) {
    throw new Error('Invalid file content. Real image file required.');
  }

  let dimensions;
  try {
    dimensions = getImageDimensions(imageBuffer, actualMime);
  } catch (err) {
    throw new Error('Corrupt image data.');
  }

  // Max dimension check
  if (!dimensions.width || !dimensions.height || dimensions.width > MAX_IMAGE_DIMENSION || dimensions.height > MAX_IMAGE_DIMENSION || (dimensions.width * dimensions.height > MAX_IMAGE_PIXELS)) {
    throw new Error('Image dimensions exceed maximum allowed limits.');
  }

  const ext = actualMime === 'jpeg' ? 'jpg' : 'png';
  const fileName = `photo_${crypto.randomUUID()}.${ext}`;
  const uploadsDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
  const filePath = path.join(uploadsDir, fileName);
  const guestAccessToken = userId ? null : crypto.randomBytes(32).toString('hex');

  const supabase = require('../lib/supabase');
  let fileWritten = false;
  try {
    if (supabase) {
      const { data, error } = await supabase.storage
        .from('photos')
        .upload(fileName, imageBuffer, {
          contentType: actualMime === 'jpeg' ? 'image/jpeg' : 'image/png',
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error('Supabase Storage Error: ' + error.message);
      }
      fileWritten = true;
    } else {
      // Fallback for local testing without Supabase
      if (!fs.existsSync(uploadsDir)) {
        await fsPromises.mkdir(uploadsDir, { recursive: true });
      }
      await fsPromises.writeFile(filePath, imageBuffer);
      fileWritten = true;
    }

    // Use /api/media/ path instead of static /uploads/
    const imageUrl = `/api/media/${fileName}`;
    const metadata = JSON.stringify({ userAgent, ip, originalMime: mimeType });

    const newPhoto = await prisma.photo.create({
      data: {
        userId: userId || null,
        frameId: frameId || null,
        originalImageUrl: '',
        compositeImageUrl: imageUrl,
        width: dimensions.width,
        height: dimensions.height,
        fileSize: imageBuffer.length,
        metadata: metadata,
        guestAccessTokenHash: guestAccessToken ? hashAccessToken(guestAccessToken) : null,
        isPublic: false,
      }
    });

    return guestAccessToken ? { ...newPhoto, guestAccessToken } : newPhoto;
  } catch (error) {
    if (fileWritten && !supabase && fs.existsSync(filePath)) {
      await fsPromises.unlink(filePath).catch(console.error);
    } else if (fileWritten && supabase) {
      await supabase.storage.from('photos').remove([fileName]).catch(console.error);
    }
    throw error;
  }
};

const getPhotosList = async (userId, limit, cursor, status) => {
  const take = Math.min(parseInt(limit, 10) || 20, 50);

  let where = { userId };
  if (status === 'trash') {
    where.deletedAt = { not: null };
  } else {
    where.deletedAt = null;
  }

  let queryArgs = {
    where,
    orderBy: { createdAt: 'desc' },
    include: { frame: true },
    take: take + 1,
  };

  if (cursor) {
    queryArgs.cursor = { id: cursor };
  }

  const photos = await prisma.photo.findMany(queryArgs);

  let hasNextPage = false;
  let nextCursor = null;

  if (photos.length > take) {
    hasNextPage = true;
    const nextItem = photos.pop();
    nextCursor = nextItem.id;
  }

  return { photos, pagination: { hasNextPage, nextCursor } };
};

const getSinglePhoto = async (id, userId, isAdmin, guestAccessToken) => {
  const photo = await prisma.photo.findUnique({
    where: { id },
    include: { frame: true }
  });

  if (!photo) throw new Error('Photo not found');
  const isOwner = photo.userId && photo.userId === userId;
  const hasAccess = photo.isPublic || isOwner || isAdmin || hasValidGuestAccess(photo, guestAccessToken);
  if (!hasAccess) {
    throw new Error('Forbidden');
  }

  return photo;
};

const trashPhoto = async (id, userId) => {
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) throw new Error('Photo not found');
  if (photo.userId !== userId) throw new Error('Forbidden: You can only delete your own photos');

  await prisma.photo.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
};

const restorePhotoFromTrash = async (id, userId) => {
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) throw new Error('Photo not found');
  if (photo.userId !== userId) throw new Error('Forbidden: You can only restore your own photos');

  await prisma.photo.update({
    where: { id },
    data: { deletedAt: null }
  });
};

const permanentDeletePhoto = async (id, userId, isAdmin) => {
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) throw new Error('Photo not found');
  if (photo.userId !== userId && !isAdmin) throw new Error('Forbidden: You can only permanently delete your own photos');

  if (photo.compositeImageUrl) {
    const fileName = photo.compositeImageUrl.split('/').pop();
    const supabase = require('../lib/supabase');
    if (supabase) {
      await supabase.storage.from('photos').remove([fileName]).catch(console.error);
    } else {
      const uploadsDir = path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads'));
      const filePath = path.resolve(uploadsDir, fileName);
      if (!filePath.startsWith(`${uploadsDir}${path.sep}`)) {
        throw new Error('Invalid media path');
      }
      if (fs.existsSync(filePath)) {
        await fsPromises.unlink(filePath).catch(console.error);
      }
    }
  }

  await prisma.photo.delete({ where: { id } });
};

module.exports = {
  processAndSavePhoto,
  getPhotosList,
  getSinglePhoto,
  trashPhoto,
  restorePhotoFromTrash,
  permanentDeletePhoto,
  checkMagicBytes,
  getImageDimensions,
  hashAccessToken,
  hasValidGuestAccess
};
