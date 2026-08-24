const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const framesDir = path.join(__dirname, '../frontend/public/frames');

async function main() {
  console.log('Starting preview generation...');
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE frames ADD COLUMN preview_image_url TEXT;');
    await prisma.$executeRawUnsafe('ALTER TABLE frames ADD COLUMN master_image_url TEXT;');
    console.log('Added missing columns to DB.');
  } catch (e) {
    console.log('Columns likely already exist, moving on.');
  }
  const frames = await prisma.frame.findMany();
  console.log(`Found ${frames.length} frames in database.`);

  for (const frame of frames) {
    if (!frame.imageUrl) continue;

    // e.g. "/frames/Blue%20Jeans.png" -> "Blue Jeans.png"
    let filename = frame.imageUrl;
    if (filename.startsWith('/frames/')) {
        filename = filename.substring('/frames/'.length);
    }
    filename = decodeURIComponent(filename);
    
    const filePath = path.join(framesDir, filename);

    if (!fs.existsSync(filePath)) {
      console.warn(`[WARN] File not found for frame ${frame.id}: ${filePath}`);
      continue;
    }

    const ext = path.extname(filename);
    const basename = path.basename(filename, ext);
    const previewFilename = `${basename}-preview.webp`;
    const previewFilePath = path.join(framesDir, previewFilename);

    console.log(`Processing: ${filename}`);

    try {
      // Generate WebP preview
      await sharp(filePath)
        .resize({ width: 500 }) // Auto height
        .webp({ quality: 80, nearLossless: true })
        .toFile(previewFilePath);

      // Encode filename for URL
      const previewUrl = `/frames/${encodeURIComponent(previewFilename)}`;
      
      // Update Database
      await prisma.frame.update({
        where: { id: frame.id },
        data: {
          masterImageUrl: frame.imageUrl,
          previewImageUrl: previewUrl
        }
      });
      console.log(`  -> Generated ${previewFilename} & updated DB`);
    } catch (err) {
      console.error(`  -> Failed to process ${filename}:`, err);
    }
  }

  console.log("All previews generated successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
