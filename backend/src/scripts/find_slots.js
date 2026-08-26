const sharp = require('sharp');
const fs = require('fs');

async function findTransparentRectangles(imagePath) {
  const image = sharp(imagePath);
  const metadata = await image.metadata();
  const { width, height } = metadata;
  
  // Extract raw pixel data (RGBA)
  const { data } = await image.raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  
  // We need to find connected components of transparent pixels (alpha < 10)
  // Since they are mostly perfect rectangles, we can just scan for bounding boxes.
  
  const visited = new Uint8Array(width * height);
  const rects = [];
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3];
      
      if (alpha < 50 && !visited[y * width + x]) {
        // Found a transparent pixel, let's find its bounding box
        let minX = x, maxX = x, minY = y, maxY = y;
        
        // Simple flood fill to find bounds
        const queue = [{x, y}];
        visited[y * width + x] = 1;
        
        let area = 0;
        
        while (queue.length > 0) {
          const p = queue.pop();
          area++;
          
          if (p.x < minX) minX = p.x;
          if (p.x > maxX) maxX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.y > maxY) maxY = p.y;
          
          // Check neighbors
          const neighbors = [
            {nx: p.x + 1, ny: p.y}, {nx: p.x - 1, ny: p.y},
            {nx: p.x, ny: p.y + 1}, {nx: p.x, ny: p.y - 1}
          ];
          
          for (const n of neighbors) {
            if (n.nx >= 0 && n.nx < width && n.ny >= 0 && n.ny < height) {
              if (!visited[n.ny * width + n.nx]) {
                const nIdx = (n.ny * width + n.nx) * 4;
                if (data[nIdx + 3] < 50) {
                  visited[n.ny * width + n.nx] = 1;
                  queue.push({x: n.nx, y: n.ny});
                }
              }
            }
          }
        }
        
        // If area is large enough, it's a slot
        if (area > 1000) {
          // Normalize to 0-1
          rects.push({
            x: Number((minX / width).toFixed(4)),
            y: Number((minY / height).toFixed(4)),
            width: Number(((maxX - minX + 1) / width).toFixed(4)),
            height: Number(((maxY - minY + 1) / height).toFixed(4)),
            area
          });
        }
      } else {
        visited[y * width + x] = 1;
      }
    }
  }
  
  // Sort by Y, then X
  rects.sort((a, b) => {
    if (Math.abs(a.y - b.y) > 0.05) return a.y - b.y;
    return a.x - b.x;
  });
  
  console.log(`\n--- ${imagePath} ---`);
  console.log(JSON.stringify(rects.map(r => ({x: r.x, y: r.y, width: r.width, height: r.height})), null, 2));
}

async function main() {
  const images = [
    'd:/TEGO/BACK UP/PEOJECTTTTTTT/PHOTOBOOTH/frontend/public/frames/Slay Collage.png',
    'd:/TEGO/BACK UP/PEOJECTTTTTTT/PHOTOBOOTH/frontend/public/frames/Jejak Kebersamaan.png',
    'd:/TEGO/BACK UP/PEOJECTTTTTTT/PHOTOBOOTH/frontend/public/frames/OMG Checkerboard.png',
    'd:/TEGO/BACK UP/PEOJECTTTTTTT/PHOTOBOOTH/frontend/public/frames/Cinema Premiere.png'
  ];
  
  for (const img of images) {
    try {
      await findTransparentRectangles(img);
    } catch(e) {
      console.log('Error processing', img, e.message);
    }
  }
}

main();
