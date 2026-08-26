const { PrismaClient } = require('@prisma/client');

function getRuntimeDatabaseUrl(databaseUrl) {
  if (!databaseUrl || !/^postgres(?:ql)?:/i.test(databaseUrl)) return databaseUrl;

  const usePgBouncer = process.env.PRISMA_PGBOUNCER === 'true' ||
    (process.env.NODE_ENV === 'production' && process.env.PRISMA_PGBOUNCER !== 'false');

  if (!usePgBouncer || /(?:[?&])pgbouncer=/i.test(databaseUrl)) return databaseUrl;
  return `${databaseUrl}${databaseUrl.includes('?') ? '&' : '?'}pgbouncer=true`;
}

const databaseUrl = getRuntimeDatabaseUrl(process.env.DATABASE_URL);
const prisma = databaseUrl
  ? new PrismaClient({ datasources: { db: { url: databaseUrl } } })
  : new PrismaClient();

module.exports = prisma;
