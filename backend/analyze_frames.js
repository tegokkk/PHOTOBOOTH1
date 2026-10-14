const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const uploadedDir = 'C:\\Users\\ACER\\.gemini\\antigravity-ide\\brain\\df3ce4bf-c14c-4c96-9d81-9b1fd5bbf9e1\\.user_uploaded';
const files = fs.readdirSync(uploadedDir).filter(f => f.match(/\.(png|jpg|jpeg|webp)$/i));

async function analyze() {
  for (const file of files) {
    const filePath = path.join(uploadedDir, file);
    const metadata = await sharp(filePath).metadata();
    console.log(`\n--- File: ${file} ---`);
    console.log(`Dimensions: ${metadata.width}x${metadata.height}, Format: ${metadata.format}, Alpha: ${metadata.hasAlpha}`);
    
    // Convert to raw pixel data to find slots
    // We assume slots are either fully transparent or pure black/pure white rectangles
    const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    
    // Simple heuristic to find large rectangular uniform areas (black, white, or transparent)
    // For simplicity, we just print out the dominant background colors or if we can spot black rectangles
    // Since implementing a full rectangle finding algorithm in JS here is complex, 
    // let's just generate a scaled down version as text to see the layout
    const thumbWidth = 20;
    const thumbHeight = Math.round(metadata.height * (thumbWidth / metadata.width));
    const { data: thumbData } = await sharp(filePath).resize(thumbWidth, thumbHeight).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    
    let ascii = '';
    for (let y = 0; y < thumbHeight; y++) {
      for (let x = 0; x < thumbWidth; x++) {
        const idx = (y * thumbWidth + x) * 4;
        const r = thumbData[idx];
        const g = thumbData[idx+1];
        const b = thumbData[idx+2];
        const a = thumbData[idx+3];
        
        if (a < 128) ascii += ' ';
        else if (r < 30 && g < 30 && b < 30) ascii += '#'; // Black
        else if (r > 225 && g > 225 && b > 225) ascii += '.'; // White
        else ascii += 'O'; // Other colors
      }
      ascii += '\n';
    }
    console.log(ascii);
  }
}

analyze().catch(console.error);
