const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputFiles = [
  { file: 'media_1787861649095.png', name: 'Pointer Newspaper', category: 'Creative' },
  { file: 'media_1787861658845.png', name: 'Pointer Striped', category: 'Creative' },
  { file: 'media_1787861678377.jpg', name: 'Film Strip Green', category: 'Classic', makeBlackTransparent: true },
  { file: 'media_1787861687715.jpg', name: 'Leather Polaroid', category: 'Classic', makeBlackTransparent: true }
];

const uploadedDir = 'C:\\Users\\ACER\\.gemini\\antigravity-ide\\brain\\df3ce4bf-c14c-4c96-9d81-9b1fd5bbf9e1\\.user_uploaded';
const outputDir = path.resolve(__dirname, '../frontend/public/frames');

async function processFrames() {
  const seedEntries = [];

  for (const item of inputFiles) {
    const inputPath = path.join(uploadedDir, item.file);
    const outputPath = path.join(outputDir, `${item.name}.webp`);

    console.log(`Processing ${item.name}...`);
    let image = sharp(inputPath);
    const metadata = await image.metadata();

    // Ensure we have an alpha channel
    const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

    // Process pixels to find slots and optionally make black transparent
    const width = info.width;
    const height = info.height;
    
    // Create a mask of "hole" pixels (transparent or black if requested)
    const isHole = new Uint8Array(width * height);
    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      const r = data[idx];
      const g = data[idx+1];
      const b = data[idx+2];
      const a = data[idx+3];

      if (a < 128) {
        isHole[i] = 1;
      } else if (item.makeBlackTransparent && r < 20 && g < 20 && b < 20) {
        isHole[i] = 1;
        // Make it transparent in the image buffer too
        data[idx] = 0; data[idx+1] = 0; data[idx+2] = 0; data[idx+3] = 0;
      }
    }

    // Save the modified image
    await sharp(data, { raw: { width, height, channels: 4 } })
      .webp({ quality: 90 })
      .toFile(outputPath);

    // Find bounding boxes of holes (connected components)
    const visited = new Uint8Array(width * height);
    const slots = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        if (isHole[i] && !visited[i]) {
          // BFS to find the bounding box of this hole
          let minX = x, maxX = x, minY = y, maxY = y;
          const queue = [i];
          visited[i] = 1;

          let head = 0;
          let area = 0;
          while (head < queue.length) {
            const curr = queue[head++];
            const cx = curr % width;
            const cy = Math.floor(curr / width);
            area++;

            if (cx < minX) minX = cx;
            if (cx > maxX) maxX = cx;
            if (cy < minY) minY = cy;
            if (cy > maxY) maxY = cy;

            // Neighbors
            const neighbors = [
              [cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]
            ];
            for (const [nx, ny] of neighbors) {
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const ni = ny * width + nx;
                if (isHole[ni] && !visited[ni]) {
                  visited[ni] = 1;
                  queue.push(ni);
                }
              }
            }
          }

          // Filter out small noise
          if (area > 500) {
             slots.push({
               x: minX,
               y: minY,
               w: maxX - minX + 1,
               h: maxY - minY + 1
             });
          }
        }
      }
    }

    // Sort slots top-to-bottom, left-to-right
    slots.sort((a, b) => (a.y - b.y) || (a.x - b.x));

    // Convert to percentage coordinates for seed.js
    const percentageSlots = slots.map(s => ({
      x: +(s.x / width).toFixed(4),
      y: +(s.y / height).toFixed(4),
      width: +(s.w / width).toFixed(4),
      height: +(s.h / height).toFixed(4)
    }));

    seedEntries.push({
      name: item.name,
      category: item.category,
      imageUrl: `/frames/${item.name}.webp`,
      cssPlaceholder: 'bg-transparent',
      slots: percentageSlots
    });
  }

  console.log(JSON.stringify(seedEntries, null, 2));
}

processFrames().catch(console.error);
