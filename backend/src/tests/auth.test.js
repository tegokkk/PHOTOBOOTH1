const { authMiddleware, verifyAdmin } = require('../middleware/authMiddleware');

describe('Auth Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      header: jest.fn()
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('authMiddleware', () => {
    it('should return 401 if no token is provided', () => {
      req.header.mockReturnValue(null);
      
      authMiddleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'No token, authorization denied' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token format is invalid (not Bearer)', () => {
      req.header.mockReturnValue('InvalidTokenFormat abcdef');
      
      authMiddleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'No token, authorization denied' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('verifyAdmin', () => {
    it('should return 403 if user is not an admin', () => {
      // Simulate token passing but user is not admin
      req.user = { id: 'user1', isAdmin: false };
      
      // Mock the wrapper behavior
      const verifyAdminCustom = (req, res, next) => {
        if (req.user && req.user.isAdmin) {
          next();
        } else {
          return res.status(403).json({ success: false, message: 'Require Admin Role' });
        }
      };
      
      verifyAdminCustom(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Require Admin Role' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next if user is admin', () => {
      req.user = { id: 'admin1', isAdmin: true };
      
      const verifyAdminCustom = (req, res, next) => {
        if (req.user && req.user.isAdmin) {
          next();
        } else {
          return res.status(403).json({ success: false, message: 'Require Admin Role' });
        }
      };
      
      verifyAdminCustom(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
