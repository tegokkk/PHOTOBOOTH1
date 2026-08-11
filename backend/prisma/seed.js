const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MOCK_FRAMES = [
  {
    name: 'Tanpa Frame',
    category: 'Basic',
    imageUrl: '',
    cssPlaceholder: 'border-0',
    slots: []
  },
  {
    name: 'Retro Friends',
    category: 'Vintage',
    imageUrl: '/frames/Black and White Retro Friends Photo Strip Bookmark.webp',
    cssPlaceholder: 'border-8 border-black border-double bg-transparent',
    slots: [
      { x: 0.0939, y: 0.0368, width: 0.8123, height: 0.1947 },
      { x: 0.0939, y: 0.2521, width: 0.8123, height: 0.1945 },
      { x: 0.0939, y: 0.4677, width: 0.8123, height: 0.1945 },
      { x: 0.0939, y: 0.6836, width: 0.8123, height: 0.1945 }
    ]
  },
  {
    name: 'Playful Fashion',
    category: 'Party',
    imageUrl: '/frames/Blue and Red Playful Fashion Photo Strip Bookmark (1) (1).webp',
    cssPlaceholder: 'border-4 border-pink-500 bg-transparent',
    slots: [
      { x: 0.1701, y: 0.1275, width: 0.6597, height: 0.2076 },
      { x: 0.1701, y: 0.3632, width: 0.6597, height: 0.2078 },
      { x: 0.1701, y: 0.5991, width: 0.6597, height: 0.2076 }
    ]
  },
  {
    name: 'Pizza Booth',
    category: 'Aesthetic',
    imageUrl: '/frames/Orange and White Playful Pizza Photo Booth Bookmark.webp',
    cssPlaceholder: 'border-8 border-orange-500 border-double bg-transparent',
    slots: [
      { x: 0.2587, y: 0.0288, width: 0.7109, height: 0.237 },
      { x: 0.2587, y: 0.2921, width: 0.7109, height: 0.237 },
      { x: 0.2587, y: 0.5554, width: 0.7109, height: 0.237 }
    ]
  },
  {
    name: 'Beige Friends',
    category: 'Aesthetic',
    imageUrl: '/frames/Beige and Colorful Playful Friends Photo Booth Bookmark.webp',
    cssPlaceholder: 'border-4 border-yellow-500 border-dotted bg-transparent',
    slots: [
      { x: 0.0992, y: 0.0352, width: 0.7952, height: 0.3252 },
      { x: 0.1056, y: 0.3886, width: 0.7952, height: 0.3252 }
    ]
  },
  {
    name: 'Modern Fashion',
    category: 'Vintage',
    imageUrl: '/frames/Black and White Modern Fashion Photo Strip Collage Bookmark.webp',
    cssPlaceholder: 'border-4 border-gray-500 border-dotted bg-transparent',
    slots: [
      { x: 0.1589, y: 0.066, width: 0.6821, height: 0.17 },
      { x: 0.1589, y: 0.2549, width: 0.6821, height: 0.17 },
      { x: 0.1589, y: 0.4439, width: 0.6821, height: 0.1698 },
      { x: 0.1589, y: 0.6331, width: 0.6821, height: 0.1698 }
    ]
  },
  {
    name: 'Modern Friends',
    category: 'Party',
    imageUrl: '/frames/Green and Red Modern Friends Photo Booth Bookmark.webp',
    cssPlaceholder: 'border-4 border-green-500 border-dotted bg-transparent',
    slots: [
      { x: 0.072, y: 0.0613, width: 0.84, height: 0.2188 },
      { x: 0.072, y: 0.3138, width: 0.84, height: 0.2188 },
      { x: 0.072, y: 0.5634, width: 0.84, height: 0.2188 }
    ]
  }
];

async function main() {
  console.log('Start seeding...');

  for (const frame of MOCK_FRAMES) {
    let targetFrame = await prisma.frame.findFirst({
      where: { name: frame.name }
    });

    if (targetFrame) {
      targetFrame = await prisma.frame.update({
        where: { id: targetFrame.id },
        data: {
          category: frame.category,
          imageUrl: frame.imageUrl,
          cssPlaceholder: frame.cssPlaceholder,
          isActive: true,
        }
      });
      console.log(`Updated frame with id: ${targetFrame.id}`);
    } else {
      targetFrame = await prisma.frame.create({
        data: {
          name: frame.name,
          category: frame.category,
          imageUrl: frame.imageUrl,
          cssPlaceholder: frame.cssPlaceholder,
          isActive: true,
        }
      });
      console.log(`Created frame with id: ${targetFrame.id}`);
    }

    // Manage slots
    // Delete existing slots first
    await prisma.frameSlot.deleteMany({
      where: { frameId: targetFrame.id }
    });

    // Create new slots
    if (frame.slots && frame.slots.length > 0) {
      for (const slot of frame.slots) {
        await prisma.frameSlot.create({
          data: {
            frameId: targetFrame.id,
            x: slot.x,
            y: slot.y,
            width: slot.width,
            height: slot.height,
            rotation: 0,
            zIndex: 0
          }
        });
      }
      console.log(`Created ${frame.slots.length} slots for frame ${targetFrame.name}`);
    }
  }

  // Create the admin only when the operator provides a one-time password.
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword) {
    console.warn('SEED_ADMIN_PASSWORD is not set; skipping admin seed.');
    return;
  }
  if (adminPassword.length < 8 || adminPassword.length > 72 || !/\d/.test(adminPassword) || !/[a-zA-Z]/.test(adminPassword)) {
    throw new Error('SEED_ADMIN_PASSWORD must be 8-72 characters and contain both letters and numbers');
  }

  const adminEmail = 'admin@riri.com';
  let adminUser = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!adminUser) {
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        fullName: 'System Admin',
        passwordHash: passwordHash,
        isAdmin: true,
      }
    });
    console.log(`Created default admin user: ${adminEmail}`);
  } else if (adminPassword) {
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { passwordHash, isActive: true, deletedAt: null }
    });
    console.log(`Reset admin password for ${adminEmail}`);
  } else {
    console.log(`Admin user ${adminEmail} already exists`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
