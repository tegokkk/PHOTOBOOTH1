const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();
const supabase = require('../lib/supabase');

async function cleanupPhotos() {
  console.log('Starting photo cleanup task...');

  // Keep deleted photos for 30 days, while guest photos are temporary by design.
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const guestRetentionHours = Math.max(
    Number(process.env.GUEST_PHOTO_RETENTION_HOURS || 168),
    1
  );
  const guestCutoff = new Date(Date.now() - guestRetentionHours * 60 * 60 * 1000);

  try {
    const photosToDelete = await prisma.photo.findMany({
      where: {
        OR: [
          { deletedAt: { lte: thirtyDaysAgo } },
          { userId: null, deletedAt: null, createdAt: { lte: guestCutoff } },
        ],
      }
    });

    console.log(`Found ${photosToDelete.length} photos to permanently delete.`);

    let deletedCount = 0;
    for (const photo of photosToDelete) {
      if (photo.compositeImageUrl) {
        // compositeImageUrl looks like /api/media/photo_uuid.jpg
        const fileName = photo.compositeImageUrl.split('/').pop()?.split('?')[0];
        if (!fileName) throw new Error('Invalid media path during cleanup');

        if (supabase) {
          const { error } = await supabase.storage.from('photos').remove([fileName]);
          if (error) throw new Error(`Supabase cleanup failed: ${error.message}`);
        }

        const uploadsDir = path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads'));
        const filePath = path.resolve(uploadsDir, fileName);
        if (!filePath.startsWith(`${uploadsDir}${path.sep}`)) {
          throw new Error('Invalid media path during cleanup');
        }

        if (!supabase && fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      await prisma.photo.delete({ where: { id: photo.id } });
      deletedCount++;
    }

    console.log(`Successfully deleted ${deletedCount} photos.`);
  } catch (err) {
    console.error('Error during photo cleanup:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  cleanupPhotos();
}

module.exports = cleanupPhotos;
