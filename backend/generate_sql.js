const fs = require('fs');

const seedPath = 'd:/TEGO/BACK UP/PEOJECTTTTTTT/PHOTOBOOTH/backend/prisma/seed.js';
const content = fs.readFileSync(seedPath, 'utf8');

// Extract MOCK_FRAMES
const match = content.match(/const MOCK_FRAMES = (\[[\s\S]*?\]);\s*async function main/);
if (!match) {
  console.log('Failed to find MOCK_FRAMES');
  process.exit(1);
}

const mockFramesStr = match[1];
// We need to evaluate it to get the object
// It's just a JS object, let's use eval safely enough here
const MOCK_FRAMES = eval(`(${mockFramesStr})`);

let sql = `DO $$\nDECLARE\n  target_frame_id text;\nBEGIN\n`;

for (const frame of MOCK_FRAMES) {
  if (frame.slots && frame.slots.length > 0) {
    sql += `\n  -- Update slots for ${frame.name}\n`;
    sql += `  SELECT id INTO target_frame_id FROM frames WHERE name = '${frame.name}' LIMIT 1;\n`;
    sql += `  IF target_frame_id IS NOT NULL THEN\n`;
    sql += `    DELETE FROM frame_slots WHERE frame_id = target_frame_id;\n`;
    sql += `    INSERT INTO frame_slots (id, frame_id, x, y, width, height, rotation, z_index) VALUES\n`;
    
    const values = frame.slots.map(s => 
      `    (gen_random_uuid(), target_frame_id, ${s.x}, ${s.y}, ${s.width}, ${s.height}, 0, 0)`
    ).join(',\n');
    
    sql += values + `;\n`;
    sql += `  END IF;\n`;
  }
}

sql += `END $$;`;

fs.writeFileSync('d:/TEGO/BACK UP/PEOJECTTTTTTT/PHOTOBOOTH/backend/update_all_slots.sql', sql);
console.log('Generated SQL to update all slots');
