const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user is still active in DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, isActive: true, deletedAt: true, isAdmin: true }
    });

    if (!user || !user.isActive || user.deletedAt) {
      return res.status(401).json({ success: false, message: 'Account is disabled or deleted' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};

/**
 * Optional auth middleware. Doesn't throw error if token is invalid or missing,
 * just leaves req.user empty.
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, isActive: true, deletedAt: true, isAdmin: true }
      });
      if (user && user.isActive && !user.deletedAt) {
        req.user = user;
      }
    } catch (err) {
      // ignore
    }
  }
  next();
};

const verifyAdmin = (req, res, next) => {
  authMiddleware(req, res, () => {
    // req.user is freshly fetched from DB in authMiddleware
    if (req.user && req.user.isAdmin) {
      next();
    } else {
      return res.status(403).json({ success: false, message: 'Require Admin Role' });
    }
  });
};

module.exports = { authMiddleware, optionalAuth, verifyAdmin };
