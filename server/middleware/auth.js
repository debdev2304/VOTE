const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Middleware to check if user is admin
const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    next();
  });
};

// Middleware to check if user is voter
const voterAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== 'voter') {
      return res.status(403).json({ error: 'Access denied. Voter privileges required.' });
    }
    next();
  });
};

module.exports = auth;
module.exports.adminAuth = adminAuth;
module.exports.voterAuth = voterAuth;
