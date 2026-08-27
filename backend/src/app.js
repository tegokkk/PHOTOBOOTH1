const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const crypto = require('crypto');

// Load env vars
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  // Keep liveness and CORS responses available so the deployment reports a
  // useful configuration error instead of crashing the entire serverless
  // function during module initialization.
  console.error('Missing production environment variable: DATABASE_URL');
}

if (process.env.TRUST_PROXY) {
  app.set('trust proxy', Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY);
}

// Middleware
const configuredOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);
const developmentOrigins = process.env.NODE_ENV === 'production'
  ? []
  : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'];
const allowedOrigins = [...new Set([...configuredOrigins, ...developmentOrigins])];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  },
  optionsSuccessStatus: 200
};

// Security & Rate Limiting
const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: { success: false, message: 'Too many requests, please try again later.' }
});

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.disable('x-powered-by');
app.use((req, res, next) => {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(), geolocation=()');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  res.on('finish', () => {
    console.log(JSON.stringify({
      type: 'http_request',
      requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: Date.now() - startedAt,
    }));
  });
  next();
});
// Static uploads route removed for privacy. Media served via /api/media
app.use('/api/', apiLimiter); // apply to all API routes
app.use('/api/', (req, res, next) => {
  if (process.env.DATABASE_URL) return next();

  res.status(503).json({
    success: false,
    message: 'Database belum dikonfigurasi pada server.',
    requestId: req.requestId,
  });
});

// Avoid a noisy serverless 500 when a browser probes the backend favicon.
app.get('/favicon.ico', (req, res) => res.status(204).end());


// Routes
const photoRoutes = require('./routes/photoRoutes');
const frameRoutes = require('./routes/frameRoutes');
const shareRoutes = require('./routes/shareRoutes');
const adminRoutes = require('./routes/adminRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const printRoutes = require('./routes/printRoutes');

app.use('/api/photos', photoRoutes);
app.use('/api/frames', frameRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/print', printRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

app.get('/ready', async (req, res) => {
  try {
    const prisma = require('./lib/prisma');
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ready', timestamp: new Date() });
  } catch (error) {
    res.status(503).json({ status: 'not_ready' });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  console.error(JSON.stringify({
    type: 'http_error',
    requestId: req.requestId,
    message: err.message,
    stack: isProduction ? undefined : err.stack,
  }));

  if (err.message === 'Origin is not allowed by CORS') {
    return res.status(403).json({ success: false, message: 'Origin is not allowed' });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Payload foto terlalu besar. Kompres foto lalu coba lagi.',
      requestId: req.requestId,
    });
  }

  // Do not leak stack traces or internal paths in production
  res.status(500).json({
    success: false,
    message: isProduction ? 'Server Error' : (err.message || 'Server Error'),
    requestId: req.requestId,
  });
});

// Only start the server if we are NOT in a Vercel serverless environment
if (!process.env.VERCEL) {
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  const shutdown = async (signal) => {
    console.log(`Received ${signal}, shutting down`);
    server.close(async () => {
      const prisma = require('./lib/prisma');
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

module.exports = app;
