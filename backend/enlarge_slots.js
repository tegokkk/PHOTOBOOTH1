const fs = require('fs');

const seedPath = 'prisma/seed.js';
let content = fs.readFileSync(seedPath, 'utf-8');

// We want to enlarge slots for Pointer Newspaper, Pointer Striped, Film Strip Green
// and completely remove Leather Polaroid.

const margin = 0.01; // 1% increase in size
const offset = margin / 2;

function enlargeSlots(match, slotsStr) {
  const newSlotsStr = slotsStr.replace(/\{\s*x:\s*([0-9.]+),\s*y:\s*([0-9.]+),\s*width:\s*([0-9.]+),\s*height:\s*([0-9.]+)\s*\}/g, (m, x, y, w, h) => {
    const newX = (parseFloat(x) - offset).toFixed(4);
    const newY = (parseFloat(y) - offset).toFixed(4);
    const newW = (parseFloat(w) + margin).toFixed(4);
    const newH = (parseFloat(h) + margin).toFixed(4);
    return `{ x: ${newX}, y: ${newY}, width: ${newW}, height: ${newH} }`;
  });
  return match.replace(slotsStr, newSlotsStr);
}

// 1. Remove Leather Polaroid
content = content.replace(/,\s*\{\s*name:\s*'Leather Polaroid'[\s\S]*?cssPlaceholder:\s*'bg-transparent',\s*slots:\s*\[[\s\S]*?\]\s*\}/g, '');

// 2. Enlarge Pointer Newspaper
content = content.replace(/(name:\s*'Pointer Newspaper'[\s\S]*?slots:\s*\[)([\s\S]*?)(\])/, (match, p1, p2, p3) => {
  return p1 + p2.replace(/\{\s*x:\s*([0-9.]+),\s*y:\s*([0-9.]+),\s*width:\s*([0-9.]+),\s*height:\s*([0-9.]+)\s*\}/g, (m, x, y, w, h) => {
    const newX = (parseFloat(x) - offset).toFixed(4);
    const newY = (parseFloat(y) - offset).toFixed(4);
    const newW = (parseFloat(w) + margin).toFixed(4);
    const newH = (parseFloat(h) + margin).toFixed(4);
    return `{ x: ${newX}, y: ${newY}, width: ${newW}, height: ${newH} }`;
  }) + p3;
});

// 3. Enlarge Pointer Striped
content = content.replace(/(name:\s*'Pointer Striped'[\s\S]*?slots:\s*\[)([\s\S]*?)(\])/, (match, p1, p2, p3) => {
  return p1 + p2.replace(/\{\s*x:\s*([0-9.]+),\s*y:\s*([0-9.]+),\s*width:\s*([0-9.]+),\s*height:\s*([0-9.]+)\s*\}/g, (m, x, y, w, h) => {
    const newX = (parseFloat(x) - offset).toFixed(4);
    const newY = (parseFloat(y) - offset).toFixed(4);
    const newW = (parseFloat(w) + margin).toFixed(4);
    const newH = (parseFloat(h) + margin).toFixed(4);
    return `{ x: ${newX}, y: ${newY}, width: ${newW}, height: ${newH} }`;
  }) + p3;
});

// 4. Enlarge Film Strip Green
content = content.replace(/(name:\s*'Film Strip Green'[\s\S]*?slots:\s*\[)([\s\S]*?)(\])/, (match, p1, p2, p3) => {
  return p1 + p2.replace(/\{\s*x:\s*([0-9.]+),\s*y:\s*([0-9.]+),\s*width:\s*([0-9.]+),\s*height:\s*([0-9.]+)\s*\}/g, (m, x, y, w, h) => {
    const newX = (parseFloat(x) - offset).toFixed(4);
    const newY = (parseFloat(y) - offset).toFixed(4);
    const newW = (parseFloat(w) + margin).toFixed(4);
    const newH = (parseFloat(h) + margin).toFixed(4);
    return `{ x: ${newX}, y: ${newY}, width: ${newW}, height: ${newH} }`;
  }) + p3;
});

fs.writeFileSync(seedPath, content, 'utf-8');
console.log('Seed updated.');
