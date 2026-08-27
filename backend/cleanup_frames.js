const fs = require('fs');
const path = require('path');

const seedPath = 'd:/TEGO/BACK UP/PEOJECTTTTTTT/PHOTOBOOTH/backend/prisma/seed.js';
const framesDir = 'd:/TEGO/BACK UP/PEOJECTTTTTTT/PHOTOBOOTH/frontend/public/frames';

const content = fs.readFileSync(seedPath, 'utf8');

const match = content.match(/const MOCK_FRAMES = (\[[\s\S]*?\]);\s*async function main/);
if (!match) {
  console.log('Failed to find MOCK_FRAMES');
  process.exit(1);
}

const mockFramesStr = match[1];
const MOCK_FRAMES = eval(`(${mockFramesStr})`);

// Extract just the filenames that are used
const usedFiles = new Set();
for (const frame of MOCK_FRAMES) {
  if (frame.imageUrl) {
    usedFiles.add(path.basename(frame.imageUrl));
    // also keep the preview file if it exists, it might be named with -preview.webp
    // getFramePreviewUrl logic:
    // ext = frame.imageUrl.split('.').pop()
    // return frame.imageUrl.replace(`.${ext}`, `-preview.webp`)
    const ext = frame.imageUrl.split('.').pop();
    const previewName = path.basename(frame.imageUrl).replace(`.${ext}`, `-preview.webp`);
    usedFiles.add(previewName);
  }
}

// Delete files that are not used
const files = fs.readdirSync(framesDir);
let deletedCount = 0;
for (const file of files) {
  if (!usedFiles.has(file)) {
    console.log(`Deleting unused file: ${file}`);
    fs.unlinkSync(path.join(framesDir, file));
    deletedCount++;
  }
}

console.log(`\nCleanup complete! Deleted ${deletedCount} unused files.`);
