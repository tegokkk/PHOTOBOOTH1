const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function cleanupPhotos() {
  console.log('Starting photo cleanup task...');

  // Find photos deleted more than 30 days ago
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    const photosToDelete = await prisma.photo.findMany({
      where: {
        deletedAt: {
          lte: thirtyDaysAgo
        }
      }
    });

    console.log(`Found ${photosToDelete.length} photos to permanently delete.`);

    let deletedCount = 0;
    for (const photo of photosToDelete) {
      if (photo.compositeImageUrl) {
        // compositeImageUrl looks like /api/media/photo_uuid.jpg
        const fileName = photo.compositeImageUrl.split('/').pop();
        const uploadsDir = path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads'));
        const filePath = path.resolve(uploadsDir, fileName);
        if (!filePath.startsWith(`${uploadsDir}${path.sep}`)) {
          throw new Error('Invalid media path during cleanup');
        }

        if (fs.existsSync(filePath)) {
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
