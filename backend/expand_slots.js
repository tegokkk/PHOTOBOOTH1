const fs = require('fs');

const seedPath = 'd:/TEGO/BACK UP/PEOJECTTTTTTT/PHOTOBOOTH/backend/prisma/seed.js';
let content = fs.readFileSync(seedPath, 'utf8');

// We need to parse the MOCK_FRAMES array.
// Instead of complex AST parsing, we can use a regex to find all { x: ..., y: ..., width: ..., height: ... } and expand them.

let modified = false;

// We'll expand by 0.015 on all sides (3% total width/height increase) to be safe against shadows.
const expandBy = 0.015;

const newContent = content.replace(/{ x: ([\d\.]+), y: ([\d\.]+), width: ([\d\.]+), height: ([\d\.]+) }/g, (match, xStr, yStr, wStr, hStr) => {
  let x = parseFloat(xStr);
  let y = parseFloat(yStr);
  let w = parseFloat(wStr);
  let h = parseFloat(hStr);

  // For Cinema Premiere, I already manually expanded it by 0.02.
  // How do I avoid double-expanding? 
  // Let's just blindly expand everything slightly, BUT clamp it.
  
  // Calculate new bounds
  let newX = Math.max(0, x - expandBy);
  let newY = Math.max(0, y - expandBy);
  let newMaxX = Math.min(1, x + w + expandBy);
  let newMaxY = Math.min(1, y + h + expandBy);
  
  let newW = newMaxX - newX;
  let newH = newMaxY - newY;

  return `{ x: ${newX.toFixed(4)}, y: ${newY.toFixed(4)}, width: ${newW.toFixed(4)}, height: ${newH.toFixed(4)} }`;
});

if (content !== newContent) {
  fs.writeFileSync(seedPath, newContent);
  console.log('Successfully expanded all slots in seed.js');
} else {
  console.log('No changes made');
}
