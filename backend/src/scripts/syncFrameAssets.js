const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const prisma = require('../lib/prisma');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = process.env.FRAME_STORAGE_BUCKET || 'frames';
const previewDir = path.resolve(__dirname, '../../../frontend/public/frames');
const backendRoot = path.resolve(__dirname, '../..');
const masterDir = path.resolve(
  backendRoot,
  process.env.FRAME_MASTER_DIR || '../FRAME/masters'
);

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required to sync frame assets.'
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

function getFileName(imageUrl) {
  if (!imageUrl) return null;
  const basename = imageUrl.split('/').pop();
  return basename ? decodeURIComponent(basename) : null;
}

function getContentType(fileName) {
  const extension = path.extname(fileName).toLowerCase();
  if (extension === '.webp') return 'image/webp';
  if (extension === '.avif') return 'image/avif';
  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg';
  return 'image/png';
}

async function uploadFile(filePath, objectPath) {
  const fileBuffer = await fs.promises.readFile(filePath);
  const { error } = await supabase.storage.from(bucketName).upload(objectPath, fileBuffer, {
    contentType: getContentType(filePath),
    cacheControl: '31536000',
    upsert: true,
  });

  if (error) {
    throw new Error(`Failed to upload ${objectPath}: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(objectPath);
  return data.publicUrl;
}

async function main() {
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  if (bucketError) throw new Error(`Unable to list Supabase buckets: ${bucketError.message}`);
  if (!buckets.some((bucket) => bucket.name === bucketName)) {
    throw new Error(`Supabase bucket '${bucketName}' was not found.`);
  }

  const frames = await prisma.frame.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
  });

  let synced = 0;
  for (const frame of frames) {
    const fileName = getFileName(frame.imageUrl);
    if (!fileName) {
      await prisma.frame.update({
        where: { id: frame.id },
        data: { previewImageUrl: null, masterImageUrl: null },
      });
      continue;
    }

    const previewPath = path.join(previewDir, fileName);
    const masterCandidatePath = path.join(masterDir, fileName);
    const masterPath = fs.existsSync(masterCandidatePath) ? masterCandidatePath : previewPath;

    if (!fs.existsSync(previewPath)) {
      throw new Error(`Preview asset is missing: ${previewPath}`);
    }
    if (!fs.existsSync(masterPath)) {
      throw new Error(`Master asset is missing: ${masterPath}`);
    }

    const previewUrl = await uploadFile(previewPath, `preview/${fileName}`);
    const masterUrl = await uploadFile(masterPath, `master/${fileName}`);

    await prisma.frame.update({
      where: { id: frame.id },
      data: {
        previewImageUrl: previewUrl,
        masterImageUrl: masterUrl,
      },
    });

    synced += 1;
    console.log(`Synced frame: ${frame.name}`);
  }

  console.log(`Synced ${synced} frame assets to Supabase bucket '${bucketName}'.`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
