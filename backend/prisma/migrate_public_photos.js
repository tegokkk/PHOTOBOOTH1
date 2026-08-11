const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting data migration for old public photos...');
  
  const updated = await prisma.photo.updateMany({
    where: {
      isPublic: true
    },
    data: {
      isPublic: false
    }
  });

  console.log(`Successfully updated ${updated.count} photos to be private (isPublic=false).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
