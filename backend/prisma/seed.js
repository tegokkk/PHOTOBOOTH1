const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const useFrameAssetColumns = process.env.FRAME_ASSET_COLUMNS_ENABLED === 'true';

const MOCK_FRAMES = [
  {
    name: 'Tanpa Frame',
    category: 'Basic',
    imageUrl: '',
    cssPlaceholder: 'border-0',
    slots: []
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
    name: 'Modern Friends',
    category: 'Party',
    imageUrl: '/frames/Green and Red Modern Friends Photo Booth Bookmark.webp',
    cssPlaceholder: 'border-4 border-green-500 border-dotted bg-transparent',
    slots: [
      { x: 0.072, y: 0.0613, width: 0.84, height: 0.2188 },
      { x: 0.072, y: 0.3138, width: 0.84, height: 0.2188 },
      { x: 0.072, y: 0.5634, width: 0.84, height: 0.2188 }
    ]
  },
  {
    name: 'Newspaper Collage',
    category: 'Aesthetic',
    imageUrl: '/frames/Black and White Creative Photostrip Newspaper Photo Collage.png',
    cssPlaceholder: 'border-4 border-gray-400 bg-transparent',
    slots: [
      { x: 0.0559, y: 0.1709, width: 0.4276, height: 0.2136 },
      { x: 0.5148, y: 0.1709, width: 0.4276, height: 0.2136 },
      { x: 0.0559, y: 0.4034, width: 0.4276, height: 0.2138 },
      { x: 0.5148, y: 0.4034, width: 0.4276, height: 0.2138 },
      { x: 0.0559, y: 0.636, width: 0.4276, height: 0.2136 },
      { x: 0.5148, y: 0.636, width: 0.4276, height: 0.2136 }
    ]
  },
  {
    name: 'Blue & Pink Friendship',
    category: 'Cute',
    imageUrl: '/frames/Blue and Pink Playful Friendship Photo Strip Bookmark.png',
    cssPlaceholder: 'border-4 border-pink-300 bg-transparent',
    slots: [
      { x: 0.1109, y: 0.1468, width: 0.7787, height: 0.168 },
      { x: 0.1109, y: 0.3307, width: 0.7787, height: 0.168 },
      { x: 0.1109, y: 0.5145, width: 0.7787, height: 0.168 },
      { x: 0.1109, y: 0.6983, width: 0.7787, height: 0.168 }
    ]
  },
  {
    name: 'Blue Jeans Modern',
    category: 'Vintage',
    imageUrl: '/frames/Blue Jeans Trendy Modern Vintage Photostrip Bookmark.png',
    cssPlaceholder: 'border-4 border-blue-500 bg-transparent',
    slots: [
      { x: 0.0808, y: 0.0417, width: 0.6531, height: 0.157 },
      { x: 0.2461, y: 0.2663, width: 0.6455, height: 0.157 },
      { x: 0.0813, y: 0.4906, width: 0.6553, height: 0.157 },
      { x: 0.2385, y: 0.715, width: 0.6531, height: 0.157 }
    ]
  },
  {
    name: 'Brown Playful',
    category: 'Aesthetic',
    imageUrl: '/frames/Brown Playful Friendship Photostrip Bookmark.png',
    cssPlaceholder: 'border-4 border-yellow-700 bg-transparent',
    slots: [
      { x: 0.1211, y: 0.1163, width: 0.7573, height: 0.1941 },
      { x: 0.1211, y: 0.3518, width: 0.7573, height: 0.1941 },
      { x: 0.1211, y: 0.5872, width: 0.7573, height: 0.1941 }
    ]
  },

  {
    name: 'Pink Illustrated Friendship',
    category: 'Cute',
    imageUrl: '/frames/Pink and Blue Illustrated Friendship Photobooth Bookmark.png',
    cssPlaceholder: 'border-4 border-pink-400 bg-transparent',
    slots: [
      { x: 0.1488, y: 0.0843, width: 0.7605, height: 0.2665 },
      { x: 0.0763, y: 0.3852, width: 0.8437, height: 0.1861 },
      { x: 0.0805, y: 0.6071, width: 0.8352, height: 0.2786 }
    ]
  },

  {
    name: 'Pink Strike A Pose',
    category: 'Cute',
    imageUrl: '/frames/Pink and Blue Minimalist Strike A Pose Photostrip.png',
    cssPlaceholder: 'border-4 border-pink-400 bg-transparent',
    slots: [
      { x: 0.0783, y: 0.0779, width: 0.8014, height: 0.1717 },
      { x: 0.1615, y: 0.2742, width: 0.7597, height: 0.1717 },
      { x: 0.0783, y: 0.4707, width: 0.843, height: 0.1717 },
      { x: 0.0783, y: 0.667, width: 0.843, height: 0.1574 }
    ]
  },
  {
    name: 'Pink Captured In Fun',
    category: 'Cute',
    imageUrl: '/frames/Pink and Blue Playful Captured In Fun Photostrip.png',
    cssPlaceholder: 'border-4 border-pink-400 bg-transparent',
    slots: [
      { x: 0.1104, y: 0.0862, width: 0.7787, height: 0.2106 },
      { x: 0.1104, y: 0.3258, width: 0.7787, height: 0.2107 },
      { x: 0.1104, y: 0.5654, width: 0.7787, height: 0.2107 }
    ]
  },
  {
    name: 'Purple Vintage Friends',
    category: 'Vintage',
    imageUrl: '/frames/Purple Vintage Friends Photostrip Photo Collage (1).png',
    cssPlaceholder: 'border-4 border-purple-500 bg-transparent',
    slots: [
      { x: 0.0456, y: 0.2038, width: 0.4022, height: 0.1928 },
      { x: 0.5515, y: 0.2038, width: 0.4024, height: 0.1928 },
      { x: 0.0456, y: 0.4102, width: 0.4022, height: 0.2085 },
      { x: 0.5515, y: 0.4102, width: 0.4024, height: 0.2085 },
      { x: 0.0456, y: 0.6322, width: 0.4022, height: 0.2082 },
      { x: 0.5515, y: 0.6322, width: 0.4024, height: 0.2082 }
    ]
  },
  {
    name: 'Yellow Girl Gang',
    category: 'Party',
    imageUrl: '/frames/Yellow and Pink Playful Girl Gang Photobooth Bookmark.png',
    cssPlaceholder: 'border-4 border-yellow-400 bg-transparent',
    slots: [
      { x: 0.1061, y: 0.0821, width: 0.7872, height: 0.1684 },
      { x: 0.1061, y: 0.3145, width: 0.7872, height: 0.1684 },
      { x: 0.1056, y: 0.5476, width: 0.7877, height: 0.1684 }
    ]
  },
  {
    name: 'Jejak Kebersamaan',
    category: 'Vintage',
    imageUrl: '/frames/Jejak Kebersamaan.png',
    cssPlaceholder: 'border-0 bg-transparent',
    slots: [
      { x: 0.0293, y: 0.3389, width: 0.9428, height: 0.2764 },
      { x: 0.3563, y: 0.6494, width: 0.2859, height: 0.1152 },
      { x: 0.0293, y: 0.7793, width: 0.3050, height: 0.1855 },
      { x: 0.6672, y: 0.7793, width: 0.3035, height: 0.1855 }
    ]
  },
  {
    name: 'OMG Checkerboard',
    category: 'Cute',
    imageUrl: '/frames/OMG Checkerboard.png',
    cssPlaceholder: 'border-0 bg-transparent',
    slots: [
      { x: 0.0806, y: 0.0977, width: 0.3123, height: 0.2207 },
      { x: 0.5587, y: 0.0889, width: 0.3944, height: 0.2432 },
      { x: 0.0806, y: 0.3809, width: 0.3123, height: 0.2207 },
      { x: 0.5587, y: 0.3770, width: 0.3944, height: 0.2432 },
      { x: 0.0806, y: 0.6660, width: 0.3123, height: 0.2207 },
      { x: 0.5587, y: 0.6660, width: 0.3944, height: 0.2393 }
    ]
  },
  {
    name: 'Cinema Premiere',
    category: 'Vintage',
    imageUrl: '/frames/Cinema Premiere.png',
    cssPlaceholder: 'border-0 bg-transparent',
    slots: [
      { x: 0.0958, y: 0.2449, width: 0.3552, height: 0.1802 },
      { x: 0.5504, y: 0.2449, width: 0.3552, height: 0.1802 },
      { x: 0.0958, y: 0.4685, width: 0.3552, height: 0.1802 },
      { x: 0.5504, y: 0.4685, width: 0.3552, height: 0.1802 },
      { x: 0.0958, y: 0.6912, width: 0.3552, height: 0.1802 },
      { x: 0.5504, y: 0.6912, width: 0.3552, height: 0.1802 }
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
          ...(useFrameAssetColumns ? { previewImageUrl: frame.imageUrl || null } : {}),
          cssPlaceholder: frame.cssPlaceholder,
          isActive: true,
          deletedAt: null,
        }
      });
      console.log(`Updated frame with id: ${targetFrame.id}`);
    } else {
      targetFrame = await prisma.frame.create({
        data: {
          name: frame.name,
          category: frame.category,
          imageUrl: frame.imageUrl,
          ...(useFrameAssetColumns ? {
            previewImageUrl: frame.imageUrl || null,
            masterImageUrl: null,
          } : {}),
          cssPlaceholder: frame.cssPlaceholder,
          isActive: true,
          deletedAt: null,
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
