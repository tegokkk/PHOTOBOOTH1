const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MOCK_FRAMES = [
  {
    name: 'Tanpa Frame',
    category: 'Basic',
    imageUrl: '',
    cssPlaceholder: 'border-0',
  },
  {
    name: 'Retro Friends',
    category: 'Vintage',
    imageUrl: '/frames/Black and White Retro Friends Photo Strip Bookmark.png',
    cssPlaceholder: 'border-8 border-black border-double bg-transparent',
  },
  {
    name: 'Playful Fashion',
    category: 'Party',
    imageUrl: '/frames/Blue and Red Playful Fashion Photo Strip Bookmark (1) (1).png',
    cssPlaceholder: 'border-4 border-pink-500 bg-transparent',
  },
  {
    name: 'Pizza Booth',
    category: 'Aesthetic',
    imageUrl: '/frames/Orange and White Playful Pizza Photo Booth Bookmark.png', 
    cssPlaceholder: 'border-8 border-orange-500 border-double bg-transparent',
  },
  {
    name: 'Beige Friends',
    category: 'Aesthetic',
    imageUrl: '/frames/Beige and Colorful Playful Friends Photo Booth Bookmark.png',
    cssPlaceholder: 'border-4 border-yellow-500 border-dotted bg-transparent',
  },
  {
    name: 'Modern Fashion',
    category: 'Vintage',
    imageUrl: '/frames/Black and White Modern Fashion Photo Strip Collage Bookmark.png',
    cssPlaceholder: 'border-4 border-gray-500 border-dotted bg-transparent',
  },
  {
    name: 'Modern Friends',
    category: 'Party',
    imageUrl: '/frames/Green and Red Modern Friends Photo Booth Bookmark.png',
    cssPlaceholder: 'border-4 border-green-500 border-dotted bg-transparent',
  }
];

async function main() {
  console.log('Start seeding...');
  
  // Clear existing frames
  await prisma.frame.deleteMany({});
  console.log('Cleared existing frames.');
  
  for (const frame of MOCK_FRAMES) {
    const createdFrame = await prisma.frame.create({
      data: {
        name: frame.name,
        category: frame.category,
        imageUrl: frame.imageUrl,
        cssPlaceholder: frame.cssPlaceholder,
        isActive: true,
      }
    });
    console.log(`Created frame with id: ${createdFrame.id}`);
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
