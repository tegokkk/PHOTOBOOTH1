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
      { x: 0.0842, y: 0.0202, width: 0.8252, height: 0.3552 },
      { x: 0.0906, y: 0.3736, width: 0.8252, height: 0.3552 }
    ]
  },

  {
    name: 'Modern Friends',
    category: 'Party',
    imageUrl: '/frames/Green and Red Modern Friends Photo Booth Bookmark.webp',
    cssPlaceholder: 'border-4 border-green-500 border-dotted bg-transparent',
    slots: [
      { x: 0.0570, y: 0.0463, width: 0.8700, height: 0.2488 },
      { x: 0.0570, y: 0.2988, width: 0.8700, height: 0.2488 },
      { x: 0.0570, y: 0.5484, width: 0.8700, height: 0.2488 }
    ]
  },
  {
    name: 'Newspaper Collage',
    category: 'Aesthetic',
    imageUrl: '/frames/Black and White Creative Photostrip Newspaper Photo Collage.png',
    cssPlaceholder: 'border-4 border-gray-400 bg-transparent',
    slots: [
      { x: 0.0409, y: 0.1559, width: 0.4576, height: 0.2436 },
      { x: 0.4998, y: 0.1559, width: 0.4576, height: 0.2436 },
      { x: 0.0409, y: 0.3884, width: 0.4576, height: 0.2438 },
      { x: 0.4998, y: 0.3884, width: 0.4576, height: 0.2438 },
      { x: 0.0409, y: 0.6210, width: 0.4576, height: 0.2436 },
      { x: 0.4998, y: 0.6210, width: 0.4576, height: 0.2436 }
    ]
  },
  {
    name: 'Blue & Pink Friendship',
    category: 'Cute',
    imageUrl: '/frames/Blue and Pink Playful Friendship Photo Strip Bookmark.png',
    cssPlaceholder: 'border-4 border-pink-300 bg-transparent',
    slots: [
      { x: 0.0959, y: 0.1318, width: 0.8087, height: 0.1980 },
      { x: 0.0959, y: 0.3157, width: 0.8087, height: 0.1980 },
      { x: 0.0959, y: 0.4995, width: 0.8087, height: 0.1980 },
      { x: 0.0959, y: 0.6833, width: 0.8087, height: 0.1980 }
    ]
  },
  {
    name: 'Blue Jeans Modern',
    category: 'Vintage',
    imageUrl: '/frames/Blue Jeans Trendy Modern Vintage Photostrip Bookmark.png',
    cssPlaceholder: 'border-4 border-blue-500 bg-transparent',
    slots: [
      { x: 0.0658, y: 0.0267, width: 0.6831, height: 0.1870 },
      { x: 0.2311, y: 0.2513, width: 0.6755, height: 0.1870 },
      { x: 0.0663, y: 0.4756, width: 0.6853, height: 0.1870 },
      { x: 0.2235, y: 0.7000, width: 0.6831, height: 0.1870 }
    ]
  },
  {
    name: 'Brown Playful',
    category: 'Aesthetic',
    imageUrl: '/frames/Brown Playful Friendship Photostrip Bookmark.png',
    cssPlaceholder: 'border-4 border-yellow-700 bg-transparent',
    slots: [
      { x: 0.1061, y: 0.1013, width: 0.7873, height: 0.2241 },
      { x: 0.1061, y: 0.3368, width: 0.7873, height: 0.2241 },
      { x: 0.1061, y: 0.5722, width: 0.7873, height: 0.2241 }
    ]
  },

  {
    name: 'Pink Illustrated Friendship',
    category: 'Cute',
    imageUrl: '/frames/Pink and Blue Illustrated Friendship Photobooth Bookmark.png',
    cssPlaceholder: 'border-4 border-pink-400 bg-transparent',
    slots: [
      { x: 0.1338, y: 0.0693, width: 0.7905, height: 0.2965 },
      { x: 0.0613, y: 0.3702, width: 0.8737, height: 0.2161 },
      { x: 0.0655, y: 0.5921, width: 0.8652, height: 0.3086 }
    ]
  },

  {
    name: 'Pink Strike A Pose',
    category: 'Cute',
    imageUrl: '/frames/Pink and Blue Minimalist Strike A Pose Photostrip.png',
    cssPlaceholder: 'border-4 border-pink-400 bg-transparent',
    slots: [
      { x: 0.0633, y: 0.0629, width: 0.8314, height: 0.2017 },
      { x: 0.1465, y: 0.2592, width: 0.7897, height: 0.2017 },
      { x: 0.0633, y: 0.4557, width: 0.8730, height: 0.2017 },
      { x: 0.0633, y: 0.6520, width: 0.8730, height: 0.1874 }
    ]
  },
  {
    name: 'Pink Captured In Fun',
    category: 'Cute',
    imageUrl: '/frames/Pink and Blue Playful Captured In Fun Photostrip.png',
    cssPlaceholder: 'border-4 border-pink-400 bg-transparent',
    slots: [
      { x: 0.0954, y: 0.0712, width: 0.8087, height: 0.2406 },
      { x: 0.0954, y: 0.3108, width: 0.8087, height: 0.2407 },
      { x: 0.0954, y: 0.5504, width: 0.8087, height: 0.2407 }
    ]
  },
  {
    name: 'Purple Vintage Friends',
    category: 'Vintage',
    imageUrl: '/frames/Purple Vintage Friends Photostrip Photo Collage (1).png',
    cssPlaceholder: 'border-4 border-purple-500 bg-transparent',
    slots: [
      { x: 0.0306, y: 0.1888, width: 0.4322, height: 0.2228 },
      { x: 0.5365, y: 0.1888, width: 0.4324, height: 0.2228 },
      { x: 0.0306, y: 0.3952, width: 0.4322, height: 0.2385 },
      { x: 0.5365, y: 0.3952, width: 0.4324, height: 0.2385 },
      { x: 0.0306, y: 0.6172, width: 0.4322, height: 0.2382 },
      { x: 0.5365, y: 0.6172, width: 0.4324, height: 0.2382 }
    ]
  },
  {
    name: 'Yellow Girl Gang',
    category: 'Party',
    imageUrl: '/frames/Yellow and Pink Playful Girl Gang Photobooth Bookmark.png',
    cssPlaceholder: 'border-4 border-yellow-400 bg-transparent',
    slots: [
      { x: 0.0911, y: 0.0671, width: 0.8172, height: 0.1984 },
      { x: 0.0911, y: 0.2995, width: 0.8172, height: 0.1984 },
      { x: 0.0906, y: 0.5326, width: 0.8177, height: 0.1984 }
    ]
  },
  {
    name: 'Jejak Kebersamaan',
    category: 'Vintage',
    imageUrl: '/frames/Jejak Kebersamaan.png',
    cssPlaceholder: 'border-0 bg-transparent',
    slots: [
      { x: 0.0143, y: 0.3239, width: 0.9728, height: 0.3064 },
      { x: 0.3413, y: 0.6344, width: 0.3159, height: 0.1452 },
      { x: 0.0143, y: 0.7643, width: 0.3350, height: 0.2155 },
      { x: 0.6522, y: 0.7643, width: 0.3335, height: 0.2155 }
    ]
  },
  {
    name: 'OMG Checkerboard',
    category: 'Cute',
    imageUrl: '/frames/OMG Checkerboard.png',
    cssPlaceholder: 'border-0 bg-transparent',
    slots: [
      { x: 0.0656, y: 0.0827, width: 0.3423, height: 0.2507 },
      { x: 0.5437, y: 0.0739, width: 0.4244, height: 0.2732 },
      { x: 0.0656, y: 0.3659, width: 0.3423, height: 0.2507 },
      { x: 0.5437, y: 0.3620, width: 0.4244, height: 0.2732 },
      { x: 0.0656, y: 0.6510, width: 0.3423, height: 0.2507 },
      { x: 0.5437, y: 0.6510, width: 0.4244, height: 0.2693 }
    ]
  },
  {
    name: 'Cinema Premiere',
    category: 'Vintage',
    imageUrl: '/frames/Cinema Premiere.png',
    cssPlaceholder: 'border-0 bg-transparent',
    slots: [
      { x: 0.0808, y: 0.2299, width: 0.3852, height: 0.2102 },
      { x: 0.5354, y: 0.2299, width: 0.3852, height: 0.2102 },
      { x: 0.0808, y: 0.4535, width: 0.3852, height: 0.2102 },
      { x: 0.5354, y: 0.4535, width: 0.3852, height: 0.2102 },
      { x: 0.0808, y: 0.6762, width: 0.3852, height: 0.2102 },
      { x: 0.5354, y: 0.6762, width: 0.3852, height: 0.2102 }
    ]
  },
  {
    name: 'Pointer Newspaper',
    category: 'Creative',
    imageUrl: '/frames/Pointer Newspaper.webp',
    cssPlaceholder: 'bg-transparent',
    slots: [
      { x: 0.0622, y: 0.3652, width: 0.8769, height: 0.2617 },
      { x: 0.6722, y: 0.7148, width: 0.2669, height: 0.1045 },
      { x: 0.0636, y: 0.7852, width: 0.3223, height: 0.1729 }
    ]
  },
  {
    name: 'Pointer Striped',
    category: 'Creative',
    imageUrl: '/frames/Pointer Striped.webp',
    cssPlaceholder: 'bg-transparent',
    slots: [
      { x: 0.1041, y: 0.1084, width: 0.3592, height: 0.2402 },
      { x: 0.5352, y: 0.1084, width: 0.3607, height: 0.2402 },
      { x: 0.1056, y: 0.3691, width: 0.3607, height: 0.2402 },
      { x: 0.5367, y: 0.3691, width: 0.3607, height: 0.2402 },
      { x: 0.1056, y: 0.6299, width: 0.3607, height: 0.2393 },
      { x: 0.5352, y: 0.6299, width: 0.3607, height: 0.2393 }
    ]
  },
  {
    name: 'Film Strip Green',
    category: 'Classic',
    imageUrl: '/frames/Film Strip Green.webp',
    cssPlaceholder: 'bg-transparent',
    slots: [
      { x: 0.4298, y: 0.1465, width: 0.1429, height: 0.1699 },
      { x: 0.4298, y: 0.3252, width: 0.1429, height: 0.1699 },
      { x: 0.431, y: 0.5039, width: 0.1416, height: 0.1689 },
      { x: 0.431, y: 0.6816, width: 0.1416, height: 0.166 }
    ]
  },
  {
    name: 'Leather Polaroid',
    category: 'Classic',
    imageUrl: '/frames/Leather Polaroid.webp',
    cssPlaceholder: 'bg-transparent',
    slots: [
      { x: 0.4078, y: 0.0615, width: 0.1844, height: 0.1992 },
      { x: 0.4078, y: 0.2754, width: 0.1844, height: 0.1992 },
      { x: 0.4078, y: 0.4893, width: 0.1844, height: 0.1992 },
      { x: 0.4078, y: 0.7041, width: 0.1844, height: 0.1982 }
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
