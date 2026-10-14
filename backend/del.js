const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.frame.deleteMany({ where: { name: 'Leather Polaroid' } });
  console.log('Deleted Leather Polaroid');
}
main().catch(console.error).finally(() => prisma.$disconnect());
