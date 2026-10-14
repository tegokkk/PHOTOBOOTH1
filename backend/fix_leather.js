const sharp = require('sharp');
const path = require('path');

const inputFile = 'C:\\Users\\ACER\\.gemini\\antigravity-ide\\brain\\df3ce4bf-c14c-4c96-9d81-9b1fd5bbf9e1\\.user_uploaded\\media_1787862255186.jpg';
const outputFile = path.resolve(__dirname, '../frontend/public/frames/Leather Polaroid.webp');

const slots = [
  { x: 0.4078, y: 0.0615, width: 0.1844, height: 0.1992 },
  { x: 0.4078, y: 0.2754, width: 0.1844, height: 0.1992 },
  { x: 0.4078, y: 0.4893, width: 0.1844, height: 0.1992 },
  { x: 0.4078, y: 0.7041, width: 0.1844, height: 0.1982 }
];

async function fixFrame() {
  console.log(`Processing Leather Polaroid...`);
  let image = sharp(inputFile);
  const metadata = await image.metadata();
  const width = metadata.width;
  const height = metadata.height;

  // Ensure we have an alpha channel
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  // Make specific slot regions transparent
  for (const slot of slots) {
    const startX = Math.floor(slot.x * width);
    const startY = Math.floor(slot.y * height);
    const w = Math.floor(slot.width * width);
    const h = Math.floor(slot.height * height);

    for (let y = startY; y < startY + h; y++) {
      for (let x = startX; x < startX + w; x++) {
        // Just a safety bound check
        if (x >= 0 && x < width && y >= 0 && y < height) {
          const idx = (y * width + x) * 4;
          // Set RGBA to 0,0,0,0
          data[idx] = 0;
          data[idx+1] = 0;
          data[idx+2] = 0;
          data[idx+3] = 0;
        }
      }
    }
  }

  // Save the modified image
  await sharp(data, { raw: { width, height, channels: 4 } })
    .webp({ quality: 90 })
    .toFile(outputFile);
    
  console.log('Fixed Leather Polaroid successfully!');
}

fixFrame().catch(console.error);
